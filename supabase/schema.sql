-- ============================================================
-- TaskFlow: схема базы данных Supabase
-- Выполнить целиком в SQL Editor проекта Supabase.
-- ============================================================

-- 1. ТАБЛИЦЫ -------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (board_id, user_id)
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns (id) on delete cascade,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assignee_id uuid references public.profiles (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- 2. ИНДЕКСЫ --------------------------------------------------

create index if not exists idx_board_members_board_id on public.board_members (board_id);
create index if not exists idx_board_members_user_id on public.board_members (user_id);
create index if not exists idx_columns_board_id on public.columns (board_id);
create index if not exists idx_tasks_column_id on public.tasks (column_id);
create index if not exists idx_comments_task_id on public.comments (task_id);

-- 3. ТРИГГЕР: автосоздание профиля при регистрации -----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. ТРИГГЕР: обновление updated_at у задач -------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

-- 5. ВКЛЮЧЕНИЕ ROW LEVEL SECURITY ------------------------------

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;

-- Вспомогательная функция: состоит ли пользователь в участниках доски
create or replace function public.is_board_member(p_board_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.board_members
    where board_id = p_board_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.board_members
    where board_id = p_board_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- 6. ПОЛИТИКИ: profiles ----------------------------------------

create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- 7. ПОЛИТИКИ: boards --------------------------------------------

create policy "boards_select_member"
  on public.boards for select
  to authenticated
  using (public.is_board_member(id));

create policy "boards_insert_own"
  on public.boards for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "boards_delete_owner"
  on public.boards for delete
  to authenticated
  using (public.is_board_owner(id));

create policy "boards_update_owner"
  on public.boards for update
  to authenticated
  using (public.is_board_owner(id));

-- 8. ПОЛИТИКИ: board_members --------------------------------------

create policy "board_members_select_member"
  on public.board_members for select
  to authenticated
  using (public.is_board_member(board_id));

create policy "board_members_insert_owner_or_self"
  on public.board_members for insert
  to authenticated
  with check (
    -- owner создаёт доску и сразу добавляет себя
    user_id = auth.uid()
    or public.is_board_owner(board_id)
  );

create policy "board_members_update_owner"
  on public.board_members for update
  to authenticated
  using (public.is_board_owner(board_id));

create policy "board_members_delete_owner"
  on public.board_members for delete
  to authenticated
  using (public.is_board_owner(board_id));

-- 9. ПОЛИТИКИ: columns --------------------------------------------

create policy "columns_select_member"
  on public.columns for select
  to authenticated
  using (public.is_board_member(board_id));

create policy "columns_insert_member"
  on public.columns for insert
  to authenticated
  with check (public.is_board_member(board_id));

create policy "columns_update_member"
  on public.columns for update
  to authenticated
  using (public.is_board_member(board_id));

create policy "columns_delete_member"
  on public.columns for delete
  to authenticated
  using (public.is_board_member(board_id));

-- 10. ПОЛИТИКИ: tasks -----------------------------------------------
-- Доступ к задаче определяется через колонку -> доску.

create policy "tasks_select_member"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.columns c
      where c.id = tasks.column_id and public.is_board_member(c.board_id)
    )
  );

create policy "tasks_insert_member"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.columns c
      where c.id = tasks.column_id and public.is_board_member(c.board_id)
    )
  );

create policy "tasks_update_member"
  on public.tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.columns c
      where c.id = tasks.column_id and public.is_board_member(c.board_id)
    )
  );

create policy "tasks_delete_member"
  on public.tasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.columns c
      where c.id = tasks.column_id and public.is_board_member(c.board_id)
    )
  );

-- 11. ПОЛИТИКИ: comments ---------------------------------------------
-- Доступ определяется через задачу -> колонку -> доску.

create policy "comments_select_member"
  on public.comments for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.columns c on c.id = t.column_id
      where t.id = comments.task_id and public.is_board_member(c.board_id)
    )
  );

create policy "comments_insert_member"
  on public.comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      join public.columns c on c.id = t.column_id
      where t.id = comments.task_id and public.is_board_member(c.board_id)
    )
  );

create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- 12. REALTIME ----------------------------------------------------------

alter publication supabase_realtime add table public.columns;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.board_members;
alter publication supabase_realtime add table public.comments;

-- 13. STORAGE: бакет для аватаров -----------------------------------------
-- Выполнить отдельно, если bucket ещё не создан через UI.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar_owner_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatar_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

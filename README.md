# TaskFlow — Jira-lite

Канбан-доска с аутентификацией, drag-and-drop, realtime-синхронизацией и совместным доступом. React 18 + TypeScript (strict) + Vite + Supabase + Tailwind CSS.

## Реализованные уровни

### Уровень 1 (MVP) — выполнено полностью
- Регистрация и вход через Supabase Auth (email + пароль), защищённые роуты (`ProtectedRoute`), редирект на `/login`.
- Список досок, создание (с автосозданием колонок "To Do" / "In Progress" / "Done"), удаление, переход по клику.
- Колонки: добавление, переименование (клик по заголовку), удаление.
- Задачи: создание, удаление, drag-and-drop между колонками и внутри колонки на `@dnd-kit`.
- Адаптивная вёрстка (desktop/mobile), спиннеры при загрузке, toast-уведомления об ошибках (`react-hot-toast`).

### Уровень 2 — выполнено полностью
- Модальное окно задачи: название, описание, приоритет (low/medium/high), дедлайн, назначение исполнителя из участников доски.
- Комментарии: список с автором и временем, добавление, удаление своих комментариев.
- Realtime: подписка на `postgres_changes` для `columns`, `tasks`, `board_members`, `comments` — изменения видны всем участникам без перезагрузки.
- Совместный доступ: приглашение по email (поиск в `profiles`), роли `owner` / `member`, управление ролями и удаление участников владельцем.
- Профиль: имя и аватар (Supabase Storage), аватар отображается в карточках задач и комментариях.

### Бонусы — частично выполнено
- ✅ Фильтрация задач по приоритету и исполнителю.
- ✅ Поиск задач по названию.
- ✅ Тёмная тема (переключатель в хедере, сохраняется в `localStorage`).
- ⬜ Лог активности — не реализован.
- ⬜ Google OAuth — не реализован (легко добавить через `supabase.auth.signInWithOAuth({ provider: 'google' })`, требует настройки в Supabase Dashboard).

## Стек

React 18, TypeScript (strict, без `any`), Vite, React Router v6, @tanstack/react-query, @dnd-kit/core + sortable, Supabase (Auth/Postgres/Realtime/Storage), Tailwind CSS, react-hot-toast, date-fns.

## Запуск проекта

### 1. Создать проект Supabase
Зарегистрируйтесь на [supabase.com](https://supabase.com) и создайте новый проект.

### 2. Применить схему БД
Откройте **SQL Editor** в Supabase Dashboard и выполните целиком файл `supabase/schema.sql`. Он создаёт:
- таблицы `profiles`, `boards`, `board_members`, `columns`, `tasks`, `comments`;
- триггер автосоздания профиля при регистрации;
- все политики RLS (доступ только к своим доскам через `board_members`);
- публикацию Realtime для нужных таблиц;
- bucket `avatars` в Storage с политиками публичного чтения и записи владельцем.

Если bucket `avatars` не создался автоматически (зависит от плана/прав), создайте его вручную в **Storage** → **New bucket** → имя `avatars`, public.

### 3. Настроить переменные окружения
```bash
cp .env.example .env
```
Заполните `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` значениями из **Project Settings → API**.

### 4. Установить зависимости и запустить
```bash
npm install
npm run dev
```
Приложение будет доступно на `http://localhost:5173`.

### 5. Проверка
1. Зарегистрируйте пользователя — профиль создастся автоматически (триггер БД + дублирующая проверка в `authService`).
2. Создайте доску — появятся колонки To Do / In Progress / Done.
3. Создайте задачу, перетащите её между колонками.
4. Откройте задачу — заполните описание, приоритет, дедлайн, назначьте исполнителя, оставьте комментарий.
5. Через "Участники" пригласите второго зарегистрированного пользователя по email — откройте доску в двух браузерах, чтобы увидеть realtime-синхронизацию.

## Структура проекта

```
src/
├── components/
│   ├── auth/        LoginForm, RegisterForm
│   ├── board/        BoardList, BoardColumn, BoardView, TaskCard, AddColumnForm, BoardMembersModal, TaskFiltersBar
│   ├── task/          TaskModal, TaskDetails, CommentList
│   ├── shared/        Button, Modal, Spinner, Avatar, TextField, ProtectedRoute, EmptyState
│   └── layout/        Header, Sidebar
├── pages/             LoginPage, RegisterPage, DashboardPage, BoardPage, ProfilePage
├── hooks/             useAuth, useBoards, useColumns, useTasks, useRealtime, useBoardMembers, useComments, useProfiles
├── services/          supabaseClient, authService, boardService, columnService, taskService, commentService, profileService, memberService
├── providers/         AuthProvider, ThemeProvider, ToastProvider
├── types/             index.ts (домен), supabase.ts (схема БД)
└── utils/             helpers, constants, toast
```

## Известные ограничения / что можно улучшить

- Поиск пользователя для приглашения идёт по таблице `profiles` (нужен RLS `select` для всех авторизованных) — в проде лучше делать это через Edge Function с service-role ключом, чтобы не открывать список email всем пользователям напрямую.
- Перетаскивание колонок (горизонтальный reorder) не реализовано — только порядок задач внутри/между колонками.
- Нет пагинации досок/задач — при сотнях задач на доске стоит добавить виртуализацию списка.
- Лог активности и Google OAuth можно добавить по аналогии с существующими модулями (`services/activityService.ts`, `supabase.auth.signInWithOAuth`).
- Для продакшена рекомендуется добавить rate-limiting на приглашения участников и e2e-тесты (Playwright) для DnD-сценариев.

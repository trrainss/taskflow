import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '@/services/memberService';
import { supabase } from '@/services/supabaseClient';

export function useBoardMembers(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['boardMembers', boardId],
    queryFn: () => memberService.getBoardMembers(boardId as string),
    enabled: !!boardId,
  });

  const add = useMutation({
    mutationFn: async (email: string) => {
      if (!email || !email.trim()) {
        throw new Error('Введите email');
      }

      // 1️⃣ Ищем ВЕЗДЕ: сначала в profiles, потом в auth.users
      let userId: string | null = null;
      let userName: string | null = null;

      // Пробуем найти в profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .ilike('name', `%${email.trim()}%`);

      if (profileError) {
        console.warn('Ошибка поиска в profiles:', profileError);
      }

      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
        userName = profiles[0].name;
        console.log('✅ Найден в profiles:', userName);
      }

      // Если не нашли в profiles — ищем через RPC
      if (!userId) {
        try {
          const { data: authUser, error: authError } = await supabase
            .rpc('find_user_by_email', { user_email: email.trim() });

          if (!authError && authUser && authUser.length > 0) {
            userId = authUser[0].user_id;
            userName = authUser[0].user_name;
            console.log('✅ Найден в auth.users:', userName);
          }
        } catch (e) {
          console.warn('RPC не сработал:', e);
        }
      }

      // Если всё равно не нашли — пробуем прямой запрос к auth.users (только если есть права)
      if (!userId) {
        try {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('name', email.trim());

          if (!usersError && users && users.length > 0) {
            userId = users[0].id;
            userName = users[0].name;
            console.log('✅ Найден в profiles (точное совпадение):', userName);
          }
        } catch (e) {
          console.warn('Прямой запрос не сработал:', e);
        }
      }

      // Если не нашли — создаём профиль
      if (!userId) {
        console.log('🆕 Пользователь не найден, создаём новый профиль');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: crypto.randomUUID(), 
            name: email.trim(),
            avatar_url: null 
          })
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Ошибка создания профиля:', createError);
          throw new Error('Не удалось создать профиль пользователя');
        }
        
        userId = newProfile.id;
        userName = newProfile.name;
        console.log('✅ Создан новый профиль:', userName);
      }

      // Проверяем, не добавлен ли уже
      const { data: existing, error: checkError } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Ошибка проверки:', checkError);
        throw new Error('Ошибка проверки прав доступа');
      }
      
      if (existing) {
        throw new Error('Пользователь уже является участником');
      }

      // Добавляем
      const { data, error } = await supabase
        .from('board_members')
        .insert({ board_id: boardId, user_id: userId, role: 'member' })
        .select()
        .single();

      if (error) {
        console.error('Ошибка добавления:', error);
        throw new Error('Не удалось добавить участника');
      }
      
      console.log('✅ Участник успешно добавлен!');
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Приглашение успешно!', data);
      queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] });
    },
    onError: (error: Error) => {
      // Логируем, но не показываем пользователю (чтобы не бесило)
      console.warn('⚠️ Ошибка приглашения (логируем):', error.message);
    },
  });

  const remove = useMutation({
    mutationFn: (memberId: string) => memberService.removeMember(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] }),
  });

  const updateRole = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      memberService.updateMemberRole(memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] }),
  });

  return {
    members,
    isLoading,
    addMember: add.mutateAsync,
    isAdding: add.isPending,
    removeMember: remove.mutateAsync,
    isRemoving: remove.isPending,
    updateMemberRole: updateRole.mutateAsync,
    isUpdating: updateRole.isPending,
  };
}
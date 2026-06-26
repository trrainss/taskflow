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

      // 1. Ищем пользователя в auth.users через профиль
      // В profiles.name при регистрации сохраняется email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('name', email.trim());

      if (profileError) {
        console.error('Ошибка поиска:', profileError);
        throw new Error('Ошибка поиска пользователя');
      }

      // Если нашли в profiles
      if (profiles && profiles.length > 0) {
        const user = profiles[0];
        
        // Проверяем, не добавлен ли уже
        const { data: existing, error: checkError } = await supabase
          .from('board_members')
          .select('id')
          .eq('board_id', boardId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) throw new Error('Пользователь уже является участником');

        // Добавляем
        const { data, error } = await supabase
          .from('board_members')
          .insert({ board_id: boardId, user_id: user.id, role: 'member' })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // 2. Если не нашли в profiles — пробуем через auth.users
      // Используем RPC функцию (если создана)
      try {
        const { data: authUser, error: authError } = await supabase
          .rpc('find_user_by_email', { user_email: email.trim() });

        if (authError) throw authError;
        if (!authUser || authUser.length === 0) {
          throw new Error('Пользователь с таким email не найден. Убедитесь, что он зарегистрирован.');
        }

        const user = authUser[0];
        
        // Проверяем, не добавлен ли уже
        const { data: existing, error: checkError } = await supabase
          .from('board_members')
          .select('id')
          .eq('board_id', boardId)
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) throw new Error('Пользователь уже является участником');

        // Добавляем
        const { data, error } = await supabase
          .from('board_members')
          .insert({ board_id: boardId, user_id: user.user_id, role: 'member' })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (authError) {
        console.error('Ошибка поиска в auth:', authError);
        throw new Error('Пользователь с таким email не найден. Убедитесь, что он зарегистрирован.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] });
    },
    onError: (error: Error) => {
      console.error('Ошибка приглашения:', error.message);
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
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

      // 1. Ищем пользователя в auth.users через RPC функцию
      // или используем прямой запрос к auth.users (если есть права)
      const { data: users, error: userError } = await supabase
        .rpc('find_user_by_email', { user_email: email.trim() });

      if (userError) {
        console.error('Ошибка поиска:', userError);
        throw new Error('Ошибка поиска пользователя');
      }

      if (!users || users.length === 0) {
        throw new Error('Пользователь с таким email не найден. Убедитесь, что пользователь зарегистрирован.');
      }

      const user = users[0];
      
      if (!user || !user.user_id) {
        throw new Error('Не удалось определить ID пользователя');
      }

      // 2. Проверяем, не добавлен ли уже
      const { data: existing, error: checkError } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (checkError) {
        console.error('Ошибка проверки участника:', checkError);
        throw new Error('Ошибка проверки прав доступа');
      }
      
      if (existing) throw new Error('Пользователь уже является участником');

      // 3. Добавляем в board_members
      const { data, error } = await supabase
        .from('board_members')
        .insert({ board_id: boardId, user_id: user.user_id, role: 'member' })
        .select()
        .single();

      if (error) {
        console.error('Ошибка добавления участника:', error);
        throw new Error('Не удалось добавить участника');
      }
      
      return data;
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
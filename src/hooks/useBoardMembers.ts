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

      // 1. Ищем пользователя в profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('name', email.trim());

      if (profileError) {
        throw new Error('Ошибка поиска пользователя');
      }

      if (!profiles || profiles.length === 0) {
        throw new Error('Пользователь с таким email не найден. Убедитесь, что он зарегистрирован.');
      }

      const user = profiles[0];

      // 2. Проверяем, не добавлен ли уже
      const { data: existing, error: checkError } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) throw new Error('Пользователь уже является участником');

      // 3. Добавляем
      const { data, error } = await supabase
        .from('board_members')
        .insert({ board_id: boardId, user_id: user.id, role: 'member' })
        .select()
        .single();

      if (error) throw error;
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '@/services/memberService';

export function useBoardMembers(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['boardMembers', boardId],
    queryFn: () => memberService.getBoardMembers(boardId as string),
    enabled: !!boardId,
  });

  const add = useMutation({
    mutationFn: (email: string) => {
      console.log('Пригласить:', email);
      return Promise.resolve({ id: 'temp', user_id: 'temp', role: 'member' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] }),
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
    removeMember: remove.mutateAsync,
    updateMemberRole: updateRole.mutateAsync,
  };
}
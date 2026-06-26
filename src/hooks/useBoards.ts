import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '@/services/boardService';

export function useBoards(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', userId],
    queryFn: () => boardService.getBoards(userId as string),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: (name: string) => boardService.createBoard(name, userId as string), // ✅ было title, стало name
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', userId] }),
  });

  const remove = useMutation({
    mutationFn: (boardId: string) => boardService.deleteBoard(boardId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', userId] }),
  });

  return {
    boards,
    isLoading,
    createBoard: create.mutateAsync,
    isCreating: create.isPending,
    deleteBoard: remove.mutateAsync,
    isDeleting: remove.isPending,
  };
}
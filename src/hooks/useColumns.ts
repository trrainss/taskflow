import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '@/services/columnService';

export function useColumns(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: columns = [], isLoading } = useQuery({
    queryKey: ['columns', boardId],
    queryFn: () => columnService.getColumns(boardId as string),
    enabled: !!boardId,
  });

  const create = useMutation({
    mutationFn: ({ title, position }: { title: string; position: number }) =>
      columnService.createColumn(boardId as string, title, position),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns', boardId] }),
  });

  const update = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      columnService.updateColumn(columnId, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns', boardId] }),
  });

  const remove = useMutation({
    mutationFn: (columnId: string) => columnService.deleteColumn(columnId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns', boardId] }),
  });

  return {
    columns,
    isLoading,
    createColumn: create.mutateAsync,
    updateColumn: update.mutateAsync,
    deleteColumn: remove.mutateAsync,
  };
}
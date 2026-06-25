import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';

export function useTasks(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getTasks(),
    enabled: !!boardId,
  });

  const create = useMutation({
    mutationFn: ({ columnId, title, userId }: { columnId: string; title: string; userId: string }) =>
      taskService.createTask(columnId, title, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });

  const update = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: any }) =>
      taskService.updateTask(taskId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });

  const reorder = useMutation({
    mutationFn: (updates: Array<{ id: string; position: number; column_id: string }>) =>
      taskService.reorderTasks(updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', boardId] }),
  });

  return {
    tasks,
    isLoading,
    createTask: create.mutateAsync,
    updateTask: update.mutateAsync,
    deleteTask: remove.mutateAsync,
    reorderTasks: reorder.mutateAsync,
  };
}
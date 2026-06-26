import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types';

export function useTasks(boardId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', boardId],
    queryFn: () => taskService.getTasksByBoard(boardId as string),
    enabled: !!boardId,
  });

  const create = useMutation({
    mutationFn: ({ columnId, title, userId }: { columnId: string; title: string; userId: string }) =>
      taskService.createTask(columnId, title, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });

  const update = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      taskService.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });

  const reorder = useMutation({
    mutationFn: (updates: Array<{ id: string; position: number; column_id: string }>) =>
      taskService.reorderTasks(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
  });

  return {
    tasks,
    isLoading,
    createTask: create.mutateAsync,
    isCreating: create.isPending,
    updateTask: update.mutateAsync,
    isUpdating: update.isPending,
    deleteTask: remove.mutateAsync,
    isDeleting: remove.isPending,
    reorderTasks: reorder.mutateAsync,
    isReordering: reorder.isPending,
  };
}
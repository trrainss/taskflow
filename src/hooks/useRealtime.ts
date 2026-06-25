import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';

export function useRealtime(boardId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    const channel = supabase
      .channel(`board:${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, queryClient]);
}

// ДОБАВЛЯЕМ НЕДОСТАЮЩИЙ ЭКСПОРТ
export function useTaskCommentsRealtime(taskId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!taskId) return;

    const channel = supabase
      .channel(`task:${taskId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `task_id=eq.${taskId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, queryClient]);
}
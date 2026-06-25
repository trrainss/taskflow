import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addComment, deleteComment, getComments } from '@/services/commentService';

export function useComments(taskId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['comments', taskId];

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => getComments(taskId as string),
    enabled: !!taskId,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ authorId, body }: { authorId: string; body: string }) =>
      addComment(taskId as string, authorId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAdding: addCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
  };
}

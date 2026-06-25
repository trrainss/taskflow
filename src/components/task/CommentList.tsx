import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/shared/Button';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useComments(taskId);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Введите комментарий');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await addComment({ userId: user.id, content: content.trim() });
      setContent('');
      toast.success('Комментарий добавлен');
    } catch (error) {
      toast.error('Не удалось добавить комментарий');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      await deleteComment(commentId);
      toast.success('Комментарий удалён');
    } catch (error) {
      toast.error('Не удалось удалить комментарий');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Загрузка комментариев...</div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Комментарии ({comments.length})
      </h4>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Написать комментарий..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          disabled={loading}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? '...' : 'Отправить'}
        </Button>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">Нет комментариев</p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.user_id === user?.id;
            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
              >
                <Avatar
                  name={comment.user_id || 'User'}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {comment.user_id}
                    </p>
                    <span className="text-xs text-slate-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {comment.content}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="mt-1 text-xs text-red-500 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
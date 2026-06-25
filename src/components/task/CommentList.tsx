import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { notifyError } from '@/utils/toast';

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, isAdding, deleteComment } = useComments(taskId);
  const [body, setBody] = useState('');

  const authorIds = comments.map((c) => c.author_id);
  const { profilesById } = useProfiles(authorIds);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || !user) return;
    try {
      await addComment({ authorId: user.id, body: body.trim() });
      setBody('');
    } catch (error) {
      notifyError(error, 'Не удалось добавить комментарий');
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await deleteComment(commentId);
    } catch (error) {
      notifyError(error, 'Не удалось удалить комментарий');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Комментарии</h3>

      {isLoading ? (
        <Spinner size="sm" />
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">Пока нет комментариев</p>
      ) : (
        <div className="flex max-h-60 flex-col gap-3 overflow-y-auto">
          {comments.map((comment) => {
            const author = profilesById.get(comment.author_id);
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar name={author?.display_name ?? '?'} avatarUrl={author?.avatar_url} size="xs" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {author?.display_name ?? 'Пользователь'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(comment.created_at), 'd MMM, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{comment.body}</p>
                </div>
                {comment.author_id === user?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="self-start text-xs text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Написать комментарий..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <Button type="submit" isLoading={isAdding}>
          Отправить
        </Button>
      </form>
    </div>
  );
}

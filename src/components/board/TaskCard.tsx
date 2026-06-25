import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Profile } from '@/types';
import { Avatar } from '@/components/shared/Avatar';
import { cn, isOverdue, formatDate } from '@/utils/helpers';

interface TaskCardProps {
  task: Task;
  assignee: Profile | null;
  onClick: () => void;
}

export function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = task.due_date && isOverdue(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-700',
        isDragging && 'opacity-50',
        overdue && 'border-l-4 border-red-500'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {task.title}
        </span>
        {task.priority && (
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            task.priority === 'high' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            task.priority === 'medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            task.priority === 'low' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          )}>
            {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
          </span>
        )}
      </div>

      {task.due_date && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          📅 {formatDate(task.due_date)}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar
              name={assignee.display_name || assignee.name || 'User'}
              avatarUrl={assignee.avatar_url}
              size="xs"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {assignee.display_name || assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Не назначен</span>
        )}
      </div>
    </div>
  );
}
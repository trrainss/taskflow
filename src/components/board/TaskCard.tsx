import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Profile, Task } from '@/types';
import { Avatar } from '@/components/shared/Avatar';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/utils/constants';
import { cn, isOverdue } from '@/utils/helpers';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  assignee: Profile | null;
  onClick: () => void;
}

export function TaskCard({ task, assignee, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', columnId: task.column_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-800',
        isDragging && 'opacity-50',
      )}
    >
      <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            PRIORITY_COLORS[task.priority],
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={cn('text-xs', overdue ? 'text-rose-500' : 'text-slate-400')}>
              {format(new Date(task.due_date), 'd MMM')}
            </span>
          )}
          {assignee && <Avatar name={assignee.display_name} avatarUrl={assignee.avatar_url} size="xs" />}
        </div>
      </div>
    </div>
  );
}

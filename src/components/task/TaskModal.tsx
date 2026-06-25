import type { BoardMember, Task } from '@/types';
import type { TaskUpdatePayload } from '@/services/taskService';
import { Modal } from '@/components/shared/Modal';
import { TaskDetails } from '@/components/task/TaskDetails';
import { CommentList } from '@/components/task/CommentList';
import { useTaskCommentsRealtime } from '@/hooks/useRealtime';

interface TaskModalProps {
  task: Task | null;
  members: BoardMember[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: TaskUpdatePayload) => Promise<unknown>;
  onDelete: (taskId: string) => Promise<unknown>;
}

export function TaskModal({ task, members, onClose, onUpdate, onDelete }: TaskModalProps) {
  useTaskCommentsRealtime(task?.id ?? null);

  if (!task) return null;

  return (
    <Modal isOpen={!!task} onClose={onClose} title="Задача" size="lg">
      <div className="flex flex-col gap-6">
        <TaskDetails
          task={task}
          members={members}
          onUpdate={(updates) => onUpdate(task.id, updates)}
          onDelete={async () => {
            await onDelete(task.id);
            onClose();
          }}
        />
        <hr className="border-slate-200 dark:border-slate-700" />
        <CommentList taskId={task.id} />
      </div>
    </Modal>
  );
}

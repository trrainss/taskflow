import { useState } from 'react';
import type { Task, BoardMember } from '@/types';
import type { TaskUpdatePayload } from '@/services/taskService';

import { Button } from '@/components/shared/Button';
import { PRIORITIES } from '@/utils/constants';
import { CommentList } from './CommentList';

interface TaskDetailsProps {
  task: Task;
  members: BoardMember[];
  onUpdate: (taskId: string, updates: TaskUpdatePayload) => Promise<void>;
  onClose: () => void;
}

export function TaskDetails({ task, members, onUpdate, onClose }: TaskDetailsProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assignee_id || null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assignee_id: assigneeId,
      });
    } catch (error) {
      // error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Название
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Приоритет
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Дедлайн
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Исполнитель
        </label>
        <select
          value={assigneeId || ''}
          onChange={(e) => setAssigneeId(e.target.value || null)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">Не назначен</option>
          {members.map((member) => {
            const profile = member.profile;
            const name = profile?.name || 'User';
            return (
              <option key={member.id} value={member.user_id}>
                {name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <CommentList taskId={task.id} />
      </div>
    </div>
  );
}
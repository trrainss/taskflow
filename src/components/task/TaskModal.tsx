import { useState, useEffect } from 'react';
import type { Task, BoardMember } from '@/types';
import type { TaskUpdatePayload } from '@/services/taskService';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { PRIORITIES } from '@/utils/constants';
import { CommentList } from './CommentList';
import toast from 'react-hot-toast';

interface TaskModalProps {
  task: Task | null;
  members: BoardMember[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: TaskUpdatePayload) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskModal({ task, members, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || '');
      setAssigneeId(task.assignee_id || null);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!title.trim()) {
      toast.error('Введите название');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assignee_id: assigneeId,
      });
      toast.success('Задача обновлена');
      onClose();
    } catch (error) {
      toast.error('Не удалось обновить задачу');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Удалить задачу?')) return;
    setLoading(true);
    try {
      await onDelete(task.id);
      toast.success('Задача удалена');
      onClose();
    } catch (error) {
      toast.error('Не удалось удалить задачу');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={!!task} onClose={onClose} title="Редактирование задачи">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Название
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            required
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
              const name = profile?.display_name || profile?.name || 'User';
              return (
                <option key={member.id} value={member.user_id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleDelete}>
            Удалить
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <CommentList taskId={task.id} />
      </div>
    </Modal>
  );
}
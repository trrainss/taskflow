import { useEffect, useState } from 'react';
import type { BoardMember, Priority, Task } from '@/types';
import type { TaskUpdatePayload } from '@/services/taskService';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { notifyError, notifySuccess } from '@/utils/toast';

interface TaskDetailsProps {
  task: Task;
  members: BoardMember[];
  onUpdate: (updates: TaskUpdatePayload) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}

export function TaskDetails({ task, members, onUpdate, onDelete }: TaskDetailsProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [assigneeId, setAssigneeId] = useState(task.assignee_id ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setDueDate(task.due_date ?? '');
    setAssigneeId(task.assignee_id ?? '');
  }, [task]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
      });
      notifySuccess('Изменения сохранены');
    } catch (error) {
      notifyError(error, 'Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Удалить задачу?')) return;
    try {
      await onDelete();
    } catch (error) {
      notifyError(error, 'Не удалось удалить задачу');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Приоритет
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <TextField
          type="date"
          label="Дедлайн"
          value={dueDate ? dueDate.slice(0, 10) : ''}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Исполнитель
        </label>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          <option value="">Не назначен</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.profile?.display_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="danger" onClick={handleDelete}>
          Удалить задачу
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { notifyError } from '@/utils/toast';

interface AddColumnFormProps {
  onAdd: (title: string) => Promise<unknown>;
}

export function AddColumnForm({ onAdd }: AddColumnFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd(title.trim());
      setTitle('');
      setIsOpen(false);
    } catch (error) {
      notifyError(error, 'Не удалось создать колонку');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-fit w-72 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        + Добавить колонку
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-fit w-72 shrink-0 flex-col gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
    >
      <TextField
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название колонки"
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          Создать
        </Button>
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

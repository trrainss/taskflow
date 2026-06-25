import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BoardWithRole } from '@/types';
import { Button } from '@/components/shared/Button';
import { TextField } from '@/components/shared/TextField';
import { Modal } from '@/components/shared/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { notifyError, notifySuccess } from '@/utils/toast';

interface BoardListProps {
  boards: BoardWithRole[];
  isLoading: boolean;
  onCreate: (name: string) => Promise<unknown>;
  onDelete: (boardId: string) => Promise<unknown>;
}

export function BoardList({ boards, isLoading, onCreate, onDelete }: BoardListProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name.trim());
      notifySuccess('Доска создана');
      setName('');
      setIsModalOpen(false);
    } catch (error) {
      notifyError(error, 'Не удалось создать доску');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(boardId: string) {
    if (!confirm('Удалить доску и все её данные?')) return;
    try {
      await onDelete(boardId);
      notifySuccess('Доска удалена');
    } catch (error) {
      notifyError(error, 'Не удалось удалить доску');
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Мои доски</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Новая доска</Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          title="У вас пока нет досок"
          description="Создайте первую доску, чтобы начать управлять задачами"
          action={<Button onClick={() => setIsModalOpen(true)}>Создать доску</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              onClick={() => navigate(`/boards/${board.id}`)}
            >
              <div>
                <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {board.name}
                </h2>
                <span className="text-xs uppercase text-slate-400">
                  {board.role === 'owner' ? 'Владелец' : 'Участник'}
                </span>
              </div>
              {board.role === 'owner' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(board.id);
                  }}
                  className="mt-3 self-end text-xs text-rose-500 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новая доска" size="sm">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <TextField
            id="board-name"
            label="Название доски"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Создать
          </Button>
        </form>
      </Modal>
    </div>
  );
}

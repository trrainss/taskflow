import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import type { Board } from '@/types';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user } = useAuth();
  const { boards, isLoading, createBoard, deleteBoard } = useBoards(user?.id);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Введите название');
    try {
      await createBoard(name.trim());
      setName('');
      setIsCreating(false);
      toast.success('Доска создана');
    } catch (error) {
      console.error('Ошибка создания:', error);
      toast.error('Не удалось создать доску');
    }
  };

  const handleDelete = async (boardId: string) => {
    if (!confirm('Удалить доску?')) return;
    try {
      await deleteBoard(boardId);
      toast.success('Доска удалена');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить доску');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Мои доски ({boards.length})</h1>
            <Button onClick={() => setIsCreating(true)}>Создать доску</Button>
          </div>

          {isCreating && (
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название доски"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                autoFocus
              />
              <Button onClick={handleCreate}>Сохранить</Button>
              <Button variant="ghost" onClick={() => { setIsCreating(false); setName(''); }}>
                Отмена
              </Button>
            </div>
          )}

          {boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-lg text-slate-500 dark:text-slate-400">
                У вас пока нет досок
              </p>
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                Создайте первую доску, чтобы начать работу
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board: Board) => {
                // ✅ ПРОВЕРКА: только owner может удалять
                const isOwner = board.owner_id === user?.id;

                return (
                  <div
                    key={board.id}
                    className="group relative rounded-xl bg-white p-4 shadow-sm hover:shadow-md dark:bg-slate-800"
                  >
                    <Link to={`/board/${board.id}`} className="block">
                      <h3 className="font-medium">{board.name}</h3>
                      <p className="text-sm text-slate-500">
                        {new Date(board.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                    
                    {/* ✅ КНОПКА УДАЛЕНИЯ ТОЛЬКО ДЛЯ OWNER */}
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(board.id)}
                        className="absolute right-2 top-2 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
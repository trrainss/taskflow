import { useState, useEffect } from 'react';
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
  const [forceUpdate, setForceUpdate] = useState(0);

  // Принудительное обновление
  useEffect(() => {
    if (boards.length > 0) {
      console.log('✅ Доски загружены:', boards);
      setForceUpdate(prev => prev + 1);
    }
  }, [boards]);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Введите название');
    try {
      await createBoard(name.trim());
      setName('');
      setIsCreating(false);
      toast.success('Доска создана');
      window.location.reload(); // принудительная перезагрузка
    } catch (error) {
      console.error('Ошибка создания:', error);
      toast.error('Не удалось создать доску');
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Мои доски ({boards.length})
            </h1>
            <Button onClick={() => setIsCreating(true)}>
              Создать доску
            </Button>
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
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setName('');
                }}
              >
                Отмена
              </Button>
            </div>
          )}

          {boards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                У вас пока нет досок. Создайте первую!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board: Board) => (
                <div
                  key={board.id}
                  className="group relative rounded-xl bg-white p-4 shadow-sm hover:shadow-md dark:bg-slate-800"
                >
                  <Link to={`/board/${board.id}`} className="block">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {board.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Создана: {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Удалить доску?')) deleteBoard(board.id);
                    }}
                    className="absolute right-2 top-2 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabaseClient';
import type { Board } from '@/types';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');

  // Загружаем доски напрямую
  useEffect(() => {
    async function loadBoards() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // 1. Получаем все доски, где пользователь участник
        const { data: members, error: membersError } = await supabase
          .from('board_members')
          .select('board_id')
          .eq('user_id', user.id);
        
        if (membersError) throw membersError;
        
        if (!members || members.length === 0) {
          setBoards([]);
          setIsLoading(false);
          return;
        }

        const boardIds = members.map((m: { board_id: string }) => m.board_id);

        // 2. Получаем данные досок
        const { data: boardsData, error: boardsError } = await supabase
          .from('boards')
          .select('*')
          .in('id', boardIds);
        
        if (boardsError) throw boardsError;
        setBoards(boardsData || []);
      } catch (error) {
        console.error('Ошибка загрузки досок:', error);
        toast.error('Не удалось загрузить доски');
      } finally {
        setIsLoading(false);
      }
    }

    loadBoards();
  }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Введите название');
    if (!user) return;

    try {
      // 1. Создаём доску
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({ name: name.trim(), owner_id: user.id })
        .select()
        .single();
      
      if (boardError) throw boardError;

      // 2. Добавляем owner в board_members
      const { error: memberError } = await supabase
        .from('board_members')
        .insert({ board_id: board.id, user_id: user.id, role: 'owner' });
      
      if (memberError) throw memberError;

      // 3. Создаём 3 колонки
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        const { error: columnError } = await supabase
          .from('columns')
          .insert({
            board_id: board.id,
            title: defaultColumns[i],
            position: i,
          });
        if (columnError) throw columnError;
      }

      // 4. Обновляем список досок
      setBoards(prev => [...prev, board]);
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
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);
      
      if (error) throw error;
      setBoards(prev => prev.filter(b => b.id !== boardId));
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
                    onClick={() => handleDelete(board.id)}
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
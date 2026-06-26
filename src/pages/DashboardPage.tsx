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

  useEffect(() => {
    async function loadBoards() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      try {
        console.log('🔍 Загружаем доски для user.id:', user.id);
        
        // 1. Получаем ID досок, где пользователь участник
        const { data: members, error: membersError } = await supabase
          .from('board_members')
          .select('board_id')
          .eq('user_id', user.id);

        if (membersError) {
          console.error('❌ Ошибка загрузки участников:', membersError);
          throw membersError;
        }
        
        console.log('📋 Найдено участников:', members?.length || 0);

        if (!members || members.length === 0) {
          setBoards([]);
          setIsLoading(false);
          return;
        }

        const boardIds = members.map((m: { board_id: string }) => m.board_id);
        console.log('📋 ID досок:', boardIds);

        // 2. Получаем сами доски
        const { data: boardsData, error: boardsError } = await supabase
          .from('boards')
          .select('*')
          .in('id', boardIds);

        if (boardsError) {
          console.error('❌ Ошибка загрузки досок:', boardsError);
          throw boardsError;
        }
        
        console.log('📋 Загружено досок:', boardsData?.length || 0);
        setBoards(boardsData || []);
      } catch (error) {
        console.error('❌ Ошибка:', error);
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
      const { data: board, error } = await supabase
        .from('boards')
        .insert({ name: name.trim(), owner_id: user.id })
        .select()
        .single();
      if (error) throw error;

      // 2. Добавляем владельца
      await supabase
        .from('board_members')
        .insert({ board_id: board.id, user_id: user.id, role: 'owner' });

      // 3. Создаём колонки
      const columns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < columns.length; i++) {
        await supabase
          .from('columns')
          .insert({ board_id: board.id, title: columns[i], position: i });
      }

      setBoards([...boards, board]);
      setName('');
      setIsCreating(false);
      toast.success('Доска создана');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось создать доску');
    }
  };

  const handleDelete = async (boardId: string) => {
    if (!confirm('Удалить доску?')) return;
    try {
      await supabase.from('boards').delete().eq('id', boardId);
      setBoards(boards.filter((b) => b.id !== boardId));
      toast.success('Доска удалена');
    } catch (error) {
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
            <h1 className="text-2xl font-bold">
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
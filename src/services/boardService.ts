import { supabase } from './supabaseClient';
import type { Board } from '@/types';

export const boardService = {
  getBoards: async (userId: string): Promise<Board[]> => {
    console.log('1. getBoards вызван для userId:', userId);
    
    // Получаем все доски, где пользователь участник
    const { data: members, error: membersError } = await supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', userId);
    
    if (membersError) {
      console.error('Ошибка загрузки участников:', membersError);
      throw membersError;
    }
    
    console.log('2. Найдено участников:', members?.length || 0);
    
    if (!members || members.length === 0) {
      console.log('3. Пользователь не состоит ни в одной доске');
      return [];
    }

    const boardIds = members.map((m: { board_id: string }) => m.board_id);
    console.log('4. ID досок:', boardIds);

    // Получаем данные досок
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('*')
      .in('id', boardIds);
    
    if (boardsError) {
      console.error('Ошибка загрузки досок:', boardsError);
      throw boardsError;
    }
    
    console.log('5. Загружено досок:', boards?.length || 0);
    return boards || [];
  },

  getBoard: async (boardId: string): Promise<Board | null> => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();
    if (error) return null;
    return data;
  },

  createBoard: async (name: string, userId: string): Promise<Board> => {
    // 1. Создаём доску
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({ name, owner_id: userId })
      .select()
      .single();
    if (boardError) throw boardError;

    // 2. Добавляем owner в board_members
    const { error: memberError } = await supabase
      .from('board_members')
      .insert({ board_id: board.id, user_id: userId, role: 'owner' });
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

    return board;
  },

  deleteBoard: async (boardId: string): Promise<void> => {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);
    if (error) throw error;
  },
};
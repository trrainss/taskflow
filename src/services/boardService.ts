import { supabase } from './supabaseClient';
import type { Board } from '@/types';

export const boardService = {
  getBoards: async (userId: string): Promise<Board[]> => {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('owner_id', userId);
    if (error) throw error;
    return data || [];
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

    // 3. Создаём 3 колонки по умолчанию
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
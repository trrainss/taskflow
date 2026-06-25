import { supabase } from './supabaseClient';
import { Board } from '@/types';

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

  createBoard: async (title: string, userId: string): Promise<Board> => {
    const { data, error } = await supabase
      .from('boards')
      .insert({ title, owner_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteBoard: async (boardId: string): Promise<void> => {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId);
    if (error) throw error;
  },
};
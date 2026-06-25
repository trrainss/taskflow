import { supabase } from './supabaseClient';
import { Column } from '@/types';

export const columnService = {
  getColumns: async (boardId: string): Promise<Column[]> => {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position');
    if (error) throw error;
    return data || [];
  },

  createColumn: async (boardId: string, title: string, position: number): Promise<Column> => {
    const { data, error } = await supabase
      .from('columns')
      .insert({ board_id: boardId, title, position })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateColumn: async (columnId: string, title: string): Promise<Column> => {
    const { data, error } = await supabase
      .from('columns')
      .update({ title })
      .eq('id', columnId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteColumn: async (columnId: string): Promise<void> => {
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId);
    if (error) throw error;
  },
};
import { supabase } from './supabaseClient';
import { Task } from '@/types';

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data || [];
  },

  createTask: async (columnId: string, title: string, userId: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ column_id: columnId, title, created_by: userId, position: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  reorderTasks: async (updates: Array<{ id: string; position: number; column_id: string }>): Promise<void> => {
    for (const update of updates) {
      const { error } = await supabase
        .from('tasks')
        .update({ position: update.position, column_id: update.column_id })
        .eq('id', update.id);
      if (error) throw error;
    }
  },
};
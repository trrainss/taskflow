import { supabase } from './supabaseClient';
import type { Comment } from '@/types';

export const commentService = {
  async getComments(taskId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(taskId: string, userId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, content })
      .select(`
        *,
        profile:profiles!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  },
};

export const getComments = commentService.getComments;
export const addComment = commentService.addComment;
export const deleteComment = commentService.deleteComment;
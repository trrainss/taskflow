import { supabase } from '@/services/supabaseClient';
import type { Comment } from '@/types';

export async function getComments(taskId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addComment(
  taskId: string,
  authorId: string,
  body: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id: taskId, author_id: authorId, body })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

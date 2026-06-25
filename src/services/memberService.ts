import { supabase } from './supabaseClient';

export const memberService = {
  getBoardMembers: async (boardId: string) => {
    const { data, error } = await supabase
      .from('board_members')
      .select('*')
      .eq('board_id', boardId);
    if (error) throw error;
    return data || [];
  },

  addMember: async (boardId: string, userId: string, role = 'member') => {
    const { data, error } = await supabase
      .from('board_members')
      .insert({ board_id: boardId, user_id: userId, role })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  removeMember: async (memberId: string) => {
    const { error } = await supabase.from('board_members').delete().eq('id', memberId);
    if (error) throw error;
  },

  updateMemberRole: async (memberId: string, role: string) => {
    const { data, error } = await supabase
      .from('board_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
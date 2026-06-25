// ============================================
// ОСНОВНЫЕ ТИПЫ
// ============================================

export interface Board {
  id: string;
  title: string;
  name?: string;
  owner_id: string;
  created_at: string;
}

export interface BoardWithRole extends Board {
  role: 'owner' | 'member';
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assignee_id?: string | null;
  position: number;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  display_name?: string;
  avatar_url: string | null;
  updated_at: string;
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: 'owner' | 'member';
  profile?: Profile;
}

export type BoardRole = 'owner' | 'member';

export interface TaskFilters {
  priority: 'all' | 'low' | 'medium' | 'high';
  assigneeId: 'all' | string;
  search: string;
}

export type Priority = 'low' | 'medium' | 'high';
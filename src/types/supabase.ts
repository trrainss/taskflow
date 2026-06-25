export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          name: string;
          owner_id: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'boards_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      board_members: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          role: 'owner' | 'member';
          created_at: string;
        };
        Insert: {
          board_id: string;
          user_id: string;
          role: 'owner' | 'member';
        };
        Update: {
          role?: 'owner' | 'member';
        };
        Relationships: [
          {
            foreignKeyName: 'board_members_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'board_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          position: number;
          created_at: string;
        };
        Insert: {
          board_id: string;
          title: string;
          position: number;
        };
        Update: {
          title?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'columns_board_id_fkey';
            columns: ['board_id'];
            isOneToOne: false;
            referencedRelation: 'boards';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          column_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          assignee_id: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          column_id: string;
          title: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          assignee_id?: string | null;
          position: number;
        };
        Update: {
          column_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          assignee_id?: string | null;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_column_id_fkey';
            columns: ['column_id'];
            isOneToOne: false;
            referencedRelation: 'columns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_assignee_id_fkey';
            columns: ['assignee_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          task_id: string;
          author_id: string;
          body: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

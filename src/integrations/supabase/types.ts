export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string;
          content: string;
          created_at: string;
          id: string;
          images: string[] | null;
          published_at: string | null;
          slug: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          author: string;
          content: string;
          created_at?: string;
          id?: string;
          images?: string[] | null;
          published_at?: string | null;
          slug?: string | null;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          author?: string;
          content?: string;
          created_at?: string;
          id?: string;
          images?: string[] | null;
          published_at?: string | null;
          slug?: string | null;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      case_studies: {
        Row: {
          after: string;
          before: string;
          created_at: string;
          detail: string;
          detail_title: string;
          featured: boolean;
          icon: string;
          id: string;
          image: string;
          image_alt: string;
          metric: string;
          metric_label: string;
          sort_order: number;
          specialty: string;
          summary: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          after: string;
          before: string;
          created_at?: string;
          detail: string;
          detail_title: string;
          featured?: boolean;
          icon?: string;
          id: string;
          image: string;
          image_alt: string;
          metric: string;
          metric_label: string;
          sort_order?: number;
          specialty: string;
          summary: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          after?: string;
          before?: string;
          created_at?: string;
          detail?: string;
          detail_title?: string;
          featured?: boolean;
          icon?: string;
          id?: string;
          image?: string;
          image_alt?: string;
          metric?: string;
          metric_label?: string;
          sort_order?: number;
          specialty?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string;
          status?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database['public']['Enums']['app_role'];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database['public']['Enums']['app_role'];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'admin' | 'user';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

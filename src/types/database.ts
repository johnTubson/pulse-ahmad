export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          colour: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          colour?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          colour?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          note: string | null;
          expense_date: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          note?: string | null;
          expense_date: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          note?: string | null;
          expense_date?: string;
          image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      moods: {
        Row: {
          id: string;
          user_id: string;
          expense_id: string | null;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expense_id?: string | null;
          value: number;
          created_at?: string;
        };
        Update: {
          expense_id?: string | null;
          value?: number;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount_limit: number;
          period: 'monthly';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          amount_limit: number;
          period?: 'monthly';
          created_at?: string;
        };
        Update: {
          category_id?: string | null;
          amount_limit?: number;
        };
        Relationships: [];
      };
      personality_profiles: {
        Row: {
          id: string;
          user_id: string;
          personality_type: string;
          confidence: number;
          computed_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          personality_type: string;
          confidence: number;
          computed_at?: string;
          metadata?: Json;
        };
        Update: {
          personality_type?: string;
          confidence?: number;
          computed_at?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      daily_summaries: {
        Row: {
          id: string;
          user_id: string;
          summary_date: string;
          total_spent: number;
          total_income: number;
          avg_mood: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          summary_date: string;
          total_spent?: number;
          total_income?: number;
          avg_mood?: number | null;
          created_at?: string;
        };
        Update: {
          total_spent?: number;
          total_income?: number;
          avg_mood?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

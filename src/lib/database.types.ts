/**
 * CraftFlow — типы БД (Product Book §10 «Модель данных»)
 * Синхронизировано с supabase/sql/apply_schema.sql
 */

export type UserRole = "master" | "client" | "both";

export type OrderStatus =
  | "pending"
  | "active"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";

export type EscrowStatus = "held" | "released" | "refunded";

export type StageStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "revision";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          telegram_id: number | null;
          name: string;
          avatar_url: string | null;
          role: UserRole;
          platform_origin: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          telegram_id?: number | null;
          name: string;
          avatar_url?: string | null;
          role?: UserRole;
          platform_origin?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          telegram_id?: number | null;
          name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          platform_origin?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      masters: {
        Row: {
          id: string;
          user_id: string;
          categories: string[];
          bio: string;
          portfolio_urls: string[] | null;
          price_from: number;
          rating: number | null;
          reviews_count: number;
          is_pro: boolean;
          is_verified: boolean;
          promoted_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          categories: string[];
          bio: string;
          portfolio_urls?: string[] | null;
          price_from: number;
          rating?: number | null;
          reviews_count?: number;
          is_pro?: boolean;
          is_verified?: boolean;
          promoted_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          categories?: string[];
          bio?: string;
          portfolio_urls?: string[] | null;
          price_from?: number;
          rating?: number | null;
          reviews_count?: number;
          is_pro?: boolean;
          is_verified?: boolean;
          promoted_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "masters_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          client_id: string;
          master_id: string;
          title: string;
          description: string;
          reference_urls: string[] | null;
          budget: number;
          deadline: string;
          status: OrderStatus;
          escrow_id: string | null;
          escrow_status: EscrowStatus | null;
          platform_origin: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          master_id: string;
          title: string;
          description: string;
          reference_urls?: string[] | null;
          budget: number;
          deadline: string;
          status?: OrderStatus;
          escrow_id?: string | null;
          escrow_status?: EscrowStatus | null;
          platform_origin?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          master_id?: string;
          title?: string;
          description?: string;
          reference_urls?: string[] | null;
          budget?: number;
          deadline?: string;
          status?: OrderStatus;
          escrow_id?: string | null;
          escrow_status?: EscrowStatus | null;
          platform_origin?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "masters";
            referencedColumns: ["id"];
          },
        ];
      };
      order_stages: {
        Row: {
          id: string;
          order_id: string;
          name: string;
          status: StageStatus;
          files_urls: string[] | null;
          comment: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          name: string;
          status?: StageStatus;
          files_urls?: string[] | null;
          comment?: string | null;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          name?: string;
          status?: StageStatus;
          files_urls?: string[] | null;
          comment?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_stages_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          order_id: string;
          sender_id: string;
          body: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender_id: string;
          body?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          sender_id?: string;
          body?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          reviewer_id: string;
          master_id: string;
          rating: number;
          text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          reviewer_id: string;
          master_id: string;
          rating: number;
          text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          reviewer_id?: string;
          master_id?: string;
          rating?: number;
          text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "masters";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      escrow_status: EscrowStatus;
      stage_status: StageStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

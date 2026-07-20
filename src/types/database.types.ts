export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dream_results: {
        Row: {
          analysis_status: string
          analysis_text: string | null
          created_at: string
          id: string
          image_url: string | null
          is_public: boolean
          order_id: string
          updated_at: string
        }
        Insert: {
          analysis_status?: string
          analysis_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_public?: boolean
          order_id: string
          updated_at?: string
        }
        Update: {
          analysis_status?: string
          analysis_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_public?: boolean
          order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          dream_content: string | null
          expert_field: string | null
          id: string
          includes_image: boolean
          order_number: string
          order_type: string
          payment_status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_content?: string | null
          expert_field?: string | null
          id?: string
          includes_image?: boolean
          order_number: string
          order_type: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_content?: string | null
          expert_field?: string | null
          id?: string
          includes_image?: boolean
          order_number?: string
          order_type?: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pass_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          approved_at: string | null
          canceled_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          method: string | null
          order_id: string
          payment_key: string | null
          raw_response: Json | null
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          canceled_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          order_id: string
          payment_key?: string | null
          raw_response?: Json | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          canceled_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          order_id?: string
          payment_key?: string | null
          raw_response?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          guest_password_hash: string | null
          id: string
          nickname: string | null
          phone_number: string | null
          provider: string
          remaining_interprets: number
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          guest_password_hash?: string | null
          id: string
          nickname?: string | null
          phone_number?: string | null
          provider?: string
          remaining_interprets?: number
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          guest_password_hash?: string | null
          id?: string
          nickname?: string | null
          phone_number?: string | null
          provider?: string
          remaining_interprets?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

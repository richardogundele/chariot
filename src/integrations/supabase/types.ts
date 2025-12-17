export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_executions: {
        Row: {
          agent_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string
          workflow_id: string
        }
        Insert: {
          agent_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
          workflow_id: string
        }
        Update: {
          agent_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_templates: {
        Row: {
          agent_type: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          agent_type: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          system_prompt: string
          updated_at?: string
        }
        Update: {
          agent_type?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_workflows: {
        Row: {
          completed_at: string | null
          created_at: string
          current_agent: string | null
          id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
          workflow_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_agent?: string | null
          id?: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
          workflow_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_agent?: string | null
          id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_data?: Json | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          created_at: string
          id: string
          is_user: boolean
          message: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_user?: boolean
          message: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_user?: boolean
          message?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_key_audit: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          key_name: string
          operation: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          key_name: string
          operation: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          key_name?: string
          operation?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_name: string
          key_value: string
          last_updated: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key_name: string
          key_value: string
          last_updated?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key_name?: string
          key_value?: string
          last_updated?: string
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          meta_data: Json | null
          name: string
          platform: string
          product_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          meta_data?: Json | null
          name: string
          platform: string
          product_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          meta_data?: Json | null
          name?: string
          platform?: string
          product_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_copy: {
        Row: {
          copywriter_style: string
          created_at: string
          generated_content: Json
          id: string
          product_description: string
          product_id: string | null
          product_name: string
          user_id: string
        }
        Insert: {
          copywriter_style: string
          created_at?: string
          generated_content: Json
          id?: string
          product_description: string
          product_id?: string | null
          product_name: string
          user_id: string
        }
        Update: {
          copywriter_style?: string
          created_at?: string
          generated_content?: Json
          id?: string
          product_description?: string
          product_id?: string | null
          product_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_copy_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string | null
          prompt: string
          style: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id?: string | null
          prompt: string
          style?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string | null
          prompt?: string
          style?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          connected: boolean
          created_at: string
          credentials: Json
          id: string
          last_updated: string
          platform: string
          user_id: string
        }
        Insert: {
          connected?: boolean
          created_at?: string
          credentials?: Json
          id?: string
          last_updated?: string
          platform: string
          user_id: string
        }
        Update: {
          connected?: boolean
          created_at?: string
          credentials?: Json
          id?: string
          last_updated?: string
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          ad_copy: string | null
          created_at: string
          deleted: boolean | null
          description: string
          id: string
          image_url: string | null
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_copy?: string | null
          created_at?: string
          deleted?: boolean | null
          description: string
          id?: string
          image_url?: string | null
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_copy?: string | null
          created_at?: string
          deleted?: boolean | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_letters: {
        Row: {
          content: string
          created_at: string
          id: string
          product_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          product_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          product_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          job_title: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          created_at: string
          id: string
          recommendation_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommendation_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recommendation_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          content_marketing_count: number
          copies_count: number
          created_at: string
          id: string
          images_count: number
          period_start: string
          products_count: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_marketing_count?: number
          copies_count?: number
          created_at?: string
          id?: string
          images_count?: number
          period_start?: string
          products_count?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_marketing_count?: number
          copies_count?: number
          created_at?: string
          id?: string
          images_count?: number
          period_start?: string
          products_count?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_increment_usage: {
        Args: { p_usage_type: string; p_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_copy_generation: {
        Args: {
          p_copy_type: string
          p_generated_copy: string
          p_product_id: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

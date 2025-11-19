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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      delegation_assessments: {
        Row: {
          ai_insights: string | null
          created_at: string
          delegation_barriers: string | null
          draining_tasks: string | null
          id: string
          tasks_not_delegating: string | null
          team_members: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          created_at?: string
          delegation_barriers?: string | null
          draining_tasks?: string | null
          id?: string
          tasks_not_delegating?: string | null
          team_members?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          created_at?: string
          delegation_barriers?: string | null
          draining_tasks?: string | null
          id?: string
          tasks_not_delegating?: string | null
          team_members?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegation_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delegation_plans: {
        Row: {
          assessment_id: string | null
          autonomy_level: string | null
          check_in_schedule: string | null
          context: string | null
          created_at: string
          deadline: string | null
          handoff_message: string | null
          id: string
          outcome: string | null
          risks: string[] | null
          status: string
          success_criteria: string[] | null
          support_needed: string | null
          task_importance: string | null
          task_name: string
          team_member: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          autonomy_level?: string | null
          check_in_schedule?: string | null
          context?: string | null
          created_at?: string
          deadline?: string | null
          handoff_message?: string | null
          id?: string
          outcome?: string | null
          risks?: string[] | null
          status?: string
          success_criteria?: string[] | null
          support_needed?: string | null
          task_importance?: string | null
          task_name: string
          team_member?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          autonomy_level?: string | null
          check_in_schedule?: string | null
          context?: string | null
          created_at?: string
          deadline?: string | null
          handoff_message?: string | null
          id?: string
          outcome?: string | null
          risks?: string[] | null
          status?: string
          success_criteria?: string[] | null
          support_needed?: string | null
          task_importance?: string | null
          task_name?: string
          team_member?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegation_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "delegation_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegation_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          check_in_date: string
          completed: boolean
          created_at: string
          delegation_plan_id: string
          frequency: string
          id: string
          reflection_notes: string | null
          reminder_sent: boolean
          user_id: string
        }
        Insert: {
          check_in_date: string
          completed?: boolean
          created_at?: string
          delegation_plan_id: string
          frequency: string
          id?: string
          reflection_notes?: string | null
          reminder_sent?: boolean
          user_id: string
        }
        Update: {
          check_in_date?: string
          completed?: boolean
          created_at?: string
          delegation_plan_id?: string
          frequency?: string
          id?: string
          reflection_notes?: string | null
          reminder_sent?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_delegation_plan_id_fkey"
            columns: ["delegation_plan_id"]
            isOneToOne: false
            referencedRelation: "delegation_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          team_size: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          team_size?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          team_size?: number | null
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
    Enums: {},
  },
} as const

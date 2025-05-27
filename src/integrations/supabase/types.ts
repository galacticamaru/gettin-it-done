export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      task_due_date: {
        Row: {
          created_at: string
          due_date_configuration: string | null
          due_date_id: number
        }
        Insert: {
          created_at?: string
          due_date_configuration?: string | null
          due_date_id?: number
        }
        Update: {
          created_at?: string
          due_date_configuration?: string | null
          due_date_id?: number
        }
        Relationships: []
      }
      task_reminder: {
        Row: {
          created_at: string
          reminder_configuration: Json | null
          reminder_id: number
        }
        Insert: {
          created_at?: string
          reminder_configuration?: Json | null
          reminder_id?: number
        }
        Update: {
          created_at?: string
          reminder_configuration?: Json | null
          reminder_id?: number
        }
        Relationships: []
      }
      task_repeat: {
        Row: {
          created_at: string
          repeat_configuration: Json | null
          repeat_id: number
        }
        Insert: {
          created_at?: string
          repeat_configuration?: Json | null
          repeat_id?: number
        }
        Update: {
          created_at?: string
          repeat_configuration?: Json | null
          repeat_id?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          due_date_id: number | null
          reminder_id: number | null
          repeat_id: number | null
          task_id: number
          task_title: string | null
        }
        Insert: {
          created_at?: string
          due_date_id?: number | null
          reminder_id?: number | null
          repeat_id?: number | null
          task_id?: number
          task_title?: string | null
        }
        Update: {
          created_at?: string
          due_date_id?: number | null
          reminder_id?: number | null
          repeat_id?: number | null
          task_id?: number
          task_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_due_date_id_fkey"
            columns: ["due_date_id"]
            isOneToOne: false
            referencedRelation: "task_due_date"
            referencedColumns: ["due_date_id"]
          },
          {
            foreignKeyName: "tasks_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "task_reminder"
            referencedColumns: ["reminder_id"]
          },
          {
            foreignKeyName: "tasks_repeat_id_fkey"
            columns: ["repeat_id"]
            isOneToOne: false
            referencedRelation: "task_repeat"
            referencedColumns: ["repeat_id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          due_date: string | null
          id: string
          reminder: string | null
          repeat_option: string | null
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          reminder?: string | null
          repeat_option?: string | null
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          reminder?: string | null
          repeat_option?: string | null
          text?: string
          updated_at?: string | null
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

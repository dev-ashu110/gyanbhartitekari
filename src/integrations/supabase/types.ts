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
      pending_role_requests: {
        Row: {
          id: string
          notes: string | null
          requested_at: string
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          requested_at?: string
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          requested_at?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      school_info: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          description: string | null
          established_year: number | null
          id: string
          principal_name: string | null
          school_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          principal_name?: string | null
          school_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          principal_name?: string | null
          school_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_data: {
        Row: {
          achievements: string[] | null
          admission_no: string
          bio: string | null
          class: string
          created_at: string
          github_url: string | null
          id: string
          parent_email: string | null
          parent_phone: string | null
          portfolio_url: string | null
          profile_picture_url: string | null
          roll_no: string
          section: string
          student_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          admission_no: string
          bio?: string | null
          class: string
          created_at?: string
          github_url?: string | null
          id?: string
          parent_email?: string | null
          parent_phone?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          roll_no: string
          section: string
          student_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          admission_no?: string
          bio?: string | null
          class?: string
          created_at?: string
          github_url?: string | null
          id?: string
          parent_email?: string | null
          parent_phone?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          roll_no?: string
          section?: string
          student_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      student_portfolios: {
        Row: {
          assignment_type: string | null
          created_at: string
          description: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          student_id: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_type?: string | null
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_portfolios_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_portfolios_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_data_for_teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_portfolios_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          project_url: string | null
          student_id: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          student_id?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          student_id?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_data_for_teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          display_order: number | null
          experience_years: number | null
          id: string
          name: string
          photo_url: string | null
          qualification: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          experience_years?: number | null
          id?: string
          name: string
          photo_url?: string | null
          qualification?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          experience_years?: number | null
          id?: string
          name?: string
          photo_url?: string | null
          qualification?: string | null
          subject?: string
          updated_at?: string | null
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
    }
    Views: {
      student_data_for_teachers: {
        Row: {
          achievements: string[] | null
          admission_no: string | null
          bio: string | null
          class: string | null
          created_at: string | null
          github_url: string | null
          id: string | null
          portfolio_url: string | null
          profile_picture_url: string | null
          roll_no: string | null
          section: string | null
          student_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          admission_no?: string | null
          bio?: string | null
          class?: string | null
          created_at?: string | null
          github_url?: string | null
          id?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          roll_no?: string | null
          section?: string | null
          student_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          admission_no?: string | null
          bio?: string | null
          class?: string | null
          created_at?: string | null
          github_url?: string | null
          id?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          roll_no?: string | null
          section?: string | null
          student_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_portfolios_public: {
        Row: {
          assignment_type: string | null
          created_at: string | null
          description: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string | null
          subject: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_public_profiles: {
        Row: {
          achievements: string[] | null
          admission_no: string | null
          bio: string | null
          class: string | null
          github_url: string | null
          id: string | null
          portfolio_url: string | null
          profile_picture_url: string | null
          section: string | null
          student_name: string | null
        }
        Insert: {
          achievements?: string[] | null
          admission_no?: string | null
          bio?: string | null
          class?: string | null
          github_url?: string | null
          id?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          section?: string | null
          student_name?: string | null
        }
        Update: {
          achievements?: string[] | null
          admission_no?: string | null
          bio?: string | null
          class?: string | null
          github_url?: string | null
          id?: string | null
          portfolio_url?: string | null
          profile_picture_url?: string | null
          section?: string | null
          student_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "visitor"
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
      app_role: ["admin", "teacher", "student", "visitor"],
    },
  },
} as const

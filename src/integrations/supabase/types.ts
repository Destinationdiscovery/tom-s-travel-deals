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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cached_reviews: {
        Row: {
          created_at: string
          id: string
          location: string | null
          property_name: string
          property_type: string | null
          review_data: Json
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          property_name: string
          property_type?: string | null
          review_data: Json
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          property_name?: string
          property_type?: string | null
          review_data?: Json
          slug?: string
        }
        Relationships: []
      }
      gear_intel_cache: {
        Row: {
          cache_key: string
          created_at: string
          id: string
          intel_type: string
          query: string
          result_data: Json
        }
        Insert: {
          cache_key: string
          created_at?: string
          id?: string
          intel_type: string
          query: string
          result_data: Json
        }
        Update: {
          cache_key?: string
          created_at?: string
          id?: string
          intel_type?: string
          query?: string
          result_data?: Json
        }
        Relationships: []
      }
      gear_product_images: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          product_keyword: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          product_keyword: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          product_keyword?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          newsletter_opt_in: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          newsletter_opt_in?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          newsletter_opt_in?: boolean
        }
        Relationships: []
      }
      search_suggestions: {
        Row: {
          created_at: string
          id: string
          name: string
          property_type: string | null
          search_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_type?: string | null
          search_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_type?: string | null
          search_count?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source_slug: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source_slug?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source_slug?: string | null
        }
        Relationships: []
      }
      travel_intel_cache: {
        Row: {
          cache_key: string
          citizenship: string | null
          created_at: string
          destination: string
          id: string
          intel_type: string
          result_data: Json
        }
        Insert: {
          cache_key: string
          citizenship?: string | null
          created_at?: string
          destination: string
          id?: string
          intel_type: string
          result_data: Json
        }
        Update: {
          cache_key?: string
          citizenship?: string | null
          created_at?: string
          destination?: string
          id?: string
          intel_type?: string
          result_data?: Json
        }
        Relationships: []
      }
      user_review_history: {
        Row: {
          id: string
          location: string | null
          property_name: string
          slug: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          location?: string | null
          property_name: string
          slug: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          location?: string | null
          property_name?: string
          slug?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      user_saved_reviews: {
        Row: {
          best_for: string[]
          created_at: string
          id: string
          location: string | null
          overall_rating: number
          property_name: string
          ratings: Json
          slug: string
          summary: string
          trip_name: string | null
          user_id: string
        }
        Insert: {
          best_for?: string[]
          created_at?: string
          id?: string
          location?: string | null
          overall_rating: number
          property_name: string
          ratings?: Json
          slug: string
          summary?: string
          trip_name?: string | null
          user_id: string
        }
        Update: {
          best_for?: string[]
          created_at?: string
          id?: string
          location?: string | null
          overall_rating?: number
          property_name?: string
          ratings?: Json
          slug?: string
          summary?: string
          trip_name?: string | null
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

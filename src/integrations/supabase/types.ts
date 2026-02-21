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
      booking_details: {
        Row: {
          agency: string | null
          balance_due: number | null
          balance_due_date: string | null
          bed_configuration: string | null
          booking_agent: string | null
          booking_number: string
          booking_status: string | null
          cabin_category: string | null
          cabin_number: string | null
          client_email: string | null
          client_name: string | null
          created_at: string
          cruise_line_booking_number: string | null
          deck: string | null
          destination: string | null
          duration_nights: number | null
          extras: Json | null
          flight_details: Json | null
          id: string
          itinerary: Json | null
          num_travellers: number | null
          passengers: Json | null
          payment_history: Json | null
          pricing: Json | null
          rate_code: string | null
          resort_name: string | null
          room_type: string | null
          ship_name: string | null
          supplier: string | null
          trip_group_id: string | null
          updated_at: string
        }
        Insert: {
          agency?: string | null
          balance_due?: number | null
          balance_due_date?: string | null
          bed_configuration?: string | null
          booking_agent?: string | null
          booking_number: string
          booking_status?: string | null
          cabin_category?: string | null
          cabin_number?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          cruise_line_booking_number?: string | null
          deck?: string | null
          destination?: string | null
          duration_nights?: number | null
          extras?: Json | null
          flight_details?: Json | null
          id?: string
          itinerary?: Json | null
          num_travellers?: number | null
          passengers?: Json | null
          payment_history?: Json | null
          pricing?: Json | null
          rate_code?: string | null
          resort_name?: string | null
          room_type?: string | null
          ship_name?: string | null
          supplier?: string | null
          trip_group_id?: string | null
          updated_at?: string
        }
        Update: {
          agency?: string | null
          balance_due?: number | null
          balance_due_date?: string | null
          bed_configuration?: string | null
          booking_agent?: string | null
          booking_number?: string
          booking_status?: string | null
          cabin_category?: string | null
          cabin_number?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          cruise_line_booking_number?: string | null
          deck?: string | null
          destination?: string | null
          duration_nights?: number | null
          extras?: Json | null
          flight_details?: Json | null
          id?: string
          itinerary?: Json | null
          num_travellers?: number | null
          passengers?: Json | null
          payment_history?: Json | null
          pricing?: Json | null
          rate_code?: string | null
          resort_name?: string | null
          room_type?: string | null
          ship_name?: string | null
          supplier?: string | null
          trip_group_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_number: string | null
          client_email: string | null
          client_name: string
          created_at: string
          event_date: string
          event_type: Database["public"]["Enums"]["booking_event_type"]
          id: string
          is_completed: boolean | null
          notes: string | null
          quote_id: string | null
          supplier: string | null
          title: string
        }
        Insert: {
          booking_number?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          event_date: string
          event_type: Database["public"]["Enums"]["booking_event_type"]
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          quote_id?: string | null
          supplier?: string | null
          title: string
        }
        Update: {
          booking_number?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          event_date?: string
          event_type?: Database["public"]["Enums"]["booking_event_type"]
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          quote_id?: string | null
          supplier?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "client_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
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
      client_quotes: {
        Row: {
          check_in: string | null
          check_out: string | null
          client_email: string | null
          client_name: string
          created_at: string
          currency: string | null
          destination: string | null
          flight_details: Json | null
          id: string
          include_review: boolean | null
          line_items: Json | null
          notes: string | null
          num_travellers: number | null
          resort_name: string
          resort_review_slug: string | null
          review_data: Json | null
          share_token: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          total_price: number | null
          updated_at: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          currency?: string | null
          destination?: string | null
          flight_details?: Json | null
          id?: string
          include_review?: boolean | null
          line_items?: Json | null
          notes?: string | null
          num_travellers?: number | null
          resort_name: string
          resort_review_slug?: string | null
          review_data?: Json | null
          share_token?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          currency?: string | null
          destination?: string | null
          flight_details?: Json | null
          id?: string
          include_review?: boolean | null
          line_items?: Json | null
          notes?: string | null
          num_travellers?: number | null
          resort_name?: string
          resort_review_slug?: string | null
          review_data?: Json | null
          share_token?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          booking_id: string | null
          client_email: string | null
          client_name: string
          created_at: string
          email_type: Database["public"]["Enums"]["email_type"]
          id: string
          quote_id: string | null
          subject: string
        }
        Insert: {
          booking_id?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          email_type: Database["public"]["Enums"]["email_type"]
          id?: string
          quote_id?: string | null
          subject: string
        }
        Update: {
          booking_id?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          email_type?: Database["public"]["Enums"]["email_type"]
          id?: string
          quote_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_log_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "client_quotes"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_event_type:
        | "booking"
        | "final_payment"
        | "departure"
        | "return"
        | "deposit_due"
        | "trip_start"
        | "trip_end"
      email_type: "quote" | "followup" | "pre_departure" | "after_trip"
      quote_status: "draft" | "sent" | "accepted" | "expired" | "booked"
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
      booking_event_type: [
        "booking",
        "final_payment",
        "departure",
        "return",
        "deposit_due",
        "trip_start",
        "trip_end",
      ],
      email_type: ["quote", "followup", "pre_departure", "after_trip"],
      quote_status: ["draft", "sent", "accepted", "expired", "booked"],
    },
  },
} as const

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
      affiliate_clicks: {
        Row: {
          country: string | null
          created_at: string
          id: string
          page: string
          platform: string
          position: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          page: string
          platform: string
          position?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          page?: string
          platform?: string
          position?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      agent_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
        }
        Relationships: []
      }
      agent_quick_links: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          label: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          label: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: []
      }
      banner_deals: {
        Row: {
          affiliate_url: string
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          sale_label: string | null
          slot_number: number
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          sale_label?: string | null
          slot_number: number
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sale_label?: string | null
          slot_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          category_color: string
          created_at: string
          date_published: string
          excerpt: string | null
          faq_items: Json | null
          hero_image_url: string | null
          id: string
          internal_links: Json | null
          primary_keyword: string | null
          read_time: string
          rich_content: Json
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          category_color?: string
          created_at?: string
          date_published?: string
          excerpt?: string | null
          faq_items?: Json | null
          hero_image_url?: string | null
          id?: string
          internal_links?: Json | null
          primary_keyword?: string | null
          read_time?: string
          rich_content?: Json
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          category_color?: string
          created_at?: string
          date_published?: string
          excerpt?: string | null
          faq_items?: Json | null
          hero_image_url?: string | null
          id?: string
          internal_links?: Json | null
          primary_keyword?: string | null
          read_time?: string
          rich_content?: Json
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          commission: number | null
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
          report_markdown: string | null
          resort_name: string | null
          room_type: string | null
          rooms: Json | null
          ship_name: string | null
          supplier: string | null
          total_value: number | null
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
          commission?: number | null
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
          report_markdown?: string | null
          resort_name?: string | null
          room_type?: string | null
          rooms?: Json | null
          ship_name?: string | null
          supplier?: string | null
          total_value?: number | null
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
          commission?: number | null
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
          report_markdown?: string | null
          resort_name?: string | null
          room_type?: string | null
          rooms?: Json | null
          ship_name?: string | null
          supplier?: string | null
          total_value?: number | null
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
          best_for: string[] | null
          created_at: string
          date_visited: string | null
          duration: string | null
          full_review: string[] | null
          gallery_urls: string[] | null
          id: string
          location: string | null
          property_name: string
          property_type: string | null
          ratings: Json | null
          review_data: Json
          slug: string
          tips: string[] | null
          video_url: string | null
        }
        Insert: {
          best_for?: string[] | null
          created_at?: string
          date_visited?: string | null
          duration?: string | null
          full_review?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          location?: string | null
          property_name: string
          property_type?: string | null
          ratings?: Json | null
          review_data: Json
          slug: string
          tips?: string[] | null
          video_url?: string | null
        }
        Update: {
          best_for?: string[] | null
          created_at?: string
          date_visited?: string | null
          duration?: string | null
          full_review?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          location?: string | null
          property_name?: string
          property_type?: string | null
          ratings?: Json | null
          review_data?: Json
          slug?: string
          tips?: string[] | null
          video_url?: string | null
        }
        Relationships: []
      }
      client_quotes: {
        Row: {
          attachment_urls: string[] | null
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
          inclusions: string[] | null
          line_items: Json | null
          notes: string | null
          num_travellers: number | null
          quote_markdown: string | null
          resort_name: string
          resort_review_slug: string | null
          review_data: Json | null
          room_type: string | null
          share_token: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          summary: string | null
          total_price: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          attachment_urls?: string[] | null
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
          inclusions?: string[] | null
          line_items?: Json | null
          notes?: string | null
          num_travellers?: number | null
          quote_markdown?: string | null
          resort_name: string
          resort_review_slug?: string | null
          review_data?: Json | null
          room_type?: string | null
          share_token?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          summary?: string | null
          total_price?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          attachment_urls?: string[] | null
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
          inclusions?: string[] | null
          line_items?: Json | null
          notes?: string | null
          num_travellers?: number | null
          quote_markdown?: string | null
          resort_name?: string
          resort_review_slug?: string | null
          review_data?: Json | null
          room_type?: string | null
          share_token?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          summary?: string | null
          total_price?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          page_slug: string
          page_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          page_slug: string
          page_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          page_slug?: string
          page_type?: string
          user_id?: string
        }
        Relationships: []
      }
      compass_destinations_log: {
        Row: {
          destination: string
          id: string
          used_at: string
          used_in_edition: number | null
        }
        Insert: {
          destination: string
          id?: string
          used_at?: string
          used_in_edition?: number | null
        }
        Update: {
          destination?: string
          id?: string
          used_at?: string
          used_in_edition?: number | null
        }
        Relationships: []
      }
      compass_editions: {
        Row: {
          best_time_data: Json | null
          created_at: string
          currency_data: Json | null
          destination: string | null
          destination_data: Json | null
          edition_number: number
          flight_deals_data: Json | null
          full_html: string | null
          full_text: string | null
          generation_metadata: Json | null
          hotel_data: Json | null
          id: string
          issue_date: string
          itinerary_data: Json | null
          mailerlite_campaign_id: string | null
          perplexity_citations: Json | null
          published_at: string | null
          run_id: string | null
          safety_data: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["compass_edition_status"]
          subject_line: string | null
          subject_line_options: string[] | null
          subscriber_count: number | null
          travel_intel_data: Json | null
          updated_at: string
        }
        Insert: {
          best_time_data?: Json | null
          created_at?: string
          currency_data?: Json | null
          destination?: string | null
          destination_data?: Json | null
          edition_number?: number
          flight_deals_data?: Json | null
          full_html?: string | null
          full_text?: string | null
          generation_metadata?: Json | null
          hotel_data?: Json | null
          id?: string
          issue_date?: string
          itinerary_data?: Json | null
          mailerlite_campaign_id?: string | null
          perplexity_citations?: Json | null
          published_at?: string | null
          run_id?: string | null
          safety_data?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["compass_edition_status"]
          subject_line?: string | null
          subject_line_options?: string[] | null
          subscriber_count?: number | null
          travel_intel_data?: Json | null
          updated_at?: string
        }
        Update: {
          best_time_data?: Json | null
          created_at?: string
          currency_data?: Json | null
          destination?: string | null
          destination_data?: Json | null
          edition_number?: number
          flight_deals_data?: Json | null
          full_html?: string | null
          full_text?: string | null
          generation_metadata?: Json | null
          hotel_data?: Json | null
          id?: string
          issue_date?: string
          itinerary_data?: Json | null
          mailerlite_campaign_id?: string | null
          perplexity_citations?: Json | null
          published_at?: string | null
          run_id?: string | null
          safety_data?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["compass_edition_status"]
          subject_line?: string | null
          subject_line_options?: string[] | null
          subscriber_count?: number | null
          travel_intel_data?: Json | null
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
      featured_deals: {
        Row: {
          affiliate_url: string
          created_at: string
          expires_at: string | null
          id: string
          image_position: string | null
          image_url: string
          location: string
          name: string
          original_label: string
          original_label_weekly: string | null
          original_price: number
          original_price_weekly: number | null
          rating: number
          sale_label: string
          sale_label_weekly: string | null
          sale_price: number
          sale_price_weekly: number | null
          slot_number: number
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_position?: string | null
          image_url: string
          location: string
          name: string
          original_label: string
          original_label_weekly?: string | null
          original_price: number
          original_price_weekly?: number | null
          rating?: number
          sale_label: string
          sale_label_weekly?: string | null
          sale_price: number
          sale_price_weekly?: number | null
          slot_number: number
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_position?: string | null
          image_url?: string
          location?: string
          name?: string
          original_label?: string
          original_label_weekly?: string | null
          original_price?: number
          original_price_weekly?: number | null
          rating?: number
          sale_label?: string
          sale_label_weekly?: string | null
          sale_price?: number
          sale_price_weekly?: number | null
          slot_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      featured_gear_cards: {
        Row: {
          affiliate_url: string
          created_at: string
          description: string
          id: string
          image_url: string
          price: string
          slot_number: number
          title: string
          updated_at: string
        }
        Insert: {
          affiliate_url?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          price?: string
          slot_number: number
          title: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          price?: string
          slot_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_gear_reviews: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category: string | null
          cons: string[] | null
          created_at: string
          created_by: string | null
          first_used_at: string | null
          hero_image_url: string | null
          id: string
          is_published: boolean
          notes: string | null
          price_range: string | null
          product_name: string
          pros: string[] | null
          published_at: string | null
          rating: number | null
          slug: string
          sort_order: number
          updated_at: string
          used_on: string | null
          view_count: number
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          cons?: string[] | null
          created_at?: string
          created_by?: string | null
          first_used_at?: string | null
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          notes?: string | null
          price_range?: string | null
          product_name: string
          pros?: string[] | null
          published_at?: string | null
          rating?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
          used_on?: string | null
          view_count?: number
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category?: string | null
          cons?: string[] | null
          created_at?: string
          created_by?: string | null
          first_used_at?: string | null
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          notes?: string | null
          price_range?: string | null
          product_name?: string
          pros?: string[] | null
          published_at?: string | null
          rating?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
          used_on?: string | null
          view_count?: number
        }
        Relationships: []
      }
      featured_packing_list_items: {
        Row: {
          amazon_url: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          label: string
          list_id: string
          notes: string | null
          quantity: number | null
          sort_order: number
        }
        Insert: {
          amazon_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          label: string
          list_id: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number
        }
        Update: {
          amazon_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          label?: string
          list_id?: string
          notes?: string | null
          quantity?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_packing_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "featured_packing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_packing_lists: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean
          narrative: string | null
          published_at: string | null
          season: string | null
          slug: string
          sort_order: number
          source: string
          source_query: string | null
          source_trip_id: string | null
          title: string
          trip_types: string[] | null
          updated_at: string
          view_count: number
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          narrative?: string | null
          published_at?: string | null
          season?: string | null
          slug: string
          sort_order?: number
          source?: string
          source_query?: string | null
          source_trip_id?: string | null
          title: string
          trip_types?: string[] | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          narrative?: string | null
          published_at?: string | null
          season?: string | null
          slug?: string
          sort_order?: number
          source?: string
          source_query?: string | null
          source_trip_id?: string | null
          title?: string
          trip_types?: string[] | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_packing_lists_source_trip_id_fkey"
            columns: ["source_trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_reviews: {
        Row: {
          affiliate_url: string | null
          created_at: string | null
          id: string
          image_url: string | null
          location: string | null
          property_name: string
          rating: number | null
          sale_label: string | null
          slot_number: number
          slug: string
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          property_name: string
          rating?: number | null
          sale_label?: string | null
          slot_number: number
          slug: string
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_url?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          property_name?: string
          rating?: number | null
          sale_label?: string | null
          slot_number?: number
          slug?: string
          summary?: string | null
          updated_at?: string | null
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
      page_view_events: {
        Row: {
          created_at: string
          id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          newsletter_opt_in: boolean
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          newsletter_opt_in?: boolean
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          newsletter_opt_in?: boolean
          username?: string | null
        }
        Relationships: []
      }
      quote_templates: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          inclusions: string[] | null
          line_items: Json | null
          name: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          inclusions?: string[] | null
          line_items?: Json | null
          name: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          inclusions?: string[] | null
          line_items?: Json | null
          name?: string
        }
        Relationships: []
      }
      review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction: string
          session_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction: string
          session_id: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction?: string
          session_id?: string
          slug?: string
        }
        Relationships: []
      }
      review_views: {
        Row: {
          id: string
          last_viewed_at: string
          slug: string
          view_count: number
        }
        Insert: {
          id?: string
          last_viewed_at?: string
          slug: string
          view_count?: number
        }
        Update: {
          id?: string
          last_viewed_at?: string
          slug?: string
          view_count?: number
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
      sessions: {
        Row: {
          duration_seconds: number | null
          first_page: string
          id: string
          is_bounce: boolean | null
          last_activity_at: string | null
          page_count: number | null
          session_id: string
          started_at: string | null
        }
        Insert: {
          duration_seconds?: number | null
          first_page: string
          id?: string
          is_bounce?: boolean | null
          last_activity_at?: string | null
          page_count?: number | null
          session_id: string
          started_at?: string | null
        }
        Update: {
          duration_seconds?: number | null
          first_page?: string
          id?: string
          is_bounce?: boolean | null
          last_activity_at?: string | null
          page_count?: number | null
          session_id?: string
          started_at?: string | null
        }
        Relationships: []
      }
      social_videos: {
        Row: {
          caption: string | null
          created_at: string
          embed_url: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          platform: string
          profile_url: string | null
          review_slug: string | null
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          platform: string
          profile_url?: string | null
          review_slug?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          embed_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          platform?: string
          profile_url?: string | null
          review_slug?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          interests: string[] | null
          source_slug: string | null
          status: Database["public"]["Enums"]["subscriber_status"]
          tags: string[] | null
          unsubscribed_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          interests?: string[] | null
          source_slug?: string | null
          status?: Database["public"]["Enums"]["subscriber_status"]
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          interests?: string[] | null
          source_slug?: string | null
          status?: Database["public"]["Enums"]["subscriber_status"]
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      tool_search_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          hit_count: number
          id: string
          query: string
          result_data: Json
          tool_name: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          hit_count?: number
          id?: string
          query: string
          result_data: Json
          tool_name: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          hit_count?: number
          id?: string
          query?: string
          result_data?: Json
          tool_name?: string
        }
        Relationships: []
      }
      tool_search_events: {
        Row: {
          cache_hit: boolean
          created_at: string
          id: string
          query: string | null
          tool_name: string
        }
        Insert: {
          cache_hit?: boolean
          created_at?: string
          id?: string
          query?: string | null
          tool_name: string
        }
        Update: {
          cache_hit?: boolean
          created_at?: string
          id?: string
          query?: string | null
          tool_name?: string
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
      trip_gear_items: {
        Row: {
          created_at: string
          id: string
          leg_id: string | null
          notes: string | null
          product: Json
          purchased: boolean
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leg_id?: string | null
          notes?: string | null
          product?: Json
          purchased?: boolean
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leg_id?: string | null
          notes?: string | null
          product?: Json
          purchased?: boolean
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_gear_items_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_gear_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_hotel_reviews: {
        Row: {
          cons: string[]
          created_at: string
          id: string
          notes: string | null
          overall_rating: number | null
          pros: string[]
          stayed_from: string | null
          stayed_to: string | null
          trip_hotel_id: string
          updated_at: string
          user_id: string
          verdict: string | null
        }
        Insert: {
          cons?: string[]
          created_at?: string
          id?: string
          notes?: string | null
          overall_rating?: number | null
          pros?: string[]
          stayed_from?: string | null
          stayed_to?: string | null
          trip_hotel_id: string
          updated_at?: string
          user_id: string
          verdict?: string | null
        }
        Update: {
          cons?: string[]
          created_at?: string
          id?: string
          notes?: string | null
          overall_rating?: number | null
          pros?: string[]
          stayed_from?: string | null
          stayed_to?: string | null
          trip_hotel_id?: string
          updated_at?: string
          user_id?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_hotel_reviews_trip_hotel_id_fkey"
            columns: ["trip_hotel_id"]
            isOneToOne: true
            referencedRelation: "trip_hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_hotels: {
        Row: {
          best_for: string[]
          cons: string[]
          created_at: string
          id: string
          leg_id: string | null
          location: string | null
          overall_rating: number | null
          property_name: string
          pros: string[]
          ratings: Json
          slug: string | null
          sort_order: number
          source_url: string | null
          summary: string | null
          top_pick: boolean
          trip_id: string
        }
        Insert: {
          best_for?: string[]
          cons?: string[]
          created_at?: string
          id?: string
          leg_id?: string | null
          location?: string | null
          overall_rating?: number | null
          property_name: string
          pros?: string[]
          ratings?: Json
          slug?: string | null
          sort_order?: number
          source_url?: string | null
          summary?: string | null
          top_pick?: boolean
          trip_id: string
        }
        Update: {
          best_for?: string[]
          cons?: string[]
          created_at?: string
          id?: string
          leg_id?: string | null
          location?: string | null
          overall_rating?: number | null
          property_name?: string
          pros?: string[]
          ratings?: Json
          slug?: string | null
          sort_order?: number
          source_url?: string | null
          summary?: string | null
          top_pick?: boolean
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_hotels_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_hotels_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_itinerary_days: {
        Row: {
          content: Json
          created_at: string
          day_number: number
          id: string
          leg_id: string | null
          trip_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          day_number: number
          id?: string
          leg_id?: string | null
          trip_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          day_number?: number
          id?: string
          leg_id?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_itinerary_days_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_itinerary_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_legs: {
        Row: {
          created_at: string
          destination: string | null
          end_date: string | null
          id: string
          leg_number: number
          name: string
          notes: string | null
          start_date: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          end_date?: string | null
          id?: string
          leg_number: number
          name: string
          notes?: string | null
          start_date?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          end_date?: string | null
          id?: string
          leg_number?: number
          name?: string
          notes?: string | null
          start_date?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_legs_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_logistics: {
        Row: {
          best_time: Json | null
          best_time_confirmed: boolean
          currency: Json | null
          currency_checked: boolean
          flights: Json | null
          id: string
          leg_id: string | null
          safety: Json | null
          safety_checked: boolean
          trip_id: string
          updated_at: string
          visa: Json | null
          visa_checked: boolean
        }
        Insert: {
          best_time?: Json | null
          best_time_confirmed?: boolean
          currency?: Json | null
          currency_checked?: boolean
          flights?: Json | null
          id?: string
          leg_id?: string | null
          safety?: Json | null
          safety_checked?: boolean
          trip_id: string
          updated_at?: string
          visa?: Json | null
          visa_checked?: boolean
        }
        Update: {
          best_time?: Json | null
          best_time_confirmed?: boolean
          currency?: Json | null
          currency_checked?: boolean
          flights?: Json | null
          id?: string
          leg_id?: string | null
          safety?: Json | null
          safety_checked?: boolean
          trip_id?: string
          updated_at?: string
          visa?: Json | null
          visa_checked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "trip_logistics_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_logistics_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_packing_items: {
        Row: {
          checked: boolean
          created_at: string
          id: string
          label: string
          leg_id: string | null
          notes: string | null
          sort_order: number
          trip_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          id?: string
          label: string
          leg_id?: string | null
          notes?: string | null
          sort_order?: number
          trip_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          id?: string
          label?: string
          leg_id?: string | null
          notes?: string | null
          sort_order?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_packing_items_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_packing_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_transit: {
        Row: {
          distance_meters: number | null
          duration_seconds: number | null
          from_address: string | null
          from_leg_id: string
          id: string
          mode: string
          options: Json | null
          to_address: string | null
          to_leg_id: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          distance_meters?: number | null
          duration_seconds?: number | null
          from_address?: string | null
          from_leg_id: string
          id?: string
          mode?: string
          options?: Json | null
          to_address?: string | null
          to_leg_id: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          distance_meters?: number | null
          duration_seconds?: number | null
          from_address?: string | null
          from_leg_id?: string
          id?: string
          mode?: string
          options?: Json | null
          to_address?: string | null
          to_leg_id?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_transit_from_leg_id_fkey"
            columns: ["from_leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_transit_to_leg_id_fkey"
            columns: ["to_leg_id"]
            isOneToOne: false
            referencedRelation: "trip_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_transit_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          author_display_name: string | null
          cover_image_url: string | null
          created_at: string
          destination: string | null
          end_date: string | null
          hidden_by_admin: boolean
          id: string
          is_multi_destination: boolean
          is_published: boolean
          list_in_gallery: boolean
          notes: string | null
          public_slug: string | null
          published_at: string | null
          share_count: number
          share_token: string
          slug: string
          start_date: string | null
          status: string
          trip_name: string
          trip_type: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          author_display_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          destination?: string | null
          end_date?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_multi_destination?: boolean
          is_published?: boolean
          list_in_gallery?: boolean
          notes?: string | null
          public_slug?: string | null
          published_at?: string | null
          share_count?: number
          share_token?: string
          slug: string
          start_date?: string | null
          status?: string
          trip_name: string
          trip_type?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          author_display_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          destination?: string | null
          end_date?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_multi_destination?: boolean
          is_published?: boolean
          list_in_gallery?: boolean
          notes?: string | null
          public_slug?: string | null
          published_at?: string | null
          share_count?: number
          share_token?: string
          slug?: string
          start_date?: string | null
          status?: string
          trip_name?: string
          trip_type?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
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
      web_vitals: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          page: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          page: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          page?: string
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_sent_compass_edition: {
        Args: never
        Returns: {
          destination: string
          edition_number: number
          full_html: string
          id: string
          issue_date: string
          subject_line: string
        }[]
      }
      get_public_trip: { Args: { _slug: string }; Returns: Json }
      get_quote_by_share_token: {
        Args: { _token: string }
        Returns: {
          attachment_urls: string[]
          check_in: string
          check_out: string
          client_name: string
          created_at: string
          currency: string
          destination: string
          flight_details: Json
          id: string
          include_review: boolean
          inclusions: string[]
          line_items: Json
          notes: string
          num_travellers: number
          quote_markdown: string
          resort_name: string
          resort_review_slug: string
          review_data: Json
          room_type: string
          share_token: string
          status: Database["public"]["Enums"]["quote_status"]
          summary: string
          total_price: number
          updated_at: string
          valid_until: string
        }[]
      }
      get_shared_trip: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_trip_share: { Args: { _slug: string }; Returns: undefined }
      increment_trip_view: { Args: { _slug: string }; Returns: undefined }
      list_public_trips: {
        Args: { _destination?: string; _limit?: number; _offset?: number }
        Returns: {
          author_display_name: string
          cover_image_url: string
          destination: string
          end_date: string
          hotel_count: number
          id: string
          public_slug: string
          published_at: string
          share_count: number
          start_date: string
          trip_name: string
          trip_type: string
          view_count: number
        }[]
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
      compass_edition_status: "generating" | "draft" | "ready" | "sent"
      email_type: "quote" | "followup" | "pre_departure" | "after_trip"
      quote_status: "draft" | "sent" | "accepted" | "expired" | "booked"
      subscriber_status: "active" | "unsubscribed" | "bounced"
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
      compass_edition_status: ["generating", "draft", "ready", "sent"],
      email_type: ["quote", "followup", "pre_departure", "after_trip"],
      quote_status: ["draft", "sent", "accepted", "expired", "booked"],
      subscriber_status: ["active", "unsubscribed", "bounced"],
    },
  },
} as const

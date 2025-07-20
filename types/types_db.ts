export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      article_media: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          media_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          media_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_media_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          created_at: string
          tag_id: number
        }
        Insert: {
          article_id: string
          created_at?: string
          tag_id: number
        }
        Update: {
          article_id?: string
          created_at?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_view_tracking: {
        Row: {
          article_id: string
          ip_address: string
          viewed_at: string
        }
        Insert: {
          article_id: string
          ip_address: string
          viewed_at?: string
        }
        Update: {
          article_id?: string
          ip_address?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_view_tracking_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category_id: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string | null
          views: number
        }
        Insert: {
          author_id?: string | null
          category_id?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          slug: string
          status: string
          summary: string
          title: string
          updated_at?: string | null
          views?: number
        }
        Update: {
          author_id?: string | null
          category_id?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string | null
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_articles_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      individuals: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          original_name: string | null
          ranking: string | null
          slug: string
          status: string
          type_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          original_name?: string | null
          ranking?: string | null
          slug: string
          status?: string
          type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          original_name?: string | null
          ranking?: string | null
          slug?: string
          status?: string
          type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individuals_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          executed_at: string | null
          id: string
          operation: string
          rows_affected: number | null
        }
        Insert: {
          executed_at?: string | null
          id?: string
          operation: string
          rows_affected?: number | null
        }
        Update: {
          executed_at?: string | null
          id?: string
          operation?: string
          rows_affected?: number | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          audio_album: string | null
          audio_album_artist: string | null
          audio_artist: string | null
          audio_comment: string | null
          audio_composer: string | null
          audio_duration: number | null
          audio_genre: string | null
          audio_title: string | null
          audio_track_number: string | null
          audio_year: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          has_cover_art: boolean | null
          id: string
          media_type: string
          mime_type: string
          original_name: string
          slug: string
          transcription: string | null
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          audio_album?: string | null
          audio_album_artist?: string | null
          audio_artist?: string | null
          audio_comment?: string | null
          audio_composer?: string | null
          audio_duration?: number | null
          audio_genre?: string | null
          audio_title?: string | null
          audio_track_number?: string | null
          audio_year?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          has_cover_art?: boolean | null
          id?: string
          media_type: string
          mime_type: string
          original_name: string
          slug: string
          transcription?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          audio_album?: string | null
          audio_album_artist?: string | null
          audio_artist?: string | null
          audio_comment?: string | null
          audio_composer?: string | null
          audio_duration?: number | null
          audio_genre?: string | null
          audio_title?: string | null
          audio_track_number?: string | null
          audio_year?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          has_cover_art?: boolean | null
          id?: string
          media_type?: string
          mime_type?: string
          original_name?: string
          slug?: string
          transcription?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          category_id: number | null
          content: string
          created_at: string | null
          id: number
          image_url: string | null
          slug: string
          source: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: number | null
          content: string
          created_at?: string | null
          id?: number
          image_url?: string | null
          slug: string
          source?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: number | null
          content?: string
          created_at?: string | null
          id?: number
          image_url?: string | null
          slug?: string
          source?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role_id: number | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: number
          label: string | null
          order: number | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          label?: string | null
          order?: number | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          label?: string | null
          order?: number | null
          value?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          owner_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      types: {
        Row: {
          classification: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          classification?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          classification?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          from_number: string
          id: number
          message: string | null
          message_id: string
          read_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          from_number: string
          id?: number
          message?: string | null
          message_id: string
          read_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          from_number?: string
          id?: number
          message?: string | null
          message_id?: string
          read_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_view_tracking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_article_views: {
        Args: { article_slug: string; viewer_ip: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_author: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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

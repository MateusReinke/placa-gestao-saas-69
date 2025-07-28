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
      clients: {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string | null
          created_by: string
          document: string
          email: string | null
          id: string
          name: string
          phone: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          created_by: string
          document: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          created_by?: string
          document?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          last_updated: string | null
          layout_data: Json
          user_id: string
        }
        Insert: {
          last_updated?: string | null
          layout_data: Json
          user_id: string
        }
        Update: {
          last_updated?: string | null
          layout_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          cost_price: number
          created_at: string | null
          id: string
          min_quantity: number
          name: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          category: string
          cost_price: number
          created_at?: string | null
          id?: string
          min_quantity?: number
          name: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost_price?: number
          created_at?: string | null
          id?: string
          min_quantity?: number
          name?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          movement_type: string
          notes: string | null
          order_id: string | null
          quantity: number
          responsible_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          movement_type: string
          notes?: string | null
          order_id?: string | null
          quantity: number
          responsible_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          movement_type?: string
          notes?: string | null
          order_id?: string | null
          quantity?: number
          responsible_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_fila_mensagens: {
        Row: {
          id: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Insert: {
          id?: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Update: {
          id?: number
          id_mensagem?: string
          mensagem?: string
          telefone?: string
          timestamp?: string
        }
        Relationships: []
      }
      n8n_historico_mensagens: {
        Row: {
          created_at: string
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_user_sessions: {
        Row: {
          created_at: string | null
          phone: string
          state: string
        }
        Insert: {
          created_at?: string | null
          phone: string
          state: string
        }
        Update: {
          created_at?: string | null
          phone?: string
          state?: string
        }
        Relationships: []
      }
      order_statuses: {
        Row: {
          active: boolean | null
          color: string
          created_at: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean | null
          color: string
          created_at?: string | null
          id?: string
          name: string
          sort_order: number
        }
        Update: {
          active?: boolean | null
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          cancel_reason: string | null
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          message: string | null
          order_number: string | null
          service_type_id: string
          status_id: string | null
          value: number | null
          vehicle_id: string
        }
        Insert: {
          cancel_reason?: string | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string | null
          order_number?: string | null
          service_type_id: string
          status_id?: string | null
          value?: number | null
          vehicle_id: string
        }
        Update: {
          cancel_reason?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string | null
          order_number?: string | null
          service_type_id?: string
          status_id?: string | null
          value?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "order_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      plate_types: {
        Row: {
          code: string
          color: string | null
          id: string
          label: string
        }
        Insert: {
          code: string
          color?: string | null
          id?: string
          label: string
        }
        Update: {
          code?: string
          color?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          prefix: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          prefix?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          prefix?: string | null
        }
        Relationships: []
      }
      service_types: {
        Row: {
          active: boolean | null
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_types_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          document: string | null
          email: string
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          category: string
          client_id: string
          color: string | null
          created_at: string | null
          id: string
          license_plate: string
          model: string
          plate_type_id: string
          renavam: string | null
          updated_at: string | null
          year: string
        }
        Insert: {
          brand: string
          category?: string
          client_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          license_plate: string
          model: string
          plate_type_id: string
          renavam?: string | null
          updated_at?: string | null
          year: string
        }
        Update: {
          brand?: string
          category?: string
          client_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          license_plate?: string
          model?: string
          plate_type_id?: string
          renavam?: string | null
          updated_at?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_plate_type_id_fkey"
            columns: ["plate_type_id"]
            isOneToOne: false
            referencedRelation: "plate_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      inventory_status: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string | null
          id: string | null
          min_quantity: number | null
          name: string | null
          quantity: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          id?: string | null
          min_quantity?: number | null
          name?: string | null
          quantity?: number | null
          status?: never
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          id?: string | null
          min_quantity?: number | null
          name?: string | null
          quantity?: number | null
          status?: never
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_inventory_status: {
        Args: { quantity: number; min_quantity: number }
        Returns: string
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

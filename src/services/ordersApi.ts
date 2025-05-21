// src/services/ordersApi.ts
import { supabase } from "@/lib/supabaseClient";

export interface Order {
  id: string;
  service_type_id: string;
  client_id: string;
  license_plate: string;
  notes?: string;
  estimated_delivery_date?: string;
  status_id: string;
  value: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type NewOrder = Omit<Order, "id" | "created_at" | "updated_at">;

export class OrdersService {
  /** Cria um novo pedido */
  static async createOrder(payload: NewOrder): Promise<Order> {
    const { data, error } = await supabase
      .from<Order>("orders")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

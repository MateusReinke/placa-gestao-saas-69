// src/services/orderStatusesApi.ts
import { supabase } from "@/lib/supabaseClient";

export interface OrderStatus {
  id: string;
  name: string;
  active: boolean;
  color?: string;
  // remova o campo `order` se não existir no seu esquema
}

export class OrderStatusesService {
  /** Retorna todos os status ativos (sem ORDER BY em coluna inexistente) */
  static async getOrderStatuses(): Promise<OrderStatus[]> {
    const { data, error } = await supabase
      .from<OrderStatus>("order_statuses")
      .select("*")
      .eq("active", true);
    if (error) throw error;
    return data;
  }
}

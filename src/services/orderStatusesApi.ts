// src/services/orderStatusesApi.ts
import { supabase } from "@/lib/supabaseClient";

export interface OrderStatus {
  id: string;
  name: string;
  active: boolean;
  color?: string;
  sort_order?: number; // Adicionado para ordenação
}

export class OrderStatusesService {
  /** Retorna todos os status ativos ordenados por sort_order */
  static async getOrderStatuses(): Promise<OrderStatus[]> {
    const { data, error } = await supabase
      .from("order_statuses") // O tipo é inferido pelo cliente Supabase se configurado com Database types
      .select("id, name, active, color, sort_order") // Garante que sort_order é selecionado
      .eq("active", true)
      .order("sort_order", { ascending: true, nullsFirst: false }); // Ordena e trata nulos
    if (error) throw error;
    return data || [];
  }
}

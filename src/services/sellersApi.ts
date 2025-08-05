// src/services/sellersApi.ts
import { supabase } from "@/lib/supabaseClient";

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
  clientsCount?: number;
  ordersCount?: number;
}

export class SellersService {
  /** Lista todos os vendedores */
  static async getSellers(): Promise<Seller[]> {
    const { data: sellers, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "seller")
      .order("name", { ascending: true });

    if (error) throw error;

    // Para cada vendedor, buscar quantidade de clientes e pedidos
    const sellersWithStats = await Promise.all(
      (sellers || []).map(async (seller) => {
        // Contar clientes criados por este vendedor
        const { count: clientsCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("created_by", seller.id)
          .eq("active", true);

        // Contar pedidos criados por este vendedor
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("created_by", seller.id);

        return {
          ...seller,
          clientsCount: clientsCount || 0,
          ordersCount: ordersCount || 0,
        };
      })
    );

    return sellersWithStats;
  }

  /** Criar novo vendedor */
  static async createSeller(payload: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Seller> {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          ...payload,
          role: "seller",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Atualizar vendedor */
  static async updateSeller(
    id: string,
    payload: Partial<Pick<Seller, "name" | "email" | "phone">>
  ): Promise<Seller> {
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Deletar vendedor (soft delete seria melhor) */
  static async deleteSeller(id: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
  }
}
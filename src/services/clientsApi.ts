
// src/services/clientsApi.ts
import { supabase } from "@/lib/supabaseClient";
import { Client as ClientType } from "@/types";

export interface Client {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email?: string;
  type: "physical" | "juridical";
  active?: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export type NewClient = Omit<
  Client,
  "id" | "active" | "created_at" | "updated_at"
>;

export class ClientsService {
  /** Lista todos os clientes ativos */
  static async getClients(): Promise<ClientType[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  /** Cria um novo cliente */
  static async createClient(payload: NewClient): Promise<ClientType> {
    const { data, error } = await supabase
      .from("clients")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

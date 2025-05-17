
// src/integrations/supabase/client.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Usa variáveis de ambiente (do .env) para máxima segurança e flexibilidade!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O tipo <Database> é opcional, só inclua se estiver usando types autogerados
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Safely parse role string to ensure it matches the required types
 * @param role String role from database
 * @returns Properly typed role
 */
export const safelyParseRole = (role: string): "admin" | "seller" | "physical" | "juridical" => {
  if (role === "admin" || role === "seller" || role === "physical" || role === "juridical") {
    return role;
  }
  console.warn(`Invalid role detected: ${role}. Defaulting to "physical"`);
  return "physical"; // Default fallback role
};

// API Service mock para compatibilidade com o código existente
// Esta é uma solução temporária para resolver erros de compilação
export const ApiService = {
  // Funções relacionadas a clientes
  getClients: async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) throw error;
    return data || [];
  },

  createClient: async (clientData: any) => {
    const { data, error } = await supabase.from('clients').insert(clientData).select().single();
    if (error) throw error;
    return data;
  },

  // Funções relacionadas a pedidos
  getOrders: async () => {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return data || [];
  },

  getOrderStatuses: async () => {
    const { data, error } = await supabase.from('order_statuses').select('*');
    if (error) throw error;
    return data || [];
  },

  updateOrder: async (id: string, orderData: any) => {
    const { data, error } = await supabase.from('orders').update(orderData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteOrder: async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  createOrder: async (orderData: any) => {
    const { data, error } = await supabase.from('orders').insert(orderData).select().single();
    if (error) throw error;
    return data;
  },

  // Funções relacionadas a veículos
  getClientVehicles: async (clientId: string) => {
    const { data, error } = await supabase.from('vehicles').select('*').eq('client_id', clientId);
    if (error) throw error;
    return data || [];
  },

  createVehicle: async (vehicleData: any) => {
    const { data, error } = await supabase.from('vehicles').insert(vehicleData).select().single();
    if (error) throw error;
    return data;
  },

  // Funções relacionadas ao dashboard
  getDashboardStats: async () => {
    // Simulação de dados do dashboard
    return {
      totalOrders: 0,
      totalClients: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      recentOrders: [],
      recentClients: [],
    };
  }
};

// Exporta o ApiService para ser usado em outros componentes
export { ApiService };


import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Use environment variables for maximum security and flexibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The <Database> type is optional, only include if using auto-generated types
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

// API Service for compatibility with existing code
// This is a temporary solution to resolve compilation errors
export const ApiService = {
  // Client-related functions
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

  // Order-related functions
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

  // Vehicle-related functions
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

  // Dashboard-related functions
  getDashboardStats: async () => {
    // Simulation of dashboard data
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

// Remove the second export of ApiService
// This was causing the error

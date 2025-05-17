
import { createClient } from "@supabase/supabase-js";

// Access environment variables using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Type assertion for role strings to ensure they match the required types
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


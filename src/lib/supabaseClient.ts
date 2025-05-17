
import { createClient } from "@supabase/supabase-js";
import { ApiService } from "@/integrations/supabase/client"; // Import ApiService from the proper file

// Access environment variables using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
}

// Create and export the Supabase client
export const supabase = createClient(
  supabaseUrl || "https://tcuxzuabtcfizsaradeh.supabase.co", 
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdXh6dWFidGNmaXpzYXJhZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTMzOTYsImV4cCI6MjA2Mjk4OTM5Nn0.bv-6wjp7XhSjaGdnPl3gDJVgT82gxTjFw-22RTBULn4"
);

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

// Re-export ApiService for backwards compatibility
export { ApiService };

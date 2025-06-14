
// src/integrations/supabase/client.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Use direct URLs instead of environment variables for Lovable compatibility
const supabaseUrl = "https://tcuxzuabtcfizsaradeh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdXh6dWFidGNmaXpzYXJhZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTMzOTYsImV4cCI6MjA2Mjk4OTM5Nn0.bv-6wjp7XhSjaGdnPl3gDJVgT82gxTjFw-22RTBULn4";

// The type <Database> is optional, only include if using autogenerated types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tcuxzuabtcfizsaradeh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdXh6dWFidGNmaXpzYXJhZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTMzOTYsImV4cCI6MjA2Mjk4OTM5Nn0.bv-6wjp7XhSjaGdnPl3gDJVgT82gxTjFw-22RTBULn4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

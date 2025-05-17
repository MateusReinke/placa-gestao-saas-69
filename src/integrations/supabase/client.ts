// src/integrations/supabase/client.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Usa variáveis de ambiente (do .env) para máxima segurança e flexibilidade!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O tipo <Database> é opcional, só inclua se estiver usando types autogerados
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// Ou, se não usar tipos, apenas:
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

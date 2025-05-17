// src/services/serviceTypesApi.ts
import { supabase } from "@/lib/supabaseClient";

/* --------- MODELAGEM (agora com categoria) --------- */
export interface ServiceCategory {
  id: string;
  name: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  category_id: string; //  <- FK
  category?: ServiceCategory; //  <- via join
  created_at?: string;
  updated_at?: string;
}

/* --------- CATEGORIAS --------- */
export class CategoryService {
  static async getCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as ServiceCategory[];
  }

  /* opcional – permitir criar categoria direto pelo front */
  static async createCategory(name: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from("service_categories")
      .insert([{ name }])
      .select()
      .single();
    if (error) throw error;
    return data as ServiceCategory;
  }
}

/* --------- SERVIÇOS --------- */
export class ApiService {
  // join para já retornar o nome da categoria
  static async getServiceTypes(): Promise<ServiceType[]> {
    const { data, error } = await supabase
      .from("service_types")
      .select(`*, category:service_categories ( id, name )`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ServiceType[];
  }

  static async createServiceType(
    svc: Omit<ServiceType, "id" | "created_at" | "updated_at" | "category">
  ): Promise<ServiceType> {
    const { data, error } = await supabase
      .from("service_types")
      .insert([svc])
      .select(`*, category:service_categories ( id, name )`)
      .single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async updateServiceType(
    id: string,
    updated: Partial<ServiceType>
  ): Promise<ServiceType> {
    const { data, error } = await supabase
      .from("service_types")
      .update({ ...updated, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`*, category:service_categories ( id, name )`)
      .single();
    if (error) throw error;
    return data as ServiceType;
  }

  static async deleteServiceType(id: string): Promise<void> {
    const { error } = await supabase
      .from("service_types")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}

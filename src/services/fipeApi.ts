// src/services/fipeApi.ts
export interface FipeBrand {
  nome: string;
  codigo: string;
}
export interface FipeModel {
  nome: string;
  codigo: string;
}
export interface FipeYear {
  nome: string;
  codigo: string;
}

// Rota base genérica
const BASE = "https://parallelum.com.br/fipe/api/v1";

// Busca marcas de acordo com a categoria
export async function getBrands(
  category: "carros" | "motos" | "caminhoes"
): Promise<FipeBrand[]> {
  const res = await fetch(`${BASE}/${category}/marcas`);
  if (!res.ok) throw new Error("Erro ao buscar marcas FIPE");
  return res.json();
}

export async function getModels(
  category: "carros" | "motos" | "caminhoes",
  brandCode: string
): Promise<FipeModel[]> {
  const res = await fetch(`${BASE}/${category}/marcas/${brandCode}/modelos`);
  if (!res.ok) throw new Error("Erro ao buscar modelos FIPE");
  const json = await res.json();
  return json.modelos;
}

export async function getYears(
  category: "carros" | "motos" | "caminhoes",
  brandCode: string,
  modelCode: string
): Promise<FipeYear[]> {
  const res = await fetch(
    `${BASE}/${category}/marcas/${brandCode}/modelos/${modelCode}/anos`
  );
  if (!res.ok) throw new Error("Erro ao buscar anos FIPE");
  return res.json();
}

export const FipeService = { getBrands, getModels, getYears };

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3-$4");
  }
  return cnpj;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
}

/**
 * Cálculo Têxtil:
 * Rendimento teórico em Metros por Kg a partir da gramatura (g/m²) e largura (m)
 * Rendimento (m/kg) = 1000 / (Gramatura em g/m² * Largura em metros)
 */
export function calcularRendimentoTecido(gramatura_g_m2: number, largura_m: number): number {
  if (!gramatura_g_m2 || !largura_m || gramatura_g_m2 <= 0 || largura_m <= 0) return 0;
  return Number((1000 / (gramatura_g_m2 * largura_m)).toFixed(3));
}

/**
 * Cálculo Têxtil:
 * Conversão de Kg para Metros Lineares
 */
export function converterKgParaMetros(kg: number, rendimento_m_kg: number): number {
  if (!kg || !rendimento_m_kg) return 0;
  return Number((kg * rendimento_m_kg).toFixed(2));
}

/**
 * Cálculo Têxtil:
 * Consumo total com margem de quebra/perda de corte
 */
export function calcularConsumoComPerda(consumoUnitario: number, percentualPerda: number, quantidadePecas: number): number {
  const consumoLiquido = consumoUnitario * quantidadePecas;
  const perda = consumoLiquido * (percentualPerda / 100);
  return Number((consumoLiquido + perda).toFixed(3));
}

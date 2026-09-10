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

/**
 * Formata CNPJ ou CPF, com suporte total ao NOVO PADRÃO DE CNPJ ALFANUMÉRICO da Receita Federal
 * Formatos suportados:
 * - CNPJ Alfanumérico (14 caracteres alfanuméricos): XX.XXX.XXX/XXXX-XX (ex: 12.ABC.345/0001-90)
 * - CNPJ Tradicional (14 dígitos): 00.000.000/0000-00
 * - CPF (11 dígitos): 000.000.000-00
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return "";
  // Mantém letras e números em maiúsculo, removendo pontuações existentes
  const clean = cnpj.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  
  if (clean.length === 14) {
    return clean.replace(/^([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{3})([A-Z0-9]{4})([A-Z0-9]{2})$/, "$1.$2.$3/$4-$5");
  }
  if (clean.length === 11 && /^\d+$/.test(clean)) {
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return cnpj;
}

/**
 * Validação de Documento (CPF / CNPJ Tradicional / CNPJ Alfanumérico da RFB)
 */
export function validarDocumentoReceita(doc: string): { valido: boolean; tipo: "cnpj_alfanumerico" | "cnpj" | "cpf" | "invalido"; formatado: string } {
  if (!doc) return { valido: false, tipo: "invalido", formatado: "" };
  const clean = doc.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (clean.length === 14) {
    const isAlphanumeric = /[A-Z]/.test(clean);
    return {
      valido: true,
      tipo: isAlphanumeric ? "cnpj_alfanumerico" : "cnpj",
      formatado: formatCNPJ(clean),
    };
  }

  if (clean.length === 11 && /^\d+$/.test(clean)) {
    return {
      valido: true,
      tipo: "cpf",
      formatado: formatCNPJ(clean),
    };
  }

  return { valido: false, tipo: "invalido", formatado: doc };
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

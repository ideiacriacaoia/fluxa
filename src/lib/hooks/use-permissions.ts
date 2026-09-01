"use client";

import { useTextilStore } from "@/lib/store/textil-store";
import { ModuloSistema, NivelPermissao } from "@/types/database.types";

const PESOS_PERMISSAO: Record<NivelPermissao, number> = {
  administrar: 3,
  editar: 2,
  visualizar: 1,
  nenhum: 0,
};

export function usePermissions() {
  const { usuarioLogado, getUsuarioPermissoesEfetivas, papeis } = useTextilStore();

  const permissoesEfetivas = usuarioLogado?.id
    ? getUsuarioPermissoesEfetivas(usuarioLogado.id)
    : ({} as Record<ModuloSistema, NivelPermissao>);

  const can = (modulo: ModuloSistema, nivelMinimo: NivelPermissao = "visualizar"): boolean => {
    if (!usuarioLogado || !usuarioLogado.ativo) return false;
    if (usuarioLogado.nivel_acesso === "admin" || usuarioLogado.papel_nome === "Administrador") {
      return true;
    }

    const nivelAtual = permissoesEfetivas[modulo] || "nenhum";
    const pesoAtual = PESOS_PERMISSAO[nivelAtual] ?? 0;
    const pesoMinimo = PESOS_PERMISSAO[nivelMinimo] ?? 1;

    return pesoAtual >= pesoMinimo;
  };

  const isAdmin = (): boolean => {
    return (
      usuarioLogado?.ativo === true &&
      (usuarioLogado.nivel_acesso === "admin" || usuarioLogado.papel_nome === "Administrador")
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!usuarioLogado || !usuarioLogado.ativo) return false;
    return (
      usuarioLogado.papel_nome?.toLowerCase() === roleName.toLowerCase() ||
      usuarioLogado.nivel_acesso?.toLowerCase() === roleName.toLowerCase()
    );
  };

  const papelAtual = papeis.find((p) => p.id === usuarioLogado?.papel_id);

  return {
    usuarioLogado,
    papelAtual,
    permissoesEfetivas,
    can,
    isAdmin,
    hasRole,
  };
}

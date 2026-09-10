"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  UserCheck,
  Sparkles,
  Building2,
  HelpCircle,
  PanelLeft,
  LayoutGrid,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { ThemeSelector } from "@/components/layout/theme-selector";
import { cn } from "@/lib/utils";

export function Header() {
  const {
    empresa,
    usuarios,
    usuarioLogado,
    setUsuarioLogado,
    saldos,
    ordensProducao,
    pendencias,
    posicaoMenu,
    setPosicaoMenu,
  } = useTextilStore();

  const opsEmProducao = ordensProducao.filter(
    (op) => op.status !== "finalizada" && op.status !== "cancelada"
  ).length;

  // Notificações: Pendências onde o usuário logado é o responsável e estão abertas ou fazendo
  const pendenciasMinhas = pendencias.filter(
    (p) => p.responsavel_id === usuarioLogado.id && p.status !== "fechada"
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-header border-b border-border-main px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors">
      {/* Search and context */}
      <div className="flex items-center gap-4 w-96">
        {posicaoMenu === "superior" && (
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-xs flex-shrink-0 text-xs">
              FT
            </div>
            <span className="font-bold text-text-main text-sm whitespace-nowrap">
              Fluxa Têxtil
            </span>
          </div>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar OP, Lote de tecido, NF, SKU, Pendência..."
            className="w-full bg-surface border border-border-main text-xs rounded-lg pl-9 pr-4 py-2 text-text-main placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      {/* Right KPIs, Position Menu, Theme Selector, Notification & User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick status indicators */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border-main rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-text-muted font-medium">OPs em Chão:</span>
            <span className="font-bold text-text-main">{opsEmProducao}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border-main rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-status-success"></span>
            <span className="text-text-muted font-medium">Saldos Ativos:</span>
            <span className="font-bold text-text-main">{saldos.length} lotes</span>
          </div>
        </div>

        {/* Alternador de Posição do Menu (Lateral vs Superior) */}
        <button
          onClick={() =>
            setPosicaoMenu(posicaoMenu === "lateral" ? "superior" : "lateral")
          }
          title={
            posicaoMenu === "lateral"
              ? "Alternar para Barra de Menu Superior (Horizontal)"
              : "Alternar para Barra de Menu Lateral (Vertical)"
          }
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors border border-border-main bg-surface shadow-xs text-xs font-medium"
        >
          {posicaoMenu === "lateral" ? (
            <>
              <LayoutGrid className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden xl:inline">Menu Superior</span>
            </>
          ) : (
            <>
              <PanelLeft className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden xl:inline">Menu Lateral</span>
            </>
          )}
        </button>

        {/* Seletor de Temas */}
        <ThemeSelector />

        {/* Notificações (Sino com Badge e Dropdown de Tarefas do Usuário) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            title="Pendências e Tarefas Atribuídas"
            className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors relative border border-border-main bg-surface shadow-xs"
          >
            <Bell className="w-3.5 h-3.5" />
            {pendenciasMinhas.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-status-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                {pendenciasMinhas.length}
              </span>
            )}
          </button>

          {/* Dropdown de Notificações */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-xl border border-border-main shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                  <ClipboardCheck className="w-4 h-4 text-brand-primary" />
                  <span>Pendências para você ({pendenciasMinhas.length})</span>
                </div>
                <Link
                  href="/cadastros/pendencias"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] text-brand-primary hover:underline font-medium"
                >
                  Ver todas
                </Link>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {pendenciasMinhas.length === 0 ? (
                  <div className="text-center py-6 text-text-dim text-xs">
                    <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-1.5 opacity-80" />
                    Você não possui pendências em aberto!
                  </div>
                ) : (
                  pendenciasMinhas.map((p) => (
                    <Link
                      key={p.id}
                      href="/cadastros/pendencias"
                      onClick={() => setNotifOpen(false)}
                      className="block p-2.5 rounded-lg bg-surface-hover/60 hover:bg-surface-hover border border-border-subtle transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between text-[10px] text-text-dim mb-1">
                        <span className="font-mono font-bold text-brand-primary">{p.numero}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.data_prazo ? `Prazo: ${p.data_prazo}` : "Sem prazo"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-main group-hover:text-brand-primary line-clamp-2">
                        {p.informacao}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1">
                        Criado por: <span className="font-medium text-text-main">{p.criador_nome}</span>
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Troca Rápida de Usuário Demo */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-border-main text-left"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold text-xs border border-brand-primary/30 flex-shrink-0">
              {usuarioLogado.nome
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-text-main leading-tight flex items-center gap-1">
                {usuarioLogado.nome}
                <ChevronDown className="w-3 h-3 text-text-dim" />
              </p>
              <p className="text-[10px] text-text-muted">
                {usuarioLogado.papel_nome || usuarioLogado.cargo}
              </p>
            </div>
          </button>

          {/* Troca Rápida de Usuário */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border-main shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-1.5 border-b border-border-subtle mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim">
                  Alternar Usuário Demo
                </span>
              </div>
              <div className="space-y-1">
                {usuarios.map((u) => {
                  const isCurrent = u.id === usuarioLogado.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setUsuarioLogado(u);
                        setUserDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between",
                        isCurrent
                          ? "bg-brand-primary/10 text-brand-primary font-semibold"
                          : "text-text-main hover:bg-surface-hover"
                      )}
                    >
                      <div>
                        <p className="font-semibold text-xs leading-tight">{u.nome}</p>
                        <p className="text-[10px] text-text-muted">{u.papel_nome || u.cargo}</p>
                      </div>
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

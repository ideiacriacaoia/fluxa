"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Sun, Moon, Sparkles, Flame, ChevronDown } from "lucide-react";
import { useTextilStore, TemaTipo } from "@/lib/store/textil-store";
import { cn } from "@/lib/utils";

interface TemaOption {
  id: TemaTipo;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  cores: {
    bg: string;
    surface: string;
    primary: string;
    accent?: string;
  };
}

const TEMAS_DISPONIVEIS: TemaOption[] = [
  {
    id: "padrao",
    nome: "Padrão",
    descricao: "Tema claro corporativo clássico",
    icon: Sun,
    cores: {
      bg: "#f8fafc",
      surface: "#ffffff",
      primary: "#0284c7",
      accent: "#0d9488",
    },
  },
  {
    id: "dark-night",
    nome: "Dark Night",
    descricao: "Alto contraste e conforto noturno",
    icon: Moon,
    cores: {
      bg: "#090a0f",
      surface: "#12131a",
      primary: "#3b82f6",
      accent: "#14b8a6",
    },
  },
  {
    id: "tokyo",
    nome: "Tokyo",
    descricao: "Tokyo Night com acentos neon",
    icon: Sparkles,
    cores: {
      bg: "#16161e",
      surface: "#1a1b26",
      primary: "#7aa2f7",
      accent: "#f7768e",
    },
  },
  {
    id: "ideia",
    nome: "IdeIA",
    descricao: "Amarelo-Ouro, Verde-Oceano & Preto",
    icon: Flame,
    cores: {
      bg: "#0a0e14",
      surface: "#111622",
      primary: "#f59e0b",
      accent: "#14b8a6",
    },
  },
];

export function ThemeSelector() {
  const { temaAtual, setTemaAtual } = useTextilStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const temaSelecionado =
    TEMAS_DISPONIVEIS.find((t) => t.id === temaAtual) || TEMAS_DISPONIVEIS[0];
  const IconAtual = temaSelecionado.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão de Abertura do Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Alternar Tema Visual"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-main bg-surface hover:bg-surface-hover text-text-main transition-colors text-xs font-medium shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          <IconAtual className="w-3.5 h-3.5 text-brand-primary" />
          <span className="hidden sm:inline font-semibold">{temaSelecionado.nome}</span>
        </div>

        {/* Mini Preview das Cores */}
        <div className="flex items-center -space-x-1 pl-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-border-main shadow-xs"
            style={{ backgroundColor: temaSelecionado.cores.bg }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-border-main shadow-xs"
            style={{ backgroundColor: temaSelecionado.cores.surface }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-border-main shadow-xs"
            style={{ backgroundColor: temaSelecionado.cores.primary }}
          />
        </div>

        <ChevronDown
          className={cn("w-3 h-3 text-text-muted transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {/* Menu Dropdown com Miniaturas */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface rounded-xl border border-border-main shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-border-subtle mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
              <Palette className="w-3.5 h-3.5 text-brand-primary" />
              <span>Temas Visuais</span>
            </div>
            <span className="text-[10px] text-text-muted">4 paletas</span>
          </div>

          <div className="space-y-1">
            {TEMAS_DISPONIVEIS.map((tema) => {
              const isSelected = temaAtual === tema.id;
              const Icon = tema.icon;

              return (
                <button
                  key={tema.id}
                  onClick={() => {
                    setTemaAtual(tema.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg flex items-center justify-between text-xs transition-all group",
                    isSelected
                      ? "bg-brand-primary/10 border border-brand-primary/30 text-text-main font-semibold"
                      : "hover:bg-surface-hover text-text-muted hover:text-text-main border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border transition-colors",
                        isSelected
                          ? "bg-brand-primary text-brand-foreground border-brand-primary"
                          : "bg-surface border-border-main text-text-muted group-hover:text-text-main"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <p className="font-semibold leading-tight text-text-main">{tema.nome}</p>
                      <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                        {tema.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Miniatura da Paleta de 4 Cores */}
                    <div className="flex items-center -space-x-1 p-1 bg-surface rounded-md border border-border-subtle shadow-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-border-main"
                        style={{ backgroundColor: tema.cores.bg }}
                        title="Fundo"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-border-main"
                        style={{ backgroundColor: tema.cores.surface }}
                        title="Superfície"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-border-main"
                        style={{ backgroundColor: tema.cores.primary }}
                        title="Primária"
                      />
                      {tema.cores.accent && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-border-main"
                          style={{ backgroundColor: tema.cores.accent }}
                          title="Acento"
                        />
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

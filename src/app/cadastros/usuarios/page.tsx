"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Briefcase,
  History,
  KeyRound,
  AlertTriangle,
  RotateCcw,
  Info,
  Check,
  X,
  Edit3,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import {
  Usuario,
  ModuloSistema,
  NivelPermissao,
  Papel,
  AuditoriaPermissao,
} from "@/types/database.types";
import { cn } from "@/lib/utils";

const MODULOS_CONFIG: {
  id: ModuloSistema;
  nome: string;
  descricao: string;
  categoria: string;
}[] = [
  {
    id: "compras",
    nome: "Compras & Insumos",
    descricao: "Pedidos de compra, fornecedores, recebimento de notas e lotes de tecido",
    categoria: "Suprimentos",
  },
  {
    id: "estoque",
    nome: "Estoque & Almoxarifado",
    descricao: "Ledger de movimentações, saldos, retalhos e rastreabilidade",
    categoria: "Logística",
  },
  {
    id: "fichas_tecnicas",
    nome: "Ficha Técnica & Produtos",
    descricao: "Consumo de tecidos por grade, aviamentos, gramaturas e composição",
    categoria: "Engenharia",
  },
  {
    id: "pcp_producao",
    nome: "PCP & Chão de Fábrica",
    descricao: "Ordens de produção, apontamentos, corte, facção e cronoanálise",
    categoria: "Produção",
  },
  {
    id: "cadastros_base",
    nome: "Cadastros Base",
    descricao: "Depósitos, itens de catálogo e cadastros gerais da fábrica",
    categoria: "Configurações",
  },
  {
    id: "usuarios_permissoes",
    nome: "Usuários & Acessos",
    descricao: "Gestão de usuários, atribuição de papéis e auditoria de segurança",
    categoria: "Segurança",
  },
  {
    id: "vendas",
    nome: "Vendas & Pedidos (Fase 3)",
    descricao: "Força de vendas, pedidos comerciais e faturamento de grades",
    categoria: "Comercial",
  },
  {
    id: "financeiro",
    nome: "Financeiro & Fiscal (Fase 4)",
    descricao: "Contas a pagar/receber, conciliação e emissão de notas fiscais",
    categoria: "Controladoria",
  },
];

const NIVEIS_CONFIG: {
  id: NivelPermissao;
  label: string;
  badgeClass: string;
  descricao: string;
}[] = [
  {
    id: "nenhum",
    label: "Nenhum",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    descricao: "Sem acesso visual ou operacional",
  },
  {
    id: "visualizar",
    label: "Visualizar",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    descricao: "Somente leitura (SELECT)",
  },
  {
    id: "editar",
    label: "Editar",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    descricao: "Leitura, inserção e alteração (sem excluir)",
  },
  {
    id: "administrar",
    label: "Administrar",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    descricao: "Controle total do módulo (leitura, escrita e exclusão)",
  },
];

export default function UsuariosPage() {
  const {
    usuarios,
    papeis,
    papelPermissoes,
    usuarioPermissoes,
    auditoriaPermissoes,
    usuarioLogado,
    setUsuarioLogado,
    addUsuario,
    updateUsuario,
    toggleStatusUsuario,
    setUsuarioPermissao,
    resetUsuarioPermissoes,
    getUsuarioPermissoesEfetivas,
  } = useTextilStore();

  const [activeTab, setActiveTab] = useState<"usuarios" | "papeis" | "auditoria">("usuarios");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPapelFilter, setSelectedPapelFilter] = useState("todos");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("todos");

  // Modal de Criação / Edição de Usuário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
    papel_id: papeis[0]?.id || "",
  });

  // Modal de Exceções Granulares de Permissão
  const [permissionModalUser, setPermissionModalUser] = useState<Usuario | null>(null);

  // Filtragem de Usuários
  const filteredUsuarios = usuarios.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cargo && u.cargo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPapel =
      selectedPapelFilter === "todos" || u.papel_id === selectedPapelFilter;

    const matchesStatus =
      selectedStatusFilter === "todos" ||
      (selectedStatusFilter === "ativos" && u.ativo) ||
      (selectedStatusFilter === "inativos" && !u.ativo);

    return matchesSearch && matchesPapel && matchesStatus;
  });

  const totalAtivos = usuarios.filter((u) => u.ativo).length;
  const totalInativos = usuarios.length - totalAtivos;
  const totalExcecoes = usuarioPermissoes.length;

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nome: "",
      email: "",
      cargo: "",
      papel_id: papeis[1]?.id || papeis[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      cargo: user.cargo || "",
      papel_id: user.papel_id || papeis[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.papel_id) return;

    if (editingUser) {
      updateUsuario(editingUser.id, formData);
    } else {
      addUsuario(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header com Simulador de Acesso */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Gestão de Usuários & Permissões por Módulo
            </h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-200">
              Multi-tenant & RLS
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Controle de acesso granular, matriz de permissões por perfil da indústria têxtil, auditoria e soft-delete.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simulador de Usuário Logado */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              Sessão Ativa:
            </span>
            <select
              value={usuarioLogado.id}
              onChange={(e) => {
                const u = usuarios.find((item) => item.id === e.target.value);
                if (u) setUsuarioLogado(u);
              }}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.papel_nome || "Papel"})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de Usuários</p>
            <p className="text-lg font-bold text-slate-800">{usuarios.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Usuários Ativos</p>
            <p className="text-lg font-bold text-emerald-600">
              {totalAtivos}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({totalInativos} inativos)
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Papéis da Indústria</p>
            <p className="text-lg font-bold text-indigo-600">{papeis.length} perfis</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Exceções Granulares</p>
            <p className="text-lg font-bold text-amber-600">{totalExcecoes} ativas</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab("usuarios")}
          className={cn(
            "pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all",
            activeTab === "usuarios"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Users className="w-4 h-4" />
          Usuários & Acessos ({usuarios.length})
        </button>

        <button
          onClick={() => setActiveTab("papeis")}
          className={cn(
            "pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all",
            activeTab === "papeis"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Shield className="w-4 h-4" />
          Matriz de Papéis Padrão ({papeis.length})
        </button>

        <button
          onClick={() => setActiveTab("auditoria")}
          className={cn(
            "pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all",
            activeTab === "auditoria"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <History className="w-4 h-4" />
          Auditoria de Permissões ({auditoriaPermissoes.length})
        </button>
      </div>

      {/* TAB 1: LISTAGEM DE USUÁRIOS */}
      {activeTab === "usuarios" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedPapelFilter}
                onChange={(e) => setSelectedPapelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="todos">Todos os Papéis</option>
                {papeis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativos">Somente Ativos</option>
                <option value="inativos">Somente Inativos</option>
              </select>
            </div>
          </div>

          {/* Tabela de Usuários */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Cargo / Função</th>
                  <th className="py-3 px-4">Papel Base</th>
                  <th className="py-3 px-4">Permissões Efetivas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum usuário encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((u) => {
                    const temExcecao = usuarioPermissoes.some(
                      (up) => up.usuario_id === u.id
                    );

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border",
                                u.ativo
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                              )}
                            >
                              {u.nome
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{u.nome}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {u.cargo || "Não informado"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                              u.papel_nome === "Administrador"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : u.papel_nome === "Comprador"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : u.papel_nome === "Gestor de Produção"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : u.papel_nome === "Almoxarife"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            <Shield className="w-3 h-3" />
                            {u.papel_nome || "Papel"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setPermissionModalUser(u)}
                            className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium group"
                          >
                            <span>Ver Matriz</span>
                            {temExcecao ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-amber-200">
                                Exceção Ativa
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 group-hover:text-slate-600">
                                (Padrão)
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.ativo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inativo
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {u.ultimo_acesso ? (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(u.ultimo_acesso).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPermissionModalUser(u)}
                              title="Configurar Permissões Granulares"
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Editar Dados Básicos"
                              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => toggleStatusUsuario(u.id)}
                              title={u.ativo ? "Desativar Acesso" : "Reativar Acesso"}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                u.ativo
                                  ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              )}
                            >
                              {u.ativo ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE PAPÉIS PADRÃO */}
      {activeTab === "papeis" && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-sky-800">
              <p className="font-semibold mb-0.5">
                Perfis Pré-configurados para Indústria e Confecção Têxtil
              </p>
              <p className="text-sky-700 leading-relaxed">
                Estes 5 papéis padrão definem a matriz base de acessos para cada colaborador. Caso um colaborador precise de uma permissão pontual diferente do seu papel, você pode criar uma exceção individual na aba de Usuários sem alterar o perfil dos demais.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[220px]">Módulo do Sistema</th>
                  {papeis.map((p) => (
                    <th key={p.id} className="py-3 px-4 min-w-[150px] text-center">
                      <span className="font-bold text-slate-800 block">{p.nome}</span>
                      <span className="text-[10px] text-slate-400 font-normal block truncate max-w-[140px]">
                        {p.descricao}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MODULOS_CONFIG.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{mod.nome}</p>
                      <p className="text-[11px] text-slate-400">{mod.descricao}</p>
                    </td>

                    {papeis.map((p) => {
                      const perm = papelPermissoes.find(
                        (pp) => pp.papel_id === p.id && pp.modulo === mod.id
                      );
                      const nivel = perm?.nivel_acesso || "nenhum";
                      const config = NIVEIS_CONFIG.find((n) => n.id === nivel);

                      return (
                        <td key={p.id} className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                              config?.badgeClass
                            )}
                          >
                            {config?.label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA & LOGS */}
      {activeTab === "auditoria" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Trilha de Auditoria Imutável de Segurança
              </h2>
              <span className="text-xs text-slate-400">
                {auditoriaPermissoes.length} registros
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {auditoriaPermissoes.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {log.usuario_alterado_nome || "Usuário"}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                          {log.tipo_alteracao}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Alterado por: <span className="font-medium text-slate-800">{log.alterado_por_nome || "Administrador"}</span>
                      </p>
                      <pre className="mt-2 bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-700 overflow-x-auto">
                        {JSON.stringify(log.detalhes, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 flex items-center gap-1 self-start md:self-center">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(log.registrado_em).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR USUÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Paula Martins"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  E-mail Corporativo (Supabase Auth) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: ana.martins@fluxatextil.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  O convite de acesso será enviado automaticamente para o e-mail cadastrado.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo / Função Operacional
                </label>
                <input
                  type="text"
                  placeholder="Ex: Analista de PCP / Costureira Líder"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Papel Base da Indústria *
                </label>
                <select
                  value={formData.papel_id}
                  onChange={(e) => setFormData({ ...formData, papel_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  {papeis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                >
                  {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: MATRIZ DE PERMISSÕES GRANULARES POR MÓDULO */}
      {permissionModalUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Matriz Granular de Permissões: {permissionModalUser.nome}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Papel Base: <span className="font-semibold text-slate-700">{permissionModalUser.papel_nome}</span> • {permissionModalUser.cargo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => resetUsuarioPermissoes(permissionModalUser.id)}
                  title="Remover todas as exceções e herdar o papel padrão"
                  className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrão do Papel
                </button>

                <button
                  onClick={() => setPermissionModalUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Regra de Precedência:</strong> As permissões configuradas nesta tabela são salvas em <code>usuario_permissoes</code> como <strong>exceções explícitas</strong> e prevalecem sobre a matriz padrão do papel.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Módulo do Fluxa Têxtil</th>
                      <th className="py-3 px-4 text-center">Nenhum</th>
                      <th className="py-3 px-4 text-center">Visualizar</th>
                      <th className="py-3 px-4 text-center">Editar</th>
                      <th className="py-3 px-4 text-center">Administrar</th>
                      <th className="py-3 px-4 text-center">Origem da Regra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODULOS_CONFIG.map((mod) => {
                      const permissoesEfetivas = getUsuarioPermissoesEfetivas(permissionModalUser.id);
                      const nivelAtual = permissoesEfetivas[mod.id] || "nenhum";

                      const temExcecao = usuarioPermissoes.some(
                        (up) => up.usuario_id === permissionModalUser.id && up.modulo === mod.id
                      );

                      return (
                        <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {mod.nome}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {mod.descricao}
                            </span>
                          </td>

                          {NIVEIS_CONFIG.map((nivel) => {
                            const isSelected = nivelAtual === nivel.id;

                            return (
                              <td key={nivel.id} className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUsuarioPermissao(
                                      permissionModalUser.id,
                                      mod.id,
                                      nivel.id
                                    )
                                  }
                                  className={cn(
                                    "w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all",
                                    isSelected
                                      ? "bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-500/20"
                                      : "bg-white text-slate-300 border-slate-200 hover:border-slate-400 hover:text-slate-500"
                                  )}
                                >
                                  {isSelected && <Check className="w-4 h-4" />}
                                </button>
                              </td>
                            );
                          })}

                          <td className="py-3.5 px-4 text-center">
                            {temExcecao ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                                Exceção Manual
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                Herdado do Papel
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Alterações são aplicadas imediatamente via RLS e refletidas em tempo real.
              </span>
              <button
                onClick={() => setPermissionModalUser(null)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition-all"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
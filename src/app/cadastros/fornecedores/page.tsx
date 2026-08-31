"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useTextilStore } from "@/lib/store/textil-store";
import { formatCNPJ } from "@/lib/utils";

export default function FornecedoresPage() {
  const { fornecedores, addFornecedor } = useTextilStore();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [modalNovo, setModalNovo] = useState(false);

  // Form State
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpjCpf, setCnpjCpf] = useState("");
  const [tipo, setTipo] = useState<"tecido" | "aviamento" | "faccao" | "servicos" | "geral">("tecido");
  const [contatoNome, setContatoNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("Brusque");
  const [uf, setUf] = useState("SC");
  const [prazoEntrega, setPrazoEntrega] = useState(7);

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const nomeBusca = (f.razao_social || f.nome || "").toLowerCase();
    const fantasiaBusca = (f.nome_fantasia || "").toLowerCase();
    const docBusca = f.cnpj_cpf || f.documento || "";
    const matchBusca =
      nomeBusca.includes(busca.toLowerCase()) ||
      fantasiaBusca.includes(busca.toLowerCase()) ||
      docBusca.includes(busca);
    const matchTipo = filtroTipo === "todos" || f.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const handleSalvarFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !cnpjCpf) return;

    addFornecedor({
      nome: nomeFantasia || razaoSocial,
      razao_social: razaoSocial,
      nome_fantasia: nomeFantasia || razaoSocial,
      documento: cnpjCpf,
      cnpj_cpf: cnpjCpf,
      tipo: tipo as any,
      contato_nome: contatoNome,
      contato_telefone: telefone,
      contato_email: email,
      telefone: telefone,
      email: email,
      cidade: cidade,
      uf: uf,
      prazo_medio_entrega_dias: Number(prazoEntrega),
      avaliacao_nota: 5.0,
      ativo: true,
    });

    setModalNovo(false);
    setRazaoSocial("");
    setNomeFantasia("");
    setCnpjCpf("");
  };

  const getTipoBadge = (t: string) => {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      tecido: { label: "Tecidos & Fios", bg: "bg-sky-50", text: "text-sky-700" },
      aviamento: { label: "Aviamentos", bg: "bg-amber-50", text: "text-amber-700" },
      faccao: { label: "Facção Terceirizada", bg: "bg-indigo-50", text: "text-indigo-700" },
      servicos: { label: "Serviços Gerais", bg: "bg-slate-100", text: "text-slate-700" },
      geral: { label: "Geral", bg: "bg-slate-100", text: "text-slate-700" },
    };
    const c = map[t] || map.geral;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Fornecedores & Facções Terceirizadas
          </h1>
          <p className="text-xs text-slate-500">
            Cadastre fabricantes de tecidos, aviamentos e oficinas de costura/facção externas.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Fornecedor
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="tecido">Tecidos</option>
            <option value="aviamento">Aviamentos</option>
            <option value="faccao">Facção / Terceirizado</option>
          </select>
        </div>
      </div>

      {/* Fornecedores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fornecedoresFiltrados.map((forn) => (
          <div
            key={forn.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {getTipoBadge(forn.tipo)}
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {forn.avaliacao_nota || 5.0}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {forn.nome_fantasia || forn.razao_social}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{forn.razao_social}</p>
                <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                  CNPJ: {formatCNPJ(forn.cnpj_cpf || forn.documento || "")}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                {forn.contato_nome && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Contato:</span>
                    <strong>{forn.contato_nome}</strong>
                  </div>
                )}
                {forn.telefone && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{forn.telefone}</span>
                  </div>
                )}
                {forn.email && (
                  <div className="flex items-center gap-1.5 text-[11px] truncate">
                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{forn.email}</span>
                  </div>
                )}
                {(forn.cidade || forn.uf) && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {forn.cidade} - {forn.uf}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Prazo médio entrega:</span>
              <strong className="text-slate-800">{forn.prazo_medio_entrega_dias} dias</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Fornecedor */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                Cadastrar Fornecedor / Facção
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarFornecedor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Ex: Têxtil Santa Catarina Indústria Ltda"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    placeholder="Ex: Têxtil SC"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNPJ / CPF *</label>
                  <input
                    type="text"
                    value={cnpjCpf}
                    onChange={(e) => setCnpjCpf(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Fornecedor *</label>
                  <select
                    value={tipo}
                    onChange={(e: any) => setTipo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="tecido">Tecidos / Malhas / Fios</option>
                    <option value="aviamento">Aviamentos</option>
                    <option value="faccao">Facção / Costura Terceirizada</option>
                    <option value="servicos">Serviços Gerais</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prazo Médio Entrega (dias)</label>
                  <input
                    type="number"
                    value={prazoEntrega}
                    onChange={(e) => setPrazoEntrega(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Contato</label>
                  <input
                    type="text"
                    value={contatoNome}
                    onChange={(e) => setContatoNome(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(47) 99999-0000"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={uf}
                      onChange={(e) => setUf(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

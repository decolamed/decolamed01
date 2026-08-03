"use client";

import { useState, useMemo, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toast, useToast } from "@/components/admin/interactive";
import { alterarStatusRelato, excluirRelato } from "./actions";
import { STATUS_RELATO, type StatusRelato } from "@/lib/site/relatos";

export interface RelatoExibicao {
  id: string;
  nome: string;
  email: string;
  data: string;
  texto: string;
  categoria: string;
  pagina: string | null;
  status: StatusRelato;
}

const CLASSE_STATUS: Record<StatusRelato, string> = {
  pendente: "bg-orange/10 text-orange",
  em_analise: "bg-navy/10 text-navy",
  resolvido: "bg-green/10 text-green"
};

export function RelatosManager({ relatos: inicial }: { relatos: RelatoExibicao[] }) {
  const [relatos, setRelatos] = useState(inicial);
  const [filtro, setFiltro] = useState<StatusRelato | "todos">("pendente");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: relatos.length };
    STATUS_RELATO.forEach((s) => (c[s.valor] = relatos.filter((r) => r.status === s.valor).length));
    return c;
  }, [relatos]);

  const visiveis = filtro === "todos" ? relatos : relatos.filter((r) => r.status === filtro);

  // Troca otimista: a etiqueta muda antes da resposta. Se a gravação falhar,
  // volta ao estado anterior — senão o admin acreditaria ter movido o relato
  // e só descobriria o contrário no próximo carregamento.
  function mudarStatus(id: string, status: StatusRelato) {
    const anterior = relatos.find((r) => r.id === id)?.status;
    if (!anterior || anterior === status) return;
    setRelatos((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      const res = await alterarStatusRelato(id, status).catch(() => ({ ok: false }));
      if (!res.ok) {
        setRelatos((rs) => rs.map((r) => (r.id === id ? { ...r, status: anterior } : r)));
        show("Não foi possível alterar o status.");
      }
    });
  }

  function excluir(id: string) {
    if (!confirm("Excluir este relato? Essa ação não pode ser desfeita.")) return;
    const backup = relatos;
    setRelatos((rs) => rs.filter((r) => r.id !== id));
    startTransition(async () => {
      const res = await excluirRelato(id).catch(() => ({ ok: false }));
      if (res.ok) show("Relato excluído.");
      else {
        setRelatos(backup);
        show("Não foi possível excluir.");
      }
    });
  }

  return (
    <div>
      <PageHeader
        title="Relatos de Erros"
        subtitle='Comunicados enviados pelos alunos pelo botão "Comunicar erro"'
      />

      <Card className="mb-3 flex flex-wrap items-center gap-1.5">
        {[{ valor: "todos" as const, label: "Todos" }, ...STATUS_RELATO].map((f) => (
          <button
            key={f.valor}
            type="button"
            onClick={() => setFiltro(f.valor as StatusRelato | "todos")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
              filtro === f.valor ? "bg-navy-dark text-white" : "bg-navy-dark/5 text-navy-dark/60 hover:bg-navy-dark/10"
            }`}
          >
            {f.label} ({contagem[f.valor] ?? 0})
          </button>
        ))}
      </Card>

      <Card className="!p-0 sm:!px-[18px]">
        {visiveis.map((r, i) => (
          <div key={r.id} className={`py-3.5 ${i < visiveis.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${CLASSE_STATUS[r.status]}`}>
                {STATUS_RELATO.find((s) => s.valor === r.status)?.label ?? r.status}
              </span>
              <span className="rounded-full bg-navy-dark/5 px-2.5 py-1 text-[10px] font-extrabold text-navy-dark/60">
                {r.categoria}
              </span>
              <span className="font-bold text-navy-dark">{r.nome}</span>
              <span className="text-xs font-semibold text-navy-dark/40">{r.email}</span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => excluir(r.id)}
                className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-red/10 text-red"
                title="Excluir"
              >
                <Icon name="trash" size={13} />
              </button>
            </div>

            <p className="my-1.5 text-sm font-semibold text-navy-dark">{r.texto}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-navy-dark/40">
              <span>{r.data}</span>
              {/* A página de origem é o que torna o relato reproduzível. Antes
                  ela nem era gravada — relatos antigos não têm. */}
              {r.pagina && (
                <span className="flex items-center gap-1">
                  <Icon name="link2" size={11} />
                  {r.pagina}
                </span>
              )}
              <div className="flex-1" />
              <div className="flex flex-wrap gap-1">
                {STATUS_RELATO.filter((s) => s.valor !== r.status).map((s) => (
                  <button
                    key={s.valor}
                    type="button"
                    onClick={() => mudarStatus(r.id, s.valor)}
                    className="rounded-[8px] border border-navy-dark/15 px-2.5 py-1 text-[10.5px] font-extrabold text-navy-dark/70 hover:bg-navy-dark/5"
                  >
                    → {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {visiveis.length === 0 && (
          <p className="py-6 text-center text-sm text-navy-dark/50">
            {relatos.length === 0 ? "Nenhum relato recebido. ✈" : "Nenhum relato neste status."}
          </p>
        )}
      </Card>

      <Toast message={toast} />
    </div>
  );
}

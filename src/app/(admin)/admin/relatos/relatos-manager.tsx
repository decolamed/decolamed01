"use client";

import { useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toast, useToast } from "@/components/admin/interactive";
import { marcarRelatoResolvido, excluirRelato } from "./actions";

export interface RelatoExibicao {
  id: string;
  nome: string;
  email: string;
  data: string;
  texto: string;
  categoria: string;
}

export function RelatosManager({ relatos }: { relatos: RelatoExibicao[] }) {
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function resolver(id: string) {
    startTransition(async () => {
      const res = await marcarRelatoResolvido(id);
      show(res.ok ? "Relato marcado como resolvido." : "Erro ao atualizar.");
    });
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirRelato(id);
      show(res.ok ? "Relato excluído." : "Erro ao excluir.");
    });
  }

  return (
    <div>
      <PageHeader title="Relatos de Erros" subtitle='Comunicados enviados pelos alunos pelo botão "Comunicar erro" — dados reais' />

      <Card className="!p-0 sm:!px-[18px]">
        {relatos.map((r, i) => (
          <div key={r.id} className={`py-3.5 ${i < relatos.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-extrabold text-orange">{r.categoria}</span>
              <span className="font-bold text-navy-dark">{r.nome}</span>
              <span className="text-xs font-semibold text-navy-dark/40">{r.email}</span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => resolver(r.id)}
                className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-green/10 text-green"
                title="Marcar resolvido"
              >
                <Icon name="check" size={13} />
              </button>
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
            <p className="text-xs font-semibold text-navy-dark/40">{r.data}</p>
          </div>
        ))}
        {relatos.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum relato pendente. ✈</p>}
      </Card>

      <Toast message={toast} />
    </div>
  );
}

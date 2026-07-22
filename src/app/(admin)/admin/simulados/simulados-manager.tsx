"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, GhostButton, Toast, useToast } from "@/components/admin/interactive";
import { criarSimulado, alternarAtivoSimulado, duplicarSimulado, excluirSimulado } from "./actions";
import type { Simulado } from "@/types/database";

export function SimuladosManager({ simulados, totalQuestoesPorId }: { simulados: Simulado[]; totalQuestoesPorId: Record<string, number> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function criar() {
    startTransition(async () => {
      const res = await criarSimulado("Novo simulado", 60);
      if (res.ok) {
        router.push(`/admin/simulados/${res.id}`);
      } else {
        show(res.erro ?? "Erro ao criar.");
      }
    });
  }

  function alternar(id: string, ativo: boolean) {
    startTransition(async () => {
      const res = await alternarAtivoSimulado(id, ativo);
      if (!res.ok) show("Não foi possível atualizar.");
    });
  }

  function duplicar(id: string) {
    startTransition(async () => {
      const res = await duplicarSimulado(id);
      show(res.ok ? "Simulado duplicado." : res.erro ?? "Erro ao duplicar.");
    });
  }

  function excluir(id: string) {
    if (!confirm("Excluir este simulado? As tentativas dos alunos serão mantidas no histórico deles.")) return;
    startTransition(async () => {
      const res = await excluirSimulado(id);
      show(res.ok ? "Simulado excluído." : "Erro ao excluir.");
    });
  }

  return (
    <div>
      <PageHeader title="Gerenciar Simulados" subtitle="Crie, edite, duplique, ative e desative os simulados dos alunos" />

      <Card className="!p-0 sm:!px-[18px]">
        {simulados.map((s) => {
          const total = totalQuestoesPorId[s.id] ?? 0;
          return (
            <div key={s.id} className="flex flex-wrap items-center gap-3 border-b border-navy-dark/10 py-3.5 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-soft text-navy-dark">
                <Icon name="file" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy-dark">{s.titulo}</p>
                <p className="text-xs font-semibold text-navy-dark/50">
                  {total} questões · {s.tempo_minutos} min · nota calculada pelos pesos oficiais
                </p>
              </div>
              <span className={`text-[10px] font-extrabold ${s.ativo ? "text-green" : "text-navy-dark/35"}`}>
                {s.ativo ? "Ativo" : "Desativado"}
              </span>
              <Toggle on={s.ativo} onClick={() => alternar(s.id, s.ativo)} />
              <a href={`/admin/simulados/${s.id}`}>
                <GhostButton>Editar</GhostButton>
              </a>
              <button
                type="button"
                onClick={() => duplicar(s.id)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-navy-dark/5 text-navy-dark/60"
                title="Duplicar"
              >
                <Icon name="copy" size={13} />
              </button>
              <button
                type="button"
                onClick={() => excluir(s.id)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red"
                title="Excluir"
              >
                <Icon name="trash" size={13} />
              </button>
            </div>
          );
        })}
        {simulados.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum simulado cadastrado ainda.</p>}
        <div className="py-3">
          <GhostButton onClick={criar} className={pending ? "opacity-60" : ""}>
            {pending ? "Criando..." : "+ Criar simulado"}
          </GhostButton>
        </div>
      </Card>

      <Toast message={toast} />
    </div>
  );
}

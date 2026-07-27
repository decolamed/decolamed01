"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, GhostButton, Toast, useToast } from "@/components/admin/interactive";
import { criarAtividade, alternarAtivoAtividade, excluirAtividade } from "./actions";
import type { Atividade } from "@/types/database";

const GABARITO_LABEL: Record<string, string> = { imediato: "Gabarito imediato", apos_envio: "Gabarito após o envio" };

export function AtividadesManager({ atividades, totalQuestoesPorId }: { atividades: Atividade[]; totalQuestoesPorId: Record<string, number> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function criar() {
    startTransition(async () => {
      const res = await criarAtividade("Nova atividade");
      if (res.ok) router.push(`/admin/atividades/${res.id}`);
      else show(res.erro ?? "Erro ao criar.");
    });
  }

  function alternar(id: string, ativo: boolean) {
    startTransition(async () => {
      const res = await alternarAtivoAtividade(id, ativo);
      if (!res.ok) show("Não foi possível atualizar.");
    });
  }

  function excluir(id: string) {
    if (!confirm("Excluir esta atividade? As tentativas dos alunos serão mantidas no histórico deles.")) return;
    startTransition(async () => {
      const res = await excluirAtividade(id);
      show(res.ok ? "Atividade excluída." : "Erro ao excluir.");
    });
  }

  return (
    <div>
      <PageHeader
        title="Atividades"
        subtitle="Avaliações baseadas em questões, separadas dos simulados — com gabarito, peso e tempo configuráveis"
      />

      <Card className="!p-0 sm:!px-[18px]">
        {atividades.map((a) => {
          const total = totalQuestoesPorId[a.id] ?? 0;
          return (
            <div key={a.id} className="flex flex-wrap items-center gap-3 border-b border-navy-dark/10 py-3.5 last:border-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-soft text-navy-dark">
                <Icon name="target" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy-dark">{a.titulo}</p>
                <p className="text-xs font-semibold text-navy-dark/50">
                  {total} questões · {GABARITO_LABEL[a.gabarito_modo]} · {a.tempo_limite_minutos ? `${a.tempo_limite_minutos} min` : "sem limite de tempo"} · peso {a.peso_facape}x
                </p>
              </div>
              <span className={`text-[10px] font-extrabold ${a.ativo ? "text-green" : "text-navy-dark/35"}`}>
                {a.ativo ? "Ativa" : "Desativada"}
              </span>
              <Toggle on={a.ativo} onClick={() => alternar(a.id, a.ativo)} />
              <a href={`/admin/atividades/${a.id}`}>
                <GhostButton>Editar</GhostButton>
              </a>
              <button
                type="button"
                onClick={() => excluir(a.id)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red"
                title="Excluir"
              >
                <Icon name="trash" size={13} />
              </button>
            </div>
          );
        })}
        {atividades.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma atividade cadastrada ainda.</p>}
        <div className="py-3">
          <GhostButton onClick={criar} className={pending ? "opacity-60" : ""}>
            {pending ? "Criando..." : "+ Criar atividade"}
          </GhostButton>
        </div>
      </Card>

      <Toast message={toast} />
    </div>
  );
}

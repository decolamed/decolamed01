import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/admin/card";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { CronogramaDia } from "@/types/database";

const PATH = "/admin/cronograma";
const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

async function salvarDia(diaSemana: number, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const atividades = String(formData.get("atividades") ?? "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const { error } = await supabase.from("cronograma_dias").upsert(
    {
      dia_semana: diaSemana,
      titulo: String(formData.get("titulo") ?? "Missão do dia").trim() || "Missão do dia",
      atividades
    },
    { onConflict: "dia_semana" }
  );

  revalidatePath(PATH);
  revalidatePath("/aluno/cronograma");
  if (error) redirect(`${PATH}?erro=${encodeURIComponent("Não foi possível salvar esse dia.")}`);
  redirect(`${PATH}?sucesso=${encodeURIComponent(`${DIAS[diaSemana]} atualizado(a).`)}`);
}

export default async function AdminCronogramaPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase.from("cronograma_dias").select("*");
  const porDia = new Map((data as CronogramaDia[] ?? []).map((d) => [d.dia_semana, d]));

  return (
    <div>
      <PageHeader
        title="Cronograma & Missões"
        subtitle="Cronograma Base fixo, igual para todos os alunos (o Copiloto adapta a partir daqui para quem tem o plano PRO)"
      />
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {DIAS.map((nome, i) => {
          const dia = porDia.get(i);
          const salvarComDia = salvarDia.bind(null, i);
          return (
            <Card key={i}>
              <h2 className="text-sm font-extrabold text-navy-dark">{nome}</h2>
              <form action={salvarComDia} className="mt-3 space-y-2">
                <input
                  name="titulo"
                  defaultValue={dia?.titulo ?? "Missão do dia"}
                  placeholder="Título da missão"
                  className="w-full rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-xs font-bold text-navy-dark outline-none focus:border-navy"
                />
                <textarea
                  name="atividades"
                  rows={4}
                  defaultValue={(dia?.atividades ?? []).join("\n")}
                  placeholder={"Uma atividade por linha, ex:\nAula · Citologia · 35 min\n20 questões · Banco de Questões"}
                  className="w-full resize-y rounded-[10px] border border-navy-dark/15 px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
                />
                <SubmitButton
                  pendingText="Salvando..."
                  className="rounded-[11px] bg-orange px-4 py-2 text-xs font-bold text-white hover:bg-orange-dark"
                >
                  Salvar {nome}
                </SubmitButton>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use server";

import { redirect } from "next/navigation";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { salvarBriefingDoAluno } from "@/lib/briefing/salvar-briefing";

// O núcleo (validação, upsert em `aluno_briefing`, regeração da rota pelo
// motor de sempre e nova rodada do Copiloto) mora em
// lib/briefing/salvar-briefing.ts, porque agora tem dois chamadores: o aluno
// aqui — que continua sendo o dono do RECALIBRAR VOO — e o mentor, no painel
// administrativo, que preenche o briefing INICIAL do Voo Guiado.
//
// A permissão é de cada chamador. Aqui é sempre o próprio aluno logado: o
// `alunoId` vem da sessão, nunca do formulário.

// Usada pelo <form action={...}> de /aluno/briefing — redireciona de
// verdade porque é uma submissão de formulário real.
export async function salvarBriefing(formData: FormData) {
  const profile = await requireAcessoAluno();
  const resultado = await salvarBriefingDoAluno(profile.id, formData);
  if (!resultado.ok) {
    redirect(`/aluno/briefing?erro=${encodeURIComponent(resultado.erro)}`);
  }
  redirect("/aluno/tutorial");
}

// Usada pelo app gamificado (decola-app.tsx) — chamada direta de um método
// de classe, sem <form> nem navegação de página; o componente decide o que
// fazer com o resultado (mostrar erro, trocar de tela internamente etc.).
export async function salvarBriefingApp(formData: FormData) {
  const profile = await requireAcessoAluno();
  return salvarBriefingDoAluno(profile.id, formData);
}

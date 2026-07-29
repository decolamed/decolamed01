"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/admin/card";
import { Chip, TextInput, TextArea, FieldLabel, PrimaryButton, Toast, useToast } from "@/components/admin/interactive";
import { salvarMetadadosAtividade } from "../actions";
import type { Atividade, AtividadeGabaritoModo } from "@/types/database";

// `rotuloNota` vem de rotuloNotaPonderada() (lib/site/marca.ts) e reflete o
// nome de vestibular configurado em /admin/configuracoes — o nome da
// instituição não fica escrito no código.
export function MetadadosForm({ atividade, rotuloNota }: { atividade: Atividade; rotuloNota: string }) {
  const [titulo, setTitulo] = useState(atividade.titulo);
  const [materia, setMateria] = useState(atividade.materia ?? "");
  const [descricao, setDescricao] = useState(atividade.descricao ?? "");
  const [gabaritoModo, setGabaritoModo] = useState<AtividadeGabaritoModo>(atividade.gabarito_modo);
  const [tempoLimite, setTempoLimite] = useState(atividade.tempo_limite_minutos ? String(atividade.tempo_limite_minutos) : "");
  const [pesoFacape, setPesoFacape] = useState(String(atividade.peso_facape));
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function salvar() {
    startTransition(async () => {
      const res = await salvarMetadadosAtividade(atividade.id, {
        titulo,
        materia,
        descricao,
        gabaritoModo,
        tempoLimiteMinutos: tempoLimite.trim() ? Number(tempoLimite) : null,
        pesoFacape: Number(pesoFacape) || 1
      });
      show(res.ok ? "Configurações salvas." : "Não foi possível salvar.");
    });
  }

  return (
    <Card>
      <h2 className="text-sm font-extrabold text-navy-dark">Configurações da atividade</h2>
      <FieldLabel>Título</FieldLabel>
      <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <FieldLabel>Matéria (opcional)</FieldLabel>
      <TextInput value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Ex.: Biologia" />
      <FieldLabel>Descrição (opcional)</FieldLabel>
      <TextArea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

      <FieldLabel>Quando o aluno vê o gabarito</FieldLabel>
      <div className="flex gap-1.5">
        <Chip active={gabaritoModo === "imediato"} onClick={() => setGabaritoModo("imediato")}>Imediato (questão a questão)</Chip>
        <Chip active={gabaritoModo === "apos_envio"} onClick={() => setGabaritoModo("apos_envio")}>Só depois de enviar tudo</Chip>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Tempo limite (min, vazio = sem limite)</FieldLabel>
          <TextInput type="number" value={tempoLimite} onChange={(e) => setTempoLimite(e.target.value)} placeholder="Ex.: 40" />
        </div>
        <div>
          <FieldLabel>{`Peso na ${rotuloNota.toLowerCase()}`}</FieldLabel>
          <TextInput type="number" step="0.1" value={pesoFacape} onChange={(e) => setPesoFacape(e.target.value)} />
        </div>
      </div>

      <PrimaryButton onClick={salvar} className={`mt-4 ${pending ? "opacity-60" : ""}`}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </PrimaryButton>
      <Toast message={toast} />
    </Card>
  );
}

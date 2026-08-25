import { Field } from "@/app/(admin)/admin/planos/page";

// O mesmo bloco aparece no formulário de CRIAR e no de EDITAR plano. Ele mora
// aqui num arquivo só porque os dois precisam apresentar exatamente as mesmas
// opções e o mesmo texto — o parcelamento ao lado é duplicado entre as duas
// telas e já divergiu uma vez.

export interface ProfessorDisponivel {
  id: string;
  nome: string;
}

export function ComissaoDeRedacao({
  professores,
  valorPadrao,
  professorPadrao
}: {
  professores: ProfessorDisponivel[];
  /** Em centavos, como está no banco. */
  valorPadrao?: number;
  professorPadrao?: string | null;
}) {
  return (
    <fieldset className="rounded-xl border border-navy/10 bg-navy/5 p-4">
      <legend className="px-2 text-sm font-bold text-navy-dark">Comissão de redação</legend>

      <p className="text-xs text-navy-dark/60">
        Valor <strong>fixo por venda</strong> devido à professora que corrige as redações deste plano. A cada
        venda confirmada, a comissão é registrada automaticamente como pendente e aparece no Financeiro dela
        e em Repasses.
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold" htmlFor="professor_id">
            Professora responsável
          </label>
          <select
            id="professor_id"
            name="professor_id"
            defaultValue={professorPadrao ?? ""}
            className="mt-1 w-full rounded-lg border p-3"
          >
            <option value="">Nenhuma — este plano não gera comissão de redação</option>
            {professores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Valor por venda (R$)"
          name="comissao_redacao"
          type="number"
          step="0.01"
          placeholder="Ex: 80,00"
          defaultValue={valorPadrao ? String(valorPadrao / 100) : ""}
        />
      </div>

      {professores.length === 0 && (
        <p className="mt-3 text-xs font-semibold text-orange-dark">
          Nenhum professor cadastrado ainda. Cadastre um em Usuários para poder atribuir a comissão.
        </p>
      )}

      <p className="mt-3 text-xs text-navy-dark/60">
        O valor gravado é o que valia <strong>no dia da venda</strong>. Alterar a comissão aqui vale para as
        próximas vendas — as anteriores continuam com o valor que foi combinado na época.
      </p>
    </fieldset>
  );
}

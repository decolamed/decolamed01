import { ConfirmacaoPagamento } from "@/components/site/confirmacao-pagamento";

// O título e o texto de apoio saíram daqui e foram para o componente cliente
// de propósito: eles MUDAM quando o pagamento é confirmado, e esta página é
// um Server Component — ela não tem como saber que o Pix caiu enquanto o
// aluno está com ela aberta. Deixar o cabeçalho aqui manteria "Falta pouco!"
// escrito acima de uma tela que já diz "Pagamento confirmado".
export default function ConfirmacaoPage({ searchParams }: { searchParams: { chargeId?: string } }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <ConfirmacaoPagamento chargeId={searchParams.chargeId} />
    </section>
  );
}

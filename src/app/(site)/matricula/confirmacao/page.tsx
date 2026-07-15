import { ConfirmacaoPagamento } from "@/components/site/confirmacao-pagamento";

export default function ConfirmacaoPage({ searchParams }: { searchParams: { chargeId?: string } }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 text-center">
      <h1 className="font-display text-3xl font-extrabold text-white">Falta pouco! 🚀</h1>
      <p className="mt-4 text-white/80">
        Sua cobrança foi gerada com sucesso. Finalize o pagamento para liberar seu acesso automaticamente.
      </p>

      <ConfirmacaoPagamento chargeId={searchParams.chargeId} />

      <p className="mt-6 text-xs text-white/50">
        Não recebeu o link para pagamento? Verifique seu e-mail de confirmação ou fale conosco no WhatsApp.
      </p>
    </section>
  );
}

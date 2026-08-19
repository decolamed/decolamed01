import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { formatarCentavos, formatarData } from "@/lib/formatacao";

// Cada número do painel é um atalho: quem olha "3 matrículas pendentes" quer
// abrir a lista em seguida. Antes os cartões eram só texto, e a única forma de
// chegar à tela correspondente era pelo menu lateral.
interface CartaoDoPainel {
  icone: string;
  label: string;
  valor: string;
  detalhe?: string;
  href: string;
  destaque?: boolean;
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [
    { count: totalAlunos },
    { count: totalMatriculasAtivas },
    { count: matriculasPendentes },
    { count: totalPlanos },
    { count: totalParceiros },
    { data: vendasRecentes },
    { data: ultimasVendas }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "aluno"),
    supabase.from("matriculas").select("*", { count: "exact", head: true }).eq("status", "ativa"),
    supabase.from("matriculas").select("*", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("planos").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parceiro"),
    supabase.from("pagamentos").select("valor_centavos, status").in("status", ["confirmado", "recebido"]),
    supabase
      .from("pagamentos")
      .select("id, comprador_nome, plano_nome, valor_centavos, data_pagamento")
      .in("status", ["confirmado", "recebido"])
      .order("data_pagamento", { ascending: false })
      .limit(5)
  ]);

  const efetivadas = vendasRecentes ?? [];
  const totalVendidoCentavos = efetivadas.reduce((s, v) => s + v.valor_centavos, 0);
  const ticketMedioCentavos = efetivadas.length > 0 ? Math.round(totalVendidoCentavos / efetivadas.length) : 0;

  const cards: CartaoDoPainel[] = [
    {
      icone: "money",
      label: "Total vendido",
      valor: formatarCentavos(totalVendidoCentavos),
      detalhe: `${efetivadas.length} venda${efetivadas.length === 1 ? "" : "s"} · ticket ${formatarCentavos(ticketMedioCentavos)}`,
      href: "/admin/vendas",
      destaque: true
    },
    {
      icone: "user",
      label: "Alunos cadastrados",
      valor: String(totalAlunos ?? 0),
      href: "/admin/usuarios"
    },
    {
      icone: "check",
      label: "Matrículas ativas",
      valor: String(totalMatriculasAtivas ?? 0),
      detalhe:
        (matriculasPendentes ?? 0) > 0
          ? `${matriculasPendentes} aguardando liberação`
          : "Nenhuma pendente",
      href: "/admin/matriculas"
    },
    {
      icone: "bag",
      label: "Planos ativos",
      valor: String(totalPlanos ?? 0),
      href: "/admin/planos"
    },
    {
      icone: "gift",
      label: "Parceiros",
      valor: String(totalParceiros ?? 0),
      href: "/admin/usuarios?role=parceiro"
    }
  ];

  const vendas = ultimasVendas ?? [];

  return (
    <div>
      <PageHeader title="Visão geral" subtitle="O estado da plataforma agora. Toque em um número para abrir a tela correspondente." />

      {/* 2 colunas no celular, 3 no tablet, 5 só quando cabe de verdade — em
          `lg:grid-cols-5` num tablet os cartões ficavam estreitos demais e o
          valor quebrava em duas linhas. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="group block">
            <Card
              className={`h-full transition hover:border-orange/40 hover:shadow-sm ${
                card.destaque ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  card.destaque ? "bg-green/10 text-green" : "bg-orange/10 text-orange"
                }`}
              >
                <Icon name={card.icone} size={18} />
              </span>
              <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wide text-navy-dark/40">{card.label}</p>
              <p
                className={`mt-0.5 font-display text-2xl font-extrabold sm:text-[28px] ${
                  card.destaque ? "text-green" : "text-navy-dark"
                }`}
              >
                {card.valor}
              </p>
              {card.detalhe && <p className="mt-1 text-[11px] font-semibold text-navy-dark/50">{card.detalhe}</p>}
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-extrabold text-navy-dark">Últimas vendas</h2>
            <Link href="/admin/vendas" className="text-xs font-bold text-navy hover:underline">
              Ver todas
            </Link>
          </div>
          {vendas.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-navy-dark/50">Nenhuma venda confirmada ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy-dark/10">
              {vendas.map((v) => (
                <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy-dark">{v.comprador_nome ?? "—"}</p>
                    <p className="truncate text-[11px] font-semibold text-navy-dark/50">
                      {v.plano_nome ?? "Sem plano"} · {formatarData(v.data_pagamento)}
                    </p>
                  </div>
                  <p className="font-display text-sm font-extrabold text-green">{formatarCentavos(v.valor_centavos)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

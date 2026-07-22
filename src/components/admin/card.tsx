import type { ReactNode } from "react";

// Primitivas visuais compartilhadas do painel admin, no mesmo sistema do
// design "Decola Med Admin" (cantos 16px, borda navy/10, sombra suave).
// São Server Components puros (só marcação + classes) — nenhuma delas
// precisa de estado no cliente.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-navy-dark/10 bg-white p-[18px] ${className}`}>{children}</div>;
}

export function StatCard({ label, value, tone = "navy" }: { label: string; value: ReactNode; tone?: "navy" | "green" | "orange" }) {
  const toneClass = tone === "green" ? "text-green" : tone === "orange" ? "text-orange" : "text-navy-dark";
  return (
    <Card>
      <p className={`font-display text-xl font-extrabold sm:text-2xl ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark/40">{label}</p>
    </Card>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-extrabold text-navy-dark sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs font-semibold text-navy-dark/60 sm:text-sm">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "green" | "red" | "orange" | "neutral"; children: ReactNode }) {
  const classes: Record<string, string> = {
    green: "bg-green/10 text-green",
    red: "bg-red/10 text-red",
    orange: "bg-orange/10 text-orange",
    neutral: "bg-navy-dark/5 text-navy-dark/60"
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${classes[tone]}`}>{children}</span>;
}

// Aviso fixo no topo das seções de conteúdo que ainda não têm tabela no
// banco (Cursos, Cronograma, Questões, Simulados, Flashcards, PDFs, Links,
// Banners, Conquistas, Notificações, Relatos — ver ARCHITECTURE.md seção
// 10). A interação é real e funcional, mas o estado vive só na sessão do
// navegador — atualizar a página reseta para os dados de exemplo.
export function PreviewBanner() {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-[11px] border border-orange/25 bg-orange/5 p-3 text-xs font-semibold leading-relaxed text-navy-dark">
      <span className="mt-0.5 shrink-0 text-orange">⚠</span>
      <span>
        Prévia funcional — as alterações aqui ficam só nesta sessão do navegador (sem tabela no banco ainda). A interface e as
        interações já refletem exatamente como esta tela vai se comportar quando a persistência for implementada.
      </span>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-2 mt-4 text-[10px] font-extrabold uppercase tracking-widest text-navy-dark/40">{children}</div>;
}

// Wrapper de tabela responsiva — o design usa grid de colunas fixas; aqui
// mantemos <table> semântica (mais acessível/ordenável) só restilizada.
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-dark/10 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap border-b border-navy-dark/10 bg-navy-dark/[0.03] p-3 text-[10px] font-extrabold uppercase tracking-wide text-navy-dark/40">{children}</th>;
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-t border-navy-dark/10 p-3 align-top text-sm ${className}`}>{children}</td>;
}

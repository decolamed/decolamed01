import { createAdminClient } from "@/lib/supabase/server";
import { textoConfig } from "@/lib/site/configuracoes";
import { AZUL_MARCA } from "@/components/marca-carregando";

// Manifesto do PWA servido dinamicamente (em vez do antigo
// public/manifest.json estático) para que o ícone do aplicativo possa ser
// trocado pelo painel administrativo, sem deploy.
//
// O ícone padrão (/assets/icone-*.png) tem o azul da marca embutido: a logo
// original é branca com fundo transparente e, sozinha, sumia sobre o fundo
// branco que Android/iOS aplicam ao instalar o app.
const ICONE_PADRAO_192 = "/assets/icone-192.png";
const ICONE_PADRAO_512 = "/assets/icone-512.png";
const ICONE_PADRAO_MASKABLE = "/assets/icone-maskable-512.png";

export const dynamic = "force-dynamic";

export async function GET() {
  // Client de serviço: o manifesto é buscado pelo navegador sem cookies de
  // sessão, então uma leitura sob RLS de usuário anônimo falharia.
  let iconeCustomizado = "";
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("configuracoes").select("valor").eq("chave", "site.marca.icone_url").maybeSingle();
    iconeCustomizado = textoConfig(data?.valor);
  } catch (e) {
    // Sem banco disponível o app ainda precisa ser instalável — cai no padrão.
    console.error("Falha ao ler o ícone configurado; usando o padrão:", e);
  }

  const icons = iconeCustomizado
    ? [
        { src: iconeCustomizado, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: iconeCustomizado, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: iconeCustomizado, sizes: "512x512", type: "image/png", purpose: "maskable" }
      ]
    : [
        { src: ICONE_PADRAO_192, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: ICONE_PADRAO_512, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: ICONE_PADRAO_MASKABLE, sizes: "512x512", type: "image/png", purpose: "maskable" }
      ];

  return Response.json(
    {
      name: "Decola Med",
      short_name: "Decola Med",
      description: "Preparação estratégica para Medicina — cronograma, questões, simulados e acompanhamento de desempenho.",
      start_url: "/aluno",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      // O splash que o Android/iOS desenham ao abrir o PWA usa esta cor. Ela
      // precisa ser IDÊNTICA ao fundo de components/splash-screen, senão o
      // usuário vê duas telas de carregamento seguidas — ver o comentário lá.
      background_color: AZUL_MARCA,
      theme_color: AZUL_MARCA,
      icons
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}

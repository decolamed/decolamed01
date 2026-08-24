"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { redefinirPerfilAluno } from "./redefinir-perfil-actions";
import { formatarNota } from "@/lib/site/nota";
import { acervoPesquisavel, assuntoDaChave, buscarNosEstudos, MINIMO_PARA_BUSCAR } from "@/lib/site/busca-estudos";
import { ICONE_TIPO, ROTULO_TIPO } from "@/lib/trilha/catalogo";
import { numeroDoLivro, urlDoResumo, type LinksDosResumos } from "@/lib/site/resumos-livros";
import { registrarResposta } from "./questoes/actions";
import { registrarRevisao } from "./flashcards/actions";
import { submeterSimulado, buscarGabaritoTentativa, type ResultadoSimulado, type ItemGabarito } from "./simulados/[id]/actions";
import { marcarMissaoConcluida } from "./cronograma/actions";
import { marcarRecomendacao } from "./copiloto/actions";
import { marcarNotificacaoLida } from "./notificacoes-actions";
import { salvarBriefingApp } from "./briefing/actions";
import { salvarProgressoVideo, alternarConclusaoItem } from "./progresso-actions";
import { OnboardingCarousel } from "@/components/onboarding/onboarding-carousel";
import { dataISO, hojeISO, somarDias, dataBR, nomeDoDiaDaSemana, dataDoDiaTrilha } from "@/lib/site/data";
import { chaveAula, chaveDeAula, chaveItemTrilha, chaveDeItemTrilha, itensQueContam, youtubeVideoId } from "@/lib/trilha/progresso";
import { tituloDaProva } from "@/lib/trilha/rota";
import { chaveSessaoExtra, chaveSessaoMissao, chaveSessaoTrilha } from "@/lib/trilha/sessao-questoes";
import { disponivelParaAluno } from "@/lib/site/avaliacoes";
import { escreverSentimentos } from "@/lib/site/sentimentos";
import { codigoDaQuestao } from "@/lib/site/questao-identidade";
import { mesmaMateria, materiaCanonica, chaveMateria } from "@/lib/site/materia-canonica";
import styles from "./decola-app.module.css";
import type {
  Questao,
  Flashcard,
  Simulado,
  SimuladoTentativa,
  MateriaPeso,
  RankingLinha,
  AlunoMissao,
  TrilhaDia,
  TrilhaItem,
  AlunoProgressoItem,
  EstudosBotao,
  CopilotoRecomendacao,
  Notificacao,
  AlunoBriefing,
  Banner,
  ConteudoBiblioteca,
  LinkExterno,
  ImagemQuestao
} from "@/types/database";

// Um dia do cronograma como as telas o recebem. No Voo Guiado vem da rota
// (`lib/trilha/rota.ts`) e traz a data agendada e o tipo do dia; no Plano
// Decolando é o dia do template puro, sem esses campos.
type DiaDoCronograma = TrilhaDia & {
  scheduled_date?: string;
  template_days?: number[];
  tipo_rota?: "estudo" | "simulado" | "revisao" | "descanso" | "prova";
};

interface DecolaAppDados {
  temCopiloto: boolean;
  questoes: Questao[];
  flashcards: Flashcard[];
  simulados: Simulado[];
  simuladoQuestoesCount: Record<string, number>;
  simuladoQuestoes: Record<string, { id: string; enunciado: string; alternativas: { id: string; texto: string }[]; materia: string; assunto: string | null; imagens: ImagemQuestao[] }[]>;
  tentativas: SimuladoTentativa[];
  ranking: RankingLinha[];
  respostas: { correta: boolean; created_at: string; questoes: { materia: string; assunto: string | null } | null }[];
  revisoes: { lembrou: boolean; created_at: string }[];
  pesos: MateriaPeso[];
  missoes: AlunoMissao[];
  trilhaHoje: DiaDoCronograma | null;
  // Próximos dias do cronograma — é o que a tela de cronograma mostra
  // abaixo da missão de hoje (antes, só as missões do Copiloto apareciam
  // ali, então quem não tinha missões via um cronograma "vazio").
  trilhaProximos: DiaDoCronograma[];
  // Posição do aluno na rota dele (1..N) — no Voo Guiado é o routeDay, no
  // Decolando é o dia do template contado da matrícula.
  diaTrilhaHoje: number | null;
  // Data real de cada dia da rota (routeDay → YYYY-MM-DD). Existe sempre que
  // há rota; é a única fonte de datas do cronograma quando presente.
  datasDoCronograma?: Record<number, string> | null;
  // Total de dias da rota — o "de N" do "Dia 2 de 19".
  totalDiasCronograma?: number;
  // Dias já passados do cronograma. Ficam visíveis (recolhidos) para o aluno
  // consultar e concluir o que ficou para trás.
  trilhaAnteriores: DiaDoCronograma[];
  // O cronograma-base foi projetado na janela real deste aluno (Voo Guiado
  // com menos dias até a prova do que a trilha original tem). Serve para a
  // tela avisar que os dias vêm agrupados — sem o aviso, o aluno acharia que
  // sumiu conteúdo.
  cronogramaCompactado?: boolean;
  progressoItens: Record<string, AlunoProgressoItem>;
  recomendacoes: CopilotoRecomendacao[];
  notificacoes: Notificacao[];
  briefing: AlunoBriefing | null;
  // Voo Guiado que ainda não teve o briefing preenchido pelo mentor. O
  // briefing inicial passou a ser feito no painel administrativo, depois da
  // mentoria — o aluno não preenche mais. Falso no Decolando, que não tem
  // briefing e segue no fluxo de sempre.
  aguardandoMentor?: boolean;
  creditosRedacaoDisponiveis: number;
  creditosRedacaoTotais: number;
  creditosRedacaoConsumidos: number;
  banners: Banner[];
  conteudos: ConteudoBiblioteca[];
  linksExternos: LinkExterno[];
  // Aulas/PDFs/links que existem SÓ dentro dos dias do cronograma
  // (trilha_dias.itens), sem linha correspondente em conteudos_biblioteca.
  // Sem isso, a aba Estudos anunciava "0 aulas" mesmo com centenas de
  // videoaulas na plataforma: os cards contavam apenas a biblioteca, e
  // todo o material importado mora nos dias do cronograma.
  conteudosTrilha: { tipo: "aula" | "pdf" | "link"; ref_id: string | null; url: string; titulo: string; materia: string | null }[];
  estudosBotoes: EstudosBotao[];
  baseTemasUrl: string | null;
  // Destino do botão "Termos de Uso" nas configurações do aluno. Vazio =
  // botão escondido, em vez de apontar pra um endereço inventado.
  termosUsoUrl: string | null;
  // Endereço dos quatro resumos de livro, indexado pelo número do livro e
  // cadastrado em /admin/configuracoes. Os itens do cronograma já chegam
  // resolvidos por `resolverCronograma`; este mapa cobre o que não passa
  // por lá — as missões do Copiloto, que copiam só o título.
  linksDosResumos: LinksDosResumos;
  // Nome do vestibular/instituição vindo de /admin/configuracoes (ver
  // lib/site/marca.ts) — nada de instituição escrita no código, pra
  // plataforma poder atender outros processos seletivos.
  nomeVestibular: string;
  // Matérias derivadas do conteúdo real (ver lib/site/materias.ts). Antes o
  // app tinha a própria lista fixa — com "Português/Literatura" e "Língua
  // Estrangeira", nomes que não existem em `questoes.materia`. O Copiloto
  // lê o sentimento por `sentimentos[materia]` usando o nome do banco (ver
  // lib/copiloto/motor.ts), então essas duas autoavaliações eram jogadas
  // fora sem ninguém perceber.
  materias: string[];
  hojeStr: string;
}

interface DecolaAppProps {
  alunoId: string;
  nome: string;
  email: string;
  plano: "decolando" | "voo-guiado";
  whatsappSuporte: string;
  whatsappRedacao: string;
  // Canal de comunicação de erros. É o MESMO número geral da plataforma
  // (`site.contato.whatsapp`), montado no servidor com a mensagem inicial —
  // por isso nenhum número aparece aqui no cliente e trocar a configuração
  // no admin passa a valer sem tocar em código.
  whatsappErro: string;
  // Id de `conteudos_biblioteca` para abrir no player assim que o app
  // carrega. Chega por `/aluno?aula=<id>` — é assim que a revisão em vídeo
  // do Copiloto abre a aula certa em vez de uma lista.
  abrirAulaId?: string | null;
  dados: DecolaAppDados;
  // Vitrine somente-leitura usada em /preview-aluno (botão "Ver app do
  // aluno" do admin e "Demonstração grátis" do parceiro): mostra conteúdo
  // real (questões, flashcards, simulados, banners etc.), mas nunca grava
  // nada em tabelas de aluno de verdade — quem está vendo não tem
  // matrícula nem é um aluno de fato.
  demoMode?: boolean;
}

// Porte do protótipo navegável "Decola Med App.dc.html" (Claude Design) para
// dentro do Next.js. Mantido como um único componente de classe, igual ao
// original, para preservar fielmente a lógica de navegação/estado entre as
// ~25 telas — quebrar em vários componentes teria alto risco de divergir do
// design aprovado sem ganho real (é uma área nova, ainda sem consumidores
// externos do estado).
//
// O que NÃO veio do protótipo, de propósito:
// - Telas de login/cadastro/onboarding: a autenticação real já existe
//   (Supabase Auth) e é feita antes desta tela renderizar.
// - A barra de status falsa (relógio "9:41", sinal, bateria) do mockup de
//   celular: fazia sentido só dentro do preview do Claude Design.
// - Imagens do mascote (assets/mascote/*.png): não puderam ser importadas
//   do projeto de design nesta rodada (arquivos grandes, acima do limite de
//   leitura da ferramenta) — substituídas por selos de ícone no mesmo
//   sistema visual já usado no resto do app.
//
// O restante (missões, XP, banco de questões, flashcards, simulados,
// cronograma, copiloto) já lê e grava nas tabelas reais do Supabase — ver
// aluno/page.tsx e ARCHITECTURE.md.
export default class DecolaApp extends React.Component<DecolaAppProps, any> {
  // Timer do aviso de rodapé (ver avisar()/avisoToast()); limpo no unmount
  // pra não chamar setState num componente já desmontado.
  timerAviso: ReturnType<typeof setTimeout> | null = null;
  timerNota: ReturnType<typeof setTimeout> | null = null;
  state: any = {
    theme: null,
    // Primeiro acesso (ou aluno que nunca preencheu o "de voo"): entra
    // direto no briefing — ao concluir, salvarBriefingReal() manda pro
    // tutorial (scrTutorial, que também explica como instalar o app) e só
    // depois pro Mapa. Quem já tem briefing salvo entra direto no Mapa.
    screen: (function (self: any) {
      if (self.props.demoMode) return "mapa";
      if (self.props.dados.briefing) return "mapa";
      // Voo Guiado sem briefing: quem preenche é o mentor, no painel. O aluno
      // entra normalmente e usa o resto da plataforma; só a área de
      // cronograma mostra que o plano está sendo preparado (ver scrPlano).
      //
      // O Decolando continua caindo no briefing, exatamente como antes: ele
      // não tem Copiloto e este ramo não o alcança.
      if (self.props.dados.aguardandoMentor) return "mapa";
      return "briefing";
    })(this),
    simView: null,
    simIdx: 0,
    simAns: {},
    simGrid: false,
    simSec: 0,
    practice: false,
    qIdx: 0,
    qPicked: null,
    qDone: false,
    reviewMode: false,
    revIdx: 0,
    revPicked: null,
    revDone: false,
    revScore: 0,
    revFinished: false,
    missTab: "diarias",
    upcomingOpen: false,
    qMateria: null,
    // Texto do campo de busca da aba Estudos. Ele existia sem estado
    // nenhum: o aluno digitava e a tela não reagia (ver scrEstudos).
    buscaEstudos: "",
    resetConfirmando: false,
    resetEmAndamento: false,
    achTab: "brasoes",
    notifOpen: false,
    moreOpen: false,
    push: true,
    feels: (function (self: any) {
      const sentimentos = self.props.dados.briefing?.sentimentos || {};
      const inicial: Record<string, string> = {};
      (self.props.dados.materias as string[]).forEach((m) => {
        inicial[m] = sentimentos[m] || "Atenção";
      });
      return inicial;
    })(this),
    gabFrom: null,
    fcIdx: 0,
    fcFlip: false,
    fcOk: 0,
    fcPool: [] as Flashcard[],
    fcModoAberto: null as "materia" | "assunto" | null,
    browserTitle: null,
    browserUrl: null,
    browserBack: "mapa",
    browserReloadKey: 0,
    browserCarregou: false,
    browserFalhou: false,
    contTitle: null,
    contTipo: null as "aula" | "pdf" | "link" | null,
    contBack: "estudos",
    playerChave: null as string | null,
    playerTitulo: "",
    playerUrl: "",
    playerBack: "estudos",
    playerPosicaoInicial: 0,
    // Aulas irmãs (do mesmo dia do cronograma ou da mesma lista) — é o que
    // dá ao player cara de plataforma de curso: o aluno troca de aula sem
    // voltar pra tela anterior.
    playerLista: [] as { id: string | null; titulo: string; url: string; materia?: string | null }[],
    mostrarOnboarding: false,
    brief: (function (self: any) {
      const b = self.props.dados.briefing;
      if (b) {
        return {
          prova: b.data_prova || "",
          inicio: b.inicio_estudos || "",
          dias: b.dias_estuda?.length || 5,
          horas: Math.round(b.horas_por_dia_semana || 3),
          // Sem padrão: escolher um idioma por conta própria entregaria
          // metade do conteúdo errado a quem nunca respondeu a pergunta.
          idioma: (b as { idioma_prova?: string | null }).idioma_prova || ""
        };
      }
      return { prova: "", inicio: "", dias: 5, horas: 3, idioma: "" };
    })(this),
    chat: null,
    chatInput: "",
    copIdx: 0,
    copAns: {},
    calMonth: 0,
    calSel: null,
    aviso: null as string | null,
    // A trilha é contínua: o que já passou continua na tela, marcado como
    // concluído, para o aluno poder revisitar e reassistir. Começar recolhido
    // dava a impressão de que os dias cumpridos sumiam do cronograma.
    mostrarDiasAnteriores: true,
    // Feedback visual do salvamento das anotações: "Salvando..." enquanto o
    // aluno digita, "Salvo ✓" logo depois. O salvamento sempre foi
    // automático, mas nada indicava isso na tela.
    notaStatus: null as null | "salvando" | "salvo",
    tutStep: 0,
    podeInstalarPWA: false,
    pwaInstalada: false,
    mostrarInstrucoesPWA: false,
    senhaNova: "",
    senhaConfirma: "",
    senhaErro: null as string | null,
    senhaSalvando: false,
    senhaSalva: false,
    w: 390,
    qResult: null as { correta: boolean; respostaCorreta: string; explicacao: string | null } | null,
    qSalvando: false,
    revResult: null as { correta: boolean; respostaCorreta: string; explicacao: string | null } | null,
    revSalvando: false,
    revPool: [] as Questao[],
    simId: null as string | null,
    simResult: null as ResultadoSimulado | null,
    simEnviando: false,
    gabaritoHistorico: null as ItemGabarito[] | null,
    gabaritoCarregando: false,
    briefSalvando: false,
    briefErro: null as string | null,
    notifsLocal: (function (self: any) {
      return self.props.dados.notificacoes as Notificacao[];
    })(this),
    missoesLocal: (function (self: any) {
      return self.props.dados.missoes as AlunoMissao[];
    })(this),
    recsLocal: (function (self: any) {
      return self.props.dados.recomendacoes as CopilotoRecomendacao[];
    })(this),
    progressoLocal: (function (self: any) {
      return self.props.dados.progressoItens as Record<string, AlunoProgressoItem>;
    })(this)
  };

  _t: any;
  _b: any;
  _r: any;
  _bip: any;
  // Instância do YouTube IFrame Player da videoaula atual (scrPlayer()) — vive
  // fora do state porque é um objeto imperativo da API do YouTube, não dado
  // serializável de UI. _ytVideoIdAtual evita recriar o player à toa quando
  // o React só re-renderiza a mesma aula (ex.: progresso salvo no state).
  _ytPlayer: any = null;
  _ytVideoIdAtual: string | null = null;
  _ytProgressoInterval: any = null;
  // O div que o REACT possui. A API do YouTube SUBSTITUI o elemento que
  // recebe pelo iframe dela — por isso ela nunca recebe este, e sim um filho
  // criado aqui dentro. Sem essa separação, o nó que o React acha que
  // controla deixa de existir no meio da reprodução.
  _ytHost: HTMLDivElement | null = null;
  _installed: any;
  _deferredInstallPrompt: any = null;

  componentDidMount() {
    // Deep link de aula (`/aluno?aula=<id>`). Resolve pelo ID real do
    // conteúdo — nunca pelo título, que não é identificador e muda quando o
    // admin corrige o nome da aula.
    if (this.props.abrirAulaId) {
      const aula = this.props.dados.conteudos.find((c) => c.id === this.props.abrirAulaId && c.url);
      if (aula) {
        this.abrirAula(aula.id, aula.titulo, aula.url as string, "mapa");
      } else {
        this.avisar("Esta aula não está mais disponível.");
      }
    }
    this._r = () => this.setState({ w: window.innerWidth });
    window.addEventListener("resize", this._r);
    this._r();
    this._t = setInterval(() => {
      if (this.state.simView === "run") this.setState((s: any) => ({ simSec: s.simSec + 1 }));
    }, 1000);
    this._b = setInterval(() => {
      const el = document.getElementById("dm-ban");
      if (el && this.state.screen === "mapa" && el.children.length > 1) {
        const n = el.children.length - 1;
        const w = (el.children[0] as HTMLElement).offsetWidth + 10;
        const idx = Math.round(el.scrollLeft / w);
        if (idx >= n) {
          el.scrollTo({ left: 0, behavior: "auto" });
        } else {
          el.scrollTo({ left: (idx + 1) * w, behavior: "smooth" });
        }
      }
    }, 5000);
    // PWA: Chrome/Android/desktop disparam beforeinstallprompt quando o app
    // é instalável (manifest.webmanifest + sw.js registrados em layout.tsx);
    // guardamos o evento pra poder chamar .prompt() depois, no clique do
    // usuário (não dá pra chamar prompt() fora de um gesto do usuário).
    // Safari/iOS nunca dispara esse evento — lá o botão cai no fallback de
    // instruções manuais (ver instalarApp()).
    const jaInstalado = typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as any).standalone === true);
    if (jaInstalado) this.setState({ pwaInstalada: true });
    this._bip = (e: any) => {
      e.preventDefault();
      this._deferredInstallPrompt = e;
      this.setState({ podeInstalarPWA: true });
    };
    window.addEventListener("beforeinstallprompt", this._bip);
    this._installed = () => {
      this._deferredInstallPrompt = null;
      this.setState({ podeInstalarPWA: false, pwaInstalada: true, mostrarInstrucoesPWA: false });
    };
    window.addEventListener("appinstalled", this._installed);
  }
  // O player é objeto imperativo: quem o mantém em dia com o state é esta
  // sincronização, e não o render. Ela é idempotente, então rodar a cada
  // update é seguro — e é o que faz a troca de aula funcionar sem o ref
  // precisar ser recriado.
  componentDidUpdate() {
    this.sincronizarPlayerYoutube();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._r);
    clearInterval(this._t);
    clearInterval(this._b);
    window.removeEventListener("beforeinstallprompt", this._bip);
    window.removeEventListener("appinstalled", this._installed);
    if (this.timerAviso) clearTimeout(this.timerAviso);
    if (this.timerNota) clearTimeout(this.timerNota);
    this.destruirPlayerYoutube();
  }
  // Chamado pelo botão "Instalar aplicativo" do tutorial. Se o navegador
  // suporta o prompt nativo (capturado em beforeinstallprompt), dispara ele;
  // senão (Safari/iOS, ou navegador que já decidiu não oferecer), mostra
  // instruções manuais de "Adicionar à Tela de Início".
  async instalarApp() {
    const prompt = this._deferredInstallPrompt;
    if (!prompt) {
      this.setState({ mostrarInstrucoesPWA: true });
      return;
    }
    prompt.prompt();
    try {
      await prompt.userChoice;
    } catch (e) {}
    this._deferredInstallPrompt = null;
    this.setState({ podeInstalarPWA: false });
  }

  // Breakpoint do layout "Decola Med Desktop": acima disso trocamos a barra
  // de abas + cartão centralizado (mobile/tablet) por uma sidebar fixa em
  // tela cheia, igual ao design de desktop — reaproveitando as mesmas telas
  // (scrMapa, scrPainel etc.), só muda o chrome ao redor.
  wide() {
    return (this.state.w || 0) >= 1150;
  }

  logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  };

  primeiroNome() {
    return (this.props.nome || "Aluno").trim().split(/\s+/)[0];
  }
  iniciais() {
    const partes = (this.props.nome || "Aluno Decola").trim().split(/\s+/);
    const a = partes[0]?.[0] || "A";
    const b = partes[1]?.[0] || partes[0]?.[1] || "D";
    return (a + b).toUpperCase();
  }
  saudacao() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }

  theme() {
    return this.state.theme ?? "dark";
  }
  colors() {
    const dark = this.theme() === "dark";
    return dark
      ? {
          dark: true,
          bg: "#07223a",
          card: "#0c3557",
          card2: "#123f66",
          line: "rgba(191,221,242,.14)",
          txt: "#F4F9FD",
          sub: "rgba(191,221,242,.66)",
          faint: "rgba(191,221,242,.38)",
          orange: "#F36C21",
          orangeSoft: "rgba(243,108,33,.16)",
          blueSoft: "rgba(191,221,242,.12)",
          peach: "rgba(251,226,206,.14)",
          peachTxt: "#FBE2CE",
          green: "#3dd68c",
          greenSoft: "rgba(61,214,140,.15)",
          red: "#ff6b5e",
          redSoft: "rgba(255,107,94,.15)",
          yellow: "#ffc94d",
          chip: "rgba(191,221,242,.09)",
          navBg: "rgba(4,26,44,.94)",
          headGrad: "linear-gradient(160deg,#0d4a79 0%,#01395E 55%,#062b47 100%)"
        }
      : {
          dark: false,
          bg: "#F2F7FB",
          card: "#ffffff",
          card2: "#EDF4FA",
          line: "rgba(1,57,94,.10)",
          txt: "#01395E",
          sub: "rgba(1,57,94,.62)",
          faint: "rgba(1,57,94,.38)",
          orange: "#F36C21",
          orangeSoft: "rgba(243,108,33,.12)",
          blueSoft: "#DCEBF6",
          peach: "#FBE2CE",
          peachTxt: "#9a5218",
          green: "#1fa565",
          greenSoft: "rgba(31,165,101,.12)",
          red: "#e04f42",
          redSoft: "rgba(224,79,66,.10)",
          yellow: "#e0a20f",
          chip: "rgba(1,57,94,.06)",
          navBg: "rgba(255,255,255,.96)",
          headGrad: "linear-gradient(160deg,#0d4a79 0%,#01395E 100%)"
        };
  }

  icon(name: string, size = 22, color = "currentColor", sw = 2) {
    const h = React.createElement;
    const P = (d: string, i: number) => h("path", { d, key: "p" + i });
    const defs: Record<string, string[]> = {
      map: ["M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z", "M9 4v14", "M15 6v14"],
      gauge: ["M12 15l3.5-5.5", "M20.2 17a9 9 0 1 0-16.4 0"],
      book: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z", "M8 7h8"],
      plane: [
        "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
      ],
      bolt: ["M13 2 3 14h7l-1 8 10-12h-7z"],
      flame: [
        "M12 22c4 0 7-2.7 7-7 0-3-2-5.5-3.5-7C14 6 13 4 13 2c-3 2-5 5-5 8-1-1-1.6-2-2-3.5C4.6 8.6 4 10.6 4 12.5 4 17.5 8 22 12 22z"
      ],
      trophy: ["M8 21h8", "M12 17v4", "M7 4h10v6a5 5 0 0 1-10 0z", "M7 6H4a2 2 0 0 0 2 4h1", "M17 6h3a2 2 0 0 1-2 4h-1"],
      check: ["M4 12.5 9.5 18 20 6.5"],
      star4: ["M12 2c.8 4.5 3 7 8 8-5 1-7.2 3.5-8 8-.8-4.5-3-7-8-8 5-1 7.2-3.5 8-8z"],
      star: ["M12 2.5l2.9 5.9 6.6 1-4.7 4.6 1.1 6.5-5.9-3.1-5.9 3.1 1.1-6.5L2.5 9.4l6.6-1z"],
      file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h4"],
      bag: ["M6 8h12l1.5 12.5a1.8 1.8 0 0 1-1.8 2H6.3a1.8 1.8 0 0 1-1.8-2z", "M9 10V6a3 3 0 0 1 6 0v4"],
      send: ["M22 2 11 13", "M22 2 15 22l-4-9-9-4z"],
      x: ["M6 6l12 12", "M18 6 6 18"],
      pencil: ["M17 3l4 4L8 20l-5 1 1-5z"],
      note: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
      heart: [
        "M12 21S4 14.5 4 9.3C4 6.4 6.2 4.5 8.6 4.5c1.5 0 2.7.8 3.4 2 .7-1.2 2-2 3.4-2 2.4 0 4.6 1.9 4.6 4.8C20 14.5 12 21 12 21z"
      ],
      gift: [
        "M12 11v10",
        "M3 8h18v3H3z",
        "M12 8c-2 0-4.5-.5-4.5-2.7C7.5 3.6 9 3 10 3c1.7 0 2 2.5 2 5",
        "M12 8c2 0 4.5-.5 4.5-2.7C16.5 3.6 15 3 14 3c-1.7 0-2 2.5-2 5",
        "M5 11h14v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20z"
      ],
      wrench: ["M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"],
      logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
      moon: ["M21 13A9 9 0 0 1 11 3a7.5 7.5 0 1 0 10 10z"],
      arrowL: ["M19 12H5", "M11 18l-6-6 6-6"],
      bookmark: ["M6 3h12v18l-6-4-6 4z"],
      refresh: ["M21 12a9 9 0 1 1-2.6-6.3", "M21 3v6h-6"],
      external: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14 21 3"],
      link2: ["M9 17H7a5 5 0 0 1 0-10h2", "M15 7h2a5 5 0 0 1 0 10h-2", "M8 12h8"],
      flag: ["M5 21V4", "M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0"],
      layers: ["M12 3 2 8.5 12 14l10-5.5z", "M2 13.5 12 19l10-5.5"],
      dna: ["M6 3c0 6 12 6 12 12", "M18 3c0 6-12 6-12 12", "M6 15c0 3 2 6 6 6", "M18 15c0 3-2 6-6 6", "M8 7h8", "M8 17h8"],
      bell: ["M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7", "M10.3 20a2 2 0 0 0 3.4 0"],
      chevR: ["M9 5l7 7-7 7"],
      lock: [
        "M8 11V8a4 4 0 0 1 8 0v3",
        "M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11z"
      ],
      clock: ["M12 7v5l3.5 2", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"],
      video: [
        "M16 10.5 21 7.5v9l-5-3",
        "M5.5 6h8A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 15.5v-7A2.5 2.5 0 0 1 5.5 6z"
      ],
      cards: ["M8 2h11a2 2 0 0 1 2 2v13", "M5 5h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"],
      calendar: ["M3 10h18", "M8 3v4", "M16 3v4", "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"],
      target: [
        "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        "M12 11.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"
      ],
      compass: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z"],
      radar: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M12 12 18 6"],
      bot: [
        "M12 8V4",
        "M12 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
        "M8 8h8a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z",
        "M9.5 12.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
        "M14.5 12.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"
      ],
      search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M16.5 16.5 21 21"],
      user: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M4 21c0-4 3.5-6 8-6s8 2 8 6"],
      gear: [
        "M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z",
        "M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.36.95a7 7 0 0 0-2.42-1.4L13.7 2h-3.4l-.38 2.5a7 7 0 0 0-2.42 1.4l-2.36-.95-2 3.46 2 1.55a7.3 7.3 0 0 0 0 2.8l-2 1.55 2 3.46 2.36-.95a7 7 0 0 0 2.42 1.4l.38 2.5h3.4l.38-2.5a7 7 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55c.1-.46.14-.93.14-1.4z"
      ],
      dots: ["M4 11h2v2H4z", "M11 11h2v2h-2z", "M18 11h2v2h-2z"],
      award: ["M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z", "M9 14.5 8 22l4-2.5L16 22l-1-7.5"],
      alert: ["M12 3 2 20h20z", "M12 9.5V14", "M12 16.5v.5"],
      sun: [
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        "M12 2v2",
        "M12 20v2",
        "M2 12h2",
        "M20 12h2",
        "M5 5l1.4 1.4",
        "M17.6 17.6 19 19",
        "M19 5l-1.4 1.4",
        "M6.4 17.6 5 19"
      ]
    };
    const isFill = ["plane", "bolt", "flame", "star4", "star", "heart", "bookmark", "dots"].includes(name);
    return h(
      "svg",
      {
        key: name,
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: isFill ? color : "none",
        stroke: isFill ? "none" : color,
        strokeWidth: sw,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { flexShrink: 0 }
      },
      (defs[name] || []).map(P)
    );
  }

  // Contagens reais de conteúdo (conteudos_biblioteca/links_externos, ambos
  // com CRUD em /admin/cursos, /admin/pdfs e /admin/links). Só existe um
  // card aqui se existir uma forma equivalente do admin cadastrar aquele
  // conteúdo — nada de números ou categorias inventadas.
  // Biblioteca que o aluno enxerga por tipo: o que o admin cadastrou em
  // /admin/cursos, /admin/pdfs e /admin/links MAIS o que está pendurado
  // nos dias do cronograma. A deduplicação é por URL porque é o que
  // identifica o mesmo material nas duas origens (o item do cronograma
  // muitas vezes não tem ref_id, só o link do vídeo).
  biblioteca(tipo: "aula" | "pdf" | "link") {
    const itens: { id: string | null; titulo: string; descricao: string; url: string | null }[] = [];
    const vistos = new Set<string>();
    const push = (id: string | null, titulo: string, descricao: string, url: string | null) => {
      const chave = url || "id:" + id;
      if (vistos.has(chave)) return;
      vistos.add(chave);
      itens.push({ id, titulo, descricao, url });
    };

    if (tipo === "link") {
      this.props.dados.linksExternos.forEach((l) => push(l.id, l.titulo, l.url, l.url));
    } else {
      this.props.dados.conteudos
        .filter((c) => (tipo === "aula" ? c.tipo === "aula" : c.tipo === "pdf" || c.tipo === "artigo"))
        .forEach((c) => push(c.id, c.titulo, c.assunto ? `${c.assunto} · ${c.materia}` : c.materia, c.url));
    }

    this.props.dados.conteudosTrilha
      .filter((i) => i.tipo === tipo)
      // Links são identificados pelo endereço (é o que a lista da
      // biblioteca mostra); aula/PDF pela matéria, caindo pro cronograma
      // quando o item não tem matéria definida.
      .forEach((i) => push(i.ref_id, i.titulo, tipo === "link" ? i.url : i.materia || "Cronograma", i.url));

    return itens;
  }
  hangarEstudosEstaticos() {
    const aulas = this.biblioteca("aula");
    const pdfs = this.biblioteca("pdf");
    const links = this.biblioteca("link");
    return {
      estudos: [
        { ic: "video", t: "Videoaulas", d: aulas.length + (aulas.length === 1 ? " aula" : " aulas") },
        { ic: "file", t: "PDFs", d: pdfs.length + (pdfs.length === 1 ? " material" : " materiais") },
        { ic: "link2", t: "Links úteis", d: links.length + (links.length === 1 ? " link" : " links") },
        { ic: "cards", t: "Flashcards", d: this.props.dados.flashcards.length + " cards" },
        { ic: "pencil", t: "Anotações", d: "Suas notas" }
      ]
    };
  }
  // Mapeia uma Questao real (banco de questões) para o formato usado pelas
  // telas — sem incluir a resposta correta: ela só existe no servidor e só
  // chega ao cliente depois de registrarResposta() checar de verdade.
  mapQuestao(q: Questao) {
    return {
      id: q.id,
      code: codigoDaQuestao(q.id),
      materia: q.materia,
      tema: q.assunto || q.materia,
      fonte: q.fonte,
      q: q.enunciado,
      alts: q.alternativas.map((a) => a.texto),
      altIds: q.alternativas.map((a) => a.id),
      dificuldade: q.dificuldade,
      imagens: q.imagens ?? []
    };
  }
  // Cabeçalho compacto (matéria/assunto em destaque + código/fonte como
  // legenda) reaproveitado em toda tela que exibe uma questão — antes cada
  // uma tinha sua própria fileira de badges empilhados, ocupando bem mais
  // altura e divergindo em estilo entre si.
  questaoMeta(q: { materia: string; tema: string; code?: string; fonte?: string | null }) {
    const { h, C } = this.ui();
    return h("div", { key: "meta", style: { margin: "14px 18px 0" } }, [
      h(
        "div",
        { key: "eyebrow", style: { display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 } },
        [
          h("span", { key: "m", style: { fontSize: 11.5, fontWeight: 800, color: C.green, letterSpacing: ".02em", textTransform: "uppercase", flexShrink: 0 } }, q.materia),
          h("span", { key: "dot", style: { fontSize: 11.5, color: C.faint, flexShrink: 0 } }, "·"),
          h("span", { key: "t", style: { fontSize: 12.5, fontWeight: 700, color: C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, q.tema)
        ]
      ),
      h(
        "div",
        { key: "sub", style: { marginTop: 2, fontSize: 10.5, fontWeight: 600, color: C.faint, fontFamily: "monospace", letterSpacing: ".01em" } },
        (q.code || "Q000000") + (q.fonte ? "  ·  " + q.fonte : "")
      )
    ]);
  }
  // Imagens/figuras reais da questão (diagramas, gráficos das provas
  // FACAPE) — mesmo componente visual usado nas rotas dedicadas
  // (ImagensQuestao), reimplementado aqui porque este componente usa h()
  // em vez de JSX.
  questaoImagens(q: { imagens?: { url: string; legenda: string | null; ordem: number }[] }) {
    const { h, C } = this.ui();
    return (q.imagens ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((img, i) =>
        h("figure", { key: "img" + i, style: { margin: "12px 0 0" } }, [
          h("img", { key: "i", src: img.url, alt: img.legenda ?? "Imagem da questão", style: { maxWidth: "100%", borderRadius: 12, border: "1.5px solid " + C.line, display: "block" } }),
          img.legenda ? h("figcaption", { key: "c", style: { marginTop: 4, fontSize: 10.5, color: C.faint } }, img.legenda) : null
        ])
      );
  }
  questaoCard(q: { q: string; imagens?: { url: string; legenda: string | null; ordem: number }[] }) {
    const { h, card } = this.ui();
    return h("div", { key: "q", style: { margin: "10px 18px 0" } }, card({}, [
      h("div", { key: "t", style: { fontSize: 15, fontWeight: 700, lineHeight: 1.55 } }, q.q),
      ...this.questaoImagens(q)
    ]));
  }
  data() {
    const P = this.props.dados;
    const perf = this.perf();
    const subjects = P.pesos.length
      ? P.pesos.map((p) => {
          const t = perf[p.materia] || { ok: 0, err: 0 };
          const tot = t.ok + t.err;
          const v = tot > 0 ? Math.round((t.ok / tot) * 100) : 0;
          const c = v >= 70 ? "#3dd68c" : v >= 40 ? "#ffc94d" : "#ff6b5e";
          return { n: p.materia, v, c };
        })
      : [];
    const contagemPorSimulado = P.simuladoQuestoesCount;
    const nivelPorTotal = (n: number) => (n >= 60 ? "Difícil" : n >= 20 ? "Médio" : "Fácil");
    return {
      ...this.hangarEstudosEstaticos(),
      subjects,
      ranking: P.ranking.map((r, i) => ({ p: i + 1, n: r.nome, xp: String(r.xp), me: r.aluno_id === this.props.alunoId, id: r.aluno_id })),
      badges: this.badgesReais(),
      // Mesma regra da aba Atividades (lib/site/avaliacoes.ts): um simulado
      // sem questões e sem redação não é ofertado em lugar nenhum. Antes esta
      // lista mostrava simulados vazios que a aba Atividades escondia — duas
      // telas do mesmo app discordando sobre o que existe.
      sims: P.simulados
        .filter((s) =>
          disponivelParaAluno({
            ativo: true,
            totalQuestoes: contagemPorSimulado[s.id] ?? 0,
            temRedacao: Boolean((s as { redacao?: unknown }).redacao)
          })
        )
        .map((s) => ({
        id: s.id,
        t: s.titulo,
        q: contagemPorSimulado[s.id] ?? 0,
        lvl: nivelPorTotal(contagemPorSimulado[s.id] ?? 0),
        time: s.tempo_minutos >= 60 ? Math.round(s.tempo_minutos / 60) + "h" : s.tempo_minutos + "min"
        })),
      simHist: P.tentativas
        .filter((t) => t.finalizado_em)
        .map((t) => {
          const sim = P.simulados.find((s) => s.id === t.simulado_id);
          return {
            id: t.id,
            t: sim?.titulo ?? "Simulado",
            d: new Date(t.created_at).toLocaleDateString("pt-BR"),
            v: Math.round(t.nota_facape ?? t.nota)
          };
        }),
      questions: P.questoes.map((q) => this.mapQuestao(q)),
      notifs: (this.state.notifsLocal as Notificacao[]).map((n) => ({
        id: n.id,
        ic: n.lida ? "bell" : "award",
        t: n.titulo,
        d: n.mensagem,
        time: new Date(n.created_at).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        tone: n.lida ? "blue" : "orange",
        lida: n.lida
      })),
      recs: this.state.recsLocal.map((r: CopilotoRecomendacao) => ({
        id: r.id,
        ic: r.tipo === "flashcards" ? "cards" : r.tipo === "simulado" ? "file" : r.tipo === "aula" ? "video" : "target",
        t: r.titulo,
        d: r.motivo || r.materia,
        tag: r.prioridade >= 3 ? "Prioritário" : "Recomendado"
      }))
    };
  }
  // Mesmo cálculo de /aluno/conquistas (contagens reais de respostas,
  // revisões, tentativas e posição no ranking) — ver essa página para o
  // detalhe de cada critério.
  badgesReais() {
    const P = this.props.dados;
    const totalQuestoes = P.respostas.length;
    const acertosQuestoes = P.respostas.filter((r) => r.correta).length;
    const precisao = totalQuestoes > 0 ? Math.round((acertosQuestoes / totalQuestoes) * 100) : 0;
    const totalFlashcards = P.revisoes.filter((r) => r.lembrou).length;
    const totalSimulados = P.tentativas.length;
    const minhaPosicao = P.ranking.findIndex((r) => r.aluno_id === this.props.alunoId) + 1;
    const badges = [
      { ic: "target", t: "Primeiras 10 Questões", got: totalQuestoes >= 10, prog: Math.min(totalQuestoes, 10) + "/10" },
      { ic: "star4", t: "100 Questões", got: totalQuestoes >= 100, prog: Math.min(totalQuestoes, 100) + "/100" },
      { ic: "dna", t: "Precisão 90%+", got: totalQuestoes >= 20 && precisao >= 90, prog: totalQuestoes >= 20 ? precisao + "%" : totalQuestoes + "/20" },
      { ic: "cards", t: "Revisor Dedicado", got: totalFlashcards >= 50, prog: Math.min(totalFlashcards, 50) + "/50" },
      { ic: "file", t: "Primeiro Simulado", got: totalSimulados >= 1, prog: Math.min(totalSimulados, 1) + "/1" },
      { ic: "trophy", t: "Simulado Expert", got: totalSimulados >= 3, prog: Math.min(totalSimulados, 3) + "/3" },
      { ic: "award", t: "Top 10 Ranking", got: minhaPosicao > 0 && minhaPosicao <= 10, prog: minhaPosicao > 0 ? "#" + minhaPosicao : "sem pontos" }
    ];
    return badges.map((b) => ({ ...b, lock: false }));
  }
  // Questões reais do simulado em andamento (sem resposta_correta — ver
  // comentário em page.tsx). A correção de verdade só acontece no servidor,
  // em submeterSimulado(), quando o aluno envia o simulado inteiro.
  simQs() {
    const simId: string | null = this.state.simId;
    const itens: DecolaAppDados["simuladoQuestoes"][string] = (simId ? this.props.dados.simuladoQuestoes[simId] : undefined) || [];
    return itens.map((q, i: number) => ({
      id: q.id,
      code: codigoDaQuestao(q.id),
      n: i + 1,
      materia: q.materia,
      tema: q.assunto || q.materia,
      fonte: null as string | null,
      q: q.enunciado,
      alts: q.alternativas.map((a: { id: string; texto: string }) => a.texto),
      altIds: q.alternativas.map((a: { id: string; texto: string }) => a.id),
      imagens: q.imagens ?? []
    }));
  }

  // ---------- mascote com imagens reais ----------
  // Mapeamento de nome (usado no protótipo) → arquivo em /assets/mascote/.
  // Contextos: "bot" → default (copiloto padrão), "trophy" → comemorando,
  // "award" → animado (brasão), "check" → pulando (acertou/concluiu),
  // "cards" → ideia (flashcards/recomendação), "compass" → pensando,
  // "alert" → orgulhoso, qualquer outro → default.
  mascoteBadge(name: string, size: number, opts: any = {}) {
    const h = React.createElement;
    const mapa: Record<string, string> = {
      bot: "/assets/mascote/copiloto-default.png",
      trophy: "/assets/mascote/copiloto-comemorando.png",
      award: "/assets/mascote/copiloto-animado.png",
      check: "/assets/mascote/copiloto-pulando.png",
      cards: "/assets/mascote/copiloto-ideia.png",
      compass: "/assets/mascote/copiloto-pensando.png",
      alert: "/assets/mascote/copiloto-orgulhoso.png",
      laptop: "/assets/mascote/copiloto-laptop.png",
      wink: "/assets/mascote/copiloto-piscando.png"
    };
    const src = mapa[name] ?? "/assets/mascote/copiloto-default.png";
    return h("img", {
      key: "mascote-" + name,
      src,
      alt: "Copiloto Decola",
      width: size,
      height: size,
      style: {
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
        animation: opts.anim || "none",
        ...(opts.style || {})
      }
    });
  }


  // ---------- ui helpers ----------
  ui() {
    const C = this.colors(),
      h = React.createElement,
      I = (n: string, s?: number, c?: string, w?: number) => this.icon(n, s, c, w);
    // `key` pode vir junto do objeto de estilo e é extraído aqui: cartões
    // gerados dentro de .map() precisam de key própria, e sem esse suporte
    // o React avisava "each child in a list should have a unique key" em
    // várias telas (Painel, Estudos, Simulados, Conquistas...).
    const card = (st: any, ch: any, onClick?: any) => {
      const { key, ...estilo } = st || {};
      return h(
        "div",
        { key, onClick, style: { background: C.card, border: "1px solid " + C.line, borderRadius: 18, padding: 16, cursor: onClick ? "pointer" : "default", ...estilo } },
        ch
      );
    };
    const bar = (pct: number, color = C.orange, hgt = 7, track = C.chip) =>
      h(
        "div",
        { key: "bar", style: { height: hgt, borderRadius: 99, background: track, overflow: "hidden", flex: 1 } },
        h("div", { style: { width: Math.min(100, pct) + "%", height: "100%", borderRadius: 99, background: color, transition: "width .4s ease" } })
      );
    const chip = (txt: string, active: boolean, onClick?: any) =>
      h(
        "div",
        {
          key: "chip:" + txt,
          onClick,
          style: {
            padding: "7px 14px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            background: active ? C.orange : C.chip,
            color: active ? "#fff" : C.sub,
            transition: "all .2s"
          }
        },
        txt
      );
    const btn = (txt: string, onClick?: any, st?: any) =>
      h(
        "div",
        {
          key: "btn:" + txt,
          onClick,
          style: {
            background: C.orange,
            color: "#fff",
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: 14,
            fontWeight: 800,
            textAlign: "center",
            cursor: "pointer",
            letterSpacing: ".02em",
            boxShadow: "0 6px 18px rgba(243,108,33,.35)",
            ...st
          }
        },
        txt
      );
    const ghost = (txt: string, onClick?: any, st?: any) =>
      h(
        "div",
        { key: "ghost:" + txt, onClick, style: { border: "1.5px solid " + C.line, color: C.txt, borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, textAlign: "center", cursor: "pointer", ...st } },
        txt
      );
    const iconBox = (name: string, bg: string, color: string, size = 42, isz = 20) =>
      h(
        "div",
        { key: "ib:" + name, style: { width: size, height: size, borderRadius: size * 0.32, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 } },
        I(name, isz, color)
      );
    const stars = (n: number, size = 13) =>
      h(
        "div",
        { key: "stars", style: { display: "flex", gap: 2 } },
        [0, 1, 2].map((i) => h("span", { key: i, style: { color: i < n ? C.yellow : C.faint, display: "flex" } }, I("star", size, i < n ? C.yellow : C.faint)))
      );
    return { C, h, I, card, bar, chip, btn, ghost, iconBox, stars };
  }
  // ---------- desempenho real (substitui o antigo cálculo em localStorage) ----------
  // Agrupa as respostas reais de questões (tabela respostas_aluno, via prop
  // `dados.respostas`) por matéria — mesmo formato usado em /aluno/raio-x e
  // /aluno/desempenho, só que aqui alimenta as telas do app gamificado.
  perf(): Record<string, { ok: number; err: number }> {
    const out: Record<string, { ok: number; err: number }> = {};
    this.props.dados.respostas.forEach((r) => {
      const materia = r.questoes?.materia;
      if (!materia) return;
      const t = out[materia] || { ok: 0, err: 0 };
      if (r.correta) t.ok++;
      else t.err++;
      out[materia] = t;
    });
    return out;
  }
  weights(): Record<string, number> {
    const w: Record<string, number> = {};
    this.props.dados.pesos.forEach((p) => {
      w[p.materia] = Number(p.peso);
    });
    return w;
  }
  // Ordena matérias por "ganho potencial" (mesma fórmula de /aluno/raio-x):
  // precisão baixa × peso alto sobe mais na lista — é o que realmente vale
  // mais estudar agora, não só o que o aluno mais erra.
  priorities() {
    const perf = this.perf(),
      pesos = this.weights();
    const out: any[] = [];
    Object.keys(perf).forEach((materia) => {
      const t = perf[materia],
        tot = t.ok + t.err;
      if (!tot) return;
      const precisao = (t.ok / tot) * 100;
      const w = pesos[materia] ?? 1;
      const gain = ((100 - precisao) * w) / 10;
      out.push({
        tema: materia,
        mat: materia,
        w,
        tot,
        precisao: Math.round(precisao),
        gain,
        why: "peso " + w + " × " + Math.round(100 - precisao) + "% a melhorar"
      });
    });
    out.sort((a, b) => b.gain - a.gain);
    return out;
  }
  weakest() {
    const pr = this.priorities();
    return pr.length ? pr[0].tema : null;
  }
  // O plano vem do servidor (matrícula → plano). Havia um fallback para
  // `localStorage["dm-plan"]`, sobra da versão de demonstração: ninguém
  // escrevia essa chave, mas um valor antigo no navegador podia decidir o
  // plano do aluno se a prop falhasse. Fonte de verdade agora é só o banco.
  plan() {
    return this.props.plano ?? "decolando";
  }
  // Missões reais de hoje (tabela aluno_missoes, só para planos com
  // Copiloto — ver aluno/cronograma/page.tsx para o mesmo critério).
  // Substitui o antigo checklist local (dm-check) por conclusão real,
  // persistida no banco via marcarMissaoConcluida().
  missoesHoje(): AlunoMissao[] {
    const hojeStr = this.props.dados.hojeStr;
    // Se hoje é o dia da prova, não há missão — vale para todas as telas que
    // partem daqui (sequência de hoje, cronograma, painel).
    if (this.dataDaProva() === hojeStr) return [];
    return (this.state.missoesLocal as AlunoMissao[]).filter((m) => m.data === hojeStr).sort((a, b) => b.prioridade - a.prioridade);
  }
  iconeMissao(tipo: string) {
    const m: Record<string, string> = { aula: "video", pdf: "file", link: "link2", questoes: "target", flashcards: "cards", simulado: "file", revisao: "refresh", leitura: "book", redacao: "note", livre: "compass" };
    return m[tipo] || "bot";
  }
  navMissao(m: AlunoMissao) {
    // Toda missão precisa abrir alguma coisa de verdade. Antes, quando o
    // alvo não existia (revisão sem matéria, aula com ref_id apagado), isto
    // caía num `nav("estudos")` mudo — o cartão parecia não ter ação
    // nenhuma. Agora cada caminho confere se há conteúdo antes de navegar e,
    // quando não há, avisa em vez de jogar o aluno numa tela vazia.
    const questoesDa = (mat: string | null | undefined) =>
      this.data().questions.filter((q) => (mat ? mesmaMateria(q.materia, mat) : true));
    const flashcardsDa = (mat: string | null | undefined) =>
      this.props.dados.flashcards.filter((c) => (mat ? mesmaMateria(c.materia, mat) : true));

    if (m.tipo === "questoes") {
      if (questoesDa(m.materia).length === 0) {
        return this.avisar(
          m.materia
            ? `Ainda não há questões de ${m.materia} cadastradas. Assim que houver, esta missão abre normalmente.`
            : "Ainda não há questões cadastradas."
        );
      }
      // Mesma regra da atividade do cronograma: sessão fechada, não o banco.
      this.irParaRota("/aluno/sessao/" + encodeURIComponent(chaveSessaoMissao(m.id)));
    } else if (m.tipo === "flashcards") {
      const pool = flashcardsDa(m.materia);
      if (pool.length === 0) {
        return this.avisar(
          m.materia
            ? `Ainda não há flashcards de ${m.materia} cadastrados. Assim que houver, esta missão abre normalmente.`
            : "Ainda não há flashcards cadastrados."
        );
      }
      if (m.materia) this.iniciarFlashcards(this.embaralhar(pool), false);
      else this.nav("flashcards-select");
    } else if (m.tipo === "simulado") this.nav("simulados");
    else if (m.tipo === "revisao") {
      // Revisão sem matéria definida usa a matéria mais urgente do aluno, em
      // vez de simplesmente não fazer nada.
      const alvo = m.materia || this.priorities()[0]?.mat || null;
      if (!alvo || questoesDa(alvo).length === 0) {
        return this.avisar(
          alvo
            ? `Ainda não há questões de ${alvo} para montar a revisão.`
            : "Ainda não há conteúdo suficiente para montar uma revisão."
        );
      }
      this.montarRevisao(alvo, m.assunto || alvo);
    } else if (m.tipo === "aula") {
      // Ordem de resolução, da mais precisa para a mais tolerante:
      //
      //   1. o ref_id gravado pelo Copiloto (o caminho normal desde que
      //      resolverConteudoMissao() passou a preenchê-lo);
      //   2. a aula com o mesmo título — cobre as missões antigas, criadas
      //      quando o ref_id ficava nulo;
      //   3. qualquer aula da mesma matéria.
      //
      // Antes só o passo 1 existia, e como TODAS as missões de aula tinham
      // ref_id nulo, o clique caía sempre em "Esta aula não está mais
      // disponível" — a aula existia, o vínculo é que nunca foi gravado.
      const aulas = this.props.dados.conteudos.filter((c) => c.url);
      const porTitulo = (t: string) =>
        aulas.find((c) => c.titulo === t) ??
        aulas.find((c) => t.includes(c.titulo)) ??
        null;
      const conteudo =
        (m.ref_id ? aulas.find((c) => c.id === m.ref_id) : null) ??
        porTitulo(m.titulo) ??
        (m.materia ? aulas.find((c) => mesmaMateria(c.materia, m.materia)) : null);

      if (conteudo) this.abrirAula(conteudo.id, conteudo.titulo, conteudo.url || "", "mapa");
      else if (m.materia) this.avisar(`Ainda não há aulas de ${m.materia} publicadas.`);
      else this.nav("conteudo", { contTitle: "Videoaulas", contTipo: "aula", contBack: "mapa" });
    } else {
      // Missão "livre" com material anexado pelo administrador. O painel
      // passou a permitir escolher um conteúdo da biblioteca (ou colar um
      // link, que vira um conteúdo) ao criar a missão manual — sem este
      // caminho, o `ref_id` gravado lá não abriria nada e o clique cairia na
      // aba Estudos, como se a missão não tivesse ação.
      const anexado = m.ref_id
        ? this.props.dados.conteudos.find((c) => c.id === m.ref_id && c.url)
        : null;
      if (anexado) return this.abrirAula(anexado.id, anexado.titulo, anexado.url || "", "mapa");

      // Sem material anexado, mas o título nomeia um dos quatro resumos: o
      // endereço sai das Configurações, o mesmo que o item do cronograma
      // usa. Uma missão dessas não passa por `resolverCronograma` (copia só
      // o título), então a resolução tem de acontecer aqui.
      const resumo = urlDoResumo(numeroDoLivro(m.titulo), this.props.dados.linksDosResumos ?? {});
      if (resumo) return this.openBrowser(m.titulo, resumo, "mapa");

      this.nav("estudos");
    }
  }
  toggleMissao(id: string) {
    const atual = this.state.missoesLocal.find((m: AlunoMissao) => m.id === id);
    const concluida = !atual?.concluida;
    const trocar = (valor: boolean) =>
      this.setState((s: any) => ({
        missoesLocal: s.missoesLocal.map((m: AlunoMissao) => (m.id === id ? { ...m, concluida: valor } : m))
      }));
    trocar(concluida);
    if (this.props.demoMode) return;
    // Desfaz a marcação otimista se o servidor recusar. Antes só um erro de
    // rede era capturado: uma falha de gravação que retorna normalmente
    // (RLS, linha inexistente) deixava o item riscado na tela e intacto no
    // banco, e o aluno só descobria ao recarregar.
    marcarMissaoConcluida(id, concluida)
      .then((res) => {
        if (!res?.ok) {
          trocar(!concluida);
          this.avisar("Não foi possível salvar essa missão. Verifique sua conexão e tente de novo.");
        }
      })
      .catch(() => {
        trocar(!concluida);
        this.avisar("Não foi possível salvar essa missão. Verifique sua conexão e tente de novo.");
      });
  }
  // Redefinir perfil: apaga histórico e progresso. Confirmação em dois passos
  // porque é irreversível. Para onde ir DEPOIS depende do plano — ver o
  // comentário no corpo.
  confirmarRedefinirPerfil() {
    if (this.state.resetEmAndamento) return;
    if (this.props.demoMode) {
      this.setState({ resetConfirmando: false });
      return this.avisar("No modo demonstração o perfil não é redefinido de verdade.");
    }
    this.setState({ resetEmAndamento: true });
    redefinirPerfilAluno()
      .then((res) => {
        if (!res.ok) {
          this.setState({ resetEmAndamento: false });
          return this.avisar(res.erro);
        }
        // Para onde ir depende do plano, e a diferença é de propósito.
        //
        // VOO GUIADO vai ao briefing: o reset apaga o briefing junto, e sem
        // um novo não há jornada nenhuma para montar.
        //
        // DECOLANDO vai para /aluno. O cronograma dele é FIXO — os mesmos 40
        // blocos, sem briefing, sem data de prova, sem dias da semana. Aqui
        // "redefinir" quer dizer só voltar ao bloco 1, e mandar este aluno
        // responder um briefing seria pedir dados que o plano dele não usa
        // para nada.
        //
        // Nos dois casos a navegação é de página inteira, e não um reload:
        // só ela descarta o estado que este componente guarda em memória
        // (missões, progresso, sentimentos). Um reload traria a mesma tela
        // com os cartões antigos montados — a impressão exata de "o reset
        // não concluiu".
        if (typeof window !== "undefined") {
          window.location.href = this.props.dados.temCopiloto ? "/aluno/briefing" : "/aluno";
        }
      })
      .catch(() => {
        this.setState({ resetEmAndamento: false });
        this.avisar("Não foi possível redefinir seu perfil. Tente de novo.");
      });
  }
  qList() {
    const qs = this.data().questions;
    const m = this.state.qMateria;
    if (!m) return qs;
    // Sem fallback: antes, quando a matéria escolhida não tinha questão
    // nenhuma, isto devolvia o banco inteiro — e o aluno via o título
    // "Praticar · Química" em cima de uma questão de Linguagens. Lista vazia
    // cai no estado vazio logo abaixo, que é a resposta honesta.
    return qs.filter((q) => mesmaMateria(q.materia, m));
  }
  startReview() {
    const pr = this.priorities();
    const materia = pr.length ? pr[0].mat : this.props.dados.pesos[0]?.materia || "Biologia";
    this.setState({ screen: "questoes", practice: false, moreOpen: false, notifOpen: false, simView: null });
    this.montarRevisao(materia, materia);
  }
  // Sequência real de hoje: o cronograma (trilha_dias) é a base de todo
  // mundo e vem primeiro; as missões individuais (aluno_missoes — Copiloto
  // ou cadastradas pelo admin) entram depois, como acréscimo. Mesma regra de
  // scrPlano() e /aluno/cronograma: nenhuma das duas fontes exclui a outra.
  todaySeq() {
    const list: any[] = [];
    // Se hoje é o dia da prova, não há sequência de estudo — a tela mostra o
    // cartão do vestibular no lugar.
    if (this.dataDaProva() === this.props.dados.hojeStr) return list;
    const dia = this.props.dados.trilhaHoje;
    (dia?.itens || []).forEach((item, i) => {
      const chave = this.chaveDeItemTrilha(dia!.dia_numero, i, item);
      list.push({
        id: "trilha-" + i,
        ic: this.iconeMissao(item.tipo),
        t: item.titulo,
        d: dia!.titulo,
        ia: false,
        done: this.estaConcluido(chave),
        act: () => this.abrirItemTrilha(item, dia!.dia_numero, i),
        toggle: chave ? () => this.toggleItemGenerico(chave) : null
      });
    });
    this.missoesHoje().forEach((m) => list.push(this.itemDeMissao(m)));

    // A revisão sugerida pelo Copiloto é o único item da sequência que não
    // nasce de uma linha do banco — ela é derivada do desempenho a cada
    // render. Sem uma chave de progresso ela ficava com `done: false` fixo e
    // `toggle: null`: o aluno fazia a revisão e ela reaparecia intacta no
    // dia seguinte, sem jeito de marcar. Agora usa a mesma trilha de
    // progresso dos demais itens (aluno_progresso_itens), então some da
    // pendência e permanece marcada entre sessões.
    const pr0 = this.priorities();
    if (pr0.length) {
      const chave = this.chaveDaRevisaoDoCopiloto(pr0[0].mat, this.props.dados.hojeStr);
      list.push({
        id: "rev-copiloto",
        ic: "bot",
        t: "Revisão do Copiloto · " + pr0[0].tema,
        d: "Maior ganho de nota agora · " + pr0[0].why,
        ia: true,
        done: this.estaConcluido(chave),
        act: () => this.startReview(),
        toggle: () => this.toggleItemGenerico(chave)
      });
    }
    return list;
  }

  /**
   * Chave de progresso da revisão diária do Copiloto.
   *
   * Inclui a data para que a revisão de hoje não herde a marcação de ontem —
   * cada dia é uma tarefa nova — e a matéria para que trocar o foco do
   * Copiloto gere uma pendência nova em vez de reaproveitar a anterior.
   */
  chaveDaRevisaoDoCopiloto(materia: string, data: string): string {
    return `revisao-copiloto:${data}:${chaveMateria(materia)}`;
  }
  nav(screen: string, extra?: any) {
    this.setState({ screen, practice: false, reviewMode: false, revFinished: false, moreOpen: false, notifOpen: false, simView: null, ...extra });
  }
  // Itens de menu podem apontar para uma tela interna da SPA (`k`) ou para
  // uma rota real do Next (`href`). Centralizar isso aqui evita o que já
  // acontecia antes: telas reais e completas (Raio-X, Desempenho) ficarem
  // sem nenhum caminho de navegação porque só "Atividades" tinha um
  // `window.location.href` escrito à mão no meio do JSX.
  irParaItemMenu(item: { k: string; href?: string }) {
    if (item.href) return this.irParaRota(item.href);
    this.nav(item.k);
  }
  // Sai da SPA para uma rota real do Next (Atividades, Raio-X, Desempenho…).
  irParaRota(rota: string) {
    if (typeof window !== "undefined") window.location.href = rota;
  }
  // Domínios que recusam ser exibidos em iframe de outra origem (enviam
  // X-Frame-Options/CSP frame-ancestors bloqueando) — não é algo que dê pra
  // contornar do nosso lado, nenhum truque de iframe passa por cima disso,
  // então a única solução real é não tentar: abrir direto numa nova aba.
  // Canva Sites (ex.: decolamed.my.canva.site) e o próprio canva.com sempre
  // bloqueiam — é a causa exata de "conexão recusada"/tela branca relatada.
  DOMINIOS_SEM_IFRAME = ["canva.site", "canva.com"];
  bloqueiaIframe(url: string): boolean {
    try {
      const host = new URL(this.normalizarUrl(url)).hostname.toLowerCase();
      return this.DOMINIOS_SEM_IFRAME.some((d) => host === d || host.endsWith("." + d));
    } catch {
      return false;
    }
  }
  openBrowser(title: string, url: string, back?: string) {
    // Sites que a gente já sabe que bloqueiam iframe abrem direto numa nova
    // aba — tentar exibi-los no navegador interno só resultaria em conexão
    // recusada ou tela branca, sem nenhuma forma de contornar isso no
    // front-end (a restrição vem do próprio servidor de destino).
    if (this.bloqueiaIframe(url)) {
      if (typeof window !== "undefined") window.open(this.normalizarUrl(url), "_blank", "noopener,noreferrer");
      return;
    }
    this.nav("browser", { browserTitle: title, browserUrl: url, browserBack: back || this.state.screen, browserCarregou: false, browserFalhou: false });
    this.agendarChecagemDeCarregamento(url);
  }
  // Nem todo site que bloqueia iframe está na lista conhecida acima — alguns
  // bloqueiam de um jeito que nem sequer dispara onError no iframe (a
  // página some, sem evento nenhum pro JS detectar). Um iframe carregado de
  // verdade dispara onLoad rapidamente; se isso não acontecer em alguns
  // segundos, é sinal de bloqueio silencioso — mostramos a mesma saída
  // amigável (abrir em nova aba) em vez de deixar a tela em branco pra
  // sempre.
  agendarChecagemDeCarregamento(url: string) {
    setTimeout(() => {
      if (this.state.screen === "browser" && this.state.browserUrl === url && !this.state.browserCarregou) {
        this.setState({ browserFalhou: true });
      }
    }, 6000);
  }
  // Garante um protocolo válido — vários lugares do admin salvam URL sem
  // "https://" na frente (ex.: "decolamed.my.canva.site").
  normalizarUrl(url: string) {
    if (!url) return url;
    const comProtocolo = url.startsWith("/") || /^https?:\/\//i.test(url) ? url : "https://" + url;
    return this.urlDriveEmbutivel(comProtocolo);
  }
  // Converte um link do Google Drive/Docs para a forma que abre dentro do
  // app. O link que o admin copia do botão "Compartilhar" é o /view (ou
  // /edit), que o Google recusa exibir em iframe — o aluno via "página
  // indisponível" no navegador interno. O /preview é justamente a forma
  // documentada para embutir, e funciona igual no celular.
  urlDriveEmbutivel(url: string) {
    const m = url.match(/https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{10,})/i);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    const doc = url.match(/https?:\/\/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]{10,})/i);
    if (doc) return `https://docs.google.com/${doc[1]}/d/${doc[2]}/preview`;
    return url;
  }
  // Converte qualquer formato de link do YouTube (watch, youtu.be, shorts)
  // pro formato /embed/ — só esse formato pode ser exibido num iframe.
  youtubeEmbedUrl(url: string): string | null {
    const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/i);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  }
  // Abre de verdade o conteúdo anexado a um item do cronograma (trilha_dias
  // — ver TrilhaItem em types/database.ts e /admin/trilha) — cada tipo
  // navega pro lugar certo já existente no app, sem duplicar nenhuma tela.
  //
  // Todo caminho aqui precisa terminar numa tela real: itens salvos sem a
  // referência esperada (ex.: um "simulado" sem ref_id, que existia no
  // cronograma antigo) caem na LISTA daquele tipo em vez de abrir uma tela
  // quebrada — nenhum item pode virar um clique que não faz nada.
  abrirItemTrilha(item: TrilhaItem, diaNumero?: number, indice?: number) {
    if (item.tipo === "aula") {
      if (!item.url) return this.nav("conteudo", { contTitle: "Videoaulas", contTipo: "aula", contBack: "plano" });
      // Todas as aulas do mesmo dia viram a playlist do player.
      const aulasDoDia = (this.props.dados.trilhaHoje?.itens || [])
        .filter((it) => it.tipo === "aula" && it.url)
        .map((it) => ({ id: it.ref_id, titulo: it.titulo, url: it.url as string, materia: it.materia }));
      this.abrirAula(item.ref_id, item.titulo, item.url, "plano", aulasDoDia);
    } else if (item.tipo === "pdf" || item.tipo === "link") {
      if (!item.url) return this.nav("conteudo", { contTitle: item.tipo === "pdf" ? "PDFs" : "Links úteis", contTipo: item.tipo, contBack: "plano" });
      this.openBrowser(item.titulo, item.url, "plano");
    } else if (item.tipo === "questoes") {
      // Atividade diária = sessão fechada de N questões, numa rota própria.
      // Antes isto abria a tela de prática com `qMateria`, e `qList()`
      // devolvia TODAS as questões da matéria — "1 / 82" no cabeçalho. Ver
      // lib/trilha/sessao-questoes.ts.
      if (diaNumero == null || indice == null) {
        // Sem a posição não há como identificar a atividade; o Banco de
        // Questões continua sendo o destino honesto nesse caso.
        return this.nav("questoes", { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: item.materia });
      }
      // O bloco extra não tem posição fixa no dia — a chave dele é por dia.
      this.irParaRota(
        "/aluno/sessao/" +
          encodeURIComponent(item.extra ? chaveSessaoExtra(diaNumero) : chaveSessaoTrilha(diaNumero, indice))
      );
    } else if (item.tipo === "flashcards") {
      const pool = this.props.dados.flashcards;
      if (item.materia) this.iniciarFlashcards(this.embaralhar(pool.filter((c) => mesmaMateria(c.materia, item.materia))), false);
      else this.nav("flashcards-select");
    } else if (item.tipo === "simulado" && !item.ref_id) {
      this.nav("simulados");
    } else if (item.tipo === "simulado") {
      this.setState({ simId: item.ref_id, simView: "run", simIdx: 0, simAns: {}, simGrid: false, simSec: 0, screen: "simulados" });
    } else if (item.tipo === "atividade") {
      // Atividades são rota real do Next, não tela da SPA.
      this.irParaRota(item.ref_id ? `/aluno/atividades/${item.ref_id}` : "/aluno/atividades");
    } else if (item.tipo === "pagina") {
      // Página interna escolhida pelo admin no editor do cronograma. A rota
      // vem em `url` — se vier vazia, cai no painel em vez de não fazer nada.
      this.irParaRota(item.url || "/aluno");
    } else if (item.tipo === "revisao") {
      this.startReview();
    } else if (item.tipo === "redacao") {
      this.nav("redacao");
    } else if (item.tipo === "leitura") {
      // Resumo de livro. O endereço vem das Configurações do painel e chega
      // aqui já resolvido em `resolverCronograma` — antes estes quatro itens
      // tinham `url` nula e esta função os ignorava de propósito ("leitura
      // não abre nada"), então o aluno via o resumo e não tinha para onde ir.
      //
      // Cai para o link do número do livro quando o item vier de um caminho
      // que não passou pelo resolvedor (uma missão remarcada pelo Copiloto,
      // por exemplo, que copia só o título).
      const url = item.url || urlDoResumo(numeroDoLivro(item.titulo), this.props.dados.linksDosResumos ?? {});
      if (!url) {
        return this.avisar(
          "O link deste resumo ainda não foi cadastrado. Assim que o administrador informar o endereço, este botão abre direto."
        );
      }
      this.openBrowser(item.titulo, url, "plano");
    }
    // "livre" continua sem ação: é o dia de descanso, item de marcar e
    // desmarcar. O toque no círculo de conclusão segue funcionando pela
    // chave de progresso.
  }
  // Chave estável de progresso por item — a mesma aula aberta de qualquer
  // tela (cronograma, Estudos, missão do Copiloto) precisa cair na mesma
  // chave, senão o progresso e a conclusão não se comunicam entre as telas.
  //
  // Nem toda aula tem ref_id: os itens do cronograma podem guardar só a URL
  // do vídeo (é o caso de todos os dias importados até aqui). Antes, essas
  // aulas recebiam chave nula e ficavam SEM progresso, SEM "continuar
  // assistindo" e SEM poder ser marcadas como concluídas. Por isso a chave
  // cai para o ID do vídeo no YouTube, que é tão estável quanto o ref_id e
  // continua igual mesmo se o admin reordenar os itens do dia.
  // As chaves vivem em lib/trilha/progresso.ts: o Copiloto (no servidor)
  // lê as mesmas chaves para saber o que o aluno já concluiu, e duas
  // implementações separadas acabariam divergindo.
  chaveAula(conteudoId: string): string {
    return chaveAula(conteudoId);
  }
  chaveDeAula(refId: string | null, url: string | null): string | null {
    return chaveDeAula(refId, url);
  }
  chaveItemTrilha(diaNumero: number, indice: number): string {
    return chaveItemTrilha(diaNumero, indice);
  }
  chaveDeItemTrilha(diaNumero: number, indice: number, item: TrilhaItem): string | null {
    return chaveDeItemTrilha(diaNumero, indice, item);
  }
  progressoDe(chave: string | null): AlunoProgressoItem | undefined {
    return chave ? this.state.progressoLocal[chave] : undefined;
  }
  estaConcluido(chave: string | null): boolean {
    return !!this.progressoDe(chave)?.concluida;
  }
  // Alternância manual de conclusão — usada tanto pelo botão "Marcar como
  // concluída" do player quanto pelo checkbox de qualquer item do
  // cronograma (aula, pdf, link, questões, flashcards, simulado, revisão).
  // Atualiza o estado local de forma otimista e grava em segundo plano.
  toggleItemGenerico(chave: string) {
    const atual = this.state.progressoLocal[chave] as AlunoProgressoItem | undefined;
    const nova = !atual?.concluida;
    this.setState((s: any) => ({
      progressoLocal: {
        ...s.progressoLocal,
        [chave]: {
          aluno_id: this.props.alunoId,
          posicao_segundos: atual?.posicao_segundos ?? 0,
          duracao_segundos: atual?.duracao_segundos ?? null,
          ...atual,
          chave,
          concluida: nova,
          concluida_em: nova ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }
      }
    }));
    if (this.props.demoMode) return;
    const desfazer = () =>
      this.setState((s: any) => ({
        progressoLocal: { ...s.progressoLocal, [chave]: atual ?? undefined }
      }));
    alternarConclusaoItem(chave, nova)
      .then((res) => {
        if (!res?.ok) {
          desfazer();
          this.avisar("Não foi possível salvar esse item. Verifique sua conexão e tente de novo.");
        }
      })
      .catch(() => {
        desfazer();
        this.avisar("Não foi possível salvar esse item. Verifique sua conexão e tente de novo.");
      });
  }
  // Vídeo mais recente que o aluno começou e ainda não terminou — alimenta
  // o card "Continuar assistindo" em Estudos.
  // Aulas conhecidas por chave de progresso — junta a biblioteca
  // (conteudos_biblioteca) com as aulas embutidas nos dias do cronograma,
  // que não existem como registro separado. Sem isso, "continuar
  // assistindo" nunca encontrava as aulas do cronograma.
  aulasPorChave(): Map<string, { id: string | null; titulo: string; url: string; materia: string | null }> {
    const mapa = new Map<string, { id: string | null; titulo: string; url: string; materia: string | null }>();
    this.props.dados.conteudos
      .filter((c) => c.tipo === "aula" && c.url)
      .forEach((c) => {
        const chave = this.chaveDeAula(c.id, c.url);
        if (chave) mapa.set(chave, { id: c.id, titulo: c.titulo, url: c.url as string, materia: c.materia });
      });
    [this.props.dados.trilhaHoje, ...this.props.dados.trilhaProximos].forEach((dia) => {
      (dia?.itens || []).forEach((item) => {
        if (item.tipo !== "aula" || !item.url) return;
        const chave = this.chaveDeAula(item.ref_id, item.url);
        if (chave && !mapa.has(chave)) mapa.set(chave, { id: item.ref_id, titulo: item.titulo, url: item.url, materia: item.materia });
      });
    });
    // Aulas de qualquer dia do cronograma, não só dos próximos 7: quem
    // assistiu uma aula adiantada pela aba Estudos também precisa achá-la
    // em "continuar assistindo".
    this.props.dados.conteudosTrilha.forEach((i) => {
      if (i.tipo !== "aula") return;
      const chave = this.chaveDeAula(i.ref_id, i.url);
      if (chave && !mapa.has(chave)) mapa.set(chave, { id: i.ref_id, titulo: i.titulo, url: i.url, materia: i.materia });
    });
    return mapa;
  }
  continuarAssistindo(): { aula: { id: string | null; titulo: string; url: string; materia: string | null }; progresso: AlunoProgressoItem } | null {
    const mapa = this.aulasPorChave();
    const candidatos = Object.values(this.state.progressoLocal as Record<string, AlunoProgressoItem>)
      .filter((p) => !p.concluida && p.posicao_segundos > 5 && mapa.has(p.chave))
      .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    const p = candidatos[0];
    return p ? { aula: mapa.get(p.chave)!, progresso: p } : null;
  }
  // Abre a videoaula no player integrado (scrPlayer()), em vez do navegador
  // interno genérico — vídeos merecem uma experiência dedicada (sem barra de
  // endereço) com progresso salvo automaticamente. conteudoId pode ser null
  // pra itens antigos sem referência real; nesse caso o vídeo ainda abre,
  // só sem progresso/"continuar assistindo" (não há chave estável pra isso).
  abrirAula(
    conteudoId: string | null,
    titulo: string,
    url: string,
    back: string,
    lista: { id: string | null; titulo: string; url: string; materia?: string | null }[] = []
  ) {
    const chave = this.chaveDeAula(conteudoId, url);
    const posicaoInicial = this.progressoDe(chave)?.posicao_segundos || 0;
    this.nav("player", {
      playerChave: chave,
      playerTitulo: titulo,
      playerUrl: url,
      playerBack: back,
      playerPosicaoInicial: posicaoInicial,
      playerLista: lista
    });
  }
  // Troca de aula sem sair do player (lista lateral/inferior). Salva o
  // progresso da aula atual antes, senão o "continuar assistindo" ficaria
  // preso no ponto em que a aula anterior foi aberta.
  trocarAula(item: { id: string | null; titulo: string; url: string }) {
    this.salvarProgressoDoPlayer(false);
    this.destruirPlayerYoutube();
    const chave = this.chaveDeAula(item.id, item.url);
    this.setState({
      playerChave: chave,
      playerTitulo: item.titulo,
      playerUrl: item.url,
      playerPosicaoInicial: this.progressoDe(chave)?.posicao_segundos || 0
    });
  }
  // Extrai só o ID do vídeo (não a URL /embed/ inteira) — é o que a
  // YouTube IFrame Player API espera em { videoId }.
  youtubeVideoId(url: string): string | null {
    return youtubeVideoId(url);
  }
  // Injeta o script da YouTube IFrame Player API uma única vez (mesmo se
  // várias aulas forem abertas na mesma sessão) e encadeia callbacks de
  // onYouTubeIframeAPIReady sem sobrescrever um já registrado por outra
  // parte da página.
  carregarYoutubeApi(aoPronto: () => void) {
    const w = window as any;
    if (w.YT && w.YT.Player) {
      aoPronto();
      return;
    }
    const anterior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      anterior?.();
      aoPronto();
    };
    if (!document.getElementById("dm-yt-iframe-api")) {
      const script = document.createElement("script");
      script.id = "dm-yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  }
  criarYoutubePlayer(elId: string, videoId: string, posicaoInicial: number) {
    const w = window as any;
    if (!document.getElementById(elId)) return; // aluno já navegou pra outra tela antes da API carregar
    this._ytPlayer = new w.YT.Player(elId, {
      videoId,
      playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: (e: any) => {
          if (posicaoInicial > 3) e.target.seekTo(posicaoInicial, true);
          this.pararChecagemDeProgresso();
          this._ytProgressoInterval = setInterval(() => this.salvarProgressoDoPlayer(false), 8000);
        },
        onStateChange: (e: any) => {
          if (e.data === w.YT.PlayerState.ENDED) this.salvarProgressoDoPlayer(true);
        }
      }
    });
  }
  // ─────────────────────────────────────────────── o player que não reinicia ─
  //
  // O DEFEITO: a aula travava e voltava ao começo sozinha, a cada poucos
  // segundos de reprodução.
  //
  // A causa eram duas coisas se somando.
  //
  //   1. O ref era uma função INLINE: `ref: (el) => this.refPlayer(el, ...)`.
  //      Uma arrow criada no render tem identidade nova a cada passagem, e o
  //      React trata isso como um ref diferente: chama o antigo com `null` e
  //      o novo com o elemento. O `null` caía no ramo que DESTRÓI o player.
  //
  //   2. `salvarProgressoDoPlayer` faz `setState` a cada 8 segundos para
  //      alimentar o "Continuar assistindo".
  //
  //   Juntas: a cada 8 segundos o player era destruído e recriado — e recriado
  //   com `playerPosicaoInicial`, que é onde a aula foi ABERTA. Daí o vídeo
  //   voltar ao início.
  //
  // A correção tem três partes: o ref tem identidade estável (é este campo,
  // criado uma vez), o React possui um HOST que a API do YouTube nunca toca,
  // e a criação do player virou uma sincronização idempotente — chamada no
  // mount e em cada update, ela não faz nada quando o vídeo é o mesmo.
  _refHostYoutube = (el: HTMLDivElement | null) => {
    if (!el) {
      this.destruirPlayerYoutube();
      this._ytHost = null;
      return;
    }
    this._ytHost = el;
    this.sincronizarPlayerYoutube();
  };

  /**
   * Garante que o player em tela corresponde à aula do state. Idempotente.
   *
   * Chamada de novo a cada render não custa nada: se o vídeo é o mesmo e o
   * player existe, ela retorna sem tocar em nada — que é justamente o que
   * mantém a reprodução viva.
   */
  sincronizarPlayerYoutube() {
    const host = this._ytHost;
    const desejado = this.state.screen === "player" ? this.youtubeVideoId(this.state.playerUrl || "") : null;

    if (!host || !desejado) {
      if (!desejado) this.destruirPlayerYoutube();
      return;
    }
    if (this._ytVideoIdAtual === desejado && this._ytPlayer) return;

    this.destruirPlayerYoutube();
    this._ytVideoIdAtual = desejado;

    // O elemento que a API vai substituir é criado aqui, dentro do host — o
    // React não sabe dele e não vai tentar removê-lo depois.
    host.innerHTML = "";
    const alvo = document.createElement("div");
    alvo.id = "dm-yt-player-" + desejado;
    host.appendChild(alvo);

    // A posição vem do progresso ATUAL, não de `playerPosicaoInicial`. Se por
    // qualquer motivo o player precisar ser recriado, ele volta para onde o
    // aluno estava — e não para onde ele abriu a aula.
    const chave = this.state.playerChave as string | null;
    const posicao = (chave && this.progressoDe(chave)?.posicao_segundos) || this.state.playerPosicaoInicial || 0;

    this.carregarYoutubeApi(() => {
      // Entre pedir a API e ela ficar pronta o aluno pode ter saído ou
      // trocado de aula; sem esta conferência, o player nasceria órfão.
      if (this._ytVideoIdAtual !== desejado || !document.getElementById(alvo.id)) return;
      this.criarYoutubePlayer(alvo.id, desejado, posicao);
    });
  }
  pararChecagemDeProgresso() {
    if (this._ytProgressoInterval) clearInterval(this._ytProgressoInterval);
    this._ytProgressoInterval = null;
  }
  destruirPlayerYoutube() {
    this.pararChecagemDeProgresso();
    if (this._ytPlayer) {
      try {
        this._ytPlayer.destroy();
      } catch {}
      this._ytPlayer = null;
    }
    this._ytVideoIdAtual = null;
  }
  // Salva posição/duração atuais (pra "Continuar assistindo") e marca
  // conclusão automática acima de 90% do vídeo — chamado periodicamente
  // enquanto o player toca e uma vez ao terminar o vídeo.
  salvarProgressoDoPlayer(finalizado: boolean) {
    const chave = this.state.playerChave as string | null;
    if (!chave || !this._ytPlayer || this.props.demoMode) return;
    const posicao = Math.floor(this._ytPlayer.getCurrentTime?.() || 0);
    const duracao = Math.floor(this._ytPlayer.getDuration?.() || 0);
    if (!duracao) return;
    const concluidaAntes = this.estaConcluido(chave);
    const concluida = finalizado || posicao / duracao >= 0.9 || concluidaAntes;
    this.setState((s: any) => ({
      progressoLocal: {
        ...s.progressoLocal,
        [chave]: {
          aluno_id: this.props.alunoId,
          chave,
          posicao_segundos: posicao,
          duracao_segundos: duracao,
          concluida,
          concluida_em: concluida ? s.progressoLocal[chave]?.concluida_em ?? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }
      }
    }));
    salvarProgressoVideo(chave, posicao, duracao, finalizado).catch((e) => console.error("Falha ao salvar progresso do vídeo:", e));
  }
  fecharPlayer() {
    this.salvarProgressoDoPlayer(false);
    this.nav(this.state.playerBack || "estudos");
  }
  // Navega para dentro do app quando o link do banner é "app/<tela>"
  // (convenção usada no formulário de banners do admin — ver
  // banners-manager.tsx), ou abre como página externa caso contrário.
  irParaLinkBanner(link: string | null) {
    if (!link) return;
    if (link.startsWith("app/")) this.nav(link.slice(4));
    else this.openBrowser("Decola Med", link, this.state.screen);
  }
  // Botão personalizado da aba Estudos (estudos_botoes, cadastrado em
  // /admin/estudos) — abre de acordo com o tipo escolhido pelo admin: tela
  // interna do app, player de vídeo, ou navegador interno (pdf/link).
  abrirBotaoEstudos(botao: EstudosBotao) {
    if (botao.tipo === "app") this.nav(botao.link);
    else if (botao.tipo === "aula") this.abrirAula(null, botao.titulo, botao.link, "estudos");
    else this.openBrowser(botao.titulo, botao.link, "estudos");
  }
  bannerRow() {
    const { h, I } = this.ui();
    const reais = this.props.dados.banners;
    if (!reais.length) return null;
    const banners = reais.map((b) => ({ t: b.titulo, ic: "bell", bg: b.bg, act: () => this.irParaLinkBanner(b.link) }));
    const bs = [...banners, { ...banners[0], clone: true }];
    return h(
      "div",
      {
        id: "dm-ban",
        onScroll: (e: any) => {
          const el = e.currentTarget;
          const n = el.children.length - 1;
          const w = el.children[0].offsetWidth + 10;
          if (el.scrollLeft >= n * w - 2) el.scrollTo({ left: 0, behavior: "auto" });
        },
        style: { display: "flex", gap: 10, overflowX: "auto", overflowY: "hidden", margin: "0 18px", scrollSnapType: "x mandatory", scrollbarWidth: "none" }
      },
      bs.map((b, i) =>
        h(
          "div",
          {
            key: i,
            onClick: b.act,
            style: {
              minWidth: "100%",
              scrollSnapAlign: "start",
              borderRadius: 18,
              padding: "15px 16px",
              background: b.bg,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              gap: 12,
              alignItems: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,.18)"
            }
          },
          [
            h("div", { key: "i", style: { width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" } }, I(b.ic, 20, "#fff")),
            h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, b.t)]),
            I("chevR", 16, "rgba(255,255,255,.7)")
          ]
        )
      )
    );
  }

  head(title: string, opts: any = {}) {
    const { C, h, I } = this.ui();
    return h("div", { key: "head", style: { display: "flex", alignItems: "center", gap: 12, padding: "16px 18px 10px" } }, [
      opts.back !== false
        ? h(
            "div",
            {
              key: "b",
              onClick: () => this.nav(opts.back || "mapa"),
              style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.txt }
            },
            I("arrowL", 18, C.txt)
          )
        : null,
      h("div", { key: "t", style: { fontSize: 17, fontWeight: 800, color: C.txt, flex: 1 } }, title),
      this.comKey("r", opts.right) ||
        h(
          "div",
          {
            key: "r",
            onClick: () => this.setState({ notifOpen: true }),
            style: { position: "relative", width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
          },
          [I("bell", 18, C.txt), this.naoLidas() > 0 ? h("div", { key: "d", style: { position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 99, background: C.orange } }) : null]
        )
    ]);
  }
  tabbar() {
    const { C, h, I } = this.ui();
    const s = this.state.screen;
    const items = [
      { k: "mapa", ic: "plane", t: "Hoje" },
      { k: "painel", ic: "gauge", t: "Painel" },
      { k: "missoes", ic: "target", t: "Missões" },
      { k: "estudos", ic: "book", t: "Estudos" },
      { k: "mais", ic: "dots", t: "Mais" }
    ];
    return h(
      "div",
      { style: { position: "absolute", bottom: 0, left: 0, right: 0, background: C.navBg, backdropFilter: "blur(14px)", borderTop: "1px solid " + C.line, display: "flex", padding: "8px 8px 22px" } },
      items.map((it) => {
        const active = it.k === "mais" ? this.state.moreOpen : s === it.k;
        return h(
          "div",
          {
            key: it.k,
            onClick: () => (it.k === "mais" ? this.setState({ moreOpen: !this.state.moreOpen }) : this.nav(it.k)),
            style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", color: active ? C.orange : C.faint, padding: "4px 0" }
          },
          [I(it.ic, 21, active ? C.orange : C.faint), h("span", { key: "t", style: { fontSize: 9.5, fontWeight: 700 } }, it.t)]
        );
      })
    );
  }
  sidebarDesktop() {
    const { C, h, I } = this.ui();
    const s = this.state.screen;
    const items: { k: string; ic: string; t: string; href?: string }[] = [
      { k: "mapa", ic: "plane", t: "Mapa de Voo" },
      { k: "painel", ic: "gauge", t: "Painel de Bordo" },
      { k: "missoes", ic: "target", t: "Missões" },
      { k: "plano", ic: "calendar", t: "Cronograma" },
      { k: "estudos", ic: "book", t: "Estudos" },
      { k: "questoes", ic: "target", t: "Questões" },
      { k: "flashcards-select", ic: "cards", t: "Flashcards" },
      { k: "atividades", ic: "target", t: "Atividades", href: "/aluno/atividades" },
      { k: "copiloto", ic: "bot", t: "Copiloto IA" },
      { k: "raio-x", ic: "radar", t: "Raio-X", href: "/aluno/raio-x" },
      { k: "desempenho", ic: "gauge", t: "Desempenho", href: "/aluno/desempenho" },
      { k: "ranking", ic: "trophy", t: "Ranking" },
      { k: "conquistas", ic: "award", t: "Conquistas" },
      { k: "perfil", ic: "user", t: "Perfil" },
      { k: "config", ic: "gear", t: "Configurações" }
    ];
    return h(
      "div",
      {
        style: {
          width: 240,
          flexShrink: 0,
          background: "linear-gradient(180deg,#0d4a79 0%,#01395E 45%)",
          display: "flex",
          flexDirection: "column",
          padding: "22px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto"
        }
      },
      [
        h("img", { key: "l", src: "/assets/logo.png", alt: "Decola Med", style: { height: 36, alignSelf: "flex-start", margin: "0 8px 20px" } }),
        ...items.map((it) => {
          const act = s === it.k;
          return h(
            "div",
            {
              key: it.k,
              onClick: () => this.irParaItemMenu(it),
              style: {
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 13px",
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 3,
                background: act ? C.orange : "transparent",
                color: act ? "#fff" : "rgba(255,255,255,.72)",
                fontSize: 12.5,
                fontWeight: act ? 800 : 600
              }
            },
            [I(it.ic, 18, act ? "#fff" : "rgba(255,255,255,.72)"), it.t]
          );
        }),
        h("div", { key: "sp", style: { flex: 1, minHeight: 14 } }),
        h(
          "div",
          {
            key: "out",
            onClick: this.logout,
            style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, cursor: "pointer", color: "rgba(255,255,255,.6)", fontSize: 11.5, fontWeight: 700 }
          },
          [I("logout", 16, "rgba(255,255,255,.6)"), "Sair da conta"]
        )
      ]
    );
  }
  demoBanner() {
    if (!this.props.demoMode) return null;
    const { h } = this.ui();
    return h(
      "div",
      { key: "demo-banner", style: { flexShrink: 0, textAlign: "center", padding: "7px 10px", fontSize: 10.5, fontWeight: 800, letterSpacing: ".03em", textTransform: "uppercase", background: "#F8935A", color: "#01395E" } },
      "Modo demonstração · nenhuma resposta é salva de verdade"
    );
  }
  // Envolve um pedaço fixo do chrome (barra de abas, banner de demo,
  // overlays) com uma key própria. Esses helpers retornam elementos sem
  // key e entram em arrays de filhos aqui — sem isso o React avisa
  // "each child in a list should have a unique key" a cada render.
  comKey(chave: string, elemento: any) {
    return elemento ? React.createElement(React.Fragment, { key: chave }, elemento) : null;
  }
  // Aviso curto no rodapé. O app inteiro fazia atualização otimista sem ter
  // como dizer "não deu certo": quando uma gravação falhava, a tela ficava
  // mostrando o estado novo e o banco continuava com o antigo. Agora as
  // ações desfazem a mudança e chamam avisar() — mensagem em português, sem
  // detalhe técnico, como no resto do app.
  // Marca a anotação como salva com um pequeno atraso, para o rótulo não
  // piscar a cada tecla.
  marcarNotaSalva() {
    this.setState({ notaStatus: "salvando" });
    if (this.timerNota) clearTimeout(this.timerNota);
    this.timerNota = setTimeout(() => this.setState({ notaStatus: "salvo" }), 500);
  }
  rotuloSalvamento() {
    const { C, h, I } = this.ui();
    const st = this.state.notaStatus;
    if (!st) return null;
    const salvo = st === "salvo";
    return h(
      "span",
      { key: "st", style: { display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 800, color: salvo ? C.green : C.faint } },
      [salvo ? I("check", 12, C.green) : null, salvo ? "Salvo" : "Salvando..."]
    );
  }
  avisar(mensagem: string) {
    this.setState({ aviso: mensagem });
    if (this.timerAviso) clearTimeout(this.timerAviso);
    this.timerAviso = setTimeout(() => this.setState({ aviso: null }), 4000);
  }
  avisoToast() {
    if (!this.state.aviso) return null;
    const { C, h, I } = this.ui();
    return h(
      "div",
      {
        onClick: () => this.setState({ aviso: null }),
        style: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 92,
          zIndex: 70,
          display: "flex",
          gap: 9,
          alignItems: "center",
          padding: "12px 14px",
          borderRadius: 14,
          background: C.dark ? "#3a1a17" : "#fff1ef",
          border: "1.5px solid " + C.red,
          color: C.txt,
          fontSize: 12.5,
          fontWeight: 700,
          lineHeight: 1.45,
          boxShadow: "0 10px 26px rgba(2,15,26,.28)",
          cursor: "pointer",
          animation: "dm-in .25s ease both"
        }
      },
      [I("alert", 16, C.red), h("span", { key: "t", style: { flex: 1 } }, this.state.aviso)]
    );
  }
  // ---------- o conteúdo ocupando a tela do computador ----------
  //
  // A coluna de conteúdo era fixa em 640px, centralizada ao lado da barra
  // lateral. Num monitor de 1440px isso deixava quase metade da área vazia à
  // direita: o desenho estava certo, só não usava a tela.
  //
  // Telas de painel (Mapa de Voo e Painel de Bordo) são feitas de cartões
  // independentes — é o caso em que a coluna única desperdiça espaço. Elas
  // passam a fluir em DUAS colunas. As demais (questão, simulado, flashcard,
  // leitura) continuam em coluna única, porque ali largura demais atrapalha:
  // linha de texto comprida cansa, e alternativa de questão esticada fica
  // pior de acertar o clique. Para elas muda só a largura: 640 → 860.
  //
  // O fluxo em colunas do CSS (`columnCount`) foi escolhido no lugar de uma
  // grade. Numa grade, cada filho ocupa uma célula mesmo quando não desenha
  // nada — e a faixa de banners, vazia para quem não tem banner, abria um
  // buraco no meio do painel. No fluxo em colunas um bloco sem altura não
  // custa nada, e as duas colunas ainda se equilibram sozinhas.
  //
  // `CABECALHOS_LARGOS` diz quantos filhos do topo ficam FORA do fluxo,
  // atravessando a largura toda: a logo e a saudação, no Mapa; a barra de
  // título, no Painel. Sem isso a saudação cairia na segunda coluna.
  conteudoLargo(children: any) {
    const { h } = this.ui();
    // Por tela: quantos filhos do topo ficam FORA do fluxo (atravessando a
    // largura toda) e se o primeiro deles é a logo — que no computador já
    // aparece na barra lateral e, repetida no topo, fica sobrando.
    const PAINEIS: Record<string, { atravessam: number; logoRepetida?: boolean }> = {
      mapa: { atravessam: 1, logoRepetida: true },
      painel: { atravessam: 1 }
    };
    const tela = this.state.screen as string;
    const painel = PAINEIS[tela];

    if (!painel) {
      return h(
        "div",
        { style: { display: "flex", flexDirection: "column", maxWidth: 860, margin: "0 auto", padding: "26px 32px 60px" } },
        children
      );
    }

    const todos = (Array.isArray(children) ? children : [children]).filter(Boolean);
    const filhos = painel.logoRepetida ? todos.slice(1) : todos;
    const cabecalho = filhos.slice(0, painel.atravessam);
    const corpo = filhos.slice(painel.atravessam);

    return h("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "26px 24px 60px" } }, [
      h("div", { key: "topo" }, cabecalho),
      h(
        "div",
        { key: "corpo", style: { columnCount: 2, columnGap: 10, marginTop: 4 } },
        corpo.map((filho: any, i: number) =>
          h(
            "div",
            // `breakInside: avoid` impede um cartão de ser partido ao meio na
            // virada de coluna. `display: block` porque um filho com display
            // flex ignoraria a regra de quebra em alguns navegadores.
            { key: "bl" + i, style: { breakInside: "avoid", display: "block" } },
            filho
          )
        )
      )
    ]);
  }

  screenWrap(children: any, opts: any = {}) {
    const { C, h } = this.ui();
    if (this.wide()) {
      return h("div", { style: { display: "flex", alignItems: "flex-start" } }, [
        this.comKey("sidebar", this.sidebarDesktop()),
        h("div", { key: "m", style: { flex: 1, minWidth: 0, minHeight: "100vh", position: "relative", background: C.bg, color: C.txt } }, [
          this.comKey("demo", this.demoBanner()),
          this.comKey("c", this.conteudoLargo(children)),
          this.state.notifOpen ? this.comKey("notif", this.notifSheet()) : null,
          this.comKey("aviso", this.avisoToast())
        ])
      ]);
    }
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      this.comKey("demo", this.demoBanner()),
      // `data-conteudo-rolavel` é o gancho que o CSS usa para dar respiro
      // lateral proporcional no tablet (ver decola-app.module.css). O
      // conteúdo é montado com React.createElement e estilos inline, sem
      // classes próprias — este atributo evita ter que tocar em cada tela.
      h("div", { key: "c", "data-conteudo-rolavel": true, style: { flex: 1, overflowY: "auto", paddingBottom: opts.noTab ? 24 : 110, display: "flex", flexDirection: "column" } }, children),
      opts.noTab ? null : this.comKey("tabbar", this.tabbar()),
      this.state.notifOpen ? this.comKey("notif", this.notifSheet()) : null,
      this.state.moreOpen && !opts.noTab ? this.comKey("more", this.moreSheet()) : null,
      this.comKey("aviso", this.avisoToast())
    ]);
  }

  naoLidas() {
    return this.state.notifsLocal.filter((n: Notificacao) => !n.lida).length;
  }
  abrirNotificacao(id: string) {
    this.setState({
      notifsLocal: this.state.notifsLocal.map((n: Notificacao) => (n.id === id ? { ...n, lida: true } : n))
    });
    if (this.props.demoMode) return;
    // Sem aviso na tela de propósito: o próprio contador de não lidas é o
    // sinal, e um toast a cada notificação aberta viraria ruído. O que
    // importa é não deixar o contador mentir.
    const desfazer = () =>
      this.setState((st: any) => ({
        notifsLocal: st.notifsLocal.map((n: Notificacao) => (n.id === id ? { ...n, lida: false } : n))
      }));
    marcarNotificacaoLida(id)
      .then((res) => {
        if (!res?.ok) desfazer();
      })
      .catch(desfazer);
  }
  // ---------- overlays ----------
  notifSheet() {
    const { C, h, I, iconBox } = this.ui();
    const d = this.data();
    return h(
      "div",
      {
        onClick: () => this.setState({ notifOpen: false }),
        style: { position: "absolute", inset: 0, background: "rgba(2,15,26,.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }
      },
      h(
        "div",
        { onClick: (e: any) => e.stopPropagation(), style: { background: C.card, borderRadius: "26px 26px 0 0", padding: "18px 18px 34px", maxHeight: "70%", overflowY: "auto", animation: "dm-in .3s ease both" } },
        [
          h("div", { key: "h", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, [
            h("div", { key: "t", style: { fontSize: 16, fontWeight: 800, color: C.txt } }, "Notificações"),
            h("div", { key: "x", onClick: () => this.setState({ notifOpen: false }), style: { cursor: "pointer", color: C.sub } }, I("x", 18, C.sub))
          ]),
          ...(d.notifs.length
            ? d.notifs.map(
                (n: { id: string; ic: string; t: string; d: string; time: string; tone: string; lida: boolean }, i: number) =>
                  h(
                    "div",
                    {
                      key: i,
                      onClick: () => this.abrirNotificacao(n.id),
                      style: { display: "flex", gap: 12, alignItems: "center", padding: "11px 4px", cursor: "pointer", borderBottom: i < d.notifs.length - 1 ? "1px solid " + C.line : "none", opacity: n.lida ? 0.6 : 1 }
                    },
                    [
                      iconBox(n.ic, n.tone === "orange" ? C.orangeSoft : C.blueSoft, n.tone === "orange" ? C.orange : C.dark ? "#8fc3e8" : "#01395E", 40, 18),
                      h("div", { key: "b", style: { flex: 1 } }, [
                        h("div", { key: "t", style: { fontSize: 13, fontWeight: n.lida ? 600 : 800, color: C.txt } }, n.t),
                        h("div", { key: "d", style: { fontSize: 11.5, color: C.sub, marginTop: 2 } }, n.d)
                      ]),
                      h("div", { key: "tm", style: { fontSize: 10.5, color: C.faint, fontWeight: 600 } }, n.time)
                    ]
                  )
              )
            : [h("div", { key: "vazio", style: { padding: "20px 4px", textAlign: "center", fontSize: 12.5, color: C.sub, fontWeight: 600 } }, "Nenhuma notificação por aqui ainda.")])
        ]
      )
    );
  }
  moreSheet() {
    const { C, h, I, iconBox } = this.ui();
    // `href` = rota real do Next; sem `href`, é uma tela interna da SPA.
    const items: { k: string; ic: string; t: string; href?: string }[] = [
      { k: "questoes", ic: "target", t: "Questões" },
      { k: "atividades", ic: "target", t: "Atividades", href: "/aluno/atividades" },
      { k: "copiloto", ic: "bot", t: "Copiloto IA" },
      { k: "plano", ic: "calendar", t: "Cronograma" },
      { k: "raio-x", ic: "radar", t: "Raio-X", href: "/aluno/raio-x" },
      { k: "desempenho", ic: "gauge", t: "Desempenho", href: "/aluno/desempenho" },
      { k: "redacao", ic: "note", t: "Redação" },
      { k: "ranking", ic: "trophy", t: "Ranking" },
      { k: "conquistas", ic: "award", t: "Conquistas" },
      { k: "perfil", ic: "user", t: "Perfil" },
      { k: "config", ic: "gear", t: "Configurações" }
    ];
    return h(
      "div",
      {
        onClick: () => this.setState({ moreOpen: false }),
        style: { position: "absolute", inset: 0, background: "rgba(2,15,26,.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }
      },
      h("div", { onClick: (e: any) => e.stopPropagation(), style: { background: C.card, borderRadius: "26px 26px 0 0", padding: "20px 18px 96px", animation: "dm-in .3s ease both" } }, [
        h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, color: C.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 } }, "Torre de Controle"),
        h(
          "div",
          { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 } },
          items.map((it) =>
            h(
              "div",
              { key: it.k, onClick: () => this.irParaItemMenu(it), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 4px", borderRadius: 16, background: C.chip, cursor: "pointer" } },
              [iconBox(it.ic, C.orangeSoft, C.orange, 40, 19), h("span", { key: "t", style: { fontSize: 10.5, fontWeight: 700, color: C.txt, textAlign: "center" } }, it.t)]
            )
          )
        )
      ])
    );
  }

  // ---------- telas ----------
  scrMapa() {
    const { C, h, I, card, bar, btn } = this.ui();
    const S = this.state;
    const seq = this.todaySeq();
    const doneN = seq.filter((o) => o.done).length;
    const pct = seq.length ? Math.round((doneN / seq.length) * 100) : 0;
    const nextI = seq.findIndex((o) => !o.done);
    const pro = this.plan() === "voo-guiado";
    const wk = this.weakest();
    const hojeStr = this.props.dados.hojeStr;
    const dataProvaPainel = this.dataDaProva();
    const upcoming = (this.state.missoesLocal as AlunoMissao[])
      .filter((m) => m.data > hojeStr && !(dataProvaPainel && m.data === dataProvaPainel))
      .sort((a, b) => a.data.localeCompare(b.data) || b.prioridade - a.prioridade)
      .slice(0, 5)
      .map((m) => [m.titulo, new Date(m.data + "T12:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })]);
    return this.screenWrap([
      h("div", { key: "brand", style: { display: "flex", justifyContent: "center", padding: "20px 0 6px" } }, h("img", { src: "/assets/logo.png", alt: "Decola Med", style: { height: 50, filter: "drop-shadow(0 4px 10px rgba(1,20,40,.25))" } })),
      h("div", { key: "hd", style: { padding: "6px 20px 6px", display: "flex", alignItems: "center", gap: 12 } }, [
        h("div", { key: "g", style: { flex: 1 } }, [
          h("div", { key: "a", style: { fontSize: 19, fontWeight: 900 } }, this.saudacao() + ", " + this.primeiroNome() + "!"),
          h(
            "div",
            { key: "b", style: { fontSize: 12.5, color: C.sub, marginTop: 2 } },
            (function (self) {
              const B = self.state.brief || {};
              const dd = B.prova ? Math.max(0, Math.ceil((+new Date(B.prova + "T12:00") - Date.now()) / 864e5)) : null;
              return dd != null ? "Prova em " + dd + " dias · " + B.dias + " dias/sem · " + B.horas + "h/dia" : "Sua rota de estudos está pronta.";
            })(this)
          )
        ]),
        h(
          "div",
          {
            key: "n",
            onClick: () => this.setState({ notifOpen: true }),
            style: { position: "relative", width: 38, height: 38, borderRadius: 13, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
          },
          [
            I("bell", 19, C.txt),
            this.naoLidas() > 0
              ? h(
                  "div",
                  {
                    key: "d",
                    style: { position: "absolute", top: 6, right: 6, minWidth: 15, height: 15, borderRadius: 99, background: C.orange, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }
                  },
                  String(this.naoLidas())
                )
              : null
          ]
        )
      ]),
      h("div", { key: "ban", style: { marginTop: 10 } }, this.bannerRow()),
      h(
        "div",
        { key: "plan", style: { margin: "12px 18px 0", display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", borderRadius: 16, background: C.card, border: "1px solid " + C.line, boxShadow: "0 6px 16px rgba(1,30,50,.08)" } },
        [
          h("div", { key: "i", style: { fontSize: 24, animation: "dm-fly 3.5s ease-in-out infinite", lineHeight: 1 } }, "🚀"),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900, color: C.txt } }, "Tudo pronto para decolar!"),
            h("div", { key: "b", style: { fontSize: 11, fontWeight: 600, color: C.sub, marginTop: 2 } }, "Estas são as missões programadas para hoje.")
          ]),
          h(
            "span",
            { key: "p", style: { fontSize: 9, fontWeight: 900, color: pro ? "#fff" : C.orange, background: pro ? C.orange : C.orangeSoft, padding: "4px 10px", borderRadius: 99, letterSpacing: ".05em", whiteSpace: "nowrap" } },
            pro ? "VOO GUIADO · PRO" : "DECOLANDO"
          )
        ]
      ),
      h(
        "div",
        { key: "hero", style: { margin: "12px 18px 0" } },
        card({ padding: 0, overflow: "hidden" }, [
          h("div", { key: "top", onClick: () => this.setState({ upcomingOpen: !S.upcomingOpen }), style: { padding: "16px 16px 14px", background: C.headGrad, color: "#fff", cursor: "pointer" } }, [
            h("div", { key: "r", style: { display: "flex", alignItems: "center", gap: 12 } }, [
              h(
                "div",
                { key: "i", style: { width: 46, height: 46, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", animation: "dm-fly 3.5s ease-in-out infinite", flexShrink: 0 } },
                I("plane", 22, "#F8935A")
              ),
              h("div", { key: "t", style: { flex: 1 } }, [
                // "Missão do Dia · Missão 6" e "Sistema Digestório" estavam
                // ESCRITOS AQUI, fixos, sobrevivendo desde a versão de
                // demonstração sem banco. Era isso que o aluno via na tela
                // inicial, independentemente da rota dele — nenhum dado
                // errado, nenhuma consulta errada: um texto constante.
                // Agora vêm da rota ativa, pela mesma fonte que o cronograma.
                h("div", { key: "a", style: { fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,.65)", letterSpacing: ".08em", textTransform: "uppercase" } }, this.rotuloMissaoDoDia()),
                h("div", { key: "b", style: { fontSize: 17, fontWeight: 900 } }, this.tituloMissaoDoDia()),
                h("div", { key: "c", style: { fontSize: 10.5, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 2 } }, seq.length + " passos · toque para ver as próximas missões")
              ]),
              h("div", { key: "p", style: { textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 } }, [
                h("div", { key: "v", style: { fontSize: 18, fontWeight: 900, color: "#F8935A" } }, pct + "%"),
                h("div", { key: "c", style: { transform: S.upcomingOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "flex" } }, I("chevR", 15, "rgba(255,255,255,.6)"))
              ])
            ]),
            h("div", { key: "bar", style: { display: "flex", marginTop: 12 } }, bar(pct, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ]),
          S.upcomingOpen
            ? h("div", { key: "up", style: { padding: "12px 16px", background: C.card2, borderBottom: "1px solid " + C.line } }, [
                h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 8 } }, "Próximas missões · o que vem depois de hoje"),
                // Sem cadeado: nada aqui está bloqueado. O ícone e a frase
                // "são liberadas quando você conclui a missão do dia"
                // descreviam uma regra de progressão que não existe no
                // código — qualquer uma dessas missões abre pelo cronograma.
                // Prometer bloqueio inexistente confunde duas vezes: sugere
                // que o aluno não pode adiantar, e faz a lista parecer um
                // segundo cronograma.
                ...upcoming.map((u, i) =>
                  h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i < upcoming.length - 1 ? "1px solid " + C.line : "none" } }, [
                    h("span", { key: "c" }, I("calendar", 13, C.faint)),
                    h("span", { key: "t", style: { flex: 1, fontSize: 12, fontWeight: 700, color: C.sub } }, u[0]),
                    h("span", { key: "d", style: { fontSize: 10.5, fontWeight: 700, color: C.faint } }, u[1])
                  ])
                ),
                h(
                  "div",
                  {
                    key: "n",
                    onClick: () => this.nav("plano"),
                    style: { marginTop: 8, fontSize: 10, fontWeight: 700, color: C.orange, cursor: "pointer" }
                  },
                  "Ver no cronograma, dia a dia →"
                )
              ])
            : null,
          h("div", { key: "steps", style: { padding: "4px 16px 16px" } }, [
            h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase", margin: "12px 0 2px" } }, "Sequência de hoje — siga na ordem"),
            ...seq.map((o, i) => {
              const dn = !!o.done;
              const isNext = i === nextI;
              return h("div", { key: "s" + i, style: { display: "flex", gap: 11, alignItems: "center", padding: "10px 0", borderBottom: i < seq.length - 1 ? "1px solid " + C.line : "none", opacity: dn ? 0.55 : 1 } }, [
                h(
                  "div",
                  {
                    key: "n",
                    onClick: (e: any) => {
                      e.stopPropagation();
                      o.toggle?.();
                    },
                    title: o.toggle ? (dn ? "Desmarcar" : "Marcar como concluído") : undefined,
                    style: {
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: o.toggle ? "pointer" : "default",
                      fontSize: 12,
                      fontWeight: 900,
                      background: dn ? C.green : isNext ? C.orange : C.chip,
                      color: dn || isNext ? "#fff" : C.sub
                    }
                  },
                  dn ? I("check", 14, "#fff", 3) : i + 1
                ),
                h("div", { key: "t", onClick: o.act, style: { flex: 1, cursor: "pointer" } }, [
                  h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800, textDecoration: dn ? "line-through" : "none", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, [
                    o.t,
                    o.ia ? h("span", { key: "g", style: { fontSize: 8.5, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99, letterSpacing: ".04em" } }, "COPILOTO") : null
                  ]),
                  h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 1 } }, o.d)
                ]),
                h("div", { key: "go", onClick: o.act, style: { cursor: "pointer", display: "flex" } }, I("chevR", 16, isNext ? C.orange : C.faint))
              ]);
            }),
            nextI >= 0
              ? btn("COMEÇAR PASSO " + (nextI + 1) + " →", seq[nextI].act, { marginTop: 14, padding: "13px" })
              : h("div", { key: "done" }, [
                  h("div", { key: "a", style: { marginTop: 14, padding: "12px", borderRadius: 14, background: C.greenSoft, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: C.green } }, "Missão do Dia concluída! ✓"),
                  this.state.recsLocal.length ? btn("VER RECOMENDAÇÕES DO COPILOTO →", () => this.nav("copiloto"), { marginTop: 10, padding: "12px", fontSize: 12.5 }) : null
                ]),
            h("div", { key: "pl", onClick: () => this.nav("plano"), style: { textAlign: "center", fontSize: 11, fontWeight: 800, color: C.orange, paddingTop: 12, cursor: "pointer" } }, "Ver cronograma completo →")
          ])
        ])
      ),
      h(
        "div",
        { key: "cop", style: { margin: "14px 18px 0" } },
        card(
          { display: "flex", gap: 12, alignItems: "center" },
          [
            this.mascoteBadge("bot", 44, { anim: "none" }),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, "Copiloto Decola"),
              h(
                "div",
                { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2, lineHeight: 1.45 } },
                this.state.recsLocal.length
                  ? this.state.recsLocal.length + " recomendação" + (this.state.recsLocal.length > 1 ? "ões" : "") + " pendente" + (this.state.recsLocal.length > 1 ? "s" : "") + (wk ? " · maior ganho em " + wk : "")
                  : "Nenhuma recomendação pendente — continue estudando que eu aviso quando identificar algo importante."
              )
            ]),
            h("div", { key: "go", style: { fontSize: 11.5, fontWeight: 800, color: C.orange } }, "Abrir →")
          ],
          () => this.nav("copiloto")
        )
      )
    ]);
  }

  sparkline(vals: number[], color: string, w = 72, hgt = 26) {
    const h = React.createElement;
    const max = Math.max(...vals),
      min = Math.min(...vals);
    const pts = vals.map((v, i) => i * (w / (vals.length - 1)) + "," + (hgt - 3 - ((v - min) / (max - min || 1)) * (hgt - 6))).join(" ");
    return h("svg", { key: "spark", width: w, height: hgt }, h("polyline", { points: pts, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }));
  }

  scrPainel() {
    const { C, h, I, card, bar } = this.ui();
    const d = this.data();
    const P = this.props.dados;
    const xp = this.xpTotal();
    const seq = this.sequenciaDias();
    const totalResp = P.respostas.length;
    const acertosResp = P.respostas.filter((r) => r.correta).length;
    const precisaoGeral = totalResp > 0 ? Math.round((acertosResp / totalResp) * 100) : 0;
    const lembrados = P.revisoes.filter((r) => r.lembrou).length;
    const metrics = [
      { t: "Altitude (XP total)", v: String(xp), s: P.tentativas.length + " simulado(s) feito(s)", vals: [Math.max(1, xp - 1), xp || 1], c: "#5aa9e6" },
      { t: "Sequência", v: seq + " dia" + (seq === 1 ? "" : "s"), s: seq > 0 ? "Continue assim!" : "Comece hoje", vals: [Math.max(0, seq - 1), seq], c: C.orange },
      { t: "Precisão geral", v: precisaoGeral + "%", s: totalResp + " questões respondidas", vals: [Math.max(0, precisaoGeral - 1), precisaoGeral], c: C.green },
      { t: "Flashcards revisados", v: String(P.revisoes.length), s: lembrados + " lembrado" + (lembrados === 1 ? "" : "s"), vals: [Math.max(0, P.revisoes.length - 1), P.revisoes.length], c: "#c58fff" }
    ];
    return this.screenWrap([
      this.head("Painel de Bordo", { back: "mapa" }),
      h(
        "div",
        { key: "prof", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff" }, [
          h("div", { key: "r", style: { display: "flex", gap: 13, alignItems: "center" } }, [
            h(
              "div",
              { key: "av", style: { width: 54, height: 54, borderRadius: 99, background: "#F8935A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900, color: "#01395E", border: "2.5px solid rgba(255,255,255,.7)" } },
              this.iniciais()
            ),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 16, fontWeight: 900 } }, this.props.nome || "Aluno Decola"),
              h("div", { key: "b", style: { display: "flex", gap: 6, alignItems: "center", marginTop: 3 } }, [
                h("span", { key: "p", style: { fontSize: 10.5, fontWeight: 800, background: "rgba(255,255,255,.16)", padding: "3px 9px", borderRadius: 99 } }, this.plan() === "voo-guiado" ? "VOO GUIADO" : "DECOLANDO")
              ])
            ]),
            I("star4", 30, "#F8935A")
          ]),
          h("div", { key: "xp", style: { marginTop: 14 } }, [
            h("div", { key: "l", style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 6 } }, [
              h("span", { key: "a" }, xp + " XP"),
              h("span", { key: "b" }, precisaoGeral + "% de precisão")
            ]),
            h("div", { key: "b", style: { display: "flex" } }, bar(precisaoGeral, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ])
        ])
      ),
      h(
        "div",
        { key: "mets", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        metrics.map((m, i) =>
          card({ key: "met" + i, padding: 14 }, [
            h("div", { key: "t", style: { fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: ".04em", textTransform: "uppercase" } }, m.t),
            h("div", { key: "v", style: { fontSize: 20, fontWeight: 900, margin: "4px 0 2px" } }, m.v),
            h("div", { key: "s", style: { fontSize: 10.5, fontWeight: 700, color: C.green, marginBottom: 8 } }, m.s),
            this.sparkline(m.vals, m.c)
          ])
        )
      ),
      (() => {
        const p = this.perf();
        const ks = Object.keys(p);
        if (!ks.length) return null;
        return h(
          "div",
          { key: "real", style: { margin: "14px 18px 0" } },
          card({ border: "1.5px solid " + C.orange }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 4 } }, "Raio-X real · seus dados"),
            h("div", { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 12 } }, "Calculado pelo algoritmo com as questões que VOCÊ respondeu neste dispositivo."),
            ...ks.map((k, i) => {
              const t = p[k],
                tot = t.ok + t.err,
                pct = Math.round((t.ok / tot) * 100);
              return h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: i < ks.length - 1 ? 11 : 0 } }, [
                h("span", { key: "n", style: { flex: 1, fontSize: 12, fontWeight: 700, color: C.sub } }, k),
                h("span", { key: "v", style: { fontSize: 11, fontWeight: 800, color: pct >= 70 ? C.green : C.red } }, t.ok + "/" + tot + " · " + pct + "%"),
                bar(pct, pct >= 70 ? C.green : C.red, 6)
              ]);
            })
          ])
        );
      })(),
      (() => {
        const pr = this.priorities().slice(0, 4);
        if (!pr.length) return null;
        return h(
          "div",
          { key: "prio", style: { margin: "14px 18px 0" } },
          card({ border: "1.5px solid " + C.orange }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 2 } }, "Rota de maior ganho · algoritmo"),
            h(
              "div",
              { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 } },
              "Ordena o estudo pelo maior aumento de nota no menor tempo: peso da disciplina × taxa de erro × facilidade de recuperação × confiança da amostra × tendência."
            ),
            ...pr.map((o, i) =>
              h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid " + C.line : "none" } }, [
                h("div", { key: "n", style: { width: 22, height: 22, borderRadius: 8, background: i === 0 ? C.orange : C.chip, color: i === 0 ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 } }, i + 1),
                h("div", { key: "t", style: { flex: 1 } }, [
                  h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, o.tema),
                  h("div", { key: "b", style: { fontSize: 9.5, color: C.sub, fontWeight: 600, marginTop: 1 } }, o.mat + " · " + o.why)
                ]),
                h("div", { key: "g", style: { fontSize: 11, fontWeight: 900, color: i === 0 ? C.orange : C.sub, whiteSpace: "nowrap" } }, "+" + o.gain.toFixed(1) + " pts/h")
              ])
            )
          ])
        );
      })(),
      h(
        "div",
        { key: "subj", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 14 } }, "Desempenho por matéria"),
          ...d.subjects.map((s, i) =>
            h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: i < d.subjects.length - 1 ? 12 : 0 } }, [
              h("span", { key: "n", style: { width: 86, fontSize: 12, fontWeight: 700, color: C.sub } }, s.n),
              bar(s.v, s.c, 7),
              h("span", { key: "v", style: { width: 38, textAlign: "right", fontSize: 12.5, fontWeight: 800, color: s.c } }, s.v + "%")
            ])
          ),
          h(
            "div",
            { key: "leg", style: { display: "flex", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.line } },
            [
              ["#3dd68c", "Domínio"],
              ["#ffc94d", "Atenção"],
              ["#ff6b5e", "Turbulência"]
            ].map((l, i) => h("div", { key: i, style: { display: "flex", gap: 6, alignItems: "center", fontSize: 10.5, fontWeight: 700, color: C.sub } }, [h("div", { key: "d", style: { width: 8, height: 8, borderRadius: 99, background: l[0] } }), l[1]]))
          )
        ])
      ),
      h(
        "div",
        { key: "week", style: { margin: "14px 18px 4px" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800 } }, "Evolução semanal"),
            h("div", { key: "s", style: { fontSize: 11, fontWeight: 700, color: C.sub, background: C.chip, padding: "5px 11px", borderRadius: 99 } }, "Precisão")
          ]),
          (() => {
            const semana = this.evolucaoSemanal();
            const comDados = semana.filter((s) => s.pct !== null);
            if (comDados.length < 2) {
              return h(
                "div",
                { key: "vazio", style: { padding: "22px 4px", textAlign: "center", fontSize: 12, color: C.sub, fontWeight: 600 } },
                "Responda questões em pelo menos 2 dias diferentes pra ver sua evolução semanal aqui."
              );
            }
            const pontos = semana
              .map((s, i) => (s.pct === null ? null : { x: 10 + i * 50, y: 98 - (s.pct / 100) * 86, pct: s.pct }))
              .filter((p): p is { x: number; y: number; pct: number } => p !== null);
            return h("svg", { key: "g", width: "100%", height: 110, viewBox: "0 0 320 110" }, [
              ...[0, 1, 2, 3].map((i) => h("line", { key: "l" + i, x1: 0, y1: 14 + i * 26, x2: 320, y2: 14 + i * 26, stroke: C.line, strokeWidth: 1 })),
              h("polyline", { key: "p", points: pontos.map((p) => `${p.x},${p.y}`).join(" "), fill: "none", stroke: C.orange, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }),
              ...pontos.map((p, i) => h("circle", { key: "c" + i, cx: p.x, cy: p.y, r: 3.5, fill: C.orange, stroke: C.dark ? "#0c3557" : "#fff", strokeWidth: 2 }))
            ]);
          })(),
          h(
            "div",
            { key: "d", style: { display: "flex", justifyContent: "space-between", padding: "0 4px", fontSize: 10, fontWeight: 700, color: C.faint } },
            this.evolucaoSemanal().map((s, i) => h("span", { key: i }, s.label))
          )
        ])
      )
    ]);
  }

  // Centro de Missões = outra leitura do MESMO cronograma, não uma segunda
  // organização paralela. Antes esta tela lia só `aluno_missoes`, enquanto o
  // Cronograma lia `trilha_dias` + `aluno_missoes` — as duas telas mostravam
  // listas diferentes para o mesmo dia e o aluno não sabia em qual acreditar.
  // Agora as duas partem de sequenciaDoDia().
  scrMissoes() {
    const { C, h, I, card, chip } = this.ui();
    const t = this.state.missTab;
    const hojeStr = this.props.dados.hojeStr;

    // Grupos por dia. Começa pelo cronograma e, no fim, acrescenta as datas
    // que só têm missão — o cronograma tem um número fixo de dias, e o
    // Copiloto pode agendar missão para depois do último deles. Sem essa
    // união, essas missões sumiriam da tela (era o que acontecia enquanto
    // esta tela lia apenas os dias do cronograma).
    const grupos: { rotulo: string; data: string | null; itens: any[] }[] = [
      { rotulo: "Hoje", data: hojeStr, itens: this.todaySeq() }
    ];
    const datasCobertas = new Set<string>([hojeStr]);

    (this.props.dados.trilhaProximos || []).forEach((dia) => {
      const iso = this.dataDoDia(dia.dia_numero);
      if (iso) datasCobertas.add(iso);
      const base = dia.titulo || `Dia ${dia.dia_numero}`;
      grupos.push({
        rotulo: iso ? `${base} · ${dataBR(iso)}` : base,
        data: iso,
        itens: this.sequenciaDoDia(dia)
      });
    });

    // O dia da prova não recebe missão nem quando cai fora do cronograma —
    // senão a regra "nada de estudo no dia do exame" valeria só dentro dos
    // dias cadastrados.
    const dataProva = this.dataDaProva();
    const soltas = new Map<string, AlunoMissao[]>();
    (this.state.missoesLocal as AlunoMissao[]).forEach((m) => {
      if (m.data <= hojeStr || datasCobertas.has(m.data)) return;
      if (dataProva && m.data === dataProva) return;
      if (!soltas.has(m.data)) soltas.set(m.data, []);
      soltas.get(m.data)!.push(m);
    });
    Array.from(soltas.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([data, ms]) => {
        grupos.push({
          rotulo: `${nomeDoDiaDaSemana(data)} · ${dataBR(data)}`,
          data,
          itens: ms.map((m) => this.itemDeMissao(m))
        });
      });

    // Ordem cronológica, com "Hoje" sempre à frente.
    grupos.sort((a, b) => (a.data ?? "9999").localeCompare(b.data ?? "9999"));

    let visiveis: { rotulo: string; itens: any[] }[];
    if (t === "diarias") visiveis = grupos.filter((g) => g.data === hojeStr);
    else if (t === "semanais") visiveis = grupos.slice(0, 8);
    else
      // Aba do Copiloto: só a data no cabeçalho.
      //
      // O rótulo dos outros grupos é o TÍTULO DO DIA do cronograma, que lista
      // as matérias daquele dia ("Biologia, Matemática · Dia 3"). Reaproveitá-lo
      // aqui confundia: a missão que o Copiloto acrescentou costuma ser de
      // OUTRA matéria, e a tela parecia dizer que uma missão de Física era de
      // "Biologia, Matemática". As matérias do dia não dizem nada sobre a
      // missão extra — a missão já mostra a própria matéria e a duração.
      //
      // Só esta aba muda; o cronograma principal continua com o título do dia.
      visiveis = grupos.map((g) => ({
        // "Hoje" continua sendo "Hoje": é mais útil que a data por extenso, e
        // é o único grupo cujo rótulo já não vinha do título do dia.
        rotulo:
          g.data === hojeStr
            ? "Hoje"
            : g.data
            ? `${nomeDoDiaDaSemana(g.data)} · ${dataBR(g.data)}`
            : g.rotulo,
        itens: g.itens.filter((x: any) => x.ia)
      }));

    const comItens = visiveis.filter((g) => g.itens.length > 0);

    return this.screenWrap([
      this.head("Centro de Missões", { back: "mapa" }),
      h(
        "div",
        { key: "sub", style: { margin: "2px 18px 0", fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.5 } },
        "É o mesmo cronograma, visto por dia. Concluir aqui vale lá, e vice-versa."
      ),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, padding: "10px 18px 4px" } }, [
        chip("Hoje", t === "diarias", () => this.setState({ missTab: "diarias" })),
        chip("Próximos dias", t === "semanais", () => this.setState({ missTab: "semanais" })),
        chip("Do Copiloto", t === "especiais", () => this.setState({ missTab: "especiais" }))
      ]),
      ...(comItens.length
        ? comItens.map((g, gi) =>
            h("div", { key: "g" + gi, style: { margin: "12px 18px 0" } }, [
              h(
                "div",
                { key: "r", style: { fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 } },
                g.rotulo
              ),
              card({ padding: 15 }, g.itens.map((x: any, i: number) => this.linhaSequencia(x, i, g.itens.length)))
            ])
          )
        : [
            h(
              "div",
              { key: "vazio", style: { margin: "12px 18px 0" } },
              card(
                { padding: 20 },
                h("div", { style: { textAlign: "center", color: C.sub, fontSize: 12.5, fontWeight: 600 } },
                  t === "especiais"
                    ? "O Copiloto ainda não adicionou nada ao seu cronograma."
                    : "Nenhuma missão por aqui no momento.")
              )
            )
          ]),
      t === "especiais"
        ? h("div", { key: "note", style: { margin: "14px 18px 0", padding: "13px 15px", borderRadius: 16, background: C.peach, display: "flex", gap: 10, alignItems: "center" } }, [
            I("gift", 20, C.dark ? C.peachTxt : "#9a5218"),
            h("span", { key: "t", style: { fontSize: 12, fontWeight: 700, color: C.dark ? C.peachTxt : "#9a5218", lineHeight: 1.5 } }, "Missões marcadas como \"Copiloto\" foram adicionadas automaticamente pelo algoritmo, com base no seu desempenho real.")
          ])
        : null
    ]);
  }

  // Uma linha da sequência unificada (item de cronograma OU missão), no
  // mesmo formato que todaySeq() produz.
  linhaSequencia(x: any, i: number, total: number) {
    const { C, h, I } = this.ui();
    return h(
      "div",
      { key: "s" + x.id, style: { display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < total - 1 ? "1px solid " + C.line : "none", opacity: x.done ? 0.55 : 1 } },
      [
        h(
          "div",
          {
            key: "n",
            onClick: (e: any) => { e.stopPropagation(); if (x.toggle) x.toggle(); },
            title: x.toggle ? (x.done ? "Desmarcar" : "Marcar como concluído") : undefined,
            style: { width: 24, height: 24, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: x.toggle ? "pointer" : "default", fontSize: 10.5, fontWeight: 900, background: x.done ? C.green : C.chip, color: x.done ? "#fff" : C.sub }
          },
          x.done ? I("check", 12, "#fff", 3) : i + 1
        ),
        h("div", { key: "t", onClick: () => x.act && x.act(), style: { flex: 1, cursor: x.act ? "pointer" : "default", minWidth: 0 } }, [
          h("div", { key: "a", style: { fontSize: 12, fontWeight: 800, textDecoration: x.done ? "line-through" : "none" } }, x.t),
          h("div", { key: "b", style: { fontSize: 10, color: C.sub, fontWeight: 600 } }, x.d)
        ]),
        x.ia
          ? h("span", { key: "g", style: { fontSize: 8, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99 } }, "COPILOTO")
          : I("chevR", 14, C.faint)
      ]
    );
  }

  // ---- Datas do cronograma --------------------------------------------
  //
  // Com rota (Voo Guiado), a data de cada dia foi decidida na geração e vem
  // pronta em `datasDoCronograma`. A tela só consulta.
  //
  // Sem rota (Plano Decolando), o cronograma continua sendo uma régua
  // relativa e a data sai por diferença a partir do dia de hoje. Essa
  // extrapolação era usada para TODO mundo, e é dela que vinham as datas
  // anteriores ao início do aluno — ela pressupõe que o aluno estuda todos
  // os dias, sem intervalo, desde a matrícula.

  /**
   * "Missão do Dia · Dia 2 de 19" — rótulo do cartão da tela inicial.
   *
   * Fonte única: o dia atual da rota, o mesmo número que o cronograma mostra.
   * Sem rota (Plano Decolando), fica só "Missão do Dia".
   */
  /**
   * O dia da rota que o aluno tem de fato pela frente: o PRIMEIRO ainda não
   * concluído, não o que o calendário aponta.
   *
   * Os dois divergem exatamente quando importa. Quem deixou o Dia 3 pela
   * metade e chegou no dia 5 do calendário precisa ver "Missão 3" — mandá-lo
   * para a missão de hoje é fingir que o atraso não existe. E quem terminou
   * tudo hoje já enxerga a próxima.
   */
  diaAtualDaRota(): DiaDoCronograma | null {
    const d = this.props.dados;
    const emOrdem = [...(d.trilhaAnteriores || []), ...(d.trilhaHoje ? [d.trilhaHoje] : []), ...(d.trilhaProximos || [])];
    const pendente = emOrdem.find((dia) => {
      const itens = dia.itens || [];
      const contam = itensQueContam(itens);
      if (contam.length === 0) return false;
      return !contam.every(({ item, indice }) => this.estaConcluido(this.chaveDeItemTrilha(dia.dia_numero, indice, item)));
    });
    return pendente ?? d.trilhaHoje ?? emOrdem[emOrdem.length - 1] ?? null;
  }

  rotuloMissaoDoDia(): string {
    const dia = this.diaAtualDaRota()?.dia_numero ?? this.props.dados.diaTrilhaHoje;
    const total = this.props.dados.totalDiasCronograma;
    if (!dia) return "Missão do Dia";
    return "Missão do Dia · Dia " + dia + (total ? " de " + total : "");
  }

  /** Título do dia atual da rota — nunca um tema escrito no código. */
  tituloMissaoDoDia(): string {
    const dia = this.props.dados.trilhaHoje;
    if (dia?.titulo) return dia.titulo;
    const primeira = this.missoesHoje()[0];
    if (primeira?.titulo) return primeira.titulo;
    return "Suas missões de hoje";
  }

  /** Data YYYY-MM-DD de um dia do cronograma, ou null se não dá pra saber. */
  dataDoDia(diaNumero: number): string | null {
    const daRota = this.props.dados.datasDoCronograma?.[diaNumero];
    if (daRota) return daRota;
    if (this.props.dados.datasDoCronograma) return null;

    const hojeNum = this.props.dados.diaTrilhaHoje;
    if (!hojeNum) return null;
    return dataDoDiaTrilha(diaNumero, hojeNum, this.props.dados.hojeStr);
  }

  /** "Segunda-feira · 04/08/2026" — subtítulo do dia no cronograma. */
  rotuloDataDoDia(diaNumero: number): string | null {
    const iso = this.dataDoDia(diaNumero);
    if (!iso) return null;
    return `${nomeDoDiaDaSemana(iso)} · ${dataBR(iso)}`;
  }

  /** Data da prova informada pelo aluno no briefing (YYYY-MM-DD) ou null. */
  dataDaProva(): string | null {
    const d = this.props.dados.briefing?.data_prova;
    return d ? String(d).slice(0, 10) : null;
  }

  /**
   * O dia da prova não é dia de estudo: no lugar das missões o aluno vê o
   * cartão do vestibular. Antes o cronograma seguia normalmente por cima da
   * data da prova, mandando o aluno estudar no dia do exame.
   */
  ehDiaDaProva(diaNumero: number): boolean {
    const prova = this.dataDaProva();
    if (!prova) return false;
    return this.dataDoDia(diaNumero) === prova;
  }

  // Missão (aluno_missoes) no formato da sequência unificada. Extraído
  // porque três telas montavam esta mesma linha à mão — e divergir aqui é
  // exatamente o que fazia Cronograma e Centro de Missões discordarem.
  itemDeMissao(m: AlunoMissao) {
    return {
      id: m.id,
      ic: this.iconeMissao(m.tipo),
      t: m.titulo,
      d: (m.materia ? m.materia + " · " : "") + m.duracao_minutos + " min",
      ia: m.origem === "copiloto",
      done: m.concluida,
      act: () => this.navMissao(m),
      toggle: () => this.toggleMissao(m.id)
    };
  }

  // Mesma montagem de todaySeq(), para um dia qualquer do cronograma.
  sequenciaDoDia(dia: DiaDoCronograma) {
    // Dia da prova não recebe missão nenhuma.
    if (this.ehDiaDaProva(dia.dia_numero)) return [];
    const list: any[] = [];
    (dia.itens || []).forEach((item, i) => {
      const chave = this.chaveDeItemTrilha(dia.dia_numero, i, item);
      list.push({
        id: "trilha-" + dia.dia_numero + "-" + i,
        ic: this.iconeMissao(item.tipo),
        t: item.titulo,
        d: item.materia || dia.titulo || "",
        ia: false,
        done: this.estaConcluido(chave),
        act: () => this.abrirItemTrilha(item, dia.dia_numero, i),
        toggle: chave ? () => this.toggleItemGenerico(chave) : null
      });
    });
    const isoDoDia = this.dataDoDia(dia.dia_numero);
    (this.state.missoesLocal as AlunoMissao[])
      .filter((m) => isoDoDia !== null && m.data === isoDoDia)
      .forEach((m) => list.push(this.itemDeMissao(m)));
    return list;
  }

  /**
   * O acervo do aluno no formato do catálogo, para a busca da aba Estudos.
   *
   * Inclui `conteudosTrilha` de propósito: praticamente todo o material desta
   * plataforma vive dentro dos dias do cronograma, não em
   * `conteudos_biblioteca` — buscar só na biblioteca não acharia quase nada.
   */
  acervoDaBusca() {
    const d = this.props.dados;
    return acervoPesquisavel({
      conteudos: d.conteudos.map((c) => ({
        id: c.id,
        tipo: c.tipo,
        titulo: c.titulo,
        materia: c.materia,
        assunto: (c as { assunto?: string | null }).assunto ?? null,
        url: c.url
      })),
      conteudosTrilha: d.conteudosTrilha,
      questoes: this.data().questions.map((q: any) => ({ materia: q.materia, assunto: q.assunto })),
      flashcards: d.flashcards.map((f) => ({ materia: f.materia, assunto: f.assunto })),
      simulados: d.simulados.map((s) => ({ id: s.id, titulo: s.titulo, descricao: s.descricao })),
      botoes: d.estudosBotoes.map((b) => ({ id: b.id, titulo: b.titulo }))
    });
  }

  /** Abre o que a busca encontrou, cada tipo no destino que já existe. */
  abrirResultadoDaBusca(item: any) {
    if (item.tipo === "questoes") {
      return this.nav("questoes", { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: item.materia });
    }
    if (item.tipo === "flashcards") {
      // Resultado de ASSUNTO abre só o baralho daquele assunto; resultado de
      // matéria continua abrindo a matéria inteira. É a diferença entre
      // pedir "Citologia" e receber Citologia, ou receber Biologia toda.
      const assunto = assuntoDaChave(item.chave);
      const daMateria = this.props.dados.flashcards.filter((c) => mesmaMateria(c.materia, item.materia));
      const pool = assunto
        ? daMateria.filter((c) => (c.assunto ?? "").trim() === assunto)
        : daMateria;
      if (pool.length === 0) return this.avisar(`Ainda não há flashcards de ${assunto ?? item.materia}.`);
      return this.iniciarFlashcards(this.embaralhar(pool), false);
    }
    if (item.tipo === "simulado") {
      return this.setState({ simId: item.ref_id, simView: "run", simIdx: 0, simAns: {}, simGrid: false, simSec: 0, screen: "simulados" });
    }
    if (item.chave?.startsWith("botao:")) {
      const botao = this.props.dados.estudosBotoes.find((b) => b.id === item.ref_id);
      if (botao) return this.abrirBotaoEstudos(botao);
    }
    if (item.tipo === "aula") return this.abrirAula(item.ref_id, item.titulo, item.url || "", "estudos");
    if (item.url) return this.openBrowser(item.titulo, item.url, "estudos");
    this.avisar("Este material ainda não tem um endereço cadastrado.");
  }

  /** A lista de resultados que substitui as seções da aba Estudos. */
  resultadosDaBusca(resultados: any[]) {
    const { C, h, I, card, iconBox } = this.ui();

    if (resultados.length === 0) {
      return [
        h(
          "div",
          { key: "vazio", style: { margin: "14px 18px 0" } },
          card({ textAlign: "center", padding: 26 }, [
            h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800 } }, "Nada encontrado"),
            h(
              "div",
              { key: "d", style: { fontSize: 11.5, color: C.sub, fontWeight: 600, marginTop: 6 } },
              `Nenhum conteúdo, matéria ou simulado com "${this.state.buscaEstudos.trim()}". Tente outra palavra — o nome da matéria costuma funcionar bem.`
            )
          ])
        )
      ];
    }

    return [
      h(
        "div",
        { key: "res-lbl", style: { margin: "16px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } },
        `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`
      ),
      h(
        "div",
        { key: "res", style: { margin: "0 18px 4px" } },
        card({}, resultados.map((item, i) =>
          h(
            "div",
            {
              key: item.chave,
              onClick: () => this.abrirResultadoDaBusca(item),
              style: {
                display: "flex",
                gap: 11,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: i === resultados.length - 1 ? "none" : "1px solid " + C.line,
                cursor: "pointer"
              }
            },
            [
              h(
                "div",
                { key: "ic", style: { width: 38, height: 38, borderRadius: 11, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 } },
                ICONE_TIPO[item.tipo as keyof typeof ICONE_TIPO] ?? "📌"
              ),
              h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.titulo),
                h(
                  "div",
                  { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 } },
                  // Rótulo do tipo primeiro: é o que diz ao aluno se aquilo é
                  // uma aula, um baralho ou o banco de questões da matéria.
                  // No baralho de assunto o título já é o assunto, então a
                  // matéria vem junto para situar ("Flashcards · Biologia").
                  [ROTULO_TIPO[item.tipo as keyof typeof ROTULO_TIPO], item.nota, item.materia, item.detalhe]
                    .filter(Boolean)
                    .join(" · ")
                )
              ]),
              I("chevR", 16, C.faint)
            ]
          )
        ))
      )
    ];
  }

  scrEstudos() {
    const { C, h, I, card, iconBox } = this.ui();
    const d = this.data();
    // `null` = ainda não digitou o suficiente; lista vazia = digitou e não
    // achou nada. São coisas diferentes na tela.
    const resultados = buscarNosEstudos(this.acervoDaBusca(), this.state.buscaEstudos);
    const continuar = this.continuarAssistindo();
    const ultimaAula = !continuar ? this.props.dados.conteudos.filter((c) => c.tipo === "aula")[0] : null;
    return this.screenWrap([
      this.head("Estudos", { back: "mapa" }),
      h("div", { key: "search", style: { margin: "6px 18px 0", display: "flex", gap: 10, alignItems: "center", background: C.card, border: "1px solid " + C.line, borderRadius: 14, padding: "12px 14px" } }, [
        I("search", 17, C.faint),
        h("input", {
          key: "i",
          value: this.state.buscaEstudos,
          onChange: (e: any) => this.setState({ buscaEstudos: e.target.value }),
          placeholder: "Buscar aula, matéria, assunto...",
          "aria-label": "Buscar conteúdo",
          style: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: C.txt, fontWeight: 600, fontFamily: "inherit" }
        }),
        this.state.buscaEstudos
          ? h(
              "div",
              {
                key: "x",
                onClick: () => this.setState({ buscaEstudos: "" }),
                role: "button",
                "aria-label": "Limpar busca",
                style: { fontSize: 16, fontWeight: 800, color: C.faint, cursor: "pointer", padding: "0 2px", lineHeight: 1 }
              },
              "×"
            )
          : null
      ]),
      // Com busca ativa a tela vira resultado: as seções normais saem do
      // caminho em vez de ficarem embaixo de uma lista que não conversa com
      // elas.
      ...(resultados ? this.resultadosDaBusca(resultados) : []),
      ...(resultados ? [] : [
      continuar
        ? h(
            "div",
            { key: "cont", style: { margin: "14px 18px 0" } },
            card({}, [
              h("div", { key: "l", style: { fontSize: 11, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 } }, "Continuar assistindo"),
              h("div", { key: "r", style: { display: "flex", gap: 12, alignItems: "center" } }, [
                iconBox("video", C.greenSoft, C.green, 46, 20),
                h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: "a", style: { fontSize: 14, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, continuar.aula.titulo),
                  h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 4 } }, continuar.aula.materia || "Videoaula"),
                  continuar.progresso.duracao_segundos
                    ? h("div", { key: "bar", style: { marginTop: 8, height: 4, borderRadius: 99, background: C.chip, overflow: "hidden" } }, h("div", { style: { height: "100%", width: Math.min(100, Math.round((continuar.progresso.posicao_segundos / continuar.progresso.duracao_segundos) * 100)) + "%", background: C.green } }))
                    : null
                ]),
                h(
                  "div",
                  {
                    key: "p",
                    onClick: () => this.abrirAula(continuar.aula.id, continuar.aula.titulo, continuar.aula.url, "estudos"),
                    style: { width: 40, height: 40, borderRadius: 99, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }
                  },
                  h("div", { style: { width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #fff", marginLeft: 3 } })
                )
              ])
            ])
          )
        : ultimaAula
        ? h(
            "div",
            { key: "cont", style: { margin: "14px 18px 0" } },
            card({}, [
              h("div", { key: "l", style: { fontSize: 11, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 } }, "Aula recente"),
              h("div", { key: "r", style: { display: "flex", gap: 12, alignItems: "center" } }, [
                iconBox("video", C.greenSoft, C.green, 46, 20),
                h("div", { key: "t", style: { flex: 1 } }, [
                  h("div", { key: "a", style: { fontSize: 14, fontWeight: 800 } }, ultimaAula.titulo),
                  h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 4 } }, ultimaAula.assunto || ultimaAula.materia)
                ]),
                h(
                  "div",
                  {
                    key: "p",
                    onClick: () => this.abrirAula(ultimaAula.id, ultimaAula.titulo, ultimaAula.url || "", "estudos"),
                    style: { width: 40, height: 40, borderRadius: 99, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
                  },
                  h("div", { style: { width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #fff", marginLeft: 3 } })
                )
              ])
            ])
          )
        : null,
      h(
        "div",
        { key: "bq", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800 } }, "Banco de Questões"),
            h("div", { key: "v", onClick: () => this.nav("questoes"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, cursor: "pointer" } }, "Ver tudo →")
          ]),
          h("div", { key: "s", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginBottom: 4 } }, "Todas as questões cadastradas, organizadas por disciplina"),
          ...(function (self) {
            // Contagem calculada aqui, a cada render, a partir do acervo
            // real — não há número guardado em lugar nenhum. O que fazia a
            // tela mostrar "Biologia — 28" com 82 cadastradas era o corte de
            // 60 linhas na consulta (ver aluno/page.tsx), não a contagem.
            //
            // Agrupa pelo nome canônico para que "Português" e "Linguagens"
            // (ou "Literatura") não virem duas linhas com o acervo partido
            // entre elas.
            const qs = self.data().questions;
            const mats: Record<string, number> = {};
            qs.forEach((q) => {
              const nome = materiaCanonica(q.materia);
              if (!nome) return;
              mats[nome] = (mats[nome] || 0) + 1;
            });
            return Object.keys(mats)
              .sort((a, b) => a.localeCompare(b, "pt-BR"))
              .map((m, i) =>
              h(
                "div",
                {
                  key: "m" + i,
                  onClick: () => self.nav("questoes", { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: m }),
                  style: { display: "flex", gap: 11, alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.line, cursor: "pointer" }
                },
                [
                  iconBox("target", C.orangeSoft, C.orange, 38, 17),
                  h("div", { key: "t", style: { flex: 1 } }, [
                    h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, m),
                    h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600 } }, mats[m] + (mats[m] > 1 ? " questões cadastradas" : " questão cadastrada"))
                  ]),
                  I("chevR", 16, C.faint)
                ]
              )
            );
          })(this),
          h("div", { key: "links", style: { display: "flex", gap: 10, marginTop: 12 } }, [
            h(
              "div",
              { key: "sim", onClick: () => this.nav("simulados"), style: { flex: 1, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: 12, background: C.chip, cursor: "pointer", fontSize: 11.5, fontWeight: 800, color: C.txt } },
              [I("file", 15, C.orange), "Simulados"]
            )
          ])
        ])
      ),
      // Enviar redação, direto em Estudos. Antes só existia em Configurações
      // — dois toques a mais, num lugar onde ninguém procura material de
      // estudo. O destino é a MESMA tela de sempre (`scrRedacao`): o envio,
      // a correção, o histórico e a contagem de créditos não mudaram.
      h(
        "div",
        { key: "redacao-atalho", style: { margin: "14px 18px 0" } },
        card(
          { padding: 16 },
          [
            h("div", { key: "r", style: { display: "flex", gap: 12, alignItems: "center" } }, [
              iconBox("note", C.peach, C.dark ? C.peachTxt : "#9a5218", 44, 20),
              h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, "Enviar redação"),
                h(
                  "div",
                  { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } },
                  "Correção particular com feedback detalhado"
                )
              ]),
              this.props.dados.creditosRedacaoDisponiveis > 0
                ? h(
                    "span",
                    { key: "c", style: { fontSize: 10.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "3px 9px", borderRadius: 99, whiteSpace: "nowrap" } },
                    this.props.dados.creditosRedacaoDisponiveis +
                      " crédito" +
                      (this.props.dados.creditosRedacaoDisponiveis === 1 ? "" : "s")
                  )
                : I("chevR", 15, C.faint)
            ])
          ],
          () => this.nav("redacao")
        )
      ),
      h(
        "div",
        { key: "grid", style: { margin: "14px 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        d.estudos.map((e, i) =>
          card(
            { key: "est" + i, padding: 16 },
            [
              iconBox(e.ic, i % 2 ? C.peach : C.blueSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 44, 20),
              h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800, marginTop: 12 } }, e.t),
              h("div", { key: "d", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, e.d)
            ],
            () =>
              e.t === "Flashcards"
                ? this.nav("flashcards-select")
                : e.t === "Anotações"
                ? this.nav("anotacoes")
                : this.nav("conteudo", {
                    contTitle: e.t,
                    contTipo: e.t === "Videoaulas" ? "aula" : e.t === "PDFs" ? "pdf" : "link",
                    contBack: "estudos"
                  })
          )
        )
      ),
      this.props.dados.estudosBotoes.length
        ? h("div", { key: "extra-lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Mais recursos")
        : null,
      this.props.dados.estudosBotoes.length
        ? h(
            "div",
            { key: "extra-grid", style: { margin: "0 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
            this.props.dados.estudosBotoes.map((b, i) =>
              card(
                { key: b.id, padding: 16 },
                [
                  iconBox(b.icone, i % 2 ? C.peach : C.blueSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 44, 20),
                  h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800, marginTop: 12 } }, b.titulo)
                ],
                () => this.abrirBotaoEstudos(b)
              )
            )
          )
        : null
      ])
    ]);
  }


  scrQuestoes(): any {
    const { C, h, I, card, bar, btn, ghost, iconBox } = this.ui();
    const d = this.data();
    const S = this.state;
    if (S.reviewMode) return this.scrReview();
    if (S.practice) {
      const qs = this.qList();
      if (!qs.length) {
        return this.screenWrap(
          [this.head("Praticar questões", { back: "questoes" }), h("div", { key: "vazio", style: { margin: "18px 18px 0" } }, card({ textAlign: "center", padding: 26 }, "Ainda não há questões cadastradas para essa matéria."))],
          { noTab: true }
        );
      }
      const q = qs[S.qIdx];
      const picked = S.qPicked,
        done = S.qDone,
        res = S.qResult,
        correct = done && !!res?.correta;
      const idxCorreta = done && res ? q.altIds.indexOf(res.respostaCorreta) : -1;
      return this.screenWrap(
        [
          this.head(S.qMateria ? "Praticar · " + S.qMateria : "Praticar questões", { back: "questoes", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.qIdx + 1 + " / " + qs.length) }),
          h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar(((S.qIdx + (done ? 1 : 0)) / qs.length) * 100)),
          this.questaoMeta(q),
          this.questaoCard(q),
          h(
            "div",
            { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
            q.alts.map((a: string, i: number) => {
              let bg = C.card,
                border = C.line,
                col = C.txt;
              if (done) {
                if (i === idxCorreta) {
                  bg = C.greenSoft;
                  border = C.green;
                  col = C.dark ? "#7fe8b5" : "#127347";
                } else if (i === picked) {
                  bg = C.redSoft;
                  border = C.red;
                  col = C.red;
                }
              } else if (i === picked) {
                bg = C.orangeSoft;
                border = C.orange;
              }
              return h(
                "div",
                {
                  key: i,
                  onClick: () => !done && this.setState({ qPicked: i }),
                  style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: bg, border: "1.5px solid " + border, cursor: done ? "default" : "pointer", transition: "all .15s" }
                },
                [
                  h(
                    "div",
                    { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: i === picked && !done ? C.orange : C.chip, color: i === picked && !done ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } },
                    String.fromCharCode(65 + i)
                  ),
                  h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, color: col, lineHeight: 1.4 } }, a)
                ]
              );
            })
          ),
          h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
          h(
            "div",
            { key: "nota" + q.id, style: { margin: "10px 18px 0" } },
            card({ padding: 14 }, [
              h("div", { key: "l", style: { display: "flex", gap: 7, alignItems: "center", marginBottom: 8 } }, [
                I("pencil", 13, C.sub),
                h("span", { key: "t", style: { fontSize: 11, fontWeight: 800, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" } }, "Minhas anotações · salva automaticamente")
              ]),
              h("textarea", {
                key: "ta",
                defaultValue: (function () {
                  try {
                    return localStorage.getItem("dm-note-" + q.id) || "";
                  } catch (e) {
                    return "";
                  }
                })(),
                onChange: (e: any) => {
                  try {
                    localStorage.setItem("dm-note-" + q.id, e.target.value);
                  } catch (err) {}
                },
                placeholder: "Anote aqui seu raciocínio, macetes ou dúvidas sobre esta questão...",
                style: { width: "100%", height: 64, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit" }
              })
            ])
          ),
          done && res?.explicacao
            ? h("div", { key: "expl", style: { margin: "10px 18px 0" } }, card({ padding: 14 }, h("div", { style: { fontSize: 12, color: C.sub, fontWeight: 600, lineHeight: 1.55 } }, res.explicacao)))
            : null,
          // Feedback do erro: UMA linha, sem bloquear a navegação.
          //
          // Aqui havia o cartão "Rota de Revisão detectada" com cabeçalho,
          // mascote, uma frase sobre o Raio-X, ATÉ TRÊS cartões de prioridade
          // (frequentemente a mesma matéria repetida) e um botão grande de
          // revisão — tudo entre a resposta e o "Próxima questão", que ficava
          // abaixo da dobra. O aluno tinha de rolar a tela a cada erro para
          // continuar respondendo.
          //
          // O Copiloto continua fazendo tudo: registra o erro, mapeia o
          // assunto, atualiza o Raio-X e cria a revisão. O que mudou é onde
          // isso é contado — a análise completa vive na aba Copiloto, e aqui
          // fica só a confirmação.
          done && !correct
            ? h(
                "div",
                {
                  key: "rev",
                  style: { margin: "12px 18px 0", padding: "10px 13px", borderRadius: 13, background: C.orangeSoft, display: "flex", gap: 9, alignItems: "center" }
                },
                [
                  I("compass", 16, C.orange),
                  h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                    h("div", { key: "a", style: { fontSize: 11.5, fontWeight: 800, color: C.dark ? "#ffc9a3" : "#8a4415" } }, "Erro registrado no seu Raio-X"),
                    q.tema
                      ? h("div", { key: "b", style: { fontSize: 10.5, fontWeight: 600, color: C.sub, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, q.tema)
                      : null
                  ]),
                  h(
                    "span",
                    { key: "ver", onClick: () => this.nav("copiloto"), style: { fontSize: 10.5, fontWeight: 800, color: C.orange, cursor: "pointer", whiteSpace: "nowrap" } },
                    "Ver análise"
                  )
                ]
              )
            : null,
          done && correct
            ? h("div", { key: "ok", style: { margin: "14px 18px 0", padding: "13px 15px", borderRadius: 16, background: C.greenSoft, display: "flex", gap: 10, alignItems: "center" } }, [
                I("check", 18, C.green, 3),
                h("span", { key: "t", style: { fontSize: 12.5, fontWeight: 700, color: C.dark ? "#7fe8b5" : "#127347" } }, "Correto! Altitude subindo, piloto.")
              ])
            : null,
          h(
            "div",
            { key: "cta", style: { margin: "16px 18px 0", display: "flex", gap: 10 } },
            !done
              ? [
                  btn(
                    S.qSalvando ? "ENVIANDO..." : "CONFIRMAR RESPOSTA",
                    () => this.confirmarResposta(),
                    { flex: 1, opacity: picked == null || S.qSalvando ? 0.45 : 1 }
                  )
                ]
              : [
                  ghost("Sair", () => this.setState({ practice: false, qPicked: null, qDone: false, qResult: null }), { flex: 1 }),
                  btn(
                    S.qIdx < qs.length - 1 ? "PRÓXIMA →" : "CONCLUIR",
                    () => (S.qIdx < qs.length - 1 ? this.setState({ qIdx: S.qIdx + 1, qPicked: null, qDone: false, qResult: null }) : this.setState({ practice: false, qIdx: 0, qPicked: null, qDone: false, qResult: null })),
                    { flex: 2 }
                  )
                ]
          )
        ],
        { noTab: true }
      );
    }
    const cats = [
      { ic: "layers", t: "Por disciplina", d: "Em Estudos → Banco de Questões", act: () => this.nav("estudos") },
      { ic: "x", t: "Questões erradas", d: "Refazer erros", act: () => this.startReview() },
      { ic: "note", t: "Cadernos", d: "Suas anotações", act: () => this.nav("anotacoes") }
    ];
    const respostas = this.props.dados.respostas;
    const totalResp = respostas.length;
    const acertos = respostas.filter((r) => r.correta).length;
    const pctResp = totalResp > 0 ? Math.round((acertos / totalResp) * 100) : 0;
    return this.screenWrap([
      this.head("Banco de Questões", { back: "mapa" }),
      h(
        "div",
        { key: "donut", style: { margin: "6px 18px 0" } },
        card({ display: "flex", gap: 16, alignItems: "center" }, [
          h("svg", { key: "s", width: 86, height: 86, viewBox: "0 0 86 86" }, [
            h("circle", { key: "t", cx: 43, cy: 43, r: 36, fill: "none", stroke: C.chip, strokeWidth: 10 }),
            h("circle", { key: "v", cx: 43, cy: 43, r: 36, fill: "none", stroke: C.green, strokeWidth: 10, strokeDasharray: 2 * Math.PI * 36, strokeDashoffset: 2 * Math.PI * 36 * (1 - pctResp / 100), strokeLinecap: "round", transform: "rotate(-90 43 43)" }),
            h("text", { key: "x", x: 43, y: 47, textAnchor: "middle", fontSize: 17, fontWeight: 900, fill: C.txt, fontFamily: "inherit" }, pctResp + "%")
          ]),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 14.5, fontWeight: 800 } }, totalResp + (totalResp === 1 ? " questão respondida" : " questões respondidas")),
            h("div", { key: "b", style: { fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 3, lineHeight: 1.5 } }, acertos + " acertos · " + (totalResp - acertos) + " erros"),
            h("div", { key: "c", onClick: () => this.nav("painel"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, marginTop: 6, cursor: "pointer" } }, "Ver relatório completo →")
          ])
        ])
      ),
      h(
        "div",
        { key: "cats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        cats.map((c2, i) =>
          card(
            { key: "cat" + i, padding: 15 },
            [
              iconBox(c2.ic, i % 2 ? C.peach : C.blueSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 42, 19),
              h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, marginTop: 10 } }, c2.t),
              h("div", { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 2 } }, c2.d)
            ],
            c2.act
          )
        )
      ),
      h("div", { key: "cta", style: { margin: "16px 18px 0" } }, btn("PRATICAR AGORA →", () => this.setState({ practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: null }))),
      h("div", { key: "note", style: { margin: "12px 18px 0", padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55, display: "flex", gap: 9 } }, [
        I("bot", 16, C.orange),
        "Cada questão é ligada a um conteúdo da matriz oficial. Ao errar, o Copiloto registra o assunto, atualiza seu Raio-X e monta uma rota de revisão personalizada."
      ])
    ]);
  }

  // Monta uma rota de revisão real: até 5 questões da mesma matéria/assunto
  // da questão que o aluno acabou de errar, tiradas do pool já carregado
  // (sem nova consulta ao banco). Cada resposta ainda passa por
  // registrarResposta() — mesma checagem segura da prática normal.
  montarRevisao(materia: string, tema: string) {
    const pool = this.props.dados.questoes.map((q) => this.mapQuestao(q));

    // A matéria é o primeiro filtro, sempre.
    //
    // Antes o assunto era procurado no acervo INTEIRO (`q.tema === tema`,
    // sem olhar a matéria) e só se achasse menos de três é que caía para a
    // matéria. Como o mesmo assunto existe em matérias diferentes —
    // "Interpretação de Texto" e "Gramática · Verbos" aparecem em
    // Linguagens, Inglês e Espanhol —, uma revisão intitulada "Física"
    // podia abrir com questões de Espanhol. O título vinha da recomendação
    // do Copiloto e as questões vinham de outro lugar: os dois lados da
    // cadeia não estavam amarrados.
    const daMateria = materia ? pool.filter((q) => mesmaMateria(q.materia, materia)) : pool;
    const mesmoAssunto = daMateria.filter((q) => q.tema === tema);

    // Dentro da matéria certa, prefere o assunto exato; se houver pouca
    // coisa daquele assunto, completa com o resto da MESMA matéria.
    const base = mesmoAssunto.length >= 3 ? mesmoAssunto : daMateria;

    const embaralhado = [...base].sort(() => Math.random() - 0.5).slice(0, 5);
    this.setState({ reviewMode: true, revPool: embaralhado, revIdx: 0, revPicked: null, revDone: false, revResult: null, revScore: 0, revFinished: false });
  }
  // Resultado de mentira usado só no modo demonstração (props.demoMode) —
  // ver a viewwer do parceiro ("Demonstração grátis") e do admin ("Ver app
  // do aluno") em /preview-aluno. Nunca chama a Server Action de verdade
  // (evita gravar resposta_aluno em nome de quem só está espiando o app) e
  // nunca expõe a resposta certa de verdade — só confirma a alternativa que
  // a pessoa já escolheu, com um aviso deixando claro que é demonstração.
  resultadoDemo(altEscolhida: string): { correta: boolean; respostaCorreta: string; explicacao: string | null } {
    return { correta: true, respostaCorreta: altEscolhida, explicacao: "Modo demonstração — numa conta de aluno de verdade, aqui aparece a correção real." };
  }
  async confirmarResposta() {
    const S = this.state;
    const qs = this.qList();
    const q = qs[S.qIdx];
    if (S.qPicked == null || S.qSalvando) return;
    if (this.props.demoMode) {
      this.setState({ qDone: true, qResult: this.resultadoDemo(q.altIds[S.qPicked]) });
      return;
    }
    this.setState({ qSalvando: true });
    try {
      const res = await registrarResposta(q.id, q.altIds[S.qPicked]);
      if (res.ok) {
        this.setState({ qDone: true, qSalvando: false, qResult: { correta: res.correta, respostaCorreta: res.respostaCorreta, explicacao: res.explicacao } });
      } else {
        this.setState({ qSalvando: false });
      }
    } catch (e) {
      console.error("Falha ao registrar resposta:", e);
      this.setState({ qSalvando: false });
    }
  }
  async confirmarRevisao() {
    const S = this.state;
    const q = S.revPool[S.revIdx];
    if (S.revPicked == null || S.revSalvando) return;
    if (this.props.demoMode) {
      this.setState({ revDone: true, revResult: this.resultadoDemo(q.altIds[S.revPicked]), revScore: S.revScore + 1 });
      return;
    }
    this.setState({ revSalvando: true });
    try {
      const res = await registrarResposta(q.id, q.altIds[S.revPicked]);
      if (res.ok) {
        this.setState({ revDone: true, revSalvando: false, revResult: { correta: res.correta, respostaCorreta: res.respostaCorreta, explicacao: res.explicacao }, revScore: S.revScore + (res.correta ? 1 : 0) });
      } else {
        this.setState({ revSalvando: false });
      }
    } catch (e) {
      console.error("Falha ao registrar resposta da revisão:", e);
      this.setState({ revSalvando: false });
    }
  }
  scrReview() {
    const { C, h, I, card, bar, btn, ghost } = this.ui();
    const S = this.state;
    const pool = S.revPool as ReturnType<DecolaApp["mapQuestao"]>[];
    if (S.revFinished) {
      const pct = pool.length ? Math.round((S.revScore / pool.length) * 100) : 0;
      return this.screenWrap(
        [
          h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" } }, [
            this.mascoteBadge("award", 124, { anim: "dm-pop .5s ease both", bg: C.greenSoft, color: C.green, shadow: "none" }),
            h("div", { key: "t", style: { fontSize: 22, fontWeight: 900, marginTop: 20 } }, "Revisão concluída!"),
            h("div", { key: "d", style: { fontSize: 13.5, color: C.sub, fontWeight: 600, marginTop: 8, lineHeight: 1.5 } }, "Você acertou " + S.revScore + " de " + pool.length + " questões."),
            h("div", { key: "pct", style: { fontSize: 44, fontWeight: 900, color: pct >= 70 ? C.green : C.orange, margin: "18px 0 4px" } }, pct + "%"),
            h("div", { key: "note", style: { marginTop: 18, padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55 } }, "O Copiloto seguirá recomendando esse assunto até sua precisão melhorar.")
          ]),
          h("div", { key: "f", style: { padding: "0 24px 30px", display: "flex", gap: 10 } }, [
            ghost("Voltar às questões", () => this.setState({ reviewMode: false, revFinished: false, practice: false }), { flex: 1 }),
            btn("MISSÃO DO DIA", () => this.nav("mapa"), { flex: 1 })
          ])
        ],
        { noTab: true }
      );
    }
    const q = pool[S.revIdx],
      picked = S.revPicked,
      done = S.revDone,
      res = S.revResult;
    const idxCorreta = done && res ? q.altIds.indexOf(res.respostaCorreta) : -1;
    return this.screenWrap(
      [
        this.head("Rota de Revisão", { back: "questoes", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.revIdx + 1 + " / " + pool.length) }),
        h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar(((S.revIdx + (done ? 1 : 0)) / pool.length) * 100, C.green)),
        h("div", { key: "tag", style: { margin: "14px 18px 0", display: "flex", gap: 8, alignItems: "center" } }, [
          I("refresh", 15, C.orange),
          h("span", { key: "t", style: { fontSize: 11.5, fontWeight: 800, color: C.orange } }, "Revisão dirigida · " + q.tema)
        ]),
        this.questaoCard(q),
        h(
          "div",
          { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
          q.alts.map((a: string, i: number) => {
            let bg = C.card,
              border = C.line,
              col = C.txt;
            if (done) {
              if (i === idxCorreta) {
                bg = C.greenSoft;
                border = C.green;
                col = C.dark ? "#7fe8b5" : "#127347";
              } else if (i === picked) {
                bg = C.redSoft;
                border = C.red;
                col = C.red;
              }
            } else if (i === picked) {
              bg = C.orangeSoft;
              border = C.orange;
            }
            return h(
              "div",
              { key: i, onClick: () => !done && this.setState({ revPicked: i }), style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: bg, border: "1.5px solid " + border, cursor: done ? "default" : "pointer" } },
              [
                h(
                  "div",
                  { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: i === picked && !done ? C.orange : C.chip, color: i === picked && !done ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } },
                  String.fromCharCode(65 + i)
                ),
                h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, color: col, lineHeight: 1.4 } }, a)
              ]
            );
          })
        ),
        h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
        h(
          "div",
          { key: "cta", style: { margin: "16px 18px 0" } },
          !done
            ? btn("CONFIRMAR", () => this.confirmarRevisao(), { opacity: picked == null || S.revSalvando ? 0.45 : 1 })
            : btn(S.revIdx < pool.length - 1 ? "PRÓXIMA →" : "VER RESULTADO", () => (S.revIdx < pool.length - 1 ? this.setState({ revIdx: S.revIdx + 1, revPicked: null, revDone: false, revResult: null }) : this.setState({ revFinished: true })))
        )
      ],
      { noTab: true }
    );
  }

  iniciarSimulado(simuladoId: string) {
    this.setState({ simView: "run", simId: simuladoId, simIdx: 0, simAns: {}, simSec: 0, simGrid: false, simResult: null });
  }
  async abrirGabaritoHistorico(tentativaId: string) {
    this.setState({ simView: "gabarito", gabFrom: "hist", gabaritoCarregando: true, gabaritoHistorico: null });
    try {
      const gabarito = await buscarGabaritoTentativa(tentativaId);
      this.setState({ gabaritoHistorico: gabarito ?? [], gabaritoCarregando: false });
    } catch (e) {
      console.error("Falha ao buscar gabarito do histórico:", e);
      this.setState({ gabaritoHistorico: [], gabaritoCarregando: false });
    }
  }
  scrSimulados() {
    const { C, h, I, card, btn, iconBox } = this.ui();
    const d = this.data();
    const tentativas = this.props.dados.tentativas;
    const notas = tentativas.map((t) => t.nota_facape ?? t.nota);
    const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null;
    const melhor = notas.length ? Math.round(Math.max(...notas)) : null;
    const destaque = d.sims[0];
    return this.screenWrap([
      this.head("Simulados de Voo", { back: "mapa" }),
      destaque
        ? h(
            "div",
            { key: "next", style: { margin: "6px 18px 0" } },
            card({ background: C.headGrad, border: "none", color: "#fff" }, [
              h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 } }, "Simulado em destaque"),
              h("div", { key: "t", style: { fontSize: 17, fontWeight: 900 } }, destaque.t),
              h("div", { key: "d", style: { fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 4 } }, destaque.q + " questões · " + destaque.time + " · pesos oficiais"),
              destaque.q > 0
                ? btn("INICIAR SIMULADO", () => this.iniciarSimulado(destaque.id), { marginTop: 14, background: "#F36C21" })
                : h("div", { key: "sc", style: { marginTop: 12, fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,.75)" } }, "Ainda sem questões cadastradas.")
            ])
          )
        : h("div", { key: "vazio", style: { margin: "6px 18px 0" } }, card({ textAlign: "center", padding: 26 }, "Nenhum simulado disponível no momento.")),
      h(
        "div",
        { key: "stats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        [
          [media != null ? media + "%" : "—", "média (ponderada)"],
          [String(tentativas.length), "realizados"],
          [melhor != null ? melhor + "%" : "—", "melhor nota"]
        ].map((s, i) => card({ key: "st" + i, padding: "14px 10px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 17, fontWeight: 900, color: i === 0 ? C.green : C.txt } }, s[0]), h("div", { key: "t", style: { fontSize: 10, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Disponíveis"),
      h(
        "div",
        { key: "sims", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 10 } },
        d.sims.length
          ? d.sims.map((s, i) =>
              card({ key: s.id, padding: 14, display: "flex", gap: 12, alignItems: "center" }, [
                iconBox("file", C.blueSoft, C.dark ? "#8fc3e8" : "#01395E", 44, 19),
                h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, s.t), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, s.q + " questões · " + s.time + " · " + s.lvl)]),
                s.q > 0 ? h("div", { key: "go", onClick: () => this.iniciarSimulado(s.id), style: { fontSize: 11, fontWeight: 900, color: "#fff", background: C.orange, padding: "8px 13px", borderRadius: 10, cursor: "pointer" } }, "INICIAR") : null
              ])
            )
          : [h("div", { key: "vazio2", style: { fontSize: 12.5, color: C.sub, fontWeight: 600, textAlign: "center", padding: 10 } }, "Nenhum simulado cadastrado.")]
      ),
      h("div", { key: "lbl2", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Histórico"),
      h(
        "div",
        { key: "hist", style: { margin: "0 18px 4px", display: "flex", flexDirection: "column", gap: 10 } },
        d.simHist.length
          ? d.simHist.map((s2, i) =>
              card(
                { key: "hist" + i, padding: 14, display: "flex", gap: 12, alignItems: "center" },
                [
                  h(
                    "div",
                    { key: "v", style: { width: 46, height: 46, borderRadius: 14, background: s2.v >= 70 ? C.greenSoft : C.orangeSoft, color: s2.v >= 70 ? C.green : C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 } },
                    s2.v + "%"
                  ),
                  h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13, fontWeight: 800 } }, s2.t), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, s2.d + " · concluído")]),
                  I("chevR", 17, C.faint)
                ],
                () => this.abrirGabaritoHistorico(s2.id)
              )
            )
          : [h("div", { key: "vazio3", style: { fontSize: 12.5, color: C.sub, fontWeight: 600, textAlign: "center", padding: 10 } }, "Você ainda não fez nenhum simulado.")]
      )
    ]);
  }

  // Mesma lógica de resultadoDemo(), mas pro fluxo de simulado inteiro —
  // ver comentário lá em cima.
  resultadoSimuladoDemo(qs: ReturnType<DecolaApp["simQs"]>, respostas: Record<string, string>): ResultadoSimulado {
    const gabarito: ItemGabarito[] = qs.map((q) => ({
      questaoId: q.id,
      enunciado: q.q,
      materia: q.materia,
      assunto: q.tema,
      alternativas: q.alts.map((texto: string, i: number) => ({ id: q.altIds[i], texto })),
      respostaCorreta: respostas[q.id] ?? q.altIds[0],
      escolhida: respostas[q.id] ?? null,
      correta: true,
      explicacao: "Modo demonstração — numa conta de aluno de verdade, aqui aparece a correção real.",
      imagens: []
    }));
    const porMateria = new Map<string, number>();
    qs.forEach((q) => porMateria.set(q.materia, (porMateria.get(q.materia) ?? 0) + 1));
    const desempenhoPorMateria = Array.from(porMateria.entries()).map(([materia, total]) => ({ materia, peso: 1, acertos: total, total, precisao: 100 }));
    // O modo demonstração não tem simulado real, então não há configuração de
    // pesos para consultar: nulos mantêm a tela mostrando o percentual.
    return {
      acertos: qs.length, total: qs.length, nota: 100, notaFacape: 100, gabarito, desempenhoPorMateria,
      notaPonderada: null, valorTotal: null, pontosPorMateria: null
    };
  }
  async enviarSimulado() {
    const S = this.state;
    if (!S.simId || S.simEnviando) return;
    const qs = this.simQs();
    const respostas: Record<string, string> = {};
    qs.forEach((qq: ReturnType<DecolaApp["simQs"]>[number], i: number) => {
      const picked = S.simAns[i];
      if (picked != null) respostas[qq.id] = qq.altIds[picked];
    });
    if (this.props.demoMode) {
      this.setState({ simResult: this.resultadoSimuladoDemo(qs, respostas), simView: "result" });
      return;
    }
    this.setState({ simEnviando: true });
    try {
      const resultado = await submeterSimulado(S.simId, respostas);
      this.setState({ simEnviando: false, simResult: resultado, simView: "result" });
    } catch (e) {
      console.error("Falha ao enviar simulado:", e);
      this.setState({ simEnviando: false });
    }
  }
  scrSimRun() {
    const { C, h, I, card, btn, ghost } = this.ui();
    const S = this.state;
    const qs = this.simQs();
    const q = qs[S.simIdx];
    const simulado = this.props.dados.simulados.find((s) => s.id === S.simId);
    const total = (simulado?.tempo_minutos ?? 30) * 60,
      left = Math.max(0, total - S.simSec);
    const mm = String(Math.floor(left / 60)).padStart(2, "0"),
      ss = String(left % 60).padStart(2, "0");
    const answered = Object.keys(S.simAns).length;
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "top", style: { display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 12px" } }, [
        h("div", { key: "x", onClick: () => this.setState({ simView: null }), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("x", 17, C.txt)),
        h("div", { key: "t", style: { flex: 1 } }, [
          h("div", { key: "a", style: { fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: ".05em", textTransform: "uppercase" } }, "Simulado de Voo"),
          h("div", { key: "b", style: { fontSize: 14, fontWeight: 900 } }, "Questão " + (S.simIdx + 1) + " de " + qs.length)
        ]),
        h("div", { key: "c", style: { display: "flex", alignItems: "center", gap: 7, background: left < 300 ? C.redSoft : C.chip, padding: "8px 13px", borderRadius: 12 } }, [
          I("clock", 15, left < 300 ? C.red : C.orange),
          h("span", { key: "t", style: { fontSize: 14, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: left < 300 ? C.red : C.txt } }, "0" + Math.floor(left / 3600) + ":" + mm + ":" + ss)
        ])
      ]),
      h("div", { key: "pb", style: { margin: "0 18px", display: "flex" } }, this.ui().bar((answered / qs.length) * 100)),
      h("div", { key: "body", style: { flex: 1, overflowY: "auto", paddingBottom: 20 } }, [
        this.questaoMeta(q),
        this.questaoCard(q),
        h(
          "div",
          { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
          q.alts.map((a: string, i: number) => {
            const sel = S.simAns[S.simIdx] === i;
            return h(
              "div",
              { key: i, onClick: () => this.setState({ simAns: { ...S.simAns, [S.simIdx]: i } }), style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: sel ? C.orangeSoft : C.card, border: "1.5px solid " + (sel ? C.orange : C.line), cursor: "pointer" } },
              [
                h("div", { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: sel ? C.orange : C.chip, color: sel ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } }, String.fromCharCode(65 + i)),
                h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 } }, a)
              ]
            );
          })
        ),
        h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
        S.simGrid
          ? h(
              "div",
              { key: "grid", style: { margin: "14px 18px 0" } },
              card({}, [
                h("div", { key: "t", style: { fontSize: 12.5, fontWeight: 800, marginBottom: 10 } }, "Navegação · " + answered + " respondidas"),
                h(
                  "div",
                  { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 } },
                  qs.map((_: unknown, i: number) =>
                    h(
                      "div",
                      {
                        key: i,
                        onClick: () => this.setState({ simIdx: i }),
                        style: {
                          height: 38,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: "pointer",
                          background: i === S.simIdx ? C.orange : S.simAns[i] != null ? C.greenSoft : C.chip,
                          color: i === S.simIdx ? "#fff" : S.simAns[i] != null ? C.green : C.sub,
                          border: "1.5px solid " + (i === S.simIdx ? C.orange : S.simAns[i] != null ? C.green : "transparent")
                        }
                      },
                      i + 1
                    )
                  )
                )
              ])
            )
          : null
      ]),
      h("div", { key: "foot", style: { padding: "12px 18px 34px", borderTop: "1px solid " + C.line, display: "flex", gap: 10, background: C.navBg } }, [
        ghost(S.simGrid ? "Fechar mapa" : "Mapa de questões", () => this.setState({ simGrid: !S.simGrid }), { flex: 1, padding: "12px 10px", fontSize: 12.5 }),
        S.simIdx < qs.length - 1
          ? btn("PRÓXIMA →", () => this.setState({ simIdx: S.simIdx + 1 }), { flex: 1, padding: "12px 10px", fontSize: 12.5 })
          : btn(
              S.simEnviando ? "ENVIANDO..." : "ENVIAR ✓",
              () => this.enviarSimulado(),
              { flex: 1, padding: "12px 10px", fontSize: 12.5, background: C.green }
            )
      ])
    ]);
  }

  scrSimResult() {
    const { C, h, card, btn, ghost } = this.ui();
    const S = this.state;
    const r = S.simResult as ResultadoSimulado;
    const pct = Math.round(r.notaFacape);
    // Quando o admin ligou o cálculo por pesos, a nota principal passa a ser a
    // ponderada na escala do simulado (ex.: 720 / 1000). O pedido é explícito:
    // nesse caso o percentual vira informação complementar, não o destaque.
    const temPonderada = r.notaPonderada != null && r.valorTotal != null;
    const mm = String(Math.floor(S.simSec / 60)).padStart(2, "0"),
      ss = String(S.simSec % 60).padStart(2, "0");
    return this.screenWrap(
      [
        h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px 0", textAlign: "center" } }, [
          this.mascoteBadge("trophy", 132, { anim: "dm-pop .5s ease both" }),
          h("div", { key: "t", style: { fontSize: 23, fontWeight: 900, marginTop: 18 } }, "Simulado concluído!"),
          h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 6 } }, "Parabéns, piloto. Voo finalizado com segurança."),
          temPonderada
            ? h("div", { key: "pct", style: { fontSize: 46, fontWeight: 900, color: (r.notaPonderada as number) / (r.valorTotal as number) >= 0.7 ? C.green : C.orange, marginTop: 14 } },
                formatarNota(r.notaPonderada as number, r.valorTotal as number))
            : h("div", { key: "pct", style: { fontSize: 52, fontWeight: 900, color: pct >= 70 ? C.green : C.orange, marginTop: 14 } }, pct + "%"),
          h("div", { key: "sub", style: { fontSize: 12.5, color: C.sub, fontWeight: 700 } },
            temPonderada ? "Nota final pela pontuação das disciplinas" : "Nota ponderada pelos pesos das disciplinas"),
          h("div", { key: "obj", style: { marginTop: 10, fontSize: 11, fontWeight: 800, color: C.sub, background: C.chip, padding: "7px 13px", borderRadius: 99 } },
            Math.round(r.nota) + "% de acertos" + (temPonderada ? " · " + r.acertos + "/" + r.total + " questões" : " simples")),
          // Quanto o aluno somou em cada disciplina — sem isso a nota final é
          // um número solto e ele não sabe onde perdeu ponto.
          temPonderada && r.pontosPorMateria && r.pontosPorMateria.length > 0
            ? h("div", { key: "pm", style: { marginTop: 14, width: "100%" } },
                card({ padding: 14 }, [
                  h("div", { key: "t", style: { fontSize: 10, fontWeight: 900, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 8 } }, "Pontos por disciplina"),
                  ...r.pontosPorMateria.map((m, i) =>
                    h("div", { key: "l" + i, style: { display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 11.5, fontWeight: 700 } }, [
                      h("span", { key: "n", style: { flex: 1, textAlign: "left", color: C.txt } }, m.materia),
                      h("span", { key: "v", style: { color: C.sub } }, m.pontosObtidos.toFixed(0) + " / " + m.valorDaMateria.toFixed(0))
                    ])
                  )
                ]))
            : null,
          h(
            "div",
            { key: "stats", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 22, width: "100%" } },
            [
              [String(r.acertos), "corretas", C.green],
              [String(r.total - r.acertos), "erradas", C.red],
              ["00:" + mm + ":" + ss, "tempo total", C.txt]
            ].map((s, i) => card({ key: "st" + i, padding: "14px 8px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 17, fontWeight: 900, color: s[2] as string } }, s[0]), h("div", { key: "t", style: { fontSize: 10, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
          )
        ]),
        h("div", { key: "f", style: { padding: "20px 24px 10px", display: "flex", flexDirection: "column", gap: 10 } }, [
          btn("VER GABARITO COMENTADO", () => this.setState({ simView: "gabarito", gabFrom: null })),
          ghost("Voltar ao painel", () => {
            this.setState({ simView: null });
            this.nav("mapa");
          })
        ])
      ],
      { noTab: true }
    );
  }

  // Marca a recomendação como concluída/descartada de verdade
  // (copiloto_recomendacoes) e atualiza a lista local otimisticamente.
  responderRecomendacao(id: string, status: "concluida" | "descartada") {
    const antes = this.state.recsLocal as CopilotoRecomendacao[];
    this.setState({ recsLocal: antes.filter((r: CopilotoRecomendacao) => r.id !== id) });
    if (this.props.demoMode) return;
    // O cartão sai da lista na hora. Se a gravação falhar, ele volta — senão
    // a recomendação reapareceria sozinha no próximo carregamento, como se o
    // toque nunca tivesse acontecido.
    const desfazer = () => {
      this.setState({ recsLocal: antes });
      this.avisar("Não foi possível registrar sua resposta. Verifique sua conexão e tente de novo.");
    };
    marcarRecomendacao(id, status)
      .then((res) => {
        if (!res?.ok) desfazer();
      })
      .catch(desfazer);
  }
  scrCopiloto() {
    const { C, h, I, btn, ghost } = this.ui();
    const recs = this.state.recsLocal as CopilotoRecomendacao[];
    const p = this.perf();
    const tot = Object.keys(p).reduce((a, k) => ({ ok: a.ok + p[k].ok, err: a.err + p[k].err }), { ok: 0, err: 0 });
    const pr = this.priorities();
    const intro =
      tot.ok + tot.err > 0
        ? "Analisei seu desempenho real: " +
          tot.ok +
          " acertos e " +
          tot.err +
          " erros nas questões respondidas até agora" +
          (pr.length ? ". Maior ganho de nota agora: " + pr[0].tema + " (peso " + pr[0].w + ") — priorizo o que mais sobe sua nota, não só o que você mais erra." : ".")
        : "Sou seu Copiloto. Assim que você responder questões, revisar flashcards ou fazer simulados, eu começo a identificar o que vale mais a pena revisar.";
    // O destino de uma recomendação é a REVISÃO dela, não a tela genérica do
    // tipo. Antes este mapa olhava só `r.tipo` e ignorava matéria e assunto:
    // "flashcards" caía no hub ("Todos · 389 cards"), "questoes" abria o
    // banco inteiro sem filtro e "aula" jogava o aluno na aba Estudos. O
    // contexto do erro existia na recomendação e morria no clique.
    const abrirRecomendacao = (r: CopilotoRecomendacao) => {
      if (r.tipo === "simulado") return this.irParaRota("/aluno/atividades");
      this.irParaRota("/aluno/revisao/" + r.id);
    };
    return this.screenWrap([
      this.head("Copiloto Decola", { back: "mapa" }),
      h("div", { key: "chat", style: { display: "flex", flexDirection: "column", gap: 10, padding: "8px 18px 0" } }, [
        h("div", { key: "bot", style: { display: "flex", justifyContent: "center", marginBottom: 6 } }, this.mascoteBadge("bot", 96, { anim: "dm-fly 4s ease-in-out infinite" })),
        h(
          "div",
          { key: "intro", style: { alignSelf: "flex-start", maxWidth: "88%", padding: "11px 14px", borderRadius: "16px 16px 16px 4px", background: C.card, border: "1px solid " + C.line, color: C.txt, fontSize: 13, fontWeight: 600, lineHeight: 1.5 } },
          intro
        ),
        recs.length === 0
          ? h(
              "div",
              { key: "vazio", style: { alignSelf: "flex-start", maxWidth: "88%", padding: "11px 14px", borderRadius: "16px 16px 16px 4px", background: C.card, border: "1px solid " + C.line, color: C.sub, fontSize: 13, fontWeight: 600, lineHeight: 1.5 } },
              "Sem recomendações pendentes no momento. Continue estudando — quando eu identificar algo que vale revisar, aparece aqui. ✨"
            )
          : recs.map((r) =>
              h(
                "div",
                { key: r.id, style: { alignSelf: "flex-start", maxWidth: "92%", padding: "12px 14px", borderRadius: "16px 16px 16px 4px", background: C.card, border: "1.5px solid " + (r.prioridade >= 3 ? C.red : r.prioridade >= 2 ? C.orange : C.line) } },
                [
                  h("div", { key: "t", style: { fontSize: 10.5, fontWeight: 800, color: C.faint, textTransform: "uppercase", letterSpacing: ".04em" } }, r.materia + (r.assunto ? " · " + r.assunto : "")),
                  h("div", { key: "h", style: { fontSize: 13.5, fontWeight: 900, marginTop: 3 } }, r.titulo),
                  r.motivo ? h("div", { key: "m", style: { fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 4, lineHeight: 1.45 } }, r.motivo) : null,
                  h("div", { key: "acts", style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" } }, [
                    btn("FAZER AGORA →", () => abrirRecomendacao(r), { padding: "9px 14px", fontSize: 12 }),
                    ghost("Já revisei ✓", () => this.responderRecomendacao(r.id, "concluida"), { padding: "9px 14px", fontSize: 12 }),
                    ghost("Dispensar", () => this.responderRecomendacao(r.id, "descartada"), { padding: "9px 14px", fontSize: 12, color: C.faint })
                  ])
                ]
              )
            )
      ]),
      h("div", { key: "note", style: { margin: "16px 18px 4px", padding: "11px 13px", borderRadius: 13, background: C.chip, display: "flex", gap: 9, alignItems: "center", fontSize: 10.5, color: C.sub, fontWeight: 600, lineHeight: 1.5 } }, [
        I("bot", 15, C.orange),
        "O Copiloto analisa suas respostas de verdade (questões, flashcards, simulados) e cria estas recomendações automaticamente."
      ])
    ]);
  }

  scrRanking() {
    const { C, h, card } = this.ui();
    const d = this.data();
    if (!d.ranking.length) {
      return this.screenWrap([
        this.head("Ranking", { back: "mapa" }),
        h(
          "div",
          { key: "vazio", style: { margin: "18px 18px 0" } },
          card({ textAlign: "center", padding: 26 }, "Ainda não há dados suficientes pra montar o ranking. Pratique questões, flashcards ou simulados pra começar a pontuar!")
        )
      ]);
    }
    const podium = [d.ranking[1], d.ranking[0], d.ranking[2]];
    return this.screenWrap([
      this.head("Ranking", { back: "mapa" }),
      // Item 12: as abas "Amigos" e "Ponderado" foram removidas. "Amigos"
      // supunha uma funcionalidade que não existe (não há como adicionar
      // outro aluno como amigo) e "Ponderado" não tinha nenhuma seleção que
      // a justificasse — as duas eram filtros que não filtravam nada. Sobrou
      // o Ranking Geral, com o mesmo funcionamento de antes.
      h(
        "div",
        { key: "podium", style: { margin: "18px 18px 0", display: "flex", alignItems: "flex-end", gap: 10, justifyContent: "center" } },
        podium.map((p, i) => {
          if (!p) return h("div", { key: i, style: { flex: 1 } });
          const first = i === 1,
            hgt = first ? 118 : 88,
            medal = ["#c8d6e5", "#ffc94d", "#e08e5a"][i];
          return h("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } }, [
            h(
              "div",
              {
                key: "av",
                style: {
                  width: first ? 62 : 50,
                  height: first ? 62 : 50,
                  borderRadius: 99,
                  background: medal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: first ? 20 : 16,
                  fontWeight: 900,
                  color: "#01395E",
                  border: "3px solid " + (C.dark ? "#0c3557" : "#fff"),
                  boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                  animation: first ? "dm-pulse 3s ease-in-out infinite" : "none"
                }
              },
              p.n[0]
            ),
            h("div", { key: "n", style: { fontSize: 11.5, fontWeight: 800, textAlign: "center" } }, p.n),
            h(
              "div",
              {
                key: "bar",
                style: {
                  width: "100%",
                  height: hgt,
                  borderRadius: "14px 14px 0 0",
                  background: first ? "linear-gradient(180deg,#F36C21,#d95a12)" : C.card,
                  border: first ? "none" : "1px solid " + C.line,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2
                }
              },
              [h("div", { key: "p", style: { fontSize: 22, fontWeight: 900, color: first ? "#fff" : C.faint } }, p.p), h("div", { key: "x", style: { fontSize: 10.5, fontWeight: 800, color: first ? "rgba(255,255,255,.85)" : C.sub } }, p.xp + " XP")]
            )
          ]);
        })
      ),
      h(
        "div",
        { key: "list", style: { margin: "14px 18px 4px", display: "flex", flexDirection: "column", gap: 8 } },
        d.ranking.slice(3).map((r, i) =>
          card({ key: r.id ?? "r" + i, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", border: r.me ? "1.5px solid " + C.orange : "1px solid " + C.line, background: r.me ? C.orangeSoft : C.card }, [
            h("div", { key: "p", style: { width: 26, fontSize: 13, fontWeight: 900, color: r.me ? C.orange : C.faint } }, "#" + r.p),
            h("div", { key: "av", style: { width: 36, height: 36, borderRadius: 99, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: C.dark ? "#8fc3e8" : "#01395E" } }, r.n[0]),
            h("div", { key: "n", style: { flex: 1, fontSize: 13, fontWeight: r.me ? 900 : 700 } }, r.n + (r.me ? " (você)" : "")),
            h("div", { key: "x", style: { fontSize: 12.5, fontWeight: 900, color: r.me ? C.orange : C.sub } }, r.xp + " XP")
          ])
        )
      )
    ]);
  }

  scrConquistas() {
    const { C, h, I, card, chip } = this.ui();
    const d = this.data();
    const t = this.state.achTab;
    const got = d.badges.filter((b) => b.got).length;
    return this.screenWrap([
      this.head("Conquistas", { back: "mapa" }),
      h(
        "div",
        { key: "sum", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", display: "flex", gap: 14, alignItems: "center" }, [
          h("div", { key: "i", style: { width: 56, height: 56, borderRadius: 20, background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" } }, I("award", 28, "#F8935A")),
          h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 22, fontWeight: 900 } }, got + " / " + d.badges.length), h("div", { key: "b", style: { fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600 } }, "brasões desbloqueados")]),
          I("star4", 26, "rgba(255,255,255,.4)")
        ])
      ),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, padding: "14px 18px 4px" } }, [
        chip("Brasões", t === "brasoes", () => this.setState({ achTab: "brasoes" })),
        chip("Certificados", t === "cert", () => this.setState({ achTab: "cert" })),
        chip("Marcos", t === "marcos", () => this.setState({ achTab: "marcos" }))
      ]),
      h(
        "div",
        { key: "grid", style: { margin: "12px 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        d.badges.map((b, i) =>
          card({ key: "bad" + i, padding: "16px 8px", textAlign: "center", opacity: b.lock ? 0.55 : 1 }, [
            h(
              "div",
              {
                key: "i",
                style: {
                  width: 52,
                  height: 52,
                  margin: "0 auto",
                  borderRadius: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: b.got ? "linear-gradient(150deg,#F36C21,#d95a12)" : b.lock ? C.chip : C.blueSoft,
                  boxShadow: b.got ? "0 6px 16px rgba(243,108,33,.35)" : "none"
                }
              },
              I(b.lock ? "lock" : b.ic, 24, b.got ? "#fff" : b.lock ? C.faint : C.dark ? "#8fc3e8" : "#01395E")
            ),
            h("div", { key: "t", style: { fontSize: 10.5, fontWeight: 800, marginTop: 9, lineHeight: 1.3 } }, b.t),
            h("div", { key: "s", style: { fontSize: 9.5, fontWeight: 700, marginTop: 3, color: b.got ? C.green : C.faint } }, b.got ? "Conquistado" : b.prog ? b.prog : "Bloqueado")
          ])
        )
      )
    ]);
  }

  // XP real = mesma fórmula da view ranking_geral (10 por acerto, 5 por
  // flashcard lembrado, 50 por simulado concluído) — assim o número bate
  // exatamente com o que aparece no Ranking.
  xpTotal() {
    const P = this.props.dados;
    const acertos = P.respostas.filter((r) => r.correta).length;
    const lembrados = P.revisoes.filter((r) => r.lembrou).length;
    return acertos * 10 + lembrados * 5 + P.tentativas.length * 50;
  }
  // Sequência real de dias com pelo menos uma atividade (questão, flashcard
  // ou simulado), contando para trás a partir de hoje.
  sequenciaDias() {
    const P = this.props.dados;
    // `created_at` é um instante em UTC: cortar os 10 primeiros caracteres
    // atribuiria a resposta dada às 22h ao dia seguinte. dataISO() converte
    // pro fuso da plataforma antes de comparar (ver lib/site/data.ts).
    const dias = new Set<string>();
    P.respostas.forEach((r) => dias.add(dataISO(new Date(r.created_at))));
    P.revisoes.forEach((r) => dias.add(dataISO(new Date(r.created_at))));
    P.tentativas.forEach((t) => dias.add(dataISO(new Date(t.created_at))));
    let n = 0;
    let cur = hojeISO();
    while (dias.has(cur)) {
      n++;
      cur = somarDias(cur, -1);
    }
    return n;
  }
  // Precisão real dos últimos 7 dias (respostas_aluno), um ponto por dia —
  // usado no gráfico "Evolução semanal" do Painel de Bordo. Antes disso era
  // uma curva 100% inventada (pontos fixos no SVG); aqui cada dia sem
  // nenhuma resposta vira `null` (sem ponto no gráfico) em vez de fingir
  // 0% ou qualquer outro valor.
  evolucaoSemanal(): { label: string; pct: number | null }[] {
    const P = this.props.dados;
    const LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const dias: { label: string; pct: number | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dataStr = somarDias(hojeISO(), -i);
      const doDia = P.respostas.filter((r) => dataISO(new Date(r.created_at)) === dataStr);
      const pct = doDia.length ? Math.round((doDia.filter((r) => r.correta).length / doDia.length) * 100) : null;
      dias.push({ label: LABELS[new Date(dataStr + "T12:00:00Z").getUTCDay()], pct });
    }
    return dias;
  }
  scrPerfil() {
    const { C, h, I, card, bar, iconBox } = this.ui();
    const d = this.data();
    const handle = "@" + (this.props.email || "aluno").split("@")[0];
    const xp = this.xpTotal();
    const posicao = this.props.dados.ranking.findIndex((r) => r.aluno_id === this.props.alunoId) + 1;
    const totalRespostas = this.props.dados.respostas.length;
    const acertosResp = this.props.dados.respostas.filter((r) => r.correta).length;
    const precisaoGeral = totalRespostas > 0 ? Math.round((acertosResp / totalRespostas) * 100) : 0;
    return this.screenWrap([
      this.head("Carteira de Piloto", {
        back: "mapa",
        right: h("div", { onClick: () => this.nav("config"), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("gear", 18, C.txt))
      }),
      h(
        "div",
        { key: "card", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", position: "relative", overflow: "hidden" }, [
          h("div", { key: "wm", style: { position: "absolute", right: -20, bottom: -24, opacity: 0.1 } }, I("plane", 130, "#fff")),
          h("div", { key: "top", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } }, [
            h("div", { key: "l", style: { fontSize: 9.5, fontWeight: 800, letterSpacing: ".14em", color: "rgba(255,255,255,.55)", textTransform: "uppercase" } }, "Decola Med · Piloto em treinamento"),
            I("star4", 18, "#F8935A")
          ]),
          h("div", { key: "r", style: { display: "flex", gap: 14, alignItems: "center" } }, [
            h("div", { key: "av", style: { width: 62, height: 62, borderRadius: 20, background: "#F8935A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#01395E" } }, this.iniciais()),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 17, fontWeight: 900 } }, this.props.nome || "Aluno Decola"),
              h("div", { key: "b", style: { fontSize: 11.5, color: "rgba(255,255,255,.65)", fontWeight: 700 } }, handle),
              h("div", { key: "c", style: { display: "flex", gap: 6, marginTop: 6 } }, [h("span", { key: "p", style: { fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,.16)", padding: "3px 9px", borderRadius: 99 } }, xp + " XP")])
            ])
          ]),
          h("div", { key: "xp", style: { marginTop: 16 } }, [
            h("div", { key: "l", style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 6 } }, [
              h("span", { key: "a" }, precisaoGeral + "% de precisão geral"),
              h("span", { key: "b" }, totalRespostas + " questões respondidas")
            ]),
            h("div", { key: "b", style: { display: "flex" } }, bar(precisaoGeral, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ])
        ])
      ),
      h(
        "div",
        { key: "stats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        [
          [String(xp), "XP total"],
          [this.sequenciaDias() + " dias", "sequência"],
          [posicao > 0 ? "#" + posicao : "—", "ranking"]
        ].map((s, i) => card({ key: "st" + i, padding: "14px 8px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 15, fontWeight: 900, color: i === 1 ? C.orange : C.txt } }, s[0]), h("div", { key: "t", style: { fontSize: 9.5, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
      ),
      h(
        "div",
        { key: "badges", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, [
            h("div", { key: "t", style: { fontSize: 14, fontWeight: 800 } }, "Brasões conquistados"),
            h("div", { key: "v", onClick: () => this.nav("conquistas"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, cursor: "pointer" } }, "Ver todos →")
          ]),
          h(
            "div",
            { key: "g", style: { display: "flex", gap: 10 } },
            d.badges
              .filter((b) => b.got)
              .map((b, i) =>
                h(
                  "div",
                  { key: i, style: { width: 46, height: 46, borderRadius: 99, background: "linear-gradient(150deg,#F36C21,#d95a12)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 12px rgba(243,108,33,.3)" } },
                  I(b.ic, 20, "#fff")
                )
              )
          )
        ])
      ),
      h(
        "div",
        { key: "menu", style: { margin: "14px 18px 4px" } },
        card(
          { padding: "6px 16px" },
          [
            ["note", "Redação · Correção via WhatsApp", this.props.dados.creditosRedacaoDisponiveis + " crédito" + (this.props.dados.creditosRedacaoDisponiveis === 1 ? "" : "s")],
            ["calendar", "Recalibrar plano de voo", ""],
            ["bell", "Notificações", ""],
            ["logout", "Sair da conta", ""]
          ].map((r, i) =>
            h(
              "div",
              {
                key: i,
                onClick: [() => this.nav("redacao"), () => this.nav("briefing"), () => this.setState({ notifOpen: true }), this.logout][i],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < 3 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [
                I(r[0], 18, i === 3 ? C.red : C.sub),
                h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700, color: i === 3 ? C.red : C.txt } }, r[1]),
                r[2] ? h("span", { key: "b", style: { fontSize: 10.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "3px 9px", borderRadius: 99 } }, r[2]) : I("chevR", 15, C.faint)
              ]
            )
          )
        )
      )
    ]);
  }

  scrConfig() {
    const { C, h, I, card } = this.ui();
    const dark = this.theme() === "dark";
    const toggle = (on: boolean, cb: any) =>
      h(
        "div",
        { key: "toggle", onClick: cb, style: { width: 46, height: 26, borderRadius: 99, background: on ? C.orange : C.chip, padding: 3, cursor: "pointer", transition: "background .2s" } },
        h("div", { style: { width: 20, height: 20, borderRadius: 99, background: "#fff", transform: on ? "translateX(20px)" : "none", transition: "transform .2s", boxShadow: "0 2px 6px rgba(0,0,0,.25)" } })
      );
    return this.screenWrap([
      this.head("Configurações", { back: "perfil" }),
      h("div", { key: "lbl", style: { margin: "8px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Aparência"),
      h(
        "div",
        { key: "ap", style: { margin: "0 18px" } },
        card({ padding: "6px 16px" }, [
          h("div", { key: "th", style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: "1px solid " + C.line } }, [
            I(dark ? "moon" : "sun", 18, C.sub),
            h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, "Tema escuro"),
            toggle(dark, () => this.setState({ theme: dark ? "light" : "dark" }))
          ]),
          h("div", { key: "nt", style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0" } }, [
            I("bell", 18, C.sub),
            h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, "Notificações push"),
            toggle(this.state.push, () => this.setState({ push: !this.state.push }))
          ])
        ])
      ),
      h("div", { key: "lbl2", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Conta"),
      h(
        "div",
        { key: "ac", style: { margin: "0 18px" } },
        card(
          { padding: "6px 16px" },
          // "Termos de Uso" só entra na lista quando o admin cadastrou o
          // endereço em Configurações. Antes o item apontava para um
          // "decolamed.com.br/termos" escrito no código, que não existia e
          // não tinha onde ser configurado.
          ([
            ["user", "Editar perfil", () => this.nav("perfil")],
            ["lock", "Alterar senha", () => this.nav("senha")],
            // Recalibrar continua sendo do aluno — mas só existe para quem
            // tem um plano ADAPTATIVO, e só depois que ele foi montado.
            //
            // Fora do Voo Guiado isto não é um item a menos: é um item que
            // nunca deveria estar ali. O Decolando tem cronograma fixo, e
            // este atalho abria para ele o briefing — um questionário sobre
            // data de prova e dias da semana que o plano dele não usa para
            // nada, e cuja resposta faria o resto da plataforma passar a
            // tratá-lo como aluno de plano adaptativo.
            //
            // Antes do envio do mentor também não aparece: não há o que
            // recalibrar, e o formulário seria o briefing inicial que saiu
            // das mãos do aluno.
            ...(this.props.dados.temCopiloto && !this.props.dados.aguardandoMentor
              ? [["calendar", "Recalibrar plano de voo", () => this.nav("briefing")] as [string, string, () => void]]
              : []),
            ...(this.props.dados.termosUsoUrl
              ? [["file", "Termos de Uso", () => this.openBrowser("Termos de Uso", this.props.dados.termosUsoUrl as string, "config")] as [string, string, () => void]]
              : [])
          ] as [string, string, () => void][]).map((r, i, arr) =>
            h(
              "div",
              {
                key: i,
                onClick: r[2],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [I(r[0], 18, C.sub), h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, r[1]), I("chevR", 15, C.faint)]
            )
          )
        )
      ),
      // Zona de risco: a ação é destrutiva e irreversível, então fica
      // separada do resto, com confirmação em dois passos.
      h("div", { key: "lblrz", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Recomeçar do zero"),
      h(
        "div",
        { key: "reset", style: { margin: "0 18px" } },
        card({ padding: 16 }, [
          h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 } }, [
            I("alert", 16, C.orange),
            "Redefinir perfil"
          ]),
          h(
            "div",
            { key: "d", style: { fontSize: 11.5, color: C.sub, fontWeight: 600, marginTop: 6, lineHeight: 1.55 } },
            "Apaga seu histórico, progresso, estatísticas, cronograma personalizado e as adaptações do Copiloto. Seu cadastro, plano e créditos de redação continuam. Seu perfil é montado de novo a partir do briefing."
          ),
          this.state.resetConfirmando
            ? h("div", { key: "c", style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 } }, [
                h(
                  "div",
                  { key: "w", style: { fontSize: 11.5, fontWeight: 800, color: C.orange, lineHeight: 1.5 } },
                  "Tem certeza? Isso não pode ser desfeito."
                ),
                h("div", { key: "b", style: { display: "flex", gap: 8 } }, [
                  h(
                    "div",
                    {
                      key: "sim",
                      onClick: () => this.confirmarRedefinirPerfil(),
                      style: { flex: 1, textAlign: "center", padding: "11px 0", borderRadius: 12, background: this.state.resetEmAndamento ? C.chip : C.orange, color: this.state.resetEmAndamento ? C.sub : "#fff", fontSize: 12, fontWeight: 900, cursor: this.state.resetEmAndamento ? "default" : "pointer" }
                    },
                    this.state.resetEmAndamento ? "REDEFININDO..." : "SIM, REDEFINIR"
                  ),
                  h(
                    "div",
                    {
                      key: "nao",
                      onClick: () => { if (!this.state.resetEmAndamento) this.setState({ resetConfirmando: false }); },
                      style: { flex: 1, textAlign: "center", padding: "11px 0", borderRadius: 12, background: C.chip, color: C.txt, fontSize: 12, fontWeight: 900, cursor: "pointer" }
                    },
                    "CANCELAR"
                  )
                ])
              ])
            : h(
                "div",
                {
                  key: "b",
                  onClick: () => this.setState({ resetConfirmando: true }),
                  style: { marginTop: 12, textAlign: "center", padding: "11px 0", borderRadius: 12, border: "1.5px solid " + C.orange, color: C.orange, fontSize: 12, fontWeight: 900, cursor: "pointer" }
                },
                "REDEFINIR PERFIL"
              )
        ])
      ),
      h("div", { key: "lbl3", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Como usar a plataforma"),
      h(
        "div",
        { key: "help", style: { margin: "0 18px" } },
        card(
          { padding: "6px 16px" },
          [
            ["plane", "Ver introdução da plataforma"],
            ["compass", "Ver tutorial da plataforma"],
            ["bot", "Ajuda pelo WhatsApp oficial"],
            ["external", "Instalar aplicativo"],
            ["alert", "Comunicar erro na plataforma"]
          ].map((r, i) =>
            h(
              "div",
              {
                key: i,
                onClick: [
                  () => this.setState({ mostrarOnboarding: true }),
                  () => this.nav("tutorial", { tutStep: 0 }),
                  () => window.open(this.props.whatsappSuporte, "_blank", "noopener,noreferrer"),
                  () => this.setState({ screen: "tutorial", tutStep: 0 }),
                  () => this.abrirWhatsappErro()
                ][i],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < 4 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [I(r[0], 18, C.sub), h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, r[1]), I("chevR", 15, C.faint)]
            )
          )
        )
      ),
      h("div", { key: "ver", style: { textAlign: "center", fontSize: 10.5, color: C.faint, fontWeight: 700, marginTop: 22 } }, "Decola Med · Voo 001")
    ]);
  }

  scrBriefing() {
    const { C, h, btn } = this.ui();
    const B = this.state.brief;
    const save = (b: any) => {
      this.setState({ brief: b });
      try {
      } catch (e) {}
    };
    const row = (label: string, control: any) =>
      h("div", { key: label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14, background: C.card, border: "1px solid " + C.line, marginBottom: 10 } }, [
        h("span", { key: "l", style: { fontSize: 13, fontWeight: 600, color: C.sub } }, label),
        control
      ]);
    const dateInp = (k: string) =>
      h("input", { type: "date", value: B[k] || "", onChange: (e: any) => save({ ...B, [k]: e.target.value }), style: { background: "transparent", border: "none", outline: "none", fontSize: 13.5, fontWeight: 800, color: C.txt, fontFamily: "inherit", colorScheme: C.dark ? "dark" : "light", textAlign: "right" } });
    const step = (k: string, min: number, max: number, suf: string) =>
      h("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, [
        h("div", { key: "-", onClick: () => save({ ...B, [k]: Math.max(min, B[k] - 1) }), style: { width: 28, height: 28, borderRadius: 9, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 900, color: C.sub } }, "−"),
        h("span", { key: "v", style: { fontSize: 13.5, fontWeight: 800, color: C.txt, minWidth: 64, textAlign: "center" } }, B[k] + suf),
        h("div", { key: "+", onClick: () => save({ ...B, [k]: Math.min(max, B[k] + 1) }), style: { width: 28, height: 28, borderRadius: 9, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, fontWeight: 900, color: C.orange } }, "+")
      ]);
    return this.screenWrap([
      this.head("Briefing de Voo", { back: "perfil" }),
      h("div", { key: "c", style: { margin: "8px 18px 0" } }, [
        row("Data da prova", dateInp("prova")),
        row("Início dos estudos", dateInp("inicio")),
        row("Dias por semana", step("dias", 1, 7, " dias")),
        row("Horas por dia", step("horas", 1, 12, "h")),

        // Idioma da prova. A mesma pergunta existe no briefing de primeiro
        // acesso (briefing-wizard.tsx) e precisa existir aqui também: é por
        // esta tela que o aluno recalibra o voo, e trocar de Inglês para
        // Espanhol tem de ser possível sem passar pelo onboarding de novo.
        h("div", { key: "lbi", style: { fontSize: 12.5, fontWeight: 700, color: C.sub, margin: "14px 0 4px" } }, "Qual idioma você fará na prova?"),
        h("div", { key: "lbi2", style: { fontSize: 10.5, fontWeight: 600, color: C.faint, marginBottom: 9 } }, "Você recebe questões, flashcards e missões apenas do idioma escolhido."),
        h(
          "div",
          { key: "idi", style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 4 } },
          [
            { valor: "ingles", rotulo: "Inglês" },
            { valor: "espanhol", rotulo: "Espanhol" }
          ].map((op) =>
            h(
              "div",
              {
                key: op.valor,
                onClick: () => save({ ...B, idioma: op.valor }),
                style: {
                  padding: "12px 10px",
                  borderRadius: 13,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  background: B.idioma === op.valor ? C.orange : C.card,
                  color: B.idioma === op.valor ? "#fff" : C.txt,
                  border: "1px solid " + (B.idioma === op.valor ? C.orange : C.line)
                }
              },
              op.rotulo
            )
          )
        ),

        h("div", { key: "lb", style: { fontSize: 12.5, fontWeight: 700, color: C.sub, margin: "10px 0 8px" } }, "Como você se sente em cada matéria?"),
        h("div", { key: "lb2", style: { fontSize: 10.5, fontWeight: 600, color: C.faint, marginBottom: 10 } }, "Toque para alternar: Domínio (facilidade) → Atenção → Turbulência (dificuldade). O algoritmo usa isso para priorizar seu cronograma."),
        h(
          "div",
          { key: "ch", style: { display: "flex", flexDirection: "column", gap: 8 } },
          this.props.dados.materias.map((m) => {
            const lvl = this.state.feels[m] || "Atenção";
            const cfg = ({ Domínio: ["#3dd68c", C.greenSoft], Atenção: ["#ffc94d", "rgba(255,201,77,.14)"], Turbulência: ["#ff6b5e", C.redSoft] } as Record<string, string[]>)[lvl];
            return h(
              "div",
              {
                key: m,
                onClick: () => {
                  const cur = this.state.feels[m] || "Atenção";
                  const nx = ({ Domínio: "Atenção", Atenção: "Turbulência", Turbulência: "Domínio" } as Record<string, string>)[cur];
                  const f = { ...this.state.feels, [m]: nx };
                  this.setState({ feels: f });
                  try {
                  } catch (e) {}
                },
                style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 13, background: C.card, border: "1px solid " + C.line, cursor: "pointer" }
              },
              [h("span", { key: "n", style: { flex: 1, fontSize: 13, fontWeight: 700, color: C.txt } }, m), h("span", { key: "v", style: { fontSize: 11, fontWeight: 800, color: cfg[0], background: cfg[1], padding: "5px 12px", borderRadius: 99 } }, lvl)]
            );
          })
        )
      ]),
      this.state.briefErro
        ? h(
            "div",
            { key: "err", style: { margin: "0 18px 10px", padding: "11px 13px", borderRadius: 12, background: C.redSoft, color: "#e04f42", fontSize: 12, fontWeight: 700 } },
            this.state.briefErro
          )
        : null,
      h(
        "div",
        { key: "f", style: { padding: "10px 18px 30px" } },
        btn(this.state.briefSalvando ? "SALVANDO..." : "CONCLUÍDO", () => this.salvarBriefingReal(), { opacity: this.state.briefSalvando ? 0.6 : 1 })
      )
    ]);
  }
  // Server Actions chamadas direto (sem <form>) não navegam sozinhas quando
  // uma dependência interna (ex.: requireAcessoAluno) chama redirect() — o
  // redirect vira uma exceção comum aqui no cliente, identificável pelo
  // `digest` que o Next.js embute nela (formato "NEXT_REDIRECT;<tipo>;<url>;
  // <status>"). Sem tratar isso, qualquer redirect de autenticação/acesso
  // vira uma mensagem de erro genérica e confusa. Retorna true se era um
  // redirect e já navegou; false se é um erro de verdade e deve seguir pro
  // tratamento normal.
  // O Supabase Auth já devolve mensagens em inglês pensadas pra exibição,
  // mas ainda são mensagens técnicas em inglês — traduzimos os casos mais
  // comuns pro aluno e caímos numa mensagem genérica em português pra
  // qualquer coisa que não reconhecemos (nunca mostramos o texto original
  // em inglês na tela).
  traduzirErroSenha(mensagemOriginal: string): string {
    const m = mensagemOriginal.toLowerCase();
    if (m.includes("should be at least") || m.includes("should be different") || m.includes("weak")) {
      return "A senha não atende aos requisitos mínimos de segurança. Tente uma senha mais forte.";
    }
    if (m.includes("same password") || m.includes("different from the old")) {
      return "A nova senha precisa ser diferente da senha atual.";
    }
    if (m.includes("network") || m.includes("fetch")) {
      return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
    }
    return "Não foi possível alterar a senha. Tente novamente em instantes.";
  }
  seguirRedirectDoServidor(e: any): boolean {
    const digest = e?.digest;
    if (typeof digest !== "string" || !digest.startsWith("NEXT_REDIRECT")) return false;
    const url = digest.split(";")[2];
    if (typeof window !== "undefined" && url) window.location.href = url;
    return true;
  }
  async salvarBriefingReal() {
    if (this.state.briefSalvando) return;
    // No modo demonstração não existe aluno de verdade pra gravar o
    // briefing — só simula a navegação que aconteceria depois de salvar.
    if (this.props.demoMode) {
      this.nav("tutorial");
      return;
    }
    this.setState({ briefSalvando: true, briefErro: null });
    const B = this.state.brief;
    const fd = new FormData();
    fd.set("data_prova", B.prova || "");
    fd.set("inicio_estudos", B.inicio || "");
    fd.set("dias_por_semana", String(B.dias || 5));
    fd.set("horas_por_dia", String(B.horas || 3));
    fd.set("idioma_prova", B.idioma || "");
    escreverSentimentos(fd, this.state.feels as Record<string, string>);
    try {
      const resultado = await salvarBriefingApp(fd);
      if (!resultado.ok) {
        this.setState({ briefErro: resultado.erro });
        return;
      }
      this.nav("tutorial");
    } catch (e) {
      // salvarBriefingApp() não redireciona sozinha em caso de sucesso/erro
      // de validação — devolve { ok, erro }. Mas a checagem de acesso que
      // ela faz por baixo (requireAcessoAluno) PODE lançar um redirect() de
      // verdade (sessão expirada, matrícula bloqueada) se algo mudou desde
      // que esta tela carregou. Como esta função é chamada direto (sem
      // <form>), esse redirect chega aqui como uma exceção comum — sem
      // tratar isso, o usuário vê "não foi possível salvar" quando na real
      // precisa é fazer login de novo ou renovar o plano.
      if (this.seguirRedirectDoServidor(e)) return;
      console.error("Falha ao salvar briefing:", e);
      this.setState({ briefErro: "Não foi possível salvar o briefing. Tente novamente." });
    } finally {
      this.setState({ briefSalvando: false });
    }
  }

  linhaMissao(m: AlunoMissao, i: number, total: number) {
    const { C, h, I } = this.ui();
    const dn = m.concluida;
    return h(
      "div",
      { key: "m" + m.id, style: { display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < total - 1 ? "1px solid " + C.line : "none", opacity: dn ? 0.55 : 1 } },
      [
        h(
          "div",
          {
            key: "n",
            onClick: () => this.toggleMissao(m.id),
            style: { width: 24, height: 24, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10.5, fontWeight: 900, background: dn ? C.green : C.chip, color: dn ? "#fff" : C.sub }
          },
          dn ? I("check", 12, "#fff", 3) : i + 1
        ),
        h("div", { key: "t", onClick: () => this.navMissao(m), style: { flex: 1, cursor: "pointer" } }, [
          h("div", { key: "a", style: { fontSize: 12, fontWeight: 800, textDecoration: dn ? "line-through" : "none" } }, m.titulo),
          h("div", { key: "b", style: { fontSize: 10, color: C.sub, fontWeight: 600 } }, (m.materia ? m.materia + " · " : "") + m.duracao_minutos + " min")
        ]),
        m.origem === "copiloto" ? h("span", { key: "g", style: { fontSize: 8, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99 } }, "COPILOTO") : I("chevR", 14, C.faint)
      ]
    );
  }
  // Uma linha de item do cronograma dentro do cartão-destaque de hoje —
  // extraída porque a mesma linha aparece no cronograma e no resumo do dia,
  // e duplicar esse bloco já tinha causado divergência entre as duas telas.
  linhaItemTrilha(diaNumero: number, item: TrilhaItem, i: number) {
    const { C, h, I } = this.ui();
    const chave = this.chaveDeItemTrilha(diaNumero, i, item);
    const concluido = this.estaConcluido(chave);
    return h(
      "div",
      { key: i, style: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", borderRadius: 10, padding: "8px 10px" } },
      [
        h(
          "div",
          {
            key: "c",
            onClick: (e: any) => {
              e.stopPropagation();
              if (chave) this.toggleItemGenerico(chave);
            },
            title: concluido ? "Desmarcar" : "Marcar como concluído",
            style: {
              width: 22,
              height: 22,
              borderRadius: 99,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: chave ? "pointer" : "default",
              background: concluido ? C.green : "rgba(255,255,255,.15)"
            }
          },
          concluido ? I("check", 11, "#fff", 3) : null
        ),
        h(
          "div",
          { key: "t", onClick: () => this.abrirItemTrilha(item, diaNumero, i), style: { flex: 1, cursor: "pointer", fontSize: 12, color: "#fff", fontWeight: 700, textDecoration: concluido ? "line-through" : "none" } },
          item.titulo
        ),
        h("div", { key: "go", onClick: () => this.abrirItemTrilha(item, diaNumero, i), style: { cursor: "pointer", display: "flex" } }, I("chevR", 14, "rgba(255,255,255,.7)"))
      ]
    );
  }
  // O dia da prova não é dia de estudo. Em vez das missões, o aluno vê o
  // destino: é o dia para o qual todo o cronograma foi construído.
  // `diaNumero` é null quando a prova não é um dia da rota — que é o caso
  // normal agora: a rota termina na véspera, porque dia de prova não é dia de
  // estudo. Nesse caso o cartão se identifica pela data.
  cartaoDiaDaProva(diaNumero: number | null) {
    const { C, h, card } = this.ui();
    const prova = this.dataDaProva();
    const rotulo = diaNumero != null
      ? this.rotuloDataDoDia(diaNumero)
      : prova
      ? nomeDoDiaDaSemana(prova) + " · " + dataBR(prova)
      : null;
    return h(
      "div",
      { key: "prova" + (diaNumero ?? "hoje"), style: { margin: "0 18px 10px" } },
      card({ padding: 18, background: C.headGrad, border: "none", color: "#fff" }, [
        h(
          "div",
          { key: "l", style: { fontSize: 10, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.65)" } },
          (diaNumero != null ? "Dia " + diaNumero : "Hoje") + (rotulo ? " · " + rotulo : "")
        ),
        // Rótulo exatamente como pedido: "DIA DA PROVA — VESTIBULAR FACAPE".
        // O nome sai de `configuracoes` (site.marca.vestibular); sem ele
        // configurado, fica só "DIA DA PROVA".
        h("div", { key: "t", style: { fontSize: 19, fontWeight: 900, marginTop: 8, letterSpacing: "-.01em" } }, "🎯 " + tituloDaProva(this.props.dados.nomeVestibular)),
        h(
          "div",
          { key: "s", style: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)", marginTop: 8, lineHeight: 1.55 } },
          "Sem missões hoje. Descanse, confira o local de prova e leve documento e caneta. Você se preparou para este dia."
        )
      ])
    );
  }
  // Véspera da prova. Só existe quando a rota tinha folga para reservá-la —
  // numa janela apertada esse dia continua sendo de estudo.
  cartaoVespera(dia: DiaDoCronograma) {
    const { C, h, card } = this.ui();
    const rotulo = this.rotuloDataDoDia(dia.dia_numero);
    return h(
      "div",
      { key: "vespera" + dia.dia_numero, style: { margin: "0 18px 12px" } },
      card({ padding: 16, border: "1.5px solid " + C.orange, background: C.orangeSoft }, [
        h(
          "div",
          { key: "l", style: { fontSize: 10, fontWeight: 900, letterSpacing: ".07em", textTransform: "uppercase", color: C.orange } },
          "Dia " + dia.dia_numero + (rotulo ? " · " + rotulo : "")
        ),
        h("div", { key: "t", style: { fontSize: 15, fontWeight: 900, color: C.txt, marginTop: 6 } }, "😴 " + dia.titulo),
        h(
          "div",
          { key: "s", style: { fontSize: 11.5, fontWeight: 600, color: C.sub, marginTop: 5, lineHeight: 1.55 } },
          "Nada de conteúdo novo hoje. Durma bem, separe documento e caneta e confira o local da prova."
        )
      ])
    );
  }

  // Cartão de um dia do cronograma (usado nos dias anteriores e nos
  // próximos). `passado` só muda a aparência — os itens continuam clicáveis,
  // para o aluno poder concluir o que ficou para trás.
  cartaoDiaTrilha(dia: DiaDoCronograma, passado: boolean) {
    const { C, h, I, card } = this.ui();
    // No dia da prova o cronograma dá lugar ao cartão do vestibular: nada de
    // missão marcada para o dia do exame.
    if (dia.tipo_rota === "prova" || this.ehDiaDaProva(dia.dia_numero)) return this.cartaoDiaDaProva(dia.dia_numero);
    // Véspera reservada para descanso — sem itens, e é assim de propósito.
    if (dia.tipo_rota === "descanso") return this.cartaoVespera(dia);
    const itens = dia.itens || [];
    // O bloco de questões extras não entra na conta: é complementar, e
    // deixá-lo por fazer não pode segurar o dia em "4/5" para sempre.
    const contam = itensQueContam(itens);
    const feitos = contam.filter(({ item, indice }) => this.estaConcluido(this.chaveDeItemTrilha(dia.dia_numero, indice, item))).length;
    const concluido = contam.length > 0 && feitos === contam.length;
    // Um dia cumprido continua na trilha — não some, fica marcado. A opacidade
    // reduzida some quando o dia está concluído: apagar um dia que o aluno
    // completou é o oposto do reconhecimento que ele merece ali.
    const opacidade = concluido ? 1 : passado ? 0.75 : 1;
    return h(
      "div",
      { key: "trilha" + dia.dia_numero, style: { margin: "0 18px 12px", opacity: opacidade } },
      card(
        {
          padding: 16,
          ...(concluido ? { border: "1.5px solid " + C.green, background: C.greenSoft } : {})
        },
        [
          h("div", { key: "t", style: { display: "flex", alignItems: "center", gap: 8 } }, [
            // Selo de conclusão: o "confere" que sinaliza o passo cumprido.
            concluido
              ? h(
                  "span",
                  {
                    key: "ok",
                    style: { width: 18, height: 18, borderRadius: 99, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }
                  },
                  I("check", 10, "#fff", 3)
                )
              : null,
            h("span", { key: "d", style: { fontSize: 10.5, fontWeight: 800, color: concluido ? C.green : C.faint, letterSpacing: ".06em", textTransform: "uppercase" } }, "Dia " + dia.dia_numero),
            itens.length
              ? h("span", { key: "c", style: { fontSize: 10, fontWeight: 800, color: concluido ? C.green : C.faint } }, feitos + "/" + contam.length)
              : null,
            concluido
              ? h("span", { key: "lbl", style: { marginLeft: "auto", fontSize: 9, fontWeight: 900, color: "#fff", background: C.green, padding: "3px 8px", borderRadius: 99, letterSpacing: ".05em" } }, "CONCLUÍDO")
              : null
          ]),
          // Data real do dia — "Dia 7" sozinho não diz ao aluno quando é.
          this.rotuloDataDoDia(dia.dia_numero)
            ? h("div", { key: "dt", style: { fontSize: 10.5, fontWeight: 700, color: C.sub, marginTop: 3 } }, this.rotuloDataDoDia(dia.dia_numero))
            : null,
          h("div", { key: "n", style: { fontSize: 13.5, fontWeight: 900, marginTop: 6, marginBottom: itens.length ? 10 : 0, lineHeight: 1.35 } }, dia.titulo),
          // Barra de progresso do dia: mostra o avanço sem precisar contar os
          // itens um a um.
          itens.length && !concluido
            ? h(
                "div",
                { key: "bar", style: { height: 4, borderRadius: 99, background: C.chip, overflow: "hidden", marginBottom: 8 } },
                h("div", { key: "f", style: { width: Math.round((feitos / Math.max(1, contam.length)) * 100) + "%", height: "100%", background: C.green, borderRadius: 99, transition: "width .25s" } })
              )
            : null,
          // Itens do dia numa coluna com respiro entre eles: empilhados sem
          // gap, o cartão virava um bloco só e ficava difícil distinguir
          // uma aula da próxima.
          itens.length
            ? h(
                "div",
                { key: "itens", style: { display: "flex", flexDirection: "column", gap: 6 } },
                itens.map((item, i) => this.linhaItemTrilha(dia.dia_numero, item, i))
              )
            : null,
          // O que o Copiloto marcou PARA ESTE DIA entra aqui dentro, e não
          // numa lista solta no fim da página. Uma revisão marcada para
          // sexta pertence ao bloco de sexta: fora dele, o aluno lia duas
          // agendas concorrentes e não sabia qual valia.
          ...this.missoesDoDia(dia)
        ]
      )
    );
  }

  /**
   * As missões individuais (Copiloto ou admin) agendadas para a data deste
   * dia da rota, já renderizadas — vazio quando não há nenhuma.
   *
   * A ligação é pela DATA: `scheduled_date` do dia da rota contra `data` da
   * missão. É o mesmo par que o Copiloto usa ao agendar, então o que ele
   * decidiu para sexta aparece na sexta.
   */
  missoesDoDia(dia: DiaDoCronograma) {
    const { C, h } = this.ui();
    const data = (dia as { scheduled_date?: string }).scheduled_date ?? this.dataDoDia(dia.dia_numero);
    if (!data) return [];
    const doDia = (this.state.missoesLocal as AlunoMissao[]).filter((m) => m.data === data);
    if (doDia.length === 0) return [];
    return [
      h(
        "div",
        { key: "missoes", style: { marginTop: 10, paddingTop: 10, borderTop: "1px dashed " + C.line } },
        [
          h(
            "div",
            { key: "l", style: { fontSize: 9.5, fontWeight: 900, color: C.orange, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 } },
            doDia.some((m) => m.origem === "copiloto") ? "Adicionado pelo Copiloto" : "Atividades extras"
          ),
          ...doDia.map((m, i) => this.linhaMissao(m, i, doDia.length))
        ]
      )
    ];
  }
  /** Voo Guiado antes de o mentor enviar o cronograma inicial. */
  scrPlanoEmPreparo() {
    const { C, h, card, iconBox } = this.ui();
    return this.screenWrap([
      this.head("Plano de voo", { back: "mapa" }),
      h(
        "div",
        { key: "preparo", style: { margin: "18px 18px 0" } },
        card({ padding: 26, textAlign: "center" }, [
          h("div", { key: "ic", style: { display: "flex", justifyContent: "center", marginBottom: 14 } },
            iconBox("plane", C.orangeSoft, C.orange, 56, 26)),
          h("div", { key: "t", style: { fontSize: 17, fontWeight: 800, marginBottom: 8 } },
            "Seu plano de voo está sendo preparado"),
          h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, lineHeight: 1.6 } },
            "Seu mentor está analisando seu perfil para montar um cronograma feito para você. " +
            "Assim que a mentoria for concluída, ele aparece aqui automaticamente."),
          h("div", { key: "e", style: { marginTop: 18, paddingTop: 16, borderTop: "1px solid " + C.line, fontSize: 12, color: C.faint, fontWeight: 600, lineHeight: 1.6 } },
            "Enquanto isso, você já pode usar o Banco de Questões, os flashcards e os simulados na aba Estudos.")
        ])
      )
    ]);
  }

  scrPlano() {
    const { C, h, I, card, btn, iconBox } = this.ui();
    // O cronograma (trilha_dias) é a BASE de estudo de todo mundo — inclusive
    // de quem tem Copiloto. As missões individuais (aluno_missoes, geradas
    // pelo Copiloto ou cadastradas à mão pelo admin) são um ACRÉSCIMO
    // adaptativo em cima dele, não um substituto.
    //
    // Antes, esta tela ramificava em `if (temCopiloto)` e nunca chegava ao
    // cronograma: um aluno do plano PRO sem missões geradas via "nenhuma
    // missão cadastrada" mesmo com os 40 dias preenchidos pelo admin. Por
    // isso a condição agora é sobre os DADOS que existem, não sobre o plano.
    const temCopiloto = this.props.dados.temCopiloto;

    // Voo Guiado esperando o mentor: o cronograma dele nasce da mentoria, não
    // de um formulário que o aluno preenche sozinho. Enquanto o mentor não
    // envia, esta tela explica o que está acontecendo em vez de mostrar um
    // cronograma vazio (ou, pior, o cronograma genérico de outro plano).
    if (this.props.dados.aguardandoMentor) return this.scrPlanoEmPreparo();

    const diaTrilha = this.props.dados.trilhaHoje;
    const B = this.state.brief || {};
    const pr = this.priorities();
    const hoje = this.missoesHoje();
    const hojeStr = this.props.dados.hojeStr;
    // Mesma regra do Centro de Missões: nada de missão no dia da prova. Se
    // as duas telas divergissem aqui, voltaria a valer a queixa de que
    // cronograma e missões mostram coisas diferentes.
    const dataProvaPlano = this.dataDaProva();
    const proximas = (this.state.missoesLocal as AlunoMissao[])
      .filter((m) => m.data > hojeStr && !(dataProvaPlano && m.data === dataProvaPlano))
      .sort((a, b) => a.data.localeCompare(b.data) || b.prioridade - a.prioridade);
    // Datas que já têm um cartão de dia na tela — as missões delas são
    // renderizadas DENTRO do cartão (missoesDoDia). Aqui sobra só o que não
    // tem dia correspondente, que sem esta lista simplesmente sumiria.
    const datasComCartao = new Set(
      [
        ...(this.props.dados.trilhaHoje ? [this.props.dados.trilhaHoje] : []),
        ...this.props.dados.trilhaProximos,
        ...this.props.dados.trilhaAnteriores
      ]
        .map((d) => (d as { scheduled_date?: string }).scheduled_date ?? this.dataDoDia(d.dia_numero))
        .filter(Boolean) as string[]
    );
    const porDia = new Map<string, AlunoMissao[]>();
    proximas
      .filter((m) => !datasComCartao.has(m.data))
      .forEach((m) => porDia.set(m.data, [...(porDia.get(m.data) || []), m]));
    const semNada = !diaTrilha && hoje.length === 0 && proximas.length === 0 && this.props.dados.trilhaProximos.length === 0;
    return this.screenWrap([
      this.head("Cronograma de Estudos", { back: "mapa" }),
      temCopiloto
        ? h(
            "div",
            { key: "info", style: { margin: "6px 18px 0" } },
            card({ padding: 14 }, [
              h("span", { key: "p", style: { fontSize: 9.5, fontWeight: 900, color: "#fff", background: C.orange, padding: "4px 10px", borderRadius: 99, letterSpacing: ".05em" } }, "VOO GUIADO · PRO"),
              h(
                "div",
                { key: "t", style: { fontSize: 10.5, fontWeight: 600, color: C.faint, marginTop: 8, lineHeight: 1.55 } },
                // Item 22: a mensagem descreve a rota que o aluno realmente
                // tem — quantos dias, quando termina — em vez de falar de um
                // "cronograma" genérico que não corresponde ao que está na
                // tela. Números vêm da rota; nada é fixo no código.
                (this.props.dados.totalDiasCronograma
                  ? "Sua rota tem " + this.props.dados.totalDiasCronograma + " dias de estudo até a prova, com 2 simulados no caminho. "
                  : "") +
                "O Copiloto acompanha seu desempenho em questões, flashcards e simulados e acrescenta missões de reforço quando identifica um ponto fraco." +
                (B.prova ? " Prova em " + B.prova.split("-").reverse().join("/") + "." : "")
              )
            ])
          )
        : null,
      // Missão do dia do cronograma — a "trilha" é exatamente esta visão.
      //
      // Hoje é o dia da prova: nenhuma missão, só o cartão do vestibular. A
      // rota termina na véspera (dia de prova não é dia de estudo), então
      // esta checagem é por DATA, não por dia da rota.
      this.dataDaProva() === this.props.dados.hojeStr
        ? h("div", { key: "hero", style: { marginTop: 12 } }, this.cartaoDiaDaProva(null))
        : diaTrilha && this.ehDiaDaProva(diaTrilha.dia_numero)
        ? h("div", { key: "hero", style: { marginTop: 12 } }, this.cartaoDiaDaProva(diaTrilha.dia_numero))
        : diaTrilha
        ? h(
            "div",
            { key: "hero", style: { margin: "12px 18px 0" } },
            card({ background: C.headGrad, border: "none", color: "#fff" }, [
              h(
                "div",
                { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 } },
                // "Hoje · Dia 2 de 19 · Quarta-feira · 12/08/2026". O total
                // é o da ROTA do aluno, não o do template: era daí que saía
                // "Dia 22" no segundo dia de estudo de uma janela de 19 dias.
                "Hoje · Dia " + diaTrilha.dia_numero
                  + (this.props.dados.totalDiasCronograma ? " de " + this.props.dados.totalDiasCronograma : "")
                  + (this.rotuloDataDoDia(diaTrilha.dia_numero) ? " · " + this.rotuloDataDoDia(diaTrilha.dia_numero) : "")
              ),
              h("div", { key: "t", style: { fontSize: 17, fontWeight: 900 } }, diaTrilha.titulo),
              diaTrilha.itens?.length
                ? h(
                    "div",
                    { key: "at", style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 } },
                    diaTrilha.itens.map((item, i) => this.linhaItemTrilha(diaTrilha.dia_numero, item, i))
                  )
                : h("div", { key: "d", style: { fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 6 } }, "Dia livre — aproveite pra revisar o que quiser.")
            ])
          )
        : null,
      // Missões individuais de hoje (Copiloto ou cadastradas pelo admin),
      // somadas ao cronograma acima em vez de substituí-lo.
      hoje.length
        ? h(
            "div",
            { key: "hojeMissoes", style: { margin: "12px 18px 0" } },
            card({ padding: 15 }, [
              h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 900, marginBottom: 8 } }, temCopiloto ? "Missões extras de hoje" : "Missões de hoje"),
              ...hoje.map((m, i) => this.linhaMissao(m, i, hoje.length))
            ])
          )
        : null,
      pr.length
        ? h(
            "div",
            { key: "prio", style: { margin: "12px 18px 0" } },
            card({ border: "1.5px solid " + C.orange }, [
              h("div", { key: "h", style: { display: "flex", gap: 10, alignItems: "center" } }, [
                iconBox("bolt", C.orangeSoft, C.orange, 40, 19),
                h("div", { key: "t", style: { flex: 1 } }, [
                  h("div", { key: "a", style: { fontSize: 13, fontWeight: 900 } }, "Maior ganho agora: " + pr[0].tema),
                  h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 2 } }, pr[0].why)
                ])
              ])
            ])
          )
        : null,
      // Rota ajustada ao tempo real (Voo Guiado). Sem este aviso, um aluno
      // que vê "Dia 3 de 20" onde a trilha original tem 40 dias concluiria
      // que perdeu material — quando na verdade os dias foram agrupados
      // para caber até a data da prova, sem descartar nada.
      this.props.dados.cronogramaCompactado
        ? h(
            "div",
            {
              key: "avisoCompacto",
              style: { margin: "12px 18px 0", padding: "11px 14px", borderRadius: 13, background: C.chip, display: "flex", gap: 9, alignItems: "flex-start" }
            },
            [
              I("bot", 15, C.orange),
              h(
                "span",
                { key: "t", style: { fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.5 } },
                "Sua rota foi montada para o tempo que você tem até a prova, respeitando os dias da semana e as horas por dia que você informou. Como a janela é menor que o conteúdo completo, alguns dias reúnem mais de um tema — nada foi removido."
              )
            ]
          )
        : null,
      // Dias já passados, recolhidos atrás de um toque. Ficam acessíveis para
      // o aluno concluir o que ficou para trás — sumir com eles é o que dava
      // a impressão de que o cronograma "perdia" dias.
      this.props.dados.trilhaAnteriores.length
        ? h(
            "div",
            {
              key: "lblAnt",
              onClick: () => this.setState({ mostrarDiasAnteriores: !this.state.mostrarDiasAnteriores }),
              style: { margin: "16px 18px 8px", padding: "10px 14px", borderRadius: 13, background: C.chip, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }
            },
            [
              h(
                "span",
                { key: "ch", style: { display: "flex", transform: this.state.mostrarDiasAnteriores ? "rotate(90deg)" : "none", transition: "transform .2s" } },
                I("chevR", 15, C.sub)
              ),
              h("span", { key: "t", style: { flex: 1, fontSize: 12, fontWeight: 800, color: C.sub } },
                this.props.dados.trilhaAnteriores.length + (this.props.dados.trilhaAnteriores.length === 1 ? " dia anterior" : " dias anteriores")
                  + " · " + this.props.dados.trilhaAnteriores.filter((d) => {
                      const its = itensQueContam(d.itens || []);
                      return its.length > 0 && its.every(({ item, indice }) => this.estaConcluido(this.chaveDeItemTrilha(d.dia_numero, indice, item)));
                    }).length + " concluído(s)")
            ]
          )
        : null,
      ...(this.state.mostrarDiasAnteriores ? this.props.dados.trilhaAnteriores : []).map((dia) =>
        this.cartaoDiaTrilha(dia, true)
      ),
      // Próximos dias do cronograma — todos, sem corte: o painel do admin é a
      // fonte oficial, e se ele cadastrou 40 dias o aluno vê os 40.
      this.props.dados.trilhaProximos.length
        ? h("div", { key: "lblProx", style: { margin: "20px 20px 8px", fontSize: 11.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } },
            "Próximos dias · " + this.props.dados.trilhaProximos.length)
        : null,
      ...this.props.dados.trilhaProximos.map((dia) => this.cartaoDiaTrilha(dia, false)),
      porDia.size
        ? h("div", { key: "lblFora", style: { margin: "20px 20px 8px", fontSize: 11.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } },
            "Agendado para depois do cronograma")
        : null,
      ...Array.from(porDia.entries()).map(([data, ms]) =>
        h(
          "div",
          { key: "dia" + data, style: { margin: "12px 18px 0" } },
          card({ padding: 15 }, [
            h(
              "div",
              { key: "t", style: { fontSize: 12, fontWeight: 800, color: C.sub, textTransform: "capitalize", marginBottom: 8 } },
              new Date(data + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
            ),
            ...ms.map((m, i) => this.linhaMissao(m, i, ms.length))
          ])
        )
      ),
      semNada
        ? h("div", { key: "vazio", style: { margin: "12px 18px 0" } }, card({ textAlign: "center", padding: 20 }, "Nenhuma missão cadastrada para hoje. Fale com a coordenação."))
        : null,
      temCopiloto
        ? null
        : h(
        "div",
        { key: "pro", style: { margin: "14px 18px 4px" } },
        card({ border: "1.5px solid " + C.orange, background: C.dark ? "linear-gradient(150deg,#3a2410,#0c3557 60%)" : "linear-gradient(150deg,#fff4ec,#fff)" }, [
          h("div", { key: "h", style: { display: "flex", gap: 10, alignItems: "center" } }, [
            iconBox("bolt", C.orangeSoft, C.orange, 40, 19),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, "Conheça o Voo Guiado (PRO)"),
              h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, "O Copiloto adapta seu cronograma ao seu desempenho real. Seu plano atual não muda até você contratar.")
            ])
          ]),
          // /planos foi descontinuada (hoje só existe link de inscrição por
          // plano, gerado no admin) e apenas redireciona pro login — mandar
          // o aluno pra lá era um botão que não cumpria o que promete. O
          // caminho real de upgrade é falar com a equipe.
          btn("QUERO SABER MAIS →", () => window.open(this.props.whatsappSuporte, "_blank", "noopener,noreferrer"), { marginTop: 12, padding: "12px" })
        ])
      )
    ]);
  }

  scrBrowser() {
    const { C, h, I, btn } = this.ui();
    const S = this.state;
    const raw = S.browserUrl || "";
    const embedYoutube = this.youtubeEmbedUrl(raw);
    const src = raw ? embedYoutube || this.normalizarUrl(raw) : "";
    const recarregar = () => {
      this.setState((s: any) => ({ browserReloadKey: (s.browserReloadKey || 0) + 1, browserCarregou: false, browserFalhou: false }));
      this.agendarChecagemDeCarregamento(raw);
    };
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "bar", style: { display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 10px" } }, [
        h("div", { key: "x", onClick: () => this.nav(S.browserBack || "mapa"), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("x", 17, C.txt)),
        h("div", { key: "url", style: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.card, border: "1px solid " + C.line, borderRadius: 12, padding: "10px 13px", minWidth: 0 } }, [
          I("lock", 13, C.green),
          h("span", { key: "u", style: { fontSize: 12, fontWeight: 700, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, raw || "decolamed.com.br")
        ]),
        h(
          "div",
          { key: "rf", onClick: recarregar, style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }, title: "Recarregar" },
          I("refresh", 16, C.txt)
        ),
        src
          ? h(
              "a",
              { key: "ext", href: src, target: "_blank", rel: "noopener noreferrer", style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" }, title: "Abrir em nova guia" },
              I("external", 16, C.txt)
            )
          : null
      ]),
      h(
        "div",
        { key: "page", style: { flex: 1, margin: "4px 16px 16px", borderRadius: 18, background: "#fff", border: "1px solid " + C.line, overflow: "hidden", position: "relative" } },
        S.browserFalhou
          ? h(
              "div",
              { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 28, textAlign: "center" } },
              [
                I("external", 32, C.faint),
                h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800, color: C.dark ? "#0c1520" : C.txt } }, "Este conteúdo não pode ser exibido aqui dentro"),
                h(
                  "div",
                  { key: "d", style: { fontSize: 12, color: C.sub, fontWeight: 600, lineHeight: 1.5, maxWidth: 280 } },
                  "Alguns sites bloqueiam a exibição dentro de outros aplicativos por segurança. Abra em uma nova aba para continuar."
                ),
                btn("ABRIR EM NOVA ABA →", () => src && typeof window !== "undefined" && window.open(src, "_blank", "noopener,noreferrer"), { marginTop: 4, padding: "12px 20px" })
              ]
            )
          : src
          ? h("iframe", {
              key: "if-" + S.browserReloadKey,
              src,
              title: S.browserTitle || "Conteúdo externo",
              style: { width: "100%", height: "100%", border: "none", display: "block" },
              allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
              allowFullScreen: true,
              onLoad: () => this.setState({ browserCarregou: true, browserFalhou: false })
            })
          : h("div", { style: { padding: 26, textAlign: "center", fontSize: 12.5, color: C.sub, fontWeight: 600 } }, "Nenhum conteúdo para exibir.")
      ),
      h("div", { key: "foot", style: { padding: "10px 16px 26px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: C.faint, background: C.navBg, borderTop: "1px solid " + C.line } }, "Navegador interno · Decola Med")
    ]);
  }

  // Player dedicado de videoaula — nada de barra de endereço/botões de
  // navegador (ver scrBrowser() acima, reservado a pdf/link/páginas
  // externas): aqui é só o vídeo em destaque, com progresso salvo sozinho e
  // um botão claro pra marcar a aula como concluída manualmente.
  scrPlayer() {
    const { C, h, I } = this.ui();
    const S = this.state;
    const url = S.playerUrl || "";
    const videoId = this.youtubeVideoId(url);
    const progresso = this.progressoDe(S.playerChave);
    const concluida = this.estaConcluido(S.playerChave);
    const pctAssistido =
      progresso && progresso.duracao_segundos
        ? Math.min(100, Math.round((progresso.posicao_segundos / progresso.duracao_segundos) * 100))
        : concluida
        ? 100
        : null;
    const atual = S.playerLista.findIndex((a: any) => a.url === url);
    const proxima = atual >= 0 && atual < S.playerLista.length - 1 ? S.playerLista[atual + 1] : null;
    return h("div", { className: styles.playerShell }, [
      // Barra de navegação ACIMA do vídeo — nada fica sobreposto à imagem.
      h(
        "div",
        { key: "bar", className: styles.playerBar, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#000", flexShrink: 0 } },
        [
          h(
            "div",
            {
              key: "back",
              onClick: () => this.fecharPlayer(),
              style: { width: 36, height: 36, borderRadius: 99, background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }
            },
            I("arrowL", 18, "#fff")
          ),
          h(
            "div",
            { key: "t", style: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
            S.playerTitulo
          )
        ]
      ),
      h("div", { key: "video", className: styles.playerVideo }, [
        videoId
          ? h("div", { key: "yt", ref: this._refHostYoutube })
          : url
          ? h("iframe", {
              key: "if",
              src: this.normalizarUrl(url),
              title: S.playerTitulo,
              allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
              allowFullScreen: true
            })
          : h("div", { key: "empty", style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.6)", fontSize: 12.5, fontWeight: 700 } }, "Nenhum vídeo para exibir.")
      ]),
      // Barra de progresso colada no vídeo, como em plataforma de curso —
      // o aluno vê de imediato quanto já assistiu daquela aula.
      pctAssistido != null
        ? h(
            "div",
            { key: "prog", className: styles.playerProgresso, style: { height: 3, background: "rgba(255,255,255,.15)", flexShrink: 0 } },
            h("div", { style: { height: "100%", width: pctAssistido + "%", background: concluida ? C.green : C.orange, transition: "width .3s" } })
          )
        : null,
      h("div", { key: "info", className: styles.playerInfo, style: { flex: 1, overflow: "auto", background: C.bg, padding: "18px 18px 96px" } }, [
        h("div", { key: "t", style: { fontSize: 17, fontWeight: 900, color: C.txt, lineHeight: 1.3 } }, S.playerTitulo),
        h(
          "div",
          { key: "meta", style: { marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
          [
            concluida
              ? h("span", { key: "ok", style: { fontSize: 10, fontWeight: 900, color: C.green, background: C.greenSoft, padding: "3px 9px", borderRadius: 99, letterSpacing: ".04em" } }, "CONCLUÍDA")
              : pctAssistido != null && pctAssistido > 0
              ? h("span", { key: "p", style: { fontSize: 10, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "3px 9px", borderRadius: 99, letterSpacing: ".04em" } }, pctAssistido + "% ASSISTIDO")
              : null,
            atual >= 0 && S.playerLista.length > 1
              ? h("span", { key: "n", style: { fontSize: 10.5, fontWeight: 700, color: C.faint } }, "Aula " + (atual + 1) + " de " + S.playerLista.length)
              : null
          ]
        ),
        // Ação primária clara — o aluno pode concluir a aula na hora que
        // quiser, sem depender de assistir até o fim.
        S.playerChave
          ? h(
              "div",
              {
                key: "toggle",
                onClick: () => this.toggleItemGenerico(S.playerChave),
                style: {
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  cursor: "pointer",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: concluida ? C.greenSoft : C.orange,
                  border: concluida ? "1.5px solid " + C.green : "none",
                  boxShadow: concluida ? "none" : "0 6px 18px rgba(243,108,33,.32)"
                }
              },
              [
                h(
                  "div",
                  { key: "c", style: { width: 22, height: 22, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: concluida ? C.green : "rgba(255,255,255,.25)" } },
                  I("check", 12, "#fff", 3)
                ),
                h("span", { key: "s", style: { fontSize: 13, fontWeight: 900, color: concluida ? C.green : "#fff", letterSpacing: ".02em" } }, concluida ? "AULA CONCLUÍDA" : "MARCAR COMO CONCLUÍDA")
              ]
            )
          : null,
        proxima
          ? h(
              "div",
              {
                key: "prox",
                onClick: () => this.trocarAula(proxima),
                style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 14px", borderRadius: 14, background: C.chip }
              },
              [
                h("div", { key: "i", style: { display: "flex" } }, I("chevR", 16, C.orange)),
                h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                  h("div", { key: "a", style: { fontSize: 9.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Próxima aula"),
                  h("div", { key: "b", style: { fontSize: 12.5, fontWeight: 800, color: C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, proxima.titulo)
                ])
              ]
            )
          : null,
        // Lista de aulas irmãs — o que dá continuidade de curso: dá pra
        // pular entre as aulas do dia sem voltar pro cronograma.
        S.playerLista.length > 1
          ? h("div", { key: "lbl", style: { margin: "22px 0 10px", fontSize: 11, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Aulas desta missão")
          : null,
        S.playerLista.length > 1
          ? h(
              "div",
              { key: "lista", style: { display: "flex", flexDirection: "column", gap: 8 } },
              S.playerLista.map((item: any, i: number) => {
                const ativo = i === atual;
                const feita = this.estaConcluido(this.chaveDeAula(item.id, item.url));
                return h(
                  "div",
                  {
                    key: i,
                    onClick: () => (ativo ? null : this.trocarAula(item)),
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "11px 13px",
                      borderRadius: 13,
                      cursor: ativo ? "default" : "pointer",
                      background: ativo ? C.orangeSoft : C.card,
                      border: "1px solid " + (ativo ? C.orange : C.line)
                    }
                  },
                  [
                    h(
                      "div",
                      { key: "n", style: { width: 26, height: 26, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, background: feita ? C.green : ativo ? C.orange : C.chip, color: feita || ativo ? "#fff" : C.sub } },
                      feita ? I("check", 12, "#fff", 3) : i + 1
                    ),
                    h(
                      "div",
                      { key: "t", style: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: ativo ? 900 : 700, color: C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                      item.titulo
                    ),
                    ativo ? h("span", { key: "p", style: { fontSize: 9, fontWeight: 900, color: C.orange, letterSpacing: ".05em" } }, "AGORA") : null
                  ]
                );
              })
            )
          : null
      ])
    ]);
  }

  scrAnotacoes() {
    const { C, h, I, card } = this.ui();
    const saved: { code: string; txt: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("dm-note-") === 0 && k !== "dm-note-livre") {
          const v = localStorage.getItem(k);
          if (v && v.trim()) saved.push({ code: k.replace("dm-note-", ""), txt: v });
        }
      }
    } catch (e) {}
    return this.screenWrap([
      this.head("Anotações", { back: "estudos" }),
      h(
        "div",
        { key: "free", style: { margin: "6px 18px 0" } },
        card({ padding: 14 }, [
          h("div", { key: "l", style: { display: "flex", gap: 7, alignItems: "center", marginBottom: 8 } }, [
            I("pencil", 13, C.sub),
            h("span", { key: "t", style: { flex: 1, fontSize: 11, fontWeight: 800, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" } }, "Caderno livre"),
            this.rotuloSalvamento()
          ]),
          h("textarea", {
            key: "ta",
            defaultValue: (function () {
              try {
                return localStorage.getItem("dm-note-livre") || "";
              } catch (e) {
                return "";
              }
            })(),
            onChange: (e: any) => {
              try {
                localStorage.setItem("dm-note-livre", e.target.value);
                this.marcarNotaSalva();
              } catch (err) {
                this.avisar("Não foi possível salvar a anotação neste navegador.");
              }
            },
            placeholder: "Escreva aqui suas anotações de estudo...",
            style: { width: "100%", height: 150, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit", lineHeight: 1.6 }
          })
        ])
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Anotações por questão"),
      saved.length
        ? h(
            "div",
            { key: "list", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 9 } },
            saved.map((n, i) =>
              card({ key: n.code, padding: 13 }, [
                h("div", { key: "h", style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 7 } }, [
                  h("span", { key: "c", style: { fontFamily: "monospace", fontSize: 10, fontWeight: 900, color: C.txt, background: C.chip, padding: "3px 9px", borderRadius: 99 } }, n.code),
                  h("div", { key: "sp", style: { flex: 1 } }),
                  h(
                    "div",
                    {
                      key: "x",
                      onClick: () => {
                        try {
                          localStorage.removeItem("dm-note-" + n.code);
                        } catch (e) {}
                        this.forceUpdate();
                      },
                      style: { cursor: "pointer" }
                    },
                    I("x", 14, C.faint)
                  )
                ]),
                h("textarea", {
                  key: "ta",
                  defaultValue: n.txt,
                  onChange: (e: any) => {
                    try {
                      localStorage.setItem("dm-note-" + n.code, e.target.value);
                      this.marcarNotaSalva();
                    } catch (err) {}
                  },
                  style: { width: "100%", height: 56, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 10, padding: "9px 11px", fontSize: 12, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit" }
                })
              ])
            )
          )
        : h(
            "div",
            { key: "empty", style: { margin: "0 18px", padding: "14px 15px", borderRadius: 13, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.6 } },
            'Você ainda não anotou em nenhuma questão. Ao praticar, use o campo "Minhas anotações" — tudo aparece aqui automaticamente.'
          )
    ]);
  }

  // Lista real de conteúdo (aulas/pdfs/links cadastrados no admin) — nada
  // fabricado aqui: se o admin não cadastrou nada daquele tipo, a lista
  // vem vazia e mostra o estado vazio abaixo.
  scrConteudo() {
    const { C, h, I, card, iconBox } = this.ui();
    const S = this.state;
    const t = S.contTitle || "Conteúdos";
    const tipo = S.contTipo as "aula" | "pdf" | "link" | null;
    const ic = tipo === "link" ? "link2" : tipo === "aula" ? "video" : "file";
    const items = this.biblioteca(tipo ?? "aula").map((m) => ({ id: m.id, ic, t: m.titulo, d: m.descricao, url: m.url }));
    return this.screenWrap([
      this.head(t, { back: S.contBack || "estudos" }),
      items.length
        ? h(
            "div",
            { key: "list", style: { margin: "6px 18px 0", display: "flex", flexDirection: "column", gap: 10 } },
            items.map((m, i) =>
              card(
                { key: m.id ?? "it" + i, padding: 14, display: "flex", gap: 12, alignItems: "center" },
                [
                  iconBox(m.ic, C.blueSoft, C.dark ? "#8fc3e8" : "#01395E", 44, 19),
                  h("div", { key: "t", style: { flex: 1, minWidth: 0 } }, [
                    h("div", { key: "a", style: { fontSize: 13, fontWeight: 800 } }, m.t),
                    h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.d)
                  ]),
                  I("chevR", 17, C.faint)
                ],
                () =>
                  tipo === "aula"
                    ? this.abrirAula(
                        m.id,
                        m.t,
                        m.url || "",
                        S.contBack || "estudos",
                        items.filter((x) => x.url).map((x) => ({ id: x.id, titulo: x.t, url: x.url as string }))
                      )
                    : this.openBrowser(m.t, m.url || "", S.contBack || "estudos")
              )
            )
          )
        : h(
            "div",
            { key: "empty", style: { margin: "18px 18px 0" } },
            card({ textAlign: "center", padding: 26 }, "Nada cadastrado aqui ainda. Assim que o administrador adicionar, aparece automaticamente.")
          ),
      h("div", { key: "n", style: { margin: "14px 18px 0", padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55, display: "flex", gap: 9 } }, [
        I("bot", 16, C.orange),
        "Conteúdos externos e videoaulas abrem no navegador interno, sem sair do app."
      ])
    ]);
  }

  scrGabarito() {
    const { C, h, I, card } = this.ui();
    const S = this.state;
    const gabarito: ItemGabarito[] = S.gabFrom === "hist" ? S.gabaritoHistorico || [] : S.simResult?.gabarito || [];
    return this.screenWrap(
      [
        h("div", { key: "hd", style: { display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 10px" } }, [
          h(
            "div",
            { key: "b", onClick: () => (S.gabFrom === "hist" ? this.nav("simulados") : this.setState({ simView: "result" })), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } },
            I("arrowL", 18, C.txt)
          ),
          h("div", { key: "t", style: { fontSize: 17, fontWeight: 800, flex: 1 } }, "Gabarito comentado")
        ]),
        S.gabaritoCarregando
          ? h("div", { key: "load", style: { textAlign: "center", padding: 30, color: C.sub, fontSize: 12.5, fontWeight: 700 } }, "Carregando gabarito...")
          : h(
              "div",
              { key: "list", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 10 } },
              gabarito.map((q, i) => {
                const idxCorreta = q.alternativas.findIndex((a) => a.id === q.respostaCorreta);
                const idxEscolhida = q.escolhida ? q.alternativas.findIndex((a) => a.id === q.escolhida) : -1;
                return card({ key: q.questaoId ?? "g" + i, padding: 14 }, [
                  h("div", { key: "h", style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } }, [
                    h("div", { key: "n", style: { width: 26, height: 26, borderRadius: 9, background: q.correta ? C.greenSoft : C.redSoft, color: q.correta ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 } }, i + 1),
                    h("span", { key: "m", style: { fontSize: 10.5, fontWeight: 800, color: C.sub } }, q.materia + (q.assunto ? " · " + q.assunto : "")),
                    h("span", { key: "s", style: { marginLeft: "auto", fontSize: 10, fontWeight: 900, color: q.correta ? C.green : C.red } }, q.correta ? "ACERTOU" : q.escolhida == null ? "EM BRANCO" : "ERROU")
                  ]),
                  h("div", { key: "q", style: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 } }, q.enunciado),
                  h("div", { key: "a", style: { fontSize: 11.5, fontWeight: 700, color: C.green } }, "Correta: " + String.fromCharCode(65 + idxCorreta) + ") " + (q.alternativas[idxCorreta]?.texto ?? "")),
                  q.escolhida != null && !q.correta
                    ? h("div", { key: "my", style: { fontSize: 11.5, fontWeight: 700, color: C.red, marginTop: 2 } }, "Sua resposta: " + String.fromCharCode(65 + idxEscolhida) + ") " + (q.alternativas[idxEscolhida]?.texto ?? ""))
                    : null,
                  q.explicacao
                    ? h(
                        "div",
                        { key: "c", style: { marginTop: 8, padding: "9px 11px", borderRadius: 10, background: C.chip, fontSize: 11, color: C.sub, fontWeight: 600, lineHeight: 1.5 } },
                        "Comentário: " + q.explicacao
                      )
                    : null
                ]);
              })
            )
      ],
      { noTab: true }
    );
  }

  flashcardsPool(): Flashcard[] {
    return this.state.fcPool;
  }
  embaralhar<T>(lista: T[]): T[] {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Começa de fato a sessão de flashcards com o grupo já escolhido (todos,
  // aleatório, uma matéria ou um assunto) — ver scrFlashcardsSelecao().
  iniciarFlashcards(cards: Flashcard[], embaralharAntes: boolean) {
    this.setState({ screen: "flashcards", fcPool: embaralharAntes ? this.embaralhar(cards) : cards, fcIdx: 0, fcFlip: false, fcOk: 0, fcModoAberto: null });
  }
  responderFlashcard(id: string, lembrou: boolean) {
    this.setState({ fcIdx: this.state.fcIdx + 1, fcFlip: false, fcOk: lembrou ? this.state.fcOk + 1 : this.state.fcOk });
    if (this.props.demoMode) return;
    // O card já avançou e rebobinar no meio da revisão confundiria mais do
    // que ajuda; o aviso serve pra o aluno saber que essa revisão não
    // entrou no XP nem nas estatísticas.
    const avisar = () => this.avisar("Uma revisão não foi salva. Verifique sua conexão para não perder seu progresso.");
    registrarRevisao(id, lembrou)
      .then((res) => {
        if (!res?.ok) avisar();
      })
      .catch(avisar);
  }
  // Tela de escolha antes de começar: todos, aleatório, por matéria ou por
  // assunto — evita que o aluno caia direto numa lista enorme e sem
  // organização, e permite focar num recorte específico do conteúdo.
  scrFlashcardsSelecao() {
    const { C, h, card, chip, iconBox } = this.ui();
    const S = this.state;
    const todos = this.props.dados.flashcards;
    const materias = Array.from(new Set(todos.map((c) => c.materia))).sort();
    const assuntos = Array.from(new Set(todos.filter((c) => c.assunto).map((c) => c.assunto as string))).sort();
    if (!todos.length) {
      return this.screenWrap([
        this.head("Flashcards", { back: "estudos" }),
        h("div", { key: "vazio", style: { margin: "18px 18px 0" } }, card({ textAlign: "center", padding: 26 }, "Ainda não há flashcards cadastrados para o seu curso."))
      ]);
    }
    const opcoes = [
      { k: "todos" as const, ic: "cards", t: "Todos", d: todos.length + (todos.length === 1 ? " card" : " cards") },
      { k: "aleatorio" as const, ic: "refresh", t: "Aleatório", d: "Ordem embaralhada" },
      { k: "materia" as const, ic: "layers", t: "Por matéria", d: materias.length + (materias.length === 1 ? " matéria" : " matérias") },
      { k: "assunto" as const, ic: "target", t: "Por assunto", d: assuntos.length + (assuntos.length === 1 ? " assunto" : " assuntos") }
    ];
    return this.screenWrap([
      this.head("Flashcards", { back: "estudos" }),
      h("div", { key: "lbl", style: { margin: "10px 18px 6px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Como você quer estudar?"),
      h(
        "div",
        { key: "opts", style: { margin: "0 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        opcoes.map((o) => {
          const ativo = S.fcModoAberto === o.k;
          return card(
            { padding: 16, border: ativo ? "1.5px solid " + C.orange : "1px solid " + C.line },
            [
              iconBox(o.ic, C.blueSoft, C.dark ? "#8fc3e8" : "#01395E", 40, 18),
              h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, marginTop: 10 } }, o.t),
              h("div", { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 2 } }, o.d)
            ],
            () => {
              if (o.k === "todos") this.iniciarFlashcards(todos, false);
              else if (o.k === "aleatorio") this.iniciarFlashcards(todos, true);
              else this.setState({ fcModoAberto: S.fcModoAberto === o.k ? null : o.k });
            }
          );
        })
      ),
      S.fcModoAberto === "materia"
        ? h(
            "div",
            { key: "materias", style: { margin: "14px 18px 0", display: "flex", flexWrap: "wrap", gap: 8 } },
            materias.map((m) => chip(m, false, () => this.iniciarFlashcards(this.embaralhar(todos.filter((c) => mesmaMateria(c.materia, m))), false)))
          )
        : null,
      S.fcModoAberto === "assunto"
        ? h(
            "div",
            { key: "assuntos", style: { margin: "14px 18px 0", display: "flex", flexWrap: "wrap", gap: 8 } },
            assuntos.map((a) => chip(a, false, () => this.iniciarFlashcards(this.embaralhar(todos.filter((c) => c.assunto === a)), false)))
          )
        : null
    ]);
  }
  scrFlashcards() {
    const { C, h, card, bar, btn, ghost } = this.ui();
    const S = this.state;
    const cards = this.flashcardsPool();
    if (!cards.length) {
      return this.screenWrap([
        this.head("Flashcards", { back: "estudos" }),
        h("div", { key: "vazio", style: { margin: "18px 18px 0" } }, card({ textAlign: "center", padding: 26 }, "Ainda não há flashcards cadastrados para o seu curso."))
      ]);
    }
    if (S.fcIdx >= cards.length) {
      return this.screenWrap([
        h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" } }, [
          this.mascoteBadge("cards", 92, { anim: "dm-pop .5s ease both", bg: C.greenSoft, color: C.green, shadow: "none" }),
          h("div", { key: "t", style: { fontSize: 21, fontWeight: 900, marginTop: 18 } }, "Sessão concluída!"),
          h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 8 } }, "Você lembrou " + S.fcOk + " de " + cards.length + " flashcards."),
          h("div", { key: "xp", style: { marginTop: 14, fontSize: 12.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "6px 14px", borderRadius: 99 } }, "Revisão registrada no seu histórico")
        ]),
        h("div", { key: "f", style: { padding: "0 24px 20px", display: "flex", gap: 10 } }, [
          ghost("Repetir", () => this.setState({ fcIdx: 0, fcFlip: false, fcOk: 0 }), { flex: 1 }),
          btn("VOLTAR AOS ESTUDOS", () => this.nav("estudos"), { flex: 1 })
        ])
      ]);
    }
    const c2 = cards[S.fcIdx];
    return this.screenWrap([
      this.head("Flashcards", { back: "estudos", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.fcIdx + 1 + " / " + cards.length) }),
      h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar((S.fcIdx / cards.length) * 100)),
      h(
        "div",
        { key: "meta", style: { margin: "14px 18px 0", display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 } },
        [
          h("span", { key: "m", style: { fontSize: 11.5, fontWeight: 800, color: C.green, letterSpacing: ".02em", textTransform: "uppercase", flexShrink: 0 } }, c2.materia),
          c2.assunto ? h("span", { key: "dot", style: { fontSize: 11.5, color: C.faint, flexShrink: 0 } }, "·") : null,
          c2.assunto ? h("span", { key: "a", style: { fontSize: 12.5, fontWeight: 700, color: C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c2.assunto) : null
        ]
      ),
      h(
        "div",
        {
          key: "card",
          onClick: () => this.setState({ fcFlip: !S.fcFlip }),
          style: {
            margin: "14px 18px 0",
            minHeight: 300,
            borderRadius: 22,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "30px 24px",
            textAlign: "center",
            background: S.fcFlip ? C.headGrad : C.card,
            border: S.fcFlip ? "none" : "1.5px solid " + C.line,
            color: S.fcFlip ? "#fff" : C.txt,
            boxShadow: "0 14px 34px rgba(1,30,50,.18)",
            transition: "all .25s"
          }
        },
        [
          h("div", { key: "l", style: { fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: S.fcFlip ? "rgba(255,255,255,.6)" : C.faint } }, S.fcFlip ? "Resposta" : "Pergunta"),
          h("div", { key: "t", style: { fontSize: S.fcFlip ? 15 : 18, fontWeight: 800, lineHeight: 1.5 } }, S.fcFlip ? c2.verso : c2.frente),
          h("div", { key: "h", style: { fontSize: 10.5, fontWeight: 700, color: S.fcFlip ? "rgba(255,255,255,.55)" : C.faint } }, "Toque para virar")
        ]
      ),
      S.fcFlip
        ? h("div", { key: "cta", style: { margin: "16px 18px 0", display: "flex", gap: 10 } }, [
            ghost("Errei", () => this.responderFlashcard(c2.id, false), { flex: 1, color: C.red, borderColor: C.red }),
            btn("ACERTEI ✓", () => this.responderFlashcard(c2.id, true), { flex: 1, background: C.green, boxShadow: "0 6px 18px rgba(31,165,101,.35)" })
          ])
        : null
    ]);
  }

  /**
   * Comunicar erro = abrir o WhatsApp geral da plataforma com a mensagem
   * inicial pronta. Antes era um formulário interno que gravava em
   * `relatos_erro` e alimentava uma fila no painel; o atendimento passou a
   * ser pelo WhatsApp e essa fila deixou de ter quem a lesse.
   *
   * O número NÃO está aqui: chega pronto em `whatsappErro`, montado no
   * servidor a partir de `site.contato.whatsapp`. Trocar o número no admin
   * muda o destino deste botão sem tocar em código.
   *
   * `window.open` com `_blank` é o que funciona nos dois casos: no celular o
   * sistema entrega o link ao aplicativo instalado, no computador abre o
   * WhatsApp Web.
   */
  abrirWhatsappErro() {
    // No modo demonstração não há número real configurado (a página passa
    // "#") — abrir levaria a lugar nenhum.
    if (this.props.demoMode) {
      this.avisar("No modo demonstração o WhatsApp de suporte não fica disponível.");
      return;
    }
    window.open(this.props.whatsappErro, "_blank", "noopener,noreferrer");
  }

  errInline(label?: string) {
    const { C, h, I } = this.ui();
    return h(
      "div",
      { key: "erri", onClick: () => this.abrirWhatsappErro(), style: { display: "flex", gap: 6, alignItems: "center", justifyContent: "center", padding: "9px 0", cursor: "pointer", color: C.faint, fontSize: 11, fontWeight: 800 } },
      [I("alert", 13, C.faint), label || "Comunicar erro nesta questão"]
    );
  }

  scrRedacao() {
    const { C, h, card, btn, iconBox } = this.ui();
    const { creditosRedacaoDisponiveis: disp, creditosRedacaoConsumidos: cons, creditosRedacaoTotais: tot } = this.props.dados;
    const steps = [
      ["pencil", "1. Escolha um tema", "Acesse a Base de Temas (botão abaixo) ou os Modelos de Redação em Estudos."],
      ["note", "2. Escreva sua redação", "Pode ser digitada ou escrita à mão (foto legível)."],
      ["send", "3. Envie pelo WhatsApp", "Mande direto para a professora de redação pelo botão abaixo."],
      ["check", "4. Correção pelo WhatsApp", "A professora corrige e devolve com comentários pelo próprio WhatsApp."],
      ["star4", "5. Crédito consumido após a correção", "Só desconta quando a professora confirmar a correção realizada."]
    ];
    return this.screenWrap([
      this.head("Redação", { back: "perfil" }),
      h(
        "div",
        { key: "cred", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", display: "flex", gap: 14, alignItems: "center" }, [
          iconBox("note", "rgba(255,255,255,.16)", "#fff", 64, 28),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".06em", textTransform: "uppercase" } }, "Seus créditos de redação"),
            h("div", { key: "b", style: { fontSize: 24, fontWeight: 900 } }, disp + " disponíve" + (disp === 1 ? "l" : "is")),
            h("div", { key: "c", style: { fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 } }, cons + " já consumido" + (cons === 1 ? "" : "s") + " de " + tot + " incluído" + (tot === 1 ? "" : "s") + " no seu plano")
          ])
        ])
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Como funciona"),
      h(
        "div",
        { key: "steps", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 9 } },
        steps.map((s, i) =>
          card({ key: "step" + i, padding: 13, display: "flex", gap: 12, alignItems: "center" }, [
            iconBox(s[0], C.orangeSoft, C.orange, 40, 17),
            h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, s[1]), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2, lineHeight: 1.5 } }, s[2])])
          ])
        )
      ),
      h(
        "div",
        { key: "note", style: { margin: "12px 18px 0", padding: "11px 13px", borderRadius: 13, background: C.chip, fontSize: 11, color: C.sub, fontWeight: 600, lineHeight: 1.6 } },
        "A redação NÃO é enviada pela plataforma — todo o envio e acompanhamento acontecem pelo WhatsApp da professora. Aqui você acompanha apenas os seus créditos."
      ),
      h(
        "div",
        { key: "cta", style: { margin: "14px 18px 0" } },
        btn("ENVIAR REDAÇÃO PELO WHATSAPP →", () => window.open(this.props.whatsappRedacao, "_blank", "noopener,noreferrer"), { background: "#1fa565", boxShadow: "0 6px 18px rgba(31,165,101,.35)" })
      ),
      this.props.dados.baseTemasUrl
        ? h(
            "div",
            { key: "cta2", style: { margin: "10px 18px 0" } },
            this.ui().ghost("BASE DE TEMAS →", () => this.openBrowser("Base de Temas · Redação", this.props.dados.baseTemasUrl as string, "redacao"))
          )
        : null
    ]);
  }

  scrTutorial() {
    const { C, h, I, btn } = this.ui();
    const S = this.state;
    const slides = [
      { ic: "plane", t: "Instale o aplicativo", d: 'A Decola Med funciona como aplicativo no seu celular. Toque em "Instalar" e leve a plataforma na palma da mão — rápido e sem ocupar espaço.', cta: "INSTALAR APLICATIVO" },
      { ic: "target", t: "Missão do Dia", d: "Cada dia tem uma única sequência de estudos na aba Hoje: siga os passos na ordem e conclua a missão. O Mapa de Voo completo fica na versão para computador." },
      { ic: "calendar", t: "Cronograma e Missões", d: "Todos seguem o Cronograma Base com aulas, atividades, resumos, revisões, simulados e redações. No plano Voo Guiado, o algoritmo adapta tudo a você." },
      { ic: "compass", t: "Questões inteligentes", d: "Errou? O Copiloto identifica o assunto na matriz, registra no seu Raio-X e monta uma revisão com 5 novas questões + materiais recomendados." },
      { ic: "file", t: "Simulados de Voo", d: "Provas com timer e nota calculada pelos pesos oficiais das disciplinas. Sem redação? Mostramos a nota considerando apenas a prova objetiva." },
      { ic: "bot", t: "Conte com o Copiloto", d: 'Seu assistente IA recomenda aulas, flashcards, mapas mentais e PDFs conforme seu desempenho. Qualquer erro, use o botão "Comunicar erro". Bom voo!' }
    ];
    const sl = slides[S.tutStep];
    const last = S.tutStep === slides.length - 1;
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "top", style: { display: "flex", alignItems: "center", padding: "20px 20px 0" } }, [
        h("img", { key: "l", src: "/assets/logo.png", style: { height: 24 } }),
        h("div", { key: "sp", style: { flex: 1 } }),
        h("div", { key: "skip", onClick: () => this.nav("mapa"), style: { fontSize: 12, fontWeight: 800, color: C.faint, cursor: "pointer" } }, "Pular")
      ]),
      h(
        "div",
        { key: "p", style: { display: "flex", gap: 5, padding: "14px 22px 0" } },
        slides.map((_, i) => h("div", { key: i, style: { flex: 1, height: 4, borderRadius: 99, background: i <= S.tutStep ? C.orange : C.chip } }))
      ),
      h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" } }, [
        this.mascoteBadge(sl.ic, 150, { anim: "dm-pop .45s ease both" }),
        h("div", { key: "t", style: { fontSize: 22, fontWeight: 900, marginTop: 18 } }, sl.t),
        h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 10, lineHeight: 1.65 } }, sl.d),
        sl.cta && S.pwaInstalada
          ? h("div", { key: "cta-ok", style: { marginTop: 14, display: "inline-flex", gap: 8, alignItems: "center", color: "#1fa565", fontSize: 12.5, fontWeight: 800 } }, [I("check", 15, "#1fa565"), "Aplicativo já instalado"])
          : sl.cta
          ? h(
              "div",
              {
                key: "cta",
                onClick: () => this.instalarApp(),
                style: { marginTop: 14, display: "inline-flex", gap: 8, alignItems: "center", border: "1.5px solid " + C.orange, color: C.orange, borderRadius: 12, padding: "11px 18px", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }
              },
              [I("plane", 15, C.orange), sl.cta]
            )
          : null,
        sl.cta && S.mostrarInstrucoesPWA && !S.pwaInstalada
          ? h(
              "div",
              { key: "instr", style: { marginTop: 14, padding: "12px 14px", borderRadius: 13, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.65, textAlign: "left" } },
              'Seu navegador não oferece instalação automática aqui. No iPhone/iPad: toque no ícone de compartilhar do Safari e escolha "Adicionar à Tela de Início". No Android/Chrome: abra o menu (⋮) e toque em "Instalar aplicativo" ou "Adicionar à tela inicial".'
            )
          : null
      ]),
      h("div", { key: "f", style: { padding: "0 24px 46px", display: "flex", gap: 10 } }, [
        S.tutStep > 0 ? this.ui().ghost("Voltar", () => this.setState({ tutStep: S.tutStep - 1 }), { flex: 1 }) : null,
        btn(last ? "COMEÇAR A VOAR →" : "PRÓXIMO →", () => (last ? this.nav("mapa") : this.setState({ tutStep: S.tutStep + 1 })), { flex: 2 })
      ])
    ]);
  }

  scrSenha() {
    const { C, h, btn } = this.ui();
    const S = this.state;
    const inp = (value: string, onChange: any, ph: string, key: string) =>
      h("input", { key, type: "password", value, onChange, placeholder: ph, style: { width: "100%", boxSizing: "border-box", background: C.card, border: "1.5px solid " + C.line, borderRadius: 14, padding: "14px 15px", fontSize: 13, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit", marginBottom: 10 } });
    const salvar = async () => {
      if (!S.senhaNova || S.senhaNova.length < 6) {
        this.setState({ senhaErro: "A nova senha precisa ter pelo menos 6 caracteres." });
        return;
      }
      if (S.senhaNova !== S.senhaConfirma) {
        this.setState({ senhaErro: "As senhas não coincidem." });
        return;
      }
      this.setState({ senhaSalvando: true, senhaErro: null });
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: S.senhaNova });
      if (error) {
        console.error("Falha ao alterar senha:", error);
        this.setState({ senhaSalvando: false, senhaErro: this.traduzirErroSenha(error.message) });
        return;
      }
      this.setState({ senhaSalvando: false, senhaSalva: true, senhaNova: "", senhaConfirma: "" });
    };
    return this.screenWrap([
      this.head("Alterar senha", { back: "config" }),
      h("div", { key: "f", style: { margin: "8px 18px 0" } }, [
        inp(S.senhaNova || "", (e: any) => this.setState({ senhaNova: e.target.value, senhaErro: null, senhaSalva: false }), "Nova senha", "a"),
        inp(S.senhaConfirma || "", (e: any) => this.setState({ senhaConfirma: e.target.value, senhaErro: null, senhaSalva: false }), "Confirmar nova senha", "b"),
        S.senhaErro ? h("div", { key: "err", style: { color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 8 } }, S.senhaErro) : null,
        S.senhaSalva ? h("div", { key: "ok", style: { color: C.green, fontSize: 12, fontWeight: 700, marginBottom: 8 } }, "Senha atualizada com sucesso!") : null,
        btn(S.senhaSalvando ? "Salvando..." : "SALVAR NOVA SENHA", salvar, { marginTop: 6, opacity: S.senhaSalvando ? 0.6 : 1 })
      ])
    ]);
  }

  app() {
    const S = this.state;
    if (S.simView === "run") return this.scrSimRun();
    if (S.simView === "result") return this.scrSimResult();
    if (S.simView === "gabarito") return this.scrGabarito();
    const map: Record<string, () => any> = {
      mapa: () => this.scrMapa(),
      painel: () => this.scrPainel(),
      missoes: () => this.scrMissoes(),
      estudos: () => this.scrEstudos(),
      questoes: () => this.scrQuestoes(),
      simulados: () => this.scrSimulados(),
      copiloto: () => this.scrCopiloto(),
      ranking: () => this.scrRanking(),
      conquistas: () => this.scrConquistas(),
      perfil: () => this.scrPerfil(),
      config: () => this.scrConfig(),
      briefing: () => this.scrBriefing(),
      plano: () => this.scrPlano(),
      browser: () => this.scrBrowser(),
      player: () => this.scrPlayer(),
      conteudo: () => this.scrConteudo(),
      senha: () => this.scrSenha(),
      flashcards: () => this.scrFlashcards(),
      "flashcards-select": () => this.scrFlashcardsSelecao(),
      redacao: () => this.scrRedacao(),
      tutorial: () => this.scrTutorial(),
      anotacoes: () => this.scrAnotacoes()
    };
    const fn = map[S.screen] || map.mapa;
    return fn();
  }

  render() {
    // React.Fragment com key explícita na tela: sem isso, o array de filhos
    // (tela + overlay de onboarding) dispara o aviso de "key" ausente.
    return React.createElement("div", { className: styles.shell }, [
      React.createElement(React.Fragment, { key: "tela" }, this.app()),
      this.state.mostrarOnboarding
        ? React.createElement(OnboardingCarousel, { key: "onboarding", onFinish: () => this.setState({ mostrarOnboarding: false }) })
        : null
    ]);
  }
}

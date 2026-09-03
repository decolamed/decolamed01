import Anthropic from "@anthropic-ai/sdk";
import { ErroDeMotor, type Acao, type Conversa, type Ferramenta, type Resposta } from "./tipos";

// ===========================================================================
// Motor Claude — laço de ferramentas escrito à mão.
//
// O SDK tem um `tool_runner` que faz esse laço sozinho, e mesmo assim o laço
// aqui é manual: o `tool_runner` é beta e não expõe o que precisamos entre uma
// volta e outra — o rastro das ferramentas para mostrar ao aluno e o corte
// quando o modelo passa do teto de passos.
// ===========================================================================

const MODELO = "claude-opus-5";
const MAX_TOKENS = 16_000;
const MAX_PASSOS = 8;

let clienteMemorizado: Anthropic | null = null;

function cliente(): Anthropic {
  const chave = process.env.ANTHROPIC_API_KEY?.trim();
  if (!chave) {
    throw new ErroDeMotor(
      "claude",
      "O motor Claude não está configurado neste servidor (falta ANTHROPIC_API_KEY)."
    );
  }
  if (!clienteMemorizado) clienteMemorizado = new Anthropic({ apiKey: chave });
  return clienteMemorizado;
}

export function claudeDisponivel(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function declarar(ferramentas: Ferramenta[]): Anthropic.Beta.BetaToolUnion[] {
  return ferramentas.map((f) => ({
    name: f.nome,
    description: f.descricao,
    input_schema: f.esquema as Anthropic.Beta.BetaTool["input_schema"]
  }));
}

function textoDe(blocos: Anthropic.Beta.BetaContentBlock[]): string {
  return blocos
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export async function conversarComClaude(conversa: Conversa): Promise<Resposta> {
  const api = cliente();
  const porNome = new Map(conversa.ferramentas.map((f) => [f.nome, f]));
  const maxPassos = conversa.maxPassos ?? MAX_PASSOS;
  const acoes: Acao[] = [];

  const mensagens: Anthropic.Beta.BetaMessageParam[] = conversa.turnos.map((t) => ({
    role: t.papel === "usuario" ? "user" : "assistant",
    content: t.texto
  }));

  for (let passo = 0; passo <= maxPassos; passo++) {
    // No último passo as ferramentas continuam declaradas mas ficam proibidas.
    // Tirá-las da lista seria pior: o histórico já tem `tool_use` apontando
    // para elas, e a API recusa um pedido que referencia ferramenta ausente.
    const ultimoPasso = passo === maxPassos;

    let resposta: Anthropic.Beta.BetaMessage;
    try {
      resposta = await api.beta.messages.create({
        model: MODELO,
        max_tokens: conversa.maxTokens ?? MAX_TOKENS,
        system: conversa.sistema,
        messages: mensagens,
        tools: declarar(conversa.ferramentas),
        tool_choice: ultimoPasso ? { type: "none" } : { type: "auto" },
        ...(conversa.esforco ? { output_config: { effort: conversa.esforco } } : {}),
        // Conteúdo médico esbarra em classificador de segurança com alguma
        // frequência (dose de medicamento, quadro psiquiátrico, obstetrícia).
        // Sem isto, uma recusa deixa o aluno na mão no meio da tutoria; com
        // isto, a própria API repete o pedido num modelo alternativo dentro da
        // mesma chamada.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default"
      });
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) {
        throw new ErroDeMotor("claude", "A chave da Anthropic foi recusada.", e);
      }
      if (e instanceof Anthropic.RateLimitError) {
        throw new ErroDeMotor("claude", "O Claude está sobrecarregado agora. Tente de novo em instantes.", e);
      }
      throw new ErroDeMotor("claude", "Não consegui falar com o Claude agora.", e);
    }

    if (resposta.stop_reason === "refusal") {
      throw new ErroDeMotor(
        "claude",
        "O modelo recusou este pedido. Se for um caso clínico legítimo, reescreva com os termos técnicos e tente de novo."
      );
    }

    const pedidos = resposta.content.filter(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use"
    );

    if (pedidos.length === 0) {
      return { texto: textoDe(resposta.content), acoes, motor: "claude" };
    }

    // O conteúdo vai INTEIRO de volta, inclusive os blocos de raciocínio. Ficar
    // só com o texto quebraria a continuidade que o modelo espera ao receber o
    // resultado das ferramentas.
    mensagens.push({ role: "assistant", content: resposta.content });

    // Em paralelo: quando o modelo pede duas buscas de uma vez, elas não
    // dependem uma da outra e rodar em série só dobraria a espera do aluno.
    const resultados = await Promise.all(
      pedidos.map(async (pedido): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
        const ferramenta = porNome.get(pedido.name);
        if (!ferramenta) {
          acoes.push({ ferramenta: pedido.name, descricao: `Ferramenta desconhecida: ${pedido.name}`, erro: true });
          return { type: "tool_result", tool_use_id: pedido.id, content: `A ferramenta ${pedido.name} não existe.`, is_error: true };
        }

        try {
          const r = await ferramenta.executar((pedido.input ?? {}) as Record<string, unknown>);
          acoes.push({ ferramenta: pedido.name, descricao: r.paraTela, erro: Boolean(r.erro) });
          return { type: "tool_result", tool_use_id: pedido.id, content: r.paraModelo, is_error: Boolean(r.erro) };
        } catch (e) {
          // Uma ferramenta que explode NÃO derruba o turno: o erro volta como
          // resultado para que o modelo tente outro caminho e explique ao
          // aluno o que faltou, em vez de a tela mostrar "erro" e mais nada.
          const motivo = e instanceof Error ? e.message : "falha desconhecida";
          acoes.push({ ferramenta: pedido.name, descricao: motivo, erro: true });
          return { type: "tool_result", tool_use_id: pedido.id, content: `Falhou: ${motivo}`, is_error: true };
        }
      })
    );

    // Todos os resultados numa mensagem só. Separá-los em várias ensina o
    // modelo a parar de pedir ferramentas em paralelo.
    mensagens.push({ role: "user", content: resultados });
  }

  // Inalcançável: `ultimoPasso` proíbe ferramenta e o `return` acima dispara.
  // Fica como rede: se um dia a condição mudar, o erro é explícito.
  throw new ErroDeMotor("claude", "A conversa passou do limite de passos sem chegar a uma resposta.");
}

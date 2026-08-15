# E-mails de autenticação — Decola MED

Templates prontos para colar no painel do Supabase, com a identidade visual da
plataforma (navy `#01395E`, laranja `#F36C21`, logo branca sobre a faixa navy).

| Arquivo | Template no painel | Assunto sugerido |
|---|---|---|
| `recuperacao-de-senha.html` | **Reset Password** | `Redefinição de senha \| Decola MED` |
| `convite-do-aluno.html` | **Invite user** | `Seu acesso à Decola MED está pronto` |

---

## Por que só dois templates

O Supabase oferece seis templates, mas **neste projeto só dois chegam a ser
disparados**. Verificado no código, não presumido:

| Template | Dispara? | Por quê |
|---|---|---|
| **Reset Password** | **sim** | `resetPasswordForEmail` em `components/auth/recuperar-senha-form.tsx:24` e em quatro pontos de `admin/usuarios/actions.ts` |
| **Invite user** | **sim** | `inviteUserByEmail` no webhook do Asaas (`api/asaas/webhook/route.ts:89`) e em três pontos do painel |
| Confirm signup | não | **não existe `signUp` em lugar nenhum do código.** Toda conta nasce por convite |
| Magic Link | não | não há `signInWithOtp` |
| Change Email Address | não | a troca usa `admin.updateUserById` com `email_confirm: true` (`admin/usuarios/[id]/actions.ts:189`), que já marca o e-mail como confirmado e não dispara mensagem |
| Reauthentication | não | não há `reauthenticate` |

O **Invite user** é o mais importante dos dois: é o primeiro contato de quem
acabou de pagar. Por isso o texto dele é de boas-vindas, e não de "confirme
seu e-mail".

---

## Como instalar

1. Abra **Authentication → Emails → Templates**
   (`https://supabase.com/dashboard/project/cdoukrnmdsrlcbxusojm/auth/templates`).
2. Escolha o template, troque o **Subject** pelo assunto da tabela acima.
3. Cole o conteúdo do arquivo `.html` correspondente no corpo da mensagem.
4. Salve e repita para o outro.

### Antes de salvar, confira a Site URL

Os dois templates carregam a logo de `{{ .SiteURL }}/assets/logo.png`. O
Supabase substitui `{{ .SiteURL }}` pela **Site URL** configurada em
**Authentication → URL Configuration**.

* Se a Site URL apontar para o domínio de produção, a logo aparece.
* Se ainda estiver em `http://localhost:3000`, **a logo não vai carregar em
  e-mail nenhum** — e, pior, os links de ação também apontariam para localhost.

Deixei a logo assim de propósito para não chumbar um domínio no template. O
texto alternativo (`alt="Decola MED"`) é branco e negrito, então mesmo com as
imagens bloqueadas — o padrão em boa parte dos clientes de e-mail — a faixa
navy continua mostrando o nome da marca.

### Sobre a logo

Os arquivos disponíveis (`logo.png`, `logo-decola-med.png`) são **brancos
sobre fundo transparente e quadrados**, com bastante respiro em volta do
símbolo. Por isso ela vive dentro da faixa navy: sobre fundo branco ficaria
invisível. Usei `logo.png` (900×900, 67 kB) em vez de `logo-decola-med.png`
(2000×2000, 180 kB) por causa do peso — e-mail pesado cai em spam com mais
facilidade.

Se um dia existir uma versão horizontal (algo como 600×160, branca sobre
transparente), basta trocar o nome do arquivo e o `width`/`height` nas duas
linhas de `<img>`.

### Sobre o prazo do link

O texto diz "este link é de uso único e expira depois de um tempo", sem citar
um prazo. Isso é deliberado: o prazo real está em **Authentication →
Providers → Email → Email OTP Expiration**, e escrever um número que não
corresponda ao configurado seria pior do que não dizer nada. Se você fixar o
valor no painel, vale trocar a frase por algo como "expira em 1 hora".

---

## Remetente e SMTP — leia antes de testar

### O que está configurado hoje

Não consigo ler a configuração de SMTP daqui: o servidor MCP do Supabase
disponível nesta sessão **expõe apenas banco, migrações, edge functions,
advisors, logs e documentação — nenhuma ferramenta de Auth**. Então o
diagnóstico abaixo é por eliminação, e você precisa confirmar em
**Authentication → Emails → SMTP Settings**
(`https://supabase.com/dashboard/project/cdoukrnmdsrlcbxusojm/auth/smtp`).

**Se o SMTP ainda for o padrão do Supabase, há um problema sério e imediato.**
A documentação oficial é explícita:

> *"Send messages only to pre-authorized addresses. Unless you configure a
> custom SMTP server for your project, Supabase Auth will refuse to deliver
> messages to addresses that are not part of the project's team."*

Ou seja: com o SMTP padrão, **e-mail de aluno simplesmente não é entregue** —
só chega a endereços que sejam membros da organização no Supabase. Some-se a
isso um limite baixo de mensagens por hora e disponibilidade "best-effort",
que a própria Supabase declara não ser para produção.

Como o convite do aluno é disparado pelo **webhook do Asaas logo após o
pagamento**, isso significa que um aluno que pagou pode não receber o acesso.
Vale checar isso antes de qualquer ajuste estético.

### 1. Qual serviço recomendo

**Resend.** É o de configuração mais direta para este caso, a documentação do
Supabase tem um guia próprio para ele, e o painel mostra claramente se o
domínio está verificado.

Alternativas legítimas: **Brevo** (interface em português, cota diária
generosa), **Amazon SES** (mais barato em escala, porém exige sair do sandbox
por solicitação) e **Postmark** (melhor entregabilidade transacional, pago).

### 2. Existe opção gratuita

Sim — Resend e Brevo têm plano gratuito suficiente para o volume de uma
plataforma começando. **Confirme os limites atuais na página do provedor**:
essas cotas mudam com frequência e não quero registrar aqui um número que
envelheça.

### 3. Configurações necessárias

No provedor: criar conta, adicionar o domínio, publicar os registros DNS,
esperar a verificação e gerar as credenciais SMTP.

No Supabase, em **Authentication → Emails → SMTP Settings**:

| Campo | Valor |
|---|---|
| Sender email | `noreply@seudominio` (tem que ser do domínio verificado) |
| Sender name | `Decola MED` |
| Host | o host SMTP do provedor |
| Port | `587` (STARTTLS) ou `465` (SSL) |
| Username / Password | as credenciais geradas pelo provedor |

### 4. Precisa de DNS

**Sim, e não tem como fugir disso.** Para enviar como `@seudominio` você
publica no DNS:

* **SPF** (TXT) — autoriza o provedor a enviar em nome do domínio;
* **DKIM** (CNAME ou TXT) — assina as mensagens;
* **DMARC** (TXT) — recomendado; define o que fazer com quem falsifica o
  domínio.

Sem SPF e DKIM, Gmail e Outlook mandam para spam ou recusam.

### 5. Custo

O envio em si cabe no plano gratuito no começo. O que custa é **o domínio**,
se você ainda não tiver um. Nenhum dos dois serviços exige cartão para o plano
gratuito.

### 6. O que muda no Supabase

Só os campos da tabela do item 3, mais o **Site URL** em URL Configuration se
ainda estiver em localhost. **Nada muda no código do app** — nenhuma variável
de ambiente nova, nenhum arquivo alterado. O `redirectTo` já é montado a
partir de `NEXT_PUBLIC_SITE_URL`, que já existe.

---

## Como testar

1. **Verifique a Site URL** em URL Configuration — sem isso o teste não vale.
2. Abra `/recuperar-senha` no site e peça a redefinição para um endereço seu.
   - Com SMTP padrão, use um e-mail **que seja membro da organização no
     Supabase** — qualquer outro não recebe.
3. Confira no e-mail: faixa navy com a logo, botão laranja arredondado, texto
   em português, e o remetente.
4. Se não chegar, o log diz o motivo:
   `https://supabase.com/dashboard/project/cdoukrnmdsrlcbxusojm/logs/auth-logs`
5. Teste no celular também — o layout tem media query em 620px, que empilha o
   conteúdo e faz o botão ocupar a largura toda.

Para testar o convite sem cobrar ninguém: no painel, `/admin/usuarios`, use o
envio de acesso para um endereço seu.

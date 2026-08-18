# Modelos de e-mail da autenticação

Estes são os e-mails que o **Supabase Auth** envia — agora pelo Resend, via
Custom SMTP. Eles **não** são enviados pelo código desta aplicação: o Supabase
os monta a partir dos modelos cadastrados no painel. Por isso os arquivos aqui
são a *fonte* versionada, e o painel é a *cópia em produção*.

> Se você editar um modelo no painel, traga a alteração para cá também. Caso
> contrário o próximo `git clone` não terá o e-mail que os alunos recebem.

## Onde colar

**Supabase → Authentication → Emails → Templates**

| Arquivo | Modelo no painel | Assunto sugerido |
|---|---|---|
| `convite.html` | **Invite user** | `Seu acesso à Decola Med chegou ✈️` |
| `redefinir-senha.html` | **Reset Password** | `Redefinir sua senha — Decola Med` |

Cole o conteúdo inteiro do arquivo no campo **Message body (HTML)** e preencha
o **Subject** com o texto da tabela.

## Por que só esses dois

São os únicos fluxos de e-mail que a plataforma realmente dispara:

- **Invite user** — `inviteUserByEmail()`, chamado em três lugares:
  - `src/app/api/asaas/webhook/route.ts` (aluno pagou, conta criada)
  - `src/app/(admin)/admin/usuarios/actions.ts` (cadastro manual no admin)
  - o botão "Enviar acesso" na página do aluno
- **Reset Password** — `resetPasswordForEmail()`, chamado em:
  - `src/components/auth/recuperar-senha-form.tsx` (tela "Esqueci minha senha")
  - `src/app/(admin)/admin/usuarios/actions.ts` (botão no admin)

Os demais modelos do painel (Confirm signup, Magic Link, Change Email Address)
ficam sem uso: a plataforma nunca cadastra ninguém por auto-registro, e a troca
de e-mail pelo admin usa `email_confirm: true`, que não dispara mensagem.

## Variáveis usadas

| Variável | O que é |
|---|---|
| `{{ .ConfirmationURL }}` | O link de ação. Já sai apontando para `/auth/callback?next=/redefinir-senha`, que é o `redirectTo` definido no código. |
| `{{ .Email }}` | Endereço de destino. |
| `{{ .Data.nome }}` | Nome do aluno, vindo do `data: { nome }` passado no convite. |

⚠️ **O `{{ if .Data.nome }}` do `convite.html` precisa de um teste.** Os modelos
do Supabase usam `text/template` do Go, que suporta condicionais — mas mande um
e-mail de teste antes de confiar. Se a saudação vier quebrada, troque a linha do
`<h1>` por um texto fixo:

```html
Bem-vindo! Seu embarque está liberado.
```

## Decisões de implementação

**Tabelas e estilos inline, não CSS moderno.** O Gmail remove `<style>` do
`<head>` e o Outlook (motor do Word) não entende flexbox nem grid. Um layout
que fica lindo no navegador pode chegar como uma coluna de texto solta na caixa
de entrada de metade dos alunos.

**Wordmark em texto, não imagem.** A maioria dos clientes bloqueia imagem
remota por padrão — o cabeçalho apareceria vazio até a pessoa clicar em "exibir
imagens". Além disso, `public/assets/logo-decola-med.png` é um quadrado de
1920px com muita margem vazia; num cabeçalho de 600px o wordmark ficaria
minúsculo. Se quiser trocar por imagem depois, exporte uma versão recortada com
cerca de 400×100px e hospede em `public/assets/`.

**O link cru aparece embaixo do botão.** Clientes corporativos às vezes removem
botões, e sem o endereço visível o e-mail vira um beco sem saída.

**Nada de prazo em horas no texto.** O tempo de validade do link é
configurável no Supabase e mudá-lo lá não deveria tornar o e-mail mentiroso —
por isso o texto diz "validade limitada" e explica como pedir outro.

## Como testar

1. Cole os dois modelos e salve.
2. **Authentication → Users → Invite user** com um e-mail seu de verdade.
3. Confira em **Resend → Emails** se o envio saiu (e o status de entrega).
4. Abra em pelo menos um webmail (Gmail) e um celular — é onde os alunos leem.
5. Clique no botão e confirme que cai em `/redefinir-senha`.

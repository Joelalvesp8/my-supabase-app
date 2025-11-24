# Guia de Setup - 3JMD WhatsApp CRM

Este guia irá ajudá-lo a configurar completamente o sistema de CRM WhatsApp.

## Pré-requisitos

- Conta no Supabase (gratuita) - [https://supabase.com](https://supabase.com)
- Token da API UAZAPI (3JMD Solutions)
- Node.js 18+ instalado

## Passo 1: Configurar Supabase

### 1.1 Criar Projeto

1. Acesse [https://supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha:
   - Nome do projeto: `3jmd-whatsapp-crm`
   - Senha do banco de dados (guarde com segurança)
   - Região: escolha a mais próxima
4. Aguarde a criação (1-2 minutos)

### 1.2 Executar Migrations SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie TODO o conteúdo do arquivo `supabase/migrations/20250123000001_initial_schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a execução (deve mostrar "Success")

### 1.3 Configurar Storage

1. No painel do Supabase, vá em **Storage**
2. Clique em "Create a new bucket"
3. Nome: `whatsapp-media`
4. **Importante**: Marque como **Public bucket** (para permitir acesso às mídias)
5. Clique em "Create bucket"

### 1.4 Configurar Realtime

1. Vá em **Database** > **Replication**
2. Ative replicação para as tabelas:
   - `conversations`
   - `messages`
   - `contacts`
   - `agents`

### 1.5 Obter Credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Guarde esses valores para o próximo passo

## Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

2. Edite `.env.local` e adicione suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
UAZAPI_TOKEN=seu-token-uazapi-aqui
```

## Passo 3: Instalar Dependências e Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Passo 4: Criar Primeira Conta

1. Acesse `http://localhost:3000/signup`
2. Crie sua conta com email e senha
3. Verifique seu email (Supabase envia automaticamente)
4. Faça login

## Passo 5: Configurar Webhook na UAZAPI

Para que o sistema receba mensagens, você precisa configurar o webhook na plataforma UAZAPI:

### 5.1 Deploy na Vercel (recomendado)

```bash
# Fazer commit das alterações
git add .
git commit -m "Setup complete"
git push origin main
```

Então:

1. Acesse [https://vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `UAZAPI_TOKEN`
4. Faça o deploy
5. Copie a URL gerada (ex: `https://seu-app.vercel.app`)

### 5.2 Configurar o Webhook

1. Acesse o painel da UAZAPI
2. Vá em configurações de webhook
3. Configure:
   - **URL do Webhook**: `https://seu-app.vercel.app/api/webhook/messages`
   - **Método**: POST
   - **Eventos**: Marque "Receber mensagens"

### 5.3 Testar o Webhook

1. Envie uma mensagem para o número WhatsApp conectado
2. Acesse seu sistema em `https://seu-app.vercel.app/conversations`
3. A mensagem deve aparecer em tempo real

## Passo 6: Verificar Funcionamento

### 6.1 Testar Recebimento de Mensagens

1. Envie mensagens do WhatsApp para o número conectado
2. Verifique se aparecem na interface

### 6.2 Testar Envio de Mensagens

1. Selecione uma conversa
2. Digite uma mensagem e envie
3. Verifique se foi entregue no WhatsApp

### 6.3 Testar Envio de Mídia

1. Clique no botão "+"
2. Selecione um arquivo
3. Envie
4. Verifique se foi entregue com a mídia

## Estrutura do Banco de Dados

O sistema usa as seguintes tabelas:

- **contacts**: Armazena contatos do WhatsApp
- **conversations**: Uma conversa por contato
- **messages**: Todas as mensagens enviadas e recebidas
- **agents**: Agentes humanos e IA
- **message_events**: Log de eventos de mensagens

## Funcionalidades Implementadas

✅ Autenticação com Supabase
✅ Webhook para receber mensagens
✅ Interface de conversas estilo WhatsApp Web
✅ Envio de mensagens de texto
✅ Envio de mídias (imagem, áudio, vídeo, documento)
✅ Upload automático de mídias para Supabase Storage
✅ Tempo real com Supabase Realtime
✅ Status de mensagens (enviado, entregue, lido)

## Funcionalidades em Desenvolvimento

🚧 Sistema de fila de atendimento
🚧 Agentes de IA (respostas automáticas)
🚧 Painel administrativo com estatísticas
🚧 Gerenciamento de agentes
🚧 Transferência de conversas entre agentes
🚧 Relatórios e analytics

## Troubleshooting

### Mensagens não aparecem

1. Verifique se executou as migrations SQL
2. Verifique se configurou o webhook corretamente
3. Verifique os logs em **Vercel** > **Functions** > **Logs**

### Erro ao enviar mensagens

1. Verifique se o token UAZAPI está correto
2. Verifique se o número está no formato correto
3. Veja os logs no console do navegador

### Erro ao fazer upload de mídia

1. Verifique se criou o bucket `whatsapp-media`
2. Verifique se o bucket está marcado como **public**
3. Verifique as policies de acesso no Supabase

### Tempo real não funciona

1. Vá em **Database** > **Replication**
2. Ative replicação para todas as tabelas
3. Recarregue a página

## Próximos Passos

Agora que o sistema está funcionando, você pode:

1. Personalizar a interface com sua marca
2. Adicionar mais funcionalidades
3. Implementar o sistema de IA
4. Criar relatórios personalizados
5. Integrar com outros sistemas (CRM, ERP, etc.)

## Suporte

Se encontrar problemas:

1. Verifique este guia novamente
2. Consulte a documentação do Supabase: [https://supabase.com/docs](https://supabase.com/docs)
3. Consulte a documentação do Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
4. Verifique os logs no Vercel e no Supabase

## Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação UAZAPI](https://ia3jmdsolutions.uazapi.com/docs)
- [Documentação Vercel](https://vercel.com/docs)

---

**3JMD Solutions - WhatsApp CRM System**

# Sistema de Autenticação com Next.js e Supabase

Sistema completo de autenticação construído com Next.js 15, Supabase, TypeScript e Tailwind CSS, pronto para deploy na Vercel.

## Funcionalidades

- Autenticação com email e senha
- Login social com Google OAuth
- Rotas protegidas com middleware
- Dashboard personalizado
- Design responsivo com Tailwind CSS
- TypeScript para segurança de tipos

## Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Conta no GitHub (gratuita)
- Conta na Vercel (gratuita)

## Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha os dados:
   - Nome do projeto
   - Senha do banco de dados (guarde em um lugar seguro)
   - Região (escolha a mais próxima)
6. Aguarde a criação do projeto (1-2 minutos)

### 2. Obter as credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API** no menu lateral
3. Copie as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configurar autenticação

1. No painel do Supabase, vá em **Authentication**
2. Clique em **Providers**
3. Configure os provedores desejados:

#### Email (já vem habilitado por padrão)
- Ative "Enable Email Signup"
- Configure "Email Templates" se desejar personalizar

#### Google OAuth (opcional)
1. Clique em **Google**
2. Ative "Enable Sign in with Google"
3. Você precisará criar credenciais OAuth no Google Cloud Console:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "OAuth client ID"
   - Configure o consentimento OAuth se solicitado
   - Tipo de aplicativo: "Web application"
   - Nome: "Meu Sistema Supabase"
   - Authorized redirect URIs: `https://[SEU-PROJETO].supabase.co/auth/v1/callback`
   - Copie o Client ID e Client Secret
4. Cole as credenciais no Supabase
5. Clique em "Save"

### 4. Configurar URL de callback

1. Em **Authentication** > **URL Configuration**
2. Adicione suas URLs permitidas:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://[SEU-DOMINIO-VERCEL]/auth/callback` (produção)

## Instalação Local

### 1. Clone o repositório

```bash
git clone [URL-DO-SEU-REPOSITORIO]
cd my-supabase-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e adicione suas credenciais:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Deploy na Vercel

### 1. Prepare o repositório

```bash
# Adicione todas as alterações
git add .

# Faça o commit
git commit -m "Setup completo do sistema"

# Envie para o GitHub
git push origin main
```

### 2. Deploy na Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:
   - Clique em "Environment Variables"
   - Adicione:
     - `NEXT_PUBLIC_SUPABASE_URL`: [sua URL do Supabase]
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [sua chave anon]
5. Clique em "Deploy"
6. Aguarde o deploy (1-2 minutos)

### 3. Atualize as URLs no Supabase

Após o deploy, copie a URL da Vercel e:

1. Volte ao Supabase
2. Vá em **Authentication** > **URL Configuration**
3. Adicione a URL de callback da Vercel:
   - `https://[seu-dominio].vercel.app/auth/callback`
4. Se estiver usando Google OAuth, também atualize a URL autorizada no Google Cloud Console

## Estrutura do Projeto

```
my-supabase-app/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Callback OAuth
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard protegido
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── signup/
│   │   └── page.tsx              # Página de cadastro
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página inicial
├── components/
│   └── auth/
│       ├── LoginForm.tsx         # Formulário de login
│       └── SignupForm.tsx        # Formulário de cadastro
├── lib/
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (browser)
│       ├── server.ts             # Cliente Supabase (server)
│       └── middleware.ts         # Utilitários do middleware
├── middleware.ts                 # Middleware de autenticação
└── .env.local                    # Variáveis de ambiente (não commitado)
```

## Como Usar

### Criar uma conta

1. Acesse a página inicial
2. Clique em "Criar Conta"
3. Preencha email e senha
4. Verifique seu email e clique no link de confirmação
5. Faça login com suas credenciais

### Fazer login

1. Acesse a página de login
2. Digite email e senha OU clique em "Google" para login social
3. Você será redirecionado para o dashboard

### Acessar área protegida

- O dashboard está protegido e só pode ser acessado por usuários autenticados
- Se tentar acessar sem estar logado, será redirecionado para o login
- Se já estiver logado e tentar acessar /login ou /signup, será redirecionado para o dashboard

## Próximos Passos

Agora que seu sistema está funcionando, você pode:

1. Adicionar mais campos ao perfil do usuário
2. Criar tabelas no Supabase para armazenar dados
3. Implementar upload de arquivos com Supabase Storage
4. Adicionar mais páginas protegidas
5. Personalizar o design com Tailwind CSS
6. Adicionar mais provedores OAuth (GitHub, Facebook, etc.)

## Recursos Úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação da Vercel](https://vercel.com/docs)

## Suporte

Se encontrar problemas:

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que as URLs de callback estão configuradas no Supabase
3. Verifique os logs no console do navegador
4. Consulte a documentação do Supabase Auth

## Licença

MIT

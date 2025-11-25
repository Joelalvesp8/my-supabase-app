# Setup Rápido - 5 Minutos ⚡

## Passo 1: Executar SQL (2 minutos)

1. Abra: https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/sql/new
2. Copie TODO o conteúdo de `supabase/migrations/20250123000001_initial_schema.sql`
3. Cole no editor SQL
4. Clique em "Run" (canto inferior direito)
5. Aguarde aparecer "Success! No rows returned"

## Passo 2: Criar Storage Bucket (1 minuto)

1. Abra: https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/storage/buckets
2. Clique em "Create a new bucket"
3. Nome: `whatsapp-media`
4. **IMPORTANTE**: Marque "Public bucket" ✅
5. Clique em "Create bucket"

## Passo 3: Ativar Realtime (1 minuto)

1. Abra: https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/database/replication
2. Encontre e ative as seguintes tabelas:
   - ✅ contacts
   - ✅ conversations
   - ✅ messages
   - ✅ agents

## Passo 4: Atualizar .env.local (1 minuto)

Você precisa de 3 valores:

1. **ANON_KEY**: Vá em https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/settings/api
   - Copie a chave "anon public"

2. **UAZAPI_TOKEN**: Seu token da API UAZAPI

3. Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gxvhuydejklijreiqmut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-aqui-a-anon-key
UAZAPI_TOKEN=cole-aqui-o-token-uazapi
```

## Passo 5: Testar! 🚀

```bash
npm run dev
```

Acesse: http://localhost:3000

### Criar sua conta:
1. Vá em /signup
2. Crie sua conta
3. Verifique o email
4. Faça login
5. Acesse /conversations

---

## Próximo: Configurar Webhook

Depois do deploy na Vercel, configure o webhook na UAZAPI:

- URL: `https://seu-app.vercel.app/api/webhook/messages`
- Método: POST
- Eventos: ✅ Receber mensagens

---

✅ Pronto! Sistema funcionando!

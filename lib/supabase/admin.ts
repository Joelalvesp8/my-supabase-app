import { createClient } from '@supabase/supabase-js'

/**
 * Admin client usando service_role key
 * Usa este cliente apenas no servidor para operações administrativas
 * como webhooks que não têm autenticação de usuário
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

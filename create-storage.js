const SUPABASE_URL = 'https://gxvhuydejklijreiqmut.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dmh1eWRlamtsaWpyZWlxbXV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAwNDMzOSwiZXhwIjoyMDc5NTgwMzM5fQ.gUn0KpFwc5soXfsUhfeDInwtBC9uSiAyOqe4g9P5Ids';

async function createStorageBucket() {
  try {
    console.log('🪣 Criando storage bucket whatsapp-media...\n');

    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        id: 'whatsapp-media',
        name: 'whatsapp-media',
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: null, // Allow all types
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Storage bucket criado com sucesso!');
      console.log('   Nome: whatsapp-media');
      console.log('   Público: Sim');
      console.log('   Tamanho máximo: 50MB\n');
      return true;
    } else if (result.message && result.message.includes('already exists')) {
      console.log('✅ Storage bucket já existe (tudo certo!)\n');
      return true;
    } else {
      throw new Error(result.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('❌ Erro ao criar storage bucket:', error.message);
    console.log('\n📝 Crie manualmente:');
    console.log('1. Abra: https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/storage/buckets');
    console.log('2. Clique em "Create a new bucket"');
    console.log('3. Nome: whatsapp-media');
    console.log('4. Marque: Public bucket ✅');
    console.log('5. Clique em "Create bucket"\n');
    return false;
  }
}

createStorageBucket();

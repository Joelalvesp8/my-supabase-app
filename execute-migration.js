const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxvhuydejklijreiqmut.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dmh1eWRlamtsaWpyZWlxbXV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAwNDMzOSwiZXhwIjoyMDc5NTgwMzM5fQ.gUn0KpFwc5soXfsUhfeDInwtBC9uSiAyOqe4g9P5Ids';

async function executeMigration() {
  try {
    console.log('🚀 Executando migration SQL no Supabase...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250123000001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute via Management API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ Migration executada com sucesso!');
      return true;
    }

    // If that doesn't work, try alternative approach with pg-meta
    const response2 = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (response2.ok) {
      console.log('✅ Migration executada com sucesso!');
      return true;
    }

    throw new Error('Não foi possível executar via API');
  } catch (error) {
    console.log('\n⚠️  Não foi possível executar automaticamente via API.');
    console.log('Por favor, execute manualmente:\n');
    console.log('1. Abra: https://supabase.com/dashboard/project/gxvhuydejklijreiqmut/sql/new');
    console.log('2. Copie o conteúdo de: supabase/migrations/20250123000001_initial_schema.sql');
    console.log('3. Cole no SQL Editor e clique em "Run"\n');
    return false;
  }
}

executeMigration();

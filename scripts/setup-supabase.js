#!/usr/bin/env node

/**
 * Script to setup Supabase database and storage
 * This script will:
 * 1. Execute SQL migrations
 * 2. Create storage bucket
 * 3. Configure storage policies
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxvhuydejklijreiqmut.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dmh1eWRlamtsaWpyZWlxbXV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAwNDMzOSwiZXhwIjoyMDc5NTgwMzM5fQ.gUn0KpFwc5soXfsUhfeDInwtBC9uSiAyOqe4g9P5Ids';

async function executeSql(sql) {
  console.log('Executing SQL migration...');

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // Try alternative method using PostgREST
    const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!pgResponse.ok) {
      const error = await pgResponse.text();
      throw new Error(`Failed to execute SQL: ${error}`);
    }
  }

  console.log('✓ SQL migration executed successfully');
}

async function createStorageBucket() {
  console.log('Creating storage bucket...');

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
      allowed_mime_types: [
        'image/*',
        'audio/*',
        'video/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    if (result.message && result.message.includes('already exists')) {
      console.log('✓ Storage bucket already exists');
      return;
    }
    throw new Error(`Failed to create storage bucket: ${result.message}`);
  }

  console.log('✓ Storage bucket created successfully');
}

async function main() {
  try {
    console.log('🚀 Starting Supabase setup...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250123000001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await executeSql(sql);

    // Create storage bucket
    await createStorageBucket();

    console.log('\n✅ Supabase setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env.local with the credentials');
    console.log('2. Enable Realtime in Supabase Dashboard:');
    console.log('   - Go to Database > Replication');
    console.log('   - Enable replication for: contacts, conversations, messages, agents');
    console.log('3. Run: npm run dev');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📝 Manual setup instructions:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy the content of supabase/migrations/20250123000001_initial_schema.sql');
    console.log('3. Paste and run it in the SQL Editor');
    console.log('4. Go to Storage and create a public bucket called "whatsapp-media"');
    process.exit(1);
  }
}

main();

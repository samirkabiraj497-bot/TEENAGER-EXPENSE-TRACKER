const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const isConfigured = Boolean(
  env.supabaseUrl &&
  env.supabaseServiceRoleKey &&
  !env.supabaseUrl.includes('your-project') &&
  !env.supabaseServiceRoleKey.includes('your-supabase-service-role-key')
);

let supabase = null;

if (isConfigured) {
  try {
    supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ [TeenSpend] Supabase PostgreSQL client connected successfully.');
  } catch (err) {
    console.error('❌ [TeenSpend] Error initializing Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ [TeenSpend] Supabase credentials not set in .env. Using built-in local store so you can test right away!');
  console.log('👉 To connect live Supabase: Run schema.sql in Supabase SQL editor & update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
}

module.exports = {
  supabase,
  isConfigured: () => isConfigured
};

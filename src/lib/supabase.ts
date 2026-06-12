import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Handle empty/placeholder variables gracefully in client compilation
const isConfigured = supabaseUrl && !supabaseUrl.includes('your-project-ref') && supabaseAnonKey && !supabaseAnonKey.includes('your-anon-public-api-key');

if (!isConfigured && typeof window !== 'undefined') {
  console.warn(
    'Supabase credentials are not configured in .env.local! ' +
    'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

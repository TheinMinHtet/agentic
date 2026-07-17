const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn('Supabase environment variables missing. Using fallback config.');
  }
}

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
};

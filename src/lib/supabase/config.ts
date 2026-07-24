export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase is optional at build time: this project ships with resume-derived
 * fallback content (see lib/resume-data.ts) so `next build` and `next dev`
 * always succeed even before a Supabase project has been provisioned.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

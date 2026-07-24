import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/** Server Component / Route Handler / Server Action client. Returns null when Supabase isn't configured yet. */
export async function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component without a surrounding
          // Server Action/Route Handler — safe to ignore since the proxy
          // (middleware) refreshes the session on navigations.
        }
      },
    },
  });
}

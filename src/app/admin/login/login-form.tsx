"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { siteConfig } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }

    router.replace(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lock className="size-5" />
          </div>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
        </div>

        {!configured ? (
          <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            Supabase isn&apos;t connected yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then create an
            admin user in your Supabase project&apos;s Authentication tab.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-2 rounded-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

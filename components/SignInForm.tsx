"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Provider = "google" | "github";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.21 7.21 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.11.82 2.23v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

const PROVIDERS: { id: Provider; label: string; Icon: typeof GitHubIcon }[] = [
  { id: "google", label: "continue with google", Icon: GoogleIcon },
  { id: "github", label: "continue with github", Icon: GitHubIcon },
];

export default function SignInForm() {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  const signIn = async (provider: Provider) => {
    setPending(provider);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/register`,
      },
    });
    // On success the browser navigates away; only errors land back here.
    if (error) {
      setError("couldn't start sign-in — try again in a moment.");
      setPending(null);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          onClick={() => signIn(id)}
          disabled={pending !== null}
          variant="ghost"
          className="h-auto w-full cursor-pointer rounded-full border border-border px-8 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/5 disabled:opacity-60"
        >
          <Icon className="mr-1 size-4.5 shrink-0" />
          {pending === id ? "redirecting…" : label}
        </Button>
      ))}

      {error && (
        <p className="text-sm text-ring" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

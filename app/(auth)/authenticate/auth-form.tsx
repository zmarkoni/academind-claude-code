"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthFormProps {
  isSignUp: boolean;
}

export function AuthForm({ isSignUp }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error } = isSignUp
        ? await authClient.signUp.email({ email, password, name: email })
        : await authClient.signIn.email({ email, password });

      if (error) {
        setError(error.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Hard navigation clears Next.js's client-side router cache so the
      // root layout re-fetches its session and renders the logout button.
      window.location.assign("/dashboard");
    });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100";

  return (
    <main className="min-h-svh flex items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            NoteApp
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete={isSignUp ? "email" : "username"}
              required
              value={email}
              onChange={handleEmailChange}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              value={password}
              onChange={handlePasswordChange}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              id="form-error"
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link
                href="?mode=signin"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="?mode=signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

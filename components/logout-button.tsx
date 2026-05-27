"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await signOutAction();
        router.refresh();
        router.push("/authenticate");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
      aria-label="Sign out"
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}

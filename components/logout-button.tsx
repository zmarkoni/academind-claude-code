"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOutAction();
      router.refresh();
      router.push("/authenticate");
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}

import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";
import type { auth } from "@/lib/auth";

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;
type User = NonNullable<SessionData>["user"];

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-[61px] bg-zinc-950 border-b border-zinc-800">
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-5xl w-full h-full px-4 flex items-center justify-between"
      >
        <Link
          href="/dashboard"
          className="text-base font-bold tracking-tight text-zinc-100 hover:text-white transition-colors"
        >
          NextNotes
        </Link>
        <div className="flex items-center gap-5">
          {user && <LogoutButton />}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

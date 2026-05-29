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
    <header className="h-[60px] bg-zinc-950 border-b border-zinc-800">
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-7xl w-full h-full px-4 sm:px-6 flex items-center justify-between"
      >
        {/* Left: Logout button (only when authenticated) */}
        <div className="w-24">{user && <LogoutButton />}</div>

        {/* Center: Logo */}
        <Link
          href="/dashboard"
          className="flex-1 text-center text-base font-bold tracking-tight text-zinc-100 hover:text-white transition-colors"
        >
          NextNotes
        </Link>

        {/* Right: Theme toggle */}
        <div className="w-24 flex justify-end">
          <ThemeToggle />
        </div>
      </nav>
      <h2 className="zoki sr-only">
        NextNotes - Your personal note-taking app
      </h2>
      <h3>TEST</h3>
      <h4>TEST</h4>
    </header>
  );
}

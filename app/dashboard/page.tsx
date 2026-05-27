import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getNotesByUser } from "@/lib/notes";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const notes = getNotesByUser(session.user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No notes yet.{" "}
          <Link href="/notes/new" className="text-zinc-700 dark:text-zinc-300 underline hover:text-zinc-900 dark:hover:text-zinc-100">
            Create your first note
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {note.title}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Updated {new Date(note.updated_at).toLocaleString()}
                  </p>
                </div>
                {note.is_public === 1 && (
                  <span className="ml-4 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-100">
                    Public
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

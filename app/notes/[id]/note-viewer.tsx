"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Note } from "@/lib/notes";
import { deleteNote } from "./actions";
import { useState } from "react";
import { DeleteDialog } from "@/components/delete-dialog";

interface NoteViewerProps {
  note: Note;
}

export function NoteViewer({ note }: NoteViewerProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let initialContent;
  try {
    initialContent = JSON.parse(note.content_json);
  } catch {
    initialContent = { type: "doc", content: [] };
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: "language-" },
      }),
    ],
    immediatelyRender: false,
    content: initialContent,
    editable: false,
  });

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteNote(note.id);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to delete note");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-1">
            {note.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {new Date(note.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Link
            href={`/notes/${note.id}/edit`}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {note.is_public && (
        <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            🔗 This note is publicly shared
          </p>
          <a
            href={`/p/${note.public_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {typeof window !== "undefined" ? window.location.origin : ""}/p/
            {note.public_slug}
          </a>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none text-foreground [&_pre]:bg-zinc-900 dark:[&_pre]:bg-zinc-950 [&_pre]:text-zinc-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
        />
      </div>

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground"
        >
          ← Back to notes
        </Link>
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        isLoading={isDeleting}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </main>
  );
}

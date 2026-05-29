"use client";

import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Note } from "@/lib/notes";

interface PublicNoteViewerProps {
  note: Note;
}

export function PublicNoteViewer({ note }: PublicNoteViewerProps) {
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {note.title}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Published {new Date(note.created_at).toLocaleString()}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none text-foreground [&_pre]:bg-zinc-900 dark:[&_pre]:bg-zinc-950 [&_pre]:text-zinc-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
        />
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}

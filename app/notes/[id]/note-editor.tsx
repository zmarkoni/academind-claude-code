"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Note } from "@/lib/notes";
import { updateNote, setNotePublic } from "./actions";
import { Copy, Check } from "lucide-react";
import { EditorToolbar } from "@/components/editor-toolbar";

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
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
  });

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateNote(note.id, {
        title,
        contentJson: JSON.stringify(editor.getJSON()),
      });
      router.refresh();
    } catch (err) {
      setError("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsSharing(true);
    setError(null);
    try {
      await setNotePublic(note.id, !note.is_public);
      router.refresh();
    } catch (err) {
      setError("Failed to update sharing settings");
    } finally {
      setIsSharing(false);
    }
  };

  const publicUrl = note.is_public && note.public_slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${note.public_slug}`
    : null;

  const handleCopyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold text-foreground bg-transparent outline-none w-full mb-1"
            placeholder="Note title"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {new Date(note.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Share publicly</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {note.is_public
                ? "This note is visible to anyone with the link"
                : "This note is private"}
            </p>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={isSharing}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              note.is_public
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                : "bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isSharing ? "Updating…" : note.is_public ? "Make private" : "Share"}
          </button>
        </div>

        {publicUrl && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 bg-transparent text-sm text-zinc-600 dark:text-zinc-300 outline-none"
            />
            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title="Copy link"
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} className="text-zinc-500" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-400 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <EditorToolbar editor={editor} />
        <div
          onClick={() => editor?.chain().focus().run()}
          className="bg-white dark:bg-zinc-900 cursor-text"
        >
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none px-4 py-3 min-h-[400px] text-foreground [&_pre]:bg-zinc-900 dark:[&_pre]:bg-zinc-950 [&_pre]:text-zinc-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
          />
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/notes/${note.id}`}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground"
        >
          ← Back to note
        </Link>
      </div>
    </main>
  );
}

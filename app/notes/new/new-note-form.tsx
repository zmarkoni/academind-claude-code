"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "@/components/editor-toolbar";
import { createNote } from "./actions";

export function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: "language-" },
      }),
    ],
    immediatelyRender: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      if (editor) {
        formData.set("contentJson", JSON.stringify(editor.getJSON()));
      }
      await createNote(null, formData);
    } catch (err) {
      setError("Failed to create note. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-8 text-foreground">New Note</h1>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Untitled note"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
          />
        </div>

        <div className="space-y-1.5">
          <p id="content-label" className="text-sm font-medium text-foreground">
            Content
          </p>
          <div
            aria-labelledby="content-label"
            className="rounded-lg border border-slate-400 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
          >
            <EditorToolbar editor={editor} />
            <div
              onClick={() => editor?.chain().focus().run()}
              className="bg-white dark:bg-zinc-900 cursor-text"
            >
              <EditorContent
                editor={editor}
                className="prose dark:prose-invert max-w-none px-4 py-3 min-h-[300px] text-foreground [&_pre]:bg-zinc-900 dark:[&_pre]:bg-zinc-950 [&_pre]:text-zinc-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
              />
            </div>
          </div>
          <input
            type="hidden"
            name="contentJson"
            defaultValue='{"type":"doc","content":[]}'
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save note"}
        </button>
      </form>
    </main>
  );
}

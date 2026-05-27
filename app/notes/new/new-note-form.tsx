"use client";

import { useActionState, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import { EditorToolbar } from "@/components/editor-toolbar";
import { createNote } from "./actions";

export function NewNoteForm() {
  const [state, formAction, isPending] = useActionState(createNote, null);
  const [contentJson, setContentJson] = useState('{"type":"doc","content":[]}');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Code,
      CodeBlock,
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none text-foreground min-h-[180px] py-2",
      },
    },
    onUpdate({ editor }) {
      setContentJson(JSON.stringify(editor.getJSON()));
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-8 text-foreground">New Note</h1>
      <form action={formAction} className="space-y-6">
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
          <div aria-labelledby="content-label">
            <EditorToolbar editor={editor} />
            <div
              onClick={() => editor?.chain().focus().run()}
              className="rounded-b-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 cursor-text"
            >
              <EditorContent editor={editor} />
            </div>
          </div>
          <input type="hidden" name="contentJson" value={contentJson} />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
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

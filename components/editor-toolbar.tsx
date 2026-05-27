"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  Minus,
  Pilcrow,
  Terminal,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive: boolean;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold size={15} strokeWidth={2.5} />,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic size={15} strokeWidth={2.5} />,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <Heading1 size={15} strokeWidth={2.5} />,
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 size={15} strokeWidth={2.5} />,
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 size={15} strokeWidth={2.5} />,
      label: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Pilcrow size={15} strokeWidth={2.5} />,
      label: "Paragraph",
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: editor.isActive("paragraph"),
    },
    {
      icon: <List size={15} strokeWidth={2.5} />,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <Code size={15} strokeWidth={2.5} />,
      label: "Inline Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    {
      icon: <Terminal size={15} strokeWidth={2.5} />,
      label: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    {
      icon: <Minus size={15} strokeWidth={2.5} />,
      label: "Horizontal Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap gap-0.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5"
    >
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          aria-label={btn.label}
          aria-pressed={btn.isActive}
          onClick={(e) => {
            e.preventDefault();
            btn.action();
          }}
          className={`rounded p-1.5 transition-colors ${
            btn.isActive
              ? "bg-zinc-200 dark:bg-zinc-700 text-foreground"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
          }`}
          title={btn.label}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getNoteById } from "@/lib/notes";
import { NoteEditor } from "../note-editor";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = getNoteById(session.user.id, id);

  if (!note) {
    notFound();
  }

  return <NoteEditor note={note} />;
}

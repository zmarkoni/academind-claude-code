import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import { PublicNoteViewer } from "./public-note-viewer";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);

  if (!note) {
    notFound();
  }

  return <PublicNoteViewer note={note} />;
}

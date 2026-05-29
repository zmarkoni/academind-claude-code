"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  updateNote as updateNoteInDb,
  deleteNote as deleteNoteInDb,
  setNotePublic as setNotePublicInDb,
} from "@/lib/notes";

export async function updateNote(
  noteId: string,
  data: { title?: string; contentJson?: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const note = updateNoteInDb(session.user.id, noteId, data);
  if (!note) {
    throw new Error("Note not found");
  }
  return note;
}

export async function deleteNote(noteId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const success = deleteNoteInDb(session.user.id, noteId);
  if (!success) {
    throw new Error("Note not found");
  }
}

export async function setNotePublic(noteId: string, isPublic: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const note = setNotePublicInDb(session.user.id, noteId, isPublic);
  if (!note) {
    throw new Error("Note not found");
  }
  return note;
}

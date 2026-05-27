"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createNote as createNoteInDb } from "@/lib/notes";

type ActionState = { error: string } | null;

export async function createNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/authenticate");

    const title = (formData.get("title") as string)?.trim() || "Untitled note";
    const contentJson =
      (formData.get("contentJson") as string) || '{"type":"doc","content":[]}';

    const note = createNoteInDb(session.user.id, {
      title,
      contentJson,
    });

    redirect(`/notes/${note.id}`);
  } catch (error) {
    console.error("Failed to create note:", error);
    return { error: "Failed to create note. Please try again." };
  }
}

"use server";

import { auth } from "@/lib/auth";
import { run } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

type ActionState = { error: string } | null;

export async function createNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const title = (formData.get("title") as string)?.trim() || "Untitled note";
  const contentJson =
    (formData.get("contentJson") as string) || '{"type":"doc","content":[]}';

  const id = randomUUID();
  run(
    "INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)",
    [id, session.user.id, title, contentJson]
  );

  redirect(`/notes/${id}`);
}

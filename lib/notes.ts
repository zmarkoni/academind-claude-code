import { query, get, run } from "@/lib/db";
import { randomUUID } from "crypto";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 255).replace(/[<>]/g, "");
}

function validateContentJson(contentJson: string): string {
  try {
    const parsed = JSON.parse(contentJson);
    if (!parsed.type || typeof parsed.type !== "string") {
      throw new Error("Invalid document structure");
    }
    return JSON.stringify(parsed);
  } catch {
    return '{"type":"doc","content":[]}';
  }
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string }
): Note {
  const id = randomUUID();
  const title = sanitizeTitle(data.title || "Untitled note");
  const contentJson = validateContentJson(
    data.contentJson || '{"type":"doc","content":[]}'
  );

  run(
    "INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)",
    [id, userId, title, contentJson]
  );

  const note = get<Note>("SELECT * FROM notes WHERE id = ?", [id]);
  if (!note) throw new Error("Failed to create note");
  return note;
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const note = get<Note>(
    "SELECT * FROM notes WHERE id = ? AND user_id = ?",
    [noteId, userId]
  );
  return note || null;
}

export function getNotesByUser(userId: string): Note[] {
  return query<Note>(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    [userId]
  );
}

export function updateNote(
  userId: string,
  noteId: string,
  data: { title?: string; contentJson?: string }
): Note | null {
  const note = getNoteById(userId, noteId);
  if (!note) return null;

  const title =
    data.title !== undefined ? sanitizeTitle(data.title) : note.title;
  const contentJson =
    data.contentJson !== undefined
      ? validateContentJson(data.contentJson)
      : note.content_json;

  run(
    "UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
    [title, contentJson, noteId, userId]
  );

  return getNoteById(userId, noteId);
}

export function deleteNote(userId: string, noteId: string): boolean {
  const note = getNoteById(userId, noteId);
  if (!note) return false;

  run("DELETE FROM notes WHERE id = ? AND user_id = ?", [noteId, userId]);
  return true;
}

export function setNotePublic(
  userId: string,
  noteId: string,
  isPublic: boolean
): Note | null {
  const note = getNoteById(userId, noteId);
  if (!note) return null;

  if (isPublic && !note.public_slug) {
    const slug = randomUUID().split("-")[0];
    run(
      "UPDATE notes SET is_public = 1, public_slug = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
      [slug, noteId, userId]
    );
  } else if (!isPublic) {
    run(
      "UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );
  }

  return getNoteById(userId, noteId);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const note = get<Note>(
    "SELECT * FROM notes WHERE public_slug = ? AND is_public = 1",
    [slug]
  );
  return note || null;
}

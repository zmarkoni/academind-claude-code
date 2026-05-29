import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as notesModule from "@/lib/notes";

// Mock the database functions
vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

// Mock randomUUID
vi.mock("crypto", async () => {
  const actual = await vi.importActual("crypto");
  return {
    ...actual,
    randomUUID: vi.fn(() => "test-uuid-1234-5678-9abc-def012345678"),
  };
});

import { query, get, run } from "@/lib/db";
import { randomUUID } from "crypto";

const mockQuery = query as ReturnType<typeof vi.fn>;
const mockGet = get as ReturnType<typeof vi.fn>;
const mockRun = run as ReturnType<typeof vi.fn>;
const mockRandomUUID = randomUUID as ReturnType<typeof vi.fn>;

describe("notes module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRandomUUID.mockReturnValue("test-uuid-1234-5678-9abc-def012345678");
  });

  describe("createNote", () => {
    it("should create a note with title and content", () => {
      const mockNote = {
        id: "test-uuid-1234-5678-9abc-def012345678",
        user_id: "user1",
        title: "Test Note",
        content_json: '{"type":"doc","content":[]}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      const result = notesModule.createNote("user1", {
        title: "Test Note",
        contentJson: '{"type":"doc","content":[]}',
      });

      expect(mockRun).toHaveBeenCalledWith(
        "INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)",
        [
          "test-uuid-1234-5678-9abc-def012345678",
          "user1",
          "Test Note",
          '{"type":"doc","content":[]}',
        ],
      );

      expect(result).toEqual(mockNote);
    });

    it("should sanitize title", () => {
      const mockNote = {
        id: "test-uuid-1234-5678-9abc-def012345678",
        user_id: "user1",
        title: "bTest/b",
        content_json: '{"type":"doc","content":[]}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      notesModule.createNote("user1", {
        title: "  <b>Test</b>  ",
        contentJson: '{"type":"doc","content":[]}',
      });

      const callArgs = (mockRun.mock.calls[0] as any)[1];
      // sanitizeTitle removes < and > characters but keeps everything else
      expect(callArgs[2]).toBe("bTest/b"); // Title should be sanitized
    });

    it("should use default title if not provided", () => {
      const mockNote = {
        id: "test-uuid-1234-5678-9abc-def012345678",
        user_id: "user1",
        title: "Untitled note",
        content_json: '{"type":"doc","content":[]}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      notesModule.createNote("user1", {});

      const callArgs = (mockRun.mock.calls[0] as any)[1];
      expect(callArgs[2]).toBe("Untitled note");
    });

    it("should validate and use default JSON for invalid content", () => {
      const mockNote = {
        id: "test-uuid-1234-5678-9abc-def012345678",
        user_id: "user1",
        title: "Test",
        content_json: '{"type":"doc","content":[]}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      notesModule.createNote("user1", { contentJson: "invalid" });

      const callArgs = (mockRun.mock.calls[0] as any)[1];
      expect(callArgs[3]).toBe('{"type":"doc","content":[]}');
    });

    it("should throw error if note creation fails", () => {
      mockGet.mockReturnValue(null);

      expect(() => {
        notesModule.createNote("user1", { title: "Test" });
      }).toThrow("Failed to create note");
    });
  });

  describe("getNoteById", () => {
    it("should retrieve a note by id for user", () => {
      const mockNote = {
        id: "note-123",
        user_id: "user1",
        title: "My Note",
        content_json: '{"type":"doc"}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      const result = notesModule.getNoteById("user1", "note-123");

      expect(mockGet).toHaveBeenCalledWith(
        "SELECT * FROM notes WHERE id = ? AND user_id = ?",
        ["note-123", "user1"],
      );
      expect(result).toEqual(mockNote);
    });

    it("should return null if note not found", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.getNoteById("user1", "nonexistent");

      expect(result).toBeNull();
    });

    it("should enforce user_id check", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.getNoteById("user2", "note-123");

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(
        "SELECT * FROM notes WHERE id = ? AND user_id = ?",
        ["note-123", "user2"],
      );
    });
  });

  describe("getNotesByUser", () => {
    it("should retrieve all notes for a user", () => {
      const mockNotes = [
        {
          id: "note-1",
          user_id: "user1",
          title: "Note 1",
          content_json: "{}",
          is_public: 0,
          public_slug: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
        },
        {
          id: "note-2",
          user_id: "user1",
          title: "Note 2",
          content_json: "{}",
          is_public: 0,
          public_slug: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      ];

      mockQuery.mockReturnValue(mockNotes);

      const result = notesModule.getNotesByUser("user1");

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
        ["user1"],
      );
      expect(result).toEqual(mockNotes);
    });

    it("should return empty array if user has no notes", () => {
      mockQuery.mockReturnValue([]);

      const result = notesModule.getNotesByUser("user2");

      expect(result).toEqual([]);
    });
  });

  describe("updateNote", () => {
    it("should update note title and content", () => {
      const originalNote = {
        id: "note-1",
        user_id: "user1",
        title: "Original",
        content_json: '{"type":"doc"}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const updatedNote = {
        ...originalNote,
        title: "Updated",
        content_json: '{"type":"doc","content":[]}',
        updated_at: "2024-01-02T00:00:00Z",
      };

      mockGet.mockReturnValue(originalNote);
      mockGet.mockReturnValueOnce(originalNote);
      mockGet.mockReturnValueOnce(updatedNote);

      const result = notesModule.updateNote("user1", "note-1", {
        title: "Updated",
        contentJson: '{"type":"doc","content":[]}',
      });

      expect(mockRun).toHaveBeenCalledWith(
        "UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        ["Updated", '{"type":"doc","content":[]}', "note-1", "user1"],
      );
    });

    it("should update only title if content not provided", () => {
      const originalNote = {
        id: "note-1",
        user_id: "user1",
        title: "Original",
        content_json: '{"type":"doc"}',
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(originalNote);

      notesModule.updateNote("user1", "note-1", { title: "Updated" });

      const callArgs = (mockRun.mock.calls[0] as any)[1];
      expect(callArgs[0]).toBe("Updated"); // New title
      expect(callArgs[1]).toBe('{"type":"doc"}'); // Original content
    });

    it("should return null if note not found", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.updateNote("user1", "nonexistent", {
        title: "Updated",
      });

      expect(result).toBeNull();
      expect(mockRun).not.toHaveBeenCalled();
    });

    it("should enforce user_id check", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.updateNote("user2", "note-1", {
        title: "Updated",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteNote", () => {
    it("should delete a note", () => {
      const mockNote = {
        id: "note-1",
        user_id: "user1",
        title: "Note",
        content_json: "{}",
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      const result = notesModule.deleteNote("user1", "note-1");

      expect(result).toBe(true);
      expect(mockRun).toHaveBeenCalledWith(
        "DELETE FROM notes WHERE id = ? AND user_id = ?",
        ["note-1", "user1"],
      );
    });

    it("should return false if note not found", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.deleteNote("user1", "nonexistent");

      expect(result).toBe(false);
      expect(mockRun).not.toHaveBeenCalled();
    });

    it("should enforce user_id check", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.deleteNote("user2", "note-1");

      expect(result).toBe(false);
    });
  });

  describe("setNotePublic", () => {
    it("should make note public and generate slug", () => {
      const mockNote = {
        id: "note-1",
        user_id: "user1",
        title: "Note",
        content_json: "{}",
        is_public: 0,
        public_slug: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const publicNote = {
        ...mockNote,
        is_public: 1,
        public_slug: "test-uuid",
      };

      mockGet.mockReturnValueOnce(mockNote);
      mockGet.mockReturnValueOnce(publicNote);

      mockRandomUUID.mockReturnValue("test-uuid-1234-5678-9abc-def012345678");

      const result = notesModule.setNotePublic("user1", "note-1", true);

      expect(mockRun).toHaveBeenCalled();
      const updateCall = (mockRun.mock.calls[0] as any)[1];
      expect(updateCall[0]).toBeDefined(); // Should have a slug
    });

    it("should make note private", () => {
      const mockNote = {
        id: "note-1",
        user_id: "user1",
        title: "Note",
        content_json: "{}",
        is_public: 1,
        public_slug: "slug123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const privateNote = {
        ...mockNote,
        is_public: 0,
        public_slug: null,
      };

      mockGet.mockReturnValueOnce(mockNote);
      mockGet.mockReturnValueOnce(privateNote);

      const result = notesModule.setNotePublic("user1", "note-1", false);

      expect(mockRun).toHaveBeenCalledWith(
        "UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        ["note-1", "user1"],
      );
    });

    it("should return null if note not found", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.setNotePublic("user1", "nonexistent", true);

      expect(result).toBeNull();
    });
  });

  describe("getNoteByPublicSlug", () => {
    it("should retrieve public note by slug", () => {
      const mockNote = {
        id: "note-1",
        user_id: "user1",
        title: "Public Note",
        content_json: "{}",
        is_public: 1,
        public_slug: "slug123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockGet.mockReturnValue(mockNote);

      const result = notesModule.getNoteByPublicSlug("slug123");

      expect(mockGet).toHaveBeenCalledWith(
        "SELECT * FROM notes WHERE public_slug = ? AND is_public = 1",
        ["slug123"],
      );
      expect(result).toEqual(mockNote);
    });

    it("should return null if note not found", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.getNoteByPublicSlug("nonexistent");

      expect(result).toBeNull();
    });

    it("should enforce is_public check", () => {
      mockGet.mockReturnValue(null);

      const result = notesModule.getNoteByPublicSlug("slug123");

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(
        "SELECT * FROM notes WHERE public_slug = ? AND is_public = 1",
        ["slug123"],
      );
    });
  });
});

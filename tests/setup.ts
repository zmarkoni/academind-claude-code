import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { existsSync, unlinkSync } from "fs";
import path from "path";

// Use a test database
process.env.DB_PATH = path.join(process.cwd(), "data/test.db");

// Clean up test database before and after tests
beforeAll(() => {
  const testDbPath = process.env.DB_PATH!;
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
  if (existsSync(testDbPath + "-shm")) {
    unlinkSync(testDbPath + "-shm");
  }
  if (existsSync(testDbPath + "-wal")) {
    unlinkSync(testDbPath + "-wal");
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  const testDbPath = process.env.DB_PATH!;
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
  if (existsSync(testDbPath + "-shm")) {
    unlinkSync(testDbPath + "-shm");
  }
  if (existsSync(testDbPath + "-wal")) {
    unlinkSync(testDbPath + "-wal");
  }
});

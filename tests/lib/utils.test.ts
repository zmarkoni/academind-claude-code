import { describe, it, expect } from "vitest";
import {
  sanitizeTitle,
  validateContentJson,
  isValidEmail,
  isValidPassword,
  generatePublicSlug,
} from "@/lib/utils";

describe("sanitizeTitle", () => {
  it("should trim whitespace", () => {
    expect(sanitizeTitle("  hello  ")).toBe("hello");
  });

  it("should remove angle brackets", () => {
    // sanitizeTitle removes < and > but keeps everything else
    expect(sanitizeTitle("hello<script>alert('xss')</script>")).toBe(
      "helloscriptalert('xss')/script"
    );
    expect(sanitizeTitle("<b>bold</b>")).toBe("bbold/b");
  });

  it("should truncate to 255 characters", () => {
    const longString = "a".repeat(300);
    expect(sanitizeTitle(longString)).toHaveLength(255);
  });

  it("should handle normal titles", () => {
    expect(sanitizeTitle("My Note Title")).toBe("My Note Title");
  });

  it("should remove angle brackets", () => {
    expect(sanitizeTitle("hello<world>test")).toBe("helloworldtest");
  });
});

describe("validateContentJson", () => {
  it("should accept valid TipTap JSON", () => {
    const validJson = '{"type":"doc","content":[]}';
    expect(validateContentJson(validJson)).toBe(validJson);
  });

  it("should parse and re-stringify valid JSON", () => {
    const json = '{"type":"doc","content":[{"type":"paragraph"}]}';
    const result = validateContentJson(json);
    expect(JSON.parse(result)).toEqual(JSON.parse(json));
  });

  it("should return default empty doc for invalid JSON", () => {
    expect(validateContentJson("invalid")).toBe('{"type":"doc","content":[]}');
  });

  it("should return default for missing type field", () => {
    expect(validateContentJson('{"content":[]}')).toBe(
      '{"type":"doc","content":[]}'
    );
  });

  it("should return default for non-string type", () => {
    expect(validateContentJson('{"type":123,"content":[]}')).toBe(
      '{"type":"doc","content":[]}'
    );
  });

  it("should return default for empty string", () => {
    expect(validateContentJson("")).toBe('{"type":"doc","content":[]}');
  });

  it("should handle complex nested structures", () => {
    const complex =
      '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Title"}]}]}';
    const result = validateContentJson(complex);
    expect(JSON.parse(result)).toEqual(JSON.parse(complex));
  });
});

describe("isValidEmail", () => {
  it("should accept valid emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@example.co.uk")).toBe(true);
    expect(isValidEmail("123@example.com")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("invalid@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("test @example.com")).toBe(false);
  });

  it("should reject emails longer than 255 characters", () => {
    const longEmail = "a".repeat(250) + "@example.com";
    expect(isValidEmail(longEmail)).toBe(false);
  });

  it("should reject empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("should accept passwords with 8+ characters", () => {
    expect(isValidPassword("password123")).toBe(true);
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("a".repeat(100))).toBe(true);
  });

  it("should reject passwords shorter than 8 characters", () => {
    expect(isValidPassword("short")).toBe(false);
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword("")).toBe(false);
  });

  it("should accept passwords with special characters", () => {
    expect(isValidPassword("p@ssw0rd!")).toBe(true);
  });
});

describe("generatePublicSlug", () => {
  it("should generate a non-empty slug", () => {
    const slug = generatePublicSlug();
    expect(slug).toBeTruthy();
    expect(slug.length).toBeGreaterThan(0);
  });

  it("should generate URL-safe slugs", () => {
    const slug = generatePublicSlug();
    expect(/^[A-Z0-9]+$/.test(slug)).toBe(true);
  });

  it("should generate different slugs on each call", () => {
    const slug1 = generatePublicSlug();
    const slug2 = generatePublicSlug();
    expect(slug1).not.toBe(slug2);
  });
});

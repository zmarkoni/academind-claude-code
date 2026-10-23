// Validation and utility functions extracted for easier testing
import { randomBytes } from "crypto";

export function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 255).replace(/[<>]/g, "");
}

export function validateContentJson(contentJson: string): string {
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

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function generatePublicSlug(): string {
  // 128 bits from a CSPRNG, base64url-encoded (22 chars) so public links cannot be guessed
  return randomBytes(16).toString("base64url");
}

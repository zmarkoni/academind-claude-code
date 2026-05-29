import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("checkRateLimit", () => {
  let checkRateLimit: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    // Re-import the module to get fresh state
    const module = await import("@/lib/rate-limit");
    checkRateLimit = module.checkRateLimit;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow first request", () => {
    const result = checkRateLimit("user1");
    expect(result).toBe(true);
  });

  it("should allow multiple requests within limit", () => {
    const identifier = "user2";
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(identifier);
      expect(result).toBe(true);
    }
  });

  it("should block requests exceeding the limit", () => {
    const identifier = "user3";
    // Fill up the quota
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier);
    }
    // This should be blocked
    const result = checkRateLimit(identifier);
    expect(result).toBe(false);
  });

  it("should track different identifiers separately", () => {
    const user1 = "user1";
    const user2 = "user2";

    // Use up user1's quota
    for (let i = 0; i < 5; i++) {
      checkRateLimit(user1);
    }
    expect(checkRateLimit(user1)).toBe(false);

    // user2 should still have quota
    expect(checkRateLimit(user2)).toBe(true);
  });

  it("should allow new requests after time window expires", () => {
    const identifier = "user4";
    const WINDOW_MS = 15 * 60 * 1000;

    // Fill up the quota
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier);
    }
    expect(checkRateLimit(identifier)).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(WINDOW_MS + 1);

    // Should be allowed again
    expect(checkRateLimit(identifier)).toBe(true);
  });

  it("should handle IP addresses as identifiers", () => {
    const ip1 = "192.168.1.1";
    const ip2 = "192.168.1.2";

    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1);
    }

    expect(checkRateLimit(ip1)).toBe(false);
    expect(checkRateLimit(ip2)).toBe(true);
  });
});

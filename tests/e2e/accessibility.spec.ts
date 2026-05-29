import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const TEST_EMAIL = "e2e-test@nextnotes.test";
const TEST_PASSWORD = "TestPassword123!";

// Ensure the test user exists
test.beforeAll(async ({ request }) => {
  await request.post("/api/auth/sign-up/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: "E2E Test User" },
  });
});

async function signIn({ page }: { page: import("@playwright/test").Page }) {
  const res = await page.request.post("/api/auth/sign-in/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe("Accessibility - Header", () => {
  test("authenticate page header passes axe scan", async ({ page }) => {
    await page.goto("/authenticate");
    const results = await new AxeBuilder({ page }).include("header").analyze();
    expect(results.violations).toHaveLength(0);
  });

  test("dashboard header passes axe scan (authenticated)", async ({ page }) => {
    await signIn({ page });
    await page.goto("/dashboard");
    const results = await new AxeBuilder({ page }).include("header").analyze();
    expect(results.violations).toHaveLength(0);
  });

  test("heading hierarchy is correct on all pages", async ({ page }) => {
    await page.goto("/authenticate");

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    const levels: number[] = [];

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const level = parseInt(tagName[1]);
      levels.push(level);
    }

    // Check no skipped heading levels (e.g., h2 → h4 without h3)
    for (let i = 0; i < levels.length - 1; i++) {
      const currentLevel = levels[i];
      const nextLevel = levels[i + 1];
      const levelDiff = Math.abs(nextLevel - currentLevel);
      expect(
        levelDiff,
        `Heading hierarchy skip detected: h${currentLevel} → h${nextLevel}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test("all headings have accessible content", async ({ page }) => {
    await page.goto("/authenticate");

    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();

    for (const heading of headings) {
      const text = await heading.textContent();
      expect(text?.trim(), "Heading must have content").toBeTruthy();
    }
  });
});

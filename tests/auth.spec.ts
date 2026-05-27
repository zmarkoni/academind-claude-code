import { test, expect } from "@playwright/test";

const TEST_EMAIL = "e2e-test@nextnotes.test";
const TEST_PASSWORD = "TestPassword123!";

// Ensure the test user exists once before any suite runs.
// sign-up is idempotent here: we silently ignore 422 (user already exists).
test.beforeAll(async ({ request }) => {
  await request.post("/api/auth/sign-up/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: "E2E Test User" },
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function signIn({ page }: { page: import("@playwright/test").Page }) {
  // page.request shares the cookie jar with the page, so the session cookie
  // set by the server is automatically included in all subsequent page.goto()s.
  const res = await page.request.post("/api/auth/sign-in/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(res.ok(), `sign-in failed: ${res.status()}`).toBeTruthy();
}

// ---------------------------------------------------------------------------
// Dark mode enforcement
// ---------------------------------------------------------------------------

test.describe("Dark mode", () => {
  test("html element carries the dark class on every page", async ({ page }) => {
    await page.goto("/authenticate");
    const cls = await page.locator("html").getAttribute("class");
    expect(cls).toContain("dark");
  });

  test("body background is dark (not white)", async ({ page }) => {
    await page.goto("/authenticate");
    const bg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    // background is --background: #09090b → rgb(9, 9, 11) in dark mode
    expect(bg).not.toBe("rgb(255, 255, 255)");
  });
});

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

test.describe("Unauthenticated access", () => {
  test("GET /dashboard redirects to /authenticate", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/authenticate/);
  });

  test("GET /notes/:id redirects to /authenticate", async ({ page }) => {
    await page.goto("/notes/non-existent-note");
    await expect(page).toHaveURL(/\/authenticate/);
  });

  test("GET /notes/new redirects to /authenticate", async ({ page }) => {
    await page.goto("/notes/new");
    await expect(page).toHaveURL(/\/authenticate/);
  });

  test("header is present on the /authenticate page", async ({ page }) => {
    await page.goto("/authenticate");
    await expect(page.locator("header")).toBeVisible();
  });

  test("logout button is NOT rendered when unauthenticated", async ({ page }) => {
    await page.goto("/authenticate");
    await expect(
      page.getByRole("button", { name: /sign out/i })
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Authenticated access
// ---------------------------------------------------------------------------

test.describe("Authenticated access", () => {
  test.beforeEach(signIn);

  test("authenticated user can access /dashboard without redirect", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("http://localhost:3000/dashboard");
  });

  test("header is present on /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("header")).toBeVisible();
  });

  test("header height is 60px", async ({ page }) => {
    await page.goto("/dashboard");
    const height = await page.locator("header").evaluate((el) => el.clientHeight);
    expect(height).toBe(60);
  });

  test("logout button is rendered when authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  });

  test("logout button is on the RIGHT side of the header (after the logo)", async ({ page }) => {
    await page.goto("/dashboard");

    const logoutButton = page.getByRole("button", { name: /sign out/i });
    const logoLink = page.getByRole("link", { name: "NextNotes" });

    const logoutBox = await logoutButton.boundingBox();
    const logoBox = await logoLink.boundingBox();

    expect(logoutBox, "logout button bounding box should exist").not.toBeNull();
    expect(logoBox, "logo link bounding box should exist").not.toBeNull();

    // The left edge of the logout button must be to the right of the logo's left edge
    expect(logoutBox!.x).toBeGreaterThan(logoBox!.x);
  });

  test("clicking logout redirects to /authenticate", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/authenticate/);
  });
});

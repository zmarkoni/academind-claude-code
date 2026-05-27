# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Unauthenticated access >> header is present on the /authenticate page
- Location: tests/auth.spec.ts:68:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header')
Expected: visible
Error: strict mode violation: locator('header') resolved to 2 elements:
    1) <header class="h-[60px] bg-zinc-950 border-b border-zinc-800">…</header> aka getByRole('banner')
    2) <header class="mb-8 text-center">…</header> aka getByText('NoteAppSign in to your account')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('header')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation "Main navigation" [ref=e3]:
      - link "NextNotes" [ref=e4] [cursor=pointer]:
        - /url: /dashboard
      - button "Toggle theme" [ref=e6]:
        - img [ref=e7]
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - heading "NoteApp" [level=1] [ref=e16]
        - heading "Sign in to your account" [level=2] [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: Email
          - textbox "Email" [ref=e21]:
            - /placeholder: you@example.com
        - generic [ref=e22]:
          - generic [ref=e23]: Password
          - textbox "Password" [ref=e24]:
            - /placeholder: ••••••••
        - button "Sign in" [ref=e25]
      - paragraph [ref=e26]:
        - text: Don't have an account?
        - link "Sign up" [ref=e27] [cursor=pointer]:
          - /url: "?mode=signup"
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const TEST_EMAIL = "e2e-test@nextnotes.test";
  4   | const TEST_PASSWORD = "TestPassword123!";
  5   | 
  6   | // Ensure the test user exists once before any suite runs.
  7   | // sign-up is idempotent here: we silently ignore 422 (user already exists).
  8   | test.beforeAll(async ({ request }) => {
  9   |   await request.post("/api/auth/sign-up/email", {
  10  |     data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: "E2E Test User" },
  11  |   });
  12  | });
  13  | 
  14  | // ---------------------------------------------------------------------------
  15  | // Helpers
  16  | // ---------------------------------------------------------------------------
  17  | 
  18  | async function signIn({ page }: { page: import("@playwright/test").Page }) {
  19  |   // page.request shares the cookie jar with the page, so the session cookie
  20  |   // set by the server is automatically included in all subsequent page.goto()s.
  21  |   const res = await page.request.post("/api/auth/sign-in/email", {
  22  |     data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  23  |   });
  24  |   expect(res.ok(), `sign-in failed: ${res.status()}`).toBeTruthy();
  25  | }
  26  | 
  27  | // ---------------------------------------------------------------------------
  28  | // Dark mode enforcement
  29  | // ---------------------------------------------------------------------------
  30  | 
  31  | test.describe("Dark mode", () => {
  32  |   test("html element carries the dark class on every page", async ({ page }) => {
  33  |     await page.goto("/authenticate");
  34  |     const cls = await page.locator("html").getAttribute("class");
  35  |     expect(cls).toContain("dark");
  36  |   });
  37  | 
  38  |   test("body background is dark (not white)", async ({ page }) => {
  39  |     await page.goto("/authenticate");
  40  |     const bg = await page.evaluate(() =>
  41  |       window.getComputedStyle(document.body).backgroundColor
  42  |     );
  43  |     // background is --background: #09090b → rgb(9, 9, 11) in dark mode
  44  |     expect(bg).not.toBe("rgb(255, 255, 255)");
  45  |   });
  46  | });
  47  | 
  48  | // ---------------------------------------------------------------------------
  49  | // Unauthenticated access
  50  | // ---------------------------------------------------------------------------
  51  | 
  52  | test.describe("Unauthenticated access", () => {
  53  |   test("GET /dashboard redirects to /authenticate", async ({ page }) => {
  54  |     await page.goto("/dashboard");
  55  |     await expect(page).toHaveURL(/\/authenticate/);
  56  |   });
  57  | 
  58  |   test("GET /notes/:id redirects to /authenticate", async ({ page }) => {
  59  |     await page.goto("/notes/non-existent-note");
  60  |     await expect(page).toHaveURL(/\/authenticate/);
  61  |   });
  62  | 
  63  |   test("GET /notes/new redirects to /authenticate", async ({ page }) => {
  64  |     await page.goto("/notes/new");
  65  |     await expect(page).toHaveURL(/\/authenticate/);
  66  |   });
  67  | 
  68  |   test("header is present on the /authenticate page", async ({ page }) => {
  69  |     await page.goto("/authenticate");
> 70  |     await expect(page.locator("header")).toBeVisible();
      |                                          ^ Error: expect(locator).toBeVisible() failed
  71  |   });
  72  | 
  73  |   test("logout button is NOT rendered when unauthenticated", async ({ page }) => {
  74  |     await page.goto("/authenticate");
  75  |     await expect(
  76  |       page.getByRole("button", { name: /sign out/i })
  77  |     ).not.toBeVisible();
  78  |   });
  79  | });
  80  | 
  81  | // ---------------------------------------------------------------------------
  82  | // Authenticated access
  83  | // ---------------------------------------------------------------------------
  84  | 
  85  | test.describe("Authenticated access", () => {
  86  |   test.beforeEach(signIn);
  87  | 
  88  |   test("authenticated user can access /dashboard without redirect", async ({ page }) => {
  89  |     await page.goto("/dashboard");
  90  |     await expect(page).toHaveURL("http://localhost:3000/dashboard");
  91  |   });
  92  | 
  93  |   test("header is present on /dashboard", async ({ page }) => {
  94  |     await page.goto("/dashboard");
  95  |     await expect(page.locator("header")).toBeVisible();
  96  |   });
  97  | 
  98  |   test("header height is 60px", async ({ page }) => {
  99  |     await page.goto("/dashboard");
  100 |     const height = await page.locator("header").evaluate((el) => el.clientHeight);
  101 |     expect(height).toBe(60);
  102 |   });
  103 | 
  104 |   test("logout button is rendered when authenticated", async ({ page }) => {
  105 |     await page.goto("/dashboard");
  106 |     await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  107 |   });
  108 | 
  109 |   test("logout button is on the LEFT side of the header (before the logo)", async ({ page }) => {
  110 |     await page.goto("/dashboard");
  111 | 
  112 |     const logoutButton = page.getByRole("button", { name: /sign out/i });
  113 |     const logoLink = page.getByRole("link", { name: "NextNotes" });
  114 | 
  115 |     const logoutBox = await logoutButton.boundingBox();
  116 |     const logoBox = await logoLink.boundingBox();
  117 | 
  118 |     expect(logoutBox, "logout button bounding box should exist").not.toBeNull();
  119 |     expect(logoBox, "logo link bounding box should exist").not.toBeNull();
  120 | 
  121 |     // The left edge of the logout button must be to the left of the logo's left edge
  122 |     expect(logoutBox!.x).toBeLessThan(logoBox!.x);
  123 |   });
  124 | 
  125 |   test("clicking logout redirects to /authenticate", async ({ page }) => {
  126 |     await page.goto("/dashboard");
  127 |     await page.getByRole("button", { name: /sign out/i }).click();
  128 |     await expect(page).toHaveURL(/\/authenticate/);
  129 |   });
  130 | });
  131 | 
```
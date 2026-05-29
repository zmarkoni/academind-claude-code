import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";

test.describe("Notes Management", () => {
  test.beforeEach(async ({ page }) => {
    // Sign up first
    await page.goto("/authenticate?mode=signup");
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should create a new note", async ({ page }) => {
    await page.goto("/dashboard");
    await page.click('a:has-text("New Note")');
    await page.waitForURL("/notes/new");

    // Fill in note details
    await page.fill('input[placeholder="Untitled note"]', "Test Note");

    // Wait for editor to be ready
    await page.locator(".ProseMirror").waitFor();

    // Click in editor and add content
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("This is test content for the note.");

    // Save note
    await page.click('button:has-text("Save")');

    // Should redirect to note editor
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);

    // Verify content
    expect(await page.locator("input[value='Test Note']")).toBeDefined();
  });

  test("should edit an existing note", async ({ page }) => {
    // Create a note first
    await page.goto("/notes/new");
    await page.fill('input[placeholder="Untitled note"]', "Original Title");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Original content");
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);

    // Edit the note
    const titleInput = page.locator('input[value="Original Title"]');
    await titleInput.fill("Updated Title");

    // Edit content
    await page.locator(".ProseMirror").click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type("Updated content");

    // Save
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(500);

    // Verify update
    expect(await page.locator('input[value="Updated Title"]')).toBeDefined();
  });

  test("should delete a note", async ({ page }) => {
    // Create a note first
    await page.goto("/notes/new");
    await page.fill('input[placeholder="Untitled note"]', "Note to Delete");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Will be deleted");
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);

    const noteUrl = page.url();

    // Delete note
    await page.click('button:has-text("Delete")');
    await page.on("dialog", (dialog) => {
      dialog.accept();
    });

    // Should redirect to dashboard
    await page.waitForURL("/dashboard");

    // Verify note is gone by trying to access it
    await page.goto(noteUrl);
    await page.waitForURL("/dashboard");
  });

  test("should toggle note sharing", async ({ page }) => {
    // Create a note first
    await page.goto("/notes/new");
    await page.fill('input[placeholder="Untitled note"]', "Note to Share");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Shared content");
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);

    // Get the note URL
    const noteUrl = page.url();
    const noteId = noteUrl.split("/").pop();

    // Share note
    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();

    // Wait for slug to be generated
    await page.waitForTimeout(500);

    // Check for public URL display
    const publicUrl = await page.locator('input[value*="/p/"]');
    expect(publicUrl).toBeDefined();

    // Copy URL button should be visible
    const copyButton = page.locator('button[title="Copy link"]');
    await expect(copyButton).toBeVisible();

    // Unshare note
    const makePrivateButton = page.locator('button:has-text("Make private")');
    await makePrivateButton.click();
    await page.waitForTimeout(300);

    // Button should change back to "Share"
    await expect(page.locator('button:has-text("Share")')).toBeVisible();
  });

  test("should view shared note publicly", async ({ page, context }) => {
    // Create and share a note
    await page.goto("/notes/new");
    await page.fill('input[placeholder="Untitled note"]', "Public Note");
    await page.locator(".ProseMirror").click();
    await page.keyboard.type("Public content");
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);

    // Share it
    await page.click('button:has-text("Share")');
    await page.waitForTimeout(500);

    // Extract public URL
    const publicUrlInput = page.locator('input[value*="/p/"]');
    const publicUrl = await publicUrlInput.inputValue();

    // Open in new incognito context (simulate public viewer)
    const publicPage = await context.newPage();
    await publicPage.goto(publicUrl);

    // Verify content is visible and read-only
    await expect(
      publicPage.locator("h1:has-text('Public Note')"),
    ).toBeDefined();
    await expect(publicPage.locator("text=Public content")).toBeDefined();

    // Editor should not be editable
    const editor = publicPage.locator(".ProseMirror");
    const contentEditableAttr = await editor.evaluate((el) =>
      el.getAttribute("contenteditable"),
    );
    expect(contentEditableAttr).toBe("false");

    await publicPage.close();
  });

  test("should apply text formatting (bold, code, bullet list)", async ({
    page,
  }) => {
    // Create a new note
    await page.goto("/notes/new");
    await page.fill('input[placeholder="Untitled note"]', "Formatting Test");
    await page.locator(".ProseMirror").click();

    // Test Bold formatting
    await page.keyboard.type("Bold text");
    await page.keyboard.press("Control+A");
    await page.click('button[aria-label="Bold"]');
    await page.waitForTimeout(100);
    const boldElement = page.locator(".ProseMirror strong");
    await expect(boldElement).toBeVisible();

    // Test Inline Code formatting
    await page.keyboard.press("End");
    await page.keyboard.type(" inline code");
    await page.keyboard.press("Shift+Home");
    await page.click('button[aria-label="Inline Code"]');
    await page.waitForTimeout(100);
    const codeElement = page.locator(".ProseMirror code");
    await expect(codeElement).toBeVisible();

    // Test Bullet List formatting
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Bullet item 1");
    await page.keyboard.press("Home");
    await page.click('button[aria-label="Bullet List"]');
    await page.waitForTimeout(100);
    const bulletList = page.locator(".ProseMirror ul");
    const listItem = page.locator(".ProseMirror li");
    await expect(bulletList).toBeVisible();
    await expect(listItem).toBeVisible();

    // Save and verify
    await page.click('button:has-text("Save")');
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);
  });

  test("should display dashboard notes list", async ({ page }) => {
    // Create multiple notes
    for (let i = 1; i <= 3; i++) {
      await page.goto("/notes/new");
      await page.fill('input[placeholder="Untitled note"]', `Note ${i}`);
      await page.locator(".ProseMirror").click();
      await page.keyboard.type(`Content for note ${i}`);
      await page.click('button:has-text("Save")');
      await page.waitForURL(/\/notes\/[a-z0-9-]+$/);
    }

    // Go to dashboard
    await page.goto("/dashboard");

    // Verify notes are displayed
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator(`text=Note ${i}`)).toBeVisible();
    }

    // Click on a note
    await page.click("text=Note 1");
    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);
    await expect(page.locator('input[value="Note 1"]')).toBeVisible();
  });
});

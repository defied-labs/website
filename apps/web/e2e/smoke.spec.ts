import { test, expect } from "@playwright/test";

test.describe("Defied Smoke E2E Tests", () => {
  test("landing page renders core hero heading and call to action", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify hero text
    const heading = page.locator("h1");
    await expect(heading).toContainText("The industry standard was a ceiling");
    await expect(heading).toContainText("defied");

    // Verify call to actions
    const getStartedLink = page.getByRole("link", { name: "Get Started" });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", "/auth/magic-link");
  });

  test("magic link authentication page loads with email input", async ({
    page,
  }) => {
    await page.goto("/auth/magic-link");

    // Check heading and form
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toBeVisible();

    const submitButton = page.getByRole("button", { name: /Send Magic Link/i });
    await expect(submitButton).toBeVisible();
  });
});

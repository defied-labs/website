import { test, expect } from "@playwright/test";

test.describe("Defied Smoke E2E Tests", () => {
  test("landing page renders core hero heading and call to action", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify hero text
    const heading = page.getByRole("heading", {
      level: 1,
      name: /The industry standard was a/,
    });
    await expect(heading).toContainText("The industry standard was a ceiling");
    await expect(heading).toContainText("defied");

    // Verify call to actions
    const getStartedLink = page.getByRole("link", { name: "Join the closed beta" });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", "/auth/magic-link");
  });

  test("login page shows unavailable notice", async ({ page }) => {
    await page.goto("/auth/magic-link");

    await expect(
      page.getByRole("heading", { name: "Login unavailable" }),
    ).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("debug modal issue", () => {
    test("should load application and verify basic functionality", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            // Wait for app to load
            await page.waitForLoadState("domcontentloaded");

            // Take initial screenshot for debugging
            await page.screenshot({
                path: "playwright/test-results/screenshots/debug-initial.png",
                fullPage: true,
            });

            // Verify page loaded correctly
            const title = await page.title();
            expect(title).toBeTruthy();

            // Check that buttons exist on the page
            const buttons = await page.getByRole("button").all();
            console.log(`Found ${buttons.length} buttons`);
            expect(buttons.length).toBeGreaterThan(0);

            // Log button information for debugging
            for (const button of buttons) {
                const text = await button.textContent().catch(() => "N/A");
                const ariaLabel = await button
                    .getAttribute("aria-label")
                    .catch(() => "N/A");
                const visible = await button.isVisible().catch(() => false);
                console.log(
                    `Button: text="${text}" aria-label="${ariaLabel}" visible=${visible}`
                );
            }
        } finally {
            await electronApp.close();
        }
    });

    test("should test add new site modal functionality", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            // Wait for app to load
            await page.waitForLoadState("domcontentloaded");

            // Look for Add new site button
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });

            // Wait for the button to be available, or skip this test
            await expect(addSiteButton).toBeVisible({ timeout: 10000 });

            // Click the button
            await addSiteButton.click();

            // Wait for and verify dialog appears
            const dialog = page.getByRole("dialog");
            await expect(dialog).toBeVisible({ timeout: 5000 });

            // Take screenshot after clicking
            await page.screenshot({
                path: "playwright/test-results/screenshots/debug-after-click.png",
                fullPage: true,
            });

            console.log("Modal test completed successfully");
        } finally {
            await electronApp.close();
        }
    });
});

/**
 * Simple UI inspection test to verify basic elements are present
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("ui inspection", () => {
    test("should inspect actual UI structure", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Get page title to confirm app loaded
            const title = await page.title();
            expect(title).toContain("Uptime Watcher");

            // Check basic UI elements exist
            const settingsButton = page.getByRole("button", {
                name: "Settings",
            });
            await expect(settingsButton).toBeVisible({ timeout: 10000 });

            // Check add site button exists
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(addSiteButton).toBeVisible();

            // Verify there are sites in the UI (we have test data)
            const siteCards = page.getByTestId("site-card");
            const cardCount = await siteCards.count();
            expect(cardCount).toBeGreaterThan(0);
        } finally {
            await electronApp.close();
        }
    });
});

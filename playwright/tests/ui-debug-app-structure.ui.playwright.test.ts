/**
 * Debug test to examine actual rendered content and verify data-testid
 * attributes.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("debug - App Structure Verification", () => {
    test("should verify app structure and data-testid attributes", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            // Wait for basic DOM load
            await page.waitForLoadState("domcontentloaded");

            // Take a screenshot immediately after DOM load
            await page.screenshot({
                path: "playwright/test-results/debug-1-dom-loaded.png",
                fullPage: true,
            });

            // Wait for app-root
            await expect(page.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
            console.log("✓ app-root found");

            // Take a screenshot after app-root is visible
            await page.screenshot({
                path: "playwright/test-results/debug-2-app-root-visible.png",
                fullPage: true,
            });

            // Check if app-root has content
            await expect(page.getByTestId("app-root")).not.toBeEmpty({
                timeout: 10000,
            });
            console.log("✓ app-root has content");

            // Take a screenshot after app-root has content
            await page.screenshot({
                path: "playwright/test-results/debug-3-app-root-content.png",
                fullPage: true,
            });

            // Print the current HTML content for debugging
            const htmlContent = await page.content();
            console.log("Current HTML length:", htmlContent.length);

            // Look for app-container
            const appContainer = page.getByTestId("app-container");
            const appContainerVisible = await appContainer.isVisible();
            console.log("app-container visible:", appContainerVisible);

            // Log app-container status
            console.log(
                appContainerVisible
                    ? "✓ app-container found"
                    : "✗ app-container not found"
            );

            // Look for dashboard-container
            const dashboardContainer = page.getByTestId("dashboard-container");
            const dashboardContainerVisible =
                await dashboardContainer.isVisible();
            console.log(
                "dashboard-container visible:",
                dashboardContainerVisible
            );

            // Log dashboard-container status
            console.log(
                dashboardContainerVisible
                    ? "✓ dashboard-container found"
                    : "✗ dashboard-container not found"
            );

            // Get count of elements with data-testid
            const _testIdElements = await page.getByTestId("").count();
            console.log("Debug: Logging element search completed");

            // Wait for app to stabilize and take final screenshot
            await page.waitForLoadState("domcontentloaded");
            await page.screenshot({
                path: "playwright/test-results/debug-4-final.png",
                fullPage: true,
            });
        } finally {
            await electronApp.close();
        }
    });
});

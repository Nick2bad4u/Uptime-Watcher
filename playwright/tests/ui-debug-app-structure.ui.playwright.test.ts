/**
 * Debug test to examine actual rendered content and verify data-testid attributes.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("Debug - App Structure Verification", () => {
    test("should verify app structure and data-testid attributes", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            // Wait for basic DOM load
            await page.waitForLoadState("domcontentloaded");

            // Take a screenshot immediately after DOM load
            await page.screenshot({ 
                path: "playwright/test-results/debug-1-dom-loaded.png",
                fullPage: true 
            });

            // Wait for app-root
            await expect(page.getByTestId("app-root")).toBeVisible({ timeout: 15000 });
            console.log("✓ app-root found");

            // Take a screenshot after app-root is visible
            await page.screenshot({ 
                path: "playwright/test-results/debug-2-app-root-visible.png",
                fullPage: true 
            });

            // Check if app-root has content
            await expect(page.getByTestId("app-root")).not.toBeEmpty({ timeout: 10000 });
            console.log("✓ app-root has content");

            // Take a screenshot after app-root has content
            await page.screenshot({ 
                path: "playwright/test-results/debug-3-app-root-content.png",
                fullPage: true 
            });

            // Print the current HTML content for debugging
            const htmlContent = await page.content();
            console.log("Current HTML length:", htmlContent.length);

            // Look for app-container
            const appContainer = page.locator('[data-testid="app-container"]');
            const appContainerVisible = await appContainer.isVisible();
            console.log("app-container visible:", appContainerVisible);

            if (appContainerVisible) {
                console.log("✓ app-container found");
            }

            // Look for dashboard-container
            const dashboardContainer = page.locator('[data-testid="dashboard-container"]');
            const dashboardContainerVisible = await dashboardContainer.isVisible();
            console.log("dashboard-container visible:", dashboardContainerVisible);

            if (dashboardContainerVisible) {
                console.log("✓ dashboard-container found");
            }

            // Print all elements with data-testid
            const allTestIds = await page.locator('[data-testid]').all();
            console.log("Found elements with data-testid:", allTestIds.length);
            
            for (let i = 0; i < allTestIds.length; i++) {
                const testId = await allTestIds[i].getAttribute('data-testid');
                console.log(`  ${i + 1}. data-testid="${testId}"`);
            }

            // Wait a bit more and take final screenshot
            await page.waitForTimeout(3000);
            await page.screenshot({ 
                path: "playwright/test-results/debug-4-final.png",
                fullPage: true 
            });

        } finally {
            await electronApp.close();
        }
    });
});
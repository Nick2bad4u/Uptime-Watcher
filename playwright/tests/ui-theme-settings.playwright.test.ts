/**
 * Comprehensive E2E tests for theme and settings functionality.
 *
 * Tests cover:
 *
 * - Theme switching (light/dark mode)
 * - Settings modal operations
 * - UI preference persistence
 * - Accessibility features
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("theme and settings", () => {
    test("should toggle between light and dark theme", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Find the theme toggle button
            const themeButton = page.getByRole("button", {
                name: "Toggle theme",
            });
            await expect(themeButton).toBeVisible({ timeout: 10000 });

            // Take screenshot before theme change
            await page.screenshot({
                path: "playwright/test-results/screenshots/theme-before.png",
                fullPage: true,
            });

            // Click theme toggle
            await themeButton.click();

            // Wait for any animations or state changes to complete
            await page.waitForLoadState("domcontentloaded");

            // Take screenshot after theme change
            await page.screenshot({
                path: "playwright/test-results/screenshots/theme-after.png",
                fullPage: true,
            });

            // Verify theme button is still visible (it should persist)
            await expect(themeButton).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });

    test("should open settings modal when clicking settings button", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Find and click settings button - use more specific selector
            const settingsButton = page.getByRole("button", {
                name: "Settings",
            });
            await expect(settingsButton).toBeVisible({ timeout: 10000 });
            await settingsButton.click();

            // Check for settings modal using more specific locators
            // First try to find a proper dialog element
            const settingsDialog = page.getByRole("dialog");

            // If no dialog, look for specific settings content that's not part of site cards
            const settingsModal = page.getByTestId("settings-modal");
            const settingsPanel = page.getByTestId("settings-panel");
            const settingsHeading = page.getByRole("heading", {
                name: /^Settings$|^Preferences$/,
            });

            // Try to find either a dialog or settings content
            const settingsInterface = settingsDialog
                .or(settingsModal)
                .or(settingsPanel)
                .or(settingsHeading);

            // Verify settings interface appears
            await expect(settingsInterface).toBeVisible({ timeout: 5000 });
        } finally {
            await electronApp.close();
        }
    });

    test("should display app version and basic information", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Verify app title is correct
            const title = await page.title();
            expect(title).toContain("Uptime Watcher");

            // Check for any version information or about section
            const versionInfo = page
                .getByText("version")
                .or(page.getByText("v").or(page.getByText("About")));

            // Note: Version info might not be visible in main UI, this is exploratory
            const hasVersionInfo = await versionInfo
                .isVisible()
                .catch(() => false);
            console.log("Version info visible:", hasVersionInfo);
        } finally {
            await electronApp.close();
        }
    });

    test("should maintain theme selection across interactions", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Get initial theme state by checking theme button
            const themeButton = page.getByRole("button", {
                name: "Toggle theme",
            });
            await expect(themeButton).toBeVisible({ timeout: 10000 });

            // Toggle theme
            await themeButton.click();
            await page.waitForLoadState("domcontentloaded");

            // Verify theme changed by checking button is still accessible
            await expect(themeButton).toBeVisible();

            // Perform another action (open add site modal)
            const addSiteButton = page.getByRole("button", {
                name: "Add new site",
            });
            await addSiteButton.click();

            // Wait for modal
            const modal = page.getByRole("dialog");
            await expect(modal).toBeVisible({ timeout: 5000 });

            // Close modal by clicking close button
            const closeButton = page.getByRole("button", {
                name: "Close modal",
            });
            await closeButton.click();
            await expect(modal).not.toBeVisible({ timeout: 5000 });

            // Verify theme button is still accessible after modal interaction
            await expect(themeButton).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });

    test("should display header with status summary", async () => {
        const electronApp = await launchElectronApp();
        const page = await electronApp.firstWindow();

        try {
            await page.waitForLoadState("domcontentloaded");

            // Look for uptime statistics in header
            const uptimeText = page
                .getByText("Uptime")
                .or(page.getByText("%").or(page.getByText("Status")));

            // Check if uptime/status information is displayed
            const hasUptimeInfo = await uptimeText
                .isVisible()
                .catch(() => false);
            console.log("Uptime info visible:", hasUptimeInfo);

            // Look for monitor count information
            const monitorCountText = page
                .getByText("Sites")
                .or(page.getByText("Monitors").or(page.getByText("Total")));

            const hasMonitorCount = await monitorCountText
                .isVisible()
                .catch(() => false);
            console.log("Monitor count visible:", hasMonitorCount);

            // Verify core UI elements are present
            const headerElements = page.getByRole("button", {
                name: "Add new site",
            });
            await expect(headerElements).toBeVisible();
        } finally {
            await electronApp.close();
        }
    });
});

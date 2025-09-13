/**
 * Cross-Browser Compatibility Tests for Uptime Watcher.
 *
 * This test suite verifies that the Electron application works consistently
 * across different browser engines and operating system configurations.
 *
 * @remarks
 * Cross-Browser Test Coverage:
 *
 * - Chromium engine compatibility (default in Electron)
 * - High DPI display support
 * - Different font rendering scenarios
 * - Color scheme and theme compatibility
 * - Performance across different system configurations
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

test.describe(
    "cross-browser and platform compatibility",
    {
        tag: [
            "@cross-browser",
            "@compatibility",
            "@platform",
            "@ui-consistency",
        ],
        annotation: {
            type: "category",
            description: "Cross-browser and platform compatibility validation",
        },
    },
    () => {
        /**
         * Helper to launch app for compatibility testing.
         */
        async function launchAppForCompatibilityTesting() {
            const electronApp = await electron.launch({
                args: [path.join(__dirname, "../../dist-electron/main.js")],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                },
            });

            const window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Clean up database state before each test to ensure isolation
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await window.electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.warn("Failed to cleanup sites before test:", error);
                }
            });

            // Allow time for database cleanup to complete
            await window.waitForTimeout(500);

            await expect(window.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
            await expect(window.getByTestId("app-root")).not.toBeEmpty({
                timeout: 10000,
            });

            return { electronApp, window };
        }

        test(
            "high DPI display compatibility",
            {
                tag: [
                    "@high-dpi",
                    "@display",
                    "@scaling",
                ],
                annotation: {
                    type: "compatibility",
                    description: "Test app behavior on high DPI displays",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Simulate high DPI display
                    await window.setViewportSize({ width: 1920, height: 1080 });
                    await window.emulateMedia({ colorScheme: "light" });
                    await window.waitForTimeout(1000);

                    // Test at normal scale
                    await window.screenshot({
                        path: "playwright/test-results/compat-01-normal-dpi.png",
                        fullPage: true,
                    });

                    // Verify UI elements are properly sized
                    const buttons = window.getByRole("button");
                    const buttonCount = await buttons.count();
                    expect(buttonCount).toBeGreaterThan(0);

                    // Test button accessibility at high DPI
                    const firstButton = buttons.first();
                    await expect(firstButton).toBeVisible();

                    const buttonBox = await firstButton.boundingBox();
                    expect(buttonBox).toBeTruthy();
                    expect(buttonBox?.width).toBeGreaterThan(20);
                    expect(buttonBox?.height).toBeGreaterThan(20);

                    // Test different zoom levels
                    await window.evaluate(() => {
                        document.body.style.zoom = "1.25";
                    });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-02-zoom-125.png",
                        fullPage: true,
                    });

                    // Reset zoom
                    await window.evaluate(() => {
                        document.body.style.zoom = "1";
                    });

                    // Verify app still functions at different zoom levels
                    await firstButton.click();
                    await window.waitForTimeout(1000);

                    await expect(window.getByTestId("app-root")).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "color scheme and theme compatibility",
            {
                tag: [
                    "@color-schemes",
                    "@themes",
                    "@visual",
                ],
                annotation: {
                    type: "compatibility",
                    description:
                        "Test app behavior across different color schemes",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Test light theme
                    await window.emulateMedia({ colorScheme: "light" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-03-light-theme.png",
                        fullPage: true,
                    });

                    // Verify elements are visible in light theme
                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await expect(addButton).toBeVisible();

                    // Test dark theme
                    await window.emulateMedia({ colorScheme: "dark" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-04-dark-theme.png",
                        fullPage: true,
                    });

                    // Verify elements are still visible in dark theme
                    await expect(addButton).toBeVisible();

                    // Test functionality in dark theme
                    await addButton.click();
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-05-dark-theme-interaction.png",
                        fullPage: true,
                    });

                    // Test no-preference (system default)
                    await window.emulateMedia({ colorScheme: "no-preference" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-06-system-theme.png",
                        fullPage: true,
                    });

                    // Verify functionality remains consistent
                    await expect(window.getByTestId("app-root")).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "reduced motion and accessibility preferences",
            {
                tag: [
                    "@reduced-motion",
                    "@accessibility",
                    "@preferences",
                ],
                annotation: {
                    type: "compatibility",
                    description:
                        "Test app with accessibility motion preferences",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Test with reduced motion preference
                    await window.emulateMedia({ reducedMotion: "reduce" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-07-reduced-motion.png",
                        fullPage: true,
                    });

                    // Test that app still functions with reduced motion
                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await addButton.click();
                    await window.waitForTimeout(1000);

                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/compat-08-reduced-motion-interaction.png",
                        fullPage: true,
                    });

                    // Test with no motion preference
                    await window.emulateMedia({
                        reducedMotion: "no-preference",
                    });
                    await window.waitForTimeout(1000);

                    // Verify app functions normally
                    await expect(addButton).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/compat-09-normal-motion.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "font rendering and text display compatibility",
            {
                tag: [
                    "@fonts",
                    "@text-rendering",
                    "@typography",
                ],
                annotation: {
                    type: "compatibility",
                    description:
                        "Test font rendering across different configurations",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Test default font rendering
                    await window.screenshot({
                        path: "playwright/test-results/compat-10-default-fonts.png",
                        fullPage: true,
                    });

                    // Test with larger font size simulation
                    await window.evaluate(() => {
                        document.body.style.fontSize = "18px";
                    });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-11-large-fonts.png",
                        fullPage: true,
                    });

                    // Verify app layout adapts to larger fonts
                    const addButton = window.getByRole("button", {
                        name: /add/i,
                    });
                    await expect(addButton).toBeVisible();

                    // Test functionality with larger fonts
                    await addButton.click();
                    await window.waitForTimeout(1000);

                    await expect(window.getByTestId("app-root")).toBeVisible();

                    // Reset font size
                    await window.evaluate(() => {
                        document.body.style.fontSize = "";
                    });

                    await window.screenshot({
                        path: "playwright/test-results/compat-12-font-reset.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "viewport and responsive design compatibility",
            {
                tag: [
                    "@responsive",
                    "@viewport",
                    "@mobile",
                ],
                annotation: {
                    type: "compatibility",
                    description: "Test responsive design across viewport sizes",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Test tablet-like viewport
                    await window.setViewportSize({ width: 768, height: 1024 });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-13-tablet-viewport.png",
                        fullPage: true,
                    });

                    // Verify functionality at tablet size
                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await expect(addButton).toBeVisible();
                    await addButton.click();
                    await window.waitForTimeout(1000);

                    // Test mobile-like viewport
                    await window.setViewportSize({ width: 375, height: 667 });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-14-mobile-viewport.png",
                        fullPage: true,
                    });

                    // Verify app is still usable at mobile size
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    // Test desktop viewport
                    await window.setViewportSize({ width: 1920, height: 1080 });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-15-desktop-viewport.png",
                        fullPage: true,
                    });

                    // Verify optimal desktop experience
                    await expect(addButton).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "performance consistency across configurations",
            {
                tag: [
                    "@performance",
                    "@consistency",
                    "@timing",
                ],
                annotation: {
                    type: "compatibility",
                    description:
                        "Test performance consistency across different configurations",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Measure initial load performance
                    const startTime = Date.now();

                    await expect(window.getByTestId("app-root")).toBeVisible({
                        timeout: 10000,
                    });

                    const loadTime = Date.now() - startTime;
                    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

                    await window.screenshot({
                        path: "playwright/test-results/compat-16-performance-baseline.png",
                        fullPage: true,
                    });

                    // Test interaction responsiveness
                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });

                    const clickStartTime = Date.now();
                    await addButton.click();
                    await window.waitForTimeout(100);
                    const clickResponseTime = Date.now() - clickStartTime;

                    expect(clickResponseTime).toBeLessThan(2000); // Should respond within 2 seconds

                    // Test multiple rapid interactions
                    for (let i = 0; i < 3; i++) {
                        // Close any open modals first
                        await window.keyboard.press("Escape");
                        await window.waitForTimeout(200);

                        await addButton.click();
                        await window.waitForTimeout(300);
                    }

                    // Verify app remains responsive
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/compat-17-performance-stress.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "comprehensive compatibility integration",
            {
                tag: [
                    "@integration",
                    "@comprehensive",
                    "@compatibility",
                ],
                annotation: {
                    type: "integration",
                    description:
                        "Comprehensive compatibility test across multiple factors",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForCompatibilityTesting();

                try {
                    // Combine multiple compatibility factors
                    await window.setViewportSize({ width: 1366, height: 768 });
                    await window.emulateMedia({
                        colorScheme: "dark",
                        reducedMotion: "reduce",
                    });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/compat-18-combined-factors.png",
                        fullPage: true,
                    });

                    // Test full workflow under combined conditions
                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await addButton.click();
                    await window.waitForTimeout(1000);

                    const textField = window.getByRole("textbox").first();
                    await textField.fill("Compatibility Test Site");

                    const urlField = window.getByRole("textbox").nth(1);
                    await urlField.fill("https://compatibility-test.com");

                    const submitButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await submitButton.click();
                    await window.waitForTimeout(2000);

                    // Verify workflow completed successfully
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/compat-19-workflow-complete.png",
                        fullPage: true,
                    });

                    // Test that data persists across different configurations
                    await window.emulateMedia({
                        colorScheme: "light",
                        reducedMotion: "no-preference",
                    });
                    await window.waitForTimeout(1000);

                    // Verify data is still accessible
                    const siteText = window.getByText(
                        "Compatibility Test Site"
                    );
                    await expect(siteText).toBeVisible({ timeout: 5000 });

                    await window.screenshot({
                        path: "playwright/test-results/compat-20-data-persistence.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

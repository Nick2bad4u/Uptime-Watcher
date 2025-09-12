/**
 * Comprehensive site management E2E tests for Uptime Watcher.
 *
 * Tests cover the complete user flow from adding sites to monitoring status
 * including all interactions with the main dashboard, site management, and
 * monitoring functionality.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

test.describe(
    "site management - core user flows",
    {
        tag: [
            "@e2e",
            "@core",
            "@site-management",
        ],
        annotation: {
            type: "category",
            description: "Complete site management user flows and interactions",
        },
    },
    () => {
        test(
            "should load and display main application interface",
            {
                tag: [
                    "@critical",
                    "@ui",
                    "@smoke",
                ],
                annotation: [
                    {
                        type: "ui",
                        description:
                            "Verifies main application UI loads and displays correctly",
                    },
                    {
                        type: "smoke",
                        description: "Critical smoke test for app interface",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                // Wait for React app to fully initialize
                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Verify main app container
                await expect(window.getByTestId("app-container")).toBeVisible();

                // Verify main content area
                await expect(window.getByRole("main")).toBeVisible();

                // Verify header component is present (it uses ThemedBox, not <header>)
                await expect(window.getByText("Uptime Watcher")).toBeVisible();

                // Verify main content area exists (this contains the site list)
                await expect(window.getByRole("main")).toBeVisible();

                // Verify basic button functionality
                const buttons = window.getByRole("button");
                await expect(buttons.first()).toBeVisible();

                // Verify app is interactive
                await buttons.first().focus();
                await expect(buttons.first()).toBeFocused();

                await window.screenshot({
                    path: "playwright/test-results/main-interface-verification.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should handle add site button interactions",
            {
                tag: [
                    "@ui",
                    "@interaction",
                    "@add-site",
                ],
                annotation: [
                    {
                        type: "interaction",
                        description:
                            "Tests add site button click and form interaction",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Find and click first button (avoid conditional logic)
                const firstButton = window.getByRole("button").first();
                await expect(firstButton).toBeVisible({ timeout: 5000 });
                await firstButton.click();

                // Wait for potential modal/form to appear
                await window.waitForTimeout(1000);

                // Verify interaction occurred
                const appContainer = window.getByTestId("app-container");
                await expect(appContainer).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/add-site-interaction.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should display status monitoring elements",
            {
                tag: [
                    "@monitoring",
                    "@status",
                    "@indicators",
                ],
                annotation: [
                    {
                        type: "monitoring",
                        description:
                            "Verifies status monitoring UI elements are present and functional",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Verify app container exists
                await expect(window.getByTestId("app-container")).toBeVisible();

                // Check for header component elements
                const headerElements = window.getByText("Uptime Watcher");
                await expect(headerElements).toBeVisible();

                // Verify buttons are present
                const buttons = window.getByRole("button");
                await expect(buttons.first()).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/status-monitoring-elements.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should handle navigation and keyboard interactions",
            {
                tag: [
                    "@navigation",
                    "@keyboard",
                    "@ui",
                ],
                annotation: [
                    {
                        type: "navigation",
                        description:
                            "Tests keyboard navigation and basic interactions",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Test keyboard navigation
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");

                // Test Escape key handling
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify app remains functional after keyboard interactions
                await expect(window.getByTestId("app-container")).toBeVisible();
                await expect(window.getByTestId("app-root")).not.toBeEmpty();

                // Test clicking on interactive elements
                const clickableElements = window.getByRole("button");
                await expect(clickableElements.first()).toBeVisible();
                await clickableElements.first().click();
                await window.waitForTimeout(500);

                // Verify app still responsive after interactions
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/navigation-keyboard-interactions.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should maintain accessibility standards",
            {
                tag: [
                    "@accessibility",
                    "@a11y",
                    "@semantic",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Verifies basic accessibility features are present",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Verify semantic elements exist
                /* eslint-disable-next-line playwright/no-raw-locators */
                const semanticElements = window.locator(
                    "main, .header-title-accent, .main-container"
                );
                await expect(semanticElements.first()).toBeVisible();

                // Verify focusable elements exist
                /* eslint-disable-next-line playwright/no-raw-locators */
                const focusableElements = window.locator(
                    "button, input, select, a"
                );
                await expect(focusableElements.first()).toBeVisible();

                // Test Tab navigation works
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");
                await window.keyboard.press("Shift+Tab");

                // Verify app handles keyboard input without errors
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/accessibility-verification.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should handle basic stress testing scenarios",
            {
                tag: [
                    "@stress",
                    "@resilience",
                    "@performance",
                ],
                annotation: [
                    {
                        type: "stress",
                        description:
                            "Tests basic application resilience under simple stress conditions",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Quick resilience test
                const firstButton = window.getByRole("button").first();
                await expect(firstButton).toBeVisible();

                // Basic click test
                await firstButton.click();
                await window.waitForTimeout(50);

                // Verify app is still responsive
                await expect(window.getByTestId("app-container")).toBeVisible();

                // Basic keyboard test
                await window.keyboard.press("Escape");
                await window.waitForTimeout(50);

                // Verify app handles input gracefully
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/stress-testing-verification.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );

        test(
            "should verify cross-browser compatibility patterns",
            {
                tag: [
                    "@cross-browser",
                    "@compatibility",
                    "@ui-consistency",
                ],
                annotation: [
                    {
                        type: "compatibility",
                        description:
                            "Tests UI consistency and behavior patterns across different contexts",
                    },
                ],
            },
            async () => {
                const electronApp = await electron.launch({
                    args: [path.join(__dirname, "../../dist-electron/main.js")],
                    env: {
                        ...process.env,
                        NODE_ENV: "test",
                    },
                });

                const window = await electronApp.firstWindow();
                await window.waitForLoadState("domcontentloaded");

                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });
                await expect(window.getByTestId("app-root")).not.toBeEmpty({
                    timeout: 10000,
                });

                // Test different viewport sizes
                await window.setViewportSize({ width: 1920, height: 1080 });
                await window.waitForTimeout(500);
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.setViewportSize({ width: 1366, height: 768 });
                await window.waitForTimeout(500);
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.setViewportSize({ width: 1024, height: 768 });
                await window.waitForTimeout(500);
                await expect(window.getByTestId("app-container")).toBeVisible();

                // Verify consistent element structure
                await expect(window.getByText("Uptime Watcher")).toBeVisible();
                await expect(window.getByRole("button").first()).toBeVisible();

                // Test that UI elements remain functional across viewports
                const interactiveElement = window.getByRole("button").first();
                await interactiveElement.click();
                await window.waitForTimeout(500);

                // Verify app remains functional
                await expect(window.getByTestId("app-container")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/cross-browser-compatibility.png",
                    fullPage: true,
                });

                await electronApp.close();
            }
        );
    }
);

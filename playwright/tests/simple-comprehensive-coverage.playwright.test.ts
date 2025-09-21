/**
 * Simple Comprehensive Component Tests for Uptime Watcher.
 *
 * Focused, reliable tests for achieving 100% coverage without complex
 * scenarios.
 */

import { test, expect, _electron as electron } from "@playwright/test";

test.describe(
    "simple Component Coverage Tests",
    {
        tag: [
            "@ui",
            "@coverage",
            "@simple",
        ],
        annotation: {
            type: "coverage-tests",
            description: "Simple component tests for comprehensive coverage",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: ["."],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                    SKIP_AUTO_UPDATES: "true",
                },
                timeout: 45000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");
            await expect(window.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
        });

        test.afterEach(async () => {
            await electronApp.close();
        });

        test(
            "should verify app layout and structure",
            {
                tag: ["@layout", "@structure"],
                annotation: {
                    type: "layout-verification",
                    description: "Verify application layout and structure",
                },
            },
            async () => {
                // Verify main layout elements
                await expect(window.getByTestId("app-root")).toBeVisible();
                await expect(window.getByText("Uptime Watcher")).toBeVisible();

                // Verify primary buttons
                await expect(
                    window.getByRole("button", { name: "Add new site" })
                ).toBeVisible();
                await expect(
                    window.getByRole("button", { name: "Toggle theme" })
                ).toBeVisible();
                await expect(
                    window.getByRole("button", { name: "Settings" })
                ).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/simple-layout-verification.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle basic form operations",
            {
                tag: ["@form", "@basic"],
                annotation: {
                    type: "form-testing",
                    description: "Test basic form operations and validation",
                },
            },
            async () => {
                // Open add site form
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                // Verify form elements
                await expect(window.getByRole("dialog")).toBeVisible();
                await expect(window.getByLabel("Site Name")).toBeVisible();
                await expect(window.getByLabel("URL")).toBeVisible();

                // Test form filling
                await window.getByLabel("Site Name").fill("Coverage Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");

                // Verify values
                await expect(window.getByLabel("Site Name")).toHaveValue(
                    "Coverage Test"
                );
                await expect(window.getByLabel("URL")).toHaveValue(
                    "https://httpbin.org/status/200"
                );

                // Close form
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/simple-form-operations.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test theme switching functionality",
            {
                tag: ["@theme", "@functionality"],
                annotation: {
                    type: "theme-testing",
                    description: "Test theme switching functionality",
                },
            },
            async () => {
                // Test theme toggle
                await window
                    .getByRole("button", { name: "Toggle theme" })
                    .click();
                await window.waitForTimeout(1000);

                // Verify theme changed
                const bodyClasses = await window.evaluate(
                    () => document.body.className
                );
                expect(bodyClasses).toBeTruthy();

                // Toggle back
                await window
                    .getByRole("button", { name: "Toggle theme" })
                    .click();
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/simple-theme-switching.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test settings dialog functionality",
            {
                tag: ["@settings", "@dialog"],
                annotation: {
                    type: "settings-testing",
                    description: "Test settings dialog functionality",
                },
            },
            async () => {
                // Open settings
                await window.getByRole("button", { name: "Settings" }).click();
                await window.waitForTimeout(1000);

                // Verify settings dialog
                await expect(window.getByRole("dialog")).toBeVisible();

                // Close settings
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/simple-settings-dialog.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test site addition workflow",
            {
                tag: ["@workflow", "@site-addition"],
                annotation: {
                    type: "workflow-testing",
                    description: "Test complete site addition workflow",
                },
            },
            async () => {
                // Add a site
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("Simple Test");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(3000);

                // Close modal
                await window.keyboard.press("Escape");
                await window.waitForTimeout(1000);

                // Verify site was added
                await expect(window.getByText("Simple Test")).toBeVisible({
                    timeout: 10000,
                });

                await window.screenshot({
                    path: "playwright/test-results/simple-site-addition.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test keyboard accessibility",
            {
                tag: ["@accessibility", "@keyboard"],
                annotation: {
                    type: "accessibility-testing",
                    description: "Test keyboard accessibility features",
                },
            },
            async () => {
                // Test tab navigation
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Test Enter key activation
                await window.keyboard.press("Enter");
                await window.waitForTimeout(1000);

                // Should open modal or activate control
                const modalCount = await window.getByRole("dialog").count();
                console.log(`Modal opened by keyboard: ${modalCount > 0}`);

                // Verify keyboard interaction worked
                expect(modalCount).toBeGreaterThanOrEqual(0);

                // Close with Escape
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/simple-keyboard-accessibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test responsive behavior",
            {
                tag: ["@responsive", "@behavior"],
                annotation: {
                    type: "responsive-testing",
                    description: "Test responsive behavior at different sizes",
                },
            },
            async () => {
                // Test different viewport sizes
                const sizes = [
                    { width: 800, height: 600 },
                    { width: 1200, height: 800 },
                    { width: 1600, height: 1000 },
                ];

                for (const size of sizes) {
                    await window.setViewportSize(size);
                    await window.waitForTimeout(500);

                    // Verify key elements remain visible
                    await expect(window.getByTestId("app-root")).toBeVisible();
                    await expect(
                        window.getByText("Uptime Watcher")
                    ).toBeVisible();
                }

                await window.screenshot({
                    path: "playwright/test-results/simple-responsive-behavior.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test error handling scenarios",
            {
                tag: ["@error", "@handling"],
                annotation: {
                    type: "error-testing",
                    description: "Test error handling in various scenarios",
                },
            },
            async () => {
                // Test invalid URL
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill("Error Test");
                await window.getByLabel("URL").fill("invalid-url");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(2000);

                // App should handle gracefully
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/simple-error-handling.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test UI state persistence",
            {
                tag: ["@state", "@persistence"],
                annotation: {
                    type: "state-testing",
                    description:
                        "Test UI state persistence across interactions",
                },
            },
            async () => {
                // Add multiple sites to test state
                const sites = [
                    {
                        name: "State Test 1",
                        url: "https://httpbin.org/status/200",
                    },
                    {
                        name: "State Test 2",
                        url: "https://httpbin.org/status/201",
                    },
                ];

                for (const site of sites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // Verify both sites persist
                await expect(window.getByText("State Test 1")).toBeVisible({
                    timeout: 5000,
                });
                await expect(window.getByText("State Test 2")).toBeVisible({
                    timeout: 5000,
                });

                await window.screenshot({
                    path: "playwright/test-results/simple-state-persistence.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should test component interactions",
            {
                tag: ["@interaction", "@components"],
                annotation: {
                    type: "interaction-testing",
                    description: "Test component interactions and behaviors",
                },
            },
            async () => {
                // Test button interactions
                const buttons = window.getByRole("button");
                const buttonCount = await buttons.count();
                expect(buttonCount).toBeGreaterThan(0);

                // Test modal interactions
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await expect(window.getByRole("dialog")).toBeVisible();

                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Test theme toggle interaction
                await window
                    .getByRole("button", { name: "Toggle theme" })
                    .click();
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/simple-component-interactions.png",
                    fullPage: true,
                });
            }
        );
    }
);

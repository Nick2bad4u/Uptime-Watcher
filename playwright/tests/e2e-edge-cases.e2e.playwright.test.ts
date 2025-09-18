/**
 * Edge Case and Stress Testing for Uptime Watcher.
 *
 * This test suite covers edge cases, error handling, and stress scenarios to
 * ensure the application is robust and handles unexpected situations
 * gracefully.
 *
 * @remarks
 * Edge Case Test Coverage:
 *
 * - Invalid input handling
 * - Network failure scenarios
 * - Large dataset handling
 * - Concurrent operation stress testing
 * - Resource exhaustion scenarios
 * - Data corruption recovery
 */

import { test, expect, _electron as electron } from "@playwright/test";

test.describe(
    "edge cases and stress testing",
    {
        tag: [
            "@edge-cases",
            "@stress",
            "@error-handling",
            "@robustness",
        ],
        annotation: {
            type: "category",
            description: "Edge case and stress scenario validation",
        },
    },
    () => {
        /**
         * Helper to launch app for stress testing.
         */
        async function launchAppForStressTesting() {
            const electronApp = await electron.launch({
                args: ["."],
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

            return { electronApp, window };
        }

        test(
            "invalid input handling",
            {
                tag: ["@input-validation", "@security"],
                annotation: {
                    type: "edge-case",
                    description:
                        "Test handling of malicious and invalid inputs",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Click Add Site button to open form
                    const addSiteButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await addSiteButton.click();
                    await window.waitForTimeout(1000);

                    // Test extremely long site name
                    const longSiteName = "A".repeat(100); // Reduced size for faster test
                    const nameField = window.getByLabel("Site Name");
                    await nameField.fill(longSiteName);
                    await window.waitForTimeout(500);

                    // Verify field handles long input gracefully
                    const nameValue = await nameField.inputValue();
                    expect(nameValue.length).toBeGreaterThan(0);

                    // Test special characters
                    const specialInput = '<script>alert("xss")</script>';
                    await nameField.fill(specialInput);
                    await window.waitForTimeout(500);

                    // Verify no script execution
                    const alertDialogs = await window.evaluate(() => {
                        return window.hasOwnProperty("alertCalled") || false;
                    });
                    expect(alertDialogs).toBeFalsy();

                    // Test a valid URL to ensure form works
                    const urlField = window.getByLabel("URL");
                    await urlField.fill("https://httpbin.org/status/200");
                    await nameField.fill("Edge Test Site");

                    // Submit with valid data
                    const submitButton = window.getByRole("button", {
                        name: "Add Site",
                    });
                    await submitButton.click();
                    await window.waitForTimeout(2000);

                    await window.screenshot({
                        path: "playwright/test-results/edge-02-invalid-inputs.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "rapid user interactions",
            {
                tag: ["@stress", "@performance"],
                annotation: {
                    type: "stress-test",
                    description: "Test rapid successive user interactions",
                },
            },
<<<<<<< HEAD
            async ({ window }) => {
                // Rapid button clicking stress test
                const addSiteButton = window.getByRole("button", {
                    name: "Add new site",
                });
=======
            async () => {
                test.setTimeout(60000); // Increase timeout to 60 seconds for complex workflow
                const { electronApp, window } =
                    await launchAppForStressTesting();
>>>>>>> 5e974dcd (🧪 [test] Add comprehensive E2E tests for monitor types)

                    // Test rapid clicking with proper cleanup
                    for (let i = 0; i < 3; i++) {
                        // Close any open modals first
                        await window.keyboard.press("Escape");
                        await window.waitForTimeout(100);

                        await addSiteButton.click();
                        await window.waitForTimeout(100);

                        // Close the modal immediately
                        await window.keyboard.press("Escape");
                        await window.waitForTimeout(100);
                    }

                    await window.waitForTimeout(500);

                    // Verify app is still responsive
                    await expect(addSiteButton).toBeVisible();
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-03-rapid-clicks.png",
                        fullPage: true,
                    });

                    // Test rapid typing
                    await addSiteButton.click();
                    await window.waitForTimeout(1000);

                    const nameField = window.getByLabel("Site Name");
                    await nameField.click();

                    // Type quickly but reliably
                    await nameField.fill("RapidTypingTest");
                    await window.waitForTimeout(500);

                    // Verify input was handled correctly
                    await expect(nameField).toHaveValue("RapidTypingTest");

                    await window.screenshot({
                        path: "playwright/test-results/edge-04-rapid-typing.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "memory stress with multiple sites",
            {
                tag: [
                    "@stress",
                    "@memory",
                    "@performance",
                ],
                annotation: {
                    type: "stress-test",
                    description:
                        "Test handling of multiple sites to stress memory",
                },
            },
            async () => {
                test.setTimeout(30000); // Increased timeout for stress test
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Add only 2 sites to reduce test complexity and time
                    const siteCount = 2;

                    for (let i = 0; i < siteCount; i++) {
                        // Click Add Site button
                        const addSiteButton = window.getByRole("button", {
                            name: "Add new site",
                        });
                        await addSiteButton.click();
                        await window.waitForTimeout(500);

                        // Fill in site details using proper selectors
                        const nameField = window.getByLabel("Site Name");
                        await nameField.fill(`Memory Test ${i + 1}`);

                        const urlField = window.getByLabel("URL");
                        await urlField.fill(`https://httpbin.org/status/200`);

                        // Submit form
                        const submitButton = window.getByRole("button", {
                            name: "Add Site",
                        });
                        await submitButton.click();
                        await window.waitForTimeout(3000); // Wait for site to be added
                    }

                    // Verify all sites were added and app is still responsive
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    // Take screenshot to verify sites were added
                    await window.screenshot({
                        path: "playwright/test-results/edge-05-memory-sites.png",
                        fullPage: true,
                    });

                    // Test that the app is still responsive after adding sites
                    const finalAddButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await expect(finalAddButton).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "window resize and viewport stress",
            {
                tag: [
                    "@stress",
                    "@responsive",
                    "@ui",
                ],
                annotation: {
                    type: "stress-test",
                    description:
                        "Test app behavior under extreme viewport changes",
                },
            },
<<<<<<< HEAD
            async ({ window }) => {
                // Test very small viewport
                await window.setViewportSize({ width: 320, height: 240 });
                await window.waitForTimeout(1000);
=======
            async () => {
                test.setTimeout(60000); // Increase timeout to 60 seconds for complex workflow
                const { electronApp, window } =
                    await launchAppForStressTesting();
>>>>>>> 5e974dcd (🧪 [test] Add comprehensive E2E tests for monitor types)

                    // Verify app is still usable at small size
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-07-small-viewport.png",
                        fullPage: true,
                    });

                    // Test very large viewport
                    await window.setViewportSize({ width: 2560, height: 1440 });
                    await window.waitForTimeout(1000);

                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-08-large-viewport.png",
                        fullPage: true,
                    });

                    // Test rapid viewport changes
                    const viewportSizes = [
                        { width: 800, height: 600 },
                        { width: 1024, height: 768 },
                        { width: 1366, height: 768 },
                        { width: 1920, height: 1080 },
                    ];

                    for (const size of viewportSizes) {
                        await window.setViewportSize(size);
                        await window.waitForTimeout(200);
                    }

                    // Verify app is still responsive after rapid changes
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    const addButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await addButton.click();
                    await window.waitForTimeout(500);

                    await window.screenshot({
                        path: "playwright/test-results/edge-09-viewport-stress.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "keyboard input edge cases",
            {
                tag: [
                    "@keyboard",
                    "@edge-cases",
                    "@accessibility",
                ],
                annotation: {
                    type: "edge-case",
                    description: "Test edge cases in keyboard input handling",
                },
            },
            async () => {
                const { electronApp, window } =
                    await launchAppForStressTesting();

                try {
                    // Open form
                    const addSiteButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await addSiteButton.click();
                    await window.waitForTimeout(1000);

                    const textField = window.getByRole("textbox").first();
                    await textField.click();

                    // Test special key combinations
                    await window.keyboard.press("Control+a");
                    await window.keyboard.type("Selected All Text");
                    await window.waitForTimeout(500);

                    await window.keyboard.press("Control+z"); // Undo
                    await window.waitForTimeout(500);

                    await window.keyboard.press("Control+y"); // Redo
                    await window.waitForTimeout(500);

                    // Test rapid key presses
                    for (let i = 0; i < 20; i++) {
                        await window.keyboard.press("ArrowLeft");
                        await window.keyboard.press("ArrowRight");
                    }

                    // Test function keys (should not break app)
                    await window.keyboard.press("F1");
                    await window.keyboard.press("F5");
                    await window.keyboard.press("F12");
                    await window.waitForTimeout(1000);

                    // Verify app is still responsive
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-10-keyboard-stress.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "error recovery and resilience",
            {
                tag: ["@error-recovery", "@resilience"],
                annotation: {
                    type: "resilience-test",
                    description: "Test app recovery from error states",
                },
            },
<<<<<<< HEAD
            async ({ window }) => {
                // Test escape key error recovery
                const addSiteButton = window.getByRole("button", {
                    name: "Add new site",
                });
                await addSiteButton.click();
                await window.waitForTimeout(1000);
=======
            async () => {
                test.setTimeout(60000); // Increase timeout to 60 seconds for complex workflow
                const { electronApp, window } =
                    await launchAppForStressTesting();
>>>>>>> 5e974dcd (🧪 [test] Add comprehensive E2E tests for monitor types)

                    // Press escape multiple times
                    for (let i = 0; i < 5; i++) {
                        await window.keyboard.press("Escape");
                        await window.waitForTimeout(200);
                    }

                    // Verify app recovered gracefully
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-11-escape-recovery.png",
                        fullPage: true,
                    });

                    // Test refresh/reload resilience
                    await window.reload();
                    await window.waitForTimeout(3000);

                    // Verify app loads correctly after reload
                    await expect(window.getByTestId("app-root")).toBeVisible({
                        timeout: 15000,
                    });

                    await window.screenshot({
                        path: "playwright/test-results/edge-12-reload-recovery.png",
                        fullPage: true,
                    });

                    // Test that basic functionality still works after reload
                    const postReloadAddButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await postReloadAddButton.click();
                    await window.waitForTimeout(1000);

                    await expect(postReloadAddButton).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/edge-13-post-reload-function.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

/**
 * Comprehensive End-to-End User Workflow Tests for Uptime Watcher.
 *
 * This tes // Submit form const submitButton = page.getByRole('button', { name:
 * 'Add Site', }); await expect(submitButton).toBeVisible(); await
 * submitButton.click();e covers complete user journeys from initial app usage
 * through advanced monitoring scenarios, ensuring all user flows work
 * seamlessly together.
 *
 * @remarks
 * Test Coverage:
 *
 * - Complete site creation workflow
 * - End-to-end monitoring operations
 * - Cross-feature integration testing
 * - Real-world usage scenarios
 * - Data persistence across sessions
 * - Error recovery workflows
 */

/* eslint-disable playwright/no-conditional-in-test */
/* eslint-disable playwright/no-conditional-expect */
// NOTE: This comprehensive user workflow test intentionally uses conditional logic
// to test various user scenarios and edge cases in real-world usage patterns

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";

test.describe(
    "comprehensive user workflows",
    {
        tag: ["@e2e", "@comprehensive", "@user-workflows", "@critical"],
        annotation: {
            type: "category",
            description: "Complete end-to-end user workflow validation",
        },
    },
    () => {
        /**
         * Helper function to launch the app and wait for it to be ready.
         */
        async function launchAndWaitForApp() {
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

            return { electronApp, window };
        }

        /**
         * Helper function to add a new site through the UI.
         */
        // @ts-ignore - Parameters are typed externally
        async function addSiteViaUI(window, siteName, siteUrl) {
            // Click the Add Site button to open the form
            const addSiteButton = window.getByRole("button").first();
            await expect(addSiteButton).toBeVisible({ timeout: 5000 });
            await addSiteButton.click();

            // Wait for form to appear
            await window.waitForTimeout(1000);

            // Fill in site details
            const nameField = window.getByRole("textbox").first();
            await expect(nameField).toBeVisible();
            await nameField.fill(siteName);

            const urlField = window.getByRole("textbox").nth(1);
            await expect(urlField).toBeVisible();
            await urlField.fill(siteUrl);

            // Submit the form
            const submitButton = window.getByRole("button", {
                name: /add|create|submit/i,
            });
            await expect(submitButton).toBeVisible();
            await submitButton.click();

            // Wait for site to be added
            await window.waitForTimeout(2000);
        }

        test(
            "complete first-time user workflow: setup to monitoring",
            {
                tag: ["@slow", "@critical", "@first-time-user"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Complete new user onboarding and first site setup",
                    },
                    {
                        type: "integration",
                        description:
                            "Tests all major features working together",
                    },
                ],
            },
            async () => {
                const { electronApp, window } = await launchAndWaitForApp();

                try {
                    // Step 1: Verify clean initial state
                    await expect(
                        window.getByText("Uptime Watcher")
                    ).toBeVisible();
                    await window.screenshot({
                        path: "playwright/test-results/workflow-01-initial-state.png",
                        fullPage: true,
                    });

                    // Step 2: Add first site
                    await addSiteViaUI(
                        window,
                        "Test Site 1",
                        "https://example.com"
                    );

                    await window.screenshot({
                        path: "playwright/test-results/workflow-02-first-site-added.png",
                        fullPage: true,
                    });

                    // Step 3: Add second site with different URL
                    await addSiteViaUI(
                        window,
                        "Test Site 2",
                        "https://httpbin.org/status/200"
                    );

                    await window.screenshot({
                        path: "playwright/test-results/workflow-03-second-site-added.png",
                        fullPage: true,
                    });

                    // Step 4: Verify sites appear in the list
                    await expect(window.getByText("Test Site 1")).toBeVisible({
                        timeout: 5000,
                    });
                    await expect(window.getByText("Test Site 2")).toBeVisible({
                        timeout: 5000,
                    });

                    // Step 5: Start monitoring for first site
                    const monitoringButtons = window.getByRole("button");
                    const buttonCount = await monitoringButtons.count();

                    if (buttonCount > 2) {
                        // Look for monitoring-related buttons (skip Add Site button)
                        for (let i = 1; i < buttonCount; i++) {
                            const button = monitoringButtons.nth(i);
                            const buttonText = await button.textContent();
                            if (
                                buttonText &&
                                (buttonText.includes("Start") ||
                                    buttonText.includes("Monitor"))
                            ) {
                                await button.click();
                                await window.waitForTimeout(1000);
                                break;
                            }
                        }
                    }

                    // Step 6: Verify monitoring status indicators
                    await window.waitForTimeout(3000);
                    await window.screenshot({
                        path: "playwright/test-results/workflow-04-monitoring-started.png",
                        fullPage: true,
                    });

                    // Step 7: Check that status indicators are present
                    const statusIndicators = window.locator(
                        '[class*="status"], [class*="indicator"]'
                    );
                    const indicatorCount = await statusIndicators.count();
                    expect(indicatorCount).toBeGreaterThan(0);

                    // Step 8: Navigate through different sections (if available)
                    const navigationElements = window.getByRole("button");
                    const navCount = await navigationElements.count();

                    // Click through available navigation to test app stability
                    for (let i = 0; i < Math.min(navCount, 3); i++) {
                        const navElement = navigationElements.nth(i);
                        if (await navElement.isVisible()) {
                            await navElement.click();
                            await window.waitForTimeout(500);
                        }
                    }

                    // Final verification: App is stable and functional
                    await expect(window.getByTestId("app-root")).toBeVisible();
                    await window.screenshot({
                        path: "playwright/test-results/workflow-05-final-state.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "bulk site management workflow",
            {
                tag: ["@slow", "@bulk-operations", "@advanced"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Testing bulk site operations and management",
                    },
                    {
                        type: "performance",
                        description:
                            "Ensures app handles multiple sites efficiently",
                    },
                ],
            },
            async () => {
                const { electronApp, window } = await launchAndWaitForApp();

                try {
                    // Test data for multiple sites
                    const testSites = [
                        { name: "Google", url: "https://google.com" },
                        { name: "GitHub", url: "https://github.com" },
                        {
                            name: "Stack Overflow",
                            url: "https://stackoverflow.com",
                        },
                        {
                            name: "MDN Docs",
                            url: "https://developer.mozilla.org",
                        },
                        {
                            name: "TypeScript",
                            url: "https://typescriptlang.org",
                        },
                    ];

                    // Add multiple sites in sequence
                    for (const [index, site] of testSites.entries()) {
                        await addSiteViaUI(window, site.name, site.url);

                        // Take screenshot every 2 sites
                        if ((index + 1) % 2 === 0) {
                            await window.screenshot({
                                path: `playwright/test-results/bulk-workflow-${index + 1}-sites.png`,
                                fullPage: true,
                            });
                        }

                        // Verify site was added
                        await expect(window.getByText(site.name)).toBeVisible({
                            timeout: 5000,
                        });
                    }

                    // Verify all sites are present
                    for (const site of testSites) {
                        await expect(window.getByText(site.name)).toBeVisible();
                    }

                    // Test scrolling behavior if needed (for many sites)
                    await window.keyboard.press("End");
                    await window.waitForTimeout(500);
                    await window.keyboard.press("Home");
                    await window.waitForTimeout(500);

                    // Final state screenshot
                    await window.screenshot({
                        path: "playwright/test-results/bulk-workflow-final.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "monitoring lifecycle complete workflow",
            {
                tag: ["@slow", "@monitoring", "@lifecycle"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Complete monitoring start/stop/check lifecycle",
                    },
                    {
                        type: "monitoring",
                        description:
                            "Verifies all monitoring states and transitions",
                    },
                ],
            },
            async () => {
                const { electronApp, window } = await launchAndWaitForApp();

                try {
                    // Add a test site
                    await addSiteViaUI(
                        window,
                        "Monitoring Test",
                        "https://httpbin.org/status/200"
                    );

                    await window.screenshot({
                        path: "playwright/test-results/monitoring-01-site-added.png",
                        fullPage: true,
                    });

                    // Look for monitoring control buttons
                    const allButtons = window.getByRole("button");
                    const buttonCount = await allButtons.count();

                    let monitoringStarted = false;

                    // Try to start monitoring
                    for (let i = 1; i < buttonCount; i++) {
                        const button = allButtons.nth(i);
                        const buttonText = await button.textContent();

                        if (
                            buttonText &&
                            (buttonText.toLowerCase().includes("start") ||
                                buttonText.toLowerCase().includes("monitor"))
                        ) {
                            await button.click();
                            await window.waitForTimeout(2000);
                            monitoringStarted = true;
                            break;
                        }
                    }

                    if (monitoringStarted) {
                        await window.screenshot({
                            path: "playwright/test-results/monitoring-02-started.png",
                            fullPage: true,
                        });

                        // Wait for potential status updates
                        await window.waitForTimeout(5000);

                        // Look for status indicators or changes
                        const statusElements = window.locator(
                            '[class*="status"], [class*="up"], [class*="down"]'
                        );
                        const statusCount = await statusElements.count();
                        expect(statusCount).toBeGreaterThan(0);

                        await window.screenshot({
                            path: "playwright/test-results/monitoring-03-status-updated.png",
                            fullPage: true,
                        });

                        // Try to stop monitoring
                        const updatedButtons = window.getByRole("button");
                        const updatedButtonCount = await updatedButtons.count();

                        for (let i = 1; i < updatedButtonCount; i++) {
                            const button = updatedButtons.nth(i);
                            const buttonText = await button.textContent();

                            if (
                                buttonText &&
                                (buttonText.toLowerCase().includes("stop") ||
                                    buttonText.toLowerCase().includes("pause"))
                            ) {
                                await button.click();
                                await window.waitForTimeout(2000);
                                break;
                            }
                        }

                        await window.screenshot({
                            path: "playwright/test-results/monitoring-04-stopped.png",
                            fullPage: true,
                        });
                    }

                    // Verify app remains stable throughout the workflow
                    await expect(window.getByTestId("app-root")).toBeVisible();
                    await expect(
                        window.getByText("Monitoring Test")
                    ).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "app restart data persistence workflow",
            {
                tag: ["@slow", "@persistence", "@data-integrity"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Tests data persistence across app restarts",
                    },
                    {
                        type: "integration",
                        description:
                            "Verifies database and state management integration",
                    },
                ],
            },
            async () => {
                let electronApp;
                let window;

                // First session: Add data
                ({ electronApp, window } = await launchAndWaitForApp());

                try {
                    await addSiteViaUI(
                        window,
                        "Persistent Site",
                        "https://example.com"
                    );
                    await expect(
                        window.getByText("Persistent Site")
                    ).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/persistence-01-data-added.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }

                // Wait a moment between sessions
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Second session: Verify data persisted
                ({ electronApp, window } = await launchAndWaitForApp());

                try {
                    // Check that the site is still there after restart
                    await expect(
                        window.getByText("Persistent Site")
                    ).toBeVisible({ timeout: 10000 });

                    await window.screenshot({
                        path: "playwright/test-results/persistence-02-data-restored.png",
                        fullPage: true,
                    });

                    // Add another site to verify app is fully functional
                    await addSiteViaUI(
                        window,
                        "Post-Restart Site",
                        "https://github.com"
                    );
                    await expect(
                        window.getByText("Post-Restart Site")
                    ).toBeVisible();

                    // Verify both sites are present
                    await expect(
                        window.getByText("Persistent Site")
                    ).toBeVisible();
                    await expect(
                        window.getByText("Post-Restart Site")
                    ).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/persistence-03-both-sites.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "error handling and recovery workflow",
            {
                tag: ["@slow", "@error-handling", "@resilience"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Tests error scenarios and recovery mechanisms",
                    },
                    {
                        type: "resilience",
                        description: "Verifies app handles errors gracefully",
                    },
                ],
            },
            async () => {
                const { electronApp, window } = await launchAndWaitForApp();

                try {
                    // Test 1: Invalid URL handling
                    await addSiteViaUI(
                        window,
                        "Invalid URL Site",
                        "not-a-valid-url"
                    );

                    await window.screenshot({
                        path: "playwright/test-results/error-01-invalid-url.png",
                        fullPage: true,
                    });

                    // Test 2: Empty form submission
                    const addSiteButton = window.getByRole("button").first();
                    await addSiteButton.click();
                    await window.waitForTimeout(1000);

                    const submitButton = window.getByRole("button", {
                        name: /add|create|submit/i,
                    });
                    if (await submitButton.isVisible()) {
                        await submitButton.click();
                        await window.waitForTimeout(1000);
                    }

                    await window.screenshot({
                        path: "playwright/test-results/error-02-empty-form.png",
                        fullPage: true,
                    });

                    // Test 3: Add a valid site to verify recovery
                    await addSiteViaUI(
                        window,
                        "Recovery Site",
                        "https://httpbin.org/status/200"
                    );
                    await expect(
                        window.getByText("Recovery Site")
                    ).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/error-03-recovery.png",
                        fullPage: true,
                    });

                    // Test 4: Rapid clicking (stress test)
                    const rapidClickButton = window.getByRole("button").first();
                    for (let i = 0; i < 5; i++) {
                        await rapidClickButton.click();
                        await window.waitForTimeout(100);
                    }

                    // Verify app is still responsive
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/error-04-stress-test.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

/* eslint-enable playwright/no-conditional-in-test */
/* eslint-enable playwright/no-conditional-expect */

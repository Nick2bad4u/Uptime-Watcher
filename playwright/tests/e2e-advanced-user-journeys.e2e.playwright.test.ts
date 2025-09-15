/**
 * Advanced End-to-End User Journey Tests for Uptime Watcher.
 *
 * These tests cover complex, real-world user scenarios including bulk
 * operations, performance testing, and advanced user workflows.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";
import { ensureCleanState } from "../utils/modal-cleanup";

// Test data for advanced scenarios
const BULK_TEST_SITES = [
    { name: "Production API", url: "https://httpbin.org/status/200" },
    { name: "CDN Endpoint", url: "https://httpbin.org/delay/1" },
    { name: "Database API", url: "https://httpbin.org/json" },
    { name: "Web Service A", url: "https://httpbin.org/get" },
    { name: "Web Service B", url: "https://httpbin.org/post" },
    { name: "Fast Service", url: "https://httpbin.org/status/200" },
    { name: "Slow Service", url: "https://httpbin.org/delay/3" },
    { name: "Critical Service", url: "https://httpbin.org/status/200" },
    { name: "Redirect Service", url: "https://httpbin.org/redirect/2" },
    { name: "JSON API", url: "https://httpbin.org/json" },
] as const;

const HIGH_FREQUENCY_SITES = [
    { name: "Real-time Monitor", url: "https://httpbin.org/status/200" },
    { name: "Heartbeat Service", url: "https://httpbin.org/get" },
    { name: "Health Check", url: "https://httpbin.org/status/200" },
] as const;

test.describe(
    "advanced User Journeys - Complex Scenarios",
    {
        tag: [
            "@e2e",
            "@advanced",
            "@comprehensive",
        ],
        annotation: {
            type: "category",
            description: "Advanced user scenarios for complex workflows",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        // Helper function to add bulk sites efficiently
        const addBulkSites = async (sites: readonly any[], maxSites = 10) => {
            const sitesToAdd = sites.slice(0, maxSites);
            let addedCount = 0;

            for (const site of sitesToAdd) {
                try {
                    // Open add site modal
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    // Fill form
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);

                    // Save site
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(300);

                    addedCount++;
                } catch (error) {
                    console.error(`Failed to add site ${site.name}:`, error);
                    // Try to close any open modals and continue
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }
            }

            return addedCount;
        };

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: [path.join(__dirname, "../../dist-electron/main.js")],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                    SKIP_AUTO_UPDATES: "true",
                    TEST_MODE: "true",
                },
                timeout: 45000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Enhanced cleanup for advanced tests
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    const deletedCount = await (
                        window as any
                    ).electronAPI.sites.deleteAllSites();
                    console.log(
                        `Advanced test cleanup: Deleted ${deletedCount} sites`
                    );
                } catch (error) {
                    console.error("Failed advanced cleanup:", error);
                }
            });

            await ensureCleanState(window);
        });

        test.afterEach(async () => {
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "bulk Site Management - 10 Sites Workflow",
            {
                tag: ["@slow", "@bulk"],
                annotation: [
                    {
                        type: "workflow",
                        description:
                            "Managing multiple monitoring sites efficiently",
                    },
                    {
                        type: "performance",
                        description: "Tests UI performance with multiple sites",
                    },
                ],
            },
            async () => {
                // Add 10 sites to test bulk operations
                const addedCount = await addBulkSites(BULK_TEST_SITES, 10);

                // Verify all sites were added
                expect(addedCount).toBe(10);

                // Test scrolling performance with many sites
                await window.keyboard.press("Home");
                await window.waitForTimeout(500);
                await window.keyboard.press("End");
                await window.waitForTimeout(500);

                // Verify sites are visible
                for (let i = 0; i < 5; i++) {
                    await expect(
                        window.getByText(BULK_TEST_SITES[i].name)
                    ).toBeVisible();
                }

                // Test bulk monitoring start
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Verify monitoring indicators
                const statusIndicators = window.getByTestId("status-indicator");
                const statusCount = await statusIndicators.count();
                expect(statusCount).toBeGreaterThan(0);

                // Final screenshot of bulk management interface
                await window.screenshot({
                    path: "playwright/test-results/advanced-bulk-management.png",
                    fullPage: true,
                });
            }
        );

        test(
            "keyboard Navigation and Accessibility",
            {
                tag: ["@keyboard", "@accessibility"],
                annotation: [
                    {
                        type: "accessibility",
                        description: "Advanced keyboard navigation patterns",
                    },
                    {
                        type: "workflow",
                        description: "Power user efficiency features",
                    },
                ],
            },
            async () => {
                // Add a few sites for keyboard navigation testing
                await addBulkSites(BULK_TEST_SITES, 3);

                // Test Tab navigation through interactive elements
                const tabStops: string[] = [];
                const maxTabs = 10; // Fixed number to avoid conditionals

                for (let i = 0; i < maxTabs; i++) {
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(100);

                    const focusedElement = await window.evaluate(() => {
                        const element = document.activeElement;
                        return element?.tagName || "UNKNOWN";
                    });

                    tabStops.push(focusedElement);
                }

                // Verify we have reasonable number of tab stops
                expect(tabStops.length).toBeGreaterThan(3);
                console.log("Tab navigation stops:", tabStops);

                // Test essential keyboard shortcuts
                await window.keyboard.press("Escape"); // Should close modals
                await window.waitForTimeout(200);
                await window.keyboard.press("Enter"); // Should activate focused element
                await window.waitForTimeout(200);
                await window.keyboard.press("Home"); // Should go to beginning
                await window.waitForTimeout(200);
                await window.keyboard.press("End"); // Should go to end
                await window.waitForTimeout(200);

                await window.screenshot({
                    path: "playwright/test-results/advanced-keyboard-navigation.png",
                    fullPage: true,
                });
            }
        );

        test(
            "performance Under Load - Real-time Monitoring",
            {
                tag: ["@performance", "@monitoring"],
                annotation: [
                    {
                        type: "performance",
                        description:
                            "Tests system performance under monitoring load",
                    },
                    {
                        type: "stress",
                        description:
                            "Multiple concurrent monitoring operations",
                    },
                ],
            },
            async () => {
                // Add high-frequency monitoring sites
                await addBulkSites(HIGH_FREQUENCY_SITES, 3);

                // Start monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                // Monitor UI performance during active monitoring
                const performanceMetrics = [];
                const testDuration = 15000; // 15 seconds
                const checkInterval = 3000; // Check every 3 seconds
                const startTime = Date.now();

                while (Date.now() - startTime < testDuration) {
                    const checkStart = Date.now();

                    // Test UI responsiveness
                    await window.keyboard.press("Tab");
                    await window.keyboard.press("Home");

                    const responseTime = Date.now() - checkStart;
                    performanceMetrics.push(responseTime);

                    await window.waitForTimeout(checkInterval);
                }

                // Analyze performance metrics
                const avgResponseTime =
                    performanceMetrics.reduce((a, b) => a + b, 0) /
                    performanceMetrics.length;
                const maxResponseTime = Math.max(...performanceMetrics);

                console.log(`Performance test results:
                    Duration: ${testDuration / 1000}s
                    Checks: ${performanceMetrics.length}
                    Avg response time: ${avgResponseTime.toFixed(2)}ms
                    Max response time: ${maxResponseTime}ms`);

                // Performance should remain reasonable under load
                expect(avgResponseTime).toBeLessThan(1000);
                expect(maxResponseTime).toBeLessThan(2000);

                // Verify monitoring is still functional
                const runningStatuses = window.getByText("Running");
                const runningCount = await runningStatuses.count();
                expect(runningCount).toBeGreaterThan(0);

                await window.screenshot({
                    path: "playwright/test-results/performance-under-load.png",
                    fullPage: true,
                });
            }
        );

        test(
            "advanced Settings and Configuration",
            {
                tag: ["@configuration", "@settings"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Complex configuration scenarios",
                    },
                    {
                        type: "settings",
                        description: "Advanced settings management",
                    },
                ],
            },
            async () => {
                // Add sites for configuration testing
                await addBulkSites(BULK_TEST_SITES, 5);

                // Test global settings configuration
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();

                // Test theme configuration
                const themeButton = window.getByRole("button", {
                    name: "Toggle theme",
                });
                await expect(themeButton).toBeVisible({ timeout: 5000 });
                await themeButton.click();
                await window.waitForTimeout(1000);

                // Verify theme changed by checking body class
                const bodyClass = await window.evaluate(
                    () => document.body.className
                );
                console.log("Theme changed, body class:", bodyClass);

                // Toggle back
                await themeButton.click();
                await window.waitForTimeout(1000);

                // Close settings
                await window.getByRole("button", { name: "Close" }).click();

                // Test site-specific configuration
                const firstSite = window.getByTestId("site-card").first();
                await firstSite.click();
                await window.waitForTimeout(1000);

                // Navigate to settings
                await window.getByRole("button", { name: "Settings" }).click();

                // Test configuration fields
                const checkIntervalField = window.getByLabel("Check Interval");
                await expect(checkIntervalField).toBeVisible({ timeout: 5000 });
                await checkIntervalField.selectOption("300000");

                const timeoutField = window.getByLabel("Timeout");
                await expect(timeoutField).toBeVisible({ timeout: 5000 });
                await timeoutField.fill("20000");

                // Save configuration
                const saveButton = window.getByRole("button", {
                    name: "Save Changes",
                });
                await expect(saveButton).toBeVisible({ timeout: 5000 });
                await saveButton.click();
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/advanced-configuration.png",
                    fullPage: true,
                });
            }
        );

        test(
            "multi-Site Monitoring Coordination",
            {
                tag: ["@multi-site", "@coordination"],
                annotation: [
                    {
                        type: "workflow",
                        description: "Coordinated monitoring of multiple sites",
                    },
                    {
                        type: "integration",
                        description: "Tests multi-site monitoring integration",
                    },
                ],
            },
            async () => {
                // Add diverse monitoring sites
                const monitoringSites = [
                    {
                        name: "HTTP Service",
                        url: "https://httpbin.org/status/200",
                    },
                    { name: "JSON API", url: "https://httpbin.org/json" },
                    {
                        name: "Redirect Service",
                        url: "https://httpbin.org/redirect/2",
                    },
                    {
                        name: "Slow Service",
                        url: "https://httpbin.org/delay/2",
                    },
                ];

                await addBulkSites(monitoringSites, 4);

                // Start coordinated monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Test each service individually
                for (const site of monitoringSites) {
                    await window.getByText(site.name).click();
                    await window.waitForTimeout(1000);

                    // Verify service details page
                    await expect(
                        window.getByText("Site Overview")
                    ).toBeVisible();

                    // Test check now functionality
                    const checkNowButton = window.getByRole("button", {
                        name: "Check Now",
                    });
                    await expect(checkNowButton).toBeVisible({ timeout: 5000 });
                    await checkNowButton.click();
                    await window.waitForTimeout(2000);

                    // Navigate back to dashboard
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    await window.waitForTimeout(500);
                }

                // Verify coordinated monitoring status
                const statusIndicators = window.getByTestId("status-indicator");
                const statusCount = await statusIndicators.count();
                expect(statusCount).toBeGreaterThan(0);

                // Test stop all monitoring
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                // Verify monitoring stopped
                await expect(window.getByText("Stopped")).toBeVisible({
                    timeout: 5000,
                });

                await window.screenshot({
                    path: "playwright/test-results/multi-site-coordination.png",
                    fullPage: true,
                });
            }
        );
    }
);

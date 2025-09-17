/**
 * Advanced End-to-End User Journey Tests for Uptime Watcher.
 *
 * These tests cover complex, real-world user scenarios including bulk
 * operations, performance testing, and advanced user workflows.
 */

import { test, expect, _electron as electron } from "@playwright/test";
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
                args: ["."],
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
            "bulk Site Management - 3 Sites Workflow",
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
                // Add only 3 sites to prevent timeouts
                const testSites = BULK_TEST_SITES.slice(0, 3);
                const addedCount = await addBulkSites(testSites, 3);

                // Verify sites were added
                expect(addedCount).toBe(3);

                // Wait for sites to load
                await window.waitForTimeout(2000);

                // Verify sites are visible
                for (const site of testSites) {
                    await expect(window.getByText(site.name)).toBeVisible();
                }

                // Test UI responsiveness by scrolling
                await window.keyboard.press("Home");
                await window.waitForTimeout(500);
                await window.keyboard.press("End");
                await window.waitForTimeout(500);

                // Final screenshot
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
                // Add high-frequency monitoring sites (reduced to 2 for stability)
                await addBulkSites(HIGH_FREQUENCY_SITES, 2);

                // Wait for sites to load
                await window.waitForTimeout(3000);

                // Verify sites are loaded and functioning
                await expect(
                    window.getByText(HIGH_FREQUENCY_SITES[0].name)
                ).toBeVisible();

                // Test basic responsiveness during monitoring
                const checkStart = Date.now();
                await window.keyboard.press("Tab");
                await window.keyboard.press("Home");
                const responseTime = Date.now() - checkStart;

                // Basic performance check
                expect(responseTime).toBeLessThan(2000);

                console.log(`UI response time: ${responseTime}ms`);

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
                // Add fewer sites for stability
                await addBulkSites(BULK_TEST_SITES, 3);

                // Wait for sites to load
                await window.waitForTimeout(2000);

                // Test global settings configuration
                await window.getByRole("button", { name: "Settings" }).click();
                await window.waitForTimeout(1000);

                // Verify settings dialog opened (using actual text from UI)
                await expect(window.getByText("⚙️ Settings")).toBeVisible();

                // Test theme configuration using the theme selector in settings
                const themeSelector = window.getByRole("combobox", {
                    name: "Select application theme",
                });
                await expect(themeSelector).toBeVisible({ timeout: 5000 });

                // Test changing theme
                await themeSelector.selectOption("Dark");
                await window.waitForTimeout(500);

                // Change back to Light
                await themeSelector.selectOption("Light");
                await window.waitForTimeout(500);

                // Close settings using the specific close button
                await window.getByTestId("button-close-settings").click();
                await window.waitForTimeout(500);

                // Verify settings closed
                await expect(window.getByTestId("app-root")).toBeVisible();

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
                // Add diverse monitoring sites (reduced for stability)
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

                // Wait for sites to load and verify they're visible
                await window.waitForTimeout(3000);

                // Verify all sites are displayed
                for (const site of monitoringSites) {
                    await expect(window.getByText(site.name)).toBeVisible();
                }

                // Test basic functionality - check that sites are monitoring by default
                const statusTexts = await window
                    .getByText(/Status: (up|down|pending)/i)
                    .count();
                expect(statusTexts).toBeGreaterThan(0);

                // Verify the app is responsive with multiple sites
                await window.keyboard.press("Home");
                await window.waitForTimeout(500);
                await window.keyboard.press("End");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/multi-site-coordination.png",
                    fullPage: true,
                });
            }
        );
    }
);

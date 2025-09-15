/**
 * Edge Cases and Error Handling E2E Tests for Uptime Watcher.
 *
 * These tests cover error scenarios, edge cases, network failures, and recovery
 * mechanisms that real users might encounter.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";
import { ensureCleanState } from "../utils/modal-cleanup";

// Error test scenarios
const ERROR_TEST_SCENARIOS = {
    invalidUrls: [
        { name: "Empty URL", url: "", expectedError: "URL is required" },
        {
            name: "Invalid Protocol",
            url: "ftp://invalid.com",
            expectedError: "Invalid URL",
        },
        {
            name: "Malformed URL",
            url: "not-a-url",
            expectedError: "Please enter a valid URL",
        },
        {
            name: "Missing Protocol",
            url: "example.com",
            expectedError: "Invalid URL",
        },
    ],
    networkFailures: [
        {
            name: "404 Service",
            url: "https://httpbin.org/status/404",
            status: "Error",
        },
        {
            name: "500 Service",
            url: "https://httpbin.org/status/500",
            status: "Error",
        },
        {
            name: "Timeout Service",
            url: "https://httpbin.org/delay/30",
            status: "Timeout",
        },
        {
            name: "Non-existent Domain",
            url: "https://this-domain-does-not-exist-12345.com",
            status: "Error",
        },
    ],
    extremeValues: [
        {
            name: "Very Long Site Name",
            url: "https://httpbin.org/status/200",
            siteName: "A".repeat(200),
        },
        {
            name: "Unicode Site Name",
            url: "https://httpbin.org/status/200",
            siteName: "测试网站 🚀 öäü",
        },
        {
            name: "Special Characters",
            url: "https://httpbin.org/status/200",
            siteName: "Site@#$%^&*()_+",
        },
    ],
} as const;

test.describe(
    "edge Cases and Error Handling - E2E",
    {
        tag: [
            "@e2e",
            "@error-handling",
            "@edge-cases",
            "@resilience",
        ],
        annotation: {
            type: "category",
            description: "Error scenarios and edge case handling",
        },
    },
    () => {
        let electronApp: any;
        let window: any;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: [path.join(__dirname, "../../dist-electron/main.js")],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                    SKIP_AUTO_UPDATES: "true",
                    TEST_MODE: "true",
                },
                timeout: 30000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Clean up for error tests
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await (window as any).electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.error("Failed cleanup in error test:", error);
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
            "invalid URL Validation and Error Messages",
            {
                tag: ["@validation", "@error-messages"],
                annotation: [
                    {
                        type: "validation",
                        description: "Tests URL validation and error messaging",
                    },
                    {
                        type: "user-experience",
                        description: "Ensures clear error feedback to users",
                    },
                ],
            },
            async () => {
                for (const scenario of ERROR_TEST_SCENARIOS.invalidUrls) {
                    // Open add site modal
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    // Fill in invalid data
                    await window
                        .getByLabel("Site Name")
                        .fill(`Test ${scenario.name}`);
                    await window.getByLabel("URL").fill(scenario.url);

                    // Try to submit
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    // Verify error message appears
                    const errorMessage = window
                        .getByText(scenario.expectedError)
                        .or(window.getByText("Please enter a valid URL"));
                    await expect(errorMessage).toBeVisible({ timeout: 5000 });

                    console.log(
                        `✓ Validated error for ${scenario.name}: ${scenario.expectedError}`
                    );

                    // Close modal and try next scenario
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                await window.screenshot({
                    path: "playwright/test-results/invalid-url-validation.png",
                    fullPage: true,
                });
            }
        );

        test(
            "network Failure Handling and Recovery",
            {
                tag: [
                    "@network",
                    "@recovery",
                    "@monitoring",
                ],
                annotation: [
                    {
                        type: "resilience",
                        description:
                            "Tests handling of network failures and service errors",
                    },
                    {
                        type: "monitoring",
                        description:
                            "Verifies error state detection and recovery",
                    },
                ],
            },
            async () => {
                // Add failing services to test error handling
                for (const failureScenario of ERROR_TEST_SCENARIOS.networkFailures) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    await window
                        .getByLabel("Site Name")
                        .fill(failureScenario.name);
                    await window.getByLabel("URL").fill(failureScenario.url);

                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    // Verify site was added despite being a failing URL
                    await expect(
                        window.getByText(failureScenario.name)
                    ).toBeVisible();
                }

                // Start monitoring all failing services
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(5000); // Wait for initial checks

                // Verify error states are properly detected
                const errorIndicators = window
                    .getByText("Error")
                    .or(window.getByText("Failed"))
                    .or(window.getByText("Down"));
                const errorCount = await errorIndicators.count();
                expect(errorCount).toBeGreaterThan(0);

                // Test individual error recovery - check a failing site
                const firstFailingSite = window.getByText(
                    ERROR_TEST_SCENARIOS.networkFailures[0].name
                );
                await firstFailingSite.click();
                await window.waitForTimeout(1000);

                // Verify error details are shown
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Test manual retry
                const checkNowButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNowButton).toBeVisible({ timeout: 5000 });
                await checkNowButton.click();
                await window.waitForTimeout(3000);

                // Navigate back and verify system is still stable
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();
                await window.waitForTimeout(500);

                // Stop monitoring and verify graceful shutdown
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/network-failure-handling.png",
                    fullPage: true,
                });
            }
        );

        test(
            "extreme Values and Unicode Handling",
            {
                tag: [
                    "@unicode",
                    "@extreme-values",
                    "@internationalization",
                ],
                annotation: [
                    {
                        type: "data-handling",
                        description:
                            "Tests handling of extreme values and unicode characters",
                    },
                    {
                        type: "internationalization",
                        description:
                            "Verifies unicode and special character support",
                    },
                ],
            },
            async () => {
                for (const scenario of ERROR_TEST_SCENARIOS.extremeValues) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    // Test extreme site name values
                    await window
                        .getByLabel("Site Name")
                        .fill(scenario.siteName);
                    await window.getByLabel("URL").fill(scenario.url);

                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    // Verify site was added and name is properly handled
                    const siteText = window.getByText(
                        scenario.siteName.substring(0, 50)
                    ); // Check first 50 chars
                    await expect(siteText).toBeVisible({ timeout: 5000 });

                    console.log(`✓ Successfully handled: ${scenario.name}`);
                }

                // Test UI still functions with extreme values
                await window.keyboard.press("Home");
                await window.keyboard.press("End");
                await window.waitForTimeout(500);

                // Verify all sites are visible and UI is responsive
                const siteCards = window.getByTestId("site-card");
                await expect(siteCards).toHaveCount(
                    ERROR_TEST_SCENARIOS.extremeValues.length
                );

                await window.screenshot({
                    path: "playwright/test-results/extreme-values-unicode.png",
                    fullPage: true,
                });
            }
        );

        test(
            "application Recovery After Errors",
            {
                tag: [
                    "@recovery",
                    "@stability",
                    "@resilience",
                ],
                annotation: [
                    {
                        type: "stability",
                        description:
                            "Tests application recovery and stability after errors",
                    },
                    {
                        type: "resilience",
                        description:
                            "Verifies system resilience under error conditions",
                    },
                ],
            },
            async () => {
                // Add a mix of working and failing sites
                const mixedSites = [
                    {
                        name: "Working Site",
                        url: "https://httpbin.org/status/200",
                    },
                    {
                        name: "Failing Site",
                        url: "https://httpbin.org/status/500",
                    },
                    {
                        name: "Another Working Site",
                        url: "https://httpbin.org/json",
                    },
                ];

                for (const site of mixedSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);
                }

                // Start monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(5000);

                // Simulate rapid interactions during error states
                for (let i = 0; i < 5; i++) {
                    await window.keyboard.press("Tab");
                    await window.keyboard.press("Enter");
                    await window.waitForTimeout(200);
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(200);
                }

                // Verify application is still responsive
                await expect(window.getByText("Working Site")).toBeVisible();
                await expect(window.getByText("Failing Site")).toBeVisible();

                // Test settings access during mixed error states
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();
                await window.getByRole("button", { name: "Close" }).click();

                // Test site navigation during error states
                await window.getByText("Working Site").click();
                await expect(window.getByText("Site Overview")).toBeVisible();
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Verify error recovery - stop and restart monitoring
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Final stability check
                const allSiteNames = [
                    "Working Site",
                    "Failing Site",
                    "Another Working Site",
                ];
                for (const siteName of allSiteNames) {
                    await expect(window.getByText(siteName)).toBeVisible();
                }

                await window.screenshot({
                    path: "playwright/test-results/application-recovery.png",
                    fullPage: true,
                });
            }
        );

        test(
            "concurrent Operations and Race Conditions",
            {
                tag: [
                    "@concurrency",
                    "@race-conditions",
                    "@stress",
                ],
                annotation: [
                    {
                        type: "concurrency",
                        description: "Tests handling of concurrent operations",
                    },
                    {
                        type: "reliability",
                        description:
                            "Verifies system behavior under concurrent load",
                    },
                ],
            },
            async () => {
                // Add a site for concurrent testing
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window
                    .getByLabel("Site Name")
                    .fill("Concurrent Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(1000);

                // Test rapid start/stop operations
                for (let i = 0; i < 3; i++) {
                    await window
                        .getByRole("button", { name: "Start All Monitoring" })
                        .click();
                    await window.waitForTimeout(500);
                    await window
                        .getByRole("button", { name: "Stop All Monitoring" })
                        .click();
                    await window.waitForTimeout(500);
                }

                // Test concurrent modal operations
                for (let i = 0; i < 3; i++) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(200);
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(200);
                }

                // Test concurrent navigation
                await window.getByText("Concurrent Test Site").click();
                await window.waitForTimeout(500);
                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();
                await window.waitForTimeout(500);

                // Verify system stability after concurrent operations
                await expect(
                    window.getByText("Concurrent Test Site")
                ).toBeVisible();

                // Test final operations work correctly
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                const statusIndicators = window.getByTestId("status-indicator");
                const statusCount = await statusIndicators.count();
                expect(statusCount).toBeGreaterThan(0);

                await window.screenshot({
                    path: "playwright/test-results/concurrent-operations.png",
                    fullPage: true,
                });
            }
        );

        test(
            "database Corruption Recovery Simulation",
            {
                tag: [
                    "@database",
                    "@corruption",
                    "@recovery",
                ],
                annotation: [
                    {
                        type: "data-integrity",
                        description:
                            "Tests recovery from database corruption scenarios",
                    },
                    {
                        type: "resilience",
                        description: "Verifies data recovery mechanisms",
                    },
                ],
            },
            async () => {
                // Add sites to create database entries
                const testSites = [
                    {
                        name: "DB Test Site 1",
                        url: "https://httpbin.org/status/200",
                    },
                    { name: "DB Test Site 2", url: "https://httpbin.org/json" },
                ];

                for (const site of testSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);
                }

                // Start monitoring to create history data
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Simulate database stress by rapid operations
                for (let i = 0; i < 5; i++) {
                    await window.getByText("DB Test Site 1").click();
                    await window.waitForTimeout(200);
                    await window
                        .getByRole("button", { name: "Check Now" })
                        .click();
                    await window.waitForTimeout(500);
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    await window.waitForTimeout(200);
                }

                // Test data consistency after stress
                await expect(window.getByText("DB Test Site 1")).toBeVisible();
                await expect(window.getByText("DB Test Site 2")).toBeVisible();

                // Test data persistence simulation
                await window.getByRole("button", { name: "Settings" }).click();
                await window
                    .getByRole("button", { name: "🔄 Sync Data" })
                    .click();
                await window.waitForTimeout(2000);
                await window.getByRole("button", { name: "Close" }).click();

                // Verify sites are still present after sync operation
                for (const site of testSites) {
                    await expect(window.getByText(site.name)).toBeVisible();
                }

                await window.screenshot({
                    path: "playwright/test-results/database-recovery-simulation.png",
                    fullPage: true,
                });
            }
        );

        test(
            "memory Leak Prevention During Errors",
            {
                tag: [
                    "@memory",
                    "@performance",
                    "@leaks",
                ],
                annotation: [
                    {
                        type: "performance",
                        description:
                            "Tests memory management during error conditions",
                    },
                    {
                        type: "reliability",
                        description: "Verifies no memory leaks during failures",
                    },
                ],
            },
            async () => {
                // Add failing sites that could cause memory issues
                const memoryTestSites = [
                    {
                        name: "Memory Test 1",
                        url: "https://httpbin.org/status/500",
                    },
                    {
                        name: "Memory Test 2",
                        url: "https://httpbin.org/delay/10",
                    },
                    {
                        name: "Memory Test 3",
                        url: "https://this-will-fail.invalid",
                    },
                ];

                for (const site of memoryTestSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(500);
                }

                // Start monitoring failing sites
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                // Simulate sustained error conditions
                const iterations = 10;
                for (let i = 0; i < iterations; i++) {
                    // Trigger manual checks to simulate continued failures
                    const sites = [
                        "Memory Test 1",
                        "Memory Test 2",
                        "Memory Test 3",
                    ];
                    for (const siteName of sites) {
                        await window.getByText(siteName).click();
                        await window.waitForTimeout(200);

                        const checkNowButton = window.getByRole("button", {
                            name: "Check Now",
                        });
                        await expect(checkNowButton).toBeVisible({
                            timeout: 3000,
                        });
                        await checkNowButton.click();
                        await window.waitForTimeout(500);

                        await window
                            .getByRole("button", { name: "Back to Dashboard" })
                            .click();
                        await window.waitForTimeout(200);
                    }
                }

                // Check final memory usage
                const memoryInfo = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                              totalJSHeapSize: (performance as any).memory
                                  .totalJSHeapSize,
                          }
                        : { usedJSHeapSize: 0, totalJSHeapSize: 0 };
                });

                console.log("Memory usage after sustained errors:", memoryInfo);

                // Basic memory growth check - should not exceed 100MB
                const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
                expect(memoryUsageMB).toBeLessThan(100);

                // Stop monitoring and verify cleanup
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                // Final memory check after cleanup
                const finalMemoryInfo = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                          }
                        : { usedJSHeapSize: 0 };
                });

                console.log("Final memory usage:", finalMemoryInfo);

                // Verify application is still responsive
                await expect(window.getByText("Memory Test 1")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/memory-leak-prevention.png",
                    fullPage: true,
                });
            }
        );
    }
);

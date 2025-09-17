/**
 * Performance & Stress Tests for Uptime Watcher.
 *
 * These tests validate application performance under various load conditions,
 * resource constraints, and stress scenarios that could occur in production.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import { ensureCleanState } from "../utils/modal-cleanup";

// Performance test configurations
const PERFORMANCE_CONFIGS = {
    lightLoad: {
        siteCount: 10,
        checkInterval: 5000, // 5 seconds
        testDuration: 30000, // 30 seconds
    },
    mediumLoad: {
        siteCount: 25,
        checkInterval: 3000, // 3 seconds
        testDuration: 45000, // 45 seconds
    },
    heavyLoad: {
        siteCount: 50,
        checkInterval: 1000, // 1 second
        testDuration: 60000, // 1 minute
    },
} as const;

// Test site generators for different performance scenarios
const generatePerformanceTestSites = (count: number) => {
    const sites = [];
    for (let i = 1; i <= count; i++) {
        sites.push({
            name: `Perf Site ${i}`,
            url: `https://httpbin.org/status/200?site=${i}`,
        });
    }
    return sites;
};

const generateMixedResponseSites = (count: number) => {
    const sites = [];
    const statuses = [
        200,
        404,
        500,
        503,
    ];
    for (let i = 1; i <= count; i++) {
        const status = statuses[i % statuses.length];
        sites.push({
            name: `Mixed Perf Site ${i}`,
            url: `https://httpbin.org/status/${status}?site=${i}`,
        });
    }
    return sites;
};

const generateSlowResponseSites = (count: number) => {
    const sites = [];
    const delays = [
        1,
        2,
        3,
        5,
    ]; // seconds
    for (let i = 1; i <= count; i++) {
        const delay = delays[i % delays.length];
        sites.push({
            name: `Slow Site ${i}`,
            url: `https://httpbin.org/delay/${delay}?site=${i}`,
        });
    }
    return sites;
};

test.describe(
    "performance & Stress Tests - E2E",
    {
        tag: [
            "@e2e",
            "@performance",
            "@stress",
            "@load-testing",
        ],
        annotation: {
            type: "category",
            description:
                "Performance and stress testing under various load conditions",
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
                    TEST_MODE: "true",
                },
                timeout: 30000,
            });

            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Clean up for performance tests
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await (window as any).electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.error("Failed cleanup in performance test:", error);
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
            "light Load Performance Test (10 sites)",
            {
                tag: ["@light-load", "@baseline-performance"],
                annotation: [
                    {
                        type: "performance",
                        description:
                            "Tests baseline performance with light load",
                    },
                    {
                        type: "monitoring",
                        description:
                            "Verifies monitoring efficiency with few sites",
                    },
                ],
            },
            async () => {
                const config = PERFORMANCE_CONFIGS.lightLoad;
                const testSites = generatePerformanceTestSites(
                    config.siteCount
                );

                console.log(
                    `Starting light load test with ${config.siteCount} sites`
                );

                // Measure site addition time
                const additionStartTime = Date.now();

                for (const site of testSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(200);
                }

                const additionTime = Date.now() - additionStartTime;
                console.log(`Site addition completed in ${additionTime}ms`);

                // Verify all sites were added
                await expect(window.getByTestId("site-card")).toHaveCount(
                    config.siteCount
                );

                // Measure monitoring startup time
                const monitoringStartTime = Date.now();
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();

                // Wait for initial status updates
                await window.waitForTimeout(5000);
                const monitoringStartupTime = Date.now() - monitoringStartTime;
                console.log(
                    `Monitoring startup completed in ${monitoringStartupTime}ms`
                );

                // Verify monitoring is active
                const statusIndicators = window.getByTestId("status-indicator");
                await expect(statusIndicators.first()).toBeVisible({
                    timeout: 10000,
                });

                // Monitor performance during operation
                const operationStartTime = Date.now();
                let statusUpdateCount = 0;

                // Run monitoring for test duration
                const endTime = Date.now() + config.testDuration;
                while (Date.now() < endTime) {
                    await window.waitForTimeout(config.checkInterval);
                    statusUpdateCount++;

                    // Check UI responsiveness
                    await expect(
                        window.getByText(testSites[0].name)
                    ).toBeVisible();

                    // Sample navigation performance
                    await window.getByText(testSites[0].name).click();
                    await expect(
                        window.getByText("Site Overview")
                    ).toBeVisible();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    await window.waitForTimeout(500);
                }

                const totalOperationTime = Date.now() - operationStartTime;
                console.log(
                    `Light load test completed: ${statusUpdateCount} cycles in ${totalOperationTime}ms`
                );

                // Stop monitoring and measure cleanup time
                const cleanupStartTime = Date.now();
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);
                const cleanupTime = Date.now() - cleanupStartTime;
                console.log(`Monitoring cleanup completed in ${cleanupTime}ms`);

                // Performance assertions
                expect(additionTime).toBeLessThan(30000); // 30 seconds max for adding sites
                expect(monitoringStartupTime).toBeLessThan(10000); // 10 seconds max startup
                expect(cleanupTime).toBeLessThan(5000); // 5 seconds max cleanup

                await window.screenshot({
                    path: "playwright/test-results/light-load-performance.png",
                    fullPage: true,
                });
            }
        );

        test(
            "medium Load Stress Test (25 sites)",
            {
                tag: ["@medium-load", "@stress-testing"],
                annotation: [
                    {
                        type: "stress",
                        description:
                            "Tests application under medium load conditions",
                    },
                    {
                        type: "scalability",
                        description:
                            "Verifies scalability with moderate site count",
                    },
                ],
            },
            async () => {
                const config = PERFORMANCE_CONFIGS.mediumLoad;
                const testSites = generateMixedResponseSites(config.siteCount);

                console.log(
                    `Starting medium load test with ${config.siteCount} sites`
                );

                // Add sites in batches for efficiency
                const batchSize = 5;
                for (let i = 0; i < testSites.length; i += batchSize) {
                    const batch = testSites.slice(i, i + batchSize);

                    for (const site of batch) {
                        await window
                            .getByRole("button", { name: "Add new site" })
                            .click();
                        await window.getByLabel("Site Name").fill(site.name);
                        await window.getByLabel("URL").fill(site.url);
                        await window
                            .getByRole("button", { name: "Add Site" })
                            .click();
                        await window.waitForTimeout(100);
                    }

                    // Brief pause between batches
                    await window.waitForTimeout(500);
                    console.log(
                        `Added batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testSites.length / batchSize)}`
                    );
                }

                // Verify all sites were added
                await expect(window.getByTestId("site-card")).toHaveCount(
                    config.siteCount
                );

                // Start monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Stress test with rapid operations
                const stressOperations = [
                    async () => {
                        // Rapid site navigation
                        const siteIndex = Math.floor(
                            Math.random() * testSites.length
                        );
                        await window
                            .getByText(testSites[siteIndex].name)
                            .click();
                        await window.waitForTimeout(200);
                        await window
                            .getByRole("button", { name: "Back to Dashboard" })
                            .click();
                    },
                    async () => {
                        // Settings access
                        await window
                            .getByRole("button", { name: "Settings" })
                            .click();
                        await window.waitForTimeout(200);
                        await window
                            .getByRole("button", { name: "Close" })
                            .click();
                    },
                    async () => {
                        // Keyboard navigation
                        await window.keyboard.press("Tab");
                        await window.keyboard.press("Tab");
                        await window.keyboard.press("Enter");
                        await window.waitForTimeout(200);
                        await window.keyboard.press("Escape");
                    },
                ];

                // Run stress operations for test duration
                const endTime = Date.now() + config.testDuration;
                let operationCount = 0;

                while (Date.now() < endTime) {
                    const operation =
                        stressOperations[
                            operationCount % stressOperations.length
                        ];
                    await operation();
                    operationCount++;
                    await window.waitForTimeout(config.checkInterval);
                }

                console.log(
                    `Medium load stress test completed: ${operationCount} operations`
                );

                // Verify system stability under stress
                await expect(window.getByText(testSites[0].name)).toBeVisible();
                await expect(window.getByTestId("site-card")).toHaveCount(
                    config.siteCount
                );

                // Check status indicators are still functional
                const activeIndicators = window.getByTestId("status-indicator");
                await expect(activeIndicators.first()).toBeVisible();

                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                await window.screenshot({
                    path: "playwright/test-results/medium-load-stress.png",
                    fullPage: true,
                });
            }
        );

        test(
            "heavy Load Endurance Test (50 sites)",
            {
                tag: ["@heavy-load", "@endurance-testing"],
                annotation: [
                    {
                        type: "endurance",
                        description:
                            "Tests application endurance under heavy load",
                    },
                    {
                        type: "performance",
                        description:
                            "Verifies performance limits and stability",
                    },
                ],
            },
            async () => {
                const config = PERFORMANCE_CONFIGS.heavyLoad;
                const testSites = generateSlowResponseSites(config.siteCount);

                console.log(
                    `Starting heavy load test with ${config.siteCount} sites`
                );

                // Add sites efficiently
                const batchSize = 10;
                for (let i = 0; i < testSites.length; i += batchSize) {
                    const batch = testSites.slice(i, i + batchSize);

                    for (const site of batch) {
                        await window
                            .getByRole("button", { name: "Add new site" })
                            .click();
                        await window.getByLabel("Site Name").fill(site.name);
                        await window.getByLabel("URL").fill(site.url);
                        await window
                            .getByRole("button", { name: "Add Site" })
                            .click();
                        await window.waitForTimeout(50);
                    }

                    console.log(
                        `Heavy load: Added batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testSites.length / batchSize)}`
                    );
                }

                // Verify all sites were added
                await expect(window.getByTestId("site-card")).toHaveCount(
                    config.siteCount
                );

                // Start monitoring heavy load
                const monitoringStartTime = Date.now();
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();

                // Wait longer for heavy load initialization
                await window.waitForTimeout(10000);
                const heavyStartupTime = Date.now() - monitoringStartTime;
                console.log(
                    `Heavy load monitoring startup: ${heavyStartupTime}ms`
                );

                // Endurance test with sustained operations
                const endTime = Date.now() + config.testDuration;
                let enduranceOperations = 0;
                const startMemory = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                          }
                        : { usedJSHeapSize: 0 };
                });

                while (Date.now() < endTime) {
                    // Continuous site checking
                    const siteIndex = enduranceOperations % testSites.length;
                    await window.getByText(testSites[siteIndex].name).click();
                    await window.waitForTimeout(200);

                    // Force refresh
                    const checkNowButton = window.getByRole("button", {
                        name: "Check Now",
                    });
                    await checkNowButton.click();
                    await window.waitForTimeout(500);

                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    await window.waitForTimeout(200);

                    enduranceOperations++;

                    // Brief pause for heavy load
                    await window.waitForTimeout(config.checkInterval);
                }

                console.log(
                    `Heavy load endurance test completed: ${enduranceOperations} operations`
                );

                // Memory check after heavy load
                const endMemory = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                          }
                        : { usedJSHeapSize: 0 };
                });

                const memoryGrowth =
                    (endMemory.usedJSHeapSize - startMemory.usedJSHeapSize) /
                    (1024 * 1024);
                console.log(
                    `Memory growth during heavy load: ${memoryGrowth.toFixed(2)} MB`
                );

                // Verify system still responsive after heavy load
                await expect(window.getByText(testSites[0].name)).toBeVisible();
                await expect(window.getByTestId("site-card")).toHaveCount(
                    config.siteCount
                );

                // Performance assertions for heavy load
                expect(heavyStartupTime).toBeLessThan(30000); // 30 seconds max for heavy startup
                expect(memoryGrowth).toBeLessThan(50); // Memory growth should be < 50MB

                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(5000);

                await window.screenshot({
                    path: "playwright/test-results/heavy-load-endurance.png",
                    fullPage: true,
                });
            }
        );

        test(
            "resource Constraint Simulation",
            {
                tag: ["@resource-constraints", "@low-resources"],
                annotation: [
                    {
                        type: "resource-management",
                        description:
                            "Tests behavior under simulated resource constraints",
                    },
                    {
                        type: "resilience",
                        description:
                            "Verifies graceful degradation under constraints",
                    },
                ],
            },
            async () => {
                // Add sites for resource constraint testing
                const constraintSites = [
                    {
                        name: "Resource Test 1",
                        url: "https://httpbin.org/status/200",
                    },
                    {
                        name: "Resource Test 2",
                        url: "https://httpbin.org/delay/5",
                    },
                    {
                        name: "Resource Test 3",
                        url: "https://httpbin.org/status/503",
                    },
                ];

                for (const site of constraintSites) {
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

                // Start monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Simulate resource constraints with rapid operations
                const constraintOperations = 20;
                for (let i = 0; i < constraintOperations; i++) {
                    // Rapid fire operations to stress resources
                    await window.getByText("Resource Test 1").click();
                    await window
                        .getByRole("button", { name: "Check Now" })
                        .click();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();

                    await window.getByText("Resource Test 2").click();
                    await window
                        .getByRole("button", { name: "Check Now" })
                        .click();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();

                    await window.getByText("Resource Test 3").click();
                    await window
                        .getByRole("button", { name: "Check Now" })
                        .click();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();

                    // Minimal wait to maximize resource pressure
                    await window.waitForTimeout(100);
                }

                // Verify application remains functional under resource pressure
                await expect(window.getByText("Resource Test 1")).toBeVisible();
                await expect(window.getByText("Resource Test 2")).toBeVisible();
                await expect(window.getByText("Resource Test 3")).toBeVisible();

                // Test settings functionality under constraints
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();
                await window.getByRole("button", { name: "Close" }).click();

                // Memory check under resource constraints
                const constraintMemory = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                              totalJSHeapSize: (performance as any).memory
                                  .totalJSHeapSize,
                          }
                        : { usedJSHeapSize: 0, totalJSHeapSize: 0 };
                });

                console.log(
                    "Memory under resource constraints:",
                    constraintMemory
                );

                // Ensure memory usage is reasonable
                const memoryUsageMB =
                    constraintMemory.usedJSHeapSize / (1024 * 1024);
                expect(memoryUsageMB).toBeLessThan(75); // Should stay under 75MB even under stress

                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/resource-constraints.png",
                    fullPage: true,
                });
            }
        );

        test(
            "performance Regression Detection",
            {
                tag: ["@regression", "@performance-monitoring"],
                annotation: [
                    {
                        type: "regression-testing",
                        description:
                            "Detects performance regressions in key operations",
                    },
                    {
                        type: "benchmarking",
                        description: "Establishes performance benchmarks",
                    },
                ],
            },
            async () => {
                const benchmarkSites = generatePerformanceTestSites(5);

                // Benchmark: Site Addition Performance
                const additionTimes: number[] = [];
                for (const site of benchmarkSites) {
                    const startTime = Date.now();

                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(200);

                    const additionTime = Date.now() - startTime;
                    additionTimes.push(additionTime);
                }

                const avgAdditionTime =
                    additionTimes.reduce((a, b) => a + b, 0) /
                    additionTimes.length;
                console.log(`Average site addition time: ${avgAdditionTime}ms`);

                // Benchmark: Navigation Performance
                const navigationTimes: number[] = [];
                for (let i = 0; i < 5; i++) {
                    const startTime = Date.now();

                    await window.getByText(benchmarkSites[0].name).click();
                    await expect(
                        window.getByText("Site Overview")
                    ).toBeVisible();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    await window.waitForTimeout(200);

                    const navigationTime = Date.now() - startTime;
                    navigationTimes.push(navigationTime);
                }

                const avgNavigationTime =
                    navigationTimes.reduce((a, b) => a + b, 0) /
                    navigationTimes.length;
                console.log(`Average navigation time: ${avgNavigationTime}ms`);

                // Benchmark: Monitoring Startup Performance
                const monitoringStartTime = Date.now();
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);
                const monitoringTime = Date.now() - monitoringStartTime;
                console.log(`Monitoring startup time: ${monitoringTime}ms`);

                // Performance regression assertions
                expect(avgAdditionTime).toBeLessThan(3000); // 3 seconds max per site
                expect(avgNavigationTime).toBeLessThan(2000); // 2 seconds max per navigation
                expect(monitoringTime).toBeLessThan(10000); // 10 seconds max for monitoring startup

                // Memory performance benchmark
                const benchmarkMemory = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                          }
                        : { usedJSHeapSize: 0 };
                });

                const memoryUsageMB =
                    benchmarkMemory.usedJSHeapSize / (1024 * 1024);
                console.log(
                    `Benchmark memory usage: ${memoryUsageMB.toFixed(2)} MB`
                );
                expect(memoryUsageMB).toBeLessThan(30); // Baseline memory should be under 30MB

                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/performance-regression.png",
                    fullPage: true,
                });
            }
        );
    }
);

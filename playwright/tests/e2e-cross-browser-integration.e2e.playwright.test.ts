/**
 * Cross-Browser Integration Tests for Uptime Watcher.
 *
 * These tests verify consistent behavior across different browser engines and
 * configurations, ensuring compatibility and reliability across platforms.
 */

import { test, expect, _electron as electron } from "@playwright/test";
import { ensureCleanState } from "../utils/modal-cleanup";

// Cross-browser test configurations
const CROSS_BROWSER_CONFIG = {
    testSites: [
        { name: "Browser Test Site 1", url: "https://httpbin.org/status/200" },
        { name: "Browser Test Site 2", url: "https://httpbin.org/json" },
        { name: "Browser Test Site 3", url: "https://httpbin.org/html" },
    ],
    features: [
        "site-management",
        "monitoring",
        "navigation",
        "settings",
        "keyboard-navigation",
    ],
    browserFeatures: {
        storage: [
            "localStorage",
            "sessionStorage",
            "indexedDB",
        ],
        apis: [
            "fetch",
            "WebSocket",
            "notifications",
        ],
        rendering: [
            "css-grid",
            "flexbox",
            "animations",
        ],
    },
} as const;

test.describe(
    "cross-Browser Integration Tests - E2E",
    {
        tag: [
            "@e2e",
            "@cross-browser",
            "@compatibility",
            "@integration",
        ],
        annotation: {
            type: "category",
            description: "Cross-browser compatibility and integration testing",
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

            // Clean up for cross-browser tests
            await window.evaluate(async () => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await (window as any).electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.error(
                        "Failed cleanup in cross-browser test:",
                        error
                    );
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
            "core Functionality Across Browser Engines",
            {
                tag: ["@core-functionality", "@browser-engines"],
                annotation: [
                    {
                        type: "compatibility",
                        description:
                            "Tests core features work consistently across browser engines",
                    },
                    {
                        type: "feature-parity",
                        description:
                            "Verifies feature parity across different browsers",
                    },
                ],
            },
            async () => {
                // Test basic site management functionality
                for (const site of CROSS_BROWSER_CONFIG.testSites) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.getByLabel("Site Name").fill(site.name);
                    await window.getByLabel("URL").fill(site.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(300);
                }

                // Verify sites were added
                await expect(window.getByTestId("site-card")).toHaveCount(
                    CROSS_BROWSER_CONFIG.testSites.length
                );

                // Test monitoring functionality
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Verify monitoring is active
                const statusIndicators = window.getByTestId("status-indicator");
                await expect(statusIndicators.first()).toBeVisible({
                    timeout: 10000,
                });

                // Test navigation functionality
                await window
                    .getByText(CROSS_BROWSER_CONFIG.testSites[0].name)
                    .click();
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Test detailed view functionality
                const checkNowButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNowButton).toBeVisible();
                await checkNowButton.click();
                await window.waitForTimeout(2000);

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Test settings functionality
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();
                await window.getByRole("button", { name: "Close" }).click();

                // Stop monitoring
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/core-functionality-cross-browser.png",
                    fullPage: true,
                });
            }
        );

        test(
            "browser API Compatibility",
            {
                tag: ["@api-compatibility", "@browser-apis"],
                annotation: [
                    {
                        type: "api-testing",
                        description:
                            "Tests browser API compatibility and fallbacks",
                    },
                    {
                        type: "feature-detection",
                        description:
                            "Verifies feature detection and graceful degradation",
                    },
                ],
            },
            async () => {
                // Test browser API availability
                const apiSupport = await window.evaluate(() => {
                    return {
                        fetch: typeof fetch !== "undefined",
                        localStorage: typeof localStorage !== "undefined",
                        sessionStorage: typeof sessionStorage !== "undefined",
                        indexedDB: typeof indexedDB !== "undefined",
                        WebSocket: typeof WebSocket !== "undefined",
                        Notification: typeof Notification !== "undefined",
                        performance: typeof performance !== "undefined",
                        requestAnimationFrame:
                            typeof requestAnimationFrame !== "undefined",
                    };
                });

                console.log("Browser API support:", apiSupport);

                // Essential APIs should be available in Electron
                expect(apiSupport.fetch).toBeTruthy();
                expect(apiSupport.localStorage).toBeTruthy();
                expect(apiSupport.performance).toBeTruthy();

                // Test localStorage functionality
                await window.evaluate(() => {
                    localStorage.setItem("crossBrowserTest", "testValue");
                    return localStorage.getItem("crossBrowserTest");
                });

                const localStorageValue = await window.evaluate(() => {
                    return localStorage.getItem("crossBrowserTest");
                });
                expect(localStorageValue).toBe("testValue");

                // Add a test site to create application data
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("API Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test fetch API usage by starting monitoring
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Verify fetch worked (monitoring is active)
                const statusIndicator = window.getByTestId("status-indicator");
                await expect(statusIndicator.first()).toBeVisible();

                // Test manual check (uses fetch)
                await window.getByText("API Test Site").click();
                await window.waitForTimeout(500);

                const checkButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await checkButton.click();
                await window.waitForTimeout(2000);

                // Should complete without errors
                await expect(window.getByText("Site Overview")).toBeVisible();

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Clean up localStorage
                await window.evaluate(() => {
                    localStorage.removeItem("crossBrowserTest");
                });

                await window.screenshot({
                    path: "playwright/test-results/browser-api-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "css and Rendering Compatibility",
            {
                tag: ["@css-compatibility", "@rendering"],
                annotation: [
                    {
                        type: "rendering",
                        description:
                            "Tests CSS and rendering compatibility across browsers",
                    },
                    {
                        type: "visual-consistency",
                        description:
                            "Verifies visual consistency across browser engines",
                    },
                ],
            },
            async () => {
                // Add test sites
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("CSS Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test CSS feature detection
                const cssSupport = await window.evaluate(() => {
                    const testElement = document.createElement("div");
                    document.body.appendChild(testElement);

                    console.log("Testing CSS features");
                    const flexSupport = CSS.supports("display", "flex");
                    const gridSupport = CSS.supports("display", "grid");
                    const variableSupport = CSS.supports(
                        "color",
                        "var(--test)"
                    );
                    const transformSupport = CSS.supports(
                        "transform",
                        "translateX(1px)"
                    );
                    const animationSupport = CSS.supports(
                        "animation-duration",
                        "1s"
                    );
                    const backdropSupport = CSS.supports(
                        "backdrop-filter",
                        "blur(1px)"
                    );

                    document.body.removeChild(testElement);

                    return {
                        flexbox: flexSupport,
                        grid: gridSupport,
                        customProperties: variableSupport,
                        transforms: transformSupport,
                        animations: animationSupport,
                        backdrop: backdropSupport,
                    };
                });

                console.log("CSS feature support:", cssSupport);

                // Modern CSS features should be supported in Electron
                expect(cssSupport.flexbox).toBeTruthy();
                expect(cssSupport.transforms).toBeTruthy();
                expect(cssSupport.customProperties).toBeTruthy();

                // Test layout rendering
                const layoutMetrics = await window.evaluate(() => {
                    const siteCards = document.querySelectorAll(
                        "[data-testid='site-card']"
                    );
                    const firstCard = siteCards[0];

                    const cardRect = firstCard?.getBoundingClientRect();
                    const cardWidth = cardRect?.width || 0;
                    const cardHeight = cardRect?.height || 0;
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;

                    return {
                        cardCount: siteCards.length,
                        cardWidth,
                        cardHeight,
                        windowWidth,
                        windowHeight,
                    };
                });

                console.log("Layout metrics:", layoutMetrics);

                // Basic layout validation
                expect(layoutMetrics.cardCount).toBeGreaterThan(0);
                expect(layoutMetrics.cardWidth).toBeGreaterThan(0);
                expect(layoutMetrics.cardHeight).toBeGreaterThan(0);

                // Test responsive behavior by changing viewport
                await window.setViewportSize({ width: 800, height: 600 });
                await window.waitForTimeout(500);

                const responsiveMetrics = await window.evaluate(() => {
                    const firstCard = document.querySelector(
                        "[data-testid='site-card']"
                    );
                    return {
                        cardWidth:
                            firstCard?.getBoundingClientRect().width || 0,
                        windowWidth: window.innerWidth,
                    };
                });

                console.log("Responsive metrics:", responsiveMetrics);
                expect(responsiveMetrics.windowWidth).toBe(800);

                // Test element visibility and styling
                const buttonStyles = await window.evaluate(() => {
                    const addButton = document.querySelector("button");
                    const styles = window.getComputedStyle(
                        addButton as Element
                    );

                    return {
                        display: styles.display,
                        visibility: styles.visibility,
                        opacity: styles.opacity,
                        backgroundColor: styles.backgroundColor,
                        borderRadius: styles.borderRadius,
                    };
                });

                console.log("Button styles:", buttonStyles);
                expect(buttonStyles.display).not.toBe("none");
                expect(buttonStyles.visibility).not.toBe("hidden");

                await window.screenshot({
                    path: "playwright/test-results/css-rendering-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "keyboard and Mouse Interaction Compatibility",
            {
                tag: ["@interaction-compatibility", "@input-handling"],
                annotation: [
                    {
                        type: "interaction",
                        description:
                            "Tests keyboard and mouse interaction compatibility",
                    },
                    {
                        type: "input-handling",
                        description:
                            "Verifies input handling across browser engines",
                    },
                ],
            },
            async () => {
                // Add test site
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window
                    .getByLabel("Site Name")
                    .fill("Interaction Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Test keyboard navigation
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");

                // Test Enter key activation
                const siteCard = window.getByText("Interaction Test Site");
                await siteCard.focus();
                await window.keyboard.press("Enter");
                await expect(window.getByText("Site Overview")).toBeVisible();

                // Test Escape key
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Navigate back with keyboard
                const backButton = window.getByRole("button", {
                    name: "Back to Dashboard",
                });
                await backButton.focus();
                await window.keyboard.press("Enter");
                await expect(
                    window.getByText("Interaction Test Site")
                ).toBeVisible();

                // Test mouse interactions
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                // Test double-click behavior
                await siteCard.dblclick();
                await expect(window.getByText("Site Overview")).toBeVisible();

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Test right-click context handling
                await siteCard.click({ button: "right" });
                await window.waitForTimeout(500);

                // Test hover interactions
                await siteCard.hover();
                await window.waitForTimeout(300);

                // Test form input interactions
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(500);

                // Test text input
                const nameField = window.getByLabel("Site Name");
                await nameField.fill("Keyboard Test");
                await nameField.selectText();
                await window.keyboard.press("Delete");
                await nameField.type("Typed Site Name");

                // Test URL input
                const urlField = window.getByLabel("URL");
                await urlField.fill("https://httpbin.org/status/201");

                // Test form submission
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                await expect(window.getByText("Typed Site Name")).toBeVisible();

                // Test keyboard shortcuts
                await window.keyboard.press("Ctrl+A"); // Should not break anything
                await window.keyboard.press("Escape"); // Standard escape

                await window.screenshot({
                    path: "playwright/test-results/interaction-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "performance Across Browser Engines",
            {
                tag: ["@performance-compatibility", "@browser-performance"],
                annotation: [
                    {
                        type: "performance",
                        description:
                            "Tests performance consistency across browser engines",
                    },
                    {
                        type: "optimization",
                        description:
                            "Verifies performance optimizations work across browsers",
                    },
                ],
            },
            async () => {
                // Test performance timing API
                const performanceSupport = await window.evaluate(() => {
                    return {
                        performance: typeof performance !== "undefined",
                        timing: typeof performance?.timing !== "undefined",
                        navigation:
                            typeof performance?.navigation !== "undefined",
                        memory:
                            typeof (performance as any)?.memory !== "undefined",
                        measureUserAgentSpecificMemory:
                            typeof (performance as any)
                                ?.measureUserAgentSpecificMemory !==
                            "undefined",
                    };
                });

                console.log("Performance API support:", performanceSupport);
                expect(performanceSupport.performance).toBeTruthy();

                // Add sites for performance testing
                const perfTestSites = CROSS_BROWSER_CONFIG.testSites;
                const additionStartTime = Date.now();

                for (const site of perfTestSites) {
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

                const additionTime = Date.now() - additionStartTime;
                console.log(`Site addition performance: ${additionTime}ms`);

                // Test monitoring performance
                const monitoringStartTime = Date.now();
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                const monitoringTime = Date.now() - monitoringStartTime;
                console.log(
                    `Monitoring startup performance: ${monitoringTime}ms`
                );

                // Test navigation performance
                const navigationTimes: number[] = [];
                for (let i = 0; i < 3; i++) {
                    const navStartTime = Date.now();
                    await window.getByText(perfTestSites[0].name).click();
                    await expect(
                        window.getByText("Site Overview")
                    ).toBeVisible();
                    await window
                        .getByRole("button", { name: "Back to Dashboard" })
                        .click();
                    const navTime = Date.now() - navStartTime;
                    navigationTimes.push(navTime);
                    await window.waitForTimeout(200);
                }

                const avgNavigationTime =
                    navigationTimes.reduce((a, b) => a + b, 0) /
                    navigationTimes.length;
                console.log(
                    `Average navigation performance: ${avgNavigationTime}ms`
                );

                // Test memory usage if available
                const memoryInfo = await window.evaluate(() => {
                    return (performance as any).memory
                        ? {
                              usedJSHeapSize: (performance as any).memory
                                  .usedJSHeapSize,
                              totalJSHeapSize: (performance as any).memory
                                  .totalJSHeapSize,
                              jsHeapSizeLimit: (performance as any).memory
                                  .jsHeapSizeLimit,
                          }
                        : null;
                });

                console.log("Memory info:", memoryInfo);

                // Performance assertions
                expect(additionTime).toBeLessThan(10000); // 10 seconds max
                expect(monitoringTime).toBeLessThan(15000); // 15 seconds max
                expect(avgNavigationTime).toBeLessThan(3000); // 3 seconds max per navigation

                await window.screenshot({
                    path: "playwright/test-results/performance-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "data Storage and Persistence Compatibility",
            {
                tag: ["@storage-compatibility", "@data-persistence"],
                annotation: [
                    {
                        type: "storage",
                        description:
                            "Tests data storage compatibility across browser engines",
                    },
                    {
                        type: "persistence",
                        description:
                            "Verifies data persistence mechanisms work consistently",
                    },
                ],
            },
            async () => {
                // Test storage APIs availability
                const storageSupport = await window.evaluate(() => {
                    return {
                        localStorage: typeof localStorage !== "undefined",
                        sessionStorage: typeof sessionStorage !== "undefined",
                        indexedDB: typeof indexedDB !== "undefined",
                        cookies: typeof document.cookie !== "undefined",
                    };
                });

                console.log("Storage API support:", storageSupport);
                expect(storageSupport.localStorage).toBeTruthy();

                // Add test data
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("Storage Test Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Start monitoring to create persistent data
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(3000);

                // Create check history
                await window.getByText("Storage Test Site").click();
                await window.waitForTimeout(500);

                const checkButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await checkButton.click();
                await window.waitForTimeout(2000);

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Test settings persistence
                await window.getByRole("button", { name: "Settings" }).click();
                await expect(
                    window.getByText("Application Settings")
                ).toBeVisible();

                // Test data sync operation
                const syncButton = window.getByRole("button", {
                    name: "🔄 Sync Data",
                });
                await syncButton.click();
                await window.waitForTimeout(2000);

                await window.getByRole("button", { name: "Close" }).click();

                // Verify data persistence
                await expect(
                    window.getByText("Storage Test Site")
                ).toBeVisible();

                // Test localStorage functionality
                const localStorageTest = await window.evaluate(() => {
                    try {
                        const testKey = "crossBrowserStorageTest";
                        const testValue = JSON.stringify({
                            test: true,
                            timestamp: Date.now(),
                        });

                        localStorage.setItem(testKey, testValue);
                        const retrieved = localStorage.getItem(testKey);
                        const parsed = JSON.parse(retrieved || "{}");

                        localStorage.removeItem(testKey);

                        return { success: true, data: parsed };
                    } catch (error) {
                        return {
                            success: false,
                            error: (error as Error).message,
                        };
                    }
                });

                console.log("localStorage test:", localStorageTest);
                expect(localStorageTest.success).toBeTruthy();

                // Stop monitoring
                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/storage-persistence-compatibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "error Handling Across Browser Engines",
            {
                tag: ["@error-compatibility", "@cross-browser-errors"],
                annotation: [
                    {
                        type: "error-handling",
                        description:
                            "Tests error handling consistency across browser engines",
                    },
                    {
                        type: "resilience",
                        description:
                            "Verifies error resilience across different browsers",
                    },
                ],
            },
            async () => {
                // Test error handling for invalid URLs
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("Error Test Site");
                await window.getByLabel("URL").fill("invalid-url-format");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(1000);

                // Check for validation error
                const errorElement = window
                    .getByText("Please enter a valid URL")
                    .or(window.getByText("Invalid URL"));
                await expect(errorElement).toBeVisible({ timeout: 5000 });

                await window.keyboard.press("Escape");

                // Test network error handling
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.getByLabel("Site Name").fill("Network Error Site");
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/500");
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(500);

                // Start monitoring to trigger network error
                await window
                    .getByRole("button", { name: "Start All Monitoring" })
                    .click();
                await window.waitForTimeout(5000);

                // Verify error state is handled
                const statusIndicator = window.getByTestId("status-indicator");
                await expect(statusIndicator.first()).toBeVisible();

                // Test manual error recovery
                await window.getByText("Network Error Site").click();
                await window.waitForTimeout(500);

                const checkNowButton = window.getByRole("button", {
                    name: "Check Now",
                });
                await checkNowButton.click();
                await window.waitForTimeout(3000);

                // Should handle error gracefully
                await expect(window.getByText("Site Overview")).toBeVisible();

                await window
                    .getByRole("button", { name: "Back to Dashboard" })
                    .click();

                // Test JavaScript error resilience
                const jsErrorTest = await window.evaluate(() => {
                    try {
                        // Attempt to trigger a potential error scenario
                        const testElement = document.createElement("div");
                        testElement.innerHTML =
                            "<script>undefined.property</script>";

                        // This should not crash the application
                        return { success: true, error: null };
                    } catch (error) {
                        return {
                            success: false,
                            error: (error as Error).message,
                        };
                    }
                });

                console.log("JavaScript error handling test:", jsErrorTest);

                // Application should still be functional
                await expect(
                    window.getByText("Network Error Site")
                ).toBeVisible();

                await window
                    .getByRole("button", { name: "Stop All Monitoring" })
                    .click();
                await window.waitForTimeout(2000);

                await window.screenshot({
                    path: "playwright/test-results/error-handling-compatibility.png",
                    fullPage: true,
                });
            }
        );
    }
);

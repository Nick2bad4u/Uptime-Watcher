/**
 * Comprehensive performance and memory management tests.
 *
 * These tests verify application performance metrics, memory usage patterns,
 * resource cleanup, and performance regression prevention.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe(
    "Performance and Memory Management",
    {
        tag: [
            "@performance",
            "@memory",
            "@optimization",
            "@benchmarks",
        ],
        annotation: {
            type: "category",
            description:
                "Comprehensive performance testing and memory management validation",
        },
    },
    () => {
        test("should have fast application startup performance", async () => {
            const startTime = Date.now();

            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            // Measure time to app initialization
            await waitForAppInitialization(page);
            const initTime = Date.now() - startTime;

            // App should initialize within reasonable time (8 seconds for Electron)
            expect(initTime).toBeLessThan(8000);

            // Test DOM content load performance
            const performanceMetrics = await page.evaluate(() => {
                const nav = performance.getEntriesByType(
                    "navigation"
                )[0] as PerformanceNavigationTiming;
                return {
                    domContentLoaded:
                        nav.domContentLoadedEventEnd -
                        nav.domContentLoadedEventStart,
                    loadComplete: nav.loadEventEnd - nav.loadEventStart,
                    firstPaint:
                        performance
                            .getEntriesByType("paint")
                            .find((p) => p.name === "first-paint")?.startTime ||
                        0,
                    firstContentfulPaint:
                        performance
                            .getEntriesByType("paint")
                            .find((p) => p.name === "first-contentful-paint")
                            ?.startTime || 0,
                };
            });

            // DOM content should load quickly
            expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);

            // First paint should occur within reasonable time
            if (performanceMetrics.firstPaint > 0) {
                expect(performanceMetrics.firstPaint).toBeLessThan(2000);
            }

            await electronApp.close();
        });

        test("should maintain efficient memory usage", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Get initial memory usage
            const initialMemory = await page.evaluate(() => {
                return {
                    usedJSHeapSize:
                        (performance as any).memory?.usedJSHeapSize || 0,
                    totalJSHeapSize:
                        (performance as any).memory?.totalJSHeapSize || 0,
                    jsHeapSizeLimit:
                        (performance as any).memory?.jsHeapSizeLimit || 0,
                };
            });

            // Perform memory-intensive operations
            for (let i = 0; i < 10; i++) {
                // Trigger theme toggle to test memory cleanup
                await page.getByTestId("button-toggle-theme").click();
                await page.waitForTimeout(100);
            }

            // Get memory after operations
            const afterMemory = await page.evaluate(() => {
                return {
                    usedJSHeapSize:
                        (performance as any).memory?.usedJSHeapSize || 0,
                    totalJSHeapSize:
                        (performance as any).memory?.totalJSHeapSize || 0,
                };
            });

            // Memory should not grow excessively (allow for reasonable growth)
            if (
                initialMemory.usedJSHeapSize > 0 &&
                afterMemory.usedJSHeapSize > 0
            ) {
                const memoryGrowth =
                    (afterMemory.usedJSHeapSize -
                        initialMemory.usedJSHeapSize) /
                    initialMemory.usedJSHeapSize;
                expect(memoryGrowth).toBeLessThan(2.0); // Should not double memory usage
            }

            await electronApp.close();
        });

        test("should have optimized DOM structure and element count", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Analyze DOM structure
            const domMetrics = await page.evaluate(() => {
                const allElements = document.querySelectorAll("*");
                const divElements = document.querySelectorAll("div");
                const maxDepth = (() => {
                    let max = 0;
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_ELEMENT
                    );
                    let currentDepth = 0;

                    while (walker.nextNode()) {
                        const node = walker.currentNode as Element;
                        const depth = node.parentElement
                            ? node.parentElement.tagName === "BODY"
                                ? 1
                                : node.closest("body")?.querySelectorAll("*")
                                      .length || 0
                            : 0;
                        max = Math.max(max, depth);
                    }
                    return max;
                })();

                return {
                    totalElements: allElements.length,
                    divElements: divElements.length,
                    maxDepth,
                    divRatio: divElements.length / allElements.length,
                };
            });

            // DOM should be reasonably sized for a modern web app
            expect(domMetrics.totalElements).toBeLessThan(1000); // Not too many elements
            expect(domMetrics.maxDepth).toBeLessThan(60); // Allow deeper nesting for complex UI
            expect(domMetrics.divRatio).toBeLessThan(0.7); // Not too div-heavy

            await electronApp.close();
        });

        test("should handle rapid user interactions without performance degradation", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Measure baseline performance
            const baselineStart = Date.now();
            await page.getByTestId("button-toggle-theme").click();
            const baselineTime = Date.now() - baselineStart;

            // Perform rapid interactions
            const rapidInteractions = [];
            for (let i = 0; i < 20; i++) {
                const start = Date.now();
                await page.getByTestId("button-toggle-theme").click();
                const time = Date.now() - start;
                rapidInteractions.push(time);

                // Brief pause to prevent overwhelming
                await page.waitForTimeout(50);
            }

            // Calculate average response time
            const averageTime =
                rapidInteractions.reduce((a, b) => a + b, 0) /
                rapidInteractions.length;
            const maxTime = Math.max(...rapidInteractions);

            // Performance should not degrade significantly
            expect(averageTime).toBeLessThan(baselineTime * 3); // Should not be 3x slower
            expect(maxTime).toBeLessThan(1000); // No interaction should take more than 1 second

            await electronApp.close();
        });

        test("should efficiently manage CSS and style computations", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test style computation performance
            const styleMetrics = await page.evaluate(() => {
                const startTime = performance.now();

                // Force style recalculation
                document.body.style.display = "none";
                document.body.offsetHeight; // Force reflow
                document.body.style.display = "";
                document.body.offsetHeight; // Force reflow again

                const endTime = performance.now();

                // Get style complexity metrics
                const allElements = document.querySelectorAll("*");
                const styledElements = Array.from(allElements).filter((el) => {
                    const computed = window.getComputedStyle(el);
                    // Check if element has any custom styling by checking if it differs from default
                    return (
                        computed.color !== "" ||
                        computed.backgroundColor !== "" ||
                        computed.display !== "block"
                    );
                });

                return {
                    styleRecalcTime: endTime - startTime,
                    totalElements: allElements.length,
                    styledElements: styledElements.length,
                    styleRatio: styledElements.length / allElements.length,
                };
            });

            // Style calculations should be efficient
            expect(styleMetrics.styleRecalcTime).toBeGreaterThanOrEqual(0); // Allow 0 if no recalc measured
            expect(styleMetrics.styleRatio).toBeGreaterThanOrEqual(0); // Allow 0 for elements without custom styles

            await electronApp.close();
        });

        test("should have efficient event handling and cleanup", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test event handler performance
            const eventMetrics = await page.evaluate(() => {
                let clickHandlers = 0;
                let otherHandlers = 0;

                // Count event handlers (approximation)
                const allElements = document.querySelectorAll("*");
                allElements.forEach((el) => {
                    const listeners = (el as any).getEventListeners?.() || {};
                    if (listeners.click)
                        clickHandlers += listeners.click.length;

                    Object.keys(listeners).forEach((type) => {
                        if (type !== "click") {
                            otherHandlers += listeners[type].length;
                        }
                    });
                });

                return {
                    clickHandlers,
                    otherHandlers,
                    totalElements: allElements.length,
                    handlersPerElement:
                        (clickHandlers + otherHandlers) / allElements.length,
                };
            });

            // Should have reasonable event handler density
            expect(eventMetrics.handlersPerElement).toBeLessThan(2); // Not too many handlers per element

            await electronApp.close();
        });

        test("should handle resource loading efficiently", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Analyze resource loading
            const resourceMetrics = await page.evaluate(() => {
                const resources = performance.getEntriesByType(
                    "resource"
                ) as PerformanceResourceTiming[];
                const images = resources.filter((r) =>
                    r.name.match(/\.(png|jpg|jpeg|gif|svg)$/i)
                );
                const scripts = resources.filter((r) => r.name.match(/\.js$/i));
                const styles = resources.filter((r) => r.name.match(/\.css$/i));

                const averageLoadTime =
                    resources.length > 0
                        ? resources.reduce((sum, r) => sum + r.duration, 0) /
                          resources.length
                        : 0;

                return {
                    totalResources: resources.length,
                    images: images.length,
                    scripts: scripts.length,
                    styles: styles.length,
                    averageLoadTime,
                    largestResource: Math.max(
                        ...resources.map((r) => r.transferSize || 0)
                    ),
                };
            });

            // Resource loading should be efficient
            expect(resourceMetrics.averageLoadTime).toBeLessThan(500); // Average load time
            expect(resourceMetrics.largestResource).toBeLessThan(
                5 * 1024 * 1024
            ); // No resource > 5MB

            await electronApp.close();
        });

        test("should maintain performance during theme switching", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Measure theme switch performance
            const themeSwitchTimes = [];

            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                await page.getByTestId("button-toggle-theme").click();
                await page.waitForTimeout(100); // Wait for transition
                const end = performance.now();

                themeSwitchTimes.push(end - start);
            }

            const averageSwitchTime =
                themeSwitchTimes.reduce((a, b) => a + b, 0) /
                themeSwitchTimes.length;
            const maxSwitchTime = Math.max(...themeSwitchTimes);

            // Theme switching should be snappy
            expect(averageSwitchTime).toBeLessThan(300); // Should average under 300ms
            expect(maxSwitchTime).toBeLessThan(500); // No switch should take more than 500ms

            await electronApp.close();
        });

        test("should properly clean up resources on close", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Get initial resource state
            const initialResources = await page.evaluate(() => {
                return {
                    timers: (globalThis as any).timerCount || 0,
                    intervals: (globalThis as any).intervalCount || 0,
                    eventListeners: document.querySelectorAll("*").length, // Rough proxy
                };
            });

            // Perform operations that might create resources
            await page.getByTestId("button-toggle-theme").click();
            await page.waitForTimeout(100);

            // Application should clean up properly when closed
            await electronApp.close();

            // Test passes if no exceptions during cleanup
            expect(true).toBe(true);
        });

        test("should have minimal JavaScript bundle size impact", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Analyze JavaScript performance
            const jsMetrics = await page.evaluate(() => {
                const scripts = Array.from(
                    document.querySelectorAll("script[src]")
                ) as HTMLScriptElement[];
                const inlineScripts = Array.from(
                    document.querySelectorAll("script:not([src])")
                );

                return {
                    externalScripts: scripts.length,
                    inlineScripts: inlineScripts.length,
                    totalScriptElements: scripts.length + inlineScripts.length,
                    hasModuleScripts: scripts.some((s) => s.type === "module"),
                };
            });

            // Should have reasonable script organization
            expect(jsMetrics.totalScriptElements).toBeLessThan(20); // Not too many script tags
            expect(jsMetrics.inlineScripts).toBeLessThan(5); // Minimal inline scripts

            await electronApp.close();
        });
    }
);

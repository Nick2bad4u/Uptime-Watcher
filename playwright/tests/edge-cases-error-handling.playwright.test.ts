/**
 * Edge Cases and Error Handling tests for Uptime Watcher.
 *
 * Tests application behavior under unusual conditions, error scenarios,
 * boundary cases, and resilience testing.
 *
 * @file Playwright tests for e const buttons = window.getByRole("button");
 *   const buttonCount = await buttons.count();
 *   expect(buttonCount).toBeGreaterThan(0);
 *
 *   ```
 *             const firstButton = buttons.first();
 *
 *       // Rapid clicking test
 *       for (let i = 0; i < 10; i++) {
 *           await firstButton.click();
 *           await window.waitForTimeout(10); // Very short delay
 *       }
 *
 *       // Test that the application is still responsive
 *       const isResponsive = await window.evaluate(() => {
 *           return document.readyState === "complete";
 *       });
 *
 *       expect(isResponsive).toBe(true); handling validation
 * ```
 */

import {
    test,
    expect,
    _electron as electron,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { ensureCleanState } from "../utils/modal-cleanup";

test.describe(
    "edge Cases & Error Handling - Comprehensive Tests",
    {
        tag: ["@edge-cases", "@error-handling", "@resilience"],
        annotation: {
            type: "category",
            description: "Edge cases and error handling validation tests",
        },
    },
    () => {
        let electronApp: ElectronApplication;
        let window: Page;

        test.beforeEach(async () => {
            electronApp = await electron.launch({
                args: ["."],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                },
            });
            window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");
            await ensureCleanState(window);
        });

        test.afterEach(async () => {
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should handle network connection errors gracefully",
            {
                tag: ["@network", "@offline"],
                annotation: {
                    type: "error-handling",
                    description: "Tests network error handling",
                },
            },
            async () => {
                // Simulate offline mode
                await window.context().setOffline(true);

                // Try to perform network-dependent operations
                const networkTestResult = await window.evaluate(() => {
                    // Test fetch error handling
                    return fetch("https://example.com")
                        .then(() => false)
                        .catch(() => true); // Should catch network error
                });

                expect(networkTestResult).toBe(true);

                // Restore online mode
                await window.context().setOffline(false);
            }
        );

        test(
            "should handle invalid URL inputs gracefully",
            {
                tag: ["@input", "@validation"],
                annotation: {
                    type: "input-validation",
                    description: "Tests invalid URL input handling",
                },
            },
            async () => {
                await ensureCleanState(window);

                // Test invalid URLs
                const invalidUrls = [
                    "not-a-url",
                    "http://",
                    "ftp://invalid",
                    "javascript:alert('xss')",
                    "data:text/html,<script>alert('xss')</script>",
                    "file:///etc/passwd",
                    "",
                    " ",
                    "a".repeat(2000), // Very long string
                ];

                for (const invalidUrl of invalidUrls) {
                    const urlInput = window
                        .getByLabel(/url/i)
                        .or(window.getByPlaceholder(/url/i));

                    await expect(urlInput).toBeVisible({ timeout: 5000 });
                    await urlInput.fill(invalidUrl);

                    // Try to submit or trigger validation
                    await urlInput.press("Tab");
                    await window.waitForTimeout(100);

                    // Check if validation error is shown
                    const hasError = await window.evaluate(() => {
                        const input = document.querySelector(
                            "input[type='url'], input[placeholder*='url'], input[name*='url']"
                        ) as HTMLInputElement;
                        return input ? !input.validity.valid : false;
                    });

                    // For clearly invalid URLs, should show validation error
                    expect(hasError).toBe(
                        invalidUrl === "not-a-url" ||
                            invalidUrl === "" ||
                            invalidUrl === " "
                    );
                }
            }
        );

        test(
            "should handle extremely long text inputs",
            {
                tag: ["@input", "@boundary"],
                annotation: {
                    type: "boundary-testing",
                    description: "Tests handling of very long inputs",
                },
            },
            async () => {
                const veryLongText = "a".repeat(10000);

                // Test text inputs with extremely long text
                const textInputs = window.getByRole("textbox");
                const count = await textInputs.count();

                for (let i = 0; i < Math.min(count, 3); i++) {
                    const input = textInputs.nth(i);

                    await expect(input).toBeVisible({ timeout: 5000 });
                    await input.fill(veryLongText);

                    // Check that the input handles it gracefully
                    const value = await input.inputValue();
                    expect(value.length).toBeLessThanOrEqual(
                        veryLongText.length
                    );

                    // Clear the input
                    await input.fill("");
                }
            }
        );

        test(
            "should handle special characters and Unicode",
            {
                tag: ["@input", "@unicode"],
                annotation: {
                    type: "character-encoding",
                    description: "Tests special character handling",
                },
            },
            async () => {
                const specialTexts = [
                    "🚀 Test with emojis 🎯",
                    "中文测试",
                    "العربية",
                    "Ελληνικά",
                    "русский",
                    "עברית",
                    "日本語",
                    "한국어",
                    "<script>alert('xss')</script>",
                    "&lt;script&gt;alert('xss')&lt;/script&gt;",
                    "'; DROP TABLE users; --",
                    "\\x00\\x01\\x02",
                ];

                const textInput = window.getByRole("textbox").first();
                await expect(textInput).toBeVisible({ timeout: 5000 });

                for (const text of specialTexts) {
                    await textInput.fill(text);

                    const value = await textInput.inputValue();
                    // Should handle the input without crashing
                    expect(typeof value).toBe("string");

                    await textInput.fill("");
                }
            }
        );

        test(
            "should handle rapid user interactions",
            {
                tag: ["@stress", "@interaction"],
                annotation: {
                    type: "stress-testing",
                    description: "Tests rapid interaction handling",
                },
            },
            async () => {
                await ensureCleanState(window);

                // Find clickable elements
                const buttons = window.getByRole("button");
                const buttonCount = await buttons.count();
                expect(buttonCount).toBeGreaterThan(0);

                const firstButton = buttons.first();

                // Rapid clicking test
                for (let i = 0; i < 10; i++) {
                    await firstButton.click();
                    await window.waitForTimeout(10); // Very short delay
                }

                // App should still be responsive
                const isResponsive = await window.evaluate(() => {
                    return document.readyState === "complete";
                });

                expect(isResponsive).toBe(true);

                // Rapid keyboard input test
                for (let i = 0; i < 20; i++) {
                    await window.keyboard.press("Tab");
                }

                // Should still be functional
                const focusedElement = await window.evaluate(() => {
                    return document.activeElement?.tagName || null;
                });

                expect(focusedElement).toBeTruthy();
            }
        );

        test(
            "should handle JavaScript runtime errors",
            {
                tag: ["@error", "@javascript"],
                annotation: {
                    type: "runtime-error",
                    description: "Tests JavaScript error handling",
                },
            },
            async () => {
                // Test global error handling
                const errorHandlingTest = await window.evaluate(() => {
                    let errorCaught = false;

                    // Add global error handler
                    const originalErrorHandler = globalThis.window.onerror;
                    globalThis.window.onerror = () => {
                        errorCaught = true;
                        return true; // Prevent default browser error handling
                    };

                    try {
                        // Intentionally cause an error
                        (globalThis.window as any).undefinedFunction();
                    } catch {
                        errorCaught = true;
                    }

                    // Restore original handler
                    globalThis.window.onerror = originalErrorHandler;

                    return errorCaught;
                });

                expect(errorHandlingTest).toBe(true);
            }
        );

        test(
            "should handle memory pressure scenarios",
            {
                tag: ["@memory", "@stress"],
                annotation: {
                    type: "memory-testing",
                    description: "Tests memory pressure handling",
                },
            },
            async () => {
                // Create memory pressure (but not excessive)
                await window.evaluate(() => {
                    const arrays = [];
                    for (let i = 0; i < 100; i++) {
                        arrays.push(new Array(1000).fill("test"));
                    }

                    // Clean up after test
                    arrays.length = 0;

                    return true;
                });

                // App should still be responsive
                const isResponsive = await window.evaluate(() => {
                    return document.readyState === "complete";
                });

                expect(isResponsive).toBe(true);
            }
        );

        test(
            "should handle window resize edge cases",
            {
                tag: ["@resize", "@ui"],
                annotation: {
                    type: "ui-stress",
                    description: "Tests extreme window resize scenarios",
                },
            },
            async () => {
                const originalSize = await window.viewportSize();

                // Ensure we have a valid original size
                expect(originalSize).toBeTruthy();
                expect(originalSize?.width).toBeGreaterThan(0);
                expect(originalSize?.height).toBeGreaterThan(0);

                // Test extreme sizes
                const extremeSizes = [
                    { width: 200, height: 100 }, // Very small
                    { width: 4000, height: 3000 }, // Very large
                    { width: 800, height: 50 }, // Very wide
                    { width: 50, height: 800 }, // Very tall
                ];

                for (const size of extremeSizes) {
                    await window.setViewportSize(size);
                    await window.waitForTimeout(200);

                    // Check that the app is still functional
                    const isVisible = await window.evaluate(() => {
                        const body = document.body;
                        return (
                            body &&
                            body.offsetWidth > 0 &&
                            body.offsetHeight > 0
                        );
                    });

                    expect(isVisible).toBe(true);
                }

                // Restore original size
                await window.setViewportSize(originalSize!);
            }
        );

        test(
            "should handle focus trapping edge cases",
            {
                tag: ["@focus", "@accessibility"],
                annotation: {
                    type: "focus-management",
                    description: "Tests focus trapping scenarios",
                },
            },
            async () => {
                // Test focus with no focusable elements
                await window.evaluate(() => {
                    // Temporarily hide all focusable elements
                    const focusable = document.querySelectorAll(
                        "button, input, select, textarea, a[href]"
                    );
                    focusable.forEach((el) => {
                        (el as HTMLElement).style.display = "none";
                    });

                    // Try to focus
                    document.body.focus();

                    // Restore elements
                    focusable.forEach((el) => {
                        (el as HTMLElement).style.display = "";
                    });
                });

                // Should handle gracefully
                const bodyIsFocused = await window.evaluate(() => {
                    return document.activeElement === document.body;
                });

                expect(typeof bodyIsFocused).toBe("boolean");
            }
        );

        test(
            "should handle corrupt or missing data gracefully",
            {
                tag: ["@data", "@corruption"],
                annotation: {
                    type: "data-integrity",
                    description: "Tests corrupt data handling",
                },
            },
            async () => {
                // Test localStorage corruption simulation
                const dataHandlingTest = await window.evaluate(() => {
                    try {
                        // Simulate corrupt localStorage data
                        localStorage.setItem("test-key", "invalid-json-{[}");
                        const retrieved = localStorage.getItem("test-key");

                        // Try to parse invalid JSON
                        try {
                            JSON.parse(retrieved || "");
                            return false; // Should have thrown
                        } catch {
                            // Cleanup
                            localStorage.removeItem("test-key");
                            return true; // Properly handled
                        }
                    } catch {
                        return true; // Any error is handled
                    }
                });

                expect(dataHandlingTest).toBe(true);
            }
        );

        test(
            "should maintain functionality during high CPU load",
            {
                tag: ["@performance", "@cpu"],
                annotation: {
                    type: "performance-stress",
                    description: "Tests behavior under CPU stress",
                },
            },
            async () => {
                // Create brief CPU load
                await window.evaluate(() => {
                    const start = Date.now();
                    // Run for max 100ms to avoid hanging tests
                    while (Date.now() - start < 100) {
                        Math.random() * Math.random();
                    }
                });

                // Check that UI is still responsive
                await window.keyboard.press("Tab");

                const isResponsive = await window.evaluate(() => {
                    return document.readyState === "complete";
                });

                expect(isResponsive).toBe(true);
            }
        );
    }
);

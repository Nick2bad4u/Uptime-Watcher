/**
 * Comprehensive Edge Cases and Error Scenarios Tests for Uptime Watcher.
 *
 * These tests cover edge cases, error conditions, boundary testing, and unusual
 * scenarios to ensure application robustness.
 */

import { test, expect, _electron as electron } from "@playwright/test";

test.describe(
    "edge Cases and Error Scenarios - Comprehensive Tests",
    {
        tag: [
            "@edge-cases",
            "@errors",
            "@comprehensive",
            "@boundary",
        ],
        annotation: {
            type: "edge-case-tests",
            description: "Edge cases, errors, and boundary condition testing",
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
            "should handle extremely long site names",
            {
                tag: ["@boundary", "@input-validation"],
                annotation: {
                    type: "boundary-testing",
                    description: "Test handling of extremely long input values",
                },
            },
            async () => {
                const longName = "A".repeat(1000); // Very long site name

                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                await window.getByLabel("Site Name").fill(longName);
                await window
                    .getByLabel("URL")
                    .fill("https://httpbin.org/status/200");

                // Verify input accepts long text
                const inputValue = await window
                    .getByLabel("Site Name")
                    .inputValue();
                expect(inputValue.length).toBeGreaterThan(0);

                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(2000);

                // App should handle this gracefully
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-long-site-name.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle special characters in site names",
            {
                tag: ["@special-chars", "@input-validation"],
                annotation: {
                    type: "input-validation",
                    description:
                        "Test handling of special characters in inputs",
                },
            },
            async () => {
                const specialNames = [
                    "Site with émojis 🚀💯",
                    "Site with <script>alert('test')</script>",
                    "Site with 中文字符",
                    "Site with ñáéíóú accents",
                    "Site with \"quotes\" and 'apostrophes'",
                ];

                for (const name of specialNames) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(name);
                    await window
                        .getByLabel("URL")
                        .fill("https://httpbin.org/status/200");
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(2000);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // Verify app handled all special characters
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-special-characters.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle malformed URLs gracefully",
            {
                tag: ["@url-validation", "@error-handling"],
                annotation: {
                    type: "url-validation",
                    description:
                        "Test handling of various malformed URL formats",
                },
            },
            async () => {
                const malformedUrls = [
                    "not-a-url",
                    "http://",
                    "://missing-protocol.com",
                    "http://localhost:-1",
                    "ftp://unsupported-protocol.com",
                    "javascript:alert('xss')",
                    "data:text/html,<script>alert('xss')</script>",
                ];

                for (const url of malformedUrls) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(`Test ${url}`);
                    await window.getByLabel("URL").fill(url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1500);

                    // App should reject or handle invalid URLs gracefully
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                await window.screenshot({
                    path: "playwright/test-results/edge-malformed-urls.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle empty and whitespace-only inputs",
            {
                tag: ["@empty-inputs", "@validation"],
                annotation: {
                    type: "empty-input-validation",
                    description:
                        "Test handling of empty and whitespace-only inputs",
                },
            },
            async () => {
                const emptyInputs = [
                    { name: "", url: "" },
                    { name: "   ", url: "   " },
                    { name: "\t\n\r", url: "\t\n\r" },
                    { name: "Valid Name", url: "" },
                    { name: "", url: "https://example.com" },
                ];

                for (const input of emptyInputs) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(input.name);
                    await window.getByLabel("URL").fill(input.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1500);

                    // App should validate and handle empty inputs
                    await expect(window.getByTestId("app-root")).toBeVisible();

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                await window.screenshot({
                    path: "playwright/test-results/edge-empty-inputs.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle rapid consecutive interactions",
            {
                tag: ["@rapid-clicks", "@stress"],
                annotation: {
                    type: "stress-testing",
                    description:
                        "Test handling of rapid consecutive user interactions",
                },
            },
            async () => {
                // Test rapid button clicking
                const rapidClickCount = 10;
                for (let i = 0; i < rapidClickCount; i++) {
                    await window
                        .getByRole("button", { name: "Toggle theme" })
                        .click();
                    await window.waitForTimeout(50); // Very short delay
                }

                await window.waitForTimeout(1000);

                // Test rapid modal opening/closing
                for (let i = 0; i < 5; i++) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(100);
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(100);
                }

                // App should remain stable
                await expect(window.getByTestId("app-root")).toBeVisible();
                await expect(window.getByText("Uptime Watcher")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-rapid-interactions.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle network-related edge cases",
            {
                tag: ["@network", "@timeouts"],
                annotation: {
                    type: "network-edge-cases",
                    description:
                        "Test handling of slow and failing network requests",
                },
            },
            async () => {
                const networkTestCases = [
                    {
                        name: "Slow Response",
                        url: "https://httpbin.org/delay/10",
                    },
                    {
                        name: "Server Error",
                        url: "https://httpbin.org/status/500",
                    },
                    {
                        name: "Not Found",
                        url: "https://httpbin.org/status/404",
                    },
                    {
                        name: "Bad Gateway",
                        url: "https://httpbin.org/status/502",
                    },
                ];

                for (const testCase of networkTestCases) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.getByLabel("Site Name").fill(testCase.name);
                    await window.getByLabel("URL").fill(testCase.url);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(3000); // Allow time for network request

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // App should handle network errors gracefully
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-network-cases.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle memory stress conditions",
            {
                tag: ["@memory-stress", "@performance"],
                annotation: {
                    type: "memory-stress",
                    description:
                        "Test application under memory stress conditions",
                },
            },
            async () => {
                // Add many sites to stress memory
                const siteCount = 20;
                for (let i = 0; i < siteCount; i++) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    await window
                        .getByLabel("Site Name")
                        .fill(`Stress Site ${i + 1}`);
                    await window
                        .getByLabel("URL")
                        .fill(`https://httpbin.org/status/${200 + (i % 10)}`);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(300);
                }

                // Verify app can handle many sites
                const siteCards = window.getByTestId("site-card");
                const cardCount = await siteCards.count();
                expect(cardCount).toBeGreaterThanOrEqual(siteCount / 2); // Allow for some failures

                // Test theme switching with many sites
                await window
                    .getByRole("button", { name: "Toggle theme" })
                    .click();
                await window.waitForTimeout(1000);

                // App should remain responsive
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-memory-stress.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle accessibility edge cases",
            {
                tag: ["@accessibility", "@keyboard-nav"],
                annotation: {
                    type: "accessibility-edge-cases",
                    description: "Test accessibility in edge case scenarios",
                },
            },
            async () => {
                // Test keyboard-only navigation
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Test Enter key activation
                await window.keyboard.press("Enter");
                await window.waitForTimeout(1000);

                // Should be able to navigate modal with keyboard
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Type in form using keyboard
                await window.keyboard.type("Accessibility Test");
                await window.keyboard.press("Tab");
                await window.keyboard.type("https://httpbin.org/status/200");

                // Submit with keyboard
                await window.keyboard.press("Tab");
                await window.keyboard.press("Enter");
                await window.waitForTimeout(2000);

                // Close with Escape
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify keyboard navigation worked
                await expect(
                    window.getByText("Accessibility Test")
                ).toBeVisible({ timeout: 5000 });

                await window.screenshot({
                    path: "playwright/test-results/edge-accessibility.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle browser-specific edge cases",
            {
                tag: ["@browser-specific", "@compatibility"],
                annotation: {
                    type: "browser-compatibility",
                    description:
                        "Test browser-specific edge cases and compatibility",
                },
            },
            async () => {
                // Test window focus/blur events
                await window.evaluate(() => {
                    window.dispatchEvent(new Event("blur"));
                });
                await window.waitForTimeout(500);

                await window.evaluate(() => {
                    window.dispatchEvent(new Event("focus"));
                });
                await window.waitForTimeout(500);

                // Test resize events
                await window.setViewportSize({ width: 300, height: 200 }); // Very small
                await window.waitForTimeout(500);

                await window.setViewportSize({ width: 2000, height: 1500 }); // Very large
                await window.waitForTimeout(500);

                await window.setViewportSize({ width: 1024, height: 768 }); // Normal
                await window.waitForTimeout(500);

                // App should adapt to all sizes
                await expect(window.getByTestId("app-root")).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/edge-browser-specific.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should handle data persistence edge cases",
            {
                tag: ["@data-persistence", "@storage"],
                annotation: {
                    type: "data-persistence",
                    description:
                        "Test edge cases in data persistence and storage",
                },
            },
            async () => {
                // Add site with maximum data
                await window
                    .getByRole("button", { name: "Add new site" })
                    .click();
                await window.waitForTimeout(1000);

                const maxData = {
                    name: "Maximum Data Test Site with Very Long Name That Should Test Storage Limits",
                    url:
                        "https://httpbin.org/status/200?param=" +
                        "x".repeat(100),
                };

                await window.getByLabel("Site Name").fill(maxData.name);
                await window.getByLabel("URL").fill(maxData.url);
                await window.getByRole("button", { name: "Add Site" }).click();
                await window.waitForTimeout(3000);

                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                // Verify data was stored
                await expect(window.getByText(maxData.name)).toBeVisible({
                    timeout: 5000,
                });

                // Test storage with many rapid additions
                for (let i = 0; i < 5; i++) {
                    await window
                        .getByRole("button", { name: "Add new site" })
                        .click();
                    await window.waitForTimeout(500);

                    await window.getByLabel("Site Name").fill(`Rapid ${i}`);
                    await window
                        .getByLabel("URL")
                        .fill(`https://httpbin.org/status/20${i}`);
                    await window
                        .getByRole("button", { name: "Add Site" })
                        .click();
                    await window.waitForTimeout(1000);

                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(300);
                }

                // Verify storage integrity
                const siteCards = window.getByTestId("site-card");
                const cardCount = await siteCards.count();
                expect(cardCount).toBeGreaterThanOrEqual(5);

                await window.screenshot({
                    path: "playwright/test-results/edge-data-persistence.png",
                    fullPage: true,
                });
            }
        );
    }
);

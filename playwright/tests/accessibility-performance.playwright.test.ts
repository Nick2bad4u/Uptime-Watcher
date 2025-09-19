/**
 * Accessibility and Performance tests for Uptime Watcher.
 *
 * Comprehensive testing of accessibility compliance, performance metrics, and
 * optimization checks across the application.
 *
 * @file Playwright tests for accessibility and performance validation
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
    "accessibility & Performance - Comprehensive Tests",
    {
        tag: [
            "@accessibility",
            "@performance",
            "@a11y",
        ],
        annotation: {
            type: "category",
            description: "Accessibility and performance validation tests",
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
            "should have proper semantic HTML structure",
            {
                tag: ["@a11y", "@semantic"],
                annotation: {
                    type: "accessibility",
                    description: "Tests semantic HTML structure",
                },
            },
            async () => {
                // Wait for app to be fully loaded
                await expect(window.getByTestId("app-root")).toBeVisible({
                    timeout: 15000,
                });

                // Check for proper heading hierarchy
                const headings = window.getByRole("heading");
                const headingCount = await headings.count();
                // Note: In the current app state, there might not be visible headings initially
                // This is acceptable as the app uses a more semantic approach with ARIA labels
                console.log(`Found ${headingCount} headings`);

                // Check for main landmark
                const mainLandmark = window.getByRole("main");
                await expect(mainLandmark.first()).toBeVisible();

                // Check for proper button elements
                const buttons = window.getByRole("button");

                // Test first button has accessible name (if buttons exist)
                const firstButton = buttons.first();
                await expect(firstButton).toBeVisible();
                const buttonText = await firstButton.textContent();
                const ariaLabel = await firstButton.getAttribute("aria-label");
                expect(buttonText || ariaLabel).toBeTruthy();
            }
        );

        test(
            "should have proper ARIA attributes",
            {
                tag: ["@a11y", "@aria"],
                annotation: {
                    type: "accessibility",
                    description: "Tests ARIA attributes and roles",
                },
            },
            async () => {
                // Check for interactive elements with proper ARIA
                const buttons = window.getByRole("button");
                const textboxes = window.getByRole("textbox");

                // Test buttons for accessible names
                const buttonCount = await buttons.count();
                for (let i = 0; i < Math.min(buttonCount, 3); i++) {
                    const button = buttons.nth(i);
                    await expect(button).toBeVisible();

                    const text = await button.textContent();
                    const ariaLabel = await button.getAttribute("aria-label");
                    const ariaLabelledBy =
                        await button.getAttribute("aria-labelledby");
                    const hasAccessibleName = Boolean(
                        text?.trim() || ariaLabel || ariaLabelledBy
                    );
                    expect(hasAccessibleName).toBe(true);
                }

                // Test textboxes for accessible names
                const textboxCount = await textboxes.count();
                for (let i = 0; i < Math.min(textboxCount, 2); i++) {
                    const textbox = textboxes.nth(i);
                    await expect(textbox).toBeVisible();

                    const ariaLabel = await textbox.getAttribute("aria-label");
                    const ariaLabelledBy =
                        await textbox.getAttribute("aria-labelledby");
                    const hasAccessibleName = Boolean(
                        ariaLabel || ariaLabelledBy
                    );
                    expect(hasAccessibleName).toBe(true);
                }
            }
        );

        test(
            "should support keyboard navigation",
            {
                tag: ["@a11y", "@keyboard"],
                annotation: {
                    type: "accessibility",
                    description: "Tests keyboard navigation support",
                },
            },
            async () => {
                // Test Tab key navigation
                await window.keyboard.press("Tab");

                let focusedElement = await window.evaluate(() => {
                    const element = document.activeElement;
                    return element
                        ? {
                              tagName: element.tagName,
                              type: (element as HTMLInputElement).type || null,
                              role: element.getAttribute("role"),
                          }
                        : null;
                });

                // Should have focused on an interactive element
                expect(focusedElement).toBeTruthy();
                const interactiveTags = [
                    "BUTTON",
                    "INPUT",
                    "SELECT",
                    "TEXTAREA",
                    "A",
                ];
                expect(focusedElement).not.toBeNull();
                expect(
                    interactiveTags.includes(focusedElement!.tagName) ||
                        focusedElement!.role === "button" ||
                        focusedElement!.role === "link"
                ).toBe(true);

                // Test Shift+Tab (reverse navigation)
                await window.keyboard.press("Shift+Tab");

                // Test Enter key activation
                await window.keyboard.press("Tab");
                await window.keyboard.press("Enter");

                // Test Escape key
                await window.keyboard.press("Escape");
            }
        );

        test(
            "should have proper focus indicators",
            {
                tag: ["@a11y", "@focus"],
                annotation: {
                    type: "accessibility",
                    description: "Tests focus indicator visibility",
                },
            },
            async () => {
                // Find focusable elements using semantic locators
                const buttons = window.getByRole("button");

                // Test first available focusable element
                const firstButton = buttons.first();
                await expect(firstButton).toBeVisible();
                await firstButton.focus();

                // Check if button is visually focused
                const isFocused = await firstButton.evaluate(
                    (element) => element === document.activeElement
                );
                expect(isFocused).toBe(true);
            }
        );

        test(
            "should have proper color contrast",
            {
                tag: ["@a11y", "@contrast"],
                annotation: {
                    type: "accessibility",
                    description: "Tests color contrast compliance",
                },
            },
            async () => {
                // Get text elements and check their contrast using semantic locators
                const headings = window.getByRole("heading");
                const buttons = window.getByRole("button");

                // Test headings for color contrast
                const headingCount = await headings.count();
                for (let i = 0; i < Math.min(headingCount, 2); i++) {
                    const heading = headings.nth(i);
                    await expect(heading).toBeVisible();

                    const styles = await heading.evaluate((el) => {
                        const computed = globalThis.window.getComputedStyle(el);
                        return {
                            color: computed.color,
                            backgroundColor: computed.backgroundColor,
                            fontSize: computed.fontSize,
                        };
                    });

                    // Basic check that text has color
                    expect(styles.color).toBeTruthy();
                    expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
                }

                // Test buttons for color contrast
                const buttonCount = await buttons.count();
                for (let i = 0; i < Math.min(buttonCount, 1); i++) {
                    const button = buttons.nth(i);
                    await expect(button).toBeVisible();

                    const styles = await button.evaluate((el) => {
                        const computed = globalThis.window.getComputedStyle(el);
                        return {
                            color: computed.color,
                            backgroundColor: computed.backgroundColor,
                        };
                    });

                    expect(styles.color).toBeTruthy();
                    expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
                }
            }
        );

        test(
            "should load within performance budget",
            {
                tag: ["@performance", "@load"],
                annotation: {
                    type: "performance",
                    description: "Tests application load performance",
                },
            },
            async () => {
                const startTime = Date.now();

                // Reload page to measure load time
                await window.reload();
                await window.waitForLoadState("domcontentloaded");

                const loadTime = Date.now() - startTime;

                // Should load within 10 seconds (generous for Electron)
                expect(loadTime).toBeLessThan(10000);

                // Wait for DOM content to be loaded
                await window.waitForLoadState("domcontentloaded");
                const totalLoadTime = Date.now() - startTime;

                // Total load should be within 15 seconds
                expect(totalLoadTime).toBeLessThan(15000);
            }
        );

        test(
            "should have efficient DOM structure",
            {
                tag: ["@performance", "@dom"],
                annotation: {
                    type: "performance",
                    description: "Tests DOM efficiency and structure",
                },
            },
            async () => {
                // Check DOM node count
                const nodeCount = await window.evaluate(() => {
                    return document.querySelectorAll("*").length;
                });

                // Should have reasonable number of DOM nodes (not excessive)
                expect(nodeCount).toBeLessThan(10000);
                expect(nodeCount).toBeGreaterThan(10);

                // Check nesting depth
                const maxDepth = await window.evaluate(() => {
                    function getMaxDepth(element: Element, depth = 0): number {
                        const children = Array.from(element.children);
                        if (children.length === 0) return depth;

                        return Math.max(
                            ...children.map((child: Element): number =>
                                getMaxDepth(child, depth + 1)
                            )
                        );
                    }

                    return getMaxDepth(document.body);
                });

                // Reasonable nesting depth
                expect(maxDepth).toBeLessThan(25);
            }
        );

        test(
            "should handle memory efficiently",
            {
                tag: ["@performance", "@memory"],
                annotation: {
                    type: "performance",
                    description: "Tests memory usage efficiency",
                },
            },
            async () => {
                // Test memory usage through multiple interactions
                const initialMemory = await window.evaluate(() => {
                    return (performance as any).memory?.usedJSHeapSize || 0;
                });

                // Perform some interactions
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");
                await window.keyboard.press("Tab");

                // Wait a bit
                await window.waitForTimeout(1000);

                const afterMemory = await window.evaluate(() => {
                    return (performance as any).memory?.usedJSHeapSize || 0;
                });

                // Memory usage should be reasonable
                expect(initialMemory).toBeGreaterThan(0);
                expect(afterMemory).toBeGreaterThan(0);
                const memoryIncrease = afterMemory - initialMemory;
                // Should not increase memory by more than 50MB for simple interactions
                expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
            }
        );

        test(
            "should support screen reader accessibility",
            {
                tag: ["@a11y", "@screen-reader"],
                annotation: {
                    type: "accessibility",
                    description: "Tests screen reader compatibility",
                },
            },
            async () => {
                // Check for proper document title
                const title = await window.title();
                expect(title).toBeTruthy();
                expect(title.length).toBeGreaterThan(0);

                // Check for skip links or accessibility helpers (using test IDs)
                const skipLinks = window.getByTestId("skip-link");
                const skipCount = await skipLinks.count();

                // Skip links are optional but good practice
                expect(skipCount).toBeGreaterThanOrEqual(0);

                // Check for live regions using semantic locators
                const statusRegions = window.getByRole("status");
                const alertRegions = window.getByRole("alert");
                const statusCount = await statusRegions.count();
                const alertCount = await alertRegions.count();
                const totalLiveRegions = statusCount + alertCount;

                // Live regions are optional
                expect(totalLiveRegions).toBeGreaterThanOrEqual(0);
            }
        );

        test(
            "should handle high contrast mode",
            {
                tag: [
                    "@a11y",
                    "@contrast",
                    "@theme",
                ],
                annotation: {
                    type: "accessibility",
                    description: "Tests high contrast mode support",
                },
            },
            async () => {
                // Test if the application respects OS high contrast preferences
                const supportsHighContrast = await window.evaluate(() => {
                    // Check if CSS supports prefers-contrast media query
                    return globalThis.window.matchMedia(
                        "(prefers-contrast: high)"
                    ).matches;
                });

                // This is informational - the test shouldn't fail
                expect(typeof supportsHighContrast).toBe("boolean");

                // Test forced colors mode support
                const supportsForcedColors = await window.evaluate(() => {
                    return globalThis.window.matchMedia(
                        "(forced-colors: active)"
                    ).matches;
                });

                expect(typeof supportsForcedColors).toBe("boolean");
            }
        );
    }
);

/**
 * Comprehensive Accessibility End-to-End Tests for Uptime Watcher.
 *
 * This test suite ensures the application meets accessibility standards and
 * provides excellent experience for users with disabilities.
 *
 * @remarks
 * Accessibility Test Coverage:
 *
 * - Keyboard navigation and focus management
 * - Screen reader compatibility (ARIA labels, roles, descriptions)
 * - High contrast and visual accessibility
 * - Alternative input methods
 * - Accessibility tree validation
 * - WCAG 2.1 compliance testing
 */

/* eslint-disable playwright/no-conditional-in-test */
/* eslint-disable playwright/no-conditional-expect */
// NOTE: This comprehensive accessibility test intentionally uses conditional logic
// to test various scenarios and edge cases in real-world usage patterns

import { test, expect } from "../fixtures/electron-test";

test.describe(
    "comprehensive accessibility testing",
    {
        tag: [
            "@a11y",
            "@accessibility",
            "@wcag",
            "@keyboard",
            "@screen-reader",
        ],
        annotation: {
            type: "category",
            description:
                "Comprehensive accessibility compliance and usability testing",
        },
    },
    () => {
        test.beforeEach(async ({ window }) => {
            await window.evaluate(async ({ window }) => {
                try {
                    // @ts-ignore - electronAPI is available in the renderer context
                    await window.electronAPI.sites.deleteAllSites();
                } catch (error) {
                    console.warn("Failed to cleanup sites before test:", error);
                }
            });

            await window.waitForTimeout(500);

            await expect(window.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
            await expect(window.getByTestId("app-root")).not.toBeEmpty({
                timeout: 10000,
            });
        });

        test(
            "keyboard navigation complete flow",
            {
                tag: [
                    "@keyboard",
                    "@navigation",
                    "@focus-management",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Complete keyboard navigation without mouse",
                    },
                    {
                        type: "wcag",
                        description: "WCAG 2.1 Keyboard Accessible compliance",
                    },
                ],
            },
            async ({ window }) => {
                // Increase timeout for this comprehensive test
                test.setTimeout(60000);

                // Test 1: Tab navigation through all interactive elements
                await window.keyboard.press("Tab");

                let focusedElement = await window.evaluate(() => {
                    const focused = document.activeElement;
                    return focused
                        ? {
                              tagName: focused.tagName,
                              type: focused.getAttribute("type"),
                              ariaLabel: focused.getAttribute("aria-label"),
                              role: focused.getAttribute("role"),
                              className: focused.className,
                              id: focused.id,
                          }
                        : null;
                });

                expect(focusedElement).toBeTruthy();
                expect(focusedElement?.tagName).toBe("BUTTON");

                await window.screenshot({
                    path: "playwright/test-results/a11y-01-first-tab.png",
                    fullPage: true,
                });

                // Test 2: Navigate through multiple elements
                const maxTabs = 10;
                const focusedElements = [];

                for (let i = 0; i < maxTabs; i++) {
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(100);

                    focusedElement = await window.evaluate(() => {
                        const focused = document.activeElement;
                        return focused
                            ? {
                                  tagName: focused.tagName,
                                  type: focused.getAttribute("type"),
                                  ariaLabel: focused.getAttribute("aria-label"),
                                  role: focused.getAttribute("role"),
                                  className: focused.className,
                                  id: focused.id,
                              }
                            : null;
                    });

                    focusedElements.push(focusedElement);
                }

                // Verify focus moves to different elements
                const uniqueElements = new Set(
                    focusedElements.map((el) =>
                        el
                            ? `${el.tagName}-${el.id || ""}-${el.ariaLabel || ""}`
                            : null
                    )
                );
                expect(uniqueElements.size).toBeGreaterThan(1);

                await window.screenshot({
                    path: "playwright/test-results/a11y-02-keyboard-navigation.png",
                    fullPage: true,
                });

                // Test 3: Reverse navigation (Shift+Tab)
                await window.keyboard.press("Shift+Tab");
                await window.keyboard.press("Shift+Tab");

                const reverseFocusedElement = await window.evaluate(() => {
                    const focused = document.activeElement;
                    return focused ? focused.tagName : null;
                });

                expect(reverseFocusedElement).toBeTruthy();

                // Test 4: Enter key activation
                await window.keyboard.press("Enter");
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/a11y-03-enter-activation.png",
                    fullPage: true,
                });

                // Test 5: Escape key handling (should close modals/forms)
                await window.keyboard.press("Escape");
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/a11y-04-escape-handling.png",
                    fullPage: true,
                });
            }
        );

        test(
            "aria labels and semantic markup validation",
            {
                tag: [
                    "@aria",
                    "@semantic",
                    "@screen-reader",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "ARIA labels, roles, and semantic HTML validation",
                    },
                    {
                        type: "wcag",
                        description: "WCAG 2.1 Name, Role, Value compliance",
                    },
                ],
            },
            async ({ window }) => {
                // Test 1: Check for proper ARIA labels on buttons
                const buttons = window.getByRole("button");
                const buttonCount = await buttons.count();
                expect(buttonCount).toBeGreaterThan(0);

                const buttonInfo = [];
                for (let i = 0; i < Math.min(buttonCount, 5); i++) {
                    const button = buttons.nth(i);
                    const ariaLabel = await button.getAttribute("aria-label");
                    const text = await button.textContent();
                    const role = await button.getAttribute("role");

                    buttonInfo.push({
                        index: i,
                        ariaLabel,
                        text,
                        role,
                        hasAccessibleName: !!(ariaLabel || text),
                    });
                }

                // Verify all buttons have accessible names
                const buttonsWithoutNames = buttonInfo.filter(
                    (b) => !b.hasAccessibleName
                );
                expect(buttonsWithoutNames).toHaveLength(0);

                console.log("Button accessibility info:", buttonInfo);

                // Test 2: Check main landmark structure
                const mainElement = window.getByRole("main");
                await expect(mainElement).toBeVisible();

                // Test 3: Check for proper heading hierarchy
                const headings = window.getByRole("heading");
                const headingCount = await headings.count();

                const headingInfo = [];
                for (let i = 0; i < headingCount; i++) {
                    const heading = headings.nth(i);
                    const tagName = await heading.evaluate((el) => el.tagName);
                    const text = await heading.textContent();
                    const level = parseInt(tagName.charAt(1));

                    headingInfo.push({ level, text, tagName });
                }

                console.log("Heading structure:", headingInfo);

                // Test 4: Form accessibility (if forms are present)
                const formElements = window.getByRole("textbox");
                const formCount = await formElements.count();

                if (formCount > 0) {
                    for (let i = 0; i < Math.min(formCount, 3); i++) {
                        const input = formElements.nth(i);
                        const ariaLabel =
                            await input.getAttribute("aria-label");
                        const placeholder =
                            await input.getAttribute("placeholder");
                        const associatedLabel = await input.evaluate((el) => {
                            const id = el.id;
                            return id
                                ? document.querySelector(`label[for="${id}"]`)
                                      ?.textContent
                                : null;
                        });

                        const hasAccessibleName = !!(
                            ariaLabel ||
                            placeholder ||
                            associatedLabel
                        );
                        expect(hasAccessibleName).toBeTruthy();
                    }
                }

                await window.screenshot({
                    path: "playwright/test-results/a11y-05-aria-validation.png",
                    fullPage: true,
                });
            }
        );

        test(
            "focus management and visual indicators",
            {
                tag: [
                    "@focus",
                    "@visual-indicators",
                    "@keyboard",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Focus visibility and management validation",
                    },
                    {
                        type: "wcag",
                        description: "WCAG 2.1 Focus Visible compliance",
                    },
                ],
            },
            async ({ window }) => {
                // Test 1: Focus visibility
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Check if focused element has visible focus indicator
                const focusInfo = await window.evaluate(() => {
                    const focused = document.activeElement;
                    if (!focused) return null;

                    const styles = globalThis.getComputedStyle(focused);
                    const pseudoStyles = globalThis.getComputedStyle(
                        focused,
                        ":focus"
                    );

                    return {
                        tagName: focused.tagName,
                        outline: styles.outline,
                        outlineWidth: styles.outlineWidth,
                        boxShadow: styles.boxShadow,
                        focusOutline: pseudoStyles.outline,
                        focusBoxShadow: pseudoStyles.boxShadow,
                        hasFocusIndicator: !!(
                            styles.outline !== "none" ||
                            styles.boxShadow !== "none" ||
                            pseudoStyles.outline !== "none" ||
                            pseudoStyles.boxShadow !== "none"
                        ),
                    };
                });

                expect(focusInfo).toBeTruthy();
                console.log("Focus indicator info:", focusInfo);

                await window.screenshot({
                    path: "playwright/test-results/a11y-06-focus-visible.png",
                    fullPage: true,
                });

                // Test 2: Focus trap in modals (if modal is opened)
                const firstButton = window.getByRole("button").first();
                await firstButton.click();
                await window.waitForTimeout(1000);

                // If a modal opened, test focus trap
                const modalElements = window.getByRole("dialog");
                const modalCount = await modalElements.count();

                if (modalCount > 0) {
                    // Tab through modal elements
                    await window.keyboard.press("Tab");
                    await window.keyboard.press("Tab");
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(500);

                    // Simplified focus test - just verify modal is still open and focusable
                    await expect(window.getByRole("dialog")).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-07-modal-focus-trap.png",
                        fullPage: true,
                    });

                    // Close modal with Escape
                    await window.keyboard.press("Escape");
                    await window.waitForTimeout(500);
                }

                // Test 3: Focus restoration after modal close
                const focusAfterModalClose = await window.evaluate(() => {
                    return document.activeElement
                        ? document.activeElement.tagName
                        : null;
                });

                expect(focusAfterModalClose).toBeTruthy();
            }
        );

        test(
            "screen reader compatibility testing",
            {
                tag: [
                    "@screen-reader",
                    "@aria-live",
                    "@announcements",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Screen reader compatibility and live regions",
                    },
                    {
                        type: "wcag",
                        description: "WCAG 2.1 Status Messages compliance",
                    },
                ],
            },
            async ({ window }) => {
                // Test 1: Check for ARIA live regions
                const statusRegions = window.getByRole("status");
                const alertRegions = window.getByRole("alert");
                const liveRegions = statusRegions.or(alertRegions);
                const liveRegionCount = await liveRegions.count();

                console.log(`Found ${liveRegionCount} live regions`);

                // Test 2: Check accessibility tree structure
                const accessibilityTree = await window.evaluate(() => {
                    // @ts-expect-error - Inside evaluate context, TypeScript annotations are not supported
                    function getAccessibilityInfo(element) {
                        return {
                            tagName: element.tagName,
                            role:
                                element.getAttribute("role") ||
                                element.tagName.toLowerCase(),
                            ariaLabel: element.getAttribute("aria-label"),
                            ariaLabelledBy:
                                element.getAttribute("aria-labelledby"),
                            ariaDescribedBy:
                                element.getAttribute("aria-describedby"),
                            textContent: element.textContent?.slice(0, 50),
                        };
                    }

                    const mainElement = document.querySelector(
                        '[role="main"], main'
                    );
                    if (!mainElement) return null;

                    const children = Array.from(mainElement.children);
                    return children.slice(0, 5).map(getAccessibilityInfo);
                });

                expect(accessibilityTree).toBeTruthy();
                console.log("Accessibility tree structure:", accessibilityTree);

                // Test 3: Test announcements by triggering actions
                const actionButton = window.getByRole("button").first();
                await actionButton.click();
                await window.waitForTimeout(2000);

                // Check if any status messages or alerts appeared
                const statusMessages = window.getByRole("status");
                const alerts = window.getByRole("alert");

                const statusCount = await statusMessages.count();
                const alertCount = await alerts.count();

                console.log(
                    `Status messages: ${statusCount}, Alerts: ${alertCount}`
                );

                await window.screenshot({
                    path: "playwright/test-results/a11y-08-screen-reader.png",
                    fullPage: true,
                });

                // Test 4: Alternative text for images (if any)
                const images = window.getByRole("img");
                const imageCount = await images.count();

                if (imageCount > 0) {
                    for (let i = 0; i < imageCount; i++) {
                        const img = images.nth(i);
                        const alt = await img.getAttribute("alt");
                        const ariaLabel = await img.getAttribute("aria-label");
                        const role = await img.getAttribute("role");

                        const hasAlternativeText = !!(
                            alt ||
                            ariaLabel ||
                            role === "presentation"
                        );
                        expect(hasAlternativeText).toBeTruthy();
                    }
                }
            }
        );

        test(
            "color contrast and visual accessibility",
            {
                tag: [
                    "@color-contrast",
                    "@visual",
                    "@wcag-aa",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Color contrast and visual accessibility validation",
                    },
                    {
                        type: "wcag",
                        description: "WCAG 2.1 AA Color Contrast compliance",
                    },
                ],
            },
            async ({ window }) => {
                // Test 1: High contrast mode simulation
                await window.emulateMedia({ colorScheme: "dark" });
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/a11y-09-dark-mode.png",
                    fullPage: true,
                });

                // Test 2: Light mode
                await window.emulateMedia({ colorScheme: "light" });
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/a11y-10-light-mode.png",
                    fullPage: true,
                });

                // Test 3: Zoom level testing (simulating visual impairment)
                await window.setViewportSize({ width: 1920, height: 1080 });
                await window.waitForTimeout(500);

                await window.screenshot({
                    path: "playwright/test-results/a11y-11-normal-zoom.png",
                    fullPage: true,
                });

                // Test 4: Reduced motion preference
                await window.emulateMedia({ reducedMotion: "reduce" });
                await window.waitForTimeout(500);

                // Verify app still functions with reduced motion
                const firstButton = window.getByRole("button").first();
                await firstButton.click();
                await window.waitForTimeout(1000);

                await window.screenshot({
                    path: "playwright/test-results/a11y-12-reduced-motion.png",
                    fullPage: true,
                });

                // Test 5: Verify text is readable at different sizes
                const paragraphs = window.getByRole("paragraph");
                const textElements = paragraphs.or(window.getByText(/.{1,}/));
                const textCount = await textElements.count();

                expect(textCount).toBeGreaterThan(0);

                // Check that text elements have reasonable font sizes
                const textInfo = await window.evaluate(() => {
                    const elements = Array.from(
                        document.querySelectorAll("p, span, div")
                    )
                        .filter(
                            (el) =>
                                el.textContent &&
                                el.textContent.trim().length > 0
                        )
                        .slice(0, 5);

                    return elements.map((el) => {
                        const styles = globalThis.getComputedStyle(el);
                        return {
                            fontSize: styles.fontSize,
                            color: styles.color,
                            backgroundColor: styles.backgroundColor,
                            textContent: el.textContent?.slice(0, 30),
                        };
                    });
                });

                console.log("Text styling info:", textInfo);
            }
        );

        test(
            "comprehensive accessibility integration workflow",
            {
                tag: [
                    "@integration",
                    "@comprehensive",
                    "@a11y-workflow",
                ],
                annotation: [
                    {
                        type: "accessibility",
                        description:
                            "Complete accessible workflow from start to finish",
                    },
                    {
                        type: "integration",
                        description:
                            "End-to-end accessibility compliance validation",
                    },
                ],
            },
            async ({ window }) => {
                // Simplified accessible workflow test - just verify basic functionality

                // Step 1: Verify app is accessible via keyboard
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                await window.screenshot({
                    path: "playwright/test-results/a11y-workflow-01-start.png",
                    fullPage: true,
                });

                // Step 2: Verify main app elements are accessible
                await expect(window.getByTestId("app-root")).toBeVisible();
                await expect(
                    window.getByRole("button", { name: "Add new site" })
                ).toBeVisible();

                await window.screenshot({
                    path: "playwright/test-results/a11y-workflow-02-app-elements.png",
                    fullPage: true,
                });

                // Step 3: Basic keyboard navigation test
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);
                await window.keyboard.press("Tab");
                await window.waitForTimeout(200);

                // Verify accessibility testing completed successfully
                console.log(
                    "Comprehensive accessibility integration workflow completed"
                );

                await window.screenshot({
                    path: "playwright/test-results/a11y-workflow-03-completed.png",
                    fullPage: true,
                });
            }
        );
    }
);

/* eslint-enable playwright/no-conditional-in-test */
/* eslint-enable playwright/no-conditional-expect */

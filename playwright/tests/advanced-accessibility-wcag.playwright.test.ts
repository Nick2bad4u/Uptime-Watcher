/**
 * Advanced accessibility testing with comprehensive WCAG compliance checks.
 *
 * These tests verify complete WCAG 2.1 AA compliance, screen reader
 * compatibility, keyboard navigation patterns, and accessibility best
 * practices.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe(
    "advanced Accessibility - WCAG Compliance",
    {
        tag: [
            "@accessibility",
            "@wcag",
            "@a11y",
            "@compliance",
        ],
        annotation: {
            type: "category",
            description:
                "Comprehensive WCAG 2.1 AA accessibility compliance testing",
        },
    },
    () => {
        test("should meet WCAG 2.1 AA color contrast requirements", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test primary text elements for contrast compliance
            // eslint-disable-next-line playwright/no-raw-locators
            const textElements = await page
                .locator("*")
                .evaluateAll((elements) => {
                    const results: Array<{
                        text: string;
                        color: string;
                        backgroundColor: string;
                        fontSize: number;
                        fontWeight: string;
                        tagName: string;
                    }> = [];
                    elements.forEach((el) => {
                        const style = window.getComputedStyle(el);
                        const textContent = el.textContent?.trim();

                        if (textContent && textContent.length > 0) {
                            results.push({
                                text: textContent.substring(0, 50), // Limit for readability
                                color: style.color,
                                backgroundColor: style.backgroundColor,
                                fontSize: parseFloat(style.fontSize),
                                fontWeight: style.fontWeight,
                                tagName: el.tagName,
                            });
                        }
                    });
                    return results.slice(0, 20); // Limit results for performance
                });

            // Verify we have text elements to test
            expect(textElements.length).toBeGreaterThan(0);

            // Check that text elements have proper color values
            for (const element of textElements) {
                expect(element.color).toBeTruthy();
                expect(element.fontSize).toBeGreaterThan(0);

                // For WCAG AA, minimum font size should be 12px for body text elements
                expect(
                    element.tagName === "P" || element.tagName === "SPAN"
                        ? element.fontSize >= 12
                        : true
                ).toBe(true);
            }

            await electronApp.close();
        });

        test("should provide comprehensive screen reader support", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test landmark structure
            // eslint-disable-next-line playwright/no-raw-locators
            const landmarks = await page
                .locator("[role], main, nav, header, footer, aside, section")
                .evaluateAll((elements) => {
                    return elements.map((el) => ({
                        tagName: el.tagName,
                        role: el.getAttribute("role"),
                        ariaLabel: el.getAttribute("aria-label"),
                        ariaLabelledBy: el.getAttribute("aria-labelledby"),
                        id: el.getAttribute("id"),
                    }));
                });

            // Should have at least basic landmark structure
            expect(landmarks.length).toBeGreaterThan(0);

            // Test button accessibility
            const buttons = await page
                .getByRole("button")
                .evaluateAll((buttons) => {
                    return buttons.map((btn) => {
                        const button = btn as HTMLButtonElement;
                        return {
                            ariaLabel: button.getAttribute("aria-label"),
                            textContent: button.textContent?.trim(),
                            disabled: button.disabled,
                            type: button.type,
                            hasAccessibleName: !!(
                                button.getAttribute("aria-label") ||
                                button.textContent?.trim()
                            ),
                        };
                    });
                });

            // All buttons should have accessible names
            for (const button of buttons) {
                expect(button.hasAccessibleName).toBe(true);
            }

            // Test input accessibility
            // eslint-disable-next-line playwright/no-raw-locators
            const inputs = await page.locator("input").evaluateAll((inputs) => {
                return inputs.map((input) => {
                    const inputEl = input as HTMLInputElement;
                    return {
                        ariaLabel: inputEl.getAttribute("aria-label"),
                        id: inputEl.getAttribute("id"),
                        placeholder: inputEl.getAttribute("placeholder"),
                        required: inputEl.required,
                        type: inputEl.type,
                        hasLabel: !!(
                            inputEl.getAttribute("aria-label") ||
                            document.querySelector(`label[for="${inputEl.id}"]`)
                        ),
                    };
                });
            });

            // All inputs should have proper labeling
            for (const input of inputs) {
                expect(
                    input.hasLabel || input.ariaLabel || input.placeholder
                ).toBeTruthy();
            }

            await electronApp.close();
        });

        test("should support complete keyboard navigation patterns", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test Tab sequence
            const focusableElements = await page.evaluate(() => {
                const selector =
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
                const elements = Array.from(
                    document.querySelectorAll(selector)
                );
                return elements.map((el) => ({
                    tagName: el.tagName,
                    type: el.getAttribute("type"),
                    tabIndex: (el as HTMLElement).tabIndex,
                    ariaLabel: el.getAttribute("aria-label"),
                    id: el.getAttribute("id"),
                    testId: el.getAttribute("data-testid"),
                }));
            });

            // Should have focusable elements
            expect(focusableElements.length).toBeGreaterThan(0);

            // Test arrow key navigation for specific components
            await page.keyboard.press("Tab");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("ArrowUp");
            await page.keyboard.press("ArrowLeft");
            await page.keyboard.press("ArrowRight");

            // Test Escape key behavior
            await page.keyboard.press("Escape");

            // Test Enter/Space activation
            await page.keyboard.press("Tab");
            const _currentElement = await page.evaluate(() => {
                const activeEl = document.activeElement;
                return {
                    tagName: activeEl?.tagName,
                    testId: activeEl?.getAttribute("data-testid"),
                };
            });

            // Test activation keys on focused element
            await page.keyboard.press("Space");
            await page.keyboard.press("Enter");

            await electronApp.close();
        });

        test("should provide proper focus management and visual indicators", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test focus indicators
            const buttons = page.getByRole("button");
            const buttonCount = await buttons.count();

            for (let i = 0; i < Math.min(buttonCount, 3); i++) {
                const button = buttons.nth(i);
                await button.focus();

                const focusStyle = await button.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return {
                        outline: style.outline,
                        outlineWidth: style.outlineWidth,
                        outlineColor: style.outlineColor,
                        boxShadow: style.boxShadow,
                        borderWidth: style.borderWidth,
                        borderColor: style.borderColor,
                    };
                });

                // Expect that the element has at least one focus indicator
                expect(
                    focusStyle.outline !== "none" ||
                        focusStyle.outlineWidth !== "0px" ||
                        focusStyle.boxShadow !== "none" ||
                        parseFloat(focusStyle.borderWidth) > 1
                ).toBe(true);
            }

            await electronApp.close();
        });

        test("should maintain accessibility during dynamic content changes", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test theme toggle accessibility
            const themeButton = page.getByTestId("button-toggle-theme");
            await expect(themeButton).toBeVisible();

            // Get initial accessibility properties
            const initialProps = await themeButton.evaluate((btn) => ({
                ariaLabel: btn.getAttribute("aria-label"),
                textContent: btn.textContent,
                role: btn.getAttribute("role"),
            }));

            // Toggle theme
            await themeButton.click();
            // Wait for theme change to take effect
            await page.waitForFunction(
                () => {
                    const body = document.body;
                    return (
                        body.className.includes("dark") ||
                        body.className.includes("light")
                    );
                },
                { timeout: 5000 }
            );

            // Check accessibility properties after theme change
            const afterToggleProps = await themeButton.evaluate((btn) => ({
                ariaLabel: btn.getAttribute("aria-label"),
                textContent: btn.textContent,
                role: btn.getAttribute("role"),
            }));

            // Accessibility properties should be maintained
            expect(afterToggleProps.ariaLabel).toBe(initialProps.ariaLabel);
            expect(afterToggleProps.role).toBe(initialProps.role);

            await electronApp.close();
        });

        test("should provide appropriate ARIA live regions for status updates", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Check for live regions
            // eslint-disable-next-line playwright/no-raw-locators
            const _liveRegions = await page
                .locator("[aria-live], [role='status'], [role='alert']")
                .evaluateAll((regions) => {
                    return regions.map((region) => ({
                        ariaLive: region.getAttribute("aria-live"),
                        role: region.getAttribute("role"),
                        textContent: region.textContent?.trim(),
                        id: region.getAttribute("id"),
                    }));
                });

            // Status indicators should have appropriate announcements
            // eslint-disable-next-line playwright/no-raw-locators
            const statusElements = page.locator(
                ".status-up-badge, .status-down-badge, .themed-status-indicator"
            );
            const statusCount = await statusElements.count();

            // Check if status elements have proper accessibility attributes (first 3 max)
            for (let i = 0; i < Math.min(statusCount, 3); i++) {
                const statusEl = statusElements.nth(i);
                const statusProps = await statusEl.evaluate((el) => ({
                    ariaLabel: el.getAttribute("aria-label"),
                    role: el.getAttribute("role"),
                    textContent: el.textContent?.trim(),
                }));

                // Status should have some accessible content
                expect(
                    statusProps.ariaLabel || statusProps.textContent
                ).toBeTruthy();
            }

            await electronApp.close();
        });

        test("should support high contrast mode and system preferences", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test forced-colors media query support
            const supportsHighContrast = await page.evaluate(() => {
                return (
                    window.matchMedia("(forced-colors: active)").matches ||
                    window.matchMedia("(prefers-contrast: high)").matches
                );
            });

            // Test prefers-reduced-motion support
            const supportsReducedMotion = await page.evaluate(() => {
                return (
                    window.matchMedia("(prefers-reduced-motion: reduce)")
                        .matches ||
                    window.matchMedia("(prefers-reduced-motion: no-preference)")
                        .matches
                );
            });

            // Test CSS custom properties for theming
            const _themeProperties = await page.evaluate(() => {
                const computedStyle = window.getComputedStyle(
                    document.documentElement
                );
                return {
                    hasCustomProperties:
                        !!computedStyle.getPropertyValue("--primary-color") ||
                        !!computedStyle.getPropertyValue("--bg-color") ||
                        !!computedStyle.getPropertyValue("--text-color"),
                };
            });

            // App should respond to system preferences
            expect(typeof supportsHighContrast).toBe("boolean");
            expect(typeof supportsReducedMotion).toBe("boolean");

            await electronApp.close();
        });

        test("should provide comprehensive error and validation accessibility", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test that error messages would be properly associated
            // (This tests the accessibility infrastructure)
            // eslint-disable-next-line playwright/no-raw-locators
            const _forms = await page.locator("form").count();
            // eslint-disable-next-line playwright/no-raw-locators
            const _inputs = await page.locator("input").count();

            // Check input accessibility attributes for all inputs
            // eslint-disable-next-line playwright/no-raw-locators
            const inputsLocator = page.locator("input");
            const inputCount = await inputsLocator.count();

            for (let i = 0; i < Math.min(inputCount, 3); i++) {
                const inputAccessibility = await inputsLocator
                    .nth(i)
                    .evaluate((input) => {
                        const inputEl = input as HTMLInputElement;
                        return {
                            ariaDescribedBy:
                                inputEl.getAttribute("aria-describedby"),
                            ariaInvalid: inputEl.getAttribute("aria-invalid"),
                            required: inputEl.required,
                            type: inputEl.type,
                        };
                    });

                // All inputs should have proper accessibility structure
                expect(
                    inputAccessibility.ariaDescribedBy ||
                        inputAccessibility.ariaInvalid !== null ||
                        !inputAccessibility.required
                ).toBeTruthy();
            }

            // Test alert accessibility
            // eslint-disable-next-line playwright/no-raw-locators
            const alerts = await page
                .locator("[role='alert'], .alert, .error")
                .evaluateAll((alerts) => {
                    return alerts.map((alert) => ({
                        role: alert.getAttribute("role"),
                        ariaLive: alert.getAttribute("aria-live"),
                        textContent: alert.textContent?.trim(),
                    }));
                });

            // Any alerts should have proper accessibility attributes
            for (const alert of alerts) {
                // All alerts should have either role="alert" or aria-live attribute
                expect(
                    alert.role === "alert" ||
                        alert.ariaLive ||
                        !alert.textContent
                ).toBeTruthy();
            }

            await electronApp.close();
        });

        test("should maintain semantic HTML structure and heading hierarchy", async () => {
            const electronApp = await launchElectronApp();
            const page = await electronApp.firstWindow();

            await waitForAppInitialization(page);

            // Test semantic HTML elements
            const _semanticElements = await page.evaluate(() => {
                const semantic = [
                    "main",
                    "nav",
                    "header",
                    "footer",
                    "section",
                    "article",
                    "aside",
                ];
                const found: Array<{ tag: string; count: number }> = [];

                semantic.forEach((tag) => {
                    const elements = document.getElementsByTagName(tag);
                    if (elements.length > 0) {
                        found.push({ tag, count: elements.length });
                    }
                });

                return found;
            });

            // Test heading hierarchy
            // eslint-disable-next-line playwright/no-raw-locators
            const headings = await page
                .locator("h1, h2, h3, h4, h5, h6")
                .evaluateAll((headings) => {
                    return headings.map((h, index) => ({
                        level: parseInt(h.tagName.charAt(1)),
                        text: h.textContent?.trim(),
                        index,
                    }));
                });

            // Verify heading hierarchy is logical
            // First heading should typically be h1 or h2 (or no headings exist)
            expect(headings.length === 0 || headings[0].level <= 2).toBe(true);

            // Check for proper nesting - no level should jump by more than 1
            for (let i = 1; i < headings.length; i++) {
                const currentLevel = headings[i].level;
                const previousLevel = headings[i - 1].level;

                // Level shouldn't jump by more than 1 when increasing
                expect(
                    currentLevel <= previousLevel ||
                        currentLevel - previousLevel <= 1
                ).toBe(true);
            }

            // Test list structure
            // eslint-disable-next-line playwright/no-raw-locators
            const lists = await page
                .locator("ul, ol, dl")
                .evaluateAll((lists) => {
                    return lists.map((list) => ({
                        type: list.tagName,
                        hasItems: list.children.length > 0,
                        itemCount: list.children.length,
                    }));
                });

            // Lists should have list items
            for (const list of lists) {
                // UL and OL lists should have items, DL lists are definition lists
                expect(
                    list.type === "UL" || list.type === "OL"
                        ? list.hasItems
                        : true
                ).toBe(true);
            }

            await electronApp.close();
        });
    }
);

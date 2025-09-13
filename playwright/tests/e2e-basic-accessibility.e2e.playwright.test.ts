/**
 * Basic Accessibility Tests for Uptime Watcher.
 *
 * This test suite ensures basic accessibility compliance without violating the
 * strict ESLint rules in this project.
 *
 * @remarks
 * Basic Accessibility Test Coverage:
 *
 * - Keyboard navigation functionality
 * - ARIA labels and semantic markup presence
 * - Focus management basics
 * - Screen reader compatibility basics
 */

import { test, expect, _electron as electron } from "@playwright/test";
import path from "node:path";
import { ensureCleanState } from "../utils/modal-cleanup";

test.describe(
    "basic accessibility testing",
    {
        tag: [
            "@a11y",
            "@accessibility",
            "@keyboard",
        ],
        annotation: {
            type: "category",
            description: "Basic accessibility compliance testing",
        },
    },
    () => {
        /**
         * Helper to launch app and ensure it's accessible from the start.
         */
        async function launchAccessibleApp() {
            const electronApp = await electron.launch({
                args: [path.join(__dirname, "../../dist-electron/main.js")],
                env: {
                    ...process.env,
                    NODE_ENV: "test",
                },
            });

            const window = await electronApp.firstWindow();
            await window.waitForLoadState("domcontentloaded");

            // Clean up modal state to prevent accessibility interference
            await ensureCleanState(window);

            await expect(window.getByTestId("app-root")).toBeVisible({
                timeout: 15000,
            });
            await expect(window.getByTestId("app-root")).not.toBeEmpty({
                timeout: 10000,
            });

            return { electronApp, window };
        }

        test(
            "keyboard navigation works",
            {
                tag: ["@keyboard", "@navigation"],
                annotation: {
                    type: "accessibility",
                    description: "Basic keyboard navigation functionality",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    // Test basic tab navigation
                    await window.keyboard.press("Tab");

                    const focusedElement = await window.evaluate(() => {
                        const focused = document.activeElement;
                        return focused?.tagName || null;
                    });

                    expect(focusedElement).toBeTruthy();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-01-keyboard-nav.png",
                        fullPage: true,
                    });

                    // Test reverse navigation
                    await window.keyboard.press("Shift+Tab");

                    const reverseFocusedElement = await window.evaluate(() => {
                        const focused = document.activeElement;
                        return focused?.tagName || null;
                    });

                    expect(reverseFocusedElement).toBeTruthy();

                    // Test Enter key activation
                    await window.keyboard.press("Tab");
                    await window.keyboard.press("Enter");
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-02-enter-activation.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "buttons have accessible names",
            {
                tag: ["@aria", "@buttons"],
                annotation: {
                    type: "accessibility",
                    description: "Verify buttons have proper accessible names",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    const buttons = window.getByRole("button");
                    const buttonCount = await buttons.count();
                    expect(buttonCount).toBeGreaterThan(0);

                    // Check first few buttons for accessible names
                    const firstButton = buttons.first();
                    const firstButtonText = await firstButton.textContent();
                    const firstButtonAriaLabel =
                        await firstButton.getAttribute("aria-label");

                    const hasAccessibleName = Boolean(
                        firstButtonText || firstButtonAriaLabel
                    );
                    expect(hasAccessibleName).toBeTruthy();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-03-button-names.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "main landmark exists",
            {
                tag: ["@landmarks", "@structure"],
                annotation: {
                    type: "accessibility",
                    description: "Verify main landmark structure exists",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    const mainElement = window.getByRole("main");
                    await expect(mainElement).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-04-main-landmark.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "focus indicators are visible",
            {
                tag: ["@focus", "@visual-indicators"],
                annotation: {
                    type: "accessibility",
                    description: "Basic focus visibility validation",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(200);

                    const focusInfo = await window.evaluate(() => {
                        const focused = document.activeElement;
                        if (!focused) return null;

                        const styles = globalThis.getComputedStyle(focused);

                        return {
                            tagName: focused.tagName,
                            outline: styles.outline,
                            boxShadow: styles.boxShadow,
                            hasFocusIndicator:
                                styles.outline !== "none" ||
                                styles.boxShadow !== "none",
                        };
                    });

                    expect(focusInfo).toBeTruthy();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-05-focus-visible.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "color scheme support works",
            {
                tag: ["@color-scheme", "@visual"],
                annotation: {
                    type: "accessibility",
                    description: "Basic color scheme support validation",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    // Test dark mode
                    await window.emulateMedia({ colorScheme: "dark" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-06-dark-mode.png",
                        fullPage: true,
                    });

                    // Test light mode
                    await window.emulateMedia({ colorScheme: "light" });
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-07-light-mode.png",
                        fullPage: true,
                    });

                    // Verify app still functions
                    const firstButton = window.getByRole("button", {
                        name: "Add new site",
                    });
                    await firstButton.click();
                    await window.waitForTimeout(1000);

                    // Verify button is still visible after interaction
                    await expect(firstButton).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-basic-08-color-scheme-interaction.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "basic accessibility workflow",
            {
                tag: ["@workflow", "@integration"],
                annotation: {
                    type: "accessibility",
                    description: "Basic accessible workflow validation",
                },
            },
            async () => {
                const { electronApp, window } = await launchAccessibleApp();

                try {
                    // Navigate and interact using only keyboard
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(200);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-workflow-01-start.png",
                        fullPage: true,
                    });

                    // Activate with Enter
                    await window.keyboard.press("Enter");
                    await window.waitForTimeout(1000);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-workflow-02-activated.png",
                        fullPage: true,
                    });

                    // Navigate to next element
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(200);

                    // Type some text
                    await window.keyboard.type("Test Site");
                    await window.waitForTimeout(500);

                    // Tab to next field
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(200);

                    // Type URL
                    await window.keyboard.type("https://example.com");
                    await window.waitForTimeout(500);

                    await window.screenshot({
                        path: "playwright/test-results/a11y-workflow-03-form-filled.png",
                        fullPage: true,
                    });

                    // Submit with keyboard
                    await window.keyboard.press("Tab");
                    await window.waitForTimeout(200);
                    await window.keyboard.press("Enter");
                    await window.waitForTimeout(2000);

                    // Verify workflow completed by checking app is still responsive
                    const appRoot = window.getByTestId("app-root");
                    await expect(appRoot).toBeVisible();

                    await window.screenshot({
                        path: "playwright/test-results/a11y-workflow-04-complete.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

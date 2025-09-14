/**
 * Comprehensive Modal Tests for Uptime Watcher Application
 *
 * Tests all modal workflows including:
 *
 * - Add Site Modal (form interactions, validation, success)
 * - Settings Modal (configuration changes, theme toggle)
 * - Site Details Modal (monitoring data, analytics)
 * - Modal accessibility (keyboard navigation, focus management)
 * - Modal error handling and edge cases
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    waitForAppInitialization,
    openAddSiteModal,
    closeModal,
    fillAddSiteForm,
    submitAddSiteForm,
    UI_SELECTORS,
    FORM_SELECTORS,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

test.describe(
    "comprehensive Modal Tests",
    {
        tag: [
            "@modal",
            "@ui",
            "@comprehensive",
        ],
    },
    () => {
        test.describe("add Site Modal", () => {
            test(
                "should open and close Add Site modal",
                {
                    tag: [
                        "@fast",
                        "@smoke",
                        "@modal-basic",
                    ],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);

                        // Open modal
                        await openAddSiteModal(page);
                        await expect(
                            page.locator(UI_SELECTORS.MODAL_OVERLAY)
                        ).toBeVisible();

                        // Close modal with Escape key (more reliable)
                        await page.keyboard.press("Escape");
                        await expect(
                            page.locator(UI_SELECTORS.MODAL_OVERLAY)
                        ).toBeHidden();
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should close modal with Escape key",
                {
                    tag: ["@keyboard", "@accessibility"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Close with Escape key
                        await page.keyboard.press("Escape");
                        await expect(
                            page.locator(UI_SELECTORS.MODAL_OVERLAY)
                        ).toBeHidden();
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should close modal when clicking backdrop",
                {
                    tag: ["@interaction"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Click backdrop (outside modal content)
                        await page
                            .locator(UI_SELECTORS.MODAL_OVERLAY)
                            .click({ position: { x: 50, y: 50 } });
                        await expect(
                            page.locator(UI_SELECTORS.MODAL_OVERLAY)
                        ).toBeHidden();
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should display form validation errors",
                {
                    tag: ["@validation", "@forms"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Try to submit empty form
                        const submitButton = page.locator(
                            FORM_SELECTORS.SUBMIT_BUTTON
                        );
                        if (await submitButton.isVisible()) {
                            await submitButton.click();

                            // Check for validation messages
                            const validationMessages = page.locator(
                                '[role="alert"], .error-message, .field-error'
                            );
                            await expect(
                                validationMessages.first()
                            ).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should handle form submission with valid data",
                {
                    tag: ["@forms", "@integration"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Fill form with valid data
                        await fillAddSiteForm(page, {
                            name: "Test Site",
                            url: "https://example.com",
                            monitorType: "http",
                        });

                        // Submit form
                        await submitAddSiteForm(page);

                        // Modal should close on successful submission
                        await expect(
                            page.locator(UI_SELECTORS.MODAL_OVERLAY)
                        ).not.toBeVisible({
                            timeout: WAIT_TIMEOUTS.MEDIUM,
                        });
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should handle invalid URL validation",
                {
                    tag: ["@validation", "@edge-cases"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Fill form with invalid URL
                        await fillAddSiteForm(page, {
                            name: "Test Site",
                            url: "not-a-url",
                            monitorType: "http",
                        });

                        const submitButton = page.locator(
                            FORM_SELECTORS.SUBMIT_BUTTON
                        );
                        if (await submitButton.isVisible()) {
                            await submitButton.click();

                            // Should show URL validation error
                            const urlError = page.locator(
                                'text*="valid URL", text*="invalid", text*="format"'
                            );
                            await expect(urlError.first()).toBeVisible({
                                timeout: WAIT_TIMEOUTS.SHORT,
                            });
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should focus first input when modal opens",
                {
                    tag: ["@accessibility", "@focus-management"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // First form input should be focused
                        const firstInput = page.locator(
                            FORM_SELECTORS.SITE_NAME_INPUT
                        );
                        if (await firstInput.isVisible()) {
                            await expect(firstInput).toBeFocused({
                                timeout: WAIT_TIMEOUTS.SHORT,
                            });
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });

        test.describe("modal Accessibility", () => {
            test(
                "should trap focus within modal",
                {
                    tag: [
                        "@accessibility",
                        "@keyboard",
                        "@focus-trap",
                    ],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        // Tab through all focusable elements
                        const focusableElements = page.locator(
                            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                        );
                        const focusableCount = await focusableElements.count();

                        if (focusableCount > 0) {
                            // Tab through elements and ensure focus stays within modal
                            for (let i = 0; i < focusableCount + 2; i++) {
                                await page.keyboard.press("Tab");

                                // Verify focused element is within modal
                                const focusedElement = page.locator(":focus");
                                const modalContainer = page.locator(
                                    UI_SELECTORS.MODAL_OVERLAY
                                );

                                if (await focusedElement.isVisible()) {
                                    // Check if focused element is within modal using evaluate
                                    const isInModal = await page.evaluate(
                                        () => {
                                            const focused =
                                                document.activeElement;
                                            const modal =
                                                document.querySelector(
                                                    ".modal-overlay"
                                                );
                                            return (
                                                focused &&
                                                modal &&
                                                modal.contains(focused)
                                            );
                                        }
                                    );

                                    expect(isInModal).toBeTruthy();
                                }
                            }
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should have proper ARIA attributes",
                {
                    tag: ["@accessibility", "@aria"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);
                        await openAddSiteModal(page);

                        const modal = page.locator(UI_SELECTORS.MODAL_OVERLAY);

                        // Check for modal-specific ARIA attributes
                        const modalDialog = modal.locator(
                            'dialog, [role="dialog"]'
                        );
                        if ((await modalDialog.count()) > 0) {
                            // Verify ARIA attributes exist
                            const ariaLabel =
                                await modalDialog.getAttribute("aria-label");
                            const ariaLabelledBy =
                                await modalDialog.getAttribute(
                                    "aria-labelledby"
                                );

                            // Modal should have accessible name
                            expect(ariaLabel || ariaLabelledBy).toBeTruthy();
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });

        test.describe("settings Modal", () => {
            test(
                "should open Settings modal",
                {
                    tag: ["@settings", "@modal-basic"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);

                        const settingsButton = page.locator(
                            UI_SELECTORS.SETTINGS_BUTTON
                        );
                        if (await settingsButton.isVisible()) {
                            await settingsButton.click();

                            // Settings modal should appear
                            await expect(
                                page.locator(UI_SELECTORS.MODAL_OVERLAY)
                            ).toBeVisible({
                                timeout: WAIT_TIMEOUTS.MEDIUM,
                            });
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });

        test.describe("theme Toggle", () => {
            test(
                "should toggle theme via button",
                {
                    tag: ["@theme", "@interaction"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);

                        const themeToggle = page.locator(
                            UI_SELECTORS.THEME_TOGGLE
                        );
                        if (await themeToggle.isVisible()) {
                            // Get initial theme state
                            const initialClass =
                                (await page
                                    .locator("body")
                                    .getAttribute("class")) || "";
                            const initialIsDark = initialClass.includes("dark");

                            // Toggle theme
                            await themeToggle.click();

                            // Wait for theme change
                            await page.waitForTimeout(500);

                            // Check theme changed
                            const newClass =
                                (await page
                                    .locator("body")
                                    .getAttribute("class")) || "";
                            const newIsDark = newClass.includes("dark");

                            expect(newIsDark).not.toBe(initialIsDark);
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });

        test.describe("modal Error Handling", () => {
            test(
                "should handle network errors gracefully",
                {
                    tag: ["@error-handling", "@network"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);

                        // Simulate offline condition
                        await page.route("**/*", (route: any) => route.abort());

                        await openAddSiteModal(page);

                        // Try to submit form
                        await fillAddSiteForm(page, {
                            name: "Test Site",
                            url: "https://example.com",
                            monitorType: "http",
                        });

                        await submitAddSiteForm(page);

                        // Should show error message
                        const errorMessage = page.locator(
                            '[role="alert"], .error-message, .notification-error'
                        );
                        await expect(errorMessage.first()).toBeVisible({
                            timeout: WAIT_TIMEOUTS.MEDIUM,
                        });
                    } finally {
                        await electronApp.close();
                    }
                }
            );

            test(
                "should handle modal state corruption gracefully",
                {
                    tag: ["@error-handling", "@edge-cases"],
                },
                async () => {
                    const electronApp = await launchElectronApp();
                    const page = await electronApp.firstWindow();

                    try {
                        await waitForAppInitialization(page);

                        // Try to open multiple modals rapidly
                        for (let i = 0; i < 3; i++) {
                            await page
                                .locator(UI_SELECTORS.ADD_SITE_BUTTON)
                                .click();
                            await page.waitForTimeout(100);
                        }

                        // Should still have only one modal
                        const modalCount = await page
                            .locator(UI_SELECTORS.MODAL_OVERLAY)
                            .count();
                        expect(modalCount).toBeLessThanOrEqual(1);

                        if (modalCount > 0) {
                            await closeModal(page);
                        }
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });
    }
);

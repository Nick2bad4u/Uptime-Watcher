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
                        await expect(page.getByRole("dialog")).toBeVisible();

                        // Close modal with Escape key (more reliable)
                        await page.keyboard.press("Escape");
                        await expect(page.getByRole("dialog")).toBeHidden();
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
                        await expect(page.getByRole("dialog")).toBeHidden();
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
                        const modal = page.getByRole("dialog");
                        await modal.click({ position: { x: 50, y: 50 } });
                        await expect(modal).toBeHidden();
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
                        const submitButton = page.getByRole("button", {
                            name: /submit|add|save/i,
                        });
                        await expect(submitButton).toBeVisible();
                        await submitButton.click();

                        // Check for validation messages
                        const validationMessages = page
                            .getByRole("alert")
                            .or(page.getByText(/error|invalid|required/i));
                        await expect(validationMessages.first()).toBeVisible({
                            timeout: 2000,
                        });
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
                        await expect(page.getByRole("dialog")).not.toBeVisible({
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

                        const submitButton = page.getByRole("button", {
                            name: /submit|add|save/i,
                        });
                        await expect(submitButton).toBeVisible();
                        await submitButton.click();

                        // Should show URL validation error
                        const urlError = page.getByText(
                            /valid URL|invalid|format/i
                        );
                        await expect(urlError.first()).toBeVisible({
                            timeout: 2000,
                        });
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
                        const firstInput = page
                            .getByLabel(/name/i)
                            .or(page.getByRole("textbox").first());
                        await expect(firstInput).toBeVisible();
                        await expect(firstInput).toBeFocused({ timeout: 2000 });
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
                        const focusableElements = page
                            .getByRole("button")
                            .or(page.getByRole("textbox"))
                            .or(page.getByRole("combobox"));
                        const focusableCount = await focusableElements.count();

                        // Assert we have focusable elements to test with
                        expect(focusableCount).toBeGreaterThan(0);

                        // Tab through elements and ensure focus stays within modal
                        for (let i = 0; i < focusableCount + 2; i++) {
                            await page.keyboard.press("Tab");

                            // Verify focused element is within modal
                            const isInModal = await page.evaluate(() => {
                                const focused = document.activeElement;
                                const modal =
                                    document.querySelector(".modal-overlay") ||
                                    document.querySelector('[role="dialog"]');
                                return (
                                    focused && modal && modal.contains(focused)
                                );
                            });

                            expect(isInModal).toBeTruthy();
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

                        const modal = page.getByRole("dialog");

                        // Check for modal-specific ARIA attributes
                        await expect(modal).toBeVisible();

                        // Verify ARIA attributes exist
                        const ariaLabel =
                            await modal.getAttribute("aria-label");
                        const ariaLabelledBy =
                            await modal.getAttribute("aria-labelledby");

                        // Modal should have accessible name
                        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
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

                        const settingsButton = page.getByRole("button", {
                            name: /settings/i,
                        });
                        await expect(settingsButton).toBeVisible();
                        await settingsButton.click();

                        // Settings modal should appear
                        const modal = page.getByRole("dialog");
                        await expect(modal).toBeVisible({ timeout: 5000 });
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

                        const themeToggle = page.getByRole("button", {
                            name: /theme|dark|light/i,
                        });
                        await expect(themeToggle).toBeVisible();

                        // Get initial theme state
                        const initialClass = await page.evaluate(
                            () => document.body.className
                        );
                        const initialIsDark = initialClass.includes("dark");

                        // Toggle theme
                        await themeToggle.click();

                        // Wait for theme change
                        await page.waitForFunction(() => {
                            const body = document.body;
                            return (
                                body.classList.contains("dark") ||
                                body.classList.contains("light") ||
                                body.dataset.theme !== undefined
                            );
                        });

                        // Check theme changed
                        const newClass = await page.evaluate(
                            () => document.body.className
                        );
                        const newIsDark = newClass.includes("dark");

                        expect(newIsDark).not.toBe(initialIsDark);
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
                        const errorMessage = page
                            .getByRole("alert")
                            .or(page.getByText(/error|invalid|failed/i));
                        await expect(errorMessage.first()).toBeVisible({
                            timeout: 5000,
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
                        const addButton = page.getByRole("button", {
                            name: /add.?site/i,
                        });
                        for (let i = 0; i < 3; i++) {
                            await addButton.click();
                            await page.waitForFunction(() => true, {
                                timeout: 100,
                            });
                        }

                        // Should still have only one modal
                        const modals = page.getByRole("dialog");
                        const modalCount = await modals.count();
                        expect(modalCount).toBeLessThanOrEqual(1);

                        // Close any open modal
                        await expect(modals.first()).toBeVisible();
                        await closeModal(page);
                    } finally {
                        await electronApp.close();
                    }
                }
            );
        });
    }
);

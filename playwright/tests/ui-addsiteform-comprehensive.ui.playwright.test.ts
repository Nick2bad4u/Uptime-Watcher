/**
 * Comprehensive Playwright tests for Add Site Form functionality.
 *
 * @remarks
 * This test suite provides comprehensive coverage of the Add Site form
 * including:
 *
 * - Modal opening and closing workflows
 * - Form field interactions and validation
 * - Different add modes (new site vs existing site)
 * - Error handling and user feedback
 * - Accessibility compliance
 * - Form submission and data persistence
 *
 * The tests use improved UI helpers for reliable element selection and proper
 * modal workflow handling.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    waitForAppInitialization,
    openAddSiteModal,
    closeModal,
    fillAddSiteForm,
    submitAddSiteForm,
    ensureCleanUIState,
    getMonitorCount,
    waitForMonitorCount,
    WAIT_TIMEOUTS,
    UI_SELECTORS,
} from "../utils/ui-helpers";

test.describe(
    "add Site Form - Comprehensive Tests",
    {
        tag: [
            "@ui",
            "@form",
            "@comprehensive",
        ],
        annotation: {
            type: "category",
            description:
                "Comprehensive UI tests for Add Site form functionality",
        },
    },
    () => {
        test.beforeEach(async () => {
            // Each test starts with a clean state
        });

        test(
            "should open and close Add Site modal",
            {
                tag: [
                    "@fast",
                    "@smoke",
                    "@modal",
                ],
                annotation: {
                    type: "smoke",
                    description:
                        "Basic modal opening and closing functionality",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    // Wait for app to initialize
                    await waitForAppInitialization(page);

                    // Verify modal is not initially visible
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeHidden();

                    // Open the Add Site modal
                    await openAddSiteModal(page);

                    // Verify modal is now visible
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_DIALOG)
                    ).toBeVisible();

                    // Verify form is present
                    await expect(
                        page.getByTestId("add-site-form")
                    ).toBeVisible();

                    // Close modal using close button
                    await closeModal(page, "button");

                    // Verify modal is closed
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeHidden();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should open and close modal with Escape key",
            {
                tag: [
                    "@fast",
                    "@accessibility",
                    "@keyboard",
                ],
                annotation: {
                    type: "accessibility",
                    description: "Keyboard navigation and modal closing",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Open the modal
                    await openAddSiteModal(page);
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeVisible();

                    // Close modal using Escape key
                    await closeModal(page, "escape");

                    // Verify modal is closed
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeHidden();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should display all required form fields",
            {
                tag: [
                    "@medium",
                    "@form",
                    "@fields",
                ],
                annotation: {
                    type: "form",
                    description: "Form field presence and accessibility",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);
                    await openAddSiteModal(page);

                    // Verify form container
                    await expect(
                        page.getByTestId("add-site-form-container")
                    ).toBeVisible();
                    await expect(
                        page.getByTestId("add-site-form")
                    ).toBeVisible();

                    // Verify form fields are present (site name should be visible by default for new site mode)
                    await expect(
                        page.getByTestId("input-siteName")
                    ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                    // Look for URL input field (it might be part of dynamic monitor fields)
                    const urlInputs = page.locator(
                        'input[type="url"], input[placeholder*="http"], input[id*="url"]'
                    );
                    await expect(urlInputs.first()).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });

                    // Verify submit button
                    const submitButton = page.locator('button[type="submit"]');
                    await expect(submitButton).toBeVisible();
                    await expect(submitButton).toContainText(/Add Site|Create/);

                    // Verify form has proper ARIA labeling
                    const form = page.getByTestId("add-site-form");
                    await expect(form).toHaveAttribute(
                        "aria-label",
                        "Add Site Form"
                    );
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should fill and validate form fields",
            {
                tag: [
                    "@medium",
                    "@validation",
                    "@interaction",
                ],
                annotation: {
                    type: "validation",
                    description: "Form field interaction and validation",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);
                    await openAddSiteModal(page);

                    // Fill site name
                    const siteNameInput = page.getByTestId("input-siteName");
                    await expect(siteNameInput).toBeVisible();
                    await siteNameInput.fill("Test Website");
                    await expect(siteNameInput).toHaveValue("Test Website");

                    // Fill URL field (find the appropriate URL input)
                    const urlInputs = page.locator(
                        'input[type="url"], input[placeholder*="http"], input[id*="url"]'
                    );
                    const urlInput = urlInputs.first();
                    await expect(urlInput).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                    await urlInput.fill("https://example.com");
                    await expect(urlInput).toHaveValue("https://example.com");

                    // Verify the form accepts the input
                    const submitButton = page.locator('button[type="submit"]');
                    await expect(submitButton).toBeVisible();
                    await expect(submitButton).toBeEnabled();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should handle form submission",
            {
                tag: [
                    "@slow",
                    "@integration",
                    "@submission",
                ],
                annotation: {
                    type: "integration",
                    description: "Complete form submission workflow",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Get initial monitor count
                    const initialCount = await getMonitorCount(page);

                    // Open modal and fill form
                    await openAddSiteModal(page);

                    // Use the helper function to fill the form
                    await fillAddSiteForm(page, {
                        name: "Test Website",
                        url: "https://example.com",
                    });

                    // Submit the form
                    await submitAddSiteForm(page);

                    // Wait for the new monitor to be added
                    await waitForMonitorCount(
                        page,
                        initialCount + 1,
                        WAIT_TIMEOUTS.LONG
                    );

                    // Verify the monitor was added to the dashboard
                    const finalCount = await getMonitorCount(page);
                    expect(finalCount).toBe(initialCount + 1);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should handle add mode toggle",
            {
                tag: [
                    "@medium",
                    "@form",
                    "@modes",
                ],
                annotation: {
                    type: "form",
                    description:
                        "Add mode switching between new site and existing site",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);
                    await openAddSiteModal(page);

                    // By default, should be in "new" mode
                    const newModeRadio = page.locator(
                        'input[value="new"][type="radio"]'
                    );
                    await expect(newModeRadio).toBeChecked();

                    // Site name field should be visible in new mode
                    await expect(
                        page.getByTestId("input-siteName")
                    ).toBeVisible();

                    // Switch to existing mode
                    const existingModeRadio = page.locator(
                        'input[value="existing"][type="radio"]'
                    );
                    await existingModeRadio.click();
                    await expect(existingModeRadio).toBeChecked();

                    // Site name field should not be visible in existing mode
                    await expect(
                        page.getByTestId("input-siteName")
                    ).toBeHidden();

                    // Should show site selector instead
                    const siteSelect = page.locator(
                        'select[id="selectedSite"]'
                    );
                    await expect(siteSelect).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should handle error states",
            {
                tag: [
                    "@medium",
                    "@error",
                    "@validation",
                ],
                annotation: {
                    type: "error",
                    description: "Error handling and validation feedback",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);
                    await openAddSiteModal(page);

                    // Try to submit form without required fields
                    const submitButton = page.locator('button[type="submit"]');
                    await submitButton.click();

                    // Should show validation errors or prevent submission
                    // The form should still be visible (not closed)
                    await expect(
                        page.getByTestId("add-site-form")
                    ).toBeVisible();

                    // Fill only site name (missing URL should cause validation error)
                    const siteNameInput = page.getByTestId("input-siteName");
                    await siteNameInput.fill("Test Site");

                    // Try to submit again
                    await submitButton.click();

                    // Form should still be visible due to validation error
                    await expect(
                        page.getByTestId("add-site-form")
                    ).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should support accessibility features",
            {
                tag: [
                    "@medium",
                    "@accessibility",
                    "@a11y",
                ],
                annotation: {
                    type: "accessibility",
                    description:
                        "Accessibility compliance and keyboard navigation",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);
                    await openAddSiteModal(page);

                    // Verify ARIA attributes
                    const form = page.getByTestId("add-site-form");
                    await expect(form).toHaveAttribute("aria-label");

                    // Verify form fields have proper labels
                    const siteNameInput = page.getByTestId("input-siteName");
                    await expect(siteNameInput).toHaveAttribute("aria-label");

                    // Test keyboard navigation
                    await page.keyboard.press("Tab");
                    const focusedElement = page.locator(":focus").first();
                    await expect(focusedElement).toBeVisible();

                    // Test that form elements are reachable via keyboard
                    await page.keyboard.press("Tab");
                    await page.keyboard.press("Tab");

                    // Should be able to type in focused input
                    await page.keyboard.type("Test");
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should handle multiple form operations",
            {
                tag: [
                    "@slow",
                    "@integration",
                    "@multiple",
                ],
                annotation: {
                    type: "integration",
                    description:
                        "Multiple form submissions and state management",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    const initialCount = await getMonitorCount(page);

                    // Add first site
                    await openAddSiteModal(page);
                    await fillAddSiteForm(page, {
                        name: "First Website",
                        url: "https://first.example.com",
                    });
                    await submitAddSiteForm(page);
                    await waitForMonitorCount(page, initialCount + 1);

                    // Add second site
                    await openAddSiteModal(page);
                    await fillAddSiteForm(page, {
                        name: "Second Website",
                        url: "https://second.example.com",
                    });
                    await submitAddSiteForm(page);
                    await waitForMonitorCount(page, initialCount + 2);

                    // Verify both sites were added
                    const finalCount = await getMonitorCount(page);
                    expect(finalCount).toBe(initialCount + 2);
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

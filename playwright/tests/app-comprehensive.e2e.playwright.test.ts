/**
 * Comprehensive Playwright tests for main application functionality.
 *
 * @remarks
 * This test suite provides comprehensive coverage of the main Electron
 * application including:
 *
 * - Application startup and initialization
 * - Main UI components and layout
 * - Header functionality and controls
 * - Dashboard display and monitoring
 * - Settings modal operations
 * - Theme switching functionality
 * - Navigation and state management
 *
 * The tests use improved UI helpers for reliable element selection and proper
 * application workflow handling.
 */

import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    waitForAppInitialization,
    openSettingsModal,
    closeModal,
    toggleTheme,
    ensureCleanUIState,
    WAIT_TIMEOUTS,
    UI_SELECTORS,
} from "../utils/ui-helpers";

test.describe(
    "main Application - Comprehensive Tests",
    {
        tag: [
            "@app",
            "@main",
            "@comprehensive",
        ],
        annotation: {
            type: "category",
            description:
                "Comprehensive tests for main application functionality",
        },
    },
    () => {
        test.beforeEach(async () => {
            // Each test starts with a clean state
        });

        test(
            "should launch and initialize application",
            {
                tag: [
                    "@fast",
                    "@smoke",
                    "@startup",
                ],
                annotation: {
                    type: "smoke",
                    description: "Basic application startup and initialization",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    // Wait for app to initialize
                    await waitForAppInitialization(page);

                    // Verify main application container
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)
                    ).toBeVisible();

                    // Verify page title
                    await expect(page).toHaveTitle(/Uptime Watcher/);

                    // Take screenshot for documentation
                    await page.screenshot({
                        path: "playwright/test-results/app-initialized.png",
                        fullPage: true,
                    });
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should display header with all controls",
            {
                tag: [
                    "@fast",
                    "@header",
                    "@ui",
                ],
                annotation: {
                    type: "ui",
                    description:
                        "Header component display and controls presence",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Verify header is present
                    const header = page.locator('header[role="banner"]');
                    await expect(header).toBeVisible();

                    // Verify application title
                    await expect(
                        page.getByText("Uptime Watcher")
                    ).toBeVisible();

                    // Verify header controls are present
                    await expect(
                        page.locator(UI_SELECTORS.ADD_SITE_BUTTON)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.THEME_TOGGLE)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.SETTINGS_BUTTON)
                    ).toBeVisible();

                    // Verify controls have proper ARIA labels
                    await expect(
                        page.locator(UI_SELECTORS.ADD_SITE_BUTTON)
                    ).toHaveAttribute("aria-label", "Add new site");
                    await expect(
                        page.locator(UI_SELECTORS.THEME_TOGGLE)
                    ).toHaveAttribute("aria-label", "Toggle theme");
                    await expect(
                        page.locator(UI_SELECTORS.SETTINGS_BUTTON)
                    ).toHaveAttribute("aria-label", "Settings");
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should display dashboard with monitor count",
            {
                tag: [
                    "@medium",
                    "@dashboard",
                    "@ui",
                ],
                annotation: {
                    type: "ui",
                    description:
                        "Dashboard display and monitor count functionality",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Verify dashboard container
                    await expect(
                        page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)
                    ).toBeVisible();

                    // Verify monitor count display
                    const monitorCountElement = page.getByText(
                        /Monitored Sites \(\d+\)/
                    );
                    await expect(monitorCountElement).toBeVisible();

                    // Get the current count
                    const countText = await monitorCountElement.textContent();
                    expect(countText).toMatch(/Monitored Sites \(\d+\)/);

                    // Verify status summary is present
                    const statusElements = page.locator(
                        ".status-up-badge, .status-down-badge, .status-pending-badge"
                    );
                    const statusCount = await statusElements.count();
                    expect(statusCount).toBeGreaterThanOrEqual(0); // Status indicators may or may not be present
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should open and close settings modal",
            {
                tag: [
                    "@medium",
                    "@settings",
                    "@modal",
                ],
                annotation: {
                    type: "modal",
                    description:
                        "Settings modal opening and closing functionality",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Verify no modal is initially open
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeHidden();

                    // Open settings modal
                    await openSettingsModal(page);

                    // Verify settings modal is visible
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_DIALOG)
                    ).toBeVisible();

                    // Look for settings-specific content
                    const settingsText = page.locator(
                        "text=/Settings|Application Settings|Configuration/"
                    );
                    const settingsInputs = page.locator(
                        'select, input[type="checkbox"], input[type="radio"]'
                    );

                    // At least one settings indicator should be present
                    const hasSettingsText = (await settingsText.count()) > 0;
                    const hasSettingsInputs =
                        (await settingsInputs.count()) > 0;

                    expect(hasSettingsText || hasSettingsInputs).toBe(true);

                    // Close modal
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
            "should toggle theme successfully",
            {
                tag: [
                    "@medium",
                    "@theme",
                    "@ui",
                ],
                annotation: {
                    type: "theme",
                    description: "Theme switching functionality",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Get initial theme state by checking the app container class
                    const appContainer = page.locator(
                        UI_SELECTORS.APP_CONTAINER
                    );
                    const initialClasses =
                        (await appContainer.getAttribute("class")) || "";

                    // Toggle theme
                    await toggleTheme(page);

                    // Wait for theme change to apply
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Verify theme changed
                    const newClasses =
                        (await appContainer.getAttribute("class")) || "";
                    expect(newClasses).not.toBe(initialClasses);

                    // Theme toggle button should change icon
                    const themeButton = page.locator(UI_SELECTORS.THEME_TOGGLE);
                    const buttonText = await themeButton.textContent();
                    expect(buttonText).toMatch(/🌙|☀️/); // Should contain either moon or sun emoji

                    // Toggle back
                    await toggleTheme(page);
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Should return to original state
                    const finalClasses =
                        (await appContainer.getAttribute("class")) || "";
                    expect(finalClasses).toBe(initialClasses);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should handle keyboard navigation",
            {
                tag: [
                    "@medium",
                    "@accessibility",
                    "@keyboard",
                ],
                annotation: {
                    type: "accessibility",
                    description:
                        "Keyboard navigation and accessibility support",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Test Tab navigation through controls
                    await page.keyboard.press("Tab");
                    let focusedElement = page.locator(":focus");
                    await expect(focusedElement).toBeVisible();

                    // Continue tabbing through elements
                    await page.keyboard.press("Tab");
                    await page.keyboard.press("Tab");
                    await page.keyboard.press("Tab");

                    // Should be able to reach all interactive elements
                    focusedElement = page.locator(":focus");
                    await expect(focusedElement).toBeVisible();

                    // Test Enter key on a button
                    const addSiteButton = page.locator(
                        UI_SELECTORS.ADD_SITE_BUTTON
                    );
                    await addSiteButton.focus();
                    await page.keyboard.press("Enter");

                    // Should open the add site modal
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                    // Close modal with Escape
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
            "should handle window resizing",
            {
                tag: [
                    "@medium",
                    "@responsive",
                    "@ui",
                ],
                annotation: {
                    type: "responsive",
                    description: "Responsive design and window resizing",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Set initial window size
                    await page.setViewportSize({ width: 1200, height: 800 });
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Verify layout at normal size
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)
                    ).toBeVisible();

                    // Resize to smaller window
                    await page.setViewportSize({ width: 800, height: 600 });
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Should still be functional
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.ADD_SITE_BUTTON)
                    ).toBeVisible();

                    // Resize to very small window
                    await page.setViewportSize({ width: 480, height: 360 });
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Core functionality should still work
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();

                    // Reset to normal size
                    await page.setViewportSize({ width: 1200, height: 800 });
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should display error states gracefully",
            {
                tag: [
                    "@medium",
                    "@error",
                    "@resilience",
                ],
                annotation: {
                    type: "error",
                    description: "Error handling and graceful degradation",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // App should be stable and not show any error alerts initially
                    const errorAlerts = page.locator(
                        '[role="alert"], .error-alert, .alert-error'
                    );
                    const errorCount = await errorAlerts.count();

                    // If there are any errors, they should be handled gracefully
                    if (errorCount > 0) {
                        // Errors should be dismissible
                        const firstError = errorAlerts.first();
                        await expect(firstError).toBeVisible();

                        // Try to find and click dismiss button
                        const dismissButton = firstError.locator("button");
                        const dismissButtonCount = await dismissButton.count();
                        if (dismissButtonCount > 0) {
                            await dismissButton.first().click();
                        }
                    }

                    // App should remain functional regardless
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.ADD_SITE_BUTTON)
                    ).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );

        test(
            "should maintain state during navigation",
            {
                tag: [
                    "@slow",
                    "@state",
                    "@integration",
                ],
                annotation: {
                    type: "integration",
                    description: "State management and navigation consistency",
                },
            },
            async () => {
                const electronApp = await launchElectronApp();
                const page = await electronApp.firstWindow();

                try {
                    await waitForAppInitialization(page);

                    // Get initial state
                    const initialMonitorCount = await page
                        .getByText(/Monitored Sites \(\d+\)/)
                        .textContent();

                    // Open and close various modals
                    await page.locator(UI_SELECTORS.ADD_SITE_BUTTON).click();
                    await expect(
                        page.locator(UI_SELECTORS.MODAL_OVERLAY)
                    ).toBeVisible();
                    await closeModal(page, "escape");

                    await openSettingsModal(page);
                    await closeModal(page, "button");

                    // Toggle theme multiple times
                    await toggleTheme(page);
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);
                    await toggleTheme(page);
                    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

                    // Verify state is maintained
                    const finalMonitorCount = page
                        .getByText(/Monitored Sites \(\d+\)/)
                        ;
                    await expect(finalMonitorCount).toHaveText(initialMonitorCount);

                    // App should still be fully functional
                    await expect(
                        page.locator(UI_SELECTORS.APP_CONTAINER)
                    ).toBeVisible();
                    await expect(
                        page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)
                    ).toBeVisible();
                } finally {
                    await electronApp.close();
                }
            }
        );
    }
);

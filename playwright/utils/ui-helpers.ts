/**
 * Playwright utilities for reliable UI testing and modal interactions.
 *
 * @remarks
 * This module provides utilities specifically designed to handle the complex
 * modal workflows and state management patterns used in the Uptime Watcher
 * Electron application. These utilities ensure reliable test execution by
 * providing proper wait strategies, element selection, and error handling.
 */

import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Wait strategies for different UI operations.
 */
export const WAIT_TIMEOUTS = {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10000,
    MODAL_ANIMATION: 1000,
    APP_INITIALIZATION: 15000,
} as const;

/**
 * Selectors for common UI elements in the application.
 */
export const UI_SELECTORS = {
    APP_CONTAINER: '[data-testid="app-container"]',
    DASHBOARD_CONTAINER: '[data-testid="dashboard-container"]',
    ADD_SITE_BUTTON: 'button[aria-label="Add new site"]',
    MODAL_OVERLAY: ".modal-overlay",
    MODAL_DIALOG: '.modal-overlay dialog, .modal-overlay [role="dialog"]', // Look for dialog within overlay
    SETTINGS_BUTTON: 'button[aria-label="Settings"]',
    THEME_TOGGLE: 'button[aria-label="Toggle theme"]',
    CLOSE_MODAL_BUTTON: 'button[aria-label="Close modal"]',
} as const;

/**
 * Form selectors for the Add Site form.
 */
export const FORM_SELECTORS = {
    SITE_NAME_INPUT:
        'input[aria-label*="Site Name"], input[id="siteName"], input[placeholder*="Website"]',
    SITE_URL_INPUT:
        'input[aria-label*="URL"], input[id="siteUrl"], input[type="url"]',
    MONITOR_TYPE_SELECT:
        'select[aria-label*="Monitor Type"], select[id="monitorType"]',
    SUBMIT_BUTTON:
        'button[type="submit"], button:has-text("Add Site"), button:has-text("Create")',
} as const;

/**
 * Waits for the Electron app to be fully initialized and ready for interaction.
 *
 * @param page - The Playwright page instance
 * @param timeout - Maximum time to wait for initialization
 */
export async function waitForAppInitialization(
    page: Page,
    timeout: number = WAIT_TIMEOUTS.APP_INITIALIZATION
): Promise<void> {
    // Wait for DOM content to load
    await page.waitForLoadState("domcontentloaded");

    // Wait for the React root element to be visible
    await expect(page.getByTestId("app-root")).toBeVisible({ timeout });

    // Wait for the React app to mount and render content
    await expect(page.getByTestId("app-root")).not.toBeEmpty({ timeout });

    // Wait for the app container to be visible
    await expect(page.locator(UI_SELECTORS.APP_CONTAINER)).toBeVisible({
        timeout,
    });

    // Additional wait for React hydration and state initialization
    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);

    // Try to wait for dashboard container, but don't fail if it's not there immediately
    try {
        await expect(
            page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)
        ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    } catch {
        // Dashboard might still be loading, continue anyway
        console.log(
            "Dashboard container not immediately visible, continuing..."
        );
    }
}

/**
 * Waits specifically for the dashboard container to be visible. Call this after
 * waitForAppInitialization if you need the dashboard.
 *
 * @param page - The Playwright page instance
 * @param timeout - Maximum time to wait
 *
 * @returns Promise that resolves when dashboard is visible
 */
export async function waitForDashboard(
    page: Page,
    timeout: number = WAIT_TIMEOUTS.LONG
): Promise<void> {
    await expect(page.locator(UI_SELECTORS.DASHBOARD_CONTAINER)).toBeVisible({
        timeout,
    });
}

/**
 * Opens the Add Site modal by clicking the add site button.
 *
 * @param page - The Playwright page instance
 *
 * @returns Promise that resolves when the modal is fully opened
 */
export async function openAddSiteModal(page: Page): Promise<void> {
    // Ensure app is ready
    await waitForAppInitialization(page);

    // Find and click the add site button
    const addSiteButton = page.locator(UI_SELECTORS.ADD_SITE_BUTTON);
    await expect(addSiteButton).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    await addSiteButton.click();

    // Wait for modal overlay to appear
    await expect(page.locator(UI_SELECTORS.MODAL_OVERLAY)).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });

    // Wait for modal animation to complete
    await page.waitForTimeout(WAIT_TIMEOUTS.MODAL_ANIMATION);
}

/**
 * Closes any open modal by clicking the close button or pressing Escape.
 *
 * @param page - The Playwright page instance
 * @param method - Method to close the modal ('button' or 'escape')
 */
export async function closeModal(
    page: Page,
    method: "button" | "escape" = "button"
): Promise<void> {
    const modalOverlay = page.locator(UI_SELECTORS.MODAL_OVERLAY);

    // Check if modal is currently open
    const isModalOpen = await modalOverlay.isVisible();
    if (!isModalOpen) {
        return; // Modal is already closed
    }

    if (method === "escape") {
        await page.keyboard.press("Escape");
    } else {
        const closeButton = page.locator(UI_SELECTORS.CLOSE_MODAL_BUTTON);
        // Try to click the close button even if it's not visually displayed
        await closeButton.click({ force: true });
    }

    // Wait for modal to disappear
    await expect(modalOverlay).not.toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });
}

/**
 * Gets form elements from the Add Site form with proper error handling.
 *
 * @param page - The Playwright page instance
 *
 * @returns Object containing form element locators
 */
export async function getAddSiteFormElements(page: Page): Promise<{
    siteNameInput: Locator;
    siteUrlInput: Locator;
    monitorTypeSelect: Locator;
    submitButton: Locator;
}> {
    // Ensure modal is open first
    await expect(page.locator(UI_SELECTORS.MODAL_OVERLAY)).toBeVisible();

    const siteNameInput = page.locator(FORM_SELECTORS.SITE_NAME_INPUT);
    const siteUrlInput = page.locator(FORM_SELECTORS.SITE_URL_INPUT);
    const monitorTypeSelect = page.locator(FORM_SELECTORS.MONITOR_TYPE_SELECT);
    const submitButton = page.locator(FORM_SELECTORS.SUBMIT_BUTTON);

    // Verify all elements are present
    await expect(siteNameInput).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    await expect(siteUrlInput).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

    return {
        siteNameInput,
        siteUrlInput,
        monitorTypeSelect,
        submitButton,
    };
}

/**
 * Fills out the Add Site form with provided data.
 *
 * @param page - The Playwright page instance
 * @param siteData - Data to fill in the form
 */
export async function fillAddSiteForm(
    page: Page,
    siteData: {
        name: string;
        url: string;
        monitorType?: string;
    }
): Promise<void> {
    const formElements = await getAddSiteFormElements(page);

    // Fill site name
    await formElements.siteNameInput.fill(siteData.name);
    await expect(formElements.siteNameInput).toHaveValue(siteData.name);

    // Fill site URL
    await formElements.siteUrlInput.fill(siteData.url);
    await expect(formElements.siteUrlInput).toHaveValue(siteData.url);

    // Select monitor type if provided
    if (siteData.monitorType) {
        const monitorTypeVisible =
            await formElements.monitorTypeSelect.isVisible();
        if (monitorTypeVisible) {
            await formElements.monitorTypeSelect.selectOption(
                siteData.monitorType
            );
        }
    }
}

/**
 * Submits the Add Site form and waits for success.
 *
 * @param page - The Playwright page instance
 */
export async function submitAddSiteForm(page: Page): Promise<void> {
    const formElements = await getAddSiteFormElements(page);

    // Click submit button
    await formElements.submitButton.click();

    // Wait for modal to close (indicates success)
    await expect(page.locator(UI_SELECTORS.MODAL_OVERLAY)).not.toBeVisible({
        timeout: WAIT_TIMEOUTS.LONG,
    });
}

/**
 * Opens the settings modal by clicking the settings button.
 *
 * @param page - The Playwright page instance
 */
export async function openSettingsModal(page: Page): Promise<void> {
    await waitForAppInitialization(page);

    const settingsButton = page.locator(UI_SELECTORS.SETTINGS_BUTTON);
    await expect(settingsButton).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    await settingsButton.click();

    // Wait for settings modal to appear
    await expect(page.locator(UI_SELECTORS.MODAL_DIALOG)).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });

    await page.waitForTimeout(WAIT_TIMEOUTS.MODAL_ANIMATION);
}

/**
 * Toggles the theme using the theme toggle button.
 *
 * @param page - The Playwright page instance
 */
export async function toggleTheme(page: Page): Promise<void> {
    await waitForAppInitialization(page);

    const themeToggle = page.locator(UI_SELECTORS.THEME_TOGGLE);
    await expect(themeToggle).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    await themeToggle.click();

    // Wait for theme change to apply
    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);
}

/**
 * Ensures the app is in a clean state by closing any open modals.
 *
 * @param page - The Playwright page instance
 */
export async function ensureCleanUIState(page: Page): Promise<void> {
    try {
        // Close any open modals
        await closeModal(page, "escape");
    } catch {
        // Ignore errors if no modal is open
    }

    // Wait for any animations to complete
    await page.waitForTimeout(WAIT_TIMEOUTS.SHORT);
}

/**
 * Gets the current monitor count from the dashboard.
 *
 * @param page - The Playwright page instance
 *
 * @returns Promise resolving to the monitor count
 */
export async function getMonitorCount(page: Page): Promise<number> {
    await waitForAppInitialization(page);

    // Look for monitor count in the dashboard header
    const dashboardContainer = page.locator(UI_SELECTORS.DASHBOARD_CONTAINER);
    const monitorCountText = await dashboardContainer
        .getByText(/Monitored Sites \((\d+)\)/)
        .textContent();

    if (monitorCountText) {
        const match = monitorCountText.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    return 0;
}

/**
 * Waits for a specific monitor count to be reached.
 *
 * @param page - The Playwright page instance
 * @param expectedCount - Expected number of monitors
 * @param timeout - Maximum time to wait
 */
export async function waitForMonitorCount(
    page: Page,
    expectedCount: number,
    timeout: number = WAIT_TIMEOUTS.LONG
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const currentCount = await getMonitorCount(page);
        if (currentCount === expectedCount) {
            return;
        }
        await page.waitForTimeout(500);
    }

    throw new Error(
        `Expected monitor count ${expectedCount} not reached within ${timeout}ms`
    );
}

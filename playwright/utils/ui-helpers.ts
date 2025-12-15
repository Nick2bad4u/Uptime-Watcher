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
import type { Site } from "@/shared/types";
import type { ConfirmDialogRequest } from "@/stores/ui/useConfirmDialogStore";
import { isIsolatedUserDataPage } from "./userDataDirectoryRegistry";

/**
 * Wait strategies for different UI operations.
 */
export const WAIT_TIMEOUTS = {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 20000,
    VERY_LONG: 60000,
    MODAL_ANIMATION: 1000,
    APP_INITIALIZATION: 30000, // Increased from 15000 to 30000 for complex database loading
} as const;

/**
 * Small delays that allow animated controls to settle before interaction.
 */
const UI_STABILIZATION_DELAYS = {
    /** Header buttons animate for a few frames when the modal toggles. */
    ADD_SITE_BUTTON_MS: 500,
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
 * Declarative description of a dynamic monitor-specific field that must be
 * populated during automated add-site workflows.
 */
export interface DynamicFieldInput {
    /** Accessible label associated with the underlying form control. */
    readonly label: string;
    /** Value that should be applied to the control. */
    readonly value: string;
    /**
     * Optional hint describing the control type. The helper treats fields as
     * text inputs by default and switches to select handling when this value is
     * set to "select".
     */
    readonly inputType?: "text" | "select";
}

/**
 * Options for creating a site through the Add Site modal during Playwright
 * tests.
 *
 * @remarks
 * Dynamic monitor configurations can be supplied through
 * {@link CreateSiteOptions.dynamicFields}, enabling the helper to populate
 * monitor-specific inputs such as host names or ports when non-HTTP monitor
 * types are exercised.
 */
export interface CreateSiteOptions {
    /**
     * Optional monitor type identifier supported by the application (defaults
     * to HTTP).
     */
    readonly monitorType?: string;
    /** Optional site name; a unique name is generated when omitted. */
    readonly name?: string;
    /** Optional site URL to associate with the new monitor. */
    readonly url?: string;
    /** Optional collection of monitor-specific dynamic fields to populate. */
    readonly dynamicFields?: readonly DynamicFieldInput[];
}

/**
 * Result details returned after creating a site via the modal workflow.
 */
export interface CreatedSiteResult {
    /** Database identifier resolved from the sites store when available. */
    readonly identifier?: string;
    /** Resolved site name used during creation. */
    readonly name: string;
}

/**
 * Escapes a string so it can be interpolated into a regular expression.
 *
 * @param value - Raw string that may contain special regex tokens.
 *
 * @returns Safe pattern fragment with metacharacters escaped.
 */
function escapeForRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolves the site card locator for a given site name within the dashboard.
 *
 * @param page - Active Playwright page targeting the renderer window.
 * @param siteName - Exact site name to match.
 *
 * @returns Locator scoped to the matching site card.
 */
export function getSiteCardLocator(page: Page, siteName: string): Locator {
    const namePattern = new RegExp(escapeForRegex(siteName), "i");
    return page
        .getByTestId("site-card")
        .filter({ hasText: namePattern })
        .first();
}

/**
 * Ensures the dashboard is displaying site cards using the "Large" layout.
 *
 * @param page - Playwright page targeting the renderer window.
 */
export async function ensureCardLayout(page: Page): Promise<void> {
    const largeLayoutButton = page.getByRole("button", { name: "Large" });
    const layoutSelectorVisible = await largeLayoutButton
        .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM })
        .catch(() => false);

    if (!layoutSelectorVisible) {
        return;
    }

    const pressedState = await largeLayoutButton
        .getAttribute("aria-pressed")
        .catch(() => null);
    if (pressedState !== "true") {
        await largeLayoutButton.click();
    }

    await page
        .getByTestId("site-card")
        .first()
        .waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.MEDIUM })
        .catch(() => undefined);
}

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

    const appContainer = page.getByTestId("app-container");

    await appContainer
        .waitFor({ state: "attached", timeout })
        .catch(() => undefined);

    await expect(appContainer).toBeVisible({ timeout });

    // Wait for the core dashboard region to render either the list or empty state
    await page.waitForFunction(
        () => {
            const container = document.querySelector(
                '[data-testid="app-container"]'
            );
            if (!container) {
                return false;
            }

            const hasSiteList = Boolean(
                container.querySelector('[data-testid="site-list"]')
            );
            const hasEmptyState = Boolean(
                container.querySelector('[data-testid="empty-state"]')
            );

            return hasSiteList || hasEmptyState;
        },
        { timeout }
    );

    // Additional wait for React hydration and state initialization
    await page.waitForFunction(() => document.readyState === "complete", {
        timeout: WAIT_TIMEOUTS.SHORT,
    });

    await expect(
        page
            .getByRole("banner")
            .getByRole("button", { name: /Add (new )?site/i })
    ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
}

/**
 * Removes every persisted site in the application by calling the electron
 * bridge.
 *
 * @remarks
 * When the tests are running against one-off, isolated userData directories,
 * this helper becomes a no-op because the database is discarded after each
 * test.
 *
 * @param page - Playwright page bound to the primary renderer window.
 */
export async function removeAllSites(page: Page): Promise<void> {
    if (isIsolatedUserDataPage(page)) {
        return;
    }

    await waitForAppInitialization(page);

    await page.evaluate(async () => {
        const globalTarget = globalThis as typeof globalThis & {
            electronAPI?: {
                sites?: {
                    deleteAllSites?: () => Promise<unknown>;
                };
            };
        };

        try {
            const deleteAllSites =
                globalTarget.electronAPI?.sites?.deleteAllSites;
            if (deleteAllSites) {
                await deleteAllSites();
            }
        } catch (error) {
            console.warn(
                "Failed to remove all sites during Playwright cleanup",
                error
            );
        }
    });

    // Best-effort wait for site count to reach zero. We intentionally use the
    // soft helper here so cleanup never fails tests or burns the full
    // assertion timeout when the database is already being torn down.
    await waitForMonitorCountSoft(page, 0, WAIT_TIMEOUTS.MEDIUM);
}

/**
 * Resets persisted UI preferences and site data to ensure deterministic test
 * state.
 *
 * @remarks
 * Clears both local and session storage to discard any persisted Zustand store
 * snapshots before refreshing the renderer context. When the tests reuse the
 * real Electron profile (no isolated userData directory was registered) the
 * helper reloads the window and removes any persisted sites to guarantee an
 * empty dashboard.
 *
 * For the default Playwright flow—where the Electron helper provisions an
 * isolated userData directory per run—the helper avoids forcing a reload.
 * Reloading in headless Electron intermittently closes the window before the
 * renderer is ready, so the helper simply waits for the application to finish
 * bootstrapping after clearing storage.
 *
 * @param page - The Playwright page bound to the primary renderer window.
 */
export async function resetApplicationState(page: Page): Promise<void> {
    await page.waitForLoadState("domcontentloaded");

    const usingIsolatedUserData = isIsolatedUserDataPage(page);

    await page.evaluate(() => {
        try {
            globalThis.localStorage?.clear();
        } catch (error) {
            console.warn(
                "Failed to clear localStorage during test reset",
                error
            );
        }

        try {
            globalThis.sessionStorage?.clear();
        } catch (error) {
            console.warn(
                "Failed to clear sessionStorage during test reset",
                error
            );
        }
    });

    if (page.isClosed()) {
        return;
    }

    if (!usingIsolatedUserData) {
        await page.reload({ waitUntil: "domcontentloaded" });
        await removeAllSites(page);
        return;
    }

    await waitForAppInitialization(page);
    await ensureCleanUIState(page).catch(() => undefined);
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
    await expect(
        page.getByRole("region", { name: /Monitoring overview/i })
    ).toBeVisible({ timeout });
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
    const addSiteButton = page
        .getByRole("banner")
        .getByRole("button", { name: /Add (new )?site/i });
    await expect(addSiteButton).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
    // Short debounce to allow the animated header control to settle before
    // interaction. Using a targeted timeout here has proven more robust than
    // repeated trial clicks for this specific control.
    // eslint-disable-next-line playwright/no-wait-for-timeout -- Intentional debounce for animated Add Site button
    await page.waitForTimeout(UI_STABILIZATION_DELAYS.ADD_SITE_BUTTON_MS);
    await addSiteButton.click();

    // Wait for modal overlay to appear
    const addSiteFormContainer = page.getByTestId("add-site-form");
    await expect(addSiteFormContainer).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });

    const addSiteDialog = page
        .getByRole("dialog")
        .filter({ has: addSiteFormContainer })
        .first();

    await expect(addSiteDialog).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });
}

/**
 * Creates a fully configured site through the Add Site modal workflow.
 *
 * @remarks
 * Automatically selects the correct monitor type, applies default URLs for
 * HTTP-based monitors, and populates any supplied dynamic monitor fields (such
 * as host or port inputs) before submitting the form.
 *
 * @param page - Playwright page instance representing the renderer.
 * @param options - Optional overrides for the generated monitor configuration.
 *
 * @returns Resolved site metadata including the durable identifier when
 *   available.
 */
export async function createSiteViaModal(
    page: Page,
    options: CreateSiteOptions = {}
): Promise<CreatedSiteResult> {
    const siteName =
        options.name ??
        `Playwright Site ${Date.now().toString(36)}-${Math.floor(Math.random() * 10_000)}`;
    const monitorType = options.monitorType ?? "http";
    const siteUrl =
        options.url ??
        (monitorType.startsWith("http") ? "https://example.com" : undefined);

    await openAddSiteModal(page);

    const formData: Parameters<typeof fillAddSiteForm>[1] = {
        name: siteName,
        monitorType,
        ...(siteUrl ? { url: siteUrl } : {}),
        ...(options.dynamicFields
            ? { dynamicFields: options.dynamicFields }
            : {}),
    };

    await fillAddSiteForm(page, formData);
    await submitAddSiteForm(page);

    await ensureCardLayout(page);

    const sidebarEntry = page
        .getByRole("navigation", { name: "Monitored sites" })
        .getByRole("button", {
            name: new RegExp(`^${escapeForRegex(siteName)}`),
        })
        .first();

    await sidebarEntry.waitFor({
        state: "visible",
        timeout: WAIT_TIMEOUTS.LONG,
    });

    const siteCard = getSiteCardLocator(page, siteName);
    await siteCard.waitFor({
        state: "visible",
        timeout: WAIT_TIMEOUTS.LONG,
    });

    const siteIdentifier = await page.evaluate<
        string | null,
        { targetName: string }
    >(
        async ({ targetName }) => {
            const globalTarget = globalThis as typeof globalThis & {
                electronAPI?: {
                    sites?: {
                        getSites?: () => Promise<Site[]>;
                    };
                };
            };

            try {
                const sites =
                    await globalTarget.electronAPI?.sites?.getSites?.();
                return (
                    sites?.find((site) => site.name === targetName)
                        ?.identifier ?? null
                );
            } catch (error) {
                console.warn(
                    "Failed to resolve site identifier after creation",
                    error
                );
                return null;
            }
        },
        { targetName: siteName }
    );

    if (siteIdentifier) {
        return {
            identifier: siteIdentifier,
            name: siteName,
        } satisfies CreatedSiteResult;
    }

    return { name: siteName } satisfies CreatedSiteResult;
}

/**
 * Soft monitor-count wait used by higher-level helpers that already perform
 * their own DOM assertions.
 *
 * @remarks
 * Unlike {@link waitForMonitorCount}, this helper never throws when the expected
 * count is not reached. It is intended for flows like {@link createSiteViaModal}
 * that also validate presence of specific sidebar entries or cards and
 * therefore treat the monitor count as a best-effort signal only.
 */
async function waitForMonitorCountSoft(
    page: Page,
    expectedCount: number,
    timeout: number = WAIT_TIMEOUTS.LONG
): Promise<boolean> {
    await waitForAppInitialization(page);

    const deadline = Date.now() + timeout;
    let lastCount: number | null = null;

    while (Date.now() < deadline) {
        const electronCount = await getElectronSiteCount(page).catch(
            () => null
        );
        if (typeof electronCount === "number") {
            lastCount = electronCount;
        } else {
            lastCount = await getMonitorCountFromDom(page).catch(() => null);
        }

        if (lastCount === expectedCount) {
            return true;
        }

        // Use a small polling interval without relying on explicit timeouts
        // that trigger Playwright lint warnings.

        await new Promise((resolve) => {
            setTimeout(resolve, 250);
        });
    }

    console.warn("Site count verification fallback engaged", {
        currentCount: lastCount,
        expectedSiteCount: expectedCount,
    });

    return false;
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
    const dialogLocator = page.getByRole("dialog");
    const dialogCount = await dialogLocator.count().catch(() => 0);
    if (dialogCount === 0) {
        return;
    }

    const modalOverlay = dialogLocator.first();
    const isModalOpen = await modalOverlay.isVisible().catch(() => false);
    if (!isModalOpen) {
        return;
    }

    if (method === "escape") {
        await page.keyboard.press("Escape");
    } else {
        const closeButton = modalOverlay.getByRole("button", {
            name: /close/i,
        });
        const hasCloseButton = await closeButton.count().catch(() => 0);
        if (hasCloseButton > 0) {
            await closeButton.first().click();
        } else {
            await page.keyboard.press("Escape");
        }
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
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Prefer specific labels. Avoid ambiguous `.or(...)` unions here: if both
    // sides match, Playwright can act on the wrong element depending on DOM
    // order.
    const siteNameInput = dialog.getByLabel(/Site Name/i);
    const siteUrlInput = dialog
        .getByLabel(/URL/i)
        .or(dialog.getByRole("textbox", { name: /url/i }));
    const monitorTypeSelect = dialog.getByLabel(/Monitor Type/i);
    const submitButton = dialog
        .getByTestId("add-site-submit")
        .or(dialog.getByRole("button", { name: /Add Site|Create|Submit/i }));

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
 * @remarks
 * Supports monitor-type switching to surface dynamic fields before populating
 * any monitor-specific inputs. Optional URL and dynamic field values are only
 * applied when provided, allowing reuse across monitor configurations that do
 * not surface those controls (for example ping or port monitors).
 *
 * @param page - The Playwright page instance.
 * @param siteData - Data to fill in the form including optional dynamic fields.
 */
export async function fillAddSiteForm(
    page: Page,
    siteData: {
        name: string;
        url?: string;
        monitorType?: string;
        dynamicFields?: readonly DynamicFieldInput[];
    }
): Promise<void> {
    const formElements = await getAddSiteFormElements(page);
    const modalForm = page
        .getByRole("dialog")
        .getByRole("form", { name: /Add Site Form/i });

    // Fill site name
    await formElements.siteNameInput.fill(siteData.name);

    // Select monitor type if provided to ensure dynamic fields render before
    // additional inputs are processed.
    if (siteData.monitorType) {
        const monitorTypeVisible =
            await formElements.monitorTypeSelect.isVisible();
        if (monitorTypeVisible) {
            await formElements.monitorTypeSelect.selectOption(
                siteData.monitorType
            );
        }
    }

    if (siteData.url) {
        const urlInputVisible = await formElements.siteUrlInput
            .isVisible()
            .catch(() => false);
        if (urlInputVisible) {
            await formElements.siteUrlInput.fill(siteData.url);
        }
    }

    for (const field of siteData.dynamicFields ?? []) {
        const fieldLocator = modalForm.getByLabel(field.label, {
            exact: false,
        });
        await fieldLocator.waitFor({
            state: "visible",
            timeout: WAIT_TIMEOUTS.MEDIUM,
        });

        if (field.inputType === "select") {
            await fieldLocator.selectOption(field.value);
        } else {
            await fieldLocator.fill(field.value);
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

    // Wait for modal to close (indicates success). If it doesn't close, the
    // submission failed and tests should fail immediately.
    await page.getByTestId("add-site-modal").waitFor({
        state: "hidden",
        timeout: WAIT_TIMEOUTS.LONG,
    });
}

/**
 * Opens the Site Details modal for a specific site card by name.
 *
 * @param page - Playwright page instance representing the renderer.
 * @param siteName - Visible site name text rendered on the dashboard.
 */
export async function openSiteDetails(
    page: Page,
    siteName: string
): Promise<void> {
    await ensureCardLayout(page);

    const siteCard = getSiteCardLocator(page, siteName);
    const cardVisible = await siteCard
        .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM })
        .catch(() => false);

    if (cardVisible) {
        try {
            await siteCard.click({ timeout: WAIT_TIMEOUTS.MEDIUM });
        } catch (error) {
            console.warn(
                "Site card interaction failed; falling back to sidebar navigation",
                error
            );
            await openSiteDetailsViaSidebar(page, siteName);
        }
    } else {
        await openSiteDetailsViaSidebar(page, siteName);
    }

    const siteDetailsModal = page.getByTestId("site-details-modal");
    await siteDetailsModal.waitFor({
        state: "visible",
        timeout: WAIT_TIMEOUTS.LONG,
    });

    await siteDetailsModal.evaluate((element) => {
        const scrollContainer = element.querySelector(
            ".site-details-modal__content-wrapper"
        );
        if (scrollContainer instanceof HTMLElement) {
            scrollContainer.scrollTo({ left: 0, top: 0 });
        }
    });

    await page
        .getByRole("dialog", { name: "Site details" })
        .getByText("Site Actions", { exact: true })
        .waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.SHORT })
        .catch(() => undefined);
}

/**
 * Waits for the monitoring status widgets inside the site details modal to
 * hydrate the latest state from the database.
 */
export async function waitForSiteMonitoringHydration(
    page: Page
): Promise<void> {
    await page.waitForFunction(
        () => {
            const modal = document.querySelector(
                '[data-testid="site-details-modal"]'
            );
            if (!(modal instanceof HTMLElement)) {
                return false;
            }

            const statusDisplay = modal.querySelector(
                '[data-testid="monitoring-status-display"]'
            );
            if (!(statusDisplay instanceof HTMLElement)) {
                return false;
            }

            const hasMonitorEntries =
                statusDisplay.querySelectorAll(
                    '[data-testid^="monitor-status-"]'
                ).length > 0;
            const activeMatch =
                statusDisplay.textContent?.match(/(\d+)\/1 active/);

            return Boolean(activeMatch) && hasMonitorEntries;
        },
        { timeout: WAIT_TIMEOUTS.LONG }
    );
}

export async function waitForDialogTeardown(
    page: Page,
    testId: string
): Promise<void> {
    await page
        .getByTestId(testId)
        .waitFor({ state: "hidden", timeout: WAIT_TIMEOUTS.MEDIUM })
        .catch(() => undefined);
    await page
        .getByRole("dialog")
        .filter({ has: page.getByTestId(testId) })
        .waitFor({ state: "detached", timeout: WAIT_TIMEOUTS.MEDIUM })
        .catch(() => undefined);
}

/**
 * Opens the settings tab within the site details modal by clicking the
 * "Settings" button and waiting for the tab content to render.
 *
 * @param siteDetailsModal - Locator scoped to the active site details modal.
 */
export async function openSiteDetailsSettingsTab(
    siteDetailsModal: Locator
): Promise<void> {
    const settingsButton = siteDetailsModal
        .getByRole("button", { name: "Settings" })
        .first();

    await settingsButton.scrollIntoViewIfNeeded();
    await expect(settingsButton).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });

    await settingsButton.click({ timeout: WAIT_TIMEOUTS.LONG });

    await expect(siteDetailsModal.getByTestId("settings-tab")).toBeVisible({
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });
}

/**
 * Opens the site details modal via the sidebar navigation entry.
 *
 * @param page - The Playwright page instance representing the renderer.
 * @param siteName - Human-readable site name used within navigation.
 */
async function openSiteDetailsViaSidebar(
    page: Page,
    siteName: string
): Promise<void> {
    const navigationEntry = page
        .getByRole("navigation", { name: "Monitored sites" })
        .getByRole("button", {
            name: new RegExp(`^${escapeForRegex(siteName)}`),
        })
        .first();

    const expandSidebarButton = page
        .getByRole("button", { name: "Expand sidebar" })
        .first();

    const sidebarCollapsed = await expandSidebarButton
        .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
        .catch(() => false);

    if (sidebarCollapsed) {
        await expandSidebarButton.evaluate((node) => {
            (node as HTMLButtonElement).click();
        });
    }

    await navigationEntry.waitFor({
        state: "visible",
        timeout: WAIT_TIMEOUTS.LONG,
    });
    await navigationEntry.evaluate((node) => {
        (node as HTMLButtonElement).click();
    });
}

/**
 * Ensures the site details header is in the requested collapsed or expanded
 * state.
 *
 * @param siteDetailsModal - Locator scoped to the active site details modal.
 * @param desiredState - Target header state.
 */
export async function ensureSiteDetailsHeaderState(
    siteDetailsModal: Locator,
    desiredState: "collapsed" | "expanded"
): Promise<void> {
    const header = siteDetailsModal.getByTestId("site-details-header");
    await header.waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.MEDIUM });

    const expectedCollapsedValue =
        desiredState === "collapsed" ? "true" : "false";
    const currentValue = await header
        .getAttribute("data-collapsed")
        .catch(() => null);

    if (currentValue === expectedCollapsedValue) {
        return;
    }

    const toggleButtonName =
        desiredState === "collapsed" ? "Collapse header" : "Expand header";

    const refreshedValue = await header
        .getAttribute("data-collapsed")
        .catch(() => null);
    if (refreshedValue === expectedCollapsedValue) {
        return;
    }

    await expect(async () => {
        const toggleButton = siteDetailsModal
            .getByRole("button", { name: toggleButtonName })
            .first();
        await toggleButton.waitFor({
            state: "attached",
            timeout: WAIT_TIMEOUTS.MEDIUM,
        });
        const didClick = await toggleButton
            .evaluate((node) => {
                (node as HTMLButtonElement).click();
                return true as const;
            })
            .catch(() => false);
        if (!didClick) {
            throw new Error(
                `Site details header toggle '${toggleButtonName}' could not be activated via DOM click.`
            );
        }
    }).toPass({ timeout: WAIT_TIMEOUTS.LONG });

    await expect
        .poll(
            async () =>
                (await header
                    .getAttribute("data-collapsed")
                    .catch(() => null)) ?? "",
            {
                timeout: WAIT_TIMEOUTS.LONG,
                intervals: [200],
                message: `Waiting for site details header to reach '${expectedCollapsedValue}' state`,
            }
        )
        .toBe(expectedCollapsedValue);
}

/**
 * Expands the site details header when it is collapsed.
 */
export async function ensureSiteDetailsHeaderExpanded(
    siteDetailsModal: Locator
): Promise<void> {
    await ensureSiteDetailsHeaderState(siteDetailsModal, "expanded");
}

/**
 * Collapses the site details header when it is expanded.
 */
export async function ensureSiteDetailsHeaderCollapsed(
    siteDetailsModal: Locator
): Promise<void> {
    await ensureSiteDetailsHeaderState(siteDetailsModal, "collapsed");
}

/**
 * Opens the settings modal by clicking the settings button.
 *
 * @param page - The Playwright page instance
 */
export async function openSettingsModal(page: Page): Promise<void> {
    await waitForAppInitialization(page);

    const settingsButton = page
        .getByRole("banner")
        .getByRole("button", { name: "Open settings" })
        .first();

    await settingsButton.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.evaluate(() => window.scrollTo({ left: 0, top: 0 }));
    await expect(settingsButton).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

    try {
        await settingsButton.click({ timeout: WAIT_TIMEOUTS.MEDIUM });
    } catch (error) {
        const box = await settingsButton.boundingBox();
        if (!box) {
            throw error;
        }

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.up();
    }

    // Wait for settings modal to appear
    const settingsModal = page.getByTestId("settings-modal");
    await settingsModal.waitFor({
        state: "visible",
        timeout: WAIT_TIMEOUTS.MEDIUM,
    });

    await page.waitForFunction(
        () => {
            const settingsRoot = document.querySelector(
                '[data-testid="settings-modal"]'
            );
            if (!settingsRoot) {
                return false;
            }
            const modal = settingsRoot.closest("dialog") ?? settingsRoot;
            if (!modal) {
                return false;
            }
            const opacityValue = Number.parseFloat(
                getComputedStyle(modal).opacity ?? "0"
            );
            return Number.isFinite(opacityValue) && opacityValue >= 0.99;
        },
        { timeout: WAIT_TIMEOUTS.MEDIUM }
    );
}

/**
 * Toggles the theme using the theme toggle button.
 *
 * @param page - The Playwright page instance
 */
export async function toggleTheme(page: Page): Promise<void> {
    await waitForAppInitialization(page);

    const themeToggle = page.getByRole("button", {
        name: /Switch to (light|dark) theme/i,
    });
    await themeToggle.click();

    // Wait for theme change to apply
    await page.waitForFunction(
        () => {
            const body = document.body;
            return (
                body.classList.contains("dark") ||
                body.classList.contains("light")
            );
        },
        { timeout: WAIT_TIMEOUTS.SHORT }
    );
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
    await page.waitForFunction(() => document.readyState === "complete", {
        timeout: WAIT_TIMEOUTS.SHORT,
    });
}

/**
 * Waits for a confirmation dialog request to be registered in automation mode.
 */
export async function waitForConfirmDialogRequest(
    page: Page,
    timeout: number = WAIT_TIMEOUTS.MEDIUM
): Promise<ConfirmDialogRequest | null> {
    await page.waitForFunction(
        () => {
            const automationTarget = globalThis as typeof globalThis & {
                playwrightConfirmDialog?: {
                    getState: () => {
                        request: ConfirmDialogRequest | null;
                    };
                };
            };
            if (automationTarget.playwrightConfirmDialog?.getState().request) {
                return true;
            }

            const dialogElement = document.querySelector(
                '[data-testid="confirm-dialog"]'
            );

            return Boolean(dialogElement);
        },
        { timeout }
    );

    return page.evaluate(() => {
        const automationTarget = globalThis as typeof globalThis & {
            playwrightConfirmDialog?: {
                getState: () => {
                    request: ConfirmDialogRequest | null;
                };
            };
        };

        const bridgedRequest =
            automationTarget.playwrightConfirmDialog?.getState().request ??
            null;

        if (bridgedRequest) {
            return bridgedRequest;
        }

        const dialogElement = document.querySelector(
            '[data-testid="confirm-dialog"]'
        );
        if (!dialogElement) {
            return null;
        }

        const getText = (selector: string): string | undefined => {
            const element = dialogElement.querySelector(selector);
            const textContent = element?.textContent?.trim();
            return textContent && textContent.length > 0
                ? textContent
                : undefined;
        };

        const cancelLabel =
            getText('[data-testid="confirm-dialog-cancel"]') ?? "Cancel";
        const confirmElement = dialogElement.querySelector(
            '[data-testid="confirm-dialog-confirm"]'
        ) as HTMLElement | null;
        const confirmLabel = confirmElement?.textContent?.trim() ?? "Confirm";
        const confirmClassName = confirmElement?.className ?? "";
        const tone: "default" | "danger" = /themed-button--error/.test(
            confirmClassName
        )
            ? "danger"
            : "default";

        const message =
            getText(".confirm-dialog__body") ??
            getText("[data-testid='confirm-dialog-message']") ??
            "";
        const title =
            getText(".confirm-dialog__title") ??
            getText("[data-testid='confirm-dialog-title']") ??
            "";
        const details = getText(".confirm-dialog__details");

        return {
            cancelLabel,
            confirmLabel,
            message,
            title,
            tone,
            ...(typeof details === "string" && details.length > 0
                ? { details }
                : {}),
        } as ConfirmDialogRequest;
    });
}

/**
 * Resolves the active confirmation dialog using automation helpers when running
 * in Playwright.
 */
export async function resolveConfirmDialog(
    page: Page,
    action: "confirm" | "cancel"
): Promise<void> {
    await page.evaluate((desiredAction) => {
        const automationTarget = globalThis as typeof globalThis & {
            playwrightConfirmDialog?: {
                cancel: () => void;
                confirm: () => void;
            };
        };

        const bridge = automationTarget.playwrightConfirmDialog;
        if (!bridge) {
            const dialogElement = document.querySelector(
                '[data-testid="confirm-dialog"]'
            );
            if (!dialogElement) {
                return;
            }

            const selector =
                desiredAction === "confirm"
                    ? '[data-testid="confirm-dialog-confirm"]'
                    : '[data-testid="confirm-dialog-cancel"]';
            const fallbackButton =
                dialogElement.querySelector<HTMLButtonElement>(selector);
            fallbackButton?.click();
            return;
        }

        if (desiredAction === "confirm") {
            bridge.confirm();
        } else {
            bridge.cancel();
        }
    }, action);

    await page.waitForFunction(() => {
        const automationTarget = globalThis as typeof globalThis & {
            playwrightConfirmDialog?: {
                getState: () => {
                    request: ConfirmDialogRequest | null;
                };
            };
        };

        if (
            automationTarget.playwrightConfirmDialog?.getState().request ===
            null
        ) {
            return true;
        }

        return !document.querySelector('[data-testid="confirm-dialog"]');
    });
}

/**
 * Closes the Site Details modal if it is currently open.
 *
 * @param page - Playwright page instance representing the renderer.
 */
export async function closeSiteDetails(page: Page): Promise<void> {
    const dialog = page.getByTestId("site-details-modal");
    const isVisible = await dialog.isVisible().catch(() => false);

    if (!isVisible) {
        return;
    }

    const closeButton = dialog.getByRole("button", {
        name: "Close site details",
    });
    if (await closeButton.isVisible().catch(() => false)) {
        try {
            // eslint-disable-next-line playwright/no-force-option -- Close button keeps animating due to modal transitions; forcing the click avoids perpetual stability failures.
            await closeButton.click({ force: true });
        } catch (error) {
            console.warn(
                "Site details close button click failed; falling back to Escape key",
                error
            );
            await page.keyboard.press("Escape").catch(() => undefined);
        }
    } else {
        await page.getByLabel("Close site details").click();
    }

    await dialog.waitFor({ state: "hidden", timeout: WAIT_TIMEOUTS.MEDIUM });
}

/**
 * Resolves the number of monitors by consulting the Electron preload bridge.
 *
 * @param page - The Playwright page instance associated with the renderer.
 *
 * @returns Site count when available from the preload bridge, otherwise null.
 */
async function getElectronSiteCount(page: Page): Promise<number | null> {
    const result = await page
        .evaluate(async () => {
            const globalTarget = globalThis as typeof globalThis & {
                electronAPI?: {
                    sites?: {
                        getSites?: () => Promise<Site[] | undefined>;
                    };
                };
            };

            try {
                const sites =
                    await globalTarget.electronAPI?.sites?.getSites?.();
                if (Array.isArray(sites)) {
                    return sites.length;
                }
            } catch (error) {
                console.warn(
                    "[playwright:getElectronSiteCount] Failed to query site list",
                    error
                );
            }

            return null;
        })
        .catch(() => null);

    return typeof result === "number" ? result : null;
}

/**
 * Reads the dashboard monitor count from the rendered UI when available.
 *
 * @param page - The Playwright page instance associated with the renderer.
 *
 * @returns Parsed monitor count from the DOM or null when inaccessible.
 */
async function getMonitorCountFromDom(page: Page): Promise<number | null> {
    const emptyStateVisible = await page
        .getByTestId("empty-state")
        .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
        .catch(() => false);

    if (emptyStateVisible) {
        return 0;
    }

    const labelText = await page
        .getByTestId("site-count-label")
        .textContent()
        .catch(() => null);

    if (!labelText) {
        return null;
    }

    const match = labelText.match(/Tracking\s+(\d+)/iu);
    return match?.[1] ? Number.parseInt(match[1], 10) : null;
}

/**
 * Determines the current monitor count using the Electron bridge as the
 * authoritative source with graceful fallback to DOM parsing.
 *
 * @param page - The Playwright page instance whose renderer exposes the UI.
 *
 * @returns Promise resolving to the best-known monitor count.
 */
export async function getMonitorCount(page: Page): Promise<number> {
    await waitForAppInitialization(page);

    const electronCount = await getElectronSiteCount(page);
    if (typeof electronCount === "number") {
        return electronCount;
    }

    const domCount = await getMonitorCountFromDom(page);
    return typeof domCount === "number" ? domCount : 0;
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
    await waitForAppInitialization(page);

    await expect
        .poll(
            async () => {
                const electronCount = await getElectronSiteCount(page);
                if (typeof electronCount === "number") {
                    return electronCount;
                }

                const domCount = await getMonitorCountFromDom(page);
                return domCount ?? -1;
            },
            {
                message: `Waiting for monitor count to equal ${expectedCount}`,
                timeout,
                intervals: [250],
            }
        )
        .toBe(expectedCount);
}

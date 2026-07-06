/**
 * Tracks the temporary Electron userData directories allocated per Playwright
 * page/Electron app during UI tests.
 */

import type { Page } from "@playwright/test";

const pageToUserDataDirectory = new WeakMap<Page, string>();

/**
 * Associates a Playwright {@link Page} with the Electron userData directory it
 * belongs to. Called whenever a new renderer window is observed.
 */
export function registerPageUserDataDirectory(
    page: Page,
    directory: string
): void {
    pageToUserDataDirectory.set(page, directory);
}

/**
 * Determines whether the provided page is backed by an isolated userData
 * directory.
 */
export function isIsolatedUserDataPage(page: Page): boolean {
    return pageToUserDataDirectory.has(page);
}

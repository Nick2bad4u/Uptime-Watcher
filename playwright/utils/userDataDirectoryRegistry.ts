/**
 * Tracks the temporary Electron userData directories allocated per Playwright
 * page/Electron application during UI tests.
 */

import type { ElectronApplication, Page } from "@playwright/test";

const pageToUserDataDirectory = new WeakMap<Page, string>();
const appToUserDataDirectory = new WeakMap<ElectronApplication, string>();

/**
 * Associates an {@link ElectronApplication} instance with the userData directory
 * that was provisioned for it.
 */
export function registerApplicationUserDataDirectory(
    application: ElectronApplication,
    directory: string
): void {
    appToUserDataDirectory.set(application, directory);
}

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
 * Retrieves the registered userData directory for the provided page if one was
 * tracked.
 */
export function getUserDataDirectoryForPage(page: Page): string | undefined {
    return pageToUserDataDirectory.get(page);
}

/**
 * Determines whether the provided page is backed by an isolated userData
 * directory.
 */
export function isIsolatedUserDataPage(page: Page): boolean {
    return pageToUserDataDirectory.has(page);
}

export function getUserDataDirectoryForApplication(
    application: ElectronApplication
): string | undefined {
    return appToUserDataDirectory.get(application);
}

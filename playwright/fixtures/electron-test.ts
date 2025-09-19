import { test as base } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";

import { launchElectronApp } from "./electron-helpers";
import { ensureCleanUIState, waitForAppInitialization } from "../utils/ui-helpers";

export type ElectronTestFixtures = {
    electronApp: ElectronApplication;
    window: Page;
};

/**
 * Shared Playwright test fixture that ensures every test receives a fresh
 * Electron application window that has fully finished bootstrapping.
 */
export const electronTest = base.extend<ElectronTestFixtures>({
    electronApp: async ({}, use) => {
        const app = await launchElectronApp();

        try {
            await use(app);
        } finally {
            await app.close();
        }
    },
    window: async ({ electronApp }, use) => {
        const window = await electronApp.firstWindow();

        await waitForAppInitialization(window);
        await ensureCleanUIState(window);

        await use(window);
    },
});

export const test = electronTest;
export const expect = electronTest.expect;

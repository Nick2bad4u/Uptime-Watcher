/**
 * Settings data maintenance flows validating export, sync, and reset controls
 * using shared helpers and lightweight bridge stubs.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { tagElectronAppCoverage } from "../utils/coverage";
import {
    ensureCleanUIState,
    openSettingsModal,
    removeAllSites,
    waitForAppInitialization,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

test.describe(
    "settings data maintenance",
    {
        tag: [
            "@ui",
            "@settings",
            "@data",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-data-maintenance");
            page = await electronApp.firstWindow();

            await waitForAppInitialization(page);
            await removeAllSites(page);
            await openSettingsModal(page);
        });

        test.afterEach(async () => {
            if (page) {
                await ensureCleanUIState(page).catch(() => undefined);
                await removeAllSites(page).catch(() => undefined);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should trigger SQLite backup export",
            {
                tag: ["@export", "@backup"],
            },
            async () => {
                await page.evaluate(() => {
                    const api = (
                        window as unknown as {
                            electronAPI?: {
                                data?: {
                                    downloadSqliteBackup?: () => Promise<unknown>;
                                };
                            };
                        }
                    ).electronAPI;
                    if (!api?.data?.downloadSqliteBackup) {
                        throw new Error("downloadSqliteBackup bridge missing");
                    }

                    const global = window as unknown as {
                        __downloadCallCount__?: number;
                    };
                    global.__downloadCallCount__ = 0;

                    api.data.downloadSqliteBackup = async () => {
                        global.__downloadCallCount__ =
                            (global.__downloadCallCount__ ?? 0) + 1;
                        return {
                            buffer: new ArrayBuffer(16),
                            fileName: "playwright-backup.sqlite",
                            metadata: {
                                createdAt: Date.now(),
                                originalPath: "playwright-backup.sqlite",
                                sizeBytes: 16,
                            },
                        } as const;
                    };
                });

                await page
                    .getByRole("button", { name: "Export monitoring data" })
                    .click();

                await page.waitForFunction(() => {
                    const global = window as unknown as {
                        __downloadCallCount__?: number;
                    };
                    return (global.__downloadCallCount__ ?? 0) > 0;
                });

                await expect(
                    page.getByText(
                        "Manage data exports and advanced utilities."
                    )
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            }
        );

        test(
            "should require confirmation before resetting settings",
            {
                tag: ["@reset", "@confirmation"],
            },
            async () => {
                await page.evaluate(() => {
                    const api = (
                        window as unknown as {
                            electronAPI?: {
                                data?: {
                                    resetSettings?: () => Promise<void>;
                                };
                            };
                        }
                    ).electronAPI;
                    if (!api?.data?.resetSettings) {
                        throw new Error("resetSettings bridge missing");
                    }

                    const global = window as unknown as {
                        __resetCallCount__?: number;
                    };
                    global.__resetCallCount__ = 0;

                    api.data.resetSettings = async () => {
                        global.__resetCallCount__ =
                            (global.__resetCallCount__ ?? 0) + 1;
                    };
                });

                await page
                    .getByRole("button", { name: "Reset everything" })
                    .click();

                const dialog = page.getByRole("alertdialog", {
                    name: "Reset Settings",
                });
                await expect(dialog).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await dialog.getByRole("button", { name: "Reset" }).click();

                await page.waitForFunction(() => {
                    const global = window as unknown as {
                        __resetCallCount__?: number;
                    };
                    return (global.__resetCallCount__ ?? 0) > 0;
                });

                await expect(dialog).not.toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );

        test(
            "should surface sync success after refresh history",
            {
                tag: ["@sync", "@refresh"],
            },
            async () => {
                await page.evaluate(() => {
                    const api = (
                        window as unknown as {
                            electronAPI?: {
                                sites?: {
                                    getSites?: () => Promise<unknown>;
                                };
                            };
                        }
                    ).electronAPI;
                    if (!api?.sites?.getSites) {
                        throw new Error("getSites bridge missing");
                    }

                    const global = window as unknown as {
                        __getSitesCallCount__?: number;
                    };
                    global.__getSitesCallCount__ = 0;

                    api.sites.getSites = async () => {
                        global.__getSitesCallCount__ =
                            (global.__getSitesCallCount__ ?? 0) + 1;
                        return [];
                    };
                });

                await page
                    .getByRole("button", { name: "Refresh history" })
                    .click();

                await page.waitForFunction(() => {
                    const global = window as unknown as {
                        __getSitesCallCount__?: number;
                    };
                    return (global.__getSitesCallCount__ ?? 0) > 0;
                });

                await expect(page.getByText("Sync complete")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
            }
        );
    }
);

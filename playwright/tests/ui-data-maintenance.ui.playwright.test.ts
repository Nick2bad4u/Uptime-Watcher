/**
 * Settings data maintenance flows validating export, sync, and reset controls
 * using shared helpers in a fully integrated renderer environment.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { tagElectronAppCoverage } from "../utils/coverage";
import {
    ensureCleanUIState,
    openSettingsModal,
    removeAllSites,
    resetApplicationState,
    resolveConfirmDialog,
    WAIT_TIMEOUTS,
    waitForConfirmDialogRequest,
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
        test.describe.configure({ timeout: 90_000 });
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-data-maintenance");
            page = await electronApp.firstWindow();

            page.on("console", (message) => {
                console.log(`[renderer:${message.type()}] ${message.text()}`);
            });
            page.on("pageerror", (error) => {
                console.error("[renderer:pageerror]", error);
            });

            await resetApplicationState(page);
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
                const exportButton = page.getByRole("button", {
                    name: "Export monitoring data",
                });

                await exportButton.click();

                await expect.soft(exportButton).not.toHaveClass(
                    /themed-button--loading/v,
                    { timeout: WAIT_TIMEOUTS.LONG }
                );

                await expect.soft(
                    page.getByText("Failed to download SQLite backup")
                ).toHaveCount(0);

                await expect.soft(
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
                test.setTimeout(60_000);
                const resetButton = page.getByRole("button", {
                    name: "Reset everything",
                });
                await resetButton.click();

                const confirmRequest = await waitForConfirmDialogRequest(page);
                expect.soft(confirmRequest).not.toBeNull();
                expect.soft(confirmRequest?.title).toBe("Reset Settings");

                const dialog = page.getByRole("alertdialog", {
                    name: "Reset Settings",
                });

                try {
                    await expect.soft(dialog).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                    await dialog.getByRole("button", { name: "Reset" }).click();
                } catch {
                    await resolveConfirmDialog(page, "confirm");
                }

                await expect.soft(dialog).not.toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await expect.soft(
                    page.getByText("Failed to download SQLite backup")
                ).toHaveCount(0);
            }
        );

        test(
            "should surface sync success after refresh history",
            {
                tag: ["@sync", "@refresh"],
            },
            async () => {
                const refreshButton = page.getByRole("button", {
                    name: "Refresh history",
                });

                await refreshButton.click();

                await expect.soft(refreshButton).not.toHaveClass(
                    /themed-button--loading/v,
                    { timeout: WAIT_TIMEOUTS.LONG }
                );

                await expect.soft(page.getByText("Sync complete")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
            }
        );
    }
);

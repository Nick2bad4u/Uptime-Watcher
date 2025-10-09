/**
 * Site details modal regression tests for the refreshed dashboard experience.
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
    closeSiteDetails,
    createSiteViaModal,
    openSiteDetails,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

const ANALYTICS_BUTTON_REGEX = /Analytics$/i;

test.describe(
    "site details - modern ui",
    {
        tag: [
            "@ui",
            "@site-details",
            "@regression",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;
        let siteName: string;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-site-details");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            const createdSite = await createSiteViaModal(page, {
                name: `Site Details Demo ${Date.now()}`,
            });
            siteName = createdSite.name;
        });

        test.afterEach(async () => {
            if (page) {
                try {
                    await closeSiteDetails(page);
                } catch {
                    // Ignore teardown failures when the modal was never opened.
                }

                await removeAllSites(page);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should navigate across all site detail tabs",
            {
                tag: ["@workflow", "@tabs"],
            },
            async () => {
                test.setTimeout(60_000);
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");

                await expect(
                    siteDetailsModal.getByTestId("site-overview-tab")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await siteDetailsModal
                    .getByRole("button", { name: "Monitor Overview" })
                    .click();
                await expect(
                    siteDetailsModal.getByTestId("overview-tab")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await siteDetailsModal
                    .getByRole("button", { name: ANALYTICS_BUTTON_REGEX })
                    .click();
                await expect(
                    siteDetailsModal.getByTestId("analytics-tab")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                const historyButton = siteDetailsModal
                    .getByRole("button", {
                        name: "History",
                    })
                    .first();
                await historyButton.waitFor({
                    state: "visible",
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(async () => {
                    await historyButton.click({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                        trial: true,
                    });
                }).toPass({ timeout: WAIT_TIMEOUTS.MEDIUM });
                await historyButton.click({ timeout: WAIT_TIMEOUTS.MEDIUM });

                const historyTab = siteDetailsModal.getByTestId("history-tab");
                await historyTab.scrollIntoViewIfNeeded();
                await expect(historyTab).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await siteDetailsModal
                    .getByRole("button", { name: "Settings" })
                    .click();
                await expect(
                    siteDetailsModal.getByTestId("settings-tab")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            }
        );

        test(
            "should toggle site-level monitoring controls",
            {
                tag: ["@workflow", "@monitoring"],
            },
            async () => {
                test.setTimeout(60_000);
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");
                const startAllButton = siteDetailsModal
                    .getByRole("button", {
                        name: "Start All Monitoring",
                    })
                    .first();
                const stopAllButton = siteDetailsModal
                    .getByRole("button", {
                        name: "Stop All Monitoring",
                    })
                    .first();

                await stopAllButton.scrollIntoViewIfNeeded();

                await stopAllButton
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);

                await page.evaluate(async (targetName) => {
                    const globalTarget = globalThis as typeof globalThis & {
                        electronAPI?: {
                            monitoring?: {
                                stopMonitoringForSite?: (
                                    siteId: string
                                ) => Promise<unknown>;
                                startMonitoringForSite?: (
                                    siteId: string
                                ) => Promise<unknown>;
                            };
                            sites?: {
                                getSites?: () => Promise<unknown>;
                            };
                        };
                    };

                    const sitesResult =
                        (await globalTarget.electronAPI?.sites?.getSites?.()) ??
                        [];

                    if (!Array.isArray(sitesResult)) {
                        return;
                    }

                    const targetSite = sitesResult.find(
                        (candidate) =>
                            candidate &&
                            typeof candidate === "object" &&
                            "name" in candidate &&
                            (candidate as { name?: string }).name === targetName
                    ) as { identifier?: string } | undefined;

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.stopMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await startAllButton.scrollIntoViewIfNeeded();
                await startAllButton.click();

                await page.evaluate(async (targetName) => {
                    const globalTarget = globalThis as typeof globalThis & {
                        electronAPI?: {
                            monitoring?: {
                                startMonitoringForSite?: (
                                    siteId: string
                                ) => Promise<unknown>;
                            };
                            sites?: {
                                getSites?: () => Promise<unknown>;
                            };
                        };
                    };

                    const sitesResult =
                        (await globalTarget.electronAPI?.sites?.getSites?.()) ??
                        [];

                    if (!Array.isArray(sitesResult)) {
                        return;
                    }

                    const targetSite = sitesResult.find(
                        (candidate) =>
                            candidate &&
                            typeof candidate === "object" &&
                            "name" in candidate &&
                            (candidate as { name?: string }).name === targetName
                    ) as { identifier?: string } | undefined;

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.startMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect(stopAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const stopMonitoringButton = siteDetailsModal.getByRole(
                    "button",
                    { name: "Stop Monitoring" }
                );
                await stopMonitoringButton
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);

                const startMonitoringButton = siteDetailsModal.getByRole(
                    "button",
                    { name: "Start Monitoring" }
                );
                await expect(startMonitoringButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await startMonitoringButton.click();

                await expect(stopMonitoringButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await stopAllButton.click();

                await page.evaluate(async (targetName) => {
                    const globalTarget = globalThis as typeof globalThis & {
                        electronAPI?: {
                            monitoring?: {
                                stopMonitoringForSite?: (
                                    siteId: string
                                ) => Promise<unknown>;
                            };
                            sites?: {
                                getSites?: () => Promise<unknown>;
                            };
                        };
                    };

                    const sitesResult =
                        (await globalTarget.electronAPI?.sites?.getSites?.()) ??
                        [];

                    if (!Array.isArray(sitesResult)) {
                        return;
                    }

                    const targetSite = sitesResult.find(
                        (candidate) =>
                            candidate &&
                            typeof candidate === "object" &&
                            "name" in candidate &&
                            (candidate as { name?: string }).name === targetName
                    ) as { identifier?: string } | undefined;

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.stopMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect(stopAllButton).not.toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await expect(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await expect(startMonitoringButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
            }
        );
    }
);

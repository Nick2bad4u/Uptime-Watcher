/**
 * Site details modal regression tests for the refreshed dashboard experience.
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
    closeSiteDetails,
    createSiteViaModal,
    ensureSiteDetailsHeaderCollapsed,
    ensureSiteDetailsHeaderExpanded,
    openSiteDetails,
    openSiteDetailsSettingsTab,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
    waitForAppInitialization,
} from "../utils/ui-helpers";

const ANALYTICS_BUTTON_REGEX = /analytics$/i;

async function runFirstMonitorAction(
    page: Page,
    targetName: string,
    action: "start" | "stop"
): Promise<void> {
    await page.evaluate(async ({ action: requestedAction, targetName }) => {
        const globalTarget = globalThis as typeof globalThis & {
            electronAPI?: {
                monitoring?: {
                    startMonitoringForMonitor?: (
                        siteIdentifier: string,
                        monitorId: string
                    ) => Promise<unknown>;
                    stopMonitoringForMonitor?: (
                        siteIdentifier: string,
                        monitorId: string
                    ) => Promise<unknown>;
                };
                sites?: {
                    getSites?: () => Promise<unknown>;
                };
            };
        };

        const sitesResult =
            (await globalTarget.electronAPI?.sites?.getSites?.()) ?? [];

        if (!Array.isArray(sitesResult)) {
            return;
        }

        const targetSite = sitesResult.find(
            (candidate) =>
                candidate &&
                typeof candidate === "object" &&
                "name" in candidate &&
                (candidate as { name?: string }).name === targetName
        ) as
            | undefined
            | {
                  identifier?: string;
                  monitors?: { id?: string }[];
              };

        const monitorId = targetSite?.monitors?.[0]?.id;
        if (!targetSite?.identifier || !monitorId) {
            return;
        }

        const monitorAction =
            requestedAction === "start"
                ? globalTarget.electronAPI?.monitoring?.startMonitoringForMonitor
                : globalTarget.electronAPI?.monitoring?.stopMonitoringForMonitor;

        await monitorAction?.(targetSite.identifier, monitorId);
    }, { action, targetName });
}

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
        test.setTimeout(90_000);

        let electronApp: ElectronApplication;
        let page: Page;
        let siteName: string;
        let siteIdentifier: string | undefined;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-site-details");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            const createdSite = await createSiteViaModal(page, {
                name: `Site Details Demo ${Date.now()}`,
            });
            siteName = createdSite.name;
            if (!createdSite.identifier) {
                throw new Error(
                    "Expected createSiteViaModal to return a site identifier for persistence assertions"
                );
            }
            siteIdentifier = createdSite.identifier;
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
                test.setTimeout(90_000);
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");

                await expect
                    .soft(siteDetailsModal.getByTestId("site-overview-tab"))
                    .toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await siteDetailsModal
                    .getByRole("tab", { name: "Monitor Overview" })
                    .click();
                await expect
                    .soft(siteDetailsModal.getByTestId("overview-tab"))
                    .toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await siteDetailsModal
                    .getByRole("tab", { name: ANALYTICS_BUTTON_REGEX })
                    .click();
                await expect
                    .soft(siteDetailsModal.getByTestId("analytics-tab"))
                    .toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                const historyButton = siteDetailsModal
                    .getByRole("tab", {
                        name: "History",
                    })
                    .first();
                await historyButton.waitFor({
                    state: "visible",
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect
                    .soft(async () => {
                        await historyButton.click({
                            timeout: WAIT_TIMEOUTS.MEDIUM,
                            trial: true,
                        });
                    })
                    .toPass({ timeout: WAIT_TIMEOUTS.MEDIUM });
                await historyButton.click({ timeout: WAIT_TIMEOUTS.MEDIUM });

                const historyTab = siteDetailsModal.getByTestId("history-tab");
                await historyTab.scrollIntoViewIfNeeded();
                await expect.soft(historyTab).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await openSiteDetailsSettingsTab(siteDetailsModal);
            }
        );

        test(
            "should toggle site-level monitoring controls",
            {
                tag: ["@workflow", "@monitoring"],
            },
            async () => {
                test.setTimeout(90_000);
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");
                const ensureSiteDetailsModalOpen = async (): Promise<void> => {
                    const isModalVisible = await siteDetailsModal
                        .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
                        .catch(() => false);

                    if (!isModalVisible) {
                        await openSiteDetails(page, siteName);
                    }
                };
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
                                startMonitoringForSite?: (
                                    siteIdentifier: string
                                ) => Promise<unknown>;
                                stopMonitoringForSite?: (
                                    siteIdentifier: string
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
                    ) as undefined | { identifier?: string };

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.stopMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect.soft(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await startAllButton.scrollIntoViewIfNeeded();
                await startAllButton.click();

                await page.evaluate(async (targetName) => {
                    const globalTarget = globalThis as typeof globalThis & {
                        electronAPI?: {
                            monitoring?: {
                                startMonitoringForSite?: (
                                    siteIdentifier: string
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
                    ) as undefined | { identifier?: string };

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.startMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect.soft(stopAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const stopMonitoringButton = siteDetailsModal.getByRole(
                    "button",
                    { name: "Stop Monitoring" }
                );
                await stopMonitoringButton
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);
                await runFirstMonitorAction(page, siteName, "stop");
                await ensureSiteDetailsModalOpen();

                const startMonitoringButton = siteDetailsModal.getByRole(
                    "button",
                    { name: "Start Monitoring" }
                );

                await expect.soft(startMonitoringButton).toBeVisible({
                    // Stop monitoring triggers backend work + renderer store updates.
                    // On slower CI / cold caches this can exceed the default 5s.
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await startMonitoringButton.click();
                await runFirstMonitorAction(page, siteName, "start");

                await expect.soft(stopMonitoringButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await stopAllButton.click();

                await page.evaluate(async (targetName) => {
                    const globalTarget = globalThis as typeof globalThis & {
                        electronAPI?: {
                            monitoring?: {
                                stopMonitoringForSite?: (
                                    siteIdentifier: string
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
                    ) as undefined | { identifier?: string };

                    if (!targetSite?.identifier) {
                        return;
                    }

                    await globalTarget.electronAPI?.monitoring?.stopMonitoringForSite?.(
                        targetSite.identifier
                    );
                }, siteName);

                await expect.soft(stopAllButton).not.toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await expect.soft(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await expect.soft(startMonitoringButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
            }
        );

        test(
            "should persist collapsed header state between sessions",
            {
                tag: ["@workflow", "@header"],
            },
            async () => {
                test.setTimeout(60_000);
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");
                const header = siteDetailsModal.getByTestId(
                    "site-details-header"
                );

                await ensureSiteDetailsHeaderExpanded(siteDetailsModal);

                await ensureSiteDetailsHeaderCollapsed(siteDetailsModal);

                await expect
                    .soft(header)
                    .toHaveAttribute("data-collapsed", "true");
                await expect
                    .soft(
                        siteDetailsModal.getByTestId(
                            "site-details-header-thumbnail"
                        )
                    )
                    .toHaveCount(0);

                await closeSiteDetails(page);

                const persistedState = await page.evaluate(() => {
                    try {
                        const raw = localStorage.getItem("uptime-watcher-ui");
                        return raw ? JSON.parse(raw) : null;
                    } catch {
                        return null;
                    }
                });

                const requiredSiteIdentifier = siteIdentifier!;
                const collapsedPersisted =
                    persistedState?.state?.siteDetailsHeaderCollapsedState?.[
                        requiredSiteIdentifier
                    ];
                expect.soft(collapsedPersisted).toBe(true);

                await page.reload({ waitUntil: "domcontentloaded" });
                await waitForAppInitialization(page);

                const persistedAfterReload = await page.evaluate(() => {
                    try {
                        const raw = localStorage.getItem("uptime-watcher-ui");
                        return raw ? JSON.parse(raw) : null;
                    } catch {
                        return null;
                    }
                });

                const collapsedAfterReload =
                    persistedAfterReload?.state
                        ?.siteDetailsHeaderCollapsedState?.[
                        requiredSiteIdentifier
                    ];
                expect.soft(collapsedAfterReload).toBe(true);
            }
        );
    }
);

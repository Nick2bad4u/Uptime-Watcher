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
    waitForAppInitialization,
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
            await waitForAppInitialization(page);
            await removeAllSites(page);

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
                await openSiteDetails(page, siteName);

                await expect(page.getByTestId("site-overview-tab")).toBeVisible(
                    { timeout: WAIT_TIMEOUTS.MEDIUM }
                );

                await page
                    .getByRole("button", { name: "Monitor Overview" })
                    .click();
                await expect(page.getByTestId("overview-tab")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await page
                    .getByRole("button", { name: ANALYTICS_BUTTON_REGEX })
                    .click();
                await expect(page.getByTestId("analytics-tab")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await page.getByRole("button", { name: "History" }).click();
                await expect(page.getByTestId("history-tab")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await page.getByRole("button", { name: "Settings" }).click();
                await expect(page.getByTestId("settings-tab")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );

        test(
            "should toggle site-level monitoring controls",
            {
                tag: ["@workflow", "@monitoring"],
            },
            async () => {
                await openSiteDetails(page, siteName);

                const startAllButton = page.getByRole("button", {
                    name: "Start All Monitoring",
                });
                await expect(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await startAllButton.click();

                const stopAllButton = page.getByRole("button", {
                    name: "Stop All Monitoring",
                });
                await expect(stopAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await expect(
                    page.getByRole("button", { name: "Stop Monitoring" })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });

                await stopAllButton.click();

                await expect(
                    page.getByRole("button", { name: "Start All Monitoring" })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
                await expect(
                    page.getByRole("button", { name: "Start Monitoring" })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
            }
        );
    }
);

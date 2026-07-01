/**
 * Monitoring status display regression scenarios within the site details modal.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { tagElectronAppCoverage } from "../utils/coverage";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";
import {
    closeSiteDetails,
    createSiteViaModal,
    ensureSiteDetailsHeaderExpanded,
    openSiteDetails,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
    waitForSiteMonitoringHydration,
} from "../utils/ui-helpers";

test.describe(
    "monitoring status display - modern ui",
    {
        tag: [
            "@ui",
            "@site-details",
            "@monitoring",
        ],
    },
    () => {
        test.setTimeout(60_000);

        let electronApp: ElectronApplication;
        let page: Page;
        let siteName: string;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-monitoring-status-display");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            const createdSite = await createSiteViaModal(page, {
                name: generateSiteName("Monitoring Status"),
                url: DEFAULT_TEST_SITE_URL,
                monitorType: "http",
            });
            siteName = createdSite.name;
        });

        test.afterEach(async () => {
            if (page) {
                await closeSiteDetails(page).catch(() => undefined);
                await removeAllSites(page).catch(() => undefined);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should surface monitor status metrics in site details",
            {
                tag: ["@workflow", "@status"],
            },
            async () => {
                await page
                    .getByTestId("site-card")
                    .filter({ hasText: siteName })
                    .waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.LONG });

                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");
                await ensureSiteDetailsHeaderExpanded(siteDetailsModal);

                await waitForSiteMonitoringHydration(page);

                const statusDisplay = page.getByTestId(
                    "monitoring-status-display"
                );
                await expect.soft(statusDisplay).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect
                    .soft(statusDisplay)
                    .toContainText(/monitor status/i);
                await expect
                    .soft(statusDisplay)
                    .toContainText(/(0|1)\/1 active/v);
                await expect.soft(statusDisplay).toContainText(/website url/i);
                await expect.soft(statusDisplay).toContainText("example.com");

                const monitorEntries = page.getByTestId(/monitor-status-/v);
                await expect.soft(monitorEntries).toHaveCount(1);
                const monitorEntry = monitorEntries.first();
                await expect.soft(monitorEntry).toContainText(/http/iv);

                const connectionSnippet = await monitorEntry.textContent();
                expect.soft(connectionSnippet ?? "").toContain("example.com");
            }
        );
    }
);

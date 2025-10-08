/**
 * Monitoring status display regression scenarios within the site details modal.
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
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

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
                await openSiteDetails(page, siteName);

                const siteDetailsModal = page.getByTestId("site-details-modal");
                const expandHeaderButton = siteDetailsModal
                    .getByRole("button", { name: "Expand header" })
                    .first();
                const canExpand = await expandHeaderButton
                    .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => false);
                if (canExpand) {
                    await expandHeaderButton.click();
                }

                const statusDisplay = page.getByTestId(
                    "monitoring-status-display"
                );
                await expect(statusDisplay).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(statusDisplay).toContainText(/Monitor Status/i);
                await expect(statusDisplay).toContainText(/(0|1)\/1 active/);
                await expect(statusDisplay).toContainText(/Website URL/i);
                await expect(statusDisplay).toContainText(/example.com/i);

                const monitorEntries = page.getByTestId(/monitor-status-/);
                await expect(monitorEntries).toHaveCount(1);
                const monitorEntry = monitorEntries.first();
                await expect(monitorEntry).toContainText(/HTTP/i);

                const connectionSnippet = await monitorEntry.textContent();
                expect(connectionSnippet ?? "").toContain("example.com");
            }
        );
    }
);

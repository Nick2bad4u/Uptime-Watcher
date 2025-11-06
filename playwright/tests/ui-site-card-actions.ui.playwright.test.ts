/**
 * Site card action control regression scenarios covering quick actions.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Locator,
    type Page,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { tagElectronAppCoverage } from "../utils/coverage";
import {
    createSiteViaModal,
    getSiteCardLocator,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

import type { CreatedSiteResult } from "../utils/ui-helpers";

function resolveMetricsSummaryLocator(page: Page, site: CreatedSiteResult) {
    return site.identifier
        ? page.getByTestId(`site-card-metrics-summary-${site.identifier}`)
        : page.getByText(/^Status:/).first();
}

test.describe(
    "site card actions - modern ui",
    {
        tag: [
            "@ui",
            "@site-card",
            "@monitoring",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;
        let createdSite: CreatedSiteResult;
        let siteCardLocator: Locator;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-site-card-actions");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            const siteName = generateSiteName("Site Card Action");
            createdSite = await createSiteViaModal(page, {
                name: siteName,
                url: DEFAULT_TEST_SITE_URL,
                monitorType: "http",
            });
            siteCardLocator = getSiteCardLocator(page, siteName);
            await expect(siteCardLocator).toBeVisible({
                timeout: WAIT_TIMEOUTS.LONG,
            });
        });

        test.afterEach(async () => {
            if (page) {
                await removeAllSites(page).catch(() => undefined);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should drive monitor lifecycle from card quick actions",
            {
                tag: ["@workflow", "@quick-actions"],
            },
            async () => {
                const startAllButton = siteCardLocator.getByRole("button", {
                    name: "Start All Monitoring",
                });
                const stopAllButton = siteCardLocator.getByRole("button", {
                    name: "Stop All Monitoring",
                });

                await stopAllButton
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);

                await expect(startAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await startAllButton.click();

                await expect(stopAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const startMonitoring = siteCardLocator.getByRole("button", {
                    name: "Start Monitoring",
                });
                const stopMonitoring = siteCardLocator.getByRole("button", {
                    name: "Stop Monitoring",
                });

                await stopMonitoring
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);

                await expect(startMonitoring).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await startMonitoring.click();

                await expect(stopMonitoring).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const checkNow = page.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNow).toBeEnabled();
                await checkNow.click();

                await expect(stopAllButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );

        test(
            "should expose monitor selector and accessible metrics summary",
            {
                tag: ["@a11y", "@selectors"],
            },
            async () => {
                const monitorSelector = siteCardLocator.getByRole("combobox", {
                    name: "Select monitor",
                });
                await expect(monitorSelector).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const optionCount = await monitorSelector.evaluate(
                    (element) => element.querySelectorAll("option").length
                );
                expect(optionCount).toBeGreaterThan(0);

                const metricsSummary = resolveMetricsSummaryLocator(
                    page,
                    createdSite
                );

                await expect(metricsSummary).toBeVisible();
                const summaryText = await metricsSummary.textContent();
                expect((summaryText ?? "").trim().length).toBeGreaterThan(0);
            }
        );
    }
);

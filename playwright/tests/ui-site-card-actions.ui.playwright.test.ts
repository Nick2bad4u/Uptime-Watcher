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
        test.setTimeout(60_000);

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
                test.setTimeout(60_000);
                const stopMonitoring = siteCardLocator.getByRole("button", {
                    name: "Stop Monitoring",
                });

                await stopMonitoring
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);
                const checkNow = siteCardLocator.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNow).toBeEnabled({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await checkNow.click({ timeout: WAIT_TIMEOUTS.MEDIUM });
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

        test(
            "should surface SSL monitor identifiers on the site subtitle",
            {
                tag: ["@ui", "@monitor-identifiers"],
            },
            async () => {
                const sslSiteName = generateSiteName("SSL Identifier");

                await createSiteViaModal(page, {
                    dynamicFields: [
                        { label: "Host", value: "secure.example.com" },
                        { label: "Port", value: "443" },
                        {
                            label: "Expiry Warning (days)",
                            value: "30",
                        },
                    ],
                    monitorType: "ssl",
                    name: sslSiteName,
                });

                const sslCard = getSiteCardLocator(page, sslSiteName);
                await expect(sslCard).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const monitorSummaryButton = sslCard.getByRole("button", {
                    name: /SSL Certificate:\s*secure\.example\.com:443/i,
                });
                await expect(monitorSummaryButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );

        test(
            "should stack and dismiss status alert toasts",
            {
                tag: ["@alerts", "@toasts"],
            },
            async () => {
                test.setTimeout(60_000);
                const stopMonitoring = siteCardLocator.getByRole("button", {
                    name: "Stop Monitoring",
                });
                await stopMonitoring.click();

                // Locate the global toaster region by role and the presence of
                // status-alert toasts, then verify its live-region semantics.
                const toaster = page
                    .getByRole("complementary")
                    .filter({ has: page.getByTestId(/status-alert-/) });

                await expect(toaster).toHaveAttribute("aria-live", "polite");

                const alertEntries = page.getByTestId(/status-alert-/);
                const pausedToastEntry = alertEntries.filter({
                    hasText: /Monitoring paused/i,
                });
                await expect(pausedToastEntry.first()).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const startMonitoring = siteCardLocator.getByRole("button", {
                    name: "Start Monitoring",
                });
                await startMonitoring.click();

                // Ensure that a second toast is rendered for the recovered
                // state so stacking behavior is exercised.
                await expect
                    .poll(async () => alertEntries.count(), {
                        timeout: WAIT_TIMEOUTS.LONG,
                    })
                    .toBeGreaterThanOrEqual(2);

                const recoveredToastEntry = alertEntries
                    .filter({
                        hasText: "Monitor recovered",
                    })
                    .first();
                await expect(recoveredToastEntry).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const dismissButton = recoveredToastEntry.getByRole("button", {
                    name: "Dismiss alert",
                });
                await dismissButton.click();
            }
        );
    }
);

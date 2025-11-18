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
                const stopMonitoring = siteCardLocator.getByRole("button", {
                    name: "Stop Monitoring",
                });

                await stopMonitoring
                    .click({ timeout: WAIT_TIMEOUTS.SHORT })
                    .catch(() => undefined);

                // Validate that the quick action actually drives the
                // monitoring lifecycle by asserting on the status toast
                // rather than the button label, which can be affected by
                // optimistic UI timing and backend reconciliation.
                const pausedToast = page.getByText("Monitoring paused", {
                    exact: false,
                });
                await expect(pausedToast.first()).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const checkNow = page.getByRole("button", {
                    name: "Check Now",
                });
                await expect(checkNow).toBeEnabled();
                await checkNow.click();
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
                const stopMonitoring = siteCardLocator.getByRole("button", {
                    name: "Stop Monitoring",
                });
                await expect(stopMonitoring).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await stopMonitoring.click();

                const toaster = page.locator(".status-alert-toaster");
                await expect(toaster).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(toaster).toHaveAttribute("aria-live", "polite");

                const pausedToast = toaster.locator(".status-alert").first();
                await expect(pausedToast).toContainText("Monitoring paused", {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    pausedToast.locator("[aria-label='Dismiss alert']")
                ).toBeVisible();

                const startMonitoring = siteCardLocator.getByRole("button", {
                    name: "Start Monitoring",
                });
                await expect(startMonitoring).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await startMonitoring.click();

                const alertEntries = toaster.locator(".status-alert");
                await expect(async () => {
                    const toastCount = await alertEntries.count();
                    expect(toastCount).toBeGreaterThanOrEqual(2);
                }).toPass({ timeout: WAIT_TIMEOUTS.LONG });

                const newestToast = alertEntries.first();
                await expect(newestToast).toContainText("Monitor recovered", {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                const dismissedAlertId =
                    await newestToast.getAttribute("data-alert-id");
                expect(dismissedAlertId).toBeTruthy();
                const dismissedToastById = page.locator(
                    `.status-alert[data-alert-id="${dismissedAlertId}"]`
                );

                const pausedToastEntry = alertEntries.filter({
                    hasText: "Monitoring paused",
                });
                await expect(pausedToastEntry.first()).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const newestToastVisible = await newestToast
                    .isVisible({ timeout: WAIT_TIMEOUTS.MEDIUM })
                    .catch(() => false);
                if (newestToastVisible) {
                    await page.evaluate(() => {
                        window.scrollTo({ top: 0, behavior: "instant" });
                    });
                    await newestToast.scrollIntoViewIfNeeded();
                    await newestToast.evaluate((toast) => {
                        const dismissButton =
                            toast.querySelector<HTMLButtonElement>(
                                "button[aria-label='Dismiss alert']"
                            );
                        dismissButton?.click();
                    });
                }
                await expect(dismissedToastById).toHaveCount(0, {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await expect(pausedToastEntry.first()).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );
    }
);

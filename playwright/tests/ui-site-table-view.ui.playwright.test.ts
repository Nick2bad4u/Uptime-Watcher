/**
 * Site table view regression suite validating list layout interactions.
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
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

function assertSiteName(value: string | undefined): asserts value is string {
    if (!value) {
        throw new Error("Expected generated site name to be defined");
    }
}

test.describe(
    "site table view - modern ui",
    {
        tag: [
            "@ui",
            "@site-table",
            "@list-layout",
        ],
    },
    () => {
        test.setTimeout(60_000);

        let electronApp: ElectronApplication;
        let page: Page;
        const createdSites: string[] = [];

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-site-table-view");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            const searchBox = page.getByRole("searchbox", {
                name: "Search monitored sites",
            });
            await searchBox.fill("");
            await searchBox.press("Enter");

            createdSites.length = 0;
            for (let index = 0; index < 2; index += 1) {
                const siteName = generateSiteName("Site Table Row");
                await createSiteViaModal(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                createdSites.push(siteName);
            }
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
            "should surface table layout with accessible headers and per-row controls",
            {
                tag: ["@workflow", "@table"],
            },
            async () => {
                test.setTimeout(60_000);
                const layoutToggleGroup = page.getByRole("radiogroup", {
                    name: "Card layout",
                });
                const listButton = layoutToggleGroup.getByRole("button", {
                    name: "List",
                });
                await expect(page.getByText(/Tracking 2 sites/i)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await listButton.click();

                const table = page.getByRole("table");
                await expect(table).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const headers = await table.getByRole("columnheader").all();
                expect(headers.length).toBeGreaterThanOrEqual(6);

                for (const siteName of createdSites) {
                    await expect(
                        table
                            .getByRole("row")
                            .filter({ hasText: siteName })
                            .first()
                    ).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
                }

                const monitorSelects = table.getByRole("combobox", {
                    name: "Select monitor",
                });
                await expect(monitorSelects.first()).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(monitorSelects).toHaveCount(createdSites.length);

                await expect(
                    table.getByRole("button", { name: "Check Now" }).first()
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await expect(
                    table
                        .getByRole("button", {
                            name: /All Monitoring$/,
                        })
                        .first()
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            }
        );

        test(
            "should open site details from table row trigger",
            {
                tag: ["@navigation", "@table"],
            },
            async () => {
                test.setTimeout(60_000);
                const layoutToggleGroup = page.getByRole("radiogroup", {
                    name: "Card layout",
                });
                const listButton = layoutToggleGroup.getByRole("button", {
                    name: "List",
                });
                await listButton.click();

                const table = page.getByRole("table");
                await expect(table).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const firstSiteName = createdSites[0];
                assertSiteName(firstSiteName);

                // NOTE: The site trigger cell renders a marquee component.
                // Depending on timing, Playwright's "stable" checks can be
                // tripped by ongoing animations. The <tr> has a stable
                // aria-label and click handler, so we click the row instead.
                const rowTrigger = table.getByRole("row", {
                    name: `Open details for ${firstSiteName}`,
                });
                await expect(rowTrigger).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await rowTrigger.scrollIntoViewIfNeeded();
                await rowTrigger.dispatchEvent("click");

                const siteDetailsModal = page.getByTestId("site-details-modal");
                await expect(siteDetailsModal).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await expect(
                    siteDetailsModal
                        .getByText(firstSiteName, { exact: true })
                        .first()
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await closeSiteDetails(page);
            }
        );
    }
);

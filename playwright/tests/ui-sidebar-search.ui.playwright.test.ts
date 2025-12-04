/**
 * Sidebar search regression coverage ensuring filtering and messaging behave as
 * expected.
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
    createSiteViaModal,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

test.describe(
    "sidebar search - modern ui",
    {
        tag: ["@ui", "@sidebar", "@search"],
    },
    () => {
        test.setTimeout(60_000);

        let electronApp: ElectronApplication;
        let page: Page;
        const createdSiteNames: string[] = [];

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-sidebar-search");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);

            createdSiteNames.length = 0;
            const sitePrefixes = [
                "Alpha Search Candidate",
                "Beta Search Candidate",
                "Gamma Search Candidate",
            ];

            for (const prefix of sitePrefixes) {
                const siteName = generateSiteName(prefix);
                await createSiteViaModal(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                createdSiteNames.push(siteName);
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
            "should filter sidebar entries and surface empty messaging",
            {
                tag: ["@workflow", "@filtering"],
            },
            async () => {
                const navigation = page.getByRole("navigation", {
                    name: "Monitored sites",
                });
                const searchBox = page.getByRole("searchbox", {
                    name: "Search monitored sites",
                });

                await expect(searchBox).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await expect(navigation.getByRole("button")).toHaveCount(
                    createdSiteNames.length,
                    {
                        timeout: WAIT_TIMEOUTS.LONG,
                    }
                );

                const alphaSiteName = createdSiteNames[0]!;
                const betaSiteName = createdSiteNames[1]!;

                await searchBox.fill("Alpha");
                await expect(navigation.getByRole("button")).toHaveCount(1, {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    navigation.getByRole("button", {
                        name: new RegExp(alphaSiteName),
                    })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await searchBox.fill("Beta");
                await expect(navigation.getByRole("button")).toHaveCount(1, {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    navigation.getByRole("button", {
                        name: new RegExp(betaSiteName),
                    })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await searchBox.fill("Nope");
                await expect(navigation.getByRole("button")).toHaveCount(0, {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    navigation.getByText("No sites match your search.")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await searchBox.fill("");
                await expect(navigation.getByRole("button")).toHaveCount(
                    createdSiteNames.length,
                    {
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    }
                );
                await expect(
                    navigation.getByText("No sites match your search.")
                ).toBeHidden({ timeout: WAIT_TIMEOUTS.SHORT });
            }
        );
    }
);

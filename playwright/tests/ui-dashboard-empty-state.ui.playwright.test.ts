/**
 * Dashboard empty state regression scenarios for first-run experiences.
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
    closeModal,
    fillAddSiteForm,
    removeAllSites,
    submitAddSiteForm,
    waitForAppInitialization,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

test.describe(
    "dashboard empty state - modern ui",
    {
        tag: [
            "@ui",
            "@dashboard",
            "@empty-state",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-dashboard-empty-state");
            page = await electronApp.firstWindow();
            await waitForAppInitialization(page);
            await removeAllSites(page);
        });

        test.afterEach(async () => {
            if (page) {
                await closeModal(page).catch(() => undefined);
                await removeAllSites(page).catch(() => undefined);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should transition from empty state to populated list after first site creation",
            {
                tag: ["@workflow", "@empty-to-list"],
            },
            async () => {
                const emptyState = page.getByTestId("empty-state");
                await expect(emptyState).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    emptyState.getByText("No sites are being monitored")
                ).toBeVisible();

                const addSiteButton = page
                    .getByRole("banner")
                    .getByRole("button", { name: "Add new site" });
                await addSiteButton.click();

                const dialog = page.getByRole("dialog");
                await expect(dialog).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const siteName = generateSiteName("Empty State Demo");
                await fillAddSiteForm(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                await submitAddSiteForm(page);

                await expect(emptyState).toBeHidden({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await expect(page.getByText(/Tracking 1 site/i)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await expect(
                    page.getByText(siteName, { exact: true })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            }
        );
    }
);

/**
 * Site removal regression coverage validating confirmation dialog flows.
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
    getSiteCardLocator,
    openSiteDetails,
    removeAllSites,
    resetApplicationState,
    resolveConfirmDialog,
    waitForConfirmDialogRequest,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

test.describe(
    "site removal - modern ui",
    {
        tag: [
            "@ui",
            "@site-details",
            "@removal",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-site-removal");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);
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
            "should surface confirmation dialog and respect cancellation",
            {
                tag: ["@workflow", "@confirmation"],
            },
            async () => {
                const siteName = generateSiteName("Removal Cancel Guard");
                await createSiteViaModal(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });

                await openSiteDetails(page, siteName);

                const removeButton = page
                    .getByTestId("site-details-modal")
                    .getByRole("button", { name: "Remove Site" })
                    .first();
                await removeButton.scrollIntoViewIfNeeded();
                await expect(removeButton).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await removeButton.click();

                await waitForConfirmDialogRequest(page);

                const confirmationDialog = page.getByRole("alertdialog", {
                    name: "Remove Site",
                });

                try {
                    await expect(confirmationDialog).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                    await expect(
                        confirmationDialog.getByText(siteName, {
                            exact: false,
                        })
                    ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                    await confirmationDialog
                        .getByRole("button", { name: "Keep Site" })
                        .click();
                } catch {
                    await resolveConfirmDialog(page, "cancel");
                }

                await expect(confirmationDialog).toBeHidden({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await expect(
                    page
                        .getByRole("navigation", { name: "Monitored sites" })
                        .getByRole("button", { name: new RegExp(siteName) })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await expect(getSiteCardLocator(page, siteName)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });
            }
        );

        test(
            "should remove site and restore empty-state messaging",
            {
                tag: ["@workflow", "@cleanup"],
            },
            async () => {
                const siteName = generateSiteName("Removal Confirmation");
                await createSiteViaModal(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });

                await openSiteDetails(page, siteName);

                const removeButton = page
                    .getByTestId("site-details-modal")
                    .getByRole("button", { name: "Remove Site" })
                    .first();
                await removeButton.scrollIntoViewIfNeeded();
                await removeButton.click();

                await waitForConfirmDialogRequest(page);

                const confirmationDialog = page.getByRole("alertdialog", {
                    name: "Remove Site",
                });

                try {
                    await expect(confirmationDialog).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });
                    await confirmationDialog
                        .getByRole("button", { name: "Remove Site" })
                        .click();
                } catch {
                    await resolveConfirmDialog(page, "confirm");
                }

                await expect(confirmationDialog).toBeHidden({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const siteDetailsDialog = page.getByRole("dialog", {
                    name: "Site details",
                });
                await expect(siteDetailsDialog).toBeHidden({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const navigation = page.getByRole("navigation", {
                    name: "Monitored sites",
                });
                await expect(navigation.getByRole("button")).toHaveCount(0, {
                    timeout: WAIT_TIMEOUTS.LONG,
                });
                await expect(
                    navigation.getByText("No sites match your search.")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

                await expect(page.getByTestId("empty-state")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    page.getByText("No sites are being monitored")
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
            }
        );
    }
);

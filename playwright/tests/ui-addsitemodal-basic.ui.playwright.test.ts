/**
 * Updated Add Site modal regression tests that align with the new UI shell.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    fillAddSiteForm,
    openAddSiteModal,
    removeAllSites,
    submitAddSiteForm,
    waitForAppInitialization,
} from "../utils/ui-helpers";

const TEST_SITE_URL = "https://example.com";

test.describe(
    "add site modal - modern ui",
    {
        tag: [
            "@ui",
            "@modal",
            "@regression",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            page = await electronApp.firstWindow();
            await waitForAppInitialization(page);
            await removeAllSites(page);
        });

        test.afterEach(async () => {
            if (page) {
                await removeAllSites(page);
            }
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should expose accent styling and validation messaging",
            {
                tag: ["@smoke", "@visual"],
            },
            async () => {
                await openAddSiteModal(page);

                const dialog = page.getByRole("dialog");
                await expect(dialog).toBeVisible();
                await expect(dialog).toHaveClass(/modal-shell/);

                const dialogClassName = await dialog.evaluate(
                    (element) => element.className
                );
                expect(dialogClassName).toContain(
                    "modal-shell--accent-success"
                );

                const submitButton = page.getByRole("button", {
                    name: /Add Site/i,
                });
                await submitButton.click();

                const validationMessage = page.getByText(
                    "Site name is required"
                );
                await expect(validationMessage).toBeVisible();

                await page.getByRole("button", { name: "Close modal" }).click();
                await expect(dialog).toBeHidden();
            }
        );

        test(
            "should create a new HTTP monitor site via modal workflow",
            {
                tag: ["@workflow", "@happy-path"],
            },
            async () => {
                const uniqueName = `Playwright Demo Site ${Date.now()}`;

                await openAddSiteModal(page);
                await fillAddSiteForm(page, {
                    name: uniqueName,
                    url: TEST_SITE_URL,
                    monitorType: "http",
                });
                await submitAddSiteForm(page);

                const siteNameLocator = page.getByText(uniqueName, {
                    exact: true,
                });
                await expect(siteNameLocator).toBeVisible({ timeout: 15000 });

                await page.screenshot({
                    path: "playwright/test-results/add-site-modal-success.png",
                    fullPage: true,
                });
            }
        );
    }
);

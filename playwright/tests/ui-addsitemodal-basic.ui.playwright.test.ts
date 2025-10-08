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
    getSiteCardLocator,
    openAddSiteModal,
    removeAllSites,
    resetApplicationState,
    waitForMonitorCount,
    submitAddSiteForm,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

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
            await resetApplicationState(page);
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

                const dialog = page.getByRole("dialog").filter({
                    has: page.getByTestId("add-site-form"),
                });
                await expect(dialog).toBeVisible();
                await expect(dialog).toHaveClass(/modal-shell/);

                const dialogClassName = await dialog.evaluate(
                    (element) => element.className
                );
                expect(dialogClassName).toContain(
                    "modal-shell--accent-success"
                );

                const submitButton = dialog.getByRole("button", {
                    name: /Add Site/i,
                });
                await submitButton.click();

                const validationMessage = page.getByText(
                    "Site name is required"
                );
                await expect(validationMessage).toBeVisible();

                await dialog
                    .getByRole("button", { name: "Close modal" })
                    .click();
                await expect(dialog).toBeHidden();
            }
        );

        test(
            "should create a new HTTP monitor site via modal workflow",
            {
                tag: ["@workflow", "@happy-path"],
            },
            async () => {
                const uniqueName = generateSiteName("Playwright Demo Site");

                await openAddSiteModal(page);
                await fillAddSiteForm(page, {
                    name: uniqueName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                await submitAddSiteForm(page);

                await waitForMonitorCount(page, 1, WAIT_TIMEOUTS.LONG);

                const siteCardLocator = getSiteCardLocator(page, uniqueName);
                await expect(siteCardLocator).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await page.screenshot({
                    path: "playwright/test-results/add-site-modal-success.png",
                    fullPage: true,
                });
            }
        );

        test(
            "should present comprehensive monitor type catalog",
            {
                tag: ["@options", "@modal"],
            },
            async () => {
                await openAddSiteModal(page);

                const monitorTypeSelect = page.getByLabel(/Monitor Type/i);
                await expect(monitorTypeSelect).toBeVisible();

                const monitorTypeValues = await monitorTypeSelect.evaluate(
                    (element) =>
                        Array.from(
                            element.querySelectorAll("option"),
                            (option) => ({
                                label: option.label,
                                value: option.value,
                            })
                        )
                );

                expect(monitorTypeValues.length).toBeGreaterThanOrEqual(5);
                expect(
                    monitorTypeValues.some((option) => option.value === "http")
                ).toBe(true);
                expect(
                    monitorTypeValues.every(
                        (option) => option.label.trim().length > 0
                    )
                ).toBe(true);
            }
        );
    }
);

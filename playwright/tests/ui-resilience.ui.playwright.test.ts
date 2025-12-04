/**
 * Renderer resilience scenarios covering input sanitization, modal toggling,
 * and responsive layout behavior.
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
    openAddSiteModal,
    removeAllSites,
    submitAddSiteForm,
    resetApplicationState,
    waitForDialogTeardown,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL } from "../utils/testData";

const MALICIOUS_SITE_NAME = '<script>alert("xss")</script>';

test.describe(
    "ui resilience",
    {
        tag: ["@ui", "@resilience"],
    },
    () => {
        test.setTimeout(60_000);

        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-resilience");
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
            "should sanitize script-like site names during creation",
            {
                tag: ["@sanitization", "@security"],
            },
            async () => {
                test.setTimeout(60_000);
                await page.evaluate(() => {
                    const global = window as unknown as {
                        __alertCalled__?: boolean;
                        alert: typeof window.alert;
                    };
                    global.__alertCalled__ = false;
                    global.alert = () => {
                        global.__alertCalled__ = true;
                    };
                });

                await openAddSiteModal(page);
                await fillAddSiteForm(page, {
                    monitorType: "http",
                    name: MALICIOUS_SITE_NAME,
                    url: DEFAULT_TEST_SITE_URL,
                });
                await submitAddSiteForm(page);

                const maliciousCard = page
                    .getByTestId("site-card")
                    .filter({ hasText: 'alert("xss")' });
                await expect(maliciousCard).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                const alertTriggered = await page.evaluate(() => {
                    const global = window as unknown as {
                        __alertCalled__?: boolean;
                    };
                    return Boolean(global.__alertCalled__);
                });
                expect(alertTriggered).toBe(false);
            }
        );

        test(
            "should recover from rapid add-site modal toggling",
            {
                tag: ["@stress", "@modal"],
            },
            async () => {
                for (let iteration = 0; iteration < 3; iteration += 1) {
                    await openAddSiteModal(page);
                    await closeModal(page, "escape");
                    await waitForDialogTeardown(page, "add-site-modal");
                }

                await openAddSiteModal(page);
                await expect(page.getByTestId("add-site-form")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await closeModal(page, "escape");

                await waitForDialogTeardown(page, "add-site-modal");
            }
        );

        test(
            "should keep dashboard responsive across viewport extremes",
            {
                tag: ["@responsive", "@layout"],
            },
            async () => {
                await page.setViewportSize({ width: 360, height: 640 });
                await expect(page.getByTestId("empty-state")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    page
                        .getByRole("banner")
                        .getByRole("button", { name: /add new site/i })
                ).toBeVisible();

                await page.setViewportSize({ width: 1920, height: 1080 });
                await expect(page.getByTestId("empty-state")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    page
                        .getByRole("banner")
                        .getByRole("button", { name: /Open settings/i })
                ).toBeVisible();
            }
        );
    }
);

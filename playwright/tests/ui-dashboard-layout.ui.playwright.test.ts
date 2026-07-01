/**
 * Dashboard layout selector regression tests for the refreshed UI.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    createSiteViaModal,
    ensureCardLayout,
    getSiteCardLocator,
    removeAllSites,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

test.describe(
    "dashboard layout selector - modern ui",
    {
        tag: [
            "@ui",
            "@dashboard",
            "@regression",
        ],
    },
    () => {
        test.setTimeout(60_000);

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
            "should expose theme-driven CSS custom properties",
            {
                tag: ["@visual", "@tokens"],
            },
            async () => {
                await createSiteViaModal(page, {
                    name: `Dashboard Layout Demo ${Date.now()}`,
                });

                const properties = await page.evaluate(() => {
                    const siteList = document.querySelector(".site-list");
                    if (!siteList) {
                        return null;
                    }
                    const computed = getComputedStyle(siteList);
                    return {
                        highlight: computed.getPropertyValue(
                            "--site-list-highlight"
                        ),
                        borderWeak: computed.getPropertyValue(
                            "--site-list-border-weak"
                        ),
                    };
                });

                expect.soft(properties).not.toBeNull();
                expect.soft(
                    properties?.highlight.trim().length ?? 0
                ).toBeGreaterThan(0);
                expect.soft(
                    properties?.borderWeak.trim().length ?? 0
                ).toBeGreaterThan(0);
            }
        );

        test(
            "should switch between card and list presentations",
            {
                tag: ["@workflow", "@interaction"],
            },
            async () => {
                await createSiteViaModal(page, {
                    name: `Dashboard Layout Toggle ${Date.now()}`,
                });

                await ensureCardLayout(page);

                const initialClasses = await page.evaluate(() => (
                        document.querySelector(".site-grid")?.className ?? ""
                    ));
                expect.soft(initialClasses).toContain("site-grid--stacked");

                const listButton = page.getByRole("button", { name: "List" });
                await listButton.click();

                const table = page.getByRole("table");
                await expect.soft(table).toBeVisible();

                const largeButton = page.getByRole("button", { name: "Large" });
                await largeButton.click();

                await expect.soft(table).toBeHidden({ timeout: 5000 });

                const miniButton = page.getByRole("button", { name: "Mini" });
                await miniButton.click();

                const compactClasses = await page.evaluate(() => (
                        document.querySelector(".site-grid")?.className ?? ""
                    ));
                expect.soft(compactClasses).toContain("site-grid--compact");
            }
        );

        test(
            "should toggle large card presentation between grid and stacked",
            {
                tag: ["@workflow", "@presentation"],
            },
            async () => {
                test.setTimeout(60_000);
                const createdSite = await createSiteViaModal(page, {
                    name: `Dashboard Presentation ${Date.now()}`,
                });

                await ensureCardLayout(page);

                await expect.soft(
                    getSiteCardLocator(page, createdSite.name)
                ).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const largeButton = page.getByRole("button", { name: "Large" });
                await largeButton.click();

                const gridButton = page.getByRole("button", { name: "Grid" });
                await expect.soft(gridButton).toHaveAttribute(
                    "aria-pressed",
                    /false|true/v
                );

                await gridButton.click();
                await expect.soft(gridButton).toHaveAttribute(
                    "aria-pressed",
                    "true",
                    { timeout: WAIT_TIMEOUTS.MEDIUM }
                );
                await expect
                    .poll(
                        () =>
                            page.evaluate(
                                () =>
                                    document
                                        .querySelector(".site-grid")
                                        ?.classList.contains(
                                            "site-grid--balanced"
                                        ) ?? false
                            ),
                        { timeout: WAIT_TIMEOUTS.LONG }
                    )
                    .toBeTruthy();

                const stackedButton = page.getByRole("button", {
                    name: "Stacked",
                });
                await stackedButton.click();
                await expect.soft(stackedButton).toHaveAttribute(
                    "aria-pressed",
                    "true",
                    { timeout: WAIT_TIMEOUTS.MEDIUM }
                );
                await expect
                    .poll(
                        () =>
                            page.evaluate(
                                () =>
                                    document
                                        .querySelector(".site-grid")
                                        ?.classList.contains(
                                            "site-grid--stacked"
                                        ) ?? false
                            ),
                        { timeout: WAIT_TIMEOUTS.LONG }
                    )
                    .toBeTruthy();
            }
        );
    }
);

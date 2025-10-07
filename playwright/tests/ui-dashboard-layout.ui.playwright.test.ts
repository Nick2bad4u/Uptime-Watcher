/**
 * Dashboard layout selector regression tests for the refreshed UI.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    createSiteViaModal,
    removeAllSites,
    waitForAppInitialization,
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

                expect(properties).not.toBeNull();
                expect(
                    properties?.highlight.trim().length ?? 0
                ).toBeGreaterThan(0);
                expect(
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

                const initialClasses = await page.evaluate(() => {
                    return (
                        document.querySelector(".site-grid")?.className ?? ""
                    );
                });
                expect(initialClasses).toContain("site-grid--stacked");

                const listButton = page.getByRole("button", { name: "List" });
                await listButton.click();

                const table = page.getByRole("table");
                await expect(table).toBeVisible();

                const largeButton = page.getByRole("button", { name: "Large" });
                await largeButton.click();

                await expect(table).toBeHidden({ timeout: 5000 });

                const miniButton = page.getByRole("button", { name: "Mini" });
                await miniButton.click();

                const compactClasses = await page.evaluate(() => {
                    return (
                        document.querySelector(".site-grid")?.className ?? ""
                    );
                });
                expect(compactClasses).toContain("site-grid--compact");
            }
        );
    }
);

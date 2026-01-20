/**
 * Header control regression tests aligned with the refreshed UI shell.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import { openSettingsModal, resetApplicationState } from "../utils/ui-helpers";

test.describe(
    "header controls - modern accessibility",
    {
        tag: [
            "@ui",
            "@header",
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
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should expose updated accessible labels and toggle theme",
            {
                tag: ["@smoke", "@a11y"],
            },
            async () => {
                const addSiteButton = page
                    .getByRole("banner")
                    .getByRole("button", {
                        name: "Add new site",
                    });
                await expect(addSiteButton).toBeVisible();

                const initialIsDark = await page.evaluate(() =>
                    document.documentElement.classList.contains("dark")
                );

                const themeButton = page.getByRole("button", {
                    name: /Switch to (light|dark) theme/i,
                });
                const initialLabel = await themeButton.evaluate(
                    (node) => node.getAttribute("aria-label") ?? ""
                );
                expect(initialLabel).toMatch(/Switch to (light|dark) theme/i);

                await themeButton.click();

                await page.waitForFunction(
                    (wasDark) =>
                        document.documentElement.classList.contains("dark") !==
                        wasDark,
                    initialIsDark
                );

                const toggledIsDark = await page.evaluate(() =>
                    document.documentElement.classList.contains("dark")
                );
                expect(toggledIsDark).not.toBe(initialIsDark);

                const updatedThemeButton = page.getByRole("button", {
                    name: /Switch to (light|dark) theme/i,
                });
                await expect(updatedThemeButton).toHaveAttribute(
                    "aria-label",
                    /Switch to (light|dark) theme/i
                );
                const toggledLabel = await updatedThemeButton.evaluate(
                    (node) => node.getAttribute("aria-label") ?? ""
                );
                expect(toggledLabel).not.toBe(initialLabel);
            }
        );

        test(
            "should render settings modal with accent styling",
            {
                tag: ["@modal", "@visual"],
            },
            async () => {
                await openSettingsModal(page);

                const modal = page.getByTestId("settings-modal");
                await expect(modal).toBeVisible();
                await expect(modal).toHaveClass(/modal-shell--accent-success/);

                await expect(
                    modal.getByTestId("modal-accent-icon")
                ).toBeVisible();

                const accentValue = await modal.evaluate((element) =>
                    getComputedStyle(element).getPropertyValue("--modal-accent")
                );
                expect(accentValue.trim().length).toBeGreaterThan(0);

                const closeButton = page.getByRole("button", {
                    name: "Close settings",
                });
                await closeButton.click();
                await expect(modal).toBeHidden();
            }
        );
    }
);

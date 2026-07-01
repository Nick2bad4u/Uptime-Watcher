/**
 * Header control regression tests aligned with the refreshed UI shell.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
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
                await expect.soft(addSiteButton).toBeVisible();

                const isInitialIsDark = await page.evaluate(() =>
                    document.documentElement.classList.contains("dark")
                );

                const themeButton = page.getByRole("button", {
                    name: /switch to (dark|light) theme/i,
                });
                const initialLabel = await themeButton.evaluate(
                    (node) => node.getAttribute("aria-label") ?? ""
                );
                expect.soft(initialLabel).toMatch(/switch to (dark|light) theme/i);

                await themeButton.click();

                await page.waitForFunction(
                    (wasDark) =>
                        document.documentElement.classList.contains("dark") !==
                        wasDark,
                    isInitialIsDark
                );

                const isToggledIsDark = await page.evaluate(() =>
                    document.documentElement.classList.contains("dark")
                );
                expect.soft(isToggledIsDark).not.toBe(isInitialIsDark);

                const updatedThemeButton = page.getByRole("button", {
                    name: /switch to (dark|light) theme/i,
                });
                await expect.soft(updatedThemeButton).toHaveAttribute(
                    "aria-label",
                    /switch to (dark|light) theme/i
                );
                const toggledLabel = await updatedThemeButton.evaluate(
                    (node) => node.getAttribute("aria-label") ?? ""
                );
                expect.soft(toggledLabel).not.toBe(initialLabel);
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
                await expect.soft(modal).toBeVisible();
                await expect.soft(modal).toHaveClass(/modal-shell--accent-success/v);

                await expect.soft(
                    modal.getByTestId("modal-accent-icon")
                ).toBeVisible();

                const accentValue = await modal.evaluate((element) =>
                    getComputedStyle(element).getPropertyValue("--modal-accent")
                );
                expect.soft(accentValue.trim().length).toBeGreaterThan(0);

                const closeButton = page.getByRole("button", {
                    name: "Close settings",
                });
                await closeButton.click();
                await expect.soft(modal).toBeHidden();
            }
        );
    }
);

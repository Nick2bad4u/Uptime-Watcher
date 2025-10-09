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
import {
    openSettingsModal,
    waitForAppInitialization,
} from "../utils/ui-helpers";

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
            await waitForAppInitialization(page);
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
                const addSiteButton = page.getByRole("button", {
                    name: "Add new site",
                });
                await expect(addSiteButton).toBeVisible();

                const initialTheme = await page.evaluate(() =>
                    document.body.classList.contains("dark") ? "dark" : "light"
                );

                const themeButton = page.getByRole("button", {
                    name: /Switch to (light|dark) theme/i,
                });
                const initialLabel = await themeButton.evaluate(
                    (node) => node.getAttribute("aria-label") ?? ""
                );
                expect(initialLabel).toMatch(/Switch to (light|dark) theme/i);

                await themeButton.click();

                await page.waitForFunction(() => {
                    const body = document.body;
                    return (
                        body.classList.contains("dark") ||
                        body.classList.contains("light")
                    );
                });

                const toggledTheme = await page.evaluate(() =>
                    document.body.classList.contains("dark") ? "dark" : "light"
                );
                expect(toggledTheme).not.toBe(initialTheme);

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

                const headerIconPresent = await modal.evaluate((element) =>
                    Boolean(
                        element.querySelector(".settings-modal__header-icon")
                    )
                );
                expect(headerIconPresent).toBe(true);

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

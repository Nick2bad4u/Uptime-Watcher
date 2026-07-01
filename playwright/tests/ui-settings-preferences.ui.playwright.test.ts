/**
 * Settings preference regression scenarios covering toggles, selects and
 * utilities.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { tagElectronAppCoverage } from "../utils/coverage";
import {
    openSettingsModal,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

async function toggleCheckboxAndRevert(
    page: Page,
    label: string
): Promise<void> {
    const checkbox = page.getByLabel(label);
    await expect.soft(checkbox).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

    const isInitialState = await checkbox.isChecked();

    const toggleCheckbox = async (): Promise<void> => {
        await page.evaluate((accessibleLabel) => {
            const target = [
                ...document.querySelectorAll<HTMLInputElement>(
                    'input[type="checkbox"][aria-label]'
                ),
            ].find(
                (element) =>
                    element.getAttribute("aria-label") === accessibleLabel
            );

            if (!target) {
                throw new Error(
                    `Unable to locate checkbox for label: ${accessibleLabel}`
                );
            }

            target.click();
        }, label);
    };

    await toggleCheckbox();
    await expect
        .soft(page.getByLabel(label))
        .toHaveJSProperty("checked", !isInitialState);

    await toggleCheckbox();
    await expect
        .soft(page.getByLabel(label))
        .toHaveJSProperty("checked", isInitialState);
}

async function selectAlternateOption(
    locator: ReturnType<Page["getByLabel"]>
): Promise<void> {
    const initialValue = await locator.inputValue();
    const availableValues = await locator.evaluate((element) =>
        Array.from(element.querySelectorAll("option"), (option) => option.value)
    );

    expect.soft(availableValues.length).toBeGreaterThan(1);

    const nextValue = availableValues.find((value) => value !== initialValue);
    expect.soft(nextValue).toBeDefined();

    const alternateValue = nextValue!;

    await locator.selectOption(alternateValue);
    await expect.soft(locator).toHaveValue(alternateValue);

    await locator.selectOption(initialValue);
    await expect.soft(locator).toHaveValue(initialValue);
}

function resolveAlternateTheme(
    availableThemes: readonly string[],
    initialTheme: string
): string {
    const prioritized = availableThemes.find(
        (value) =>
            value !== initialTheme && (value === "dark" || value === "light")
    );
    const fallback =
        prioritized ?? availableThemes.find((value) => value !== initialTheme);
    if (!fallback) {
        throw new Error("Expected at least one alternate theme option");
    }
    return fallback;
}

async function waitForThemeApplication(
    page: Page,
    theme: string
): Promise<void> {
    await page.waitForFunction(
        (targetTheme) => {
            const root = document.documentElement;
            const themeClasses = [...document.body.classList].filter(
                (className) => className.startsWith("theme-")
            );

            if (themeClasses.length === 0) {
                return false;
            }

            const [activeThemeClass] = themeClasses;
            if (!activeThemeClass) {
                return false;
            }

            const activeTheme = activeThemeClass.replace("theme-", "");

            if (targetTheme === "system") {
                if (activeTheme !== "dark" && activeTheme !== "light") {
                    return false;
                }

                return (
                    root.classList.contains("dark") === (activeTheme === "dark")
                );
            }

            if (activeTheme !== targetTheme) {
                return false;
            }

            if (targetTheme === "dark") {
                return root.classList.contains("dark");
            }

            if (targetTheme === "light") {
                return !root.classList.contains("dark");
            }

            return true;
        },
        theme,
        { timeout: WAIT_TIMEOUTS.LONG }
    );
}

test.describe(
    "settings preferences - modern ui",
    {
        tag: [
            "@ui",
            "@settings",
            "@regression",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-settings-preferences");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);
        });

        test.afterEach(async () => {
            if (page) {
                await page
                    .getByRole("button", { name: "Close settings" })
                    .click()
                    .catch(() => undefined);
            }

            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should toggle core notification and application checkboxes",
            {
                tag: ["@workflow", "@toggles"],
            },
            async () => {
                await openSettingsModal(page);
                await expect
                    .soft(page.getByTestId("settings-modal"))
                    .toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });

                await toggleCheckboxAndRevert(
                    page,
                    "Enable system notifications"
                );
                await toggleCheckboxAndRevert(
                    page,
                    "Play sound for in-app alerts"
                );
                await toggleCheckboxAndRevert(
                    page,
                    "Launch Uptime Watcher automatically at login"
                );
                await toggleCheckboxAndRevert(
                    page,
                    "Minimize Uptime Watcher to the system tray"
                );
            }
        );

        test(
            "should adjust history limit and theme selections",
            {
                tag: ["@workflow", "@preferences"],
            },
            async () => {
                await openSettingsModal(page);
                await expect
                    .soft(page.getByTestId("settings-modal"))
                    .toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });

                const historySelect = page.getByLabel(
                    "Maximum number of history records to keep per site"
                );
                await expect.soft(historySelect).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await selectAlternateOption(historySelect);

                const themeSelect = page.getByLabel("Select application theme");
                await expect.soft(themeSelect).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const initialTheme = await themeSelect.inputValue();
                const themeOptions = await themeSelect.evaluate((element) =>
                    Array.from(
                        element.querySelectorAll("option"),
                        (option) => option.value
                    )
                );
                expect.soft(themeOptions.length).toBeGreaterThan(1);

                const alternateTheme = resolveAlternateTheme(
                    themeOptions,
                    initialTheme
                );

                await themeSelect.selectOption(alternateTheme);
                await expect.soft(themeSelect).toHaveValue(alternateTheme);

                await waitForThemeApplication(page, alternateTheme);

                await themeSelect.selectOption(initialTheme);
                await expect.soft(themeSelect).toHaveValue(initialTheme);

                await waitForThemeApplication(page, initialTheme);

                await expect
                    .soft(
                        page.getByRole("button", {
                            name: "Export monitoring data",
                        })
                    )
                    .toBeEnabled();
                await expect
                    .soft(page.getByRole("button", { name: "Refresh history" }))
                    .toBeEnabled();
                await expect
                    .soft(
                        page.getByRole("button", { name: "Reset everything" })
                    )
                    .toBeEnabled();
            }
        );
    }
);

/**
 * Settings preference regression scenarios covering toggles, selects and
 * utilities.
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
    openSettingsModal,
    resetApplicationState,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";

async function toggleCheckboxAndRevert(
    page: Page,
    label: string
): Promise<void> {
    const checkbox = page.getByLabel(label);
    await expect(checkbox).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });

    const initialState = await checkbox.isChecked();

    const toggleCheckbox = async (): Promise<void> => {
        await page.evaluate((accessibleLabel) => {
            const target = Array.from(
                document.querySelectorAll<HTMLInputElement>(
                    'input[type="checkbox"][aria-label]'
                )
            ).find(
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
    await expect(page.getByLabel(label)).toHaveJSProperty(
        "checked",
        !initialState
    );

    await toggleCheckbox();
    await expect(page.getByLabel(label)).toHaveJSProperty(
        "checked",
        initialState
    );
}

async function selectAlternateOption(
    locator: ReturnType<Page["getByLabel"]>
): Promise<void> {
    const initialValue = await locator.inputValue();
    const availableValues = await locator.evaluate((element) =>
        Array.from(
            element.querySelectorAll("option"),
            (option) => option.value
        ));

    expect(availableValues.length).toBeGreaterThan(1);

    const nextValue = availableValues.find((value) => value !== initialValue);
    expect(nextValue).toBeDefined();

    const alternateValue = nextValue as string;

    await locator.selectOption(alternateValue);
    await expect(locator).toHaveValue(alternateValue);

    await locator.selectOption(initialValue);
    await expect(locator).toHaveValue(initialValue);
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
            const themeClasses = Array.from(document.body.classList).filter((
                className
            ) => className.startsWith("theme-"));

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
                await expect(page.getByTestId("settings-modal")).toBeVisible({
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
                await expect(page.getByTestId("settings-modal")).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const historySelect = page.getByLabel(
                    "Maximum number of history records to keep per site"
                );
                await expect(historySelect).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await selectAlternateOption(historySelect);

                const themeSelect = page.getByLabel("Select application theme");
                await expect(themeSelect).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                const initialTheme = await themeSelect.inputValue();
                const themeOptions = await themeSelect.evaluate((element) =>
                    Array.from(
                        element.querySelectorAll("option"),
                        (option) => option.value
                    ));
                expect(themeOptions.length).toBeGreaterThan(1);

                const alternateTheme = resolveAlternateTheme(
                    themeOptions,
                    initialTheme
                );

                await themeSelect.selectOption(alternateTheme);
                await expect(themeSelect).toHaveValue(alternateTheme);

                await waitForThemeApplication(page, alternateTheme);

                await themeSelect.selectOption(initialTheme);
                await expect(themeSelect).toHaveValue(initialTheme);

                await waitForThemeApplication(page, initialTheme);

                await expect(
                    page.getByRole("button", {
                        name: "Export monitoring data",
                    })
                ).toBeEnabled();
                await expect(
                    page.getByRole("button", { name: "Refresh history" })
                ).toBeEnabled();
                await expect(
                    page.getByRole("button", { name: "Reset everything" })
                ).toBeEnabled();
            }
        );
    }
);

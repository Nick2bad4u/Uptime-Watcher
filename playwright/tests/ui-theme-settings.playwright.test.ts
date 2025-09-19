/**
 * Theme and settings smoke tests.
 */

import { test, expect } from "../fixtures/electron-test";
import { waitForAppInitialization } from "../utils/ui-helpers";

test.describe("theme and settings", () => {
    test.beforeEach(async ({ window }) => {
        await waitForAppInitialization(window);
    });

    test("should toggle between light and dark theme", async ({ window }) => {
        const themeButton = window.getByRole("button", {
            name: "Toggle theme",
        });
        await expect(themeButton).toBeVisible();

        await themeButton.click();
        await window.waitForTimeout(250);

        await themeButton.click();
        await window.waitForTimeout(250);

        await expect(themeButton).toBeVisible();
    });

    test("should open settings modal", async ({ window }) => {
        const settingsButton = window.getByRole("button", { name: "Settings" });
        await expect(settingsButton).toBeVisible();

        await settingsButton.click();
        await expect(window.getByRole("dialog")).toBeVisible();

        await window.keyboard.press("Escape");
        await expect(window.getByRole("dialog")).toBeHidden();
    });
});

/**
 * Site management UI regression tests.
 */

import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/electron-test";
import { waitForAppInitialization } from "../utils/ui-helpers";

const ADD_SITE_BUTTON_NAME = "Add new site";

async function openAddSiteModal(window: Page) {
    await expect(
        window.getByRole("button", { name: ADD_SITE_BUTTON_NAME })
    ).toBeVisible({ timeout: 10000 });
    await window.getByRole("button", { name: ADD_SITE_BUTTON_NAME }).click();
    await expect(window.getByRole("dialog")).toBeVisible({ timeout: 5000 });
}

test.describe("site management", () => {
    test.beforeEach(async ({ window }) => {
        await waitForAppInitialization(window);
    });

    test("should display app title and header controls", async ({ window }) => {
        await expect(window).toHaveTitle(/Uptime Watcher/);
        await expect(
            window.getByRole("button", { name: ADD_SITE_BUTTON_NAME })
        ).toBeVisible();
        await expect(
            window.getByRole("button", { name: "Toggle theme" })
        ).toBeVisible();
        await expect(
            window.getByRole("button", { name: "Settings" })
        ).toBeVisible();
    });

    test("should open and close the add site modal", async ({ window }) => {
        await openAddSiteModal(window);

        const closeButton = window.getByRole("button", { name: "Close modal" });
        await expect(closeButton).toBeVisible();
        await closeButton.click();
        await expect(window.getByRole("dialog")).toBeHidden();
    });

    test("should keep modal open when submitting empty form", async ({
        window,
    }) => {
        await openAddSiteModal(window);

        const submitButton = window.getByRole("button", { name: "Add Site" });
        await expect(submitButton).toBeVisible();
        await submitButton.click();

        await expect(window.getByRole("dialog")).toBeVisible();
    });
});

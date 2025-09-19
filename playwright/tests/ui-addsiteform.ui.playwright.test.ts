/**
 * Focused UI tests for the Add Site form.
 */

import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/electron-test";
import { waitForAppInitialization } from "../utils/ui-helpers";

async function openForm(window: Page) {
    const addSiteButton = window.getByRole("button", { name: "Add new site" });
    await expect(addSiteButton).toBeVisible({ timeout: 10000 });
    await addSiteButton.click();
    await expect(window.getByRole("dialog")).toBeVisible({ timeout: 5000 });
}

test.describe("add site form", () => {
    test.beforeEach(async ({ window }) => {
        await waitForAppInitialization(window);
    });

    test("should render form fields", async ({ window }) => {
        await openForm(window);

        await expect(window.getByLabel(/site name/i)).toBeVisible();
        await expect(window.getByLabel(/url/i)).toBeVisible();
        await expect(
            window.getByRole("button", { name: /add site/i })
        ).toBeVisible();
    });

    test("should validate required fields", async ({ window }) => {
        await openForm(window);

        const submitButton = window.getByRole("button", { name: /add site/i });
        await submitButton.click();

        await expect(window.getByRole("dialog")).toBeVisible();
    });

    test("should close when pressing escape", async ({ window }) => {
        await openForm(window);
        await window.keyboard.press("Escape");
        await expect(window.getByRole("dialog")).toBeHidden();
    });
});

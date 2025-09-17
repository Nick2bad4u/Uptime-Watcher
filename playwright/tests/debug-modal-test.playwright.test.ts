import { test } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test("debug modal issue", async () => {
    const electronApp = await launchElectronApp();
    const page = await electronApp.firstWindow();

    try {
        // Wait for app to load
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(3000);

        // Take initial screenshot
        await page.screenshot({ path: "debug-initial.png", fullPage: true });

        // Check what buttons exist
        const buttons = await page.getByRole("button").all();
        console.log(`Found ${buttons.length} buttons`);

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (!button) continue;

            const text = await button.textContent().catch(() => "N/A");
            const ariaLabel = await button
                .getAttribute("aria-label")
                .catch(() => "N/A");
            const visible = await button.isVisible().catch(() => false);

            console.log(
                `Button ${i}: text="${text}" aria-label="${ariaLabel}" visible=${visible}`
            );
        }

        // Try to find Add new site button
        const addSiteButton = page.getByRole("button", {
            name: "Add new site",
        });
        const addSiteVisible = await addSiteButton
            .isVisible()
            .catch(() => false);
        console.log("Add new site button visible:", addSiteVisible);

        if (addSiteVisible) {
            console.log("Clicking add site button...");
            await addSiteButton.click();
            await page.waitForTimeout(2000);

            // Check for dialog
            const dialog = page.getByRole("dialog");
            const dialogVisible = await dialog.isVisible().catch(() => false);
            console.log("Dialog visible after click:", dialogVisible);

            await page.screenshot({
                path: "debug-after-click.png",
                fullPage: true,
            });
        }
    } finally {
        await electronApp.close();
    }
});

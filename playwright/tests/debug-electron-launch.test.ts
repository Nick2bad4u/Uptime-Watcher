import { test, expect } from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";

test.describe("debug electron launch", () => {
    test("minimal electron launch test", async () => {
        console.log("Starting Electron launch test...");

        const electronApp = await launchElectronApp();
        console.log("Electron app launched successfully");

        const page = await electronApp.firstWindow();
        console.log("Got first window");

        try {
            // Just try to get the title - no waiting for specific elements
            await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
            console.log("DOM content loaded");

            const title = await page.title();
            console.log("Page title:", title);

            // Take a screenshot to see what we have
            await page.screenshot({
                path: "debug-basic-launch.png",
                fullPage: true,
            });
            console.log("Screenshot taken");

            expect(title).toBeTruthy();
        } finally {
            await electronApp.close();
            console.log("Electron app closed");
        }
    });
});

import { expect, _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";
import type { MonitorType } from "../../../shared/types";

export const createUniqueName = (prefix: string): string => {
    const randomSegment = Math.random().toString(36).slice(2, 8);
    return `${prefix} ${Date.now()}-${randomSegment}`;
};

export async function launchAppForMonitorTesting(): Promise<{
    electronApp: ElectronApplication;
    window: Page;
}> {
    const electronApp = await electron.launch({
        args: ["."],
        env: {
            ...process.env,
            NODE_ENV: "test",
            SKIP_AUTO_UPDATES: "true",
        },
    });

    const window = await electronApp.firstWindow();
    await window.waitForLoadState("domcontentloaded");

    await expect(window.getByTestId("app-root")).toBeVisible({
        timeout: 15000,
    });
    await expect(window.getByRole("main")).toBeVisible({
        timeout: 15000,
    });

    return { electronApp, window };
}

export async function openAddSiteModal(window: Page): Promise<void> {
    await window.getByRole("button", { name: /add new site/i }).click();
    await expect(window.getByRole("dialog")).toBeVisible({ timeout: 5000 });
}

export async function selectMonitorType(
    window: Page,
    monitorType: MonitorType
): Promise<void> {
    const monitorTypeSelect = window.getByLabel(/monitor type/i);
    await expect(monitorTypeSelect).toBeEnabled();
    await monitorTypeSelect.selectOption(monitorType);
    await expect(monitorTypeSelect).toHaveValue(monitorType);
}

export async function submitMonitorForm(window: Page): Promise<void> {
    const submitButton = window.getByRole("button", {
        name: /add site|create/i,
    });
    await submitButton.click();
}

export async function verifySiteCreated(
    window: Page,
    siteName: string
): Promise<void> {
    await expect(window.getByText(siteName)).toBeVisible({ timeout: 7000 });
}

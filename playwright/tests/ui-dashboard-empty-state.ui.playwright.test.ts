/**
 * Dashboard empty state regression scenarios for first-run experiences.
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
    closeModal,
    fillAddSiteForm,
    getSiteCardLocator,
    submitAddSiteForm,
    resetApplicationState,
    ensureCardLayout,
    WAIT_TIMEOUTS,
    openAddSiteModal,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

function delayMs(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function bestEffort(args: {
    label: string;
    timeoutMs: number;
    work: Promise<unknown>;
}): Promise<void> {
    await Promise.race([
        args.work.catch(() => undefined),
        delayMs(args.timeoutMs),
    ]);
}

test.describe(
    "dashboard empty state - modern ui",
    {
        tag: [
            "@ui",
            "@dashboard",
            "@empty-state",
        ],
    },
    () => {
        test.describe.configure({ timeout: WAIT_TIMEOUTS.VERY_LONG });
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-dashboard-empty-state");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);
        });

        test.afterEach(async () => {
            if (page) {
                await bestEffort({
                    label: "close modal",
                    timeoutMs: 5_000,
                    work: closeModal(page),
                });
            }

            if (electronApp) {
                await bestEffort({
                    label: "close electron app",
                    timeoutMs: 10_000,
                    work: electronApp.close(),
                });
            }
        });

        test(
            "should transition from empty state to populated list after first site creation",
            {
                tag: ["@workflow", "@empty-to-list"],
            },
            async () => {
                const emptyState = page.getByTestId("empty-state");
                await expect(emptyState).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    emptyState.getByText("No sites are being monitored")
                ).toBeVisible();

                await openAddSiteModal(page);

                const siteName = generateSiteName("Empty State Demo");
                await fillAddSiteForm(page, {
                    name: siteName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                await submitAddSiteForm(page);

                await expect(emptyState).toBeHidden({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await expect(
                    page.getByTestId("site-count-label")
                ).toContainText("Tracking 1 site", {
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await ensureCardLayout(page);

                await expect(getSiteCardLocator(page, siteName)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
            }
        );
    }
);

/**
 * Updated Add Site modal regression tests that align with the new UI shell.
 */

import {
    type ElectronApplication,
    expect,
    type Page,
    test,
} from "@playwright/test";

import { launchElectronApp } from "../fixtures/electron-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";
import {
    ensureCardLayout,
    fillAddSiteForm,
    getSiteCardLocator,
    openAddSiteModal,
    removeAllSites,
    resetApplicationState,
    submitAddSiteForm,
    WAIT_TIMEOUTS,
    waitForMonitorCount,
} from "../utils/ui-helpers";

test.describe(
    "add site modal - modern ui",
    {
        tag: [
            "@ui",
            "@modal",
            "@regression",
        ],
    },
    () => {
        test.setTimeout(45_000);
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            page = await electronApp.firstWindow();
            await resetApplicationState(page);
        });

        test.afterEach(async () => {
            if (page) {
                await removeAllSites(page);
            }
            if (electronApp) {
                await electronApp.close();
            }
        });

        // See Playwright configuration notes: this scenario is also covered
        // by RTL tests, and has historically been the most sensitive to the
        // upstream attachment/step bug. Keep it skipped until we can
        // confirm the Playwright dispatcher issue is fully resolved.
        test(
            "should expose accent styling and validation messaging",
            {
                tag: ["@smoke", "@visual"],
            },
            async () => {
                await openAddSiteModal(page);

                const dialog = page.getByRole("dialog").filter({
                    has: page.getByTestId("add-site-form"),
                });
                await expect.soft(dialog).toBeVisible();
                await expect.soft(dialog).toHaveClass(/modal-shell/v);

                const dialogClassName = await dialog.evaluate(
                    (element) => element.className
                );
                expect
                    .soft(dialogClassName)
                    .toContain("modal-shell--accent-success");

                const submitButton = dialog.getByRole("button", {
                    name: /add site/i,
                });
                await submitButton.click();

                const validationMessage = page.getByText(
                    "Site name is required"
                );
                await expect.soft(validationMessage).toBeVisible();

                await dialog
                    .getByRole("button", { name: "Close modal" })
                    .click();
                await expect.soft(dialog).toBeHidden();
            }
        );

        test(
            "should create a new HTTP monitor site via modal workflow",
            {
                tag: ["@workflow", "@happy-path"],
            },
            async () => {
                const uniqueName = generateSiteName("Playwright Demo Site");

                await openAddSiteModal(page);
                await fillAddSiteForm(page, {
                    name: uniqueName,
                    url: DEFAULT_TEST_SITE_URL,
                    monitorType: "http",
                });
                await submitAddSiteForm(page);

                await waitForMonitorCount(page, 1, WAIT_TIMEOUTS.LONG);
                await ensureCardLayout(page);

                const siteCardLocator = getSiteCardLocator(page, uniqueName);
                await expect.soft(siteCardLocator).toBeVisible({
                    timeout: WAIT_TIMEOUTS.LONG,
                });

                await page.screenshot({
                    path: "playwright/test-results/add-site-modal-success.png",
                    fullPage: true,
                });
            }
        );

        // Likewise, this catalog scenario has comprehensive unit/integration
        // coverage. We keep the E2E variant skipped for now to avoid
        // reintroducing flakiness tied to the Playwright attachment bug.
        test(
            "should present comprehensive monitor type catalog",
            {
                tag: ["@options", "@modal"],
            },
            async () => {
                await openAddSiteModal(page);

                const monitorTypeSelect = page.getByLabel(/monitor type/i);
                await expect.soft(monitorTypeSelect).toBeVisible();

                const monitorTypeValues = await monitorTypeSelect.evaluate(
                    (element) =>
                        Array.from(
                            element.querySelectorAll("option"),
                            (option) => ({
                                label: option.label,
                                value: option.value,
                            })
                        )
                );

                expect.soft(monitorTypeValues.length).toBeGreaterThanOrEqual(5);
                expect
                    .soft(
                        monitorTypeValues.some(
                            (option) => option.value === "http"
                        )
                    )
                    .toBe(true);
                expect
                    .soft(
                        monitorTypeValues.every(
                            (option) => option.label.trim().length > 0
                        )
                    )
                    .toBe(true);
            }
        );

        test.describe("server heartbeat dynamic field validation", () => {
            // Isolated Electron lifecycle event timing on slower machines can
            // cause sporadic failures here; allow two automatic retries before
            // surfacing as a real failure.
            test.describe.configure({ retries: 2 });

            test(
                "should enforce server heartbeat dynamic field validation before creation",
                {
                    tag: ["@validation", "@monitor-types"],
                },
                async () => {
                    test.setTimeout(120_000);
                    const heartbeatSiteName = generateSiteName(
                        "Server Heartbeat Validation"
                    );

                    await test.step("Open modal and submit without heartbeat fields to trigger validation", async () => {
                        await openAddSiteModal(page);
                        await fillAddSiteForm(page, {
                            monitorType: "server-heartbeat",
                            name: heartbeatSiteName,
                        });

                        const heartbeatFieldLabels = [
                            /heartbeat url/i,
                            /status field/i,
                            /expected status/i,
                            /timestamp field/i,
                            /max drift \(seconds\)/i,
                        ];

                        for (const label of heartbeatFieldLabels) {
                            const fieldInput = page.getByLabel(label);
                            // Dynamic fields render asynchronously after the monitor-type
                            // dropdown changes — wait for each field to be visible and
                            // editable before clearing it.
                            await fieldInput.waitFor({
                                state: "visible",
                                timeout: WAIT_TIMEOUTS.MEDIUM,
                            });
                            await expect.soft(fieldInput).toBeEditable({
                                timeout: WAIT_TIMEOUTS.SHORT,
                            });
                            await fieldInput.fill("");
                        }

                        await page.getByTestId("add-site-submit").click();

                        // Invalid submissions should keep the modal open.
                        await expect
                            .soft(page.getByTestId("add-site-modal"))
                            .toBeVisible({
                                timeout: WAIT_TIMEOUTS.MEDIUM,
                            });

                        await expect
                            .soft(page.getByTestId("add-site-form"))
                            .toBeVisible({
                                timeout: WAIT_TIMEOUTS.MEDIUM,
                            });

                        const siteCountAfterInvalid = await page.evaluate(
                            async () => {
                                const automationWindow =
                                    globalThis as typeof globalThis & {
                                        electronAPI?: {
                                            sites?: {
                                                getSites?: () => Promise<unknown>;
                                            };
                                        };
                                    };

                                const response =
                                    await automationWindow.electronAPI?.sites?.getSites?.();
                                return Array.isArray(response)
                                    ? response.length
                                    : 0;
                            }
                        );
                        expect.soft(siteCountAfterInvalid).toBe(0);
                    });

                    await test.step("Fill heartbeat fields and create monitor", async () => {
                        await fillAddSiteForm(page, {
                            dynamicFields: [
                                { label: "Status Field", value: "data.status" },
                                { label: "Expected Status", value: "running" },
                                {
                                    label: "Timestamp Field",
                                    value: "data.timestamp",
                                },
                                { label: "Max Drift (seconds)", value: "60" },
                            ],
                            monitorType: "server-heartbeat",
                            name: heartbeatSiteName,
                            url: "https://heartbeat.example.com/api",
                        });

                        await submitAddSiteForm(page);
                        await waitForMonitorCount(page, 1, WAIT_TIMEOUTS.LONG);
                        await ensureCardLayout(page);

                        const heartbeatSiteCard = getSiteCardLocator(
                            page,
                            heartbeatSiteName
                        );
                        await expect.soft(heartbeatSiteCard).toBeVisible({
                            timeout: WAIT_TIMEOUTS.LONG,
                        });
                    });
                }
            );
        });
    }
);

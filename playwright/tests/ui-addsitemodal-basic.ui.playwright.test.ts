/**
 * Updated Add Site modal regression tests that align with the new UI shell.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { launchElectronApp } from "../fixtures/electron-helpers";
import {
    fillAddSiteForm,
    getSiteCardLocator,
    openAddSiteModal,
    removeAllSites,
    resetApplicationState,
    waitForMonitorCount,
    submitAddSiteForm,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

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
                await expect(dialog).toBeVisible();
                await expect(dialog).toHaveClass(/modal-shell/);

                const dialogClassName = await dialog.evaluate(
                    (element) => element.className
                );
                expect(dialogClassName).toContain(
                    "modal-shell--accent-success"
                );

                const submitButton = dialog.getByRole("button", {
                    name: /Add Site/i,
                });
                const nameInput = dialog.getByLabel("Site Name (required)", {
                    exact: false,
                });
                const nameValue = await nameInput.inputValue();
                console.log(
                    `[Playwright-Test] Site name field pre-submit: ${nameValue ?? "<empty>"}`
                );
                await submitButton.click();

                const validationMessage = page.getByText(
                    "Site name is required"
                );
                await expect(validationMessage).toBeVisible();

                await dialog
                    .getByRole("button", { name: "Close modal" })
                    .click();
                await expect(dialog).toBeHidden();
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

                const siteCardLocator = getSiteCardLocator(page, uniqueName);
                await expect(siteCardLocator).toBeVisible({
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

                const monitorTypeSelect = page.getByLabel(/Monitor Type/i);
                await expect(monitorTypeSelect).toBeVisible();

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

                expect(monitorTypeValues.length).toBeGreaterThanOrEqual(5);
                expect(
                    monitorTypeValues.some((option) => option.value === "http")
                ).toBe(true);
                expect(
                    monitorTypeValues.every(
                        (option) => option.label.trim().length > 0
                    )
                ).toBe(true);
            }
        );

        test(
            "should enforce server heartbeat dynamic field validation before creation",
            {
                tag: ["@validation", "@monitor-types"],
            },
            async () => {
                test.setTimeout(70_000);
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
                        /Heartbeat URL/i,
                        /Status Field/i,
                        /Expected Status/i,
                        /Timestamp Field/i,
                        /Max Drift \(seconds\)/i,
                    ];

                    for (const label of heartbeatFieldLabels) {
                        const fieldInput = page.getByLabel(label);
                        await fieldInput.fill("");
                    }

                    await page.getByTestId("add-site-submit").click();

                    // Invalid submissions should keep the modal open.
                    await expect(
                        page.getByTestId("add-site-modal")
                    ).toBeVisible({
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    });

                    await expect(page.getByTestId("add-site-form")).toBeVisible(
                        {
                            timeout: WAIT_TIMEOUTS.MEDIUM,
                        }
                    );

                    const siteCountAfterInvalid = await page.evaluate(
                        async () => {
                            const automationWindow = window as typeof window & {
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
                    expect(siteCountAfterInvalid).toBe(0);
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

                    const heartbeatSiteCard = getSiteCardLocator(
                        page,
                        heartbeatSiteName
                    );
                    await expect(heartbeatSiteCard).toBeVisible({
                        timeout: WAIT_TIMEOUTS.LONG,
                    });
                });
            }
        );
    }
);

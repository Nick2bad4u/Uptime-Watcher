/**
 * Modern monitor type coverage validating dynamic field rendering and creation
 * workflows across core monitor configurations.
 *
 * @remarks
 * Exercises HTTP, Port, and Ping monitors through the add-site modal using
 * shared helpers to ensure dynamic form fields and monitor switching logic
 * remain stable.
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
    closeSiteDetails,
    createSiteViaModal,
    fillAddSiteForm,
    getAddSiteFormElements,
    openAddSiteModal,
    openSiteDetails,
    removeAllSites,
    submitAddSiteForm,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

test.describe(
    "monitor types - modern ui",
    {
        tag: [
            "@ui",
            "@monitor-types",
            "@regression",
        ],
    },
    () => {
        let electronApp: ElectronApplication;
        let page: Page;

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-monitor-types");
            page = await electronApp.firstWindow();
            await removeAllSites(page);
        });

        test.afterEach(async () => {
            if (page) {
                await removeAllSites(page).catch(() => undefined);
            }
            if (electronApp) {
                await electronApp.close();
            }
        });

        test(
            "should create an HTTP monitor using URL configuration",
            {
                tag: ["@http", "@workflow"],
            },
            async () => {
                const httpSiteName = generateSiteName("HTTP Monitor");
                const httpUrl = `${DEFAULT_TEST_SITE_URL}/status/204`;

                await createSiteViaModal(page, {
                    name: httpSiteName,
                    monitorType: "http",
                    url: httpUrl,
                });

                await openSiteDetails(page, httpSiteName);
                await expect(
                    page.getByText(httpUrl, { exact: false })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
                await closeSiteDetails(page);
            }
        );

        test(
            "should create a Port monitor with host and port fields",
            {
                tag: ["@port", "@workflow"],
            },
            async () => {
                const portSiteName = generateSiteName("Port Monitor");
                const hostValue = "example.com";
                const portValue = "8081";

                await createSiteViaModal(page, {
                    name: portSiteName,
                    monitorType: "port",
                    dynamicFields: [
                        { label: "Host", value: hostValue },
                        { label: "Port", value: portValue },
                    ],
                });

                await openSiteDetails(page, portSiteName);
                await expect(
                    page.getByText(`${hostValue}:${portValue}`)
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
                await closeSiteDetails(page);
            }
        );

        test(
            "should create a Ping monitor with host configuration",
            {
                tag: ["@ping", "@workflow"],
            },
            async () => {
                const pingSiteName = generateSiteName("Ping Monitor");
                const pingHost = "8.8.4.4";

                await createSiteViaModal(page, {
                    name: pingSiteName,
                    monitorType: "ping",
                    dynamicFields: [{ label: "Host", value: pingHost }],
                });

                await openSiteDetails(page, pingSiteName);
                await expect(
                    page.getByText(pingHost, { exact: false })
                ).toBeVisible({ timeout: WAIT_TIMEOUTS.MEDIUM });
                await closeSiteDetails(page);
            }
        );

        test(
            "should update dynamic fields when switching monitor types",
            {
                tag: ["@interaction", "@form"],
            },
            async () => {
                await openAddSiteModal(page);
                const formElements = await getAddSiteFormElements(page);

                const urlField = page.getByLabel(/URL/i).first();
                await expect(urlField).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await formElements.monitorTypeSelect.selectOption("port");
                await expect(page.getByLabel(/Host/i)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(page.getByLabel(/Port/i)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(urlField).toBeHidden({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await formElements.monitorTypeSelect.selectOption("ping");
                await expect(page.getByLabel(/Host/i)).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(page.getByLabel(/Port/i)).toBeHidden({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await formElements.monitorTypeSelect.selectOption("http");
                await expect(urlField).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });

                await fillAddSiteForm(page, {
                    name: generateSiteName("Switching Workflow"),
                    monitorType: "http",
                    url: DEFAULT_TEST_SITE_URL,
                });
                await submitAddSiteForm(page);
            }
        );
    }
);

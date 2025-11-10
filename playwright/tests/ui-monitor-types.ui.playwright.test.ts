/**
 * Modern monitor type coverage validating dynamic field rendering and creation
 * workflows across core monitor configurations.
 *
 * @remarks
 * Exercises every registered monitor type through the add-site modal using
 * shared helpers to ensure dynamic form fields and monitor switching logic
 * remain stable.
 */

import {
    expect,
    test,
    type ElectronApplication,
    type Page,
} from "@playwright/test";
import { BASE_MONITOR_TYPES } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

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
    resetApplicationState,
    submitAddSiteForm,
    WAIT_TIMEOUTS,
} from "../utils/ui-helpers";
import type { DynamicFieldInput } from "../utils/ui-helpers";
import { DEFAULT_TEST_SITE_URL, generateSiteName } from "../utils/testData";

/**
 * Monitor creation metadata derived from the runtime monitor type registry.
 */
interface MonitorCreationScenario {
    readonly dynamicFields: DynamicFieldInput[];
    readonly monitorType: string;
    readonly siteLabel: string;
}

/**
 * Default values injected for monitor-specific dynamic fields during bulk
 * creation coverage.
 */
const DEFAULT_FIELD_VALUES: Record<string, string> = {
    baselineUrl: `${DEFAULT_TEST_SITE_URL}/origin`,
    bodyKeyword: "uptime",
    certificateWarningDays: "30",
    edgeLocations:
        "https://edge1.example.com/status,https://edge2.example.com/status",
    expectedHeaderValue: "application/json",
    expectedJsonValue: "ok",
    expectedStatusCode: "200",
    expectedValue: "93.184.216.34",
    headerName: "content-type",
    heartbeatExpectedStatus: "ok",
    heartbeatMaxDriftSeconds: "60",
    heartbeatStatusField: "data.status",
    heartbeatTimestampField: "data.timestamp",
    host: "status.example.com",
    jsonPath: "$.status",
    maxPongDelayMs: "3000",
    maxReplicationLagSeconds: "45",
    maxResponseTime: "2000",
    port: "443",
    primaryStatusUrl: `${DEFAULT_TEST_SITE_URL}/primary-status`,
    recordType: "A",
    replicaStatusUrl: `${DEFAULT_TEST_SITE_URL}/replica-status`,
    replicationTimestampField: "metrics.replication.timestamp",
    url: `${DEFAULT_TEST_SITE_URL}/health`,
};

/**
 * Monitor-type specific overrides applied on top of {@link DEFAULT_FIELD_VALUES}
 * when specialised data is required.
 */
const FIELD_TYPE_OVERRIDES: Record<string, Partial<Record<string, string>>> = {
    dns: {
        expectedValue: "edge.example.net",
        host: "example.com",
    },
    ping: {
        host: "1.1.1.1",
    },
    port: {
        host: "db.example.com",
        port: "5432",
    },
    "server-heartbeat": {
        url: `${DEFAULT_TEST_SITE_URL}/heartbeat`,
    },
    ssl: {
        host: "secure.example.com",
        port: "443",
    },
    "websocket-keepalive": {
        url: "wss://example.com/socket",
    },
};

/**
 * Resolves the value that should be applied to a specific dynamic field.
 *
 * @param config - Source monitor type configuration.
 * @param fieldName - Dynamic field identifier.
 */
const ensureFieldValue = (
    config: MonitorTypeConfig,
    fieldName: string
): string => {
    const override = FIELD_TYPE_OVERRIDES[config.type]?.[fieldName];
    if (override) {
        return override;
    }

    const defaultValue = DEFAULT_FIELD_VALUES[fieldName];
    if (defaultValue) {
        return defaultValue;
    }

    return `${config.type}-${fieldName}`;
};

/**
 * Resolves the numeric value for a dynamic field based on its constraints.
 */
const deriveNumericValue = (
    field: MonitorTypeConfig["fields"][number]
): string => {
    const fallback = field.min ?? 1;
    const ceiling = field.max ?? fallback;
    if (!Number.isFinite(fallback)) {
        return "1";
    }

    if (Number.isFinite(ceiling) && ceiling < fallback) {
        return String(fallback);
    }

    return String(Math.min(fallback, ceiling));
};

const normalizeFieldValue = (
    config: MonitorTypeConfig,
    field: MonitorTypeConfig["fields"][number]
): string => {
    const candidate = ensureFieldValue(config, field.name).trim();

    if (field.type === "select") {
        const optionValue = field.options?.[0]?.value ?? candidate;
        return optionValue ?? "";
    }

    if (field.type === "number") {
        const numericCandidate = Number.parseFloat(candidate);
        if (Number.isFinite(numericCandidate)) {
            return String(numericCandidate);
        }
        return deriveNumericValue(field);
    }

    if (field.type === "url") {
        if (
            candidate.startsWith("http://") ||
            candidate.startsWith("https://")
        ) {
            return candidate;
        }
        return `${DEFAULT_TEST_SITE_URL}/${field.name}`;
    }

    return candidate.length > 0 ? candidate : `${config.type}-${field.name}`;
};

/**
 * Builds a monitor creation scenario from a runtime configuration definition.
 */
const buildMonitorScenario = (
    config: MonitorTypeConfig
): MonitorCreationScenario => {
    const dynamicFields: DynamicFieldInput[] = config.fields
        .filter((field) => field.required)
        .map((field) => {
            const isSelect = field.type === "select";
            const value = normalizeFieldValue(config, field);

            return {
                inputType: isSelect ? "select" : "text",
                label: field.label,
                value,
            } satisfies DynamicFieldInput;
        });

    return {
        dynamicFields,
        monitorType: config.type,
        siteLabel: config.displayName,
    } satisfies MonitorCreationScenario;
};

/**
 * Normalizes monitor type configuration data returned from the renderer.
 *
 * @param candidate - Raw data returned from the Electron bridge.
 *
 * @returns Strict array of {@link MonitorTypeConfig} entries.
 */
function filterMonitorTypeConfigs(candidate: unknown): MonitorTypeConfig[] {
    if (!Array.isArray(candidate)) {
        return [];
    }

    return candidate.filter(
        (item): item is MonitorTypeConfig =>
            Boolean(item) &&
            typeof (item as MonitorTypeConfig).type === "string" &&
            Array.isArray((item as MonitorTypeConfig).fields)
    );
}

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
        test.setTimeout(240_000);
        let electronApp: ElectronApplication;
        let page: Page;

        // Playwright limits afterEach hooks to ~120s; keep our soft cleanup budget comfortably below that ceiling.
        const SOFT_CLEANUP_TIMEOUT_MS = Math.ceil(
            WAIT_TIMEOUTS.APP_INITIALIZATION * 1.5
        );

        async function runWithSoftTimeout(
            label: string,
            action: () => Promise<void>,
            timeoutMs: number
        ): Promise<void> {
            let timeoutHandle: NodeJS.Timeout | undefined;

            const completion = action()
                .then<"completed">(() => "completed")
                .catch((error) => {
                    console.warn(
                        `[Playwright] ${label} failed during cleanup`,
                        error
                    );
                    return "failed";
                });

            void completion;

            const timeoutOutcome = new Promise<"timeout">((resolve) => {
                timeoutHandle = setTimeout(() => resolve("timeout"), timeoutMs);
            });

            const outcome = await Promise.race([completion, timeoutOutcome]);

            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }

            if (outcome === "timeout") {
                console.warn(
                    `[Playwright] ${label} exceeded ${timeoutMs}ms; continuing without waiting for completion`
                );
            }
        }

        test.beforeEach(async () => {
            electronApp = await launchElectronApp();
            tagElectronAppCoverage(electronApp, "ui-monitor-types");
            page = await electronApp.firstWindow();
            await resetApplicationState(page);
        });

        test.afterEach(async () => {
            const pageReference = page as Page | undefined;
            const electronReference = electronApp as
                | ElectronApplication
                | undefined;

            await runWithSoftTimeout(
                "removeAllSites cleanup",
                async () => {
                    if (!pageReference || pageReference.isClosed()) {
                        return;
                    }

                    await removeAllSites(pageReference);
                },
                SOFT_CLEANUP_TIMEOUT_MS
            );

            await runWithSoftTimeout(
                "Electron application close",
                async () => {
                    if (!electronReference) {
                        return;
                    }

                    await electronReference.close();
                },
                SOFT_CLEANUP_TIMEOUT_MS
            );
        });

        test(
            "should create monitors for every supported type",
            {
                tag: ["@workflow", "@all-monitor-types"],
            },
            async () => {
                const monitorConfigs = (await page.evaluate(async () => {
                    const scopedWindow = window as typeof window & {
                        electronAPI?: {
                            monitorTypes?: {
                                getMonitorTypes?: () => Promise<
                                    MonitorTypeConfig[]
                                >;
                            };
                        };
                    };

                    const requestMonitorTypes =
                        scopedWindow.electronAPI?.monitorTypes?.getMonitorTypes;

                    return typeof requestMonitorTypes === "function"
                        ? await requestMonitorTypes()
                        : ([] as MonitorTypeConfig[]);
                })) as unknown;

                const typedConfigs = filterMonitorTypeConfigs(monitorConfigs);

                expect(typedConfigs.length).toBeGreaterThan(0);

                const actualTypes = Array.from(
                    new Set(
                        typedConfigs
                            .map((config) => config.type)
                            .filter(
                                (type): type is string =>
                                    typeof type === "string" && type.length > 0
                            )
                    )
                ).sort((first, second) => first.localeCompare(second));

                const expectedTypes = Array.from(BASE_MONITOR_TYPES).sort(
                    (first, second) => first.localeCompare(second)
                );

                expect(actualTypes).toStrictEqual(expectedTypes);

                const scenarios = typedConfigs
                    .map(buildMonitorScenario)
                    .sort((first, second) =>
                        first.monitorType.localeCompare(second.monitorType)
                    );

                expect(scenarios).toHaveLength(expectedTypes.length);

                const createdSiteNames: string[] = [];

                for (const scenario of scenarios) {
                    const siteName = generateSiteName(
                        `${scenario.siteLabel} Coverage`
                    );
                    createdSiteNames.push(siteName);

                    await test.step(`create monitor type: ${scenario.monitorType}`, async () => {
                        await createSiteViaModal(page, {
                            dynamicFields: scenario.dynamicFields,
                            monitorType: scenario.monitorType,
                            name: siteName,
                        });
                    });
                }

                const expectedSiteCount = scenarios.length;
                const siteCountLabel = page.getByTestId("site-count-label");
                await expect(siteCountLabel).toHaveText(
                    new RegExp(`Tracking ${expectedSiteCount} sites?`)
                );

                // Open one of the created sites to ensure details render after bulk creation.
                expect(
                    createdSiteNames.length,
                    "expected at least one created site"
                ).toBeGreaterThan(0);
                const lastSite = createdSiteNames[createdSiteNames.length - 1]!;
                await openSiteDetails(page, lastSite);
                await expect(page.getByTestId("site-overview-tab")).toBeVisible(
                    {
                        timeout: WAIT_TIMEOUTS.MEDIUM,
                    }
                );
                await closeSiteDetails(page);
            }
        );

        test(
            "should create an HTTP monitor using URL configuration",
            {
                tag: ["@http", "@workflow"],
            },
            async () => {
                const httpSiteName = generateSiteName("HTTP Monitor");
                const httpUrl = `${DEFAULT_TEST_SITE_URL}/status/204`;
                const httpHost = new URL(httpUrl).hostname;

                await createSiteViaModal(page, {
                    name: httpSiteName,
                    monitorType: "http",
                    url: httpUrl,
                });

                await openSiteDetails(page, httpSiteName);
                const siteOverviewTab = page.getByTestId("site-overview-tab");
                await expect(siteOverviewTab).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    siteOverviewTab.getByText(httpHost, { exact: false })
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
                const siteOverviewTab = page.getByTestId("site-overview-tab");
                await expect(siteOverviewTab).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    siteOverviewTab.getByText(`${hostValue}:${portValue}`, {
                        exact: false,
                    })
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
                const siteOverviewTab = page.getByTestId("site-overview-tab");
                await expect(siteOverviewTab).toBeVisible({
                    timeout: WAIT_TIMEOUTS.MEDIUM,
                });
                await expect(
                    siteOverviewTab.getByText(pingHost, { exact: false })
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

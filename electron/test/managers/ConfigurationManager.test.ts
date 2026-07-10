/**
 * @file Comprehensive tests for ConfigurationManager with 100% branch coverage
 */

import type { Monitor, Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ValidationResult } from "../../managers/validators/interfaces";

import * as electronUtils from "../../electronUtils";
import { ConfigurationManager } from "../../managers/ConfigurationManager";
import { MonitorValidator } from "../../managers/validators/MonitorValidator";
import { SiteValidator } from "../../managers/validators/SiteValidator";

// Mock the electron utils
vi.mock("../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

const { monitorValidatorMockInstance, siteValidatorMockInstance } = vi.hoisted(
    () => ({
        monitorValidatorMockInstance: {
            shouldApplyDefaultInterval:
                vi.fn<MonitorValidator["shouldApplyDefaultInterval"]>(),
            validateMonitorConfiguration:
                vi.fn<MonitorValidator["validateMonitorConfiguration"]>(),
        },
        siteValidatorMockInstance: {
            shouldIncludeInExport:
                vi.fn<SiteValidator["shouldIncludeInExport"]>(),
            validateSiteConfiguration:
                vi.fn<SiteValidator["validateSiteConfiguration"]>(),
        },
    })
);

vi.mock("../../managers/validators/MonitorValidator", () => ({
    MonitorValidator: vi.fn(function MonitorValidatorMock() {
        return monitorValidatorMockInstance;
    }),
}));

vi.mock("../../managers/validators/SiteValidator", () => ({
    SiteValidator: vi.fn(function SiteValidatorMock() {
        return siteValidatorMockInstance;
    }),
}));

/**
 * Helper function to create a mock monitor
 */
function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "test-monitor",
        type: "http",
        monitoring: true,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: 0,
        status: "pending",
        history: [],
        url: "https://example.com",
        ...overrides,
    };
}

/**
 * Helper function to create a mock site
 */
function createMockSite(overrides: Partial<Site> = {}): Site {
    return {
        identifier: "test-site",
        name: "Test Site",
        monitoring: true,
        monitors: [createMockMonitor()],
        ...overrides,
    };
}

interface NullValuedMonitorFields {
    host: null;
    lastChecked: null;
    port: null;
    url: null;
}

type NullValuedMonitorFixture = NullValuedMonitorFields &
    Omit<Monitor, keyof NullValuedMonitorFields>;

function hasNullValuedMonitorFields(
    value: unknown
): value is NullValuedMonitorFields {
    return (
        typeof value === "object" &&
        value !== null &&
        "host" in value &&
        value.host === null &&
        "lastChecked" in value &&
        value.lastChecked === null &&
        "port" in value &&
        value.port === null &&
        "url" in value &&
        value.url === null
    );
}

describe(ConfigurationManager, () => {
    let configManager: ConfigurationManager;
    let mockMonitorValidator: typeof monitorValidatorMockInstance;
    let mockSiteValidator: typeof siteValidatorMockInstance;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock instances
        mockMonitorValidator = monitorValidatorMockInstance;
        mockSiteValidator = siteValidatorMockInstance;

        vi.mocked(electronUtils.isDev).mockReturnValue(false);

        mockMonitorValidator.shouldApplyDefaultInterval.mockReset();
        mockMonitorValidator.validateMonitorConfiguration.mockReset();
        mockMonitorValidator.shouldApplyDefaultInterval.mockReturnValue(true);
        mockMonitorValidator.validateMonitorConfiguration.mockReturnValue({
            success: true,
            errors: [],
        });

        mockSiteValidator.shouldIncludeInExport.mockReset();
        mockSiteValidator.validateSiteConfiguration.mockReset();
        mockSiteValidator.shouldIncludeInExport.mockReturnValue(true);
        mockSiteValidator.validateSiteConfiguration.mockReturnValue({
            success: true,
            errors: [],
        });

        configManager = new ConfigurationManager();
    });

    describe("Constructor", () => {
        it("should initialize with validators and caches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Initialization", "type");

            expect(MonitorValidator).toHaveBeenCalledTimes(1);
            expect(SiteValidator).toHaveBeenCalledTimes(1);
            expect(configManager).toBeInstanceOf(ConfigurationManager);
        });
    });

    describe("clearValidationCache", () => {
        it("should clear the validation cache", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            // The cache is private, so we just test that the method executes without error
            expect(() => {
                configManager.clearValidationCache();
            }).not.toThrow();
        });
    });

    describe("getCacheStats", () => {
        it("should return cache statistics", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            const stats = configManager.getCacheStats();

            expect(stats).toHaveProperty("configuration");
            expect(stats).toHaveProperty("validation");
            expect(stats.configuration).toHaveProperty("hits");
            expect(stats.configuration).toHaveProperty("misses");
            expect(stats.validation).toHaveProperty("hits");
            expect(stats.validation).toHaveProperty("misses");
        });
    });

    describe("getDefaultMonitorInterval", () => {
        it("should return the default monitor interval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const interval = configManager.getDefaultMonitorInterval();
            expect(typeof interval).toBe("number");
            expect(interval).toBeGreaterThan(0);
        });
    });

    describe("getHistoryRetentionRules", () => {
        it("should return history retention configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const rules = configManager.getHistoryRetentionRules();

            expect(rules).toHaveProperty("defaultLimit");
            expect(rules).toHaveProperty("maxLimit");
            expect(rules).toHaveProperty("minLimit");
            expect(typeof rules.defaultLimit).toBe("number");
            expect(typeof rules.maxLimit).toBe("number");
            expect(typeof rules.minLimit).toBe("number");
            expect(rules.maxLimit).toBeGreaterThan(rules.defaultLimit);
            expect(rules.defaultLimit).toBeGreaterThan(rules.minLimit);
            expect(rules.minLimit).toBe(25);
            expect(rules.maxLimit).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe("getMaximumPortNumber", () => {
        it("should return the maximum port number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const maxPort = configManager.getMaximumPortNumber();
            expect(maxPort).toBe(65_535);
        });
    });

    describe("getMinimumCheckInterval", () => {
        it("should return the minimum check interval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const minInterval = configManager.getMinimumCheckInterval();
            expect(minInterval).toBe(5000);
        });
    });

    describe("getMinimumTimeout", () => {
        it("should return the minimum timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const minTimeout = configManager.getMinimumTimeout();
            expect(minTimeout).toBe(1000);
        });
    });

    describe("shouldApplyDefaultInterval", () => {
        it("should delegate to monitor validator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor();
            mockMonitorValidator.shouldApplyDefaultInterval.mockReturnValue(
                true
            );

            const isResult = configManager.shouldApplyDefaultInterval(monitor);

            expect(
                mockMonitorValidator.shouldApplyDefaultInterval
            ).toHaveBeenCalledWith(monitor);
            expect(isResult).toBeTruthy();
        });

        it("should return false when monitor validator returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor();
            mockMonitorValidator.shouldApplyDefaultInterval.mockReturnValue(
                false
            );

            const isResult = configManager.shouldApplyDefaultInterval(monitor);

            expect(isResult).toBeFalsy();
        });
    });

    describe("shouldAutoStartMonitoring", () => {
        beforeEach(() => {
            // Reset isDev mock to return false by default
            vi.mocked(electronUtils.isDev).mockReturnValue(false);
        });

        it("should return false in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(electronUtils.isDev).mockReturnValue(true);
            const site = createMockSite({ monitoring: true });

            const isResult = configManager.shouldAutoStartMonitoring(site);

            expect(isResult).toBeFalsy();
        });

        it("should return false for sites without monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({ monitors: [], monitoring: true });

            const isResult = configManager.shouldAutoStartMonitoring(site);

            expect(isResult).toBeFalsy();
        });

        it("should return false when site monitoring is disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({ monitoring: false });

            const isResult = configManager.shouldAutoStartMonitoring(site);

            expect(isResult).toBeFalsy();
        });

        it("should return true when conditions are met", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site = createMockSite({ monitoring: true });

            const isResult = configManager.shouldAutoStartMonitoring(site);

            expect(isResult).toBeTruthy();
        });

        it("should handle site with multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({
                monitoring: true,
                monitors: [
                    createMockMonitor(),
                    createMockMonitor({ id: "monitor-2" }),
                ],
            });

            const isResult = configManager.shouldAutoStartMonitoring(site);

            expect(isResult).toBeTruthy();
        });
    });

    describe("shouldIncludeInExport", () => {
        it("should delegate to site validator", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site = createMockSite();
            mockSiteValidator.shouldIncludeInExport.mockReturnValue(true);

            const isResult = configManager.shouldIncludeInExport(site);

            expect(
                mockSiteValidator.shouldIncludeInExport
            ).toHaveBeenCalledWith(site);
            expect(isResult).toBeTruthy();
        });

        it("should return false when site validator returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site = createMockSite();
            mockSiteValidator.shouldIncludeInExport.mockReturnValue(false);

            const isResult = configManager.shouldIncludeInExport(site);

            expect(isResult).toBeFalsy();
        });
    });

    describe("validateMonitorConfiguration", () => {
        it("should validate monitor and cache result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            const monitor = createMockMonitor();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateMonitorConfiguration(monitor);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledWith(monitor);
            expect(result).toEqual(expectedResult);
        });

        it("should return cached result on second call", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            const monitor = createMockMonitor();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            // First call
            const result1 =
                await configManager.validateMonitorConfiguration(monitor);
            // Second call with same monitor
            const result2 =
                await configManager.validateMonitorConfiguration(monitor);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(expectedResult);
            expect(result2).toEqual(expectedResult);
        });

        it("should validate monitors separately when type-specific fields differ", async () => {
            const monitor1 = createMockMonitor({
                expectedStatusCode: 200,
                type: "http-status",
            });
            const monitor2 = createMockMonitor({
                expectedStatusCode: 500,
                type: "http-status",
            });
            const result1: ValidationResult = { success: true, errors: [] };
            const result2: ValidationResult = {
                success: false,
                errors: ["Expected status code is invalid"],
            };

            mockMonitorValidator.validateMonitorConfiguration
                .mockReturnValueOnce(result1)
                .mockReturnValueOnce(result2);

            await expect(
                configManager.validateMonitorConfiguration(monitor1)
            ).resolves.toEqual(result1);
            await expect(
                configManager.validateMonitorConfiguration(monitor2)
            ).resolves.toEqual(result2);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(2);
        });

        it("should validate monitors separately when prototype-named metadata differs", async () => {
            const monitor1 = createMockMonitor();
            const monitor2 = createMockMonitor();
            const result1: ValidationResult = { success: true, errors: [] };
            const result2: ValidationResult = {
                success: false,
                errors: ["Prototype metadata differs"],
            };

            Object.defineProperty(monitor1, "__proto__", {
                configurable: true,
                enumerable: true,
                value: "first",
                writable: true,
            });
            Object.defineProperty(monitor2, "__proto__", {
                configurable: true,
                enumerable: true,
                value: "second",
                writable: true,
            });

            mockMonitorValidator.validateMonitorConfiguration
                .mockReturnValueOnce(result1)
                .mockReturnValueOnce(result2);

            await expect(
                configManager.validateMonitorConfiguration(monitor1)
            ).resolves.toEqual(result1);
            await expect(
                configManager.validateMonitorConfiguration(monitor2)
            ).resolves.toEqual(result2);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(2);
        });

        it("should validate monitors with cyclic own data instead of failing cache key generation", async () => {
            const monitor = createMockMonitor() as Monitor & {
                self?: unknown;
            };
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };

            monitor.self = monitor;
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            await expect(
                configManager.validateMonitorConfiguration(monitor)
            ).resolves.toEqual(expectedResult);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledWith(monitor);
        });

        it("should return cached monitor validation results without exposing cached errors", async () => {
            const monitor = createMockMonitor();
            const expectedResult: ValidationResult = {
                success: false,
                errors: ["Initial error"],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result1 =
                await configManager.validateMonitorConfiguration(monitor);
            (result1.errors as string[]).push("Caller mutation");

            const result2 =
                await configManager.validateMonitorConfiguration(monitor);

            expect(result2).toEqual(expectedResult);
            expect(result2.errors).toEqual(["Initial error"]);
            expect(result2.errors).not.toBe(result1.errors);
            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(1);
        });

        it("should validate different monitors separately", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            const monitor1 = createMockMonitor({ id: "monitor-1" });
            const monitor2 = createMockMonitor({ id: "monitor-2" });
            const result1: ValidationResult = { success: true, errors: [] };
            const result2: ValidationResult = {
                success: false,
                errors: ["error"],
            };

            mockMonitorValidator.validateMonitorConfiguration
                .mockReturnValueOnce(result1)
                .mockReturnValueOnce(result2);

            const actualResult1 =
                await configManager.validateMonitorConfiguration(monitor1);
            const actualResult2 =
                await configManager.validateMonitorConfiguration(monitor2);

            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(2);
            expect(actualResult1).toEqual(result1);
            expect(actualResult2).toEqual(result2);
        });

        it("should handle monitors with undefined optional properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                // Optional properties are omitted to test undefined handling
            });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateMonitorConfiguration(monitor);

            expect(result).toEqual(expectedResult);
        });

        it("should handle monitors with lastChecked date", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const lastChecked = new Date("2023-01-01T00:00:00Z");
            const monitor = createMockMonitor({ lastChecked });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateMonitorConfiguration(monitor);

            expect(result).toEqual(expectedResult);
        });

        it("should not invoke shadowed Date methods when building validation cache keys", async () => {
            const lastChecked = new Date("2023-01-01T00:00:00Z");
            const getTime = vi.fn(() => {
                throw new Error("date getTime should not run");
            });
            Object.defineProperty(lastChecked, "getTime", {
                value: getTime,
            });
            const monitor = createMockMonitor({ lastChecked });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            await expect(
                configManager.validateMonitorConfiguration(monitor)
            ).resolves.toEqual(expectedResult);
            await expect(
                configManager.validateMonitorConfiguration(monitor)
            ).resolves.toEqual(expectedResult);

            expect(getTime).not.toHaveBeenCalled();
            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle monitors with null values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const malformedMonitor: unknown = {
                ...createMockMonitor(),
                host: null,
                lastChecked: null,
                port: null,
                url: null,
            } satisfies NullValuedMonitorFixture;
            if (!hasNullValuedMonitorFields(malformedMonitor)) {
                throw new TypeError("Expected a null-valued monitor fixture");
            }
            const monitor = malformedMonitor as unknown as Monitor;

            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateMonitorConfiguration(monitor);

            expect(result).toEqual(expectedResult);
        });

        it("should handle port monitors with host and port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                type: "port",
                host: "example.com",
                port: 80,
                // URL is omitted since it's not needed for port monitors
            });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateMonitorConfiguration(monitor);

            expect(result).toEqual(expectedResult);
        });
    });

    describe("validateSiteConfiguration", () => {
        it("should validate site and cache result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            const site = createMockSite();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result = await configManager.validateSiteConfiguration(site);

            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledWith(site);
            expect(result).toEqual(expectedResult);
        });

        it("should return cached result on second call", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            const site = createMockSite();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            // First call
            const result1 = await configManager.validateSiteConfiguration(site);
            // Second call with same site
            const result2 = await configManager.validateSiteConfiguration(site);

            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledTimes(1);
            expect(result1).toEqual(expectedResult);
            expect(result2).toEqual(expectedResult);
        });

        it("should validate sites separately when monitor content differs", async () => {
            const site1 = createMockSite({
                monitors: [createMockMonitor({ expectedStatusCode: 200 })],
            });
            const site2 = createMockSite({
                monitors: [createMockMonitor({ expectedStatusCode: 500 })],
            });
            const result1: ValidationResult = { success: true, errors: [] };
            const result2: ValidationResult = {
                success: false,
                errors: ["Monitor 1: Expected status code is invalid"],
            };

            mockSiteValidator.validateSiteConfiguration
                .mockReturnValueOnce(result1)
                .mockReturnValueOnce(result2);

            await expect(
                configManager.validateSiteConfiguration(site1)
            ).resolves.toEqual(result1);
            await expect(
                configManager.validateSiteConfiguration(site2)
            ).resolves.toEqual(result2);

            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledTimes(2);
        });

        it("should validate sites with cyclic own data instead of failing cache key generation", async () => {
            const site = createMockSite() as Site & {
                self?: unknown;
            };
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };

            site.self = site;
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            await expect(
                configManager.validateSiteConfiguration(site)
            ).resolves.toEqual(expectedResult);

            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledWith(site);
        });

        it("should return cached site validation results without exposing cached errors", async () => {
            const site = createMockSite();
            const expectedResult: ValidationResult = {
                success: false,
                errors: ["Initial site error"],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result1 = await configManager.validateSiteConfiguration(site);
            (result1.errors as string[]).push("Caller mutation");

            const result2 = await configManager.validateSiteConfiguration(site);

            expect(result2).toEqual(expectedResult);
            expect(result2.errors).toEqual(["Initial site error"]);
            expect(result2.errors).not.toBe(result1.errors);
            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledTimes(1);
        });

        it("should validate different sites separately", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            const site1 = createMockSite({ identifier: "site-1" });
            const site2 = createMockSite({ identifier: "site-2" });
            const result1: ValidationResult = { success: true, errors: [] };
            const result2: ValidationResult = {
                success: false,
                errors: ["error"],
            };

            mockSiteValidator.validateSiteConfiguration
                .mockReturnValueOnce(result1)
                .mockReturnValueOnce(result2);

            const actualResult1 =
                await configManager.validateSiteConfiguration(site1);
            const actualResult2 =
                await configManager.validateSiteConfiguration(site2);

            expect(
                mockSiteValidator.validateSiteConfiguration
            ).toHaveBeenCalledTimes(2);
            expect(actualResult1).toEqual(result1);
            expect(actualResult2).toEqual(result2);
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({ monitors: [] });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result = await configManager.validateSiteConfiguration(site);

            expect(result).toEqual(expectedResult);
        });

        it("should handle sites with multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({
                monitors: [
                    createMockMonitor({ id: "monitor-1" }),
                    createMockMonitor({ id: "monitor-2" }),
                    createMockMonitor({ id: "monitor-3" }),
                ],
            });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result = await configManager.validateSiteConfiguration(site);

            expect(result).toEqual(expectedResult);
        });

        it("should handle sites with monitoring disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite({ monitoring: false });
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result = await configManager.validateSiteConfiguration(site);

            expect(result).toEqual(expectedResult);
        });
    });

    describe("Cache behavior", () => {
        it("should use cache after clearing and re-validating", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            const monitor = createMockMonitor();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            // First validation
            await configManager.validateMonitorConfiguration(monitor);
            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(1);

            // Clear cache
            configManager.clearValidationCache();

            // Second validation after cache clear
            await configManager.validateMonitorConfiguration(monitor);
            expect(
                mockMonitorValidator.validateMonitorConfiguration
            ).toHaveBeenCalledTimes(2);
        });

        it("should track cache statistics correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Caching", "type");

            const monitor = createMockMonitor();
            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockMonitorValidator.validateMonitorConfiguration.mockReturnValue(
                expectedResult
            );

            const initialStats = configManager.getCacheStats();
            expect(initialStats.validation.hits).toBe(0);
            expect(initialStats.validation.misses).toBe(0);

            // First call - should be a cache miss
            await configManager.validateMonitorConfiguration(monitor);
            const afterMissStats = configManager.getCacheStats();
            expect(afterMissStats.validation.misses).toBeGreaterThan(
                initialStats.validation.misses
            );

            // Second call - should be a cache hit
            await configManager.validateMonitorConfiguration(monitor);
            const afterHitStats = configManager.getCacheStats();
            expect(afterHitStats.validation.hits).toBeGreaterThan(
                afterMissStats.validation.hits
            );
        });
    });

    describe("Error handling", () => {
        it("should handle validator errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = createMockMonitor();
            const error = new Error("Validation error");
            mockMonitorValidator.validateMonitorConfiguration.mockImplementation(
                () => {
                    throw error;
                }
            );

            await expect(
                configManager.validateMonitorConfiguration(monitor)
            ).rejects.toThrow("Validation error");
        });

        it("should handle site validator errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const site = createMockSite();
            const error = new Error("Site validation error");
            mockSiteValidator.validateSiteConfiguration.mockImplementation(
                () => {
                    throw error;
                }
            );

            await expect(
                configManager.validateSiteConfiguration(site)
            ).rejects.toThrow("Site validation error");
        });
    });

    describe("Complex scenarios", () => {
        it("should handle development mode with multiple conditions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(electronUtils.isDev).mockReturnValue(true);

            // Even with valid site conditions, should return false in dev mode
            const siteWithMonitors = createMockSite({ monitoring: true });
            const siteWithoutMonitors = createMockSite({
                monitors: [],
                monitoring: true,
            });
            const siteDisabled = createMockSite({ monitoring: false });

            expect(
                configManager.shouldAutoStartMonitoring(siteWithMonitors)
            ).toBeFalsy();
            expect(
                configManager.shouldAutoStartMonitoring(siteWithoutMonitors)
            ).toBeFalsy();
            expect(
                configManager.shouldAutoStartMonitoring(siteDisabled)
            ).toBeFalsy();
        });

        it("should handle sites with complex monitor configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ConfigurationManager", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const complexSite = createMockSite({
                identifier: "complex-site",
                name: "Complex Test Site",
                monitoring: true,
                monitors: [
                    createMockMonitor({
                        id: "http-monitor",
                        type: "http",
                        url: "https://api.example.com",
                        checkInterval: 60_000,
                        timeout: 10_000,
                    }),
                    createMockMonitor({
                        id: "port-monitor",
                        type: "port",
                        host: "database.example.com",
                        port: 5432,
                        checkInterval: 30_000,
                        timeout: 5000,
                    }),
                ],
            });

            const expectedResult: ValidationResult = {
                success: true,
                errors: [],
            };
            mockSiteValidator.validateSiteConfiguration.mockReturnValue(
                expectedResult
            );

            const result =
                await configManager.validateSiteConfiguration(complexSite);
            expect(result).toEqual(expectedResult);

            // Verify that complex sites can be auto-started
            expect(
                configManager.shouldAutoStartMonitoring(complexSite)
            ).toBeTruthy();

            // Verify that complex sites can be included in export
            expect(
                configManager.shouldIncludeInExport(complexSite)
            ).toBeTruthy();
        });
    });
});

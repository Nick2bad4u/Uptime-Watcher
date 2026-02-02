/**
 * @file Tests for monitorTypeHelper utility functions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

import { AppCaches } from "../../utils/cache";
import * as errorHandling from "@shared/utils/errorHandling";
import {
    BASE_MONITOR_TYPES,
    type MonitorFieldDefinition,
    type MonitorType,
} from "@shared/types";
import {
    clearMonitorTypeCache,
    getAvailableMonitorTypes,
    getMonitorTypeConfig,
    getMonitorTypeOptions,
} from "../../utils/monitorTypeHelper";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import { installElectronApiMock } from "./electronApiMock";

// Mock the monitor types store
const mockMonitorTypesStore = {
    monitorTypes: [] as MonitorTypeConfig[],
    isLoaded: false,
    loadMonitorTypes: vi.fn(),
};

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: vi.fn(() => mockMonitorTypesStore),
    },
}));

// Mock dependencies
vi.mock("../../utils/cache", () => ({
    AppCaches: {
        monitorTypes: {
            get: vi.fn(),
            set: vi.fn(),
            clear: vi.fn(),
        },
    },
    getCachedOrFetch: vi.fn(async (cache, key, fetcher) => {
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        const value = await fetcher();
        cache.set(key, value);
        return value;
    }),
}));

vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: vi.fn(),
    convertError: vi.fn(),
    withErrorHandling: vi.fn(),
    withUtilityErrorHandling: vi.fn(),
}));

const getMonitorTypesMock = vi.fn();

let restoreElectronApi: (() => void) | undefined;

describe("monitorTypeHelper", () => {
    beforeEach(() => {
        getMonitorTypesMock.mockReset();
        ({ restore: restoreElectronApi } = installElectronApiMock({
            monitorTypes: {
                getMonitorTypes: getMonitorTypesMock,
            },
        }));
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
    });

    const mockMonitorTypes: MonitorTypeConfig[] = [
        {
            type: "http",
            displayName: "HTTP Monitor",
            description: "Monitors HTTP endpoints",
            version: "1.0.0",
            fields: [
                {
                    name: "url",
                    type: "text",
                    required: true,
                    label: "URL",
                    placeholder: "https://example.com",
                },
            ],
            uiConfig: {
                display: {
                    showUrl: true,
                    showAdvancedMetrics: true,
                },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: true,
                helpTexts: {
                    primary: "Enter the URL to monitor",
                    secondary: "Must be a valid HTTP/HTTPS URL",
                },
                detailFormats: {
                    analyticsLabel: "HTTP: {url}",
                },
            },
        },
        {
            type: "ping",
            displayName: "Ping Monitor",
            description: "Monitors server connectivity via ping",
            version: "1.0.0",
            fields: [
                {
                    name: "host",
                    type: "text",
                    required: true,
                    label: "Host",
                    placeholder: "example.com",
                },
            ],
            uiConfig: {
                display: {
                    showUrl: false,
                    showAdvancedMetrics: false,
                },
                supportsResponseTime: true,
                supportsAdvancedAnalytics: false,
                helpTexts: {
                    primary: "Enter hostname or IP address",
                },
            },
        },
        {
            type: "port",
            displayName: "TCP Monitor",
            description: "Monitors TCP port connectivity",
            version: "1.0.0",
            fields: [
                {
                    name: "host",
                    type: "text",
                    required: true,
                    label: "Host",
                    placeholder: "example.com",
                },
                {
                    name: "port",
                    type: "number",
                    required: true,
                    label: "Port",
                    placeholder: "80",
                },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock store state
        mockMonitorTypesStore.monitorTypes = [];
        mockMonitorTypesStore.isLoaded = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe(clearMonitorTypeCache, () => {
        it("should call cache clear method", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
        });

        it("should clear cache when called multiple times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            clearMonitorTypeCache();
            clearMonitorTypeCache();
            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(3);
        });
    });

    describe(getAvailableMonitorTypes, () => {
        it("should return cached data when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith(
                "config:all-monitor-types"
            );
            expect(getMonitorTypesMock).not.toHaveBeenCalled();
        });

        it("should fetch from backend when cache is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
            expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith(
                "config:all-monitor-types"
            );
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                mockMonitorTypes
            );
        });

        it("should handle backend fetch errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const fallbackValue: MonitorTypeConfig[] = [];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                fallbackValue
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                fallbackValue
            );
        });

        it("should cache fetched data for subsequent calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            await getAvailableMonitorTypes();

            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                mockMonitorTypes
            );
        });

        it("should handle empty response from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            // Configure the mock store to return empty data
            mockMonitorTypesStore.monitorTypes = [];
            mockMonitorTypesStore.isLoaded = true;

            getMonitorTypesMock.mockResolvedValue([]);

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual([]);
            expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
                "config:all-monitor-types",
                []
            );
        });

        it("should handle invalid cache data gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(null);

            // Configure mock store to return the expected monitor types
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(mockMonitorTypes);
        });
    });

    describe(getMonitorTypeConfig, () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );
        });

        it("should return config for existing monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("http");

            expect(result).toEqual(mockMonitorTypes[0]);
        });

        it("should return config for different monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const pingResult = await getMonitorTypeConfig("ping");
                const tcpResult = await getMonitorTypeConfig("port");

            expect(pingResult).toEqual(mockMonitorTypes[1]);
            expect(tcpResult).toEqual(mockMonitorTypes[2]);
        });

        it("should return undefined for non-existent monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("nonexistent");

            expect(result).toBeUndefined();
        });

        it("should return undefined for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("");

            expect(result).toBeUndefined();
        });

        it("should handle case-sensitive type matching", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("HTTP");

            expect(result).toBeUndefined();
        });

        it("should work with whitespace in type names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig(" http ");

            expect(result).toBeUndefined();
        });

        it("should handle special characters in type names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("http-monitor");

            expect(result).toBeUndefined();
        });

        it("should return undefined when monitor types list is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeConfig("http");

            expect(result).toBeUndefined();
        });
    });

    describe(getMonitorTypeOptions, () => {
        beforeEach(() => {
            // Mock getAvailableMonitorTypes by directly mocking the cache
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                mockMonitorTypes
            );
        });

        it("should return options array for all monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor", value: "http" },
                { label: "Ping Monitor", value: "ping" },
                    { label: "TCP Monitor", value: "port" },
            ]);
        });

        it("should return empty array when no monitor types available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([]);
        });

        it("should handle monitor types with complex display names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const complexTypes: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP Monitor (Advanced)",
                    description: "Advanced HTTP monitoring",
                    version: "2.0.0",
                    fields: mockMonitorTypes[0]!.fields,
                },
                {
                    type: "ping",
                    displayName: "Custom Ping Service",
                    description: "Custom ping implementation",
                    version: "1.1.0",
                    fields: mockMonitorTypes[1]!.fields,
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(complexTypes);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor (Advanced)", value: "http" },
                { label: "Custom Ping Service", value: "ping" },
            ]);

            expect(getMonitorTypesMock).not.toHaveBeenCalled();
        });

        it("should preserve order of monitor types from backend", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const reversedTypes = [...mockMonitorTypes].toReversed();
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                reversedTypes
            );

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "TCP Monitor", value: "port" },
                { label: "Ping Monitor", value: "ping" },
                { label: "HTTP Monitor", value: "http" },
            ]);
        });

        it("should handle monitor types with empty display names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            // Empty display names violate the shared MonitorTypeConfig runtime
            // guard (isMonitorTypeConfig). When encountered in cache, the helper
            // should treat the cached value as invalid, clear the cache, and
            // fall back to the monitor types store.
            const invalidCachedTypes: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "",
                    description: "Monitor with empty display name",
                    version: "1.0.0",
                    fields: mockMonitorTypes[0]!.fields,
                },
                {
                    type: "ping",
                    displayName: "Normal Monitor",
                    description: "Normal monitor",
                    version: "1.0.0",
                    fields: mockMonitorTypes[0]!.fields,
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                invalidCachedTypes
            );

            // Configure mock store to return the expected monitor types.
            mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
            mockMonitorTypesStore.isLoaded = true;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            const result = await getMonitorTypeOptions();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
            expect(result).toEqual([
                { label: "HTTP Monitor", value: "http" },
                { label: "Ping Monitor", value: "ping" },
                { label: "TCP Monitor", value: "port" },
            ]);
        });

        it("should handle monitor types with special characters in names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const specialTypes: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "Monitor (v2.0) - Advanced & Fast",
                    description: "Special monitor",
                    version: "2.0.0",
                    fields: mockMonitorTypes[0]!.fields,
                },
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(specialTypes);

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "Monitor (v2.0) - Advanced & Fast", value: "http" },
            ]);
        });
    });

    describe("error handling integration", () => {
        it("should pass correct parameters to withUtilityErrorHandling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                []
            );

            await getAvailableMonitorTypes();

            expect(errorHandling.withUtilityErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                "Fetch monitor types from backend",
                []
            );
        });

        it("should use fallback value from error handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const fallbackValue = [mockMonitorTypes[0]];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                fallbackValue
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
        });
    });

    describe("Store integration", () => {
        it("should use monitor types store correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

            // Configure mock store to simulate unloaded state initially
            mockMonitorTypesStore.monitorTypes = [];
            mockMonitorTypesStore.isLoaded = false;

            const loadMonitorTypesMock = vi.fn().mockImplementation(() => {
                // Simulate loading completing
                mockMonitorTypesStore.monitorTypes = mockMonitorTypes;
                mockMonitorTypesStore.isLoaded = true;
            });
            mockMonitorTypesStore.loadMonitorTypes = loadMonitorTypesMock;

            vi.mocked(
                errorHandling.withUtilityErrorHandling
            ).mockImplementation(async (fn) => await fn());

            await getAvailableMonitorTypes();

            expect(loadMonitorTypesMock).toHaveBeenCalledTimes(1);
        });
    });

    // Property-based Tests
    describe("Property-based Tests", () => {
        const monitorTypeKeyArb = fc.constantFrom(
            ...(BASE_MONITOR_TYPES as readonly MonitorType[])
        );

        const monitorFieldOptionArb = fc.record({
            label: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.string({ minLength: 1, maxLength: 20 }),
        });

        const monitorFieldOptionalPropsArb: fc.Arbitrary<
            Partial<MonitorFieldDefinition>
        > = fc
            .record({
                helpText: fc.option(
                    fc.string({ minLength: 1, maxLength: 100 }),
                    { nil: null }
                ),
                max: fc.option(fc.integer({ min: -10_000, max: 10_000 }), {
                    nil: null,
                }),
                min: fc.option(fc.integer({ min: -10_000, max: 10_000 }), {
                    nil: null,
                }),
                options: fc.option(
                    fc.array(monitorFieldOptionArb, {
                        minLength: 1,
                        maxLength: 5,
                    }),
                    { nil: null }
                ),
                placeholder: fc.option(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    { nil: null }
                ),
            })
            .map(({ helpText, max, min, options, placeholder }) => ({
                ...(helpText === null ? {} : { helpText }),
                ...(max === null ? {} : { max }),
                ...(min === null ? {} : { min }),
                ...(options === null ? {} : { options }),
                ...(placeholder === null ? {} : { placeholder }),
            }));

        const monitorFieldDefinitionArb: fc.Arbitrary<MonitorFieldDefinition> =
            fc.tuple(
                fc.record({
                    label: fc.string({ minLength: 1, maxLength: 50 }),
                    name: fc.string({ minLength: 1, maxLength: 30 }),
                    required: fc.boolean(),
                    type: fc.constantFrom(
                        "number",
                        "select",
                        "text",
                        "url"
                    ),
                }),
                monitorFieldOptionalPropsArb
            ).map(([requiredProps, optionalProps]) => ({
                ...requiredProps,
                ...optionalProps,
            }));

        const monitorTypeConfigArb: fc.Arbitrary<MonitorTypeConfig> = fc.record({
            description: fc.string({ minLength: 5, maxLength: 200 }),
            displayName: fc.string({ minLength: 1, maxLength: 50 }),
            fields: fc.array(monitorFieldDefinitionArb, {
                minLength: 1,
                maxLength: 5,
            }),
            type: monitorTypeKeyArb,
            version: fc.string({ minLength: 1, maxLength: 20 }),
        });

        describe("clearMonitorTypeCache property tests", () => {
            test.prop([fc.constantFrom("test", "reset", "clear", "refresh")])(
                "should always clear the cache regardless of input context",
                (_context) => {
                    // Setup some cache data
                    vi.mocked(AppCaches.monitorTypes.set).mockImplementation(
                        () => {}
                    );
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([]);
                    vi.mocked(AppCaches.monitorTypes.clear).mockImplementation(
                        () => {}
                    );

                    // Clear the cache
                    clearMonitorTypeCache();

                    // Verify clear was called
                    expect(AppCaches.monitorTypes.clear).toHaveBeenCalled();
                }
            );
        });

        describe("getAvailableMonitorTypes property tests", () => {
            test.prop([
                fc.array(monitorTypeConfigArb, { minLength: 1, maxLength: 5 }),
            ])(
                "should return monitor type configurations from cache or store",
                async (mockTypes) => {
                    // Setup mocks
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        undefined
                    );
                    vi.mocked(AppCaches.monitorTypes.set).mockImplementation(
                        () => {}
                    );
                    vi.mocked(
                        errorHandling.withUtilityErrorHandling
                    ).mockImplementation(async (fn) => await fn());

                    mockMonitorTypesStore.monitorTypes = mockTypes;
                    mockMonitorTypesStore.isLoaded = true;

                    const result = await getAvailableMonitorTypes();

                    expect(result).toEqual(mockTypes);
                    expect(AppCaches.monitorTypes.set).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.array(monitorTypeConfigArb, { minLength: 0, maxLength: 3 }),
            ])(
                "should return cached monitor types when available",
                async (cachedTypes) => {
                    // Setup cache to return data
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        cachedTypes as any
                    );
                    vi.mocked(AppCaches.monitorTypes.set).mockImplementation(
                        () => {}
                    );

                    const result = await getAvailableMonitorTypes();

                    expect(result).toEqual(cachedTypes);
                    // Should not call set since we used cached data
                    expect(AppCaches.monitorTypes.set).not.toHaveBeenCalled();
                }
            );
        });

        describe("getMonitorTypeConfig property tests", () => {
            test.prop([
                fc.array(monitorTypeConfigArb, { minLength: 1, maxLength: 5 }),
                fc.integer({ min: 0, max: 4 }),
            ])(
                "should find monitor type config when type exists",
                async (mockTypes, targetIndex) => {
                    const targetType =
                        mockTypes[targetIndex % mockTypes.length];
                    if (!targetType) {
                        throw new Error("Expected target type to be defined");
                    }

                    // Setup mocks to return the mock types
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        mockTypes as any
                    );

                    const result = await getMonitorTypeConfig(targetType.type);
                    const firstMatch = mockTypes.find(
                        (type) => type.type === targetType.type
                    );

                    expect(result).toEqual(firstMatch);
                }
            );

            test.prop([
                fc.array(monitorTypeConfigArb, { minLength: 1, maxLength: 5 }),
                fc.constantFrom(...(BASE_MONITOR_TYPES as readonly MonitorType[])),
            ])(
                "should return undefined when monitor type not found",
                async (mockTypes, searchType) => {
                    // Ensure searchType doesn't match any existing type
                    const usedTypes = new Set(mockTypes.map((t) => t.type));
                    if (usedTypes.has(searchType)) {
                        return; // Skip this test case
                    }

                    // Setup mocks to return the mock types
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        mockTypes as any
                    );

                    const result = await getMonitorTypeConfig(searchType);

                    expect(result).toBeUndefined();
                }
            );
        });

        describe("getMonitorTypeOptions property tests", () => {
            test.prop([
                fc.array(monitorTypeConfigArb, { minLength: 1, maxLength: 5 }),
            ])(
                "should transform monitor types to option format",
                async (mockTypes) => {
                    // Setup mocks to return the mock types
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        mockTypes as any
                    );

                    const result = await getMonitorTypeOptions();

                    expect(result).toHaveLength(mockTypes.length);
                    for (const [index, option] of result.entries()) {
                        const mockType = mockTypes[index];
                        if (!mockType) {
                            throw new Error(
                                `Expected mockType at index ${index} to be defined`
                            );
                        }
                        expect(option.label).toBe(mockType.displayName);
                        expect(option.value).toBe(mockType.type);
                    }
                }
            );

            test.prop([fc.constantFrom(0, 1, 2, 3)])(
                "should return empty array when no monitor types available",
                async (emptyCase) => {
                    // Setup mocks to return empty array in different ways
                    const emptyValues = [
                        [],
                        undefined,
                        null,
                        false,
                    ];
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        emptyValues[emptyCase] as any
                    );

                    if (emptyCase > 0) {
                        // For non-array cases, mock the store to return empty array
                        mockMonitorTypesStore.monitorTypes = [];
                        mockMonitorTypesStore.isLoaded = true;
                        vi.mocked(
                            errorHandling.withUtilityErrorHandling
                        ).mockImplementation(async (fn) => await fn());
                    }

                    const result = await getMonitorTypeOptions();

                    expect(Array.isArray(result)).toBeTruthy();
                    if (emptyCase === 0) {
                        expect(result).toHaveLength(0);
                    }
                }
            );
        });
    });
});

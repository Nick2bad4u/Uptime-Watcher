/**
 * @file Tests for monitorTypeHelper utility functions
 */

import type {
    MonitorTypeConfig,
    MonitorTypeOption,
} from "@shared/types/monitorTypes";

import { test } from "@fast-check/vitest";
import {
    BASE_MONITOR_TYPES,
    type MonitorFieldDefinition,
    type MonitorType,
} from "@shared/types";
import * as errorHandling from "@shared/utils/errorHandling";
import * as fc from "fast-check";
import { arrayFirst, safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";
import {
    clearMonitorTypeCache,
    getAvailableMonitorTypes,
    getMonitorTypeConfig,
    getMonitorTypeOptions,
} from "../../utils/monitorTypeHelper";
import { installElectronApiMock } from "./electronApiMock";

// Mock the monitor types store
const mockMonitorTypesStore = {
    isLoaded: false,
    loadMonitorTypes: vi.fn(),
    monitorTypes: safeCastTo<MonitorTypeConfig[]>([]),
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
            clear: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
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
    convertError: vi.fn(),
    ensureError: vi.fn(),
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
            description: "Monitors HTTP endpoints",
            displayName: "HTTP Monitor",
            fields: [
                {
                    label: "URL",
                    name: "url",
                    placeholder: "https://example.com",
                    required: true,
                    type: "text",
                },
            ],
            type: "http",
            uiConfig: {
                detailFormats: {
                    analyticsLabel: "HTTP: {url}",
                },
                display: {
                    showAdvancedMetrics: true,
                    showUrl: true,
                },
                helpTexts: {
                    primary: "Enter the URL to monitor",
                    secondary: "Must be a valid HTTP/HTTPS URL",
                },
                supportsAdvancedAnalytics: true,
                supportsResponseTime: true,
            },
            version: "1.0.0",
        },
        {
            description: "Monitors server connectivity via ping",
            displayName: "Ping Monitor",
            fields: [
                {
                    label: "Host",
                    name: "host",
                    placeholder: "example.com",
                    required: true,
                    type: "text",
                },
            ],
            type: "ping",
            uiConfig: {
                display: {
                    showAdvancedMetrics: false,
                    showUrl: false,
                },
                helpTexts: {
                    primary: "Enter hostname or IP address",
                },
                supportsAdvancedAnalytics: false,
                supportsResponseTime: true,
            },
            version: "1.0.0",
        },
        {
            description: "Monitors TCP port connectivity",
            displayName: "TCP Monitor",
            fields: [
                {
                    label: "Host",
                    name: "host",
                    placeholder: "example.com",
                    required: true,
                    type: "text",
                },
                {
                    label: "Port",
                    name: "port",
                    placeholder: "80",
                    required: true,
                    type: "number",
                },
            ],
            type: "port",
            version: "1.0.0",
        },
    ];

    const expectedOptionsFor = (
        configs: readonly MonitorTypeConfig[]
    ): MonitorTypeOption[] => {
        const seenTypes = new Set<MonitorType>();
        const options: MonitorTypeOption[] = [];

        for (const config of configs) {
            if (seenTypes.has(config.type)) {
                continue;
            }

            seenTypes.add(config.type);
            options.push({
                label: config.displayName,
                value: config.type,
            });
        }

        return options;
    };

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
        it("should call cache clear method", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            clearMonitorTypeCache();

            expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
        });

        it("should clear cache when called multiple times", async ({
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("http");

            expect(result).toEqual(arrayFirst(mockMonitorTypes));
        });

        it("should return config for different monitor types", async ({
            annotate,
            task,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await getMonitorTypeConfig("nonexistent");

            expect(result).toBeUndefined();
        });

        it("should return undefined for empty string", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("");

            expect(result).toBeUndefined();
        });

        it("should handle case-sensitive type matching", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("HTTP");

            expect(result).toBeUndefined();
        });

        it("should work with whitespace in type names", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig(" http ");

            expect(result).toBeUndefined();
        });

        it("should handle special characters in type names", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await getMonitorTypeConfig("http-monitor");

            expect(result).toBeUndefined();
        });

        it("should return undefined when monitor types list is empty", async ({
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const complexTypes: MonitorTypeConfig[] = [
                {
                    description: "Advanced HTTP monitoring",
                    displayName: "HTTP Monitor (Advanced)",
                    fields: arrayFirst(mockMonitorTypes)!.fields,
                    type: "http",
                    version: "2.0.0",
                },
                {
                    description: "Custom ping implementation",
                    displayName: "Custom Ping Service",
                    fields: mockMonitorTypes[1]!.fields,
                    type: "ping",
                    version: "1.1.0",
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
            annotate,
            task,
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

        it("should ignore duplicate monitor type options", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const duplicateTypes: MonitorTypeConfig[] = [
                arrayFirst(mockMonitorTypes)!,
                {
                    ...arrayFirst(mockMonitorTypes)!,
                    displayName: "Duplicate HTTP Monitor",
                    version: "1.0.1",
                },
                mockMonitorTypes[1]!,
            ];
            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
                duplicateTypes
            );

            const result = await getMonitorTypeOptions();

            expect(result).toEqual([
                { label: "HTTP Monitor", value: "http" },
                { label: "Ping Monitor", value: "ping" },
            ]);
        });

        it("should handle monitor types with empty display names", async ({
            annotate,
            task,
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
                    description: "Monitor with empty display name",
                    displayName: "",
                    fields: arrayFirst(mockMonitorTypes)!.fields,
                    type: "http",
                    version: "1.0.0",
                },
                {
                    description: "Normal monitor",
                    displayName: "Normal Monitor",
                    fields: arrayFirst(mockMonitorTypes)!.fields,
                    type: "ping",
                    version: "1.0.0",
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const specialTypes: MonitorTypeConfig[] = [
                {
                    description: "Special monitor",
                    displayName: "Monitor (v2.0) - Advanced & Fast",
                    fields: arrayFirst(mockMonitorTypes)!.fields,
                    type: "http",
                    version: "2.0.0",
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
            annotate,
            task,
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
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeHelper", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const fallbackValue = [arrayFirst(mockMonitorTypes)];

            vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
            vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue(
                fallbackValue
            );

            const result = await getAvailableMonitorTypes();

            expect(result).toEqual(fallbackValue);
        });
    });

    describe("store integration", () => {
        it("should use monitor types store correctly", async ({
            annotate,
            task,
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
    describe("property-based Tests", () => {
        const monitorTypeKeyArb = fc.constantFrom(
            ...safeCastTo<readonly MonitorType[]>(BASE_MONITOR_TYPES)
        );

        const monitorFieldOptionArb = fc.record({
            label: fc.string({ maxLength: 20, minLength: 1 }),
            value: fc.string({ maxLength: 20, minLength: 1 }),
        });

        const monitorFieldOptionalPropsArb: fc.Arbitrary<
            Partial<MonitorFieldDefinition>
        > = fc
            .record({
                helpText: fc.option(
                    fc.string({ maxLength: 100, minLength: 1 }),
                    { nil: null }
                ),
                max: fc.option(fc.integer({ max: 10_000, min: -10_000 }), {
                    nil: null,
                }),
                min: fc.option(fc.integer({ max: 10_000, min: -10_000 }), {
                    nil: null,
                }),
                options: fc.option(
                    fc.array(monitorFieldOptionArb, {
                        maxLength: 5,
                        minLength: 1,
                    }),
                    { nil: null }
                ),
                placeholder: fc.option(
                    fc.string({ maxLength: 50, minLength: 1 }),
                    { nil: null }
                ),
            })
            .map(({ helpText, max, min, options, placeholder }) => ({
                ...(helpText !== null && { helpText }),
                ...(max !== null && { max }),
                ...(min !== null && { min }),
                ...(options !== null && { options }),
                ...(placeholder !== null && { placeholder }),
            }));

        const monitorFieldDefinitionArb: fc.Arbitrary<MonitorFieldDefinition> =
            fc
                .tuple(
                    fc.record({
                        label: fc.string({ maxLength: 50, minLength: 1 }),
                        name: fc.string({ maxLength: 30, minLength: 1 }),
                        required: fc.boolean(),
                        type: fc.constantFrom(
                            "number",
                            "select",
                            "text",
                            "url"
                        ),
                    }),
                    monitorFieldOptionalPropsArb
                )
                .map(([requiredProps, optionalProps]) => ({
                    ...requiredProps,
                    ...optionalProps,
                }));

        const monitorTypeConfigArb: fc.Arbitrary<MonitorTypeConfig> = fc.record(
            {
                description: fc.string({ maxLength: 200, minLength: 5 }),
                displayName: fc.string({ maxLength: 50, minLength: 1 }),
                fields: fc.array(monitorFieldDefinitionArb, {
                    maxLength: 5,
                    minLength: 1,
                }),
                type: monitorTypeKeyArb,
                version: fc.string({ maxLength: 20, minLength: 1 }),
            }
        );

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
                fc.array(monitorTypeConfigArb, { maxLength: 5, minLength: 1 }),
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
                fc.array(monitorTypeConfigArb, { maxLength: 3, minLength: 0 }),
            ])(
                "should return cached monitor types when available",
                async (cachedTypes) => {
                    // Setup cache to return data
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        cachedTypes
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
                fc.array(monitorTypeConfigArb, { maxLength: 5, minLength: 1 }),
                fc.integer({ max: 4, min: 0 }),
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
                        mockTypes
                    );

                    const result = await getMonitorTypeConfig(targetType.type);
                    const firstMatch = mockTypes.find(
                        (type) => type.type === targetType.type
                    );

                    expect(result).toEqual(firstMatch);
                }
            );

            test.prop([
                fc.array(monitorTypeConfigArb, { maxLength: 5, minLength: 1 }),
                fc.constantFrom(
                    ...safeCastTo<readonly MonitorType[]>(BASE_MONITOR_TYPES)
                ),
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
                        mockTypes
                    );

                    const result = await getMonitorTypeConfig(searchType);

                    expect(result).toBeUndefined();
                }
            );
        });

        describe("getMonitorTypeOptions property tests", () => {
            test.prop([
                fc.array(monitorTypeConfigArb, { maxLength: 5, minLength: 1 }),
            ])(
                "should transform monitor types to option format",
                async (mockTypes) => {
                    // Setup mocks to return the mock types
                    vi.mocked(AppCaches.monitorTypes.get).mockReturnValueOnce(
                        mockTypes
                    );

                    const result = await getMonitorTypeOptions();
                    const expectedOptions = expectedOptionsFor(mockTypes);

                    expect(result).toEqual(expectedOptions);
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
                        emptyValues[emptyCase]
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

                    expect(Array.isArray(result)).toBe(true);

                    if (emptyCase === 0) {
                        expect(result).toHaveLength(0);
                    }
                }
            );
        });
    });
});

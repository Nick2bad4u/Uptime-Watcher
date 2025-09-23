/**
 * Comprehensive tests for Monitor Types domain API Includes fast-check
 * property-based testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    monitorTypesApi,
    type MonitorTypesApiInterface,
} from "../../../preload/domains/monitorTypesApi";

// Helper functions for IPC response format
const createIpcResponse = <T>(data: T) => ({ success: true, data });

describe("Monitor Types Domain API", () => {
    let api: MonitorTypesApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = monitorTypesApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required monitor types methods", () => {
            const expectedMethods = ["getMonitorTypes"];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same monitorTypesApi instance", () => {
            expect(api).toBe(monitorTypesApi);
        });
    });

    describe("getMonitorTypes", () => {
        it("should call IPC with correct channel and return monitor types", async () => {
            const mockMonitorTypes = {
                http: {
                    name: "HTTP Monitor",
                    description: "Monitors HTTP endpoints",
                    fields: [
                        "url",
                        "method",
                        "timeout",
                    ],
                    defaultValues: { method: "GET", timeout: 5000 },
                },
                ping: {
                    name: "Ping Monitor",
                    description: "Monitors server availability via ping",
                    fields: ["host", "timeout"],
                    defaultValues: { timeout: 3000 },
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockMonitorTypes)
            );

            const result = await api.getMonitorTypes();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "get-monitor-types"
            );
            expect(result).toEqual(mockMonitorTypes);
        });

        it("should handle empty monitor types registry", async () => {
            const emptyRegistry = {};
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(emptyRegistry)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual({});
        });

        it("should handle IPC errors", async () => {
            const error = new Error("Failed to load monitor types");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.getMonitorTypes()).rejects.toThrow(
                "Failed to load monitor types"
            );
        });

        it("should handle complex monitor type configurations", async () => {
            const complexTypes = {
                http: {
                    name: "HTTP Monitor",
                    description: "Advanced HTTP monitoring",
                    fields: [
                        { name: "url", type: "string", required: true },
                        {
                            name: "method",
                            type: "enum",
                            values: [
                                "GET",
                                "POST",
                                "PUT",
                            ],
                            default: "GET",
                        },
                        { name: "headers", type: "object", default: {} },
                        { name: "body", type: "string", required: false },
                        {
                            name: "timeout",
                            type: "number",
                            min: 1000,
                            max: 30_000,
                            default: 5000,
                        },
                    ],
                    validation: {
                        url: "^https?://",
                        timeout: { min: 1000, max: 30_000 },
                    },
                },
                database: {
                    name: "Database Monitor",
                    description: "Database connectivity monitoring",
                    fields: [
                        { name: "host", type: "string", required: true },
                        { name: "port", type: "number", required: true },
                        { name: "database", type: "string", required: true },
                        { name: "username", type: "string", required: false },
                        { name: "password", type: "password", required: false },
                        {
                            name: "query",
                            type: "textarea",
                            default: "SELECT 1",
                        },
                    ],
                    security: {
                        encryptedFields: ["password"],
                        requiresAuth: true,
                    },
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(complexTypes)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual(complexTypes);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "get-monitor-types"
            );
        });

        it("should handle null and undefined responses", async () => {
            // Test null response
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(null));
            const nullResult = await api.getMonitorTypes();
            expect(nullResult).toEqual(null);

            // Test undefined by passing empty object (undefined not allowed in data field)
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse({}));
            const emptyResult = await api.getMonitorTypes();
            expect(emptyResult).toEqual({});
        });

        it("should handle very large monitor type registry", async () => {
            const largeRegistry = Object.fromEntries(
                Array.from({ length: 100 }, (_, i) => [
                    `monitor_type_${i}`,
                    {
                        name: `Monitor Type ${i}`,
                        description: `Description for monitor type ${i}`,
                        fields: Array.from(
                            { length: 10 },
                            (_, j) => `field_${j}`
                        ),
                        config: {
                            index: i,
                            data: Array.from({ length: 50 }, (_, k) => k),
                        },
                    },
                ])
            );

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(largeRegistry)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual(largeRegistry);
            expect(Object.keys(result as object)).toHaveLength(100);
        });

        it("should handle concurrent calls", async () => {
            const mockTypes = {
                http: { name: "HTTP" },
                ping: { name: "Ping" },
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockTypes)
            );

            const promises = Array.from({ length: 5 }, () =>
                api.getMonitorTypes()
            );
            const results = await Promise.all(promises);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(5);
            for (const result of results) {
                expect(result).toEqual(mockTypes);
            }
        });

        it("should handle malformed responses gracefully", async () => {
            const malformedResponses = [
                "not an object",
                123,
                true,
                [],
                { invalidStructure: "missing required fields" },
            ];

            for (const response of malformedResponses) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(response)
                );

                const result = await api.getMonitorTypes();
                expect(result).toEqual(response);
            }
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various monitor type registry structures", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.dictionary(
                        fc.string({ minLength: 1, maxLength: 20 }), // Monitor type key
                        fc.record({
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            description: fc.string({ maxLength: 200 }),
                            fields: fc.array(
                                fc.string({ minLength: 1, maxLength: 30 })
                            ),
                            defaultValues: fc.object(),
                        })
                    ),
                    async (monitorTypes) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(monitorTypes)
                        );

                        const result = await api.getMonitorTypes();
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "get-monitor-types"
                        );
                        expect(result).toEqual(monitorTypes);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various data types in monitor configurations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        strings: fc.dictionary(fc.string(), fc.string()),
                        numbers: fc.dictionary(fc.string(), fc.integer()),
                        booleans: fc.dictionary(fc.string(), fc.boolean()),
                        arrays: fc.dictionary(
                            fc.string(),
                            fc.array(fc.string())
                        ),
                        nested: fc.dictionary(
                            fc.string(),
                            fc.record({
                                config: fc.object(),
                                metadata: fc.array(fc.string()),
                            })
                        ),
                    }),
                    async (complexData) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(complexData)
                        );

                        const result = await api.getMonitorTypes();
                        expect(result).toEqual(complexData);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc
                            .string({ minLength: 1 })
                            .map((msg) => new Error(msg)),
                        fc.constant(new TypeError("Type error")),
                        fc.constant(new ReferenceError("Reference error"))
                    ),
                    async (error) => {
                        mockIpcRenderer.invoke.mockRejectedValue(error);

                        await expect(api.getMonitorTypes()).rejects.toThrow(
                            error.message
                        );
                    }
                ),
                { numRuns: 10 }
            );
        });

        it("should handle rapid successive calls", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 10 }),
                    fc.object(),
                    async (callCount, mockData) => {
                        vi.clearAllMocks(); // Clear mocks for each iteration
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockData)
                        );

                        const promises = Array.from({ length: callCount }, () =>
                            api.getMonitorTypes()
                        );

                        const results = await Promise.all(promises);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(
                            callCount
                        );
                        for (const result of results) {
                            expect(result).toEqual(mockData);
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle monitor type loading during application startup", async () => {
            const startupTypes = {
                http: { name: "HTTP Monitor", enabled: true },
                ping: { name: "Ping Monitor", enabled: true },
                port: { name: "Port Monitor", enabled: false }, // Disabled type
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(startupTypes)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual(startupTypes);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(1);
        });

        it("should handle monitor type registry updates", async () => {
            // Initial load
            const initialTypes = { http: { name: "HTTP" } };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(initialTypes)
            );

            const initial = await api.getMonitorTypes();
            expect(initial).toEqual(initialTypes);

            // Updated registry
            const updatedTypes = {
                http: { name: "HTTP", version: "2.0" },
                dns: { name: "DNS", version: "1.0" },
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(updatedTypes)
            );

            const updated = await api.getMonitorTypes();
            expect(updated).toEqual(updatedTypes);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(2);
        });

        it("should handle caching scenarios", async () => {
            const cachedTypes = {
                cached: true,
                timestamp: Date.now(),
                types: {
                    http: { name: "HTTP Monitor" },
                    ping: { name: "Ping Monitor" },
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(cachedTypes)
            );

            // Multiple calls should all get the cached data
            const results = await Promise.all([
                api.getMonitorTypes(),
                api.getMonitorTypes(),
                api.getMonitorTypes(),
            ]);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
            for (const result of results) {
                expect(result).toEqual(cachedTypes);
            }
        });

        it("should handle plugin-based monitor types", async () => {
            const pluginTypes = {
                "plugin:custom-http": {
                    name: "Custom HTTP Monitor",
                    plugin: true,
                    pluginSource: "custom-plugin-v1.0",
                    capabilities: [
                        "headers",
                        "authentication",
                        "ssl-check",
                    ],
                },
                "core:basic-ping": {
                    name: "Basic Ping",
                    plugin: false,
                    builtin: true,
                    capabilities: ["ipv4", "ipv6"],
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(pluginTypes)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual(pluginTypes);
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle network timeout errors", async () => {
            const timeoutError = new Error("Network timeout");
            mockIpcRenderer.invoke.mockRejectedValue(timeoutError);

            await expect(api.getMonitorTypes()).rejects.toThrow(
                "Network timeout"
            );
        });

        it("should handle permission denied errors", async () => {
            const permissionError = new Error(
                "Permission denied accessing monitor types"
            );
            mockIpcRenderer.invoke.mockRejectedValue(permissionError);

            await expect(api.getMonitorTypes()).rejects.toThrow(
                "Permission denied"
            );
        });

        it("should handle corrupted data responses", async () => {
            const corruptedData = {
                http: null,
                ping: undefined,
                port: "corrupted_string_instead_of_object",
                dns: { incomplete: true }, // Missing required fields
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(corruptedData)
            );

            const result = await api.getMonitorTypes();

            // Should still return the data even if corrupted - let the UI handle validation
            expect(result).toEqual(corruptedData);
        });

        it("should handle extremely large registry efficiently", async () => {
            const start = Date.now();
            const hugeRegistry = Object.fromEntries(
                Array.from({ length: 1000 }, (_, i) => [
                    `type_${i}`,
                    {
                        name: `Type ${i}`,
                        data: Array.from({ length: 100 }, (_, j) => ({
                            field: j,
                            value: `data_${j}`,
                        })),
                    },
                ])
            );

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(hugeRegistry)
            );

            const result = await api.getMonitorTypes();
            const duration = Date.now() - start;

            expect(result).toEqual(hugeRegistry);
            expect(duration).toBeLessThan(1000); // Should handle large data quickly
        });

        it("should handle circular references in monitor type data", async () => {
            const circularData = {
                http: { name: "HTTP" },
            };
            // Create circular reference
            (circularData.http as any)["parent"] = circularData;

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(circularData)
            );

            const result = await api.getMonitorTypes();

            expect(result).toEqual(circularData);
        });

        it("should handle concurrent error and success scenarios", async () => {
            const error = new Error("Intermittent failure");
            const successData = { http: { name: "HTTP" } };

            // Mix of success and failure
            mockIpcRenderer.invoke
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(createIpcResponse(successData))
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(createIpcResponse(successData));

            // Test mixed results
            await expect(api.getMonitorTypes()).rejects.toThrow(
                "Intermittent failure"
            );
            await expect(api.getMonitorTypes()).resolves.toEqual(successData);
            await expect(api.getMonitorTypes()).rejects.toThrow(
                "Intermittent failure"
            );
            await expect(api.getMonitorTypes()).resolves.toEqual(successData);
        });

        it("should handle memory pressure scenarios", async () => {
            // Simulate memory pressure with repeated large allocations
            const largeData = {
                memoryTest: {
                    name: "Memory Test",
                    data: Array.from({ length: 10_000 }, (_, i) => ({
                        id: i,
                        payload: "x".repeat(1000), // 1KB per item, 10MB total
                    })),
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(largeData)
            );

            // Multiple concurrent calls with large data
            const promises = Array.from({ length: 5 }, () =>
                api.getMonitorTypes()
            );
            const results = await Promise.all(promises);

            for (const result of results) {
                expect(result).toEqual(largeData);
            }
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for return values", async () => {
            const typedData = {
                http: {
                    name: "HTTP Monitor",
                    fields: ["url", "method"],
                    config: {
                        timeout: 5000,
                        retries: 3,
                        followRedirects: true,
                    },
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(typedData)
            );

            const result = await api.getMonitorTypes();

            // The result should be assignable to unknown
            expect(result).toBeDefined();
            expect(typeof result).toBeDefined();

            // Should be able to access properties if casting
            const typed = result as typeof typedData;
            expect(typed.http.name).toBe("HTTP Monitor");
        });

        it("should handle function context properly", async () => {
            const { getMonitorTypes } = api;
            const mockData = { test: "data" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockData)
            );

            // Destructured function should work correctly
            const result = await getMonitorTypes();

            expect(result).toEqual(mockData);
        });

        it("should return Promise types correctly", () => {
            const promise = api.getMonitorTypes();

            expect(promise).toBeInstanceOf(Promise);
        });

        it("should handle method chaining scenarios", async () => {
            const chainData = { chain: "test" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(chainData)
            );

            // Method should be callable and chainable
            const result = await api.getMonitorTypes();

            expect(result).toEqual(chainData);
            expect(typeof api.getMonitorTypes).toBe("function");
        });
    });

    describe("Performance and optimization scenarios", () => {
        it("should handle repeated calls efficiently", async () => {
            const testData = { perf: "test" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(testData)
            );

            const start = Date.now();

            // Make many sequential calls
            for (let i = 0; i < 50; i++) {
                await api.getMonitorTypes();
            }

            const duration = Date.now() - start;

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(50);
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });

        it("should handle burst traffic scenarios", async () => {
            const burstData = { burst: "test" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(burstData)
            );

            // Simulate burst of concurrent requests
            const burstSize = 20;
            const promises = Array.from({ length: burstSize }, () =>
                api.getMonitorTypes()
            );

            const start = Date.now();
            const results = await Promise.all(promises);
            const duration = Date.now() - start;

            expect(results).toHaveLength(burstSize);
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(burstSize);
            expect(duration).toBeLessThan(3000); // Should handle burst efficiently
        });
    });
});

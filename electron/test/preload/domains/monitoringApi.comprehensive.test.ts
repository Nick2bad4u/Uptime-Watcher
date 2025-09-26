/**
 * Comprehensive tests for Monitoring domain API Includes fast-check
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
    monitoringApi,
    type MonitoringApiInterface,
} from "../../../preload/domains/monitoringApi";

// Helper function to create proper IPC response format
function createIpcResponse<T>(data: T, success = true, error?: string) {
    return { success, data, error };
}

describe("Monitoring Domain API", () => {
    let api: MonitoringApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = monitoringApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required monitoring methods", () => {
            const expectedMethods = [
                "formatMonitorDetail",
                "formatMonitorTitleSuffix",
                "removeMonitor",
                "startMonitoring",
                "startMonitoringForSite",
                "stopMonitoring",
                "stopMonitoringForSite",
                "validateMonitorData",
            ];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same monitoringApi instance", () => {
            expect(api).toBe(monitoringApi);
        });
    });

    describe("formatMonitorDetail", () => {
        it("should call IPC with correct channel and return formatted string", async () => {
            const mockResponse = "Monitor: HTTP Check - Status: Active";
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockResponse)
            );

            const monitorData = { type: "http", url: "https://example.com" };
            const result = await api.formatMonitorDetail(monitorData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "format-monitor-detail",
                monitorData
            );
            expect(result).toBe(mockResponse);
        });

        it("should handle various monitor data structures", async () => {
            const testCases = [
                {
                    type: "http",
                    url: "https://example.com",
                    name: "HTTP Check",
                },
                { type: "ping", host: "example.com" },
                { type: "port", host: "example.com", port: 80 },
                {},
                null,
                undefined,
            ];

            for (const monitorData of testCases) {
                const mockResponse = `Formatted: ${JSON.stringify(monitorData)}`;
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(mockResponse)
                );

                const result = await api.formatMonitorDetail(monitorData);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "format-monitor-detail",
                    monitorData
                );
                expect(result).toBe(mockResponse);
            }
        });

        it("should handle IPC errors", async () => {
            const error = new Error("Format failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.formatMonitorDetail({})).rejects.toThrow(
                "Format failed"
            );
        });
    });

    describe("formatMonitorTitleSuffix", () => {
        it("should call IPC with correct channel and return title suffix", async () => {
            const mockResponse = "(Active)";
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockResponse)
            );

            const monitorData = { status: "active", responseTime: 150 };
            const result = await api.formatMonitorTitleSuffix(monitorData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "format-monitor-title-suffix",
                monitorData
            );
            expect(result).toBe(mockResponse);
        });

        it("should handle empty responses", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(""));

            const result = await api.formatMonitorTitleSuffix({});

            expect(result).toBe("");
        });

        it("should handle formatting errors gracefully", async () => {
            const error = new Error("Title format failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.formatMonitorTitleSuffix({})).rejects.toThrow(
                "Title format failed"
            );
        });
    });

    describe("removeMonitor", () => {
        it("should call IPC with correct channel for monitor removal", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const siteId = "site-123";
            const monitorId = "monitor-456";
            const result = await api.removeMonitor(siteId, monitorId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "remove-monitor",
                siteId,
                monitorId
            );
            expect(result).toBeTruthy();
        });

        it("should handle removal errors", async () => {
            const error = new Error("Monitor not found");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.removeMonitor("site", "monitor")).rejects.toThrow(
                "Monitor not found"
            );
        });

        it("should handle various ID formats", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const testCases = [
                ["site-1", "monitor-1"],
                ["", ""],
                [
                    "very-long-site-identifier-12345",
                    "monitor-with-special-chars-!@#",
                ],
                ["123", "456"],
            ];

            for (const [siteId, monitorId] of testCases) {
                const removed = await api.removeMonitor(siteId, monitorId);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "remove-monitor",
                    siteId,
                    monitorId
                );
                expect(removed).toBeTruthy();
            }
        });
    });

    describe("startMonitoring", () => {
        it("should call IPC and return boolean result", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.startMonitoring();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "start-monitoring"
            );
            expect(result).toBeTruthy();
        });

        it("should handle start failure", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.startMonitoring();

            expect(result).toBeFalsy();
        });

        it("should handle IPC errors during start", async () => {
            const error = new Error("Failed to start monitoring service");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.startMonitoring()).rejects.toThrow(
                "Failed to start monitoring service"
            );
        });

        it("should handle multiple consecutive start calls", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const results = await Promise.all([
                api.startMonitoring(),
                api.startMonitoring(),
                api.startMonitoring(),
            ]);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
            expect(results).toEqual([
                true,
                true,
                true,
            ]);
        });
    });

    describe("stopMonitoring", () => {
        it("should call IPC and return boolean result", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.stopMonitoring();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "stop-monitoring"
            );
            expect(result).toBeTruthy();
        });

        it("should handle stop failure", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.stopMonitoring();

            expect(result).toBeFalsy();
        });

        it("should handle errors during stop", async () => {
            const error = new Error("Failed to stop monitoring");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.stopMonitoring()).rejects.toThrow(
                "Failed to stop monitoring"
            );
        });
    });

    describe("startMonitoringForSite", () => {
        it("should call IPC with site parameters", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const siteId = "site-123";
            const monitorId = "monitor-456";
            const result = await api.startMonitoringForSite(siteId, monitorId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "start-monitoring-for-site",
                siteId,
                monitorId
            );
            expect(result).toBeTruthy();
        });

        it("should handle site monitoring start without monitor ID", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const siteId = "site-123";
            const result = await api.startMonitoringForSite(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "start-monitoring-for-site",
                siteId
            );
            expect(result).toBeTruthy();
        });

        it("should handle site monitoring failures", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.startMonitoringForSite("invalid-site");

            expect(result).toBeFalsy();
        });
    });

    describe("stopMonitoringForSite", () => {
        it("should call IPC with site parameters", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const siteId = "site-123";
            const monitorId = "monitor-456";
            const result = await api.stopMonitoringForSite(siteId, monitorId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "stop-monitoring-for-site",
                siteId,
                monitorId
            );
            expect(result).toBeTruthy();
        });

        it("should handle site monitoring stop without monitor ID", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const siteId = "site-123";
            const result = await api.stopMonitoringForSite(siteId);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "stop-monitoring-for-site",
                siteId
            );
            expect(result).toBeTruthy();
        });

        it("should handle stop failures", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.stopMonitoringForSite("site");

            expect(result).toBeFalsy();
        });
    });

    describe("validateMonitorData", () => {
        it("should call IPC with validation parameters", async () => {
            const mockValidation = { valid: true, errors: [] };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockValidation)
            );

            const monitorType = "http";
            const monitorData = { url: "https://example.com", timeout: 5000 };
            const result = await api.validateMonitorData(
                monitorType,
                monitorData
            );

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "validate-monitor-data",
                monitorType,
                monitorData
            );
            expect(result).toEqual(mockValidation);
        });

        it("should handle validation failures", async () => {
            const mockValidation = {
                valid: false,
                errors: ["Invalid URL", "Timeout too high"],
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockValidation)
            );

            const result = await api.validateMonitorData("http", {
                url: "invalid",
            });

            expect(result).toEqual(mockValidation);
        });

        it("should handle various monitor types", async () => {
            const mockValidation = { valid: true };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockValidation)
            );

            const testCases = [
                ["http", { url: "https://example.com" }],
                ["ping", { host: "example.com" }],
                ["port", { host: "example.com", port: 80 }],
                ["dns", { domain: "example.com" }],
            ];

            for (const [type, data] of testCases) {
                await api.validateMonitorData(type, data);

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "validate-monitor-data",
                    type,
                    data
                );
            }
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various monitor data structures for formatting", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        type: fc.oneof(
                            fc.constant("http"),
                            fc.constant("ping"),
                            fc.constant("port")
                        ),
                        url: fc.webUrl(),
                        name: fc.string(),
                        timeout: fc.integer({ min: 1000, max: 30_000 }),
                    }),
                    async (monitorData) => {
                        const mockResponse = `Formatted: ${JSON.stringify(monitorData)}`;
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockResponse)
                        );

                        const result =
                            await api.formatMonitorDetail(monitorData);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "format-monitor-detail",
                            monitorData
                        );
                        expect(result).toBe(mockResponse);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various site and monitor ID combinations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        siteId: fc.string({ minLength: 1, maxLength: 50 }),
                        monitorId: fc.string({ minLength: 1, maxLength: 50 }),
                    }),
                    async ({ siteId, monitorId }) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(true)
                        );

                        const result = await api.startMonitoringForSite(
                            siteId,
                            monitorId
                        );
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "start-monitoring-for-site",
                            siteId,
                            monitorId
                        );
                        expect(result).toBeTruthy();
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various validation scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        monitorType: fc.oneof(
                            fc.constant("http"),
                            fc.constant("ping"),
                            fc.constant("port"),
                            fc.constant("dns")
                        ),
                        valid: fc.boolean(),
                        errors: fc.array(fc.string()),
                    }),
                    async ({ monitorType, valid, errors }) => {
                        const mockValidation = { valid, errors };
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(mockValidation)
                        );

                        const monitorData = { test: "data" };
                        const result = await api.validateMonitorData(
                            monitorType,
                            monitorData
                        );
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "validate-monitor-data",
                            monitorType,
                            monitorData
                        );
                        expect(result).toEqual(mockValidation);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle concurrent monitoring operations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.oneof(
                            fc.constant("start"),
                            fc.constant("stop"),
                            fc.record({
                                type: fc.constant("startSite"),
                                siteId: fc.string(),
                            }),
                            fc.record({
                                type: fc.constant("stopSite"),
                                siteId: fc.string(),
                            })
                        ),
                        { minLength: 1, maxLength: 5 }
                    ),
                    async (operations) => {
                        mockIpcRenderer.invoke.mockClear();
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(true)
                        );

                        const promises = operations.map((op) => {
                            if (typeof op === "string") {
                                switch (op) {
                                    case "start": {
                                        return api.startMonitoring();
                                    }
                                    case "stop": {
                                        return api.stopMonitoring();
                                    }
                                    default: {
                                        throw new Error(
                                            `Unknown operation: ${op}`
                                        );
                                    }
                                }
                            }

                            const typedOp = op as
                                | { type: "startSite"; siteId: string }
                                | { type: "stopSite"; siteId: string };

                            if (typedOp.type === "startSite") {
                                return api.startMonitoringForSite(
                                    typedOp.siteId
                                );
                            }

                            if (typedOp.type === "stopSite") {
                                return api.stopMonitoringForSite(
                                    typedOp.siteId
                                );
                            }

                            throw new Error(
                                `Unknown operation type: ${(typedOp as { type: string }).type}`
                            );
                        });

                        const results = await Promise.all(promises);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(
                            operations.length
                        );
                        for (const result of results) {
                            expect(result).toBeTruthy();
                        }
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete monitoring lifecycle", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            // Start global monitoring
            const startResult = await api.startMonitoring();
            expect(startResult).toBeTruthy();

            // Start monitoring for specific site
            const siteStartResult = await api.startMonitoringForSite(
                "site-1",
                "monitor-1"
            );
            expect(siteStartResult).toBeTruthy();

            // Stop monitoring for specific site
            const siteStopResult = await api.stopMonitoringForSite(
                "site-1",
                "monitor-1"
            );
            expect(siteStopResult).toBeTruthy();

            // Stop global monitoring
            const stopResult = await api.stopMonitoring();
            expect(stopResult).toBeTruthy();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(4);
        });

        it("should handle monitor management workflow", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const monitorData = { type: "http", url: "https://example.com" };

            // Validate monitor data
            const validationResult = { valid: true, errors: [] };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(validationResult)
            );
            const validation = await api.validateMonitorData(
                "http",
                monitorData
            );
            expect(validation).toEqual(validationResult);

            // Format monitor details
            const detailResult = "HTTP Monitor: https://example.com";
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(detailResult)
            );
            const details = await api.formatMonitorDetail(monitorData);
            expect(details).toBe(detailResult);

            // Format title suffix
            const suffixResult = "(Active)";
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(suffixResult)
            );
            const suffix = await api.formatMonitorTitleSuffix(monitorData);
            expect(suffix).toBe(suffixResult);

            // Remove monitor
            const removed = await api.removeMonitor("site-1", "monitor-1");
            expect(removed).toBeTruthy();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(4);
        });

        it("should handle error recovery scenarios", async () => {
            // Start monitoring fails
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Start failed")
            );
            await expect(api.startMonitoring()).rejects.toThrow("Start failed");

            // Retry with success
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(true)
            );
            const retryResult = await api.startMonitoring();
            expect(retryResult).toBeTruthy();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(2);
        });

        it("should handle mixed success and failure responses", async () => {
            const responses = [
                createIpcResponse(true),
                createIpcResponse(false),
                createIpcResponse(true),
                createIpcResponse(false),
            ];
            let callIndex = 0;

            mockIpcRenderer.invoke.mockImplementation(() =>
                Promise.resolve(responses[callIndex++])
            );

            const results = await Promise.all([
                api.startMonitoring(),
                api.stopMonitoring(),
                api.startMonitoringForSite("site"),
                api.stopMonitoringForSite("site"),
            ]);

            expect(results).toEqual([
                true,
                false,
                true,
                false,
            ]);
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle IPC communication failures", async () => {
            const error = new Error("IPC communication failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.startMonitoring()).rejects.toThrow(
                "IPC communication failed"
            );
            await expect(api.stopMonitoring()).rejects.toThrow(
                "IPC communication failed"
            );
            await expect(api.formatMonitorDetail({})).rejects.toThrow(
                "IPC communication failed"
            );
            await expect(api.removeMonitor("site", "monitor")).rejects.toThrow(
                "IPC communication failed"
            );
        });

        it("should handle null and undefined parameters", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("result")
            );

            await api.formatMonitorDetail(null);
            await api.formatMonitorDetail(undefined);
            await api.formatMonitorTitleSuffix(null);
            await api.validateMonitorData(null, undefined);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(4);
        });

        it("should handle very large data structures", async () => {
            const largeData = {
                type: "http",
                url: "https://example.com",
                data: Array.from({ length: 1000 }, (_, i) => ({
                    index: i,
                    value: `data-${i}`,
                })),
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("formatted")
            );

            const result = await api.formatMonitorDetail(largeData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "format-monitor-detail",
                largeData
            );
            expect(result).toBe("formatted");
        });

        it("should handle circular reference in data", async () => {
            const circularData: Record<string, unknown> = { type: "http" };
            circularData["self"] = circularData;

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("formatted")
            );

            const result = await api.formatMonitorDetail(circularData);

            expect(result).toBe("formatted");
        });

        it("should handle empty strings and special characters in IDs", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const specialIds = [
                "",
                "  ",
                "id-with-special-chars-!@#$%",
                "unicode-αβγ",
                "123",
            ];

            for (const id of specialIds) {
                await api.startMonitoringForSite(id, id);
                await api.stopMonitoringForSite(id, id);
                await api.removeMonitor(id, id);
            }

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(
                specialIds.length * 3
            );
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for all methods", async () => {
            // Format methods should return strings
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("string result")
            );
            const detailResult = await api.formatMonitorDetail({});
            const suffixResult = await api.formatMonitorTitleSuffix({});

            expect(typeof detailResult).toBe("string");
            expect(typeof suffixResult).toBe("string");

            // Boolean returning methods
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            const startResult = await api.startMonitoring();
            const stopResult = await api.stopMonitoring();
            const siteStartResult = await api.startMonitoringForSite("site");
            const siteStopResult = await api.stopMonitoringForSite("site");

            expect(typeof startResult).toBe("boolean");
            expect(typeof stopResult).toBe("boolean");
            expect(typeof siteStartResult).toBe("boolean");
            expect(typeof siteStopResult).toBe("boolean");

            // Removal should return boolean
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            const removeResult = await api.removeMonitor("site", "monitor");
            expect(removeResult).toBeTruthy();

            // Start operations should return boolean
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            const globalStartResult = await api.startMonitoring();
            const siteStartResult2 = await api.startMonitoringForSite("site");

            expect(globalStartResult).toBeTruthy();
            expect(siteStartResult2).toBeTruthy();

            // Stop operations should return boolean
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            const globalStopResult = await api.stopMonitoring();
            const siteStopResult2 = await api.stopMonitoringForSite("site");

            expect(globalStopResult).toBeTruthy();
            expect(siteStopResult2).toBeTruthy();

            // Validation returns any structure
            const validationData = { valid: true, errors: [] };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(validationData)
            );
            const validationResult = await api.validateMonitorData("http", {});

            expect(validationResult).toEqual(validationData);
        });

        it("should handle function context properly", async () => {
            const { startMonitoring, stopMonitoring, formatMonitorDetail } =
                api;
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            // Destructured functions should work correctly
            await expect(startMonitoring()).resolves.toBeDefined();
            await expect(stopMonitoring()).resolves.toBeDefined();

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("formatted")
            );
            await expect(formatMonitorDetail({})).resolves.toBeDefined();
        });

        it("should return Promise types correctly", () => {
            const promises = [
                api.startMonitoring(),
                api.formatMonitorDetail({}),
                api.removeMonitor("site", "monitor"),
                api.validateMonitorData("http", {}),
            ];

            for (const promise of promises) {
                expect(promise).toBeInstanceOf(Promise);
            }
        });
    });
});

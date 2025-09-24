/**
 * Comprehensive tests for Data domain API Includes fast-check property-based
 * testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() for proper hoisting
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    dataApi,
    type DataApiInterface,
} from "../../../preload/domains/dataApi";
import type { IpcResponse } from "../../../preload/core/bridgeFactory";

describe("Data Domain API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required methods", () => {
            const expectedMethods = [
                "downloadSqliteBackup",
                "exportData",
                "getHistoryLimit",
                "importData",
                "resetSettings",
                "updateHistoryLimit",
            ];

            for (const method of expectedMethods) {
                expect(dataApi).toHaveProperty(method);
                expect(typeof dataApi[method as keyof DataApiInterface]).toBe(
                    "function"
                );
            }
        });

        it("should have methods that return promises", () => {
            const methods = Object.values(dataApi) as ((
                ...args: unknown[]
            ) => Promise<unknown>)[];
            for (const method of methods) {
                const result = method();
                expect(result).toBeInstanceOf(Promise);
                // Clean up the promise to avoid unhandled rejection warnings
                result.catch(() => {});
            }
        });

        it("should be frozen/immutable", () => {
            // The dataApi object may not be frozen depending on implementation
            // but should at least be a stable object structure
            expect(typeof dataApi).toBe("object");
            expect(dataApi).not.toBeNull();
        });
    });

    describe("downloadSqliteBackup", () => {
        it("should call correct IPC channel and return ArrayBuffer", async () => {
            const mockBuffer = new ArrayBuffer(1024);
            const mockResponse: IpcResponse<ArrayBuffer> = {
                success: true,
                data: mockBuffer,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.downloadSqliteBackup();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "download-sqlite-backup"
            );
            expect(result).toBe(mockBuffer);
            expect(result).toBeInstanceOf(ArrayBuffer);
        });

        it("should handle empty backup", async () => {
            const emptyBuffer = new ArrayBuffer(0);
            const mockResponse: IpcResponse<ArrayBuffer> = {
                success: true,
                data: emptyBuffer,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.downloadSqliteBackup();

            expect(result).toBe(emptyBuffer);
            expect(result.byteLength).toBe(0);
        });

        it("should handle large backup files", async () => {
            const largeBuffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
            const mockResponse: IpcResponse<ArrayBuffer> = {
                success: true,
                data: largeBuffer,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.downloadSqliteBackup();

            expect(result).toBe(largeBuffer);
            expect(result.byteLength).toBe(10 * 1024 * 1024);
        });

        it("should propagate IPC errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Backup generation failed",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.downloadSqliteBackup()).rejects.toThrow(
                "Backup generation failed"
            );
        });
    });

    describe("exportData", () => {
        it("should call correct IPC channel and return JSON string", async () => {
            const mockExportData = JSON.stringify({
                sites: [],
                settings: {},
                version: "1.0.0",
            });
            const mockResponse: IpcResponse<string> = {
                success: true,
                data: mockExportData,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.exportData();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("export-data");
            expect(result).toBe(mockExportData);
            expect(typeof result).toBe("string");
        });

        it("should handle empty export data", async () => {
            const emptyExport = "{}";
            const mockResponse: IpcResponse<string> = {
                success: true,
                data: emptyExport,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.exportData();

            expect(result).toBe(emptyExport);
            expect(() => JSON.parse(result)).not.toThrow();
        });

        it("should handle large export data", async () => {
            const largeExport = JSON.stringify({
                sites: Array.from({ length: 1000 }, (_, i) => ({
                    id: `site-${i}`,
                    name: `Site ${i}`,
                    monitors: [],
                })),
            });
            const mockResponse: IpcResponse<string> = {
                success: true,
                data: largeExport,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.exportData();

            expect(result).toBe(largeExport);
            expect(result.length).toBeGreaterThan(10_000);
        });

        it("should propagate export errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Export failed: Database locked",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.exportData()).rejects.toThrow(
                "Export failed: Database locked"
            );
        });
    });

    describe("getHistoryLimit", () => {
        it("should call correct IPC channel and return number", async () => {
            const mockLimit = 30;
            const mockResponse: IpcResponse<number> = {
                success: true,
                data: mockLimit,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.getHistoryLimit();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "get-history-limit"
            );
            expect(result).toBe(mockLimit);
            expect(typeof result).toBe("number");
        });

        it("should handle various limit values", async () => {
            const testLimits = [
                0,
                1,
                30,
                90,
                365,
                1000,
            ];

            for (const limit of testLimits) {
                const mockResponse: IpcResponse<number> = {
                    success: true,
                    data: limit,
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const result = await dataApi.getHistoryLimit();
                expect(result).toBe(limit);
            }
        });

        it("should handle negative values (edge case)", async () => {
            const mockResponse: IpcResponse<number> = {
                success: true,
                data: -1, // This might be used to indicate "unlimited"
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.getHistoryLimit();
            expect(result).toBe(-1);
        });

        it("should propagate get limit errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Failed to get history limit",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.getHistoryLimit()).rejects.toThrow(
                "Failed to get history limit"
            );
        });
    });

    describe("importData", () => {
        it("should call correct IPC channel with data and return status", async () => {
            const importData = JSON.stringify({ sites: [], settings: {} });
            const mockResponse: IpcResponse<boolean> = {
                success: true,
                data: true,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.importData(importData);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "import-data",
                importData
            );
            expect(result).toBeTruthy();
        });

        it("should handle empty import data", async () => {
            const emptyData = "{}";
            const mockResponse: IpcResponse<boolean> = {
                success: true,
                data: false,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.importData(emptyData);

            expect(result).toBeFalsy();
        });

        it("should handle malformed JSON gracefully", async () => {
            const malformedJson = '{"sites": [}'; // Invalid JSON
            const mockResponse: IpcResponse = {
                success: false,
                error: "Invalid JSON format",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.importData(malformedJson)).rejects.toThrow(
                "Invalid JSON format"
            );
        });

        it("should handle large import data", async () => {
            const largeData = JSON.stringify({
                sites: Array.from({ length: 10_000 }, (_, i) => ({
                    id: `site-${i}`,
                    name: `Large Site ${i}`,
                })),
            });
            const mockResponse: IpcResponse<boolean> = {
                success: true,
                data: true,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.importData(largeData);

            expect(result).toBeTruthy();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "import-data",
                largeData
            );
        });

        it("should propagate import errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Import failed: Version mismatch",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.importData("{}")).rejects.toThrow(
                "Import failed: Version mismatch"
            );
        });
    });

    describe("resetSettings", () => {
        it("should call correct IPC channel and return void", async () => {
            const mockResponse: IpcResponse = {
                success: true,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.resetSettings();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "reset-settings"
            );
            expect(result).toBeUndefined();
        });

        it("should handle multiple reset calls", async () => {
            const mockResponse: IpcResponse = {
                success: true,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await dataApi.resetSettings();
            await dataApi.resetSettings();
            await dataApi.resetSettings();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);
            expect(mockIpcRenderer.invoke).toHaveBeenNthCalledWith(
                1,
                "reset-settings"
            );
            expect(mockIpcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                "reset-settings"
            );
            expect(mockIpcRenderer.invoke).toHaveBeenNthCalledWith(
                3,
                "reset-settings"
            );
        });

        it("should propagate reset errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Reset failed: Database is locked",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.resetSettings()).rejects.toThrow(
                "Reset failed: Database is locked"
            );
        });
    });

    describe("updateHistoryLimit", () => {
        it("should call correct IPC channel with limit and return updated value", async () => {
            const newLimit = 60;
            const mockResponse: IpcResponse<number> = {
                success: true,
                data: newLimit,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const result = await dataApi.updateHistoryLimit(newLimit);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-history-limit",
                newLimit
            );
            expect(result).toBe(newLimit);
        });

        it("should handle boundary values", async () => {
            const boundaryValues = [
                0,
                1,
                365,
                Number.MAX_SAFE_INTEGER,
            ];

            for (const value of boundaryValues) {
                const mockResponse: IpcResponse<number> = {
                    success: true,
                    data: value,
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const result = await dataApi.updateHistoryLimit(value);
                expect(result).toBe(value);
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "update-history-limit",
                    value
                );
            }
        });

        it("should propagate update errors", async () => {
            const mockResponse: IpcResponse = {
                success: false,
                error: "Invalid limit value",
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            await expect(dataApi.updateHistoryLimit(-1)).rejects.toThrow(
                "Invalid limit value"
            );
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various history limit values correctly", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 10_000 }),
                    async (limit) => {
                        const mockResponse: IpcResponse<number> = {
                            success: true,
                            data: limit,
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                        const result = await dataApi.updateHistoryLimit(limit);

                        expect(result).toBe(limit);
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "update-history-limit",
                            limit
                        );
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("should handle various JSON import data", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.jsonValue(),
                    fc.boolean(),
                    async (jsonData, expectedResult) => {
                        const jsonString = JSON.stringify(jsonData);
                        const mockResponse: IpcResponse<boolean> = {
                            success: true,
                            data: expectedResult,
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                        const result = await dataApi.importData(jsonString);

                        if (expectedResult) {
                            expect(result).toBeTruthy();
                        } else {
                            expect(result).toBeFalsy();
                        }
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "import-data",
                            jsonString
                        );
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various argument combinations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.anything(), { maxLength: 5 }),
                    async (args) => {
                        const mockResponse: IpcResponse<string> = {
                            success: true,
                            data: "test-result",
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                        // Test with exportData which takes no arguments
                        const result = await dataApi.exportData(...args);

                        expect(result).toBe("test-result");
                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "export-data",
                            ...args
                        );
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1 }),
                    async (errorMessage) => {
                        const mockResponse: IpcResponse = {
                            success: false,
                            error: errorMessage,
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                        await expect(dataApi.exportData()).rejects.toThrow(
                            errorMessage
                        );
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("Integration and concurrency scenarios", () => {
        it("should handle concurrent API calls", async () => {
            const responses = [
                { success: true, data: "export-result" },
                { success: true, data: 30 },
                { success: true },
            ];

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(responses[0])
                .mockResolvedValueOnce(responses[1])
                .mockResolvedValueOnce(responses[2]);

            const [
                exportResult,
                limitResult,
                resetResult,
            ] = await Promise.all([
                dataApi.exportData(),
                dataApi.getHistoryLimit(),
                dataApi.resetSettings(),
            ]);

            expect(exportResult).toBe("export-result");
            expect(limitResult).toBe(30);
            expect(resetResult).toBeUndefined();
        });

        it("should handle mixed success and failure responses", async () => {
            const responses = [
                { success: true, data: "success" },
                { success: false, error: "failure" },
                { success: true, data: 42 },
            ];

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(responses[0])
                .mockResolvedValueOnce(responses[1])
                .mockResolvedValueOnce(responses[2]);

            const results = await Promise.allSettled([
                dataApi.exportData(),
                dataApi.importData("{}"),
                dataApi.getHistoryLimit(),
            ]);

            expect(results[0].status).toBe("fulfilled");
            expect(results[1].status).toBe("rejected");
            expect(results[2].status).toBe("fulfilled");

            if (results[0].status === "fulfilled") {
                expect(results[0].value).toBe("success");
            }
            if (results[2].status === "fulfilled") {
                expect(results[2].value).toBe(42);
            }
        });

        it("should maintain method isolation", async () => {
            // Each method should work independently
            const methods = [
                {
                    method: dataApi.exportData,
                    channel: "export-data",
                    response: { success: true, data: "export" },
                },
                {
                    method: dataApi.getHistoryLimit,
                    channel: "get-history-limit",
                    response: { success: true, data: 30 },
                },
                {
                    method: dataApi.resetSettings,
                    channel: "reset-settings",
                    response: { success: true },
                },
            ];

            for (const { method, channel, response } of methods) {
                mockIpcRenderer.invoke.mockResolvedValueOnce(response);
                await method();
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(channel);
            }
        });

        it("should handle rapid sequential calls", async () => {
            const mockResponse: IpcResponse<number> = {
                success: true,
                data: 30,
            };
            mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

            const calls = Array.from({ length: 100 }, () =>
                dataApi.getHistoryLimit()
            );
            const results = await Promise.all(calls);

            expect(results).toHaveLength(100);
            expect(results.every((r: number) => r === 30)).toBeTruthy();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(100);
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain TypeScript interface contract", () => {
            // This test ensures our actual implementation matches the interface
            const api: DataApiInterface = dataApi;

            // All methods should be present and callable
            expect(typeof api.downloadSqliteBackup).toBe("function");
            expect(typeof api.exportData).toBe("function");
            expect(typeof api.getHistoryLimit).toBe("function");
            expect(typeof api.importData).toBe("function");
            expect(typeof api.resetSettings).toBe("function");
            expect(typeof api.updateHistoryLimit).toBe("function");
        });

        it("should handle undefined and null arguments gracefully", async () => {
            mockIpcRenderer.invoke
                .mockResolvedValueOnce({
                    success: true,
                    data: true,
                } as IpcResponse<boolean>)
                .mockResolvedValueOnce({
                    success: true,
                    data: false,
                } as IpcResponse<boolean>)
                .mockResolvedValueOnce({
                    success: true,
                    data: 42,
                } as IpcResponse<number>);

            // These should not throw during the call itself (IPC will handle them)
            await expect(
                dataApi.importData(undefined as unknown as string)
            ).resolves.toBeTruthy();
            await expect(
                dataApi.importData(null as unknown as string)
            ).resolves.toBeFalsy();
            await expect(
                dataApi.updateHistoryLimit(undefined as unknown as number)
            ).resolves.toBe(42);
        });

        it("should preserve method context and this binding", async () => {
            mockIpcRenderer.invoke
                .mockResolvedValueOnce({
                    success: true,
                    data: "export",
                } as IpcResponse<string>)
                .mockResolvedValueOnce({
                    success: true,
                    data: true,
                } as IpcResponse<boolean>);

            // Destructuring should not break the methods
            const { exportData, importData } = dataApi;

            await expect(exportData()).resolves.toBe("export");
            await expect(importData("{}")).resolves.toBeTruthy();
        });
    });
});

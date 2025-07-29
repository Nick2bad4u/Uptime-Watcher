/**
 * Tests for useMonitorFields hook
 *
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for the monitor fields hook that manages dynamic form field definitions.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorFieldDefinition } from "@shared/types";

import { useMonitorFields } from "../../hooks/useMonitorFields";
import type { MonitorTypeConfig } from "../../utils/monitorTypeHelper";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

// Mock the IPC utility
vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn(),
}));

// Mock the window.electronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(),
    },
};

// Define in global scope for TypeScript
declare global {
    interface Window {
        electronAPI: typeof mockElectronAPI;
    }
}

// Set up the mock globally
Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("useMonitorFields Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic functionality", () => {
        it("should return initial loading state", () => {
            // Make the IPC call never resolve
            mockElectronAPI.monitorTypes.getMonitorTypes.mockImplementation(() => new Promise(() => {}));

            const { result } = renderHook(() => useMonitorFields());

            expect(result.current.isLoaded).toBe(false);
            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields).toBeInstanceOf(Function);
            expect(result.current.getRequiredFields).toBeInstanceOf(Function);
            expect(result.current.isFieldRequired).toBeInstanceOf(Function);
        });

        it("should load monitor field configurations successfully", async () => {
            const mockFieldDefinitions: MonitorFieldDefinition[] = [
                {
                    name: "url",
                    type: "string",
                    required: true,
                    label: "URL",
                    placeholder: "Enter URL to monitor",
                },
                {
                    name: "timeout",
                    type: "number",
                    required: false,
                    label: "Timeout (ms)",
                    placeholder: "Request timeout",
                },
            ];

            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    fields: mockFieldDefinitions,
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                },
                {
                    type: "ping",
                    fields: [
                        {
                            name: "host",
                            type: "string",
                            required: true,
                            label: "Host",
                            placeholder: "Enter hostname or IP",
                        },
                    ],
                    displayName: "Ping Monitor",
                    description: "Monitor host availability",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            // Wait for loading to complete
            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("http")).toEqual(mockFieldDefinitions);
            expect(result.current.getFields("ping")).toHaveLength(1);
            expect(result.current.getFields("ping")[0].name).toBe("host");
        });

        it("should handle empty configurations", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: [],
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue([]);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("http")).toEqual([]);
            expect(result.current.getFields("any-type")).toEqual([]);
        });
    });

    describe("Field access functions", () => {
        const setupHookWithData = async () => {
            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            type: "string",
                            required: true,
                            label: "URL",
                        },
                        {
                            name: "method",
                            type: "string",
                            required: false,
                            label: "Method",
                        },
                        {
                            name: "timeout",
                            type: "number",
                            required: true,
                            label: "Timeout",
                        },
                    ],
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                },
                {
                    type: "tcp",
                    fields: [
                        {
                            name: "host",
                            type: "string",
                            required: true,
                            label: "Host",
                        },
                        {
                            name: "port",
                            type: "number",
                            required: true,
                            label: "Port",
                        },
                    ],
                    displayName: "TCP Monitor",
                    description: "Monitor TCP connections",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            return result;
        };

        describe("getFields", () => {
            it("should return fields for existing monitor types", async () => {
                const result = await setupHookWithData();

                const httpFields = result.current.getFields("http");
                expect(httpFields).toHaveLength(3);
                expect(httpFields.map((f) => f.name)).toEqual(["url", "method", "timeout"]);

                const tcpFields = result.current.getFields("tcp");
                expect(tcpFields).toHaveLength(2);
                expect(tcpFields.map((f) => f.name)).toEqual(["host", "port"]);
            });

            it("should return empty array for non-existent monitor types", async () => {
                const result = await setupHookWithData();

                expect(result.current.getFields("non-existent")).toEqual([]);
                expect(result.current.getFields("")).toEqual([]);
            });

            it("should be memoized and return stable references", async () => {
                const result = await setupHookWithData();

                const firstCall = result.current.getFields("http");
                const secondCall = result.current.getFields("http");

                expect(firstCall).toBe(secondCall); // Same reference due to memoization
            });
        });

        describe("getRequiredFields", () => {
            it("should return only required field names", async () => {
                const result = await setupHookWithData();

                const httpRequiredFields = result.current.getRequiredFields("http");
                expect(httpRequiredFields).toEqual(["url", "timeout"]);

                const tcpRequiredFields = result.current.getRequiredFields("tcp");
                expect(tcpRequiredFields).toEqual(["host", "port"]);
            });

            it("should return empty array for non-existent monitor types", async () => {
                const result = await setupHookWithData();

                expect(result.current.getRequiredFields("non-existent")).toEqual([]);
            });

            it("should handle monitor types with no required fields", async () => {
                const mockConfigs: MonitorTypeConfig[] = [
                    {
                        type: "optional-only",
                        fields: [
                            {
                                name: "optional1",
                                type: "string",
                                required: false,
                                label: "Optional 1",
                            },
                            {
                                name: "optional2",
                                type: "string",
                                required: false,
                                label: "Optional 2",
                            },
                        ],
                        displayName: "Optional Only Monitor",
                        description: "Monitor with all optional fields",
                    },
                ];

                mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                    success: true,
                    data: mockConfigs,
                });

                const { safeExtractIpcData } = await import("../../types/ipc");
                vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

                const { result } = renderHook(() => useMonitorFields());

                await waitFor(() => {
                    expect(result.current.isLoaded).toBe(true);
                });

                expect(result.current.getRequiredFields("optional-only")).toEqual([]);
            });
        });

        describe("isFieldRequired", () => {
            it("should correctly identify required fields", async () => {
                const result = await setupHookWithData();

                expect(result.current.isFieldRequired("http", "url")).toBe(true);
                expect(result.current.isFieldRequired("http", "timeout")).toBe(true);
                expect(result.current.isFieldRequired("tcp", "host")).toBe(true);
                expect(result.current.isFieldRequired("tcp", "port")).toBe(true);
            });

            it("should correctly identify optional fields", async () => {
                const result = await setupHookWithData();

                expect(result.current.isFieldRequired("http", "method")).toBe(false);
            });

            it("should return false for non-existent fields", async () => {
                const result = await setupHookWithData();

                expect(result.current.isFieldRequired("http", "non-existent-field")).toBe(false);
                expect(result.current.isFieldRequired("non-existent-type", "any-field")).toBe(false);
            });

            it("should handle empty field names", async () => {
                const result = await setupHookWithData();

                expect(result.current.isFieldRequired("http", "")).toBe(false);
            });
        });
    });

    describe("Error handling", () => {
        it("should handle IPC errors", async () => {
            const error = new Error("IPC communication failed");
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(error);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBe("IPC communication failed");
            expect(result.current.getFields("http")).toEqual([]);
        });

        it("should handle non-Error objects", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue("String error");

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBe("Failed to load monitor field configurations");
            expect(result.current.getFields("http")).toEqual([]);
        });

        it("should handle null/undefined errors", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(null);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBe("Failed to load monitor field configurations");
        });

        it("should set isLoaded to true even on error", async () => {
            mockElectronAPI.monitorTypes.getMonitorTypes.mockRejectedValue(new Error("Test error"));

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBeDefined();
            expect(result.current.isLoaded).toBe(true); // Should be true to prevent infinite loading
        });
    });

    describe("IPC data extraction", () => {
        it("should use safeExtractIpcData with correct defaults", async () => {
            const mockResponse = { success: true, data: [] };
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(mockResponse);

            const { safeExtractIpcData } = await import("../../types/ipc");
            const mockExtract = vi.mocked(safeExtractIpcData);
            mockExtract.mockReturnValue([]);

            renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(mockExtract).toHaveBeenCalledWith(mockResponse, []);
            });
        });

        it("should handle malformed IPC responses gracefully", async () => {
            const malformedResponse = { success: false, error: "Something went wrong" };
            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue(malformedResponse);

            const { safeExtractIpcData } = await import("../../types/ipc");
            const mockExtract = vi.mocked(safeExtractIpcData);
            mockExtract.mockReturnValue([]); // Fallback to empty array

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            expect(result.current.error).toBeUndefined();
            expect(result.current.getFields("any-type")).toEqual([]);
        });
    });

    describe("Function memoization and stability", () => {
        it("should provide stable function references", async () => {
            const mockConfigs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            type: "string",
                            required: true,
                            label: "URL",
                        },
                    ],
                    displayName: "HTTP Monitor",
                    description: "Monitor HTTP endpoints",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result, rerender } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            const initialGetFields = result.current.getFields;
            const initialGetRequiredFields = result.current.getRequiredFields;
            const initialIsFieldRequired = result.current.isFieldRequired;

            // Force a re-render
            rerender();

            // Functions should remain the same references due to useCallback
            expect(result.current.getFields).toBe(initialGetFields);
            expect(result.current.getRequiredFields).toBe(initialGetRequiredFields);
            expect(result.current.isFieldRequired).toBe(initialIsFieldRequired);
        });
    });

    describe("Edge cases", () => {
        it("should handle configs with missing field properties", async () => {
            const mockConfigs = [
                {
                    type: "incomplete",
                    fields: [
                        {
                            name: "field1",
                            type: "string",
                            // Missing required property
                            label: "Field 1",
                        } as MonitorFieldDefinition,
                    ],
                    displayName: "Incomplete Monitor",
                    description: "Monitor with incomplete field def",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            // Should handle gracefully - missing required defaults to false
            expect(result.current.isFieldRequired("incomplete", "field1")).toBe(false);
            expect(result.current.getRequiredFields("incomplete")).toEqual([]);
        });

        it("should handle configs with no fields array", async () => {
            const mockConfigs = [
                {
                    type: "no-fields",
                    fields: undefined as any,
                    displayName: "No Fields Monitor",
                    description: "Monitor with no fields",
                },
            ];

            mockElectronAPI.monitorTypes.getMonitorTypes.mockResolvedValue({
                success: true,
                data: mockConfigs,
            });

            const { safeExtractIpcData } = await import("../../types/ipc");
            vi.mocked(safeExtractIpcData).mockReturnValue(mockConfigs);

            const { result } = renderHook(() => useMonitorFields());

            await waitFor(() => {
                expect(result.current.isLoaded).toBe(true);
            });

            // Should not crash and return empty arrays
            expect(result.current.getFields("no-fields")).toEqual([]);
            expect(result.current.getRequiredFields("no-fields")).toEqual([]);
            expect(result.current.isFieldRequired("no-fields", "any-field")).toBe(false);
        });
    });
});

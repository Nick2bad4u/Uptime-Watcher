/**
 * Comprehensive tests for the Monitor Types preload domain API.
 *
 * @remarks
 * This suite verifies that the preload bridge enforces the shared IPC contract:
 *
 * - `getMonitorTypes` resolves to `MonitorTypeConfig[]`
 * - Malformed payloads from the main process are rejected
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

import type { Monitor } from "@shared/types";
import type { MonitorFieldDefinition } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";

const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

import {
    monitorTypesApi,
    type MonitorTypesApiInterface,
} from "../../../preload/domains/monitorTypesApi";

const createIpcResponse = <T>(data: T) => ({ success: true, data });

const fieldDefinitionArb: fc.Arbitrary<MonitorFieldDefinition> = fc.record({
    label: fc.string({ minLength: 1, maxLength: 32 }),
    name: fc.string({ minLength: 1, maxLength: 32 }),
    required: fc.boolean(),
    type: fc.constantFrom("number", "select", "text", "url"),
});

const monitorTypeConfigArb: fc.Arbitrary<MonitorTypeConfig> = fc.record({
    description: fc.string({ minLength: 1, maxLength: 120 }),
    displayName: fc.string({ minLength: 1, maxLength: 64 }),
    fields: fc.array(fieldDefinitionArb, { minLength: 1, maxLength: 10 }),
    type: fc.string({ minLength: 1, maxLength: 32 }),
    version: fc.string({ minLength: 1, maxLength: 16 }),
});

describe("monitorTypesApi", () => {
    let api: MonitorTypesApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = monitorTypesApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("exposes the expected API surface", () => {
        expect(api).toHaveProperty("formatMonitorDetail");
        expect(api).toHaveProperty("formatMonitorTitleSuffix");
        expect(api).toHaveProperty("getMonitorTypes");
        expect(api).toHaveProperty("validateMonitorData");
    });

    it("formatMonitorDetail invokes IPC", async () => {
        mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse("detail"));

        await expect(api.formatMonitorDetail("http", "detail")).resolves.toBe(
            "detail"
        );
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
            MONITOR_TYPES_CHANNELS.formatMonitorDetail,
            "http",
            "detail",
            ipcContext
        );
    });

    it("formatMonitorTitleSuffix invokes IPC", async () => {
        const monitor: Monitor = {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 0,
            status: "up",
            timeout: 30_000,
            type: "http",
        };

        mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse("(HTTP)"));

        await expect(
            api.formatMonitorTitleSuffix("http", monitor)
        ).resolves.toBe("(HTTP)");
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
            MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix,
            "http",
            monitor,
            ipcContext
        );
    });

    it("validateMonitorData invokes IPC", async () => {
        const validationResult: ValidationResult = {
            errors: [],
            success: true,
            warnings: [],
        };

        mockIpcRenderer.invoke.mockResolvedValue(
            createIpcResponse(validationResult)
        );

        await expect(
            api.validateMonitorData("http", { url: "https://example.com" })
        ).resolves.toEqual(validationResult);
        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
            MONITOR_TYPES_CHANNELS.validateMonitorData,
            "http",
            { url: "https://example.com" },
            ipcContext
        );
    });

    describe("getMonitorTypes", () => {
        it("invokes IPC and returns MonitorTypeConfig[]", async () => {
            const configs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP Monitor",
                    description: "Monitors HTTP endpoints",
                    fields: [
                        {
                            label: "URL",
                            name: "url",
                            required: true,
                            type: "url",
                        },
                    ],
                    version: "1.0.0",
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(configs)
            );

            const result = await api.getMonitorTypes();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                MONITOR_TYPES_CHANNELS.getMonitorTypes,
                ipcContext
            );
            expect(result).toEqual(configs);
        });

        it("accepts an empty list", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse([]));
            await expect(api.getMonitorTypes()).resolves.toEqual([]);
        });

        it("rejects non-array payloads", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse({ not: "an array" })
            );

            await expect(api.getMonitorTypes()).rejects.toThrowError(
                /failed validation/i
            );
        });

        it("rejects arrays containing invalid entries", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse([
                    {
                        type: "http",
                        displayName: "HTTP Monitor",
                        description: "Monitors HTTP endpoints",
                        fields: [
                            {
                                label: "URL",
                                name: "url",
                                required: true,
                                type: "url",
                            },
                        ],
                        version: "1.0.0",
                    },
                    // Invalid config
                    { type: "bad" },
                ])
            );

            await expect(api.getMonitorTypes()).rejects.toThrowError(
                /failed validation/i
            );
        });

        it("propagates IPC invocation failures", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(
                new Error("Failed to load monitor types")
            );

            await expect(api.getMonitorTypes()).rejects.toThrowError(
                "Failed to load monitor types"
            );
        });

        it("supports concurrent calls for valid payloads", async () => {
            const configs: MonitorTypeConfig[] = [
                {
                    type: "http",
                    displayName: "HTTP Monitor",
                    description: "Monitors HTTP endpoints",
                    fields: [
                        {
                            label: "URL",
                            name: "url",
                            required: true,
                            type: "url",
                        },
                    ],
                    version: "1.0.0",
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(configs)
            );

            const results = await Promise.all([
                api.getMonitorTypes(),
                api.getMonitorTypes(),
                api.getMonitorTypes(),
            ]);

            for (const result of results) {
                expect(result).toEqual(configs);
            }
        });

        it("property: resolves to the mocked valid configs", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(monitorTypeConfigArb, {
                        minLength: 0,
                        maxLength: 20,
                    }),
                    async (configs) => {
                        vi.clearAllMocks();
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(configs)
                        );

                        await expect(api.getMonitorTypes()).resolves.toEqual(
                            configs
                        );
                    }
                ),
                { numRuns: 25 }
            );
        });
    });
});

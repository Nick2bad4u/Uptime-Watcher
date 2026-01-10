/**
 * Comprehensive unit coverage for bridge factory utilities bridging the
 * renderer and main processes.
 */

import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import { ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";

import {
    createTypedInvoker,
    createVoidInvoker,
    createEventManager,
    IpcError,
    resetDiagnosticsVerificationStateForTesting,
    type IpcResponse,
} from "../../../preload/core/bridgeFactory";
import type {
    IpcHandlerVerificationResult,
    IpcInvokeChannel,
    IpcInvokeChannelParams,
} from "@shared/types/ipc";
import {
    DATA_CHANNELS,
    DIAGNOSTICS_CHANNELS,
    MONITORING_CHANNELS,
    MONITOR_TYPES_CHANNELS,
    SETTINGS_CHANNELS,
    SITES_CHANNELS,
    STATE_SYNC_CHANNELS,
} from "@shared/types/preload";
import type { Site } from "@shared/types";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

const formatDetailChannel: IpcInvokeChannel =
    MONITOR_TYPES_CHANNELS.formatMonitorDetail;
const startMonitoringChannel: IpcInvokeChannel =
    MONITORING_CHANNELS.startMonitoring;
const resetSettingsChannel: IpcInvokeChannel = SETTINGS_CHANNELS.resetSettings;

function createHandshakeSuccess(
    channel: string,
    availableChannels: string[] = [channel]
): IpcResponse<IpcHandlerVerificationResult> {
    return {
        success: true,
        data: {
            availableChannels,
            channel,
            registered: true,
        },
    };
}

function createHandshakeFailure(
    channel: string,
    availableChannels: string[] = []
): IpcResponse<IpcHandlerVerificationResult> {
    return {
        success: true,
        data: {
            availableChannels,
            channel,
            registered: false,
        },
    };
}

describe("bridgeFactory", function describeBridgeFactorySuite() {
    beforeEach(() => {
        (globalThis as Record<string, unknown>)[
            "__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__"
        ] = false;
        resetDiagnosticsVerificationStateForTesting();
        vi.clearAllMocks();
    });

    afterEach(() => {
        delete (globalThis as Record<string, unknown>)[
            "__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__"
        ];
        vi.clearAllMocks();
    });

    // eslint-disable-next-line vitest/prefer-describe-function-title -- Vitest requires string titles; using literal keeps clarity
    describe("createTypedInvoker", () => {
        it("invokes IPC with typed parameters and propagates data", async () => {
            const response: IpcResponse<string> = {
                success: true,
                data: "detail",
            };
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(formatDetailChannel)
                )
                .mockResolvedValueOnce(response);

            const invoke = createTypedInvoker(formatDetailChannel);
            const result = await invoke("http", "status-page");

            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                1,
                DIAGNOSTICS_CHANNELS.verifyIpcHandler,
                formatDetailChannel
            );
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                formatDetailChannel,
                "http",
                "status-page",
                expect.objectContaining({
                    __uptimeWatcherIpcContext: true,
                    correlationId: expect.any(String),
                })
            );
            expect(result).toBe("detail");
        });

        it("allows success responses without data for optional-result channels", async () => {
            const missingDataResponse: IpcResponse = {
                success: true,
            };

            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(MONITORING_CHANNELS.checkSiteNow)
                )
                .mockResolvedValueOnce(missingDataResponse);

            const invoke = createTypedInvoker(MONITORING_CHANNELS.checkSiteNow);

            await expect(
                invoke("site-id", "monitor-id")
            ).resolves.toBeUndefined();
        });

        it("throws an IpcError when the response is unsuccessful", async () => {
            const errorResponse: IpcResponse = {
                success: false,
                error: "failure",
            };
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(startMonitoringChannel)
                )
                .mockResolvedValueOnce(errorResponse);

            const invoke = createTypedInvoker(startMonitoringChannel);

            await expect(invoke()).rejects.toBeInstanceOf(IpcError);
            await expect(invoke()).rejects.toThrowError(
                "IPC call failed for channel 'start-monitoring'"
            );
        });

        it("wraps unexpected exceptions in an IpcError", async () => {
            const error = new Error("ipc failure");
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(startMonitoringChannel)
                )
                .mockRejectedValueOnce(error);

            const invoke = createTypedInvoker(startMonitoringChannel);

            await expect(invoke()).rejects.toMatchObject({
                message: expect.stringContaining("ipc failure"),
                channel: startMonitoringChannel,
            });
        });

        it("validates successful responses contain data", async () => {
            const missingDataResponse: IpcResponse = {
                success: true,
            };
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(formatDetailChannel)
                )
                .mockResolvedValueOnce(missingDataResponse);

            const invoke = createTypedInvoker(formatDetailChannel);

            await expect(invoke("http", "detail")).rejects.toThrowError(
                "IPC response missing data field"
            );
        });

        it("throws an IpcError when diagnostics reports an unregistered handler", async () => {
            const missingChannel: IpcInvokeChannel =
                STATE_SYNC_CHANNELS.requestFullSync;

            vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce(
                createHandshakeFailure(missingChannel)
            );

            const invoke = createTypedInvoker(missingChannel);

            await expect(invoke()).rejects.toMatchObject({
                message: expect.stringContaining("No handler registered"),
                channel: missingChannel,
            });

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                DIAGNOSTICS_CHANNELS.verifyIpcHandler,
                missingChannel
            );
        });

        it("rejects oversized invoke arguments before any IPC calls", async () => {
            const invoke = createTypedInvoker(formatDetailChannel);

            const huge = "a".repeat(6_000_000);
            await expect(invoke("http", huge)).rejects.toBeInstanceOf(IpcError);

            expect(ipcRenderer.invoke).not.toHaveBeenCalled();
        });

        it("allows larger payloads for import-data within its budget", async () => {
            const response: IpcResponse<boolean> = {
                success: true,
                data: true,
            };

            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(DATA_CHANNELS.importData)
                )
                .mockResolvedValueOnce(response);

            const invoke = createTypedInvoker(DATA_CHANNELS.importData);
            const payload = "a".repeat(6_000_000);

            await expect(invoke(payload)).resolves.toBeTruthy();
        });
    });

    // eslint-disable-next-line vitest/prefer-describe-function-title -- Vitest requires string titles; using literal keeps clarity
    describe("createVoidInvoker", () => {
        it("resolves when the response is successful", async () => {
            const response: IpcResponse = { success: true };
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(resetSettingsChannel)
                )
                .mockResolvedValueOnce(response);

            const reset = createVoidInvoker(resetSettingsChannel);
            await expect(reset()).resolves.toBeUndefined();
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                1,
                DIAGNOSTICS_CHANNELS.verifyIpcHandler,
                resetSettingsChannel
            );
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                resetSettingsChannel,
                expect.objectContaining({
                    __uptimeWatcherIpcContext: true,
                    correlationId: expect.any(String),
                })
            );
        });

        it("throws IpcError when validation fails", async () => {
            const response: IpcResponse = {
                success: false,
                error: "reset-denied",
            };
            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(resetSettingsChannel)
                )
                .mockResolvedValueOnce(response);

            const reset = createVoidInvoker(resetSettingsChannel);
            await expect(reset()).rejects.toBeInstanceOf(IpcError);
        });
    });

    // eslint-disable-next-line vitest/prefer-describe-function-title -- Vitest requires string titles; using literal keeps clarity
    describe("createEventManager", () => {
        it("registers and unregisters listeners", () => {
            const handler = vi.fn();
            vi.mocked(ipcRenderer.on).mockImplementationOnce((_channel, cb) => {
                cb({} as IpcRendererEvent, "payload");
                return ipcRenderer;
            });

            const { on } = createEventManager("sites-updated");
            const dispose = on(handler);

            expect(handler).toHaveBeenCalledWith("payload");
            dispose();
            expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
                "sites-updated",
                expect.any(Function)
            );
        });
    });

    describe("typed channel utility", () => {
        it("enforces parameter tuples at compile time", async () => {
            const invoke = createTypedInvoker(SITES_CHANNELS.removeMonitor);

            const args: IpcInvokeChannelParams<
                typeof SITES_CHANNELS.removeMonitor
            > = ["site-1", "monitor-1"];

            const persistedSite = {
                identifier: "site-1",
                monitoring: true,
                monitors: [],
                name: "Site",
            } satisfies Site;

            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(SITES_CHANNELS.removeMonitor)
                )
                .mockResolvedValueOnce({
                    data: persistedSite,
                    success: true,
                });

            await expect(invoke(...args)).resolves.toEqual(persistedSite);
            expect(typeof invoke).toBe("function");

            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                1,
                DIAGNOSTICS_CHANNELS.verifyIpcHandler,
                SITES_CHANNELS.removeMonitor
            );
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                SITES_CHANNELS.removeMonitor,
                "site-1",
                "monitor-1",
                expect.objectContaining({
                    __uptimeWatcherIpcContext: true,
                    correlationId: expect.any(String),
                })
            );
        });

        it("rejects invalid channel usage", async () => {
            const invoke = createTypedInvoker(startMonitoringChannel);

            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(
                    createHandshakeSuccess(startMonitoringChannel)
                )
                .mockResolvedValueOnce({
                    success: true,
                });

            await expect(invoke()).rejects.toThrowError(
                "IPC response missing data field"
            );
        });
    });

    // eslint-disable-next-line vitest/prefer-describe-function-title -- Vitest requires string titles; using literal keeps clarity
    describe("IpcError", () => {
        it("captures channel, original error, and details", () => {
            const inner = new Error("failure");
            const details = { context: "test" } as const;
            const error = new IpcError(
                "message",
                DATA_CHANNELS.exportData,
                inner,
                details
            );

            expect(error.message).toBe("message");
            expect(error.channel).toBe(DATA_CHANNELS.exportData);
            expect(error.originalError).toBe(inner);
            expect(error.details).toEqual(details);
            expect(error.details).not.toBe(details);
            expect(Object.isFrozen(error.details)).toBeTruthy();
        });
    });
});

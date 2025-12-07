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
import type { Site } from "@shared/types";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

const formatDetailChannel = "format-monitor-detail" satisfies IpcInvokeChannel;
const startMonitoringChannel = "start-monitoring" satisfies IpcInvokeChannel;
const resetSettingsChannel = "reset-settings" satisfies IpcInvokeChannel;
const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

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
                "diagnostics-verify-ipc-handler",
                formatDetailChannel
            );
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                formatDetailChannel,
                "http",
                "status-page",
                ipcContext
            );
            expect(result).toBe("detail");
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
            const missingChannel =
                "request-full-sync" satisfies IpcInvokeChannel;

            vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce(
                createHandshakeFailure(missingChannel)
            );

            const invoke = createTypedInvoker(missingChannel);

            await expect(invoke()).rejects.toMatchObject({
                message: expect.stringContaining("No handler registered"),
                channel: missingChannel,
            });

            expect(ipcRenderer.invoke).toHaveBeenCalledWith(
                "diagnostics-verify-ipc-handler",
                missingChannel
            );
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
                "diagnostics-verify-ipc-handler",
                resetSettingsChannel
            );
            expect(ipcRenderer.invoke).toHaveBeenNthCalledWith(
                2,
                resetSettingsChannel,
                ipcContext
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
            const invoke = createTypedInvoker("remove-monitor");

            const args: IpcInvokeChannelParams<"remove-monitor"> = [
                "site-1",
                "monitor-1",
            ];

            const persistedSite = {
                identifier: "site-1",
                monitoring: true,
                monitors: [],
                name: "Site",
            } satisfies Site;

            vi.mocked(ipcRenderer.invoke)
                .mockResolvedValueOnce(createHandshakeSuccess("remove-monitor"))
                .mockResolvedValueOnce({
                    data: persistedSite,
                    success: true,
                });

            await expect(invoke(...args)).resolves.toEqual(persistedSite);
            expect(typeof invoke).toBe("function");
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
                "export-data",
                inner,
                details
            );

            expect(error.message).toBe("message");
            expect(error.channel).toBe("export-data");
            expect(error.originalError).toBe(inner);
            expect(error.details).toEqual(details);
            expect(error.details).not.toBe(details);
            expect(Object.isFrozen(error.details)).toBeTruthy();
        });
    });
});

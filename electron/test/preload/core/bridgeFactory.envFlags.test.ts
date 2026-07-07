/**
 * Bridge factory environment flag hardening tests.
 *
 * @remarks
 * The preload bridge uses a diagnostics fallback mode during tests. This test
 * ensures we only enable that mode when the `VITEST` env flag is explicitly
 * truthy, preventing accidental skips of handler verification.
 */

import type {
    IpcHandlerVerificationResult,
    IpcResponse,
} from "@shared/types/ipc";

import { DIAGNOSTICS_CHANNELS, SETTINGS_CHANNELS } from "@shared/types/preload";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

interface GlobalProcessSnapshot {
    env?: Record<string, string | undefined>;
}

describe("bridgeFactory env flags", () => {
    const globalTarget = globalThis as Record<string, unknown> & {
        __UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__?: unknown;
        process?: unknown;
    };

    const channelUnderTest = SETTINGS_CHANNELS.resetSettings;

    let originalProcess: unknown;

    beforeEach(() => {
        originalProcess = globalTarget.process;

        // Important: ensure the override flag is not set so the bridge factory
        // must rely on env parsing.
        delete globalTarget.__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__;

        // Ensure VITEST is present but explicitly false.
        globalTarget.process = {
            env: {
                NODE_ENV: "production",
                VITEST: "false",
            },
        } satisfies GlobalProcessSnapshot;

        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        delete globalTarget.__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__;

        if (originalProcess === undefined) {
            delete globalTarget.process;
        } else {
            globalTarget.process = originalProcess;
        }

        vi.clearAllMocks();
    });

    it('does not treat VITEST="false" as enabling diagnostics fallback', async () => {
        const bridgeFactory =
            await import("../../../preload/core/bridgeFactory");

        const handshake: IpcResponse<IpcHandlerVerificationResult> = {
            success: true,
            data: {
                availableChannels: [channelUnderTest],
                channel: channelUnderTest,
                registered: true,
            },
        };

        vi.mocked(ipcRendererMock.invoke)
            .mockResolvedValueOnce(handshake)
            .mockResolvedValueOnce({ success: true });

        const invoke = bridgeFactory.createVoidInvoker(channelUnderTest);
        await invoke();

        expect(ipcRendererMock.invoke).toHaveBeenNthCalledWith(
            1,
            DIAGNOSTICS_CHANNELS.verifyIpcHandler,
            channelUnderTest
        );
    });

    it("does not invoke accessor-backed env entries during diagnostics fallback checks", async () => {
        let nodeEnvAccesses = 0;
        const env = {
            VITEST: "true",
        };
        Object.defineProperty(env, "NODE_ENV", {
            configurable: true,
            enumerable: true,
            get: () => {
                nodeEnvAccesses += 1;
                throw new Error("Unexpected NODE_ENV getter access");
            },
        });
        globalTarget.process = { env } satisfies GlobalProcessSnapshot;
        vi.resetModules();

        const bridgeFactory =
            await import("../../../preload/core/bridgeFactory");
        vi.mocked(ipcRendererMock.invoke).mockResolvedValueOnce({
            success: true,
        });

        const invoke = bridgeFactory.createVoidInvoker(channelUnderTest);
        await expect(invoke()).resolves.toBeUndefined();
        expect(nodeEnvAccesses).toBe(0);
    });

    it("does not invoke accessor-backed process env during diagnostics fallback checks", async () => {
        let envAccesses = 0;
        const processCandidate = {};
        Object.defineProperty(processCandidate, "env", {
            configurable: true,
            enumerable: true,
            get: () => {
                envAccesses += 1;
                throw new Error("Unexpected process.env getter access");
            },
        });
        globalTarget.process = processCandidate;
        vi.resetModules();

        const bridgeFactory =
            await import("../../../preload/core/bridgeFactory");
        const handshake: IpcResponse<IpcHandlerVerificationResult> = {
            success: true,
            data: {
                availableChannels: [channelUnderTest],
                channel: channelUnderTest,
                registered: true,
            },
        };

        vi.mocked(ipcRendererMock.invoke)
            .mockResolvedValueOnce(handshake)
            .mockResolvedValueOnce({ success: true });

        const invoke = bridgeFactory.createVoidInvoker(channelUnderTest);
        await expect(invoke()).resolves.toBeUndefined();
        expect(envAccesses).toBe(0);
        expect(ipcRendererMock.invoke).toHaveBeenNthCalledWith(
            1,
            DIAGNOSTICS_CHANNELS.verifyIpcHandler,
            channelUnderTest
        );
    });
});

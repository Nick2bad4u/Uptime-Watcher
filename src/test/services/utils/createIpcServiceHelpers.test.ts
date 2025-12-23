/**
 * Tests for guarded IPC service helper utilities to ensure consistent
 * initialization semantics and error handling across renderer services.
 */

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import type { ElectronBridgeContract } from "../../../services/utils/electronBridgeReadiness";

interface SetupOverrides {
    readonly electronLog?: {
        readonly debug: ReturnType<typeof vi.fn>;
        readonly error: ReturnType<typeof vi.fn>;
    };
    readonly loggerModule?: Record<string, unknown>;
}

const createEnsureErrorMock = () =>
    vi.fn((error: unknown) =>
        error instanceof Error ? error : new Error(String(error))
    );

const setupModule = async (overrides: SetupOverrides = {}) => {
    vi.resetModules();

    const waitForElectronBridge = vi.fn(async () => undefined);

    const ensureError = createEnsureErrorMock();
    const loggerError = vi.fn();
    const loggerDebug = vi.fn();
    const electronLog = overrides.electronLog ?? {
        debug: vi.fn(),
        error: vi.fn(),
    };

    class TestElectronBridgeNotReadyError extends Error {
        public readonly diagnostics: unknown;

        public constructor(message: string, diagnostics?: unknown) {
            super(message);
            this.name = "TestElectronBridgeNotReadyError";
            this.diagnostics = diagnostics;
        }
    }

    vi.doMock("@shared/utils/errorHandling", () => ({ ensureError }));
    vi.doMock("electron-log/renderer", () => ({ default: electronLog }));

    const loggerModule =
        overrides.loggerModule ??
        ({
            Logger: { error: loggerError, debug: loggerDebug },
            logger: { error: loggerError, debug: loggerDebug },
        } satisfies Record<string, unknown>);
    vi.doMock("../../../services/logger", () => loggerModule);

    vi.doMock("../../../services/utils/electronBridgeReadiness", () => ({
        ElectronBridgeNotReadyError: TestElectronBridgeNotReadyError,
        waitForElectronBridge,
    }));

    const module =
        await import("../../../services/utils/createIpcServiceHelpers");

    return {
        TestElectronBridgeNotReadyError,
        electronLog,
        ensureError,
        loggerDebug,
        loggerError,
        module,
        waitForElectronBridge,
    };
};

beforeEach(() => {
    vi.stubGlobal("window", {
        electronAPI: {
            invoke: vi.fn(),
        },
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe("createIpcServiceHelpers", () => {
    it("merges bridge options and contracts before waiting for readiness", async () => {
        const { module, waitForElectronBridge } = await setupModule();
        waitForElectronBridge.mockResolvedValueOnce(undefined);
        const contract: ElectronBridgeContract = {
            domain: "events",
            methods: ["publish"],
        };

        const helpers = module.createIpcServiceHelpers("SitesService", {
            bridgeContracts: [contract],
            bridgeOptions: {
                baseDelay: 75,
                maxAttempts: 4,
            },
        });

        await helpers.ensureInitialized();

        expect(waitForElectronBridge).toHaveBeenCalledTimes(1);
        expect(waitForElectronBridge).toHaveBeenCalledWith({
            baseDelay: 75,
            contracts: [contract],
            maxAttempts: 4,
        });
    });

    it("logs diagnostics and rethrows when the preload bridge never becomes ready", async () => {
        const {
            TestElectronBridgeNotReadyError,
            ensureError,
            loggerError,
            module,
            waitForElectronBridge,
        } = await setupModule();

        const diagnostics = { reason: "timeout" } as const;
        const failure = new TestElectronBridgeNotReadyError(
            "Bridge not ready",
            diagnostics
        );
        waitForElectronBridge.mockRejectedValueOnce(failure);

        const helpers = module.createIpcServiceHelpers("SiteSync");

        await expect(helpers.ensureInitialized()).rejects.toBe(failure);

        expect(ensureError).toHaveBeenCalledWith(failure);
        expect(loggerError).toHaveBeenCalledWith(
            "[SiteSync] Failed to initialize:",
            failure,
            { diagnostics }
        );
    });

    it("logs initialization failures for unexpected errors", async () => {
        const { ensureError, loggerError, module, waitForElectronBridge } =
            await setupModule();
        const failure = new Error("something exploded");
        waitForElectronBridge.mockRejectedValueOnce(failure);

        const helpers = module.createIpcServiceHelpers("MetricsService");

        await expect(helpers.ensureInitialized()).rejects.toBe(failure);

        expect(ensureError).toHaveBeenCalledWith(failure);
        expect(loggerError).toHaveBeenCalledWith(
            "[MetricsService] Failed to initialize:",
            failure
        );
    });

    it("wraps handler execution with readiness check and consistent error logging", async () => {
        const { ensureError, loggerError, module, waitForElectronBridge } =
            await setupModule();
        waitForElectronBridge.mockResolvedValueOnce(undefined);
        const helpers = module.createIpcServiceHelpers("HistoryService");
        const handlerError = new Error("handler failed");
        const handler = vi.fn(
            async (_api: typeof window.electronAPI, _siteId: string) => {
                throw handlerError;
            }
        );

        const wrapped = helpers.wrap("fetchHistory", handler);

        await expect(wrapped("site-123")).rejects.toBe(handlerError);

        expect(waitForElectronBridge).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(window.electronAPI, "site-123");
        expect(ensureError).toHaveBeenCalledWith(handlerError);
        expect(loggerError).toHaveBeenCalledWith(
            "[HistoryService] fetchHistory failed:",
            handlerError
        );
    });

    it("falls back to an electron-log structured logger when no shared logger is available", async () => {
        const loggerModule = {
            get Logger(): never {
                throw new Error("Logger getter should not be invoked");
            },
            get logger(): never {
                throw new Error("logger getter should not be invoked");
            },
        } satisfies Record<string, unknown>;
        const electronLog = {
            debug: vi.fn(),
            error: vi.fn(),
        } as const;

        const { module, waitForElectronBridge } = await setupModule({
            electronLog,
            loggerModule,
        });
        waitForElectronBridge.mockResolvedValueOnce(undefined);

        const helpers = module.createIpcServiceHelpers("FallbackService");
        const failure = new Error("operation failed");
        const handler = vi.fn(async () => {
            throw failure;
        });

        const wrapped = helpers.wrap("synchronize", handler);

        await expect(wrapped()).rejects.toBe(failure);

        expect(electronLog.error).toHaveBeenCalledWith(
            "[FallbackService] [FallbackService] synchronize failed:",
            failure
        );
        expect(electronLog.debug).not.toHaveBeenCalled();
    });
});

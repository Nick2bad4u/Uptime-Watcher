/**
 * Tests for guarded IPC service helper utilities to ensure consistent
 * initialization semantics and error handling across renderer services.
 */

import type { UnknownRecord } from "type-fest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ElectronBridgeContract } from "../../../services/utils/electronBridgeReadiness";

interface SetupOverrides {
    readonly electronLog?: {
        readonly debug: ReturnType<typeof vi.fn>;
        readonly error: ReturnType<typeof vi.fn>;
    };
    readonly loggerModule?: UnknownRecord;
}

const createEnsureErrorMock = () =>
    vi.fn((error: unknown) =>
        Error.isError(error) ? error : new Error(String(error))
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

        public constructor(
            messageOrDiagnostics: unknown,
            diagnostics?: unknown
        ) {
            super(
                typeof messageOrDiagnostics === "string"
                    ? messageOrDiagnostics
                    : "Bridge not ready"
            );
            this.name = "TestElectronBridgeNotReadyError";
            this.diagnostics =
                diagnostics === undefined ? messageOrDiagnostics : diagnostics;
        }
    }

    vi.doMock("@shared/utils/errorHandling", () => ({ ensureError }));
    vi.doMock("electron-log/renderer", () => ({ default: electronLog }));

    const loggerModule =
        overrides.loggerModule ??
        ({
            Logger: { error: loggerError, debug: loggerDebug },
            logger: { error: loggerError, debug: loggerDebug },
        } satisfies UnknownRecord);
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

const getStubbedElectronAPI = (): typeof window.electronAPI => {
    const windowRef = Reflect.get(globalThis, "window");
    if (windowRef === undefined || typeof windowRef !== "object") {
        throw new Error("Stubbed window is not installed");
    }

    if (!("electronAPI" in windowRef)) {
        throw new Error("Stubbed window.electronAPI is not installed");
    }

    return (windowRef as typeof window).electronAPI;
};

describe("getIpcServiceHelpers", () => {
    it("merges bridge options and contracts before waiting for readiness", async () => {
        const { module, waitForElectronBridge } = await setupModule();
        waitForElectronBridge.mockResolvedValueOnce(undefined);
        const contract: ElectronBridgeContract = {
            domain: "events",
            methods: ["publish"],
        };

        const helpers = module.getIpcServiceHelpers("SitesService", {
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

    it("reuses a shared initialization promise across calls", async () => {
        const { module, waitForElectronBridge } = await setupModule();

        let resolveInit: (() => void) | undefined;
        const pending = new Promise<undefined>((resolve) => {
            resolveInit = (): void => {
                resolve(undefined);
            };
        });

        waitForElectronBridge.mockReturnValueOnce(pending);

        const helpers = module.getIpcServiceHelpers("SitesService");

        const first = helpers.ensureInitialized();
        const second = helpers.ensureInitialized();

        expect(second).toBe(first);
        expect(waitForElectronBridge).toHaveBeenCalledTimes(1);

        resolveInit?.();
        await expect(first).resolves.toBeUndefined();

        // After the in-flight promise is cleared, subsequent calls should
        // re-validate the bridge.
        await helpers.ensureInitialized();
        expect(waitForElectronBridge).toHaveBeenCalledTimes(2);
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

        const helpers = module.getIpcServiceHelpers("SiteSync");

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

        const helpers = module.getIpcServiceHelpers("MetricsService");

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
        const helpers = module.getIpcServiceHelpers("HistoryService");
        const handlerError = new Error("handler failed");
        const handler = vi.fn(
            async (
                _api: typeof window.electronAPI,
                _siteIdentifier: string
            ) => {
                throw handlerError;
            }
        );

        const wrapped = helpers.wrap("fetchHistory", handler);

        await expect(wrapped("site-123")).rejects.toBe(handlerError);

        expect(waitForElectronBridge).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            getStubbedElectronAPI(),
            "site-123"
        );
        expect(ensureError).toHaveBeenCalledWith(handlerError);
        expect(loggerError).toHaveBeenCalledWith(
            "[HistoryService] fetchHistory failed:",
            handlerError
        );
    });

    it("wraps handler execution with accessor-backed window globals", async () => {
        const { module, waitForElectronBridge } = await setupModule();
        waitForElectronBridge.mockResolvedValueOnce(undefined);
        const electronAPI = { invoke: vi.fn() };
        let accessCount = 0;

        vi.stubGlobal(
            "window",
            Object.defineProperty({}, "electronAPI", {
                configurable: true,
                enumerable: true,
                value: electronAPI,
            })
        );
        Object.defineProperty(globalThis, "window", {
            configurable: true,
            enumerable: true,
            get() {
                accessCount += 1;
                return {
                    electronAPI,
                };
            },
        });

        const helpers = module.getIpcServiceHelpers("AccessorService");
        const handler = vi.fn(async (api: typeof window.electronAPI) => api);

        await expect(helpers.wrap("load", handler)()).resolves.toBe(
            electronAPI
        );

        expect(accessCount).toBeGreaterThan(0);
        expect(handler).toHaveBeenCalledWith(electronAPI);
    });

    it("does not invoke electronAPI accessors while resolving the wrapped handler bridge", async () => {
        const {
            TestElectronBridgeNotReadyError,
            ensureError,
            loggerError,
            module,
            waitForElectronBridge,
        } = await setupModule();
        waitForElectronBridge.mockResolvedValueOnce(undefined);
        let accessCount = 0;

        vi.stubGlobal(
            "window",
            Object.defineProperty({}, "electronAPI", {
                configurable: true,
                enumerable: true,
                get() {
                    accessCount += 1;
                    return { invoke: vi.fn() };
                },
            })
        );

        const helpers = module.getIpcServiceHelpers("AccessorService", {
            bridgeContracts: [{ domain: "sites" }],
        });
        const handler = vi.fn(async () => undefined);

        await expect(helpers.wrap("load", handler)()).rejects.toBeInstanceOf(
            TestElectronBridgeNotReadyError
        );

        expect(accessCount).toBe(0);
        expect(handler).not.toHaveBeenCalled();
        expect(ensureError).toHaveBeenCalledWith(
            expect.any(TestElectronBridgeNotReadyError)
        );
        expect(loggerError).toHaveBeenCalledWith(
            "[AccessorService] load failed:",
            expect.any(TestElectronBridgeNotReadyError)
        );
    });

    it("falls back to an electron-log structured logger when no shared logger is available", async () => {
        let accessCount = 0;
        const loggerModule = {
            get Logger(): never {
                accessCount += 1;
                throw new Error("Logger getter should not be invoked");
            },
            get logger(): never {
                accessCount += 1;
                throw new Error("logger getter should not be invoked");
            },
        } satisfies UnknownRecord;
        const electronLog = {
            debug: vi.fn(),
            error: vi.fn(),
        } as const;

        const { module, waitForElectronBridge } = await setupModule({
            electronLog,
            loggerModule,
        });
        waitForElectronBridge.mockResolvedValueOnce(undefined);

        const helpers = module.getIpcServiceHelpers("FallbackService");
        const failure = new Error("operation failed");
        const handler = vi.fn(async () => {
            throw failure;
        });

        const wrapped = helpers.wrap("synchronize", handler);

        await expect(wrapped()).rejects.toBe(failure);

        expect(electronLog.error).toHaveBeenCalledWith(
            "[FallbackService] synchronize failed:",
            failure
        );
        expect(electronLog.debug).not.toHaveBeenCalled();
        expect(accessCount).toBe(0);
    });
});

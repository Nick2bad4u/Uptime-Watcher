/**
 * Electron bridge readiness utilities shared by renderer services.
 *
 * @remarks
 * Provides domain-agnostic polling helpers that wait for the preload-exposed
 * `window.electronAPI` bridge to become available before renderer services
 * attempt to invoke IPC contracts. Consumers can declare the domains and
 * methods they rely on, enabling early diagnostics when preload wiring drifts
 * or when the application is executed outside an Electron environment.
 */

import type { UnknownRecord } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { withRetry } from "@shared/utils/retry";

const DEFAULT_MAX_ATTEMPTS = 50;
const DEFAULT_BASE_DELAY = 100;
const MAX_DELAY = 2000;
const BACKOFF_FACTOR = 1.5;
const BASE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

class BridgeNotReadyYetError extends Error {
    public readonly diagnostics: BridgeReadinessDiagnostics;

    public constructor(diagnostics: BridgeReadinessDiagnostics) {
        super("Electron bridge not ready yet");
        this.name = "BridgeNotReadyYetError";
        this.diagnostics = diagnostics;
    }
}

/**
 * Electron bridge domains exposed by the preload script.
 */
export type ElectronBridgeDomain =
    | "cloud"
    | "data"
    | "events"
    | "monitoring"
    | "monitorTypes"
    | "notifications"
    | "settings"
    | "sites"
    | "stateSync"
    | "system";

/**
 * Contract describing the expected shape of a preload domain.
 */
export interface ElectronBridgeContract {
    /** Domain name expected on `window.electronAPI`. */
    readonly domain: ElectronBridgeDomain;
    /** Optional list of method names that must be exposed as functions. */
    readonly methods?: readonly string[];
}

/**
 * Additional configuration for {@link waitForElectronBridge}.
 */
export interface WaitForElectronBridgeOptions {
    /** Base delay (in ms) for exponential backoff between attempts. */
    readonly baseDelay?: number;
    /** Contracts that must be satisfied before the bridge is considered ready. */
    readonly contracts?: readonly ElectronBridgeContract[];
    /** Maximum number of polling attempts before giving up. */
    readonly maxAttempts?: number;
}

/**
 * Snapshot describing missing bridge contracts.
 */
export interface BridgeReadinessDiagnostics {
    /** Indicates whether the bridge root object was accessible. */
    readonly bridgeAvailable: boolean;
    /** Domains that were not found on the bridge. */
    readonly missingDomains: readonly ElectronBridgeDomain[];
    /**
     * Methods that were missing or not callable on otherwise present domains.
     */
    readonly missingMethods: ReadonlyArray<{
        readonly domain: ElectronBridgeDomain;
        readonly method: string;
    }>;
}

/**
 * Error thrown when the electron bridge fails to become ready in time.
 */
export class ElectronBridgeNotReadyError extends Error {
    /** Diagnostics collected from the last readiness evaluation. */
    public readonly diagnostics: BridgeReadinessDiagnostics;

    public constructor(
        diagnostics: BridgeReadinessDiagnostics,
        options?: { readonly cause?: unknown }
    ) {
        super(BASE_ERROR_MESSAGE, options);
        this.name = "ElectronBridgeNotReadyError";
        this.diagnostics = diagnostics;
    }
}

type BridgeRoot = typeof window extends { electronAPI: infer T } ? T : unknown;

const getGlobalWindow = (): unknown => {
    if (typeof window !== "undefined") {
        return window;
    }

    const globalObject = globalThis as { window?: unknown };
    return globalObject.window;
};

type ObjectLike = ((...args: readonly unknown[]) => unknown) | UnknownRecord;

const isObjectLike = (value: unknown): value is ObjectLike =>
    (typeof value === "object" || typeof value === "function") &&
    value !== null;

const isBridgeRootCandidate = (value: unknown): value is BridgeRoot =>
    isObjectLike(value);

const safeGetProperty = (target: unknown, key: PropertyKey): unknown => {
    if (!isObjectLike(target)) {
        return undefined;
    }

    try {
        return Reflect.get(target, key);
    } catch {
        return undefined;
    }
};

const obtainBridgeRoot = (): BridgeRoot | undefined => {
    const candidateWindow = getGlobalWindow();
    if (!isObjectLike(candidateWindow)) {
        return undefined;
    }

    try {
        const electronApi = safeGetProperty(candidateWindow, "electronAPI");
        if (!isBridgeRootCandidate(electronApi)) {
            return undefined;
        }
        return electronApi;
    } catch {
        return undefined;
    }
};

const evaluateContracts = (
    bridge: BridgeRoot | undefined,
    contracts: readonly ElectronBridgeContract[]
): BridgeReadinessDiagnostics & { readonly isReady: boolean } => {
    const bridgeAvailable = isBridgeRootCandidate(bridge);

    const missingDomains: ElectronBridgeDomain[] = [];
    const missingMethods: Array<{
        readonly domain: ElectronBridgeDomain;
        readonly method: string;
    }> = [];

    if (!bridgeAvailable) {
        return {
            bridgeAvailable,
            isReady: false,
            missingDomains: contracts.map((contract) => contract.domain),
            missingMethods,
        };
    }

    for (const contract of contracts) {
        const domainValue = safeGetProperty(bridge, contract.domain);
        const domainAvailable = isObjectLike(domainValue);

        if (!domainAvailable) {
            missingDomains.push(contract.domain);
        }

        const expectedMethods = contract.methods ?? [];
        if (domainAvailable && expectedMethods.length > 0) {
            for (const methodName of expectedMethods) {
                const candidate = safeGetProperty(domainValue, methodName);
                if (typeof candidate !== "function") {
                    missingMethods.push({
                        domain: contract.domain,
                        method: methodName,
                    });
                }
            }
        }
    }

    const isReady =
        missingDomains.length === 0 &&
        missingMethods.length === 0 &&
        bridgeAvailable;

    return {
        bridgeAvailable,
        isReady,
        missingDomains,
        missingMethods,
    };
};

const computeDelayMs = (args: {
    readonly attempt: number;
    readonly baseDelay: number;
}): number => {
    // `attempt` is 1-indexed in withRetry.
    const exponent = Math.max(0, args.attempt - 1);
    return Math.min(args.baseDelay * BACKOFF_FACTOR ** exponent, MAX_DELAY);
};

/**
 * Waits for the preload-exposed electron bridge to become available.
 *
 * @param options - Optional polling and contract validation parameters.
 *
 * @throws {@link ElectronBridgeNotReadyError} When the bridge remains
 *   unavailable after the configured attempts.
 */
export async function waitForElectronBridge(
    options: WaitForElectronBridgeOptions = {}
): Promise<void> {
    const {
        baseDelay = DEFAULT_BASE_DELAY,
        contracts = [],
        maxAttempts = DEFAULT_MAX_ATTEMPTS,
    } = options;

    const attempts = Math.max(1, maxAttempts);

    try {
        await withRetry(
            () => {
                const evaluation = evaluateContracts(
                    obtainBridgeRoot(),
                    contracts
                );

                if (evaluation.isReady) {
                    return Promise.resolve();
                }

                return Promise.reject(new BridgeNotReadyYetError(evaluation));
            },
            {
                delayMs: ({ attempt }) =>
                    computeDelayMs({ attempt, baseDelay }),
                maxRetries: attempts,
                shouldRetry: (error) => error instanceof BridgeNotReadyYetError,
            }
        );
    } catch (error: unknown) {
        const normalized = ensureError(error);
        if (normalized instanceof BridgeNotReadyYetError) {
            throw new ElectronBridgeNotReadyError(normalized.diagnostics, {
                cause: error,
            });
        }

        throw new Error("waitForElectronBridge failed", {
            cause: error,
        });
    }
}

import type { UnknownRecord } from "type-fest";

/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ElectronBridgeContract,
    ElectronBridgeNotReadyError,
    waitForElectronBridge,
} from "../../../services/utils/electronBridgeReadiness";

describe(waitForElectronBridge, () => {
    const setBridge = (contracts?: UnknownRecord): void => {
        const electronAPI = contracts ?? {};
        vi.stubGlobal("window", {
            electronAPI,
        });
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.unstubAllGlobals();
        setBridge();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("resolves when the bridge is available without explicit contracts", async () => {
        setBridge({ data: {} });

        await expect(waitForElectronBridge()).resolves.toBeUndefined();
    });

    it("resolves when required domains and methods are available", async () => {
        const monitoringContract: ElectronBridgeContract = {
            domain: "monitoring",
            methods: ["startMonitoring", "stopMonitoring"],
        };

        setBridge({
            monitoring: {
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            },
        });

        await expect(
            waitForElectronBridge({
                contracts: [monitoringContract],
            })
        ).resolves.toBeUndefined();
    });

    it("rejects with diagnostics when a domain is missing", async () => {
        const promise = waitForElectronBridge({
            baseDelay: 1,
            contracts: [{ domain: "sites" }],
            maxAttempts: 2,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(error).toMatchObject({
            diagnostics: {
                missingDomains: ["sites"],
            },
        });
    });

    it("rejects when domain exists but required method is missing", async () => {
        setBridge({
            stateSync: {
                requestFullSync: vi.fn(),
            },
        });

        const promise = waitForElectronBridge({
            baseDelay: 1,
            contracts: [
                {
                    domain: "stateSync",
                    methods: ["getSyncStatus", "requestFullSync"],
                },
            ],
            maxAttempts: 2,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(error).toMatchObject({
            diagnostics: {
                missingDomains: [],
                missingMethods: [
                    {
                        domain: "stateSync",
                        method: "getSyncStatus",
                    },
                ],
            },
        });
    });

    it("does not invoke electronAPI accessors while checking bridge readiness", async () => {
        let accessCount = 0;

        vi.stubGlobal(
            "window",
            Object.defineProperty({}, "electronAPI", {
                enumerable: true,
                get() {
                    accessCount += 1;
                    return { sites: {} };
                },
            })
        );

        const promise = waitForElectronBridge({
            baseDelay: 0,
            contracts: [{ domain: "sites" }],
            maxAttempts: 1,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(error).toMatchObject({
            diagnostics: {
                bridgeAvailable: false,
                missingDomains: ["sites"],
            },
        });
        expect(accessCount).toBe(0);
    });

    it("does not invoke domain or method accessors while evaluating contracts", async () => {
        const bridge = {};
        const sites = {};
        let accessCount = 0;

        Object.defineProperty(bridge, "sites", {
            enumerable: true,
            get() {
                accessCount += 1;
                return sites;
            },
        });
        Object.defineProperty(sites, "getSites", {
            enumerable: true,
            get() {
                accessCount += 1;
                return vi.fn();
            },
        });
        vi.stubGlobal("window", {
            electronAPI: bridge,
        });

        const promise = waitForElectronBridge({
            baseDelay: 0,
            contracts: [{ domain: "sites", methods: ["getSites"] }],
            maxAttempts: 1,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(error).toMatchObject({
            diagnostics: {
                bridgeAvailable: true,
                missingDomains: ["sites"],
                missingMethods: [],
            },
        });
        expect(accessCount).toBe(0);
    });

    it("defaults non-finite maxAttempts before polling", async () => {
        const promise = waitForElectronBridge({
            baseDelay: 0,
            contracts: [{ domain: "sites" }],
            maxAttempts: Number.POSITIVE_INFINITY,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(error).toMatchObject({
            diagnostics: {
                missingDomains: ["sites"],
            },
        });
    });

    it("defaults non-finite baseDelay before scheduling retries", async () => {
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

        const promise = waitForElectronBridge({
            baseDelay: Number.POSITIVE_INFINITY,
            contracts: [{ domain: "sites" }],
            maxAttempts: 2,
        }).catch((error: unknown) => error as ElectronBridgeNotReadyError);

        await vi.runAllTimersAsync();

        const error = await promise;
        expect(error).toBeInstanceOf(ElectronBridgeNotReadyError);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

        setTimeoutSpy.mockRestore();
    });
});

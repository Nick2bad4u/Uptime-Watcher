/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    ElectronBridgeNotReadyError,
    waitForElectronBridge,
    type ElectronBridgeContract,
} from "../../../services/utils/electronBridgeReadiness";

describe(waitForElectronBridge, () => {
    const setBridge = (contracts?: Record<string, unknown>): void => {
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
        }).catch((error) => error as ElectronBridgeNotReadyError);

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
        }).catch((error) => error as ElectronBridgeNotReadyError);

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
});

/**
 * Tests for the in-app alert store implementation.
 */

import type { StatusUpdate } from "@shared/types";

import { test } from "@fast-check/vitest";
import {
    monitorIdArbitrary,
    monitorNameArbitrary,
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { STATUS_KIND } from "@shared/types";
import fc from "fast-check";
import { arrayAt, arrayFirst } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    MAX_ALERT_QUEUE_LENGTH,
    MAX_TOAST_QUEUE_LENGTH,
    useAlertStore,
} from "../../../stores/alerts/useAlertStore";
import { mapStatusUpdateToAlert } from "../../../stores/alerts/utils/alertPayload";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

const resetAlertStore = (): void => {
    useAlertStore.setState({ alerts: [], toasts: [] });
};

const resetSettingsStore = (): void => {
    const defaults = useSettingsStore.getState().settings;
    useSettingsStore.setState({
        settings: {
            ...defaults,
            inAppAlertsEnabled: true,
            inAppAlertsSoundEnabled: false,
        },
    });
};

const createStatusUpdate = (
    overrides: Partial<StatusUpdate> = {}
): StatusUpdate => {
    const timestamp = overrides.timestamp ?? new Date().toISOString();
    const baseMonitorId =
        overrides.monitor?.id ?? sampleOne(monitorIdArbitrary);
    const monitorId = overrides.monitorId ?? baseMonitorId;
    const baseSiteIdentifier =
        overrides.site?.identifier ?? sampleOne(siteIdentifierArbitrary);
    const siteIdentifier = overrides.siteIdentifier ?? baseSiteIdentifier;
    return {
        details: overrides.details ?? "",
        monitor: {
            activeOperations: [],
            checkInterval: 60_000,
            history: [],
            id: overrides.monitor?.id ?? baseMonitorId,
            monitoring: true,
            responseTime: overrides.monitor?.responseTime ?? 120,
            retryAttempts: 0,
            status: overrides.monitor?.status ?? STATUS_KIND.DOWN,
            timeout: 10_000,
            type: overrides.monitor?.type ?? "http",
            url: overrides.monitor?.url ?? sampleOne(siteUrlArbitrary),
        },
        monitorId,
        previousStatus: overrides.previousStatus ?? STATUS_KIND.UP,
        responseTime: overrides.responseTime ?? 120,
        site: {
            identifier: overrides.site?.identifier ?? baseSiteIdentifier,
            monitoring: true,
            monitors: [],
            name: overrides.site?.name ?? sampleOne(siteNameArbitrary),
        },
        siteIdentifier,
        status: overrides.status ?? STATUS_KIND.DOWN,
        timestamp,
    } satisfies StatusUpdate;
};

describe(useAlertStore, () => {
    beforeEach(() => {
        resetAlertStore();
        resetSettingsStore();
    });

    afterEach(() => {
        resetAlertStore();
    });

    it("enqueues alerts with generated identifiers", () => {
        const update = createStatusUpdate();
        const alert = useAlertStore
            .getState()
            .enqueueAlert(mapStatusUpdateToAlert(update));

        expect(alert.id).toBeDefined();
        expect(alert.timestamp).toBeGreaterThan(0);
        expect(arrayFirst(useAlertStore.getState().alerts)).toEqual(alert);
    });

    it("respects provided identifiers and timestamps", () => {
        const monitorId = sampleOne(monitorIdArbitrary);
        const monitorName = sampleOne(monitorNameArbitrary);
        const siteIdentifier = sampleOne(siteIdentifierArbitrary);
        const siteName = sampleOne(siteNameArbitrary);

        const customAlert = useAlertStore.getState().enqueueAlert({
            id: "custom-id",
            monitorId,
            monitorName,
            siteIdentifier,
            siteName,
            status: STATUS_KIND.DEGRADED,
            timestamp: 1_700_000_000_000,
        });

        expect(customAlert.id).toBe("custom-id");
        expect(customAlert.monitorId).toBe(monitorId);
        expect(customAlert.monitorName).toBe(monitorName);
        expect(customAlert.siteIdentifier).toBe(siteIdentifier);
        expect(customAlert.siteName).toBe(siteName);
        expect(customAlert.timestamp).toBe(1_700_000_000_000);
    });

    it("normalizes non-finite and negative alert timestamps", () => {
        const fixedNow = 1_730_000_000_000;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);
        const store = useAlertStore.getState();

        try {
            for (const timestamp of [
                Infinity,
                -Infinity,
                Number.NaN,
                -1,
            ]) {
                const alert = store.enqueueAlert({
                    monitorId: sampleOne(monitorIdArbitrary),
                    monitorName: sampleOne(monitorNameArbitrary),
                    siteIdentifier: sampleOne(siteIdentifierArbitrary),
                    siteName: sampleOne(siteNameArbitrary),
                    status: STATUS_KIND.DOWN,
                    timestamp,
                });

                expect(alert.timestamp).toBe(fixedNow);
            }

            const epochAlert = store.enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.UP,
                timestamp: 0,
            });

            expect(epochAlert.timestamp).toBe(0);
        } finally {
            nowSpy.mockRestore();
        }
    });

    it("trims the alert queue to the maximum length", () => {
        const { enqueueAlert } = useAlertStore.getState();

        const overflowCount = 5;
        const siteIdentifier = sampleOne(siteIdentifierArbitrary);
        const siteName = sampleOne(siteNameArbitrary);

        for (
            let index = 0;
            index < MAX_ALERT_QUEUE_LENGTH + overflowCount;
            index += 1
        ) {
            enqueueAlert({
                monitorId: `monitor-${index}`,
                monitorName: `Monitor ${index}`,
                siteIdentifier,
                siteName,
                status: STATUS_KIND.PENDING,
            });
        }

        const queuedAlerts = useAlertStore.getState().alerts;

        expect(queuedAlerts).toHaveLength(MAX_ALERT_QUEUE_LENGTH);
        const expectedOldestIndex = overflowCount;
        expect(arrayAt(queuedAlerts, -1)?.monitorId).toBe(
            `monitor-${expectedOldestIndex}`
        );
    });

    it("dismisses individual alerts", () => {
        const store = useAlertStore.getState();
        const monitorId = sampleOne(monitorIdArbitrary);
        const monitorName = sampleOne(monitorNameArbitrary);
        const siteIdentifier = sampleOne(siteIdentifierArbitrary);
        const siteName = sampleOne(siteNameArbitrary);
        const alert = store.enqueueAlert({
            monitorId,
            monitorName,
            siteIdentifier,
            siteName,
            status: STATUS_KIND.DOWN,
        });

        store.dismissAlert(alert.id);
        expect(useAlertStore.getState().alerts).toHaveLength(0);
    });

    it("clears all alerts", () => {
        const store = useAlertStore.getState();
        const monitorId = sampleOne(monitorIdArbitrary);
        const monitorName = sampleOne(monitorNameArbitrary);
        const siteIdentifier = sampleOne(siteIdentifierArbitrary);
        const siteName = sampleOne(siteNameArbitrary);
        store.enqueueAlert({
            monitorId,
            monitorName,
            siteIdentifier,
            siteName,
            status: STATUS_KIND.UP,
        });

        store.clearAlerts();
        expect(useAlertStore.getState().alerts).toHaveLength(0);
    });

    it("normalizes invalid toast TTL values", () => {
        const store = useAlertStore.getState();

        const validToast = store.enqueueToast({
            title: "Valid",
            ttlMs: 1,
            variant: "info",
        });
        expect(validToast.ttlMs).toBe(1);

        for (const ttlMs of [
            0,
            -1,
            Infinity,
            -Infinity,
            Number.NaN,
        ]) {
            const toast = store.enqueueToast({
                title: "Invalid",
                ttlMs,
                variant: "info",
            });

            expect(toast.ttlMs).toBe(5000);
        }
    });

    it("sanitizes optional toast detail messages", () => {
        const toast = useAlertStore.getState().enqueueToast({
            message:
                "Upload failed\nsecret_token=uptime-secret-token\r\nRetry later",
            title: "Upload failed",
            variant: "error",
        });

        expect(toast.message).toContain("[redacted]");
        expect(toast.message).not.toContain("uptime-secret-token");
        expect(toast.message).not.toMatch(/[\n\r]/u);
    });

    it("trims the toast queue to the maximum length", () => {
        const { enqueueToast } = useAlertStore.getState();

        for (let index = 0; index < MAX_TOAST_QUEUE_LENGTH + 5; index += 1) {
            enqueueToast({
                title: `Toast ${index}`,
                variant: "info",
            });
        }

        const queuedToasts = useAlertStore.getState().toasts;

        expect(queuedToasts).toHaveLength(MAX_TOAST_QUEUE_LENGTH);
        expect(arrayAt(queuedToasts, -1)?.title).toBe("Toast 5");
    });

    it("maps status updates to alert payloads", () => {
        const update = createStatusUpdate({
            monitorId: "monitor-42",
            status: STATUS_KIND.DEGRADED,
            siteIdentifier: "alpha",
            site: {
                identifier: "alpha",
                monitoring: true,
                monitors: [],
                name: "Alpha",
            },
            monitor: {
                id: "monitor-42",
                checkInterval: 30_000,
                history: [],
                monitoring: true,
                responseTime: 200,
                retryAttempts: 0,
                status: STATUS_KIND.DEGRADED,
                timeout: 5000,
                type: "http",
                url: "https://alpha.example.com",
            },
        });

        const alert = mapStatusUpdateToAlert(update);
        expect(alert.monitorId).toBe("monitor-42");
        expect(alert.status).toBe(STATUS_KIND.DEGRADED);
        expect(alert.siteIdentifier).toBe("alpha");
        expect(alert.siteName).toBe("Alpha");
        expect(alert.previousStatus).toBe(STATUS_KIND.UP);
    });

    it("derives site name from identifier when the name is blank", () => {
        const update = createStatusUpdate({
            site: {
                identifier: "  site-slug   ",
                monitoring: true,
                monitors: [],
                name: " ".repeat(3),
            },
            siteIdentifier: "   outer-id   ",
        });

        const alert = mapStatusUpdateToAlert(update);

        // DeriveSiteName should fall back to the trimmed identifier
        expect(alert.siteName).toBe("site-slug");
    });

    it("derives site name from the event identifier when site name and identifier are blank", () => {
        const update = createStatusUpdate({
            site: {
                identifier: " ".repeat(3),
                monitoring: true,
                monitors: [],
                name: " ".repeat(3),
            },
            siteIdentifier: "   event-id   ",
        });

        const alert = mapStatusUpdateToAlert(update);

        // DeriveSiteName should use the trimmed siteIdentifier from the event
        expect(alert.siteName).toBe("event-id");
    });

    it("falls back to unknown-site when no site identifiers are available", () => {
        const base = createStatusUpdate({
            site: {
                identifier: " ".repeat(3),
                monitoring: true,
                monitors: [],
                name: " ".repeat(3),
            },
            siteIdentifier: " ".repeat(3),
        });

        const alert = mapStatusUpdateToAlert(base);

        expect(alert.siteName).toBe("unknown-site");
    });

    test.prop(
        [
            fc.string({ maxLength: 40 }),
            fc.string({ maxLength: 40 }),
            fc.string({ maxLength: 40 }),
        ],
        { numRuns: 60 }
    )(
        "site name derivation trims or falls back to identifiers",
        (rawSiteName, rawSiteIdentifier, rawEventIdentifier) => {
            const update = createStatusUpdate({
                site: {
                    identifier: rawSiteIdentifier,
                    monitoring: true,
                    monitors: [],
                    name: rawSiteName,
                },
                siteIdentifier: rawEventIdentifier,
            });

            const alert = mapStatusUpdateToAlert(update);

            const trimmedName = rawSiteName.trim();
            const trimmedIdentifier = rawSiteIdentifier.trim();
            const trimmedEventIdentifier = rawEventIdentifier.trim();

            const expectedSiteName =
                trimmedName.length > 0
                    ? trimmedName
                    : trimmedIdentifier.length > 0
                      ? trimmedIdentifier
                      : trimmedEventIdentifier.length > 0
                        ? trimmedEventIdentifier
                        : "unknown-site";

            expect(alert.siteName).toBe(expectedSiteName);
        }
    );

    it("normalizes invalid timestamps to Date.now() when mapping status updates", () => {
        const fixedNow = 1_725_000_000_000;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        try {
            for (const timestamp of [
                "not-a-valid-timestamp",
                "July 3, 2026",
                "2026-02-30T00:00:00.000Z",
            ]) {
                const update = createStatusUpdate({
                    timestamp,
                });

                const alert = mapStatusUpdateToAlert(update);

                expect(alert.timestamp).toBe(fixedNow);
            }
        } finally {
            nowSpy.mockRestore();
        }
    });

    it("trims valid ISO timestamps when mapping status updates", () => {
        const alert = mapStatusUpdateToAlert(
            createStatusUpdate({
                timestamp: "  2026-07-03T00:00:00.000Z  ",
            })
        );

        expect(alert.timestamp).toBe(Date.parse("2026-07-03T00:00:00.000Z"));
    });
});

describe("useAlertStore identifier generation fallbacks", () => {
    afterEach(() => {
        resetAlertStore();
    });

    it("uses crypto.getRandomValues when randomUUID is not available", () => {
        const originalCrypto = crypto;

        const mockGetRandomValues = vi.fn((buffer: Uint32Array) => {
            // Use deterministic values so the generated ID is predictable
            buffer[0] = 123_456;
            buffer[1] = 654_321;
            return buffer;
        });

        try {
            globalThis.crypto = {
                // RandomUUID intentionally omitted to hit the getRandomValues branch
                getRandomValues: mockGetRandomValues,
            } as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
            expect(alert.id).toMatch(/^alert(?:-[\da-z]+){2}$/v);
        } finally {
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back to Date.now-based identifiers when crypto is unavailable", () => {
        const originalCrypto = crypto;
        const fixedNow = 1_730_000_000_000;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        try {
            globalThis.crypto = undefined as any;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(alert.id).toMatch(/^alert-1730{10}-\d+$/v);
        } finally {
            nowSpy.mockRestore();
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back when crypto is deleted from globalThis", () => {
        const originalCrypto = crypto;
        const fixedNow = 1_730_000_000_001;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        try {
            Reflect.deleteProperty(globalThis, "crypto");

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(alert.id).toMatch(/^alert-1730{9}1-\d+$/v);
        } finally {
            nowSpy.mockRestore();
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back to getRandomValues when randomUUID throws", () => {
        const originalCrypto = crypto;
        const mockGetRandomValues = vi.fn((buffer: Uint32Array) => {
            buffer[0] = 42;
            buffer[1] = 84;
            return buffer;
        });

        try {
            globalThis.crypto = {
                getRandomValues: mockGetRandomValues,
                randomUUID: vi.fn(() => {
                    throw new Error("randomUUID failed");
                }),
            } as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
            expect(alert.id).toMatch(/^alert(?:-[\da-z]+){2}$/v);
        } finally {
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back to getRandomValues when randomUUID returns whitespace", () => {
        const originalCrypto = crypto;
        const mockGetRandomValues = vi.fn((buffer: Uint32Array) => {
            buffer[0] = 101;
            buffer[1] = 202;
            return buffer;
        });

        try {
            globalThis.crypto = {
                getRandomValues: mockGetRandomValues,
                randomUUID: vi.fn(() => " ".repeat(3)),
            } as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
            expect(alert.id).toMatch(/^alert(?:-[\da-z]+){2}$/v);
        } finally {
            globalThis.crypto = originalCrypto;
        }
    });

    it("does not invoke accessor-backed randomUUID properties", () => {
        const originalCrypto = crypto;
        let accessCount = 0;
        const mockGetRandomValues = vi.fn((buffer: Uint32Array) => {
            buffer[0] = 7;
            buffer[1] = 14;
            return buffer;
        });
        const cryptoCandidate = {
            getRandomValues: mockGetRandomValues,
        };
        Object.defineProperty(cryptoCandidate, "randomUUID", {
            configurable: true,
            enumerable: true,
            get() {
                accessCount += 1;
                return () => "hidden-alert-id";
            },
        });

        try {
            globalThis.crypto = cryptoCandidate as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(accessCount).toBe(0);
            expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
            expect(alert.id).toMatch(/^alert(?:-[\da-z]+){2}$/v);
            expect(alert.id).not.toBe("hidden-alert-id");
        } finally {
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back to Date.now-based identifiers when getRandomValues throws", () => {
        const originalCrypto = crypto;
        const fixedNow = 1_730_000_000_002;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        try {
            globalThis.crypto = {
                getRandomValues: vi.fn(() => {
                    throw new Error("getRandomValues failed");
                }),
            } as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(alert.id).toMatch(/^alert-1730{9}2-\d+$/v);
        } finally {
            nowSpy.mockRestore();
            globalThis.crypto = originalCrypto;
        }
    });

    it("does not invoke accessor-backed getRandomValues properties", () => {
        const originalCrypto = crypto;
        const fixedNow = 1_730_000_000_003;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);
        let accessCount = 0;
        const cryptoCandidate = {};
        Object.defineProperty(cryptoCandidate, "getRandomValues", {
            configurable: true,
            enumerable: true,
            get() {
                accessCount += 1;
                return () => {
                    throw new Error("hidden getRandomValues");
                };
            },
        });

        try {
            globalThis.crypto = cryptoCandidate as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: sampleOne(monitorIdArbitrary),
                monitorName: sampleOne(monitorNameArbitrary),
                siteIdentifier: sampleOne(siteIdentifierArbitrary),
                siteName: sampleOne(siteNameArbitrary),
                status: STATUS_KIND.DOWN,
            });

            expect(accessCount).toBe(0);
            expect(alert.id).toMatch(/^alert-1730{9}3-\d+$/v);
        } finally {
            nowSpy.mockRestore();
            globalThis.crypto = originalCrypto;
        }
    });
});

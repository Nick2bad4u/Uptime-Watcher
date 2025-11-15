/**
 * Tests for the in-app alert store implementation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StatusUpdate } from "@shared/types";
import { STATUS_KIND } from "@shared/types";

import {
    MAX_ALERT_QUEUE_LENGTH,
    mapStatusUpdateToAlert,
    useAlertStore,
} from "../../../stores/alerts/useAlertStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

const resetAlertStore = (): void => {
    useAlertStore.setState({ alerts: [] });
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
    return {
        details: overrides.details ?? "",
        monitor: {
            activeOperations: [],
            checkInterval: 60_000,
            history: [],
            id: overrides.monitor?.id ?? "monitor-id",
            monitoring: true,
            responseTime: overrides.monitor?.responseTime ?? 120,
            retryAttempts: 0,
            status: overrides.monitor?.status ?? STATUS_KIND.DOWN,
            timeout: 10_000,
            type: overrides.monitor?.type ?? "http",
            url: overrides.monitor?.url ?? "https://example.com",
        },
        monitorId: overrides.monitorId ?? "monitor-id",
        previousStatus: overrides.previousStatus ?? STATUS_KIND.UP,
        responseTime: overrides.responseTime ?? 120,
        site: {
            identifier: overrides.site?.identifier ?? "site-id",
            monitoring: true,
            monitors: [],
            name: overrides.site?.name ?? "Example Site",
        },
        siteIdentifier: overrides.siteIdentifier ?? "site-id",
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
        expect(useAlertStore.getState().alerts[0]).toEqual(alert);
    });

    it("respects provided identifiers and timestamps", () => {
        const customAlert = useAlertStore.getState().enqueueAlert({
            id: "custom-id",
            monitorId: "monitor-id",
            monitorName: "HTTP monitor",
            siteIdentifier: "site-id",
            siteName: "Example Site",
            status: STATUS_KIND.DEGRADED,
            timestamp: 1_700_000_000_000,
        });

        expect(customAlert.id).toBe("custom-id");
        expect(customAlert.timestamp).toBe(1_700_000_000_000);
    });

    it("trims the alert queue to the maximum length", () => {
        const { enqueueAlert } = useAlertStore.getState();

        const overflowCount = 5;

        for (
            let index = 0;
            index < MAX_ALERT_QUEUE_LENGTH + overflowCount;
            index += 1
        ) {
            enqueueAlert({
                monitorId: `monitor-${index}`,
                monitorName: `Monitor ${index}`,
                siteIdentifier: "site-id",
                siteName: "Example Site",
                status: STATUS_KIND.PENDING,
            });
        }

        const queuedAlerts = useAlertStore.getState().alerts;

        expect(queuedAlerts).toHaveLength(MAX_ALERT_QUEUE_LENGTH);
        const expectedOldestIndex = overflowCount;
        expect(queuedAlerts.at(-1)?.monitorId).toBe(
            `monitor-${expectedOldestIndex}`
        );
    });

    it("dismisses individual alerts", () => {
        const store = useAlertStore.getState();
        const alert = store.enqueueAlert({
            monitorId: "monitor-id",
            monitorName: "HTTP monitor",
            siteIdentifier: "site-id",
            siteName: "Example Site",
            status: STATUS_KIND.DOWN,
        });

        store.dismissAlert(alert.id);
        expect(useAlertStore.getState().alerts).toHaveLength(0);
    });

    it("clears all alerts", () => {
        const store = useAlertStore.getState();
        store.enqueueAlert({
            monitorId: "monitor-id",
            monitorName: "HTTP monitor",
            siteIdentifier: "site-id",
            siteName: "Example Site",
            status: STATUS_KIND.UP,
        });

        store.clearAlerts();
        expect(useAlertStore.getState().alerts).toHaveLength(0);
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
                name: "   ",
            },
            siteIdentifier: "   outer-id   ",
        });

        const alert = mapStatusUpdateToAlert(update);

        // deriveSiteName should fall back to the trimmed identifier
        expect(alert.siteName).toBe("site-slug");
    });

    it("derives site name from the event identifier when site name and identifier are blank", () => {
        const update = createStatusUpdate({
            site: {
                identifier: "   ",
                monitoring: true,
                monitors: [],
                name: "   ",
            },
            siteIdentifier: "   event-id   ",
        });

        const alert = mapStatusUpdateToAlert(update);

        // deriveSiteName should use the trimmed siteIdentifier from the event
        expect(alert.siteName).toBe("event-id");
    });

    it("falls back to unknown-site when no site identifiers are available", () => {
        const base = createStatusUpdate({
            site: {
                identifier: "   ",
                monitoring: true,
                monitors: [],
                name: "   ",
            },
            siteIdentifier: "   ",
        });

        const alert = mapStatusUpdateToAlert(base);

        expect(alert.siteName).toBe("unknown-site");
    });

    it("normalizes invalid timestamps to Date.now() when mapping status updates", () => {
        const fixedNow = 1_725_000_000_000;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        const update = createStatusUpdate({
            // Force deriveAlertTimestamp to take the Date.now() fallback path
            timestamp: "not-a-valid-timestamp",
        });

        const alert = mapStatusUpdateToAlert(update);

        expect(alert.timestamp).toBe(fixedNow);

        nowSpy.mockRestore();
    });
});

describe("useAlertStore identifier generation fallbacks", () => {
    afterEach(() => {
        resetAlertStore();
    });

    it("uses crypto.getRandomValues when randomUUID is not available", () => {
        const originalCrypto = globalThis.crypto;

        const mockGetRandomValues = vi.fn((buffer: Uint32Array) => {
            // Use deterministic values so the generated ID is predictable
            buffer[0] = 123_456;
            buffer[1] = 654_321;
            return buffer;
        });

        try {
            globalThis.crypto = {
                // randomUUID intentionally omitted to hit the getRandomValues branch
                getRandomValues: mockGetRandomValues,
            } as unknown as Crypto;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: "monitor-id",
                monitorName: "HTTP monitor",
                siteIdentifier: "site-id",
                siteName: "Example Site",
                status: STATUS_KIND.DOWN,
            });

            expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
            expect(alert.id).toMatch(/^alert-[0-9a-z]+-[0-9a-z]+$/);
        } finally {
            globalThis.crypto = originalCrypto;
        }
    });

    it("falls back to Date.now-based identifiers when crypto is unavailable", () => {
        const originalCrypto = globalThis.crypto;
        const fixedNow = 1_730_000_000_000;
        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(fixedNow);

        try {
            globalThis.crypto = undefined as any;

            const alert = useAlertStore.getState().enqueueAlert({
                monitorId: "monitor-id",
                monitorName: "HTTP monitor",
                siteIdentifier: "site-id",
                siteName: "Example Site",
                status: STATUS_KIND.DOWN,
            });

            expect(alert.id).toMatch(/^alert-1730000000000-\d+$/);
        } finally {
            nowSpy.mockRestore();
            globalThis.crypto = originalCrypto;
        }
    });
});

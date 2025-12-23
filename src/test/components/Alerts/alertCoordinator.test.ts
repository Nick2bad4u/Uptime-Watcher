/**
 * Tests for alert coordinator helpers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StatusUpdate } from "@shared/types";
import { STATUS_KIND } from "@shared/types";

import * as alertCoordinator from "../../../components/Alerts/alertCoordinator";
import { logger } from "../../../services/logger";
import {
    MAX_ALERT_QUEUE_LENGTH,
    useAlertStore,
} from "../../../stores/alerts/useAlertStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
vi.mock("../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../services/NotificationPreferenceService", () => ({
    NotificationPreferenceService: {
        initialize: vi.fn().mockResolvedValue(undefined),
        updatePreferences: vi.fn().mockResolvedValue(undefined),
    },
}));

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
            id: overrides.monitor?.id ?? "monitor-1",
            monitoring: true,
            responseTime: overrides.monitor?.responseTime ?? 220,
            retryAttempts: 0,
            status: overrides.monitor?.status ?? STATUS_KIND.DOWN,
            timeout: 10_000,
            type: overrides.monitor?.type ?? "http",
            url: overrides.monitor?.url ?? "https://example.com",
        },
        monitorId: overrides.monitorId ?? "monitor-1",
        previousStatus: overrides.previousStatus ?? STATUS_KIND.UP,
        responseTime: overrides.responseTime ?? 220,
        site: {
            identifier: overrides.site?.identifier ?? "site-1",
            monitoring: true,
            monitors: [],
            name: overrides.site?.name ?? "Example",
        },
        siteIdentifier: overrides.siteIdentifier ?? "site-1",
        status: overrides.status ?? STATUS_KIND.DOWN,
        timestamp,
    } satisfies StatusUpdate;
};

const resetStores = (): void => {
    useAlertStore.setState({ alerts: [] });
    const defaults = useSettingsStore.getState().settings;
    useSettingsStore.setState({
        settings: {
            ...defaults,
            inAppAlertsEnabled: true,
            inAppAlertsSoundEnabled: false,
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
        },
    });
};

describe("alertCoordinator", () => {
    beforeEach(() => {
        resetStores();
        alertCoordinator.resetAlertToneInvoker();
    });

    afterEach(() => {
        resetStores();
        alertCoordinator.resetAlertToneInvoker();
        vi.clearAllMocks();
    });

    it("does not enqueue alerts when in-app alerts are disabled", () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsEnabled: false,
            },
        }));

        const result =
            alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(result).toBeUndefined();
        expect(useAlertStore.getState().alerts).toHaveLength(0);
    });

    it("enqueues alerts when enabled", () => {
        const result =
            alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(result).toBeDefined();
        expect(useAlertStore.getState().alerts).toHaveLength(1);
    });

    it("plays a tone when sound alerts are enabled", () => {
        const toneSpy = vi.fn().mockResolvedValue(undefined);
        alertCoordinator.setAlertToneInvoker(toneSpy);

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
            },
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(toneSpy).toHaveBeenCalledTimes(1);
    });

    it("does not play a tone when the alert volume is muted", () => {
        const toneSpy = vi.fn().mockResolvedValue(undefined);
        alertCoordinator.setAlertToneInvoker(toneSpy);

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: 0,
            },
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(toneSpy).not.toHaveBeenCalled();
    });

    it.each([
        ["greater than one", 1.25],
        ["infinite", Number.POSITIVE_INFINITY],
        ["not-a-number", Number.NaN],
    ])("normalizes %s alert volume candidates", (_, volume) => {
        const toneSpy = vi.fn().mockResolvedValue(undefined);
        alertCoordinator.setAlertToneInvoker(toneSpy);

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: volume,
            },
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(toneSpy).toHaveBeenCalledTimes(1);
    });

    it("logs when sound is enabled but the normalized volume is zero", () => {
        const toneSpy = vi.fn().mockResolvedValue(undefined);
        alertCoordinator.setAlertToneInvoker(toneSpy);

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: -2,
            },
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(toneSpy).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(
            "Skipping alert tone playback because the volume is muted"
        );
    });

    it("logs when the alert queue reaches the configured capacity", () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: false,
            },
        }));

        const existingAlerts = Array.from(
            { length: MAX_ALERT_QUEUE_LENGTH },
            (_, index) => ({
                id: `existing-${index}`,
                monitorId: `monitor-${index}`,
                monitorName: `Monitor ${index}`,
                siteIdentifier: `site-${index}`,
                siteName: `Site ${index}`,
                status: STATUS_KIND.UP,
                timestamp: Date.now(),
            })
        );

        useAlertStore.setState((state) => ({
            ...state,
            alerts: existingAlerts,
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(logger.debug).toHaveBeenCalledWith(
            "Alert queue reached capacity; oldest alerts will be discarded"
        );
    });

    it("synchronizes system notification preferences", async () => {
        const { NotificationPreferenceService } =
            await import("../../../services/NotificationPreferenceService");

        await alertCoordinator.synchronizeNotificationPreferences();

        expect(
            NotificationPreferenceService.updatePreferences
        ).toHaveBeenCalledWith({
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
            mutedSiteNotificationIdentifiers: [],
        });
    });

    it("sends updated notification preferences when toggles change", async () => {
        const { NotificationPreferenceService } =
            await import("../../../services/NotificationPreferenceService");

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                systemNotificationsEnabled: false,
                systemNotificationsSoundEnabled: true,
            },
        }));

        await alertCoordinator.synchronizeNotificationPreferences();

        expect(
            NotificationPreferenceService.updatePreferences
        ).toHaveBeenCalledWith({
            systemNotificationsEnabled: false,
            systemNotificationsSoundEnabled: true,
            mutedSiteNotificationIdentifiers: [],
        });
    });
});

describe("playInAppAlertTone", () => {
    let originalAudioContext: typeof AudioContext | undefined;
    let gainRampValues: number[];
    let createOscillatorSpy: ReturnType<typeof vi.fn>;
    let createGainSpy: ReturnType<typeof vi.fn>;

    class MockGain {
        public connect = vi.fn();
        public gain = {
            exponentialRampToValueAtTime: vi.fn((value: number) => {
                gainRampValues.push(value);
            }),
            setValueAtTime: vi.fn(),
        };
    }

    class MockOscillator {
        public type: OscillatorType = "triangle";
        public frequency = {
            setValueAtTime: vi.fn(),
        };
        public connect = vi.fn();
        public start = vi.fn();
        public stop = vi.fn();
        public addEventListener = vi.fn();
    }

    class TestAudioContext {
        public currentTime = 0;
        public state: AudioContextState = "running";
        public createGain = createGainSpy;
        public createOscillator = createOscillatorSpy;
        public resume = vi.fn(async () => undefined);
        public close = vi.fn(async () => undefined);
    }

    beforeEach(async () => {
        gainRampValues = [];
        createOscillatorSpy = vi.fn(() => new MockOscillator());
        createGainSpy = vi.fn(() => new MockGain());

        originalAudioContext = globalThis.AudioContext;
        (
            globalThis as unknown as { AudioContext: typeof AudioContext }
        ).AudioContext = TestAudioContext as unknown as typeof AudioContext;

        await alertCoordinator.resetAlertAudioContextForTesting();
    });

    afterEach(async () => {
        if (originalAudioContext) {
            (
                globalThis as unknown as { AudioContext: typeof AudioContext }
            ).AudioContext = originalAudioContext;
        } else {
            delete (
                globalThis as unknown as { AudioContext?: typeof AudioContext }
            ).AudioContext;
        }

        await alertCoordinator.resetAlertAudioContextForTesting();
    });

    it("skips oscillator creation when the volume is muted", async () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: 0,
            },
        }));

        await alertCoordinator.playInAppAlertTone();

        expect(createOscillatorSpy).not.toHaveBeenCalled();
    });

    it("scales the gain envelope using the configured volume", async () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: 0.5,
            },
        }));

        await alertCoordinator.playInAppAlertTone();

        expect(
            gainRampValues.some((value) => Math.abs(value - 0.04) < 0.0005)
        ).toBeTruthy();
    });

    it("logs when neither standard nor prefixed AudioContext is available", async () => {
        delete (globalThis as unknown as { AudioContext?: typeof AudioContext })
            .AudioContext;
        delete (
            globalThis as unknown as {
                webkitAudioContext?: typeof AudioContext;
            }
        ).webkitAudioContext;

        await alertCoordinator.resetAlertAudioContextForTesting();

        await alertCoordinator.playInAppAlertTone();

        expect(logger.debug).toHaveBeenCalledWith(
            "AudioContext unavailable; skipping alert tone"
        );
    });

    it("falls back to webkitAudioContext when necessary", async () => {
        delete (globalThis as unknown as { AudioContext?: typeof AudioContext })
            .AudioContext;

        (
            globalThis as unknown as {
                webkitAudioContext?: typeof AudioContext;
            }
        ).webkitAudioContext =
            TestAudioContext as unknown as typeof AudioContext;

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: 0.4,
            },
        }));

        await alertCoordinator.resetAlertAudioContextForTesting();
        await alertCoordinator.playInAppAlertTone();

        expect(createOscillatorSpy).toHaveBeenCalledTimes(1);

        delete (
            globalThis as unknown as {
                webkitAudioContext?: typeof AudioContext;
            }
        ).webkitAudioContext;
    });

    it("logs and aborts when resuming a suspended context fails", async () => {
        const resumeFailure = vi
            .fn<() => Promise<undefined>>()
            .mockRejectedValue(new Error("resume-failed"));

        class SuspendedAudioContext extends TestAudioContext {
            public override state: AudioContextState = "suspended";
            public override resume = resumeFailure;
        }

        (
            globalThis as unknown as { AudioContext: typeof AudioContext }
        ).AudioContext =
            SuspendedAudioContext as unknown as typeof AudioContext;

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
                inAppAlertVolume: 0.75,
            },
        }));

        await alertCoordinator.resetAlertAudioContextForTesting();
        await alertCoordinator.playInAppAlertTone();

        expect(resumeFailure).toHaveBeenCalledTimes(1);
        expect(logger.debug).toHaveBeenCalledWith(
            "Failed to resume AudioContext; skipping alert tone",
            expect.any(Error)
        );
        expect(createOscillatorSpy).not.toHaveBeenCalled();

        (
            globalThis as unknown as { AudioContext: typeof AudioContext }
        ).AudioContext = TestAudioContext as unknown as typeof AudioContext;
    });
});

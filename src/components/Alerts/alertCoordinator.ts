import type { StatusUpdate } from "@shared/types";

import type { StatusAlert } from "../../stores/alerts/useAlertStore";

import { logger } from "../../services/logger";
import { NotificationPreferenceService } from "../../services/NotificationPreferenceService";
import {
    mapStatusUpdateToAlert,
    MAX_ALERT_QUEUE_LENGTH,
    useAlertStore,
} from "../../stores/alerts/useAlertStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";

const audioContextRef: { current: AudioContext | null } = {
    current: null,
};

const ALERT_TONE_MIN_GAIN = 0.0001;
const ALERT_TONE_MAX_GAIN = 0.08;

/**
 * Normalizes the renderer-managed volume preference into the inclusive range
 * `[0, 1]`.
 *
 * @param candidate - Persisted volume value.
 *
 * @returns Sanitized volume multiplier used when scheduling gain envelopes.
 */
const resolveAlertVolume = (candidate: unknown): number => {
    if (typeof candidate !== "number" || Number.isNaN(candidate)) {
        return 1;
    }

    if (!Number.isFinite(candidate)) {
        return 1;
    }

    if (candidate <= 0) {
        return 0;
    }

    if (candidate >= 1) {
        return 1;
    }

    return candidate;
};

const ensureAudioContext = (): AudioContext | null => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        return audioContextRef.current;
    }

    const globalObject = globalThis as typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
    };

    let context: AudioContext | null = null;

    if (typeof globalObject.AudioContext === "function") {
        context = new AudioContext();
    } else if (typeof globalObject.webkitAudioContext === "function") {
        const WebkitAudioContext = globalObject.webkitAudioContext;
        context = new WebkitAudioContext();
    }

    audioContextRef.current = context;
    return context;
};

/**
 * Plays a short audible tone for in-app alerts when enabled.
 */
export async function playInAppAlertTone(): Promise<void> {
    const audioContext = ensureAudioContext();

    if (!audioContext) {
        logger.debug("AudioContext unavailable; skipping alert tone");
        return;
    }

    const { settings } = useSettingsStore.getState();
    const normalizedVolume = resolveAlertVolume(settings.inAppAlertVolume);

    if (normalizedVolume === 0) {
        logger.debug("In-app alert volume is muted; skipping alert tone");
        return;
    }

    const activeContext = audioContext;

    if (activeContext.state === "suspended") {
        try {
            await activeContext.resume();
        } catch (error) {
            logger.debug(
                "Failed to resume AudioContext; skipping alert tone",
                error instanceof Error ? error : new Error(String(error))
            );
            return;
        }
    }

    const oscillator = activeContext.createOscillator();
    const gainNode = activeContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, activeContext.currentTime);

    const startGain = ALERT_TONE_MIN_GAIN;
    const peakGain = Math.max(
        ALERT_TONE_MIN_GAIN,
        ALERT_TONE_MAX_GAIN * normalizedVolume
    );

    gainNode.gain.setValueAtTime(startGain, activeContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        peakGain,
        activeContext.currentTime + 0.02
    );
    gainNode.gain.exponentialRampToValueAtTime(
        ALERT_TONE_MIN_GAIN,
        activeContext.currentTime + 0.32
    );

    oscillator.connect(gainNode);
    gainNode.connect(activeContext.destination);

    oscillator.start();
    oscillator.stop(activeContext.currentTime + 0.35);

    function handleToneEnded(): void {
        gainNode.disconnect();
        oscillator.disconnect();
        audioContextRef.current =
            activeContext.state === "closed" ? null : activeContext;
        oscillator.removeEventListener("ended", handleToneEnded);
    }

    oscillator.addEventListener("ended", handleToneEnded, { once: true });
}

type AlertToneInvoker = () => Promise<void>;

const alertToneInvokerRef: { current: AlertToneInvoker } = {
    current: playInAppAlertTone,
};

/**
 * Overrides the alert tone invoker implementation.
 *
 * @remarks
 * Primarily intended for testing to replace the tone playback with a spy or
 * no-op implementation without mutating global audio state.
 *
 * @param invoker - Replacement alert tone invoker.
 */
export const setAlertToneInvoker = (invoker: AlertToneInvoker): void => {
    alertToneInvokerRef.current = invoker;
};

/**
 * Restores the default alert tone invoker implementation.
 */
export const resetAlertToneInvoker = (): void => {
    alertToneInvokerRef.current = playInAppAlertTone;
};

/**
 * Resets the cached audio context used for alert tone playback.
 *
 * @internal
 */
export const resetAlertAudioContextForTesting = async (): Promise<void> => {
    const context = audioContextRef.current;

    audioContextRef.current = null;

    if (context && typeof context.close === "function") {
        try {
            await context.close();
        } catch (error: unknown) {
            logger.debug("Failed to close alert audio context", error);
        }
    }
};

/**
 * Helper to enqueue alerts when settings permit in-app notifications.
 *
 * @param update - Status update payload from the sites store.
 */
export const enqueueAlertFromStatusUpdate = (
    update: StatusUpdate
): StatusAlert | undefined => {
    const { settings } = useSettingsStore.getState();

    if (!settings.inAppAlertsEnabled) {
        return undefined;
    }

    const alertStore = useAlertStore.getState();
    const alert = alertStore.enqueueAlert(mapStatusUpdateToAlert(update));
    logger.debug("Enqueued in-app status alert", { alertId: alert.id });

    const normalizedVolume = resolveAlertVolume(settings.inAppAlertVolume);

    if (settings.inAppAlertsSoundEnabled && normalizedVolume > 0) {
        void alertToneInvokerRef.current();
    } else if (settings.inAppAlertsSoundEnabled) {
        logger.debug(
            "Skipping alert tone playback because the volume is muted"
        );
    }

    if (alertStore.alerts.length === MAX_ALERT_QUEUE_LENGTH) {
        logger.debug(
            "Alert queue reached capacity; oldest alerts will be discarded"
        );
    }

    return alert;
};

/**
 * Synchronizes system notification preferences when relevant settings change.
 */
export const synchronizeNotificationPreferences = async (): Promise<void> => {
    const { settings } = useSettingsStore.getState();

    try {
        await NotificationPreferenceService.updatePreferences({
            systemNotificationsEnabled: settings.systemNotificationsEnabled,
            systemNotificationsSoundEnabled:
                settings.systemNotificationsSoundEnabled,
        });
    } catch (error) {
        logger.error(
            "Failed to synchronize notification preferences",
            error instanceof Error ? error : new Error(String(error))
        );
    }
};

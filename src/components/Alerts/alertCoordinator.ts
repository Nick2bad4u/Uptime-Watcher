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

    gainNode.gain.setValueAtTime(0.0001, activeContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.08,
        activeContext.currentTime + 0.02
    );
    gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
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

    if (settings.inAppAlertsSoundEnabled) {
        void alertToneInvokerRef.current();
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

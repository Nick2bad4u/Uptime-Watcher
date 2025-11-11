/**
 * Renderer service for synchronizing notification preferences with Electron.
 *
 * @remarks
 * Provides a typed abstraction around the notifications preload bridge so UI
 * state can update the main-process notification configuration without touching
 * IPC primitives directly.
 *
 * @packageDocumentation
 */

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import { ensureError } from "@shared/utils/errorHandling";
import { isRecord } from "@shared/utils/typeHelpers";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("NotificationPreferenceService", {
            bridgeContracts: [
                {
                    domain: "notifications",
                    methods: ["updatePreferences"],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

interface NotificationBridgeLike {
    readonly updatePreferences: (
        preferences: NotificationPreferenceUpdate
    ) => Promise<void>;
}

const isNotificationBridge = (
    candidate: unknown
): candidate is NotificationBridgeLike => {
    if (!isRecord(candidate)) {
        return false;
    }

    const { updatePreferences } = candidate as {
        updatePreferences?: unknown;
    };
    return typeof updatePreferences === "function";
};

const getNotificationBridge = (
    api: typeof window.electronAPI
): NotificationBridgeLike => {
    const apiCandidate: unknown = api;

    if (!isRecord(apiCandidate)) {
        throw new TypeError(
            "Notification bridge unavailable: electronAPI not initialized"
        );
    }

    const notifications = Reflect.get(apiCandidate, "notifications");

    if (!isNotificationBridge(notifications)) {
        throw new TypeError(
            "Notification bridge missing updatePreferences method"
        );
    }

    return notifications;
};

/**
 * Contract describing notification preference operations from the renderer.
 */
interface NotificationPreferenceServiceContract {
    /** Ensure preload bridge initialization. */
    initialize: () => Promise<void>;
    /**
     * Updates the main-process notification configuration.
     *
     * @param preferences - Notification preference payload.
     */
    updatePreferences: (
        preferences: NotificationPreferenceUpdate
    ) => Promise<void>;
}

/**
 * Renderer-facing service for configuring system notifications.
 *
 * @public
 */
export const NotificationPreferenceService: NotificationPreferenceServiceContract =
    {
        initialize: ensureInitialized,
        updatePreferences: wrap(
            "updatePreferences",
            async (api, preferences: NotificationPreferenceUpdate) => {
                const notificationBridge = getNotificationBridge(api);
                await notificationBridge.updatePreferences(preferences);
            }
        ),
    };

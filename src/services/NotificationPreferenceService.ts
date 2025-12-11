/**
 * Renderer service for synchronizing notification preferences with Electron.
 *
 * @remarks
 * Provides a typed abstraction around the notifications preload bridge so UI
 * state can update the main-process notification configuration without touching
 * IPC primitives directly. This service performs an additional runtime
 * structural check on the `notifications` domain to surface clearer error
 * messages when the preload bridge is misconfigured, complementing (rather than
 * replacing) the standard `getIpcServiceHelpers` readiness guards.
 *
 * @packageDocumentation
 */

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import { ensureError } from "@shared/utils/errorHandling";
import { validateNotificationPreferenceUpdate } from "@shared/validation/notifications";

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
        updatePreferences: wrap("updatePreferences", async (
            api,
            preferences: NotificationPreferenceUpdate
        ) => {
            const validation =
                validateNotificationPreferenceUpdate(preferences);

            if (!validation.success) {
                const issues = validation.error.issues
                    .map(({ message }) => message)
                    .join(", ");
                throw new Error(`Invalid notification preferences: ${issues}`, {
                    cause: validation.error,
                });
            }

            await api.notifications.updatePreferences(validation.data);
        }),
    };

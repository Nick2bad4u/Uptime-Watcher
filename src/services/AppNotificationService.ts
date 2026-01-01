/**
 * Renderer service for requesting generic app system notifications.
 *
 * @remarks
 * This service is intended for **user-initiated** operations (e.g. Cloud Sync &
 * Backup actions) where the user expects immediate feedback even if the app is
 * minimized.
 *
 * It is intentionally separate from {@link NotificationPreferenceService}:
 * preferences control whether notifications are enabled; this service only
 * requests dispatch.
 *
 * @packageDocumentation
 */

import type { AppNotificationRequest } from "@shared/types/notifications";

import { validateAppNotificationRequest } from "@shared/validation/notifications";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

// eslint-disable-next-line ex/no-unhandled -- Module-level initialization should fail fast when preload wiring is invalid.
const { ensureInitialized, wrap } = getIpcServiceHelpers(
    "AppNotificationService",
    {
        bridgeContracts: [
            {
                domain: "notifications",
                methods: ["notifyAppEvent"],
            },
        ],
    }
);

/**
 * Contract describing app notification operations from the renderer.
 */
interface AppNotificationServiceContract {
    /** Ensure preload bridge initialization. */
    initialize: () => Promise<void>;

    /**
     * Requests a generic system notification.
     *
     * @param request - Notification request payload.
     */
    notifyAppEvent: (request: AppNotificationRequest) => Promise<void>;
}

/**
 * Renderer-facing service for requesting OS notifications.
 *
 * @public
 */
export const AppNotificationService: AppNotificationServiceContract = {
    initialize: ensureInitialized,

    notifyAppEvent: wrap(
        "notifyAppEvent",
        async (api, request: AppNotificationRequest) => {
            const validation = validateAppNotificationRequest(request);
            if (!validation.success) {
                const issues = validation.error.issues
                    .map(({ message }) => message)
                    .join(", ");
                throw new Error(`Invalid app notification request: ${issues}`, {
                    cause: validation.error,
                });
            }

            await api.notifications.notifyAppEvent(validation.data);
        }
    ),
};

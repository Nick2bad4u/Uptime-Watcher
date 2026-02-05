import { ensureError } from "@shared/utils/errorHandling";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import { AppNotificationService } from "../../../services/AppNotificationService";
import { logger } from "../../../services/logger";
import { useAlertStore } from "../../alerts/useAlertStore";
import { useSettingsStore } from "../../settings/useSettingsStore";

const CLOUD_OPERATION_STARTED_TOAST_TTL_MS = 15_000;

/**
 * Returns the user-facing error detail string used by CloudStore notifications.
 */
export function getCloudUserFacingErrorDetail(error: unknown): string {
    return getUserFacingErrorDetail(error);
}

/**
 * Dismisses a toast when the id is defined.
 */
export function dismissToastSafely(toastId: null | string): void {
    if (!toastId) {
        return;
    }

    useAlertStore.getState().dismissToast(toastId);
}

/**
 * Enqueues a CloudStore toast.
 */
export function enqueueCloudToast(args: {
    message?: string | undefined;
    title: string;
    ttlMs?: number | undefined;
    variant: "error" | "info" | "success";
}): string {
    // Store actions are allowed to use Zustand stores directly.
    const toast = useAlertStore.getState().enqueueToast({
        ...(args.message === undefined ? {} : { message: args.message }),
        ...(args.ttlMs === undefined ? {} : { ttlMs: args.ttlMs }),
        title: args.title,
        variant: args.variant,
    });

    return toast.id;
}

/**
 * Enqueues a standardized "operation started" toast.
 */
export function enqueueCloudOperationStartedToast(args: {
    message?: string | undefined;
    title: string;
}): string {
    return enqueueCloudToast({
        message: args.message,
        title: args.title,
        ttlMs: CLOUD_OPERATION_STARTED_TOAST_TTL_MS,
        variant: "info",
    });
}

/**
 * Sends a system notification if the user has enabled them.
 */
export async function dispatchSystemNotificationIfEnabled(request: {
    body?: string | undefined;
    title: string;
}): Promise<void> {
    const { systemNotificationsEnabled } = useSettingsStore.getState().settings;
    if (!systemNotificationsEnabled) {
        return;
    }

    try {
        await AppNotificationService.notifyAppEvent({
            ...(request.body === undefined ? {} : { body: request.body }),
            title: request.title,
        });
    } catch (error: unknown) {
        logger.debug(
            "[CloudStore] Failed to dispatch system notification",
            ensureError(error)
        );
    }
}

/**
 * Enqueues a user-facing error toast using shared error-detail formatting.
 */
export function enqueueCloudErrorToast(title: string, error: unknown): void {
    const userFacingMessage = getCloudUserFacingErrorDetail(error);

    enqueueCloudToast({
        message: userFacingMessage,
        title,
        variant: "error",
    });
}

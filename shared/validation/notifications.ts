import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import * as z from "zod";

/**
 * Canonical schema for notification preference updates exchanged over IPC.
 */
export const notificationPreferenceUpdateSchema: z.ZodType<{
    systemNotificationsEnabled: boolean;
    systemNotificationsSoundEnabled: boolean;
}> = z
    .object({
        systemNotificationsEnabled: z.boolean(),
        systemNotificationsSoundEnabled: z.boolean(),
    })
    .strict();

/**
 * Validates a notification preference payload against the shared schema.
 */
export const validateNotificationPreferenceUpdate = (
    value: unknown
): ReturnType<typeof notificationPreferenceUpdateSchema.safeParse> =>
    notificationPreferenceUpdateSchema.safeParse(value);

/**
 * Extracts a typed preference update or throws with Zod issues attached.
 */
export const parseNotificationPreferenceUpdate = (
    value: unknown
): NotificationPreferenceUpdate =>
    notificationPreferenceUpdateSchema.parse(value);

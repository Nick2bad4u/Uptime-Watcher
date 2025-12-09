import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import * as z from "zod";

/**
 * Canonical schema for notification preference updates exchanged over IPC.
 */
export const notificationPreferenceUpdateSchema: z.ZodType<{
    mutedSiteNotificationIdentifiers?: readonly string[] | undefined;
    systemNotificationsEnabled: boolean;
    systemNotificationsSoundEnabled: boolean;
}> = z
    .object({
        mutedSiteNotificationIdentifiers: z
            .array(z.string().min(1))
            .max(1000)
            .readonly()
            .optional(),
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
): NotificationPreferenceUpdate => {
    const parsed = notificationPreferenceUpdateSchema.parse(value);
    // Zod returns an object whose shape is validated against the schema; with
    // exactOptionalPropertyTypes enabled the optional array field may be
    // present with an explicit `undefined` value. The wider Zod output is
    // safe to treat as the canonical NotificationPreferenceUpdate here.
    return parsed as NotificationPreferenceUpdate;
};

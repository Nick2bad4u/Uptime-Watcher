import { NOTIFICATION_CHANNELS } from "@shared/types/preload";

/**
 * Deprecated: legacy notification channel shim.
 *
 * This module previously contained a special-case guard for notification IPC
 * channel strings. The codebase now uses the shared `NOTIFICATION_CHANNELS`
 * mapping directly.
 *
 * This file remains only to avoid breaking any out-of-tree imports.
 */
export const UPDATE_NOTIFICATION_PREFERENCES_CHANNEL: typeof NOTIFICATION_CHANNELS.updatePreferences =
    NOTIFICATION_CHANNELS.updatePreferences;

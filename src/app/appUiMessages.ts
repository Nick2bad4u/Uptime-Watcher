/**
 * UI message constants for the root application shell.
 *
 * @remarks
 * Centralizing strings here keeps `App.tsx` focused on orchestration and makes
 * future localization easier.
 */
export const UI_MESSAGES = {
    ERROR_CLOSE_BUTTON: "Close",
    LOADING: "Loading...",
    SITE_COUNT_LABEL: "Monitored Sites",
    UPDATE_AVAILABLE: "A new update is available. Downloading...",
    UPDATE_DISMISS_BUTTON: "Dismiss",
    UPDATE_DOWNLOADED: "Update downloaded! Restart to apply.",
    UPDATE_DOWNLOADING: "Update is downloading...",
    UPDATE_ERROR_FALLBACK: "Update failed.",
    UPDATE_RESTART_BUTTON: "Restart Now",
} as const;

/**
 * Lightweight (non-Zod) constants for monitor field validation.
 *
 * @remarks
 * Keep message strings and limits centralized so that Zod schemas, IPC
 * validators and persistence layers stay aligned.
 */

export const MONITOR_ID_MAX_LENGTH = 100;

export const MONITOR_ID_REQUIRED_MESSAGE = "Monitor ID is required";
export const MONITOR_ID_TOO_LONG_MESSAGE = "Monitor ID too long";

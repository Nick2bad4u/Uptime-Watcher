import { isSafeInteger } from "ts-extras";

/**
 * Parses a persisted history-limit setting string.
 *
 * @remarks
 * History limits are stored as strings in the settings repository. Keep parsing
 * strict here so malformed persisted/imported values do not accidentally become
 * valid JavaScript numbers through `Number(...)` coercion.
 */
export function parseHistoryLimitSetting(value: string): number | undefined {
    const normalized = value.trim();
    if (!/^[+-]?\d+$/u.test(normalized)) {
        return undefined;
    }

    const parsed = Number(normalized);
    return isSafeInteger(parsed) ? parsed : undefined;
}

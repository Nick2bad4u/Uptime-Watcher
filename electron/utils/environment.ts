import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";

/**
 * Centralized helpers for safe environment access in Electron main and preload
 * contexts.
 */

/**
 * Safely reads a string environment variable from Node.js.
 *
 * @param key - Environment variable name.
 *
 * @returns The value when defined and non-empty; otherwise `undefined`.
 */
export const readProcessEnv = (key: string): string | undefined => {
    try {
        if (typeof process === "undefined") {
            return undefined;
        }
        // eslint-disable-next-line n/no-process-env -- Centralized, audited environment accessor
        const value = process.env[key];
        if (value === undefined || value === "") {
            return undefined;
        }

        return value;
    } catch (error: unknown) {
        const normalized = ensureError(error);

        logger.error("[Env] Failed to read process env", {
            error: normalized,
            key,
        });
        return undefined;
    }
};

/**
 * Normalizes common boolean env flag representations.
 */
export const readBooleanEnv = (key: string): boolean => {
    const raw = readProcessEnv(key);
    if (!raw) {
        return false;
    }

    const normalized = raw.toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
};

/**
 * Reads a numeric environment value with a safe fallback.
 *
 * @param key - Environment variable name.
 * @param fallback - Fallback value when parsing fails.
 */
export const readNumberEnv = (key: string, fallback: number): number => {
    const raw = readProcessEnv(key);
    if (!raw) {
        return fallback;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

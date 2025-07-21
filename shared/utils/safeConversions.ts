/**
 * Type-safe conversion utilities for handling user input and data transformation.
 * Provides safe alternatives to parseInt, parseFloat, Number(), etc.
 */

import { isNumber, isString } from "./typeGuards";

/**
 * Safely converts any value to a number with fallback.
 */
export function safeNumberConversion(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return value;
    }

    if (isString(value)) {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to a check interval (minimum 1000ms) with fallback.
 */
export function safeParseCheckInterval(value: unknown, defaultValue = 300_000): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed >= 1000 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a float with fallback.
 */
export function safeParseFloat(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return value;
    }

    if (isString(value)) {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to an integer with fallback.
 */
export function safeParseInt(value: unknown, defaultValue = 0): number {
    if (isNumber(value)) {
        return Number.isInteger(value) ? value : Math.floor(value);
    }

    if (isString(value)) {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
}

/**
 * Safely converts a value to a percentage (0-100) with fallback.
 */
export function safeParsePercentage(value: unknown, defaultValue = 0): number {
    const parsed = safeParseFloat(value, defaultValue);
    return Math.max(0, Math.min(100, parsed));
}

/**
 * Safely converts a value to a port number (1-65535) with fallback.
 */
export function safeParsePort(value: unknown, defaultValue = 80): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 1 && parsed <= 65_535 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a positive integer with fallback.
 */
export function safeParsePositiveInt(value: unknown, defaultValue = 1): number {
    const result = safeParseInt(value, defaultValue);
    return result > 0 ? result : defaultValue;
}

/**
 * Safely converts a value to a retry attempts count (0-10) with fallback.
 */
export function safeParseRetryAttempts(value: unknown, defaultValue = 3): number {
    const parsed = safeParseInt(value, defaultValue);
    return parsed >= 0 && parsed <= 10 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timeout value (positive number) with fallback.
 */
export function safeParseTimeout(value: unknown, defaultValue = 10_000): number {
    const parsed = safeNumberConversion(value, defaultValue);
    return parsed > 0 ? parsed : defaultValue;
}

/**
 * Safely converts a value to a timestamp with fallback.
 */
export function safeParseTimestamp(value: unknown, defaultValue?: number): number {
    const fallback = defaultValue ?? Date.now();
    const parsed = safeNumberConversion(value, fallback);

    // Basic timestamp validation (must be positive and reasonable)
    return parsed > 0 && parsed <= Date.now() + 86_400_000 ? parsed : fallback;
}

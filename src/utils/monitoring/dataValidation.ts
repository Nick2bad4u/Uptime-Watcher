/**
 * Utility functions for parsing and validating monitoring data with safe error
 * handling.
 *
 * @remarks
 * Provides safe parsing functions with comprehensive validation and error
 * handling for monitoring-related data. These utilities ensure that invalid
 * input data doesn't crash the app and provides meaningful fallback values.
 *
 * Key features:
 *
 * - Safe uptime string parsing with validation
 * - Input sanitization and range validation
 * - Comprehensive error logging for debugging
 * - Fallback values for invalid inputs
 *
 * @example
 *
 * ```typescript
 * import { parseUptimeValue } from "./dataValidation";
 *
 * // Parse uptime strings safely
 * const uptime1 = parseUptimeValue("99.5%"); // Returns: 99.5
 * const uptime2 = parseUptimeValue("invalid"); // Returns: 0 (fallback)
 * ```
 *
 * @packageDocumentation
 */

import { logger } from "../../services/logger";

const isDigit = (character: string): boolean =>
    character >= "0" && character <= "9";

const isSignedDecimalLiteral = (value: string): boolean => {
    let hasDigit = false;
    let hasDecimalPoint = false;
    let hasExponent = false;
    let hasExponentDigit = false;

    for (let index = 0; index < value.length; index += 1) {
        const character = value[index];
        if (character === undefined) {
            return false;
        }

        if (character === "+" || character === "-") {
            const previousCharacter = index > 0 ? value[index - 1] : undefined;
            if (
                index !== 0 &&
                previousCharacter !== "e" &&
                previousCharacter !== "E"
            ) {
                return false;
            }
            continue;
        }

        if (character === ".") {
            if (hasDecimalPoint || hasExponent) {
                return false;
            }
            hasDecimalPoint = true;
            continue;
        }

        if (character === "e" || character === "E") {
            if (hasExponent || !hasDigit) {
                return false;
            }
            hasExponent = true;
            continue;
        }

        if (!isDigit(character)) {
            return false;
        }

        hasDigit = true;
        hasExponentDigit ||= hasExponent;
    }

    return hasDigit && (!hasExponent || hasExponentDigit);
};

/**
 * Parse and validate uptime string to number. Handles strings with percent
 * signs and validates the result.
 *
 * @remarks
 * Removes whitespace and percent symbols, converts the remaining value to a
 * floating point number, and clamps the result to the 0–100 range. Invalid
 * inputs are logged for diagnostics and return the fallback value `0`.
 *
 * @param uptimeString - The uptime string to parse (may contain `%` signs).
 *
 * @returns Validated uptime number between `0` and `100`, or `0` if invalid.
 *
 * @public
 */
export const parseUptimeValue = (uptimeString: string): number => {
    const trimmedUptime = uptimeString.trim();

    const numericUptime = trimmedUptime.endsWith("%")
        ? trimmedUptime.slice(0, -1)
        : trimmedUptime;

    if (
        numericUptime.length === 0 ||
        numericUptime !== numericUptime.trim() ||
        !isSignedDecimalLiteral(numericUptime)
    ) {
        logger.warn("Invalid uptime value received", { uptime: uptimeString });
        return 0;
    }

    const parsed = Number.parseFloat(numericUptime);

    // Validate the parsed value is a valid number and within expected range
    if (!Number.isFinite(parsed)) {
        logger.warn("Invalid uptime value received", { uptime: uptimeString });
        return 0;
    }

    // Clamp to 0-100 range for safety
    return Math.min(100, Math.max(0, parsed));
};

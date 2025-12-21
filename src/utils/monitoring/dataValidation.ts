/**
 * Utility functions for parsing and validating monitoring data with safe error
 * handling.
 *
 * @remarks
 * Provides safe parsing functions with comprehensive validation and error
 * handling for monitoring-related data. These utilities ensure that invalid
 * input data doesn't crash the application and provides meaningful fallback
 * values.
 *
 * Key features:
 *
 * - Safe uptime string parsing with validation
 * - URL hostname extraction with error handling
 * - Input sanitization and range validation
 * - Comprehensive error logging for debugging
 * - Fallback values for invalid inputs
 *
 * @example
 *
 * ```typescript
 * import { parseUptimeValue, safeGetHostname } from "./dataValidation";
 *
 * // Parse uptime strings safely
 * const uptime1 = parseUptimeValue("99.5%"); // Returns: 99.5
 * const uptime2 = parseUptimeValue("invalid"); // Returns: 0 (fallback)
 *
 * // Extract hostname safely
 * const hostname1 = safeGetHostname("https://example.com/path"); // Returns: "example.com"
 * const hostname2 = safeGetHostname("invalid-url"); // Returns: "" (fallback)
 * ```
 *
 * @packageDocumentation
 */

import { isValidUrl } from "@shared/validation/validatorUtils";

import { logger } from "../../services/logger";

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
    // Remove any percent signs and whitespace
     
    const cleanedUptime = uptimeString.replaceAll(/[\s%]/gu, "");
    const parsed = Number.parseFloat(cleanedUptime);

    // Validate the parsed value is a valid number and within expected range
    if (Number.isNaN(parsed)) {
        logger.warn("Invalid uptime value received", { uptime: uptimeString });
        return 0;
    }

    // Clamp to 0-100 range for safety
    return Math.min(100, Math.max(0, parsed));
};

/**
 * Safely extracts hostname from a URL string.
 *
 * @remarks
 * Applies shared URL validation before attempting to construct a {@link URL}.
 * Any parsing failures return an empty string so consumers can fall back to a
 * neutral display value without crashing.
 *
 * @param urlString - The URL string to extract hostname from.
 *
 * @returns The hostname when the URL is valid; otherwise an empty string.
 *
 * @public
 */
export const safeGetHostname = (urlString: string): string => {
    if (!isValidUrl(urlString)) {
        return "";
    }
    try {
        return new URL(urlString).hostname;
    } catch {
        return "";
    }
};

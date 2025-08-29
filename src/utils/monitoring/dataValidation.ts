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

import { logger } from "../../services/logger";

/**
 * Parse and validate uptime string to number. Handles strings with percent
 * signs and validates the result.
 *
 * @param uptimeString - The uptime string to parse (may contain % signs)
 *
 * @returns Validated uptime number between 0-100, or 0 if invalid
 */
export const parseUptimeValue = (uptimeString: string): number => {
    // Remove any percent signs and whitespace
    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- Simple character class [\s%] is more readable and compatible than unicode sets for basic whitespace/percent removal
    const cleanedUptime = uptimeString.replaceAll(/[\s%]/g, "");
    const parsed = Number.parseFloat(cleanedUptime);

    // Validate the parsed value is a valid number and within expected range
    if (Number.isNaN(parsed)) {
        logger.warn("Invalid uptime value received", { uptime: uptimeString });
        return 0;
    }

    // Clamp to 0-100 range for safety
    return Math.min(100, Math.max(0, parsed));
};

import { isValidUrl } from "@shared/validation/validatorUtils";

/**
 * Safely extracts hostname from a URL string.
 *
 * @param urlString - The URL string to extract hostname from
 *
 * @returns The hostname if URL is valid, empty string otherwise
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

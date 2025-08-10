/**
 * Utility functions for parsing and validating monitoring data.
 * Provides safe parsing functions with validation and error handling.
 */

import logger from "../../services/logger";

/**
 * Parse and validate uptime string to number.
 * Handles strings with percent signs and validates the result.
 *
 * @param uptimeString - The uptime string to parse (may contain % signs)
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

/**
 * Validates if a string is a valid URL.
 *
 * @param urlString - The string to validate
 * @returns True if the string is a valid URL, false otherwise
 */
export const isValidUrl = (urlString: string): boolean => {
    if (!urlString || typeof urlString !== "string") {
        return false;
    }
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
};

/**
 * Safely extracts hostname from a URL string.
 *
 * @param urlString - The URL string to extract hostname from
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

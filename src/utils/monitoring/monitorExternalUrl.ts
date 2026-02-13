import { isValidUrl } from "@shared/validation/validatorUtils";

/**
 * Normalizes and validates a monitor URL intended for external opening.
 *
 * @remarks
 * Uses the same disallow-auth policy across site-detail components so URL
 * rendering and click handling cannot drift.
 *
 * @param value - Untrusted URL candidate.
 *
 * @returns Trimmed validated URL or an empty string when invalid.
 */
export function normalizeMonitorExternalUrl(value: unknown): string {
    const trimmedUrl = typeof value === "string" ? value.trim() : "";
    if (trimmedUrl.length === 0) {
        return "";
    }

    return isValidUrl(trimmedUrl, {
        disallowAuth: true,
    })
        ? trimmedUrl
        : "";
}

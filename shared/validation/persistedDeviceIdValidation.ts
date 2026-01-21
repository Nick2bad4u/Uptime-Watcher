/**
 * Persisted device ID validation for cloud sync.
 *
 * @remarks
 * Cloud sync stores a device identifier in provider object keys:
 * `sync/devices/<deviceId>/...`.
 *
 * This validation is shared so the accept/reject policy cannot drift between
 * the sync engine, provider transport, and shared type parsing.
 */

import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/** Maximum byte budget accepted for persisted sync device IDs. */
export const MAX_PERSISTED_DEVICE_ID_BYTES = 256;

/**
 * Returns a stable validation error string for persisted device IDs.
 *
 * @remarks
 * The error messages are intentionally stable because some tests and telemetry
 * rely on them.
 */
export function getPersistedDeviceIdValidationError(
    candidate: string
): null | string {
    const trimmed = candidate.trim();
    if (trimmed.length === 0) {
        return "deviceId must be a non-empty string";
    }

    if (trimmed !== candidate) {
        return "deviceId must not contain leading or trailing whitespace";
    }

    if (getUtfByteLength(candidate) > MAX_PERSISTED_DEVICE_ID_BYTES) {
        return `deviceId must not exceed ${MAX_PERSISTED_DEVICE_ID_BYTES} bytes`;
    }

    if (hasAsciiControlCharacters(candidate)) {
        return "deviceId must not contain control characters";
    }

    // Device IDs must be a single key segment.
    if (normalizePathSeparatorsToPosix(candidate).includes("/")) {
        return "deviceId must not contain path separators";
    }

    // Device IDs are used in provider object keys; reject colon tokens to avoid
    // ambiguity across providers and to match other key policies.
    if (candidate.includes(":")) {
        return "deviceId must not contain ':'";
    }

    if (candidate === "." || candidate === "..") {
        return "deviceId must not be a traversal segment";
    }

    // Defense-in-depth: device IDs may be used as object keys (manifest.devices)
    // in addition to provider key segments.
    if (
        candidate === "__proto__" ||
        candidate === "constructor" ||
        candidate === "prototype"
    ) {
        return "deviceId must not be a dangerous prototype key";
    }

    return null;
}

/**
 * Returns whether a device ID is safe for persistence in sync keys.
 */
export function isValidPersistedDeviceId(candidate: string): boolean {
    return getPersistedDeviceIdValidationError(candidate) === null;
}

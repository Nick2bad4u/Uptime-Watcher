/**
 * Snapshot key helpers for cloud sync.
 *
 * @remarks
 * Snapshot keys currently support two filename formats:
 *
 * - Legacy: `<createdAt>.json`
 * - V2: `<createdAt>-<nonceHex>.json`
 *
 * Where `createdAt` is ASCII digits and `nonceHex` is 32 lowercase hex chars.
 *
 * This module centralizes snapshot filename validation so remote-compat rules
 * don't drift across transports/migrations/tests.
 */

import { isAsciiDigits } from "./syncEngineUtils";

/** Minimum hex chars used for snapshot nonce suffix. */
export const SNAPSHOT_NONCE_HEX_CHARS = 32 as const;

/**
 * Returns a nonce suitable for appending to a snapshot key.
 */
export function createSnapshotNonceHex(): string {
    if (typeof globalThis.crypto.randomUUID !== "function") {
        throw new TypeError("crypto.randomUUID is unavailable");
    }

    // RandomUUID is RFC4122 (hex + dashes). Remove dashes to get 32 hex chars.
    return globalThis.crypto.randomUUID().replaceAll("-", "");
}

function isValidSnapshotNonceHex(raw: string): boolean {
    const normalized = raw.toLowerCase();
    if (normalized.length !== SNAPSHOT_NONCE_HEX_CHARS) {
        return false;
    }

    // Keep this strict: the suffix is an internal nonce used for collision
    // avoidance and should be ASCII hex.
    for (const char of normalized) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined) {
            return false;
        }

        const isDigit = codePoint >= 48 && codePoint <= 57;
        const isHexLower = codePoint >= 97 && codePoint <= 102;
        if (!isDigit && !isHexLower) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true when a snapshot filename matches supported formats.
 */
export function isValidSnapshotFileName(fileName: string): boolean {
    if (typeof fileName !== "string" || !fileName.endsWith(".json")) {
        return false;
    }

    const stem = fileName.slice(0, -".json".length);
    const [
        createdAtRaw,
        nonceRaw,
        ...rest
    ] = stem.split("-");

    if (!createdAtRaw || rest.length > 0) {
        return false;
    }

    if (!isAsciiDigits(createdAtRaw)) {
        return false;
    }

    if (nonceRaw !== undefined) {
        return isValidSnapshotNonceHex(nonceRaw);
    }

    return true;
}

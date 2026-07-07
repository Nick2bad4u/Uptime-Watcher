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

import { randomUUID } from "node:crypto";
import { isDefined, isSafeInteger, stringSplit } from "ts-extras";

import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";

import { isAsciiDigits } from "./syncEngineUtils";

/** Number of lowercase hex chars used for snapshot nonce suffix. */
const SNAPSHOT_NONCE_HEX_CHARS = 32 as const;

/** Metadata encoded in a snapshot filename. */
export type SnapshotFileNameMetadata = Readonly<{
    createdAt: number;
}>;

/**
 * Returns a nonce suitable for appending to a snapshot key.
 */
export function createSnapshotNonceHex(): string {
    // RandomUUID is RFC4122 (hex + dashes). Remove dashes to get 32 hex chars.
    return randomUUID().replaceAll("-", "");
}

function isValidSnapshotNonceHex(raw: string): boolean {
    if (raw.length !== SNAPSHOT_NONCE_HEX_CHARS) {
        return false;
    }

    // Keep this strict: the suffix is an internal nonce used for collision
    // avoidance and should be ASCII hex.
    for (const char of raw) {
        const codePoint = char.codePointAt(0);
        if (!isDefined(codePoint)) {
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
    return parseSnapshotFileNameMetadata(fileName) !== null;
}

/**
 * Parses and validates a supported snapshot filename.
 */
export function parseSnapshotFileNameMetadata(
    fileName: string
): null | SnapshotFileNameMetadata {
    if (typeof fileName !== "string" || !fileName.endsWith(".json")) {
        return null;
    }

    const stem = fileName.slice(0, -".json".length);
    const [
        createdAtRaw,
        nonceRaw,
        ...rest
    ] = stringSplit(stem, "-");

    if (!createdAtRaw || rest.length > 0) {
        return null;
    }

    if (!isAsciiDigits(createdAtRaw)) {
        return null;
    }

    const createdAt = Number(createdAtRaw);
    if (
        !isSafeInteger(createdAt) ||
        createdAt < 0 ||
        createdAt > MAX_VALID_DATE_EPOCH_MS
    ) {
        return null;
    }

    if (isDefined(nonceRaw) && !isValidSnapshotNonceHex(nonceRaw)) {
        return null;
    }

    return { createdAt };
}

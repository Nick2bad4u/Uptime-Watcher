import type { CloudEncryptionMode } from "@shared/types/cloudEncryption";

import { normalizeCloudObjectKey } from "@shared/utils/cloudKeyNormalization";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";

const BACKUP_KEY_PREFIX = "backups/" as const;
const MAX_BACKUP_KEY_BYTES = 2048;

/** Number of bytes expected for derived cloud encryption keys. */
export const ENCRYPTION_KEY_BYTES = 32;

/** Number of bytes expected for generated cloud encryption salts. */
export const ENCRYPTION_SALT_BYTES = 16;

function normalizeCloudKey(rawKey: string): string {
    return normalizeCloudObjectKey(rawKey, {
        forbidAsciiControlCharacters: false,
        // Preserve existing behavior: traversal segments are rejected later by
        // assertBackupObjectKey.
        forbidTraversalSegments: false,
        // Preserve leading slashes so assertBackupObjectKey can reject absolute
        // keys.
        stripLeadingSlashes: false,
    });
}

/**
 * Ensures a user-supplied provider key refers to a backup object.
 *
 * @remarks
 * This guard is intentionally strict because backup keys can cross multiple
 * trust boundaries (IPC, cloud providers, filesystem provider sandboxes).
 */
export function assertBackupObjectKey(rawKey: string): string {
    if (typeof rawKey !== "string" || rawKey.trim().length === 0) {
        throw new Error("Backup key must be a non-empty string");
    }

    const key = normalizeCloudKey(rawKey);

    if (Buffer.byteLength(key, "utf8") > MAX_BACKUP_KEY_BYTES) {
        throw new Error(
            `Backup key must not exceed ${MAX_BACKUP_KEY_BYTES} bytes`
        );
    }

    if (!key.startsWith(BACKUP_KEY_PREFIX)) {
        throw new Error("Backup key must start with 'backups/'");
    }

    if (key === BACKUP_KEY_PREFIX || key.endsWith("/")) {
        throw new Error("Backup key must reference a backup object key");
    }

    if (key.endsWith(".metadata.json")) {
        throw new Error(
            "Backup key must reference the backup object, not metadata"
        );
    }

    if (hasAsciiControlCharacters(key)) {
        throw new Error("Backup key must not contain control characters");
    }

    if (key.startsWith("/") || key.includes(":") || key.includes("://")) {
        throw new Error("Backup key must be a relative provider key");
    }

    const segments = key.split("/");
    if (segments.some((segment) => segment.length === 0)) {
        throw new Error("Backup key must not contain empty path segments");
    }

    if (segments.some((segment) => segment === "." || segment === "..")) {
        throw new Error("Backup key must not contain path traversal segments");
    }

    return key;
}

/** Converts a persisted setting value into a supported encryption mode. */
export function parseEncryptionMode(
    value: string | undefined
): CloudEncryptionMode {
    return value === "passphrase" ? "passphrase" : "none";
}

/** Encodes a buffer into base64 without introducing whitespace. */
export function encodeBase64(buffer: Buffer): string {
    return buffer.toString("base64");
}

function assertCanonicalBase64(args: { label: string; value: string }): void {
    const { label, value } = args;

    if (typeof value !== "string") {
        throw new TypeError(`Invalid ${label}: must be a string`);
    }

    // Node's base64 decoder is permissive (ignores whitespace/invalid chars).
    // We require canonical base64 because these values are persisted and used
    // for key derivation; permissive parsing would make corruption harder to
    // detect and could lead to irrecoverable encryption state.
    if (/\s/u.test(value)) {
        throw new Error(`Invalid ${label}: base64 must not contain whitespace`);
    }

    if (value.length === 0) {
        throw new Error(`Invalid ${label}: base64 must not be empty`);
    }

    if (value.length % 4 !== 0) {
        throw new Error(
            `Invalid ${label}: base64 length must be a multiple of 4 characters`
        );
    }

    // Standard base64 (not URL-safe).
    if (!/^[A-Za-z0-9+/]+={0,2}$/u.test(value)) {
        throw new Error(`Invalid ${label}: base64 contains invalid characters`);
    }
}

/**
 * Decodes a base64 value after validating it is canonical.
 */
export function decodeCanonicalBase64(args: {
    label: string;
    value: string;
}): Buffer {
    assertCanonicalBase64(args);
    return Buffer.from(args.value, "base64");
}

/**
 * Decodes a base64 value and validates the expected byte length.
 */
export function decodeStrictBase64(args: {
    expectedBytes: number;
    label: string;
    value: string;
}): Buffer {
    const buffer = decodeCanonicalBase64({
        label: args.label,
        value: args.value,
    });

    if (buffer.byteLength !== args.expectedBytes) {
        throw new Error(
            `Invalid ${args.label} length (expected ${args.expectedBytes} bytes)`
        );
    }

    return buffer;
}

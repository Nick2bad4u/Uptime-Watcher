import { CLOUD_SYNC_SCHEMA_VERSION } from "@shared/types/cloudSync";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getPersistedDeviceIdValidationError } from "@shared/validation/persistedDeviceIdValidation";

import { isValidSnapshotFileName } from "./snapshotKeyUtils";
import {
    OPS_OBJECT_SUFFIX,
    parseOpsObjectFileNameMetadata,
} from "./syncEngineKeyUtils";

const OPS_PREFIX = "sync/devices" as const;

/** Maximum byte budget accepted for provider object keys handled by sync. */
const MAX_SYNC_KEY_BYTES = 2048;

/**
 * Validates a persisted cloud sync device identifier.
 *
 * @remarks
 * Keeps historical error messages stable so existing tests and telemetry
 * comparisons do not regress.
 */
export function assertValidSyncDeviceId(deviceId: string): void {
    // Keep the historical TypeError for non-string values (even though call
    // sites are typed as string).
    if (typeof deviceId !== "string") {
        throw new TypeError("deviceId must be a non-empty string");
    }

    const error = getPersistedDeviceIdValidationError(deviceId);
    if (error !== null) {
        throw new Error(error);
    }
}

/**
 * Asserts that a provider object key is safe and canonical.
 *
 * @remarks
 * Provider keys are treated as logical identifiers, not file paths or URLs.
 * This rejects traversal segments, control characters, URL-like tokens, and
 * other malformed key patterns.
 */
export function assertSafeProviderKey(key: string): void {
    if (typeof key !== "string" || key.trim().length === 0) {
        throw new Error("Key must be a non-empty string");
    }

    if (Buffer.byteLength(key, "utf8") > MAX_SYNC_KEY_BYTES) {
        throw new Error(`Invalid key: exceeds ${MAX_SYNC_KEY_BYTES} bytes`);
    }

    // Provider keys are always POSIX-style.
    if (key.includes("\\")) {
        throw new Error("Invalid key: backslashes are not allowed");
    }

    if (hasAsciiControlCharacters(key)) {
        throw new Error("Invalid key: control characters are not allowed");
    }

    if (key.startsWith("/")) {
        throw new Error("Invalid key: absolute keys are not allowed");
    }

    // Treat provider keys as logical identifiers, not OS paths or URLs.
    if (key.includes("://")) {
        throw new Error("Invalid key: URL-like keys are not allowed");
    }

    if (key.includes(":")) {
        throw new Error("Invalid key: ':' tokens are not allowed");
    }

    const segments = key.split("/");
    if (
        segments.some(
            (segment) =>
                segment.length === 0 || segment === "." || segment === ".."
        )
    ) {
        throw new Error("Invalid key: traversal segments are not allowed");
    }
}

/**
 * Asserts that a cloud sync operation object key matches canonical format.
 *
 * @remarks
 * Expected format:
 * `sync/devices/<deviceId>/ops/<createdAt>-<firstOpId>-<lastOpId>.ndjson`
 */
export function assertOpsObjectKey(key: string): void {
    assertSafeProviderKey(key);

    const segments = key.split("/");
    if (segments.length !== 5) {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/<deviceId>/ops/<file>.ndjson): ${key}`
        );
    }

    const [
        syncSegment,
        devicesSegment,
        deviceIdSegment,
        opsSegment,
        fileName,
    ] = segments;

    if (
        !syncSegment ||
        !devicesSegment ||
        !deviceIdSegment ||
        !opsSegment ||
        !fileName
    ) {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/<deviceId>/ops/<file>.ndjson): ${key}`
        );
    }

    if (syncSegment !== "sync" || devicesSegment !== "devices") {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/...): ${key}`
        );
    }

    if (opsSegment !== "ops") {
        throw new Error(
            `Invalid sync operations object key (expected ops segment): ${key}`
        );
    }

    assertValidSyncDeviceId(deviceIdSegment);

    const parsedFileName = parseOpsObjectFileNameMetadata(fileName);
    if (!parsedFileName) {
        throw new Error(
            `Invalid sync operations object key (expected <createdAt>-<firstOpId>-<lastOpId>${OPS_OBJECT_SUFFIX}): ${key}`
        );
    }
}

/**
 * Returns true when a cloud sync operation key is valid.
 */
export function isValidOpsObjectKey(key: string): boolean {
    try {
        assertOpsObjectKey(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Asserts that a cloud sync snapshot key matches canonical format.
 *
 * @remarks
 * Supported filename forms:
 *
 * - `<createdAt>.json` (legacy)
 * - `<createdAt>-<nonceHex>.json` (v2)
 */
export function assertSnapshotKey(key: string): void {
    assertSafeProviderKey(key);

    const segments = key.split("/");
    if (segments.length !== 4) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    const [
        syncSegment,
        snapshotsSegment,
        schemaSegment,
        fileName,
    ] = segments;

    if (syncSegment !== "sync" || snapshotsSegment !== "snapshots") {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    const expectedSchemaSegment = String(CLOUD_SYNC_SCHEMA_VERSION);
    if (schemaSegment !== expectedSchemaSegment) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    if (!fileName || !isValidSnapshotFileName(fileName)) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }
}

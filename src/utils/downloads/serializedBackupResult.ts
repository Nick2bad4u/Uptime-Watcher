/**
 * Renderer-facing validation helpers for serialized SQLite backup payloads.
 *
 * @remarks
 * The renderer already receives typed payloads from `DataService`, but this
 * module provides a defensive validation boundary for utility entry points that
 * may be invoked with custom/mocked async providers in tests or future
 * integrations.
 *
 * @packageDocumentation
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { getNativeArrayBufferByteLength } from "@shared/utils/nativeArrayBuffer";
import { validateSerializedDatabaseBackupResult } from "@shared/validation/dataSchemas";

/** Canonical error message used when backup payload validation fails. */
const INVALID_SERIALIZED_BACKUP_DATA_MESSAGE = "Invalid backup data received";

/**
 * Parses and validates a serialized SQLite backup payload.
 *
 * @remarks
 * Validation is two-step:
 *
 * 1. Schema validation through the shared canonical Zod schema.
 * 2. Cross-field invariant check ensuring `metadata.sizeBytes` exactly matches the
 *    payload's native ArrayBuffer byte length.
 *
 * @param value - Unknown payload to validate.
 *
 * @returns A strongly typed backup payload when validation succeeds.
 *
 * @throws Thrown when schema validation fails or the metadata byte-size
 *   invariant does not hold.
 */
export function parseSerializedDatabaseBackupResult(
    value: unknown
): SerializedDatabaseBackupResult {
    const validation = validateSerializedDatabaseBackupResult(value);
    if (!validation.success) {
        throw new TypeError(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE, {
            cause: validation.error,
        });
    }

    const backupResult = validation.data;
    if (!hasConsistentBackupByteLength(backupResult)) {
        throw new TypeError(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE, {
            cause: new Error(
                "Serialized backup metadata sizeBytes does not match payload byteLength"
            ),
        });
    }

    return backupResult;
}

/**
 * Verifies that metadata byte size matches the actual binary payload length.
 */
function hasConsistentBackupByteLength(
    backupResult: SerializedDatabaseBackupResult
): boolean {
    return (
        backupResult.metadata.sizeBytes ===
        getNativeArrayBufferByteLength(backupResult.buffer)
    );
}

/**
 * IPC payload size budget helpers.
 *
 * @remarks
 * These utilities enforce byte budgets at trust boundaries (renderer  main IPC
 * calls). While the Electron main process already validates IPC payloads, doing
 * a cheap preflight in the renderer helps avoid:
 *
 * - Allocating huge buffers (e.g., `File.arrayBuffer()`) unnecessarily
 * - Transferring large blobs that will be rejected by validators anyway
 * - Confusing "IPC failed" errors that are really "payload too large"
 */

import type { SerializedDatabaseRestorePayload } from "@shared/types/ipc";

import {
    MAX_IPC_JSON_IMPORT_BYTES,
    MAX_IPC_SQLITE_RESTORE_BYTES,
} from "@shared/constants/backup";
import {
    getNativeArrayBufferByteLength,
    isNativeArrayBuffer,
} from "@shared/utils/nativeArrayBuffer";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/**
 * Asserts a JSON import string is within the renderer  main IPC budget.
 */
export function assertJsonImportPayloadWithinIpcBudget(data: string): void {
    const bytes = getUtfByteLength(data);

    if (bytes > MAX_IPC_JSON_IMPORT_BYTES) {
        throw new Error(
            `Import payload is too large (${bytes} > ${MAX_IPC_JSON_IMPORT_BYTES} bytes). Use SQLite backup/restore for large snapshots.`
        );
    }
}

/**
 * Asserts the restore payload is within the renderer  main IPC budget.
 */
export function assertSqliteRestorePayloadWithinIpcBudget(
    payload: SerializedDatabaseRestorePayload
): void {
    const bufferCandidate: unknown = payload.buffer;

    if (!isNativeArrayBuffer(bufferCandidate)) {
        throw new TypeError("Restore payload buffer must be an ArrayBuffer");
    }

    const byteLength = getNativeArrayBufferByteLength(bufferCandidate);

    if (byteLength === undefined || byteLength === 0) {
        throw new Error("Restore payload buffer must not be empty");
    }

    if (byteLength > MAX_IPC_SQLITE_RESTORE_BYTES) {
        throw new Error(
            `SQLite restore payload is too large (${byteLength} > ${MAX_IPC_SQLITE_RESTORE_BYTES} bytes).`
        );
    }
}

import type { CloudBackupEntry } from "@shared/types/cloud";

import { ensureError } from "@shared/utils/errorHandling";
import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import { validateCloudBackupEntry } from "@shared/validation/cloudBackupSchemas";
import { arrayJoin } from "ts-extras";

const utfEightDecoder = new TextDecoder("utf-8", { fatal: true });

export const MAX_CLOUD_BACKUP_METADATA_FILE_BYTES: number = 64 * 1024;

/**
 * Returns the canonical metadata sidecar key for a backup object key.
 *
 * @remarks
 * Backups are stored as a binary object under `backups/<...>`. Their metadata
 * is stored next to the binary object using the `.metadata.json` suffix.
 */
export function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

function decodeMetadataBufferStrict(buffer: Buffer): string {
    if (buffer.byteLength > MAX_CLOUD_BACKUP_METADATA_FILE_BYTES) {
        throw new TypeError(
            `Backup metadata file exceeded ${MAX_CLOUD_BACKUP_METADATA_FILE_BYTES} bytes`
        );
    }

    // Buffer#toString("utf8") replaces invalid byte sequences. Provider
    // metadata is integrity-sensitive, so corrupt bytes should stay corrupt.
    try {
        return utfEightDecoder.decode(buffer);
    } catch (error: unknown) {
        const normalized = ensureError(error);
        throw new TypeError(
            `Backup metadata file contained invalid UTF-8: ${normalized.message}`,
            { cause: error }
        );
    }
}

/**
 * Parses a provider-stored backup metadata file.
 */
export function parseCloudBackupMetadataFile(
    candidate: unknown
): CloudBackupEntry {
    const result = validateCloudBackupEntry(candidate);
    if (result.success) {
        return result.data;
    }

    const issues = formatZodIssues(result.error.issues);
    const excerpt = arrayJoin(issues.slice(0, 3), "; ");
    throw new TypeError(
        `Backup metadata file did not match the expected format: ${excerpt || "unknown error"}`
    );
}

/**
 * Parses a provider-stored backup metadata buffer.
 *
 * @remarks
 * This is the strict variant used by `downloadBackup()` implementations. It
 * preserves the existing semantics of throwing on invalid JSON.
 */
export function parseCloudBackupMetadataFileBuffer(
    buffer: Buffer
): CloudBackupEntry {
    const text = decodeMetadataBufferStrict(buffer);
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch (error: unknown) {
        const normalized = ensureError(error);
        throw new TypeError(
            `Backup metadata file contained invalid JSON: ${normalized.message}`,
            { cause: error }
        );
    }

    return parseCloudBackupMetadataFile(parsed);
}

/**
 * Serializes a provider-stored backup metadata file.
 */
export function serializeCloudBackupMetadataFile(
    entry: CloudBackupEntry
): string {
    return JSON.stringify({
        encrypted: entry.encrypted,
        fileName: entry.fileName,
        key: entry.key,
        metadata: entry.metadata,
    });
}

/**
 * Best-effort parsing for provider-stored backup metadata buffers.
 *
 * @remarks
 * Used by provider `listBackups()` implementations so a single corrupted
 * metadata file doesn't prevent showing the rest of the backups.
 */
export function tryParseCloudBackupMetadataFileBuffer(
    buffer: Buffer
): CloudBackupEntry | null {
    let text: string;
    try {
        text = decodeMetadataBufferStrict(buffer);
    } catch {
        return null;
    }

    const parsed = tryParseJsonRecord(text);
    if (!parsed) {
        return null;
    }

    try {
        return parseCloudBackupMetadataFile(parsed);
    } catch {
        return null;
    }
}

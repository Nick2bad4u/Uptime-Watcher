import type { CloudBackupEntry } from "@shared/types/cloud";

import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import { validateCloudBackupEntry } from "@shared/validation/cloudBackupSchemas";

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
    const excerpt = issues.slice(0, 3).join("; ");
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
    const parsed: unknown = JSON.parse(buffer.toString("utf8"));
    return parseCloudBackupMetadataFile(parsed);
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
    const parsed = tryParseJsonRecord(buffer.toString("utf8"));
    if (!parsed) {
        return null;
    }

    try {
        return parseCloudBackupMetadataFile(parsed);
    } catch {
        return null;
    }
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
 * Returns the canonical metadata sidecar key for a backup object key.
 *
 * @remarks
 * Backups are stored as a binary object under `backups/<...>`. Their metadata
 * is stored next to the binary object using the `.metadata.json` suffix.
 */
export function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

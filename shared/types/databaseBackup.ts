/**
 * Shared database backup/restore payload typings.
 *
 * @remarks
 * These types are used by IPC payloads, filesystem/cloud providers, and
 * validation layers.
 *
 * Keep this module free of imports from other shared type modules to avoid
 * circular dependencies (Madge circular lint).
 */

/**
 * Metadata describing a SQLite backup artifact.
 */
export interface SerializedDatabaseBackupMetadata {
    /** App version that created the backup. */
    appVersion: string;
    /** Content checksum for integrity verification. */
    checksum: string;
    /** Creation timestamp in epoch milliseconds. */
    createdAt: number;
    /** Original file path (local-only informational field). */
    originalPath: string;
    /** Suggested retention period in days. */
    retentionHintDays: number;
    /** Database schema version at backup time. */
    schemaVersion: number;
    /** Backup size in bytes. */
    sizeBytes: number;
}

/**
 * Backup-related constants shared across processes.
 *
 * @remarks
 * These limits are used by both:
 *
 * - Electron main (database backup/restore)
 * - IPC validators (payload limits)
 *
 * Keeping them in `shared/` ensures consistent policies regardless of which
 * workflow a user chooses (JSON import/export vs SQLite backup/restore).
 */

/**
 * Default maximum accepted size (bytes) for serialized SQLite backup payloads.
 *
 * @remarks
 * Used as a safety limit for IPC transport and on-disk backup payload
 * validation.
 */
export const DEFAULT_MAX_BACKUP_SIZE_BYTES: number = 50 * 1024 * 1024;

/**
 * Maximum size (bytes) allowed for SQLite backup buffers transferred over IPC.
 *
 * @remarks
 * Large `ArrayBuffer` payloads are expensive to clone and can cause memory
 * spikes or crashes. Prefer the `save-sqlite-backup` IPC path (main-process
 * dialog + file write) for large databases.
 */
export const DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES: number = 10 * 1024 * 1024;

/**
 * Maximum size (bytes) allowed for SQLite backup buffers transferred over IPC.
 *
 * @remarks
 * Alias of {@link DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES} intended for use in
 * transport checks where the operation context matters.
 */
export const MAX_IPC_SQLITE_BACKUP_TRANSFER_BYTES: number =
	DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES;

/**
 * Maximum size (bytes) accepted for SQLite restore payloads sent over IPC.
 *
 * @remarks
 * This limit is applied to renderer → main transfers (restore) and should be
 * kept aligned with the renderer-side byte budget enforced in the preload
 * bridge.
 */
export const MAX_IPC_SQLITE_RESTORE_BYTES: number = DEFAULT_MAX_BACKUP_SIZE_BYTES;

/**
 * Maximum size (bytes) accepted for JSON import payloads transported over IPC.
 *
 * @remarks
 * JSON import/export is intended for portability and small-to-medium snapshots.
 * For very large datasets users should prefer SQLite backup/restore.
 */
export const MAX_IPC_JSON_IMPORT_BYTES: number = DEFAULT_MAX_BACKUP_SIZE_BYTES;

/**
 * Maximum size (bytes) accepted for JSON export payloads transported over IPC.
 *
 * @remarks
 * JSON export is intended for portability and small-to-medium snapshots. For
 * very large datasets users should prefer SQLite backup/restore.
 *
 * This is intentionally kept aligned with {@link MAX_IPC_JSON_IMPORT_BYTES} so
 * exports remain round-trippable.
 */
export const MAX_IPC_JSON_EXPORT_BYTES: number = MAX_IPC_JSON_IMPORT_BYTES;

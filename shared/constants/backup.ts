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

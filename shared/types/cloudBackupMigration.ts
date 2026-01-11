import * as z from "zod";

/**
 * Backup migration target encryption mode.
 */
export type CloudBackupMigrationTarget = "encrypted" | "plaintext";

/**
 * Request payload for migrating existing remote backups between plaintext and
 * encrypted formats.
 *
 * @remarks
 * This migration only affects `backups/` objects. Sync artifacts under `sync/`
 * are not migrated by this operation.
 */
export interface CloudBackupMigrationRequest {
    /**
     * If true, deletes the source backup (and its metadata sidecar) after the
     * migrated target backup has been successfully uploaded.
     */
    deleteSource: boolean;
    /** Optional maximum number of backups to process (newest first). */
    limit?: number | undefined;
    /** Target mode for migrated backups. */
    target: CloudBackupMigrationTarget;
}

/**
 * Failure entry for a backup migration operation.
 */
export interface CloudBackupMigrationFailure {
    key: string;
    message: string;
}

/**
 * Result summary returned after a migration operation completes.
 */
export interface CloudBackupMigrationResult {
    completedAt: number;
    deleteSource: boolean;
    failures: CloudBackupMigrationFailure[];
    migrated: number;
    processed: number;
    skipped: number;
    startedAt: number;
    target: CloudBackupMigrationTarget;
}

const cloudBackupMigrationTargetSchema = z.enum(["plaintext", "encrypted"]);

const cloudBackupMigrationRequestInternalSchema: z.ZodType<CloudBackupMigrationRequest> =
    z
        .object({
            deleteSource: z.boolean(),
            limit: z.int().positive().optional(),
            target: cloudBackupMigrationTargetSchema,
        })
        .strict();

/** Zod schema for {@link CloudBackupMigrationRequest}. */
export const cloudBackupMigrationRequestSchema: z.ZodType<CloudBackupMigrationRequest> =
    cloudBackupMigrationRequestInternalSchema;

/**
 * Parses and validates a migration request.
 */
export function parseCloudBackupMigrationRequest(
    candidate: unknown
): CloudBackupMigrationRequest {
    return cloudBackupMigrationRequestInternalSchema.parse(candidate);
}

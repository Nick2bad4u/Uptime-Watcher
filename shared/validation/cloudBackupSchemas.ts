import type { CloudBackupEntry } from "@shared/types/cloud";

import { serializedDatabaseBackupMetadataSchema } from "@shared/validation/dataSchemas";
import * as z from "zod";

/**
 * Schema for provider-stored cloud backup metadata files.
 *
 * @remarks
 * This schema is strict because these files are authored by Uptime Watcher.
 * Treat unknown fields as corruption or incompatible schema changes.
 */
export const cloudBackupEntrySchema: z.ZodType<CloudBackupEntry> = z
    .object({
        encrypted: z.boolean(),
        fileName: z.string().min(1),
        key: z.string().min(1),
        metadata: serializedDatabaseBackupMetadataSchema,
    })
    .strict();

/**
 * Validates a parsed cloud backup entry.
 */
export const validateCloudBackupEntry = (
    value: unknown
): ReturnType<typeof cloudBackupEntrySchema.safeParse> =>
    cloudBackupEntrySchema.safeParse(value);

/**
 * Schema for a list of {@link CloudBackupEntry} values.
 *
 * @remarks
 * This is primarily used for IPC response validation in the preload bridge.
 */
export const cloudBackupEntryArraySchema: z.ZodType<CloudBackupEntry[]> = z
    .array(cloudBackupEntrySchema);

export const validateCloudBackupEntryArray = (
    value: unknown
): ReturnType<typeof cloudBackupEntryArraySchema.safeParse> =>
    cloudBackupEntryArraySchema.safeParse(value);

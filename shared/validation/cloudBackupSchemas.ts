import type { CloudBackupEntry } from "@shared/types/cloud";

import {
    assertCloudObjectKey,
    normalizeProviderObjectKey,
} from "@shared/utils/cloudKeyNormalization";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import {
    hasForbiddenRecordKey,
    serializedDatabaseBackupMetadataSchema,
} from "@shared/validation/dataSchemas";
import { stringSplit } from "ts-extras";
import * as z from "zod";

const BACKUPS_PREFIX = "backups/" as const;

function addIssue(context: z.RefinementCtx, message: string): void {
    context.addIssue({
        code: "custom",
        message,
    });
}

function isCanonicalProviderObjectKey(value: string): boolean {
    try {
        const normalized = normalizeProviderObjectKey(value);
        assertCloudObjectKey(normalized);
        return normalized === value;
    } catch {
        return false;
    }
}

const cloudBackupFileNameSchema = z
    .string()
    .min(1)
    .superRefine((fileName, context) => {
        if (fileName !== fileName.trim()) {
            addIssue(context, "Cloud backup filename must be canonical");
        }

        if (
            fileName === "." ||
            fileName === ".." ||
            normalizePathSeparatorsToPosix(fileName).includes("/")
        ) {
            addIssue(context, "Cloud backup filename must be a single segment");
        }

        if (fileName.includes(":")) {
            addIssue(
                context,
                "Cloud backup filename must not contain drive tokens"
            );
        }

        if (hasAsciiControlCharacters(fileName)) {
            addIssue(
                context,
                "Cloud backup filename must not contain control characters"
            );
        }
    });

const cloudBackupKeySchema = z
    .string()
    .min(1)
    .superRefine((key, context) => {
        if (!isCanonicalProviderObjectKey(key)) {
            addIssue(context, "Cloud backup key must be canonical");
        }

        if (!key.startsWith(BACKUPS_PREFIX)) {
            addIssue(
                context,
                `Cloud backup key must start with '${BACKUPS_PREFIX}'`
            );
        }

        if (key.includes(":")) {
            addIssue(context, "Cloud backup key must not contain drive tokens");
        }

        if (key.endsWith(".metadata.json")) {
            addIssue(
                context,
                "Cloud backup key must reference the backup object, not metadata"
            );
        }
    });

/**
 * Schema for provider-stored cloud backup metadata files.
 *
 * @remarks
 * This schema is strict because these files are authored by Uptime Watcher.
 * Treat unknown fields as corruption or incompatible schema changes.
 */
const cloudBackupEntrySchema: z.ZodType<CloudBackupEntry> = z
    .custom<unknown>(
        (value) => !hasForbiddenRecordKey(value),
        "Cloud backup metadata file must not include reserved object keys"
    )
    .pipe(
        z
            .object({
                encrypted: z.boolean(),
                fileName: cloudBackupFileNameSchema,
                key: cloudBackupKeySchema,
                metadata: serializedDatabaseBackupMetadataSchema,
            })
            .strict()
    )
    .superRefine((entry, context) => {
        const expectedFileName = stringSplit(entry.key, "/").pop() ?? "";
        if (entry.fileName !== expectedFileName) {
            context.addIssue({
                code: "custom",
                message:
                    "Cloud backup filename must match the backup key basename",
                path: ["fileName"],
            });
        }
    });

/**
 * Validates a parsed cloud backup entry.
 */
export const validateCloudBackupEntry = (
    value: unknown
): ReturnType<typeof cloudBackupEntrySchema.safeParse> =>
    cloudBackupEntrySchema.safeParse(value);

/**
 * Validates a canonical provider backup object key.
 */
export const validateCloudBackupKey = (
    value: unknown
): ReturnType<typeof cloudBackupKeySchema.safeParse> =>
    cloudBackupKeySchema.safeParse(value);

/**
 * Schema for a list of {@link CloudBackupEntry} values.
 *
 * @remarks
 * This is primarily used for IPC response validation in the preload bridge.
 */
const cloudBackupEntryArraySchema: z.ZodType<CloudBackupEntry[]> = z.array(
    cloudBackupEntrySchema
);

export const validateCloudBackupEntryArray = (
    value: unknown
): ReturnType<typeof cloudBackupEntryArraySchema.safeParse> =>
    cloudBackupEntryArraySchema.safeParse(value);

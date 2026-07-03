import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type {
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { UnknownRecord } from "type-fest";

import {
    DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES,
    MAX_IPC_SQLITE_RESTORE_BYTES,
    MAX_SQLITE_RESTORE_FILE_NAME_BYTES,
} from "@shared/constants/backup";
import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import { safeCastTo } from "ts-extras";
import * as z from "zod";

const anyValueSchema = z.custom<unknown>(() => true, {
    error: "Any value",
});

const arrayBufferSchema: z.ZodType<ArrayBuffer> = z.custom<ArrayBuffer>(
    (value): value is ArrayBuffer => value instanceof ArrayBuffer,
    "Expected transferable ArrayBuffer"
);

const hasAsciiControlCharacter = (value: string): boolean => {
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint <= 0x1f || codePoint === 0x7f)
        ) {
            return true;
        }
    }

    return false;
};

const createSqliteFileNameSchema = (label: string): z.ZodType<string> =>
    z
        .string()
        .min(1)
        .superRefine((fileName, context) => {
            if (fileName !== fileName.trim()) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not have leading or trailing whitespace`,
                });
            }

            if (hasAsciiControlCharacter(fileName)) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not contain control characters`,
                });
            }

            if (
                getUtfByteLength(fileName) > MAX_SQLITE_RESTORE_FILE_NAME_BYTES
            ) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not exceed ${MAX_SQLITE_RESTORE_FILE_NAME_BYTES} bytes`,
                });
            }

            if (fileName === "." || fileName === "..") {
                context.addIssue({
                    code: "custom",
                    message: `${label} must be a valid file name`,
                });
            }

            if (normalizePathSeparatorsToPosix(fileName).includes("/")) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not contain path separators`,
                });
            }
        });

const sqliteRestoreFileNameSchema: z.ZodType<string> =
    createSqliteFileNameSchema("Restore filename");

const sqliteResultFileNameSchema: z.ZodType<string> =
    createSqliteFileNameSchema("SQLite backup filename");

const nonEmptyStringSchema: z.ZodType<string> = z.string().trim().min(1);

export const serializedDatabaseBackupMetadataSchema: z.ZodType<SerializedDatabaseBackupMetadata> =
    z
        .object({
            appVersion: z.string().trim().min(1),
            checksum: z.string().trim().min(1),
            createdAt: epochMsSchema,
            originalPath: z.string().trim().min(1),
            retentionHintDays: z.int().nonnegative(),
            schemaVersion: z.int().nonnegative(),
            sizeBytes: z.int().nonnegative(),
        })
        .strict();

export const serializedDatabaseBackupResultSchema: z.ZodType<{
    buffer: ArrayBuffer;
    fileName: string;
    metadata: z.infer<typeof serializedDatabaseBackupMetadataSchema>;
}> = z
    .object({
        buffer: arrayBufferSchema.refine(
            (buffer) =>
                buffer.byteLength <= DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES,
            {
                message: `Backup buffer exceeds maximum IPC transfer size (${DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES} bytes)`,
            }
        ),
        // Intentionally allow blank/whitespace names from upstream callers.
        // Renderer-side download logic performs fallback filename generation.
        fileName: z.string(),
        metadata: serializedDatabaseBackupMetadataSchema,
    })
    .strict();

export const serializedDatabaseBackupSaveResultSchema: z.ZodType<SerializedDatabaseBackupSaveResult> =
    z
        .union([
            z
                .object({
                    canceled: z.literal(true),
                })
                .strict(),
            z
                .object({
                    canceled: z.literal(false),
                    fileName: sqliteResultFileNameSchema,
                    filePath: nonEmptyStringSchema,
                    metadata: serializedDatabaseBackupMetadataSchema,
                })
                .strict(),
        ])
        .readonly();

export const serializedDatabaseRestorePayloadSchema: z.ZodType<{
    buffer: ArrayBuffer;
    fileName?: string | undefined;
}> = z
    .object({
        buffer: arrayBufferSchema
            .refine((buffer) => buffer.byteLength > 0, {
                message: "Restore buffer must not be empty",
            })
            .refine(
                (buffer) => buffer.byteLength <= MAX_IPC_SQLITE_RESTORE_BYTES,
                {
                    message: `Restore buffer exceeds maximum IPC transfer size (${MAX_IPC_SQLITE_RESTORE_BYTES} bytes)`,
                }
            ),
        fileName: sqliteRestoreFileNameSchema.optional(),
    })
    .strict();

export const serializedDatabaseRestoreResultSchema: z.ZodType<{
    metadata: z.infer<typeof serializedDatabaseBackupMetadataSchema>;
    preRestoreFileName?: string | undefined;
    restoredAt: number;
}> = z
    .object({
        metadata: serializedDatabaseBackupMetadataSchema,
        preRestoreFileName: sqliteResultFileNameSchema.optional(),
        restoredAt: epochMsSchema,
    })
    .strict();

export const monitorTypeConfigSchema: z.ZodType<MonitorTypeConfig> =
    z.custom<MonitorTypeConfig>(
        (value): value is MonitorTypeConfig => isMonitorTypeConfig(value),
        {
            error: "Invalid monitor type configuration",
        }
    );

export const monitorTypeConfigArraySchema: z.ZodType<MonitorTypeConfig[]> = z
    .array(monitorTypeConfigSchema)
    .min(0, "Monitor types array may be empty");

export const validationResultSchema: z.ZodType<{
    data?: unknown;
    errors: string[];
    metadata?: undefined | UnknownRecord;
    success: boolean;
    warnings?: string[] | undefined;
}> = z
    .object({
        data: anyValueSchema.optional(),
        errors: z.array(z.string().trim()),
        metadata: z.record(z.string().trim(), anyValueSchema).optional(),
        success: z.boolean(),
        warnings: z.array(z.string().trim()).optional(),
    })
    .strict();

export const validateSerializedDatabaseBackupResult = (
    value: unknown
): ReturnType<typeof serializedDatabaseBackupResultSchema.safeParse> =>
    serializedDatabaseBackupResultSchema.safeParse(value);

export const validateSerializedDatabaseBackupSaveResult = (
    value: unknown
): ReturnType<typeof serializedDatabaseBackupSaveResultSchema.safeParse> =>
    serializedDatabaseBackupSaveResultSchema.safeParse(value);

export const validateSerializedDatabaseBackupMetadata = (
    value: unknown
): ReturnType<typeof serializedDatabaseBackupMetadataSchema.safeParse> =>
    serializedDatabaseBackupMetadataSchema.safeParse(value);

export const validateSerializedDatabaseRestorePayload = (
    value: unknown
): ReturnType<typeof serializedDatabaseRestorePayloadSchema.safeParse> =>
    serializedDatabaseRestorePayloadSchema.safeParse(value);

export const validateSerializedDatabaseRestoreResult = (
    value: unknown
):
    | { data: SerializedDatabaseRestoreResult; success: true }
    | { error: unknown; success: false } =>
    safeCastTo<
        | { data: SerializedDatabaseRestoreResult; success: true }
        | { error: unknown; success: false }
    >(serializedDatabaseRestoreResultSchema.safeParse(value));

export const validateMonitorTypeConfigArray = (
    value: unknown
): ReturnType<typeof monitorTypeConfigArraySchema.safeParse> =>
    monitorTypeConfigArraySchema.safeParse(value);

export const validateValidationResult = (
    value: unknown
): ReturnType<typeof validationResultSchema.safeParse> =>
    validationResultSchema.safeParse(value);

/** Shared schema type for database backup metadata. */
export type SerializedDatabaseBackupMetadataSchema =
    typeof serializedDatabaseBackupMetadataSchema;
/** Shared schema type for database backup payloads. */
export type SerializedDatabaseBackupResultSchema =
    typeof serializedDatabaseBackupResultSchema;
/** Shared schema type for database backup save results. */
export type SerializedDatabaseBackupSaveResultSchema =
    typeof serializedDatabaseBackupSaveResultSchema;
/** Shared schema type for database restore payloads. */
export type SerializedDatabaseRestorePayloadSchema =
    typeof serializedDatabaseRestorePayloadSchema;
/** Shared schema type for database restore results. */
export type SerializedDatabaseRestoreResultSchema =
    typeof serializedDatabaseRestoreResultSchema;

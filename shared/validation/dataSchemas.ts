import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type {
    SerializedDatabaseBackupSaveResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { UnknownRecord } from "type-fest";

import { DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES } from "@shared/constants/backup";
import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import * as z from "zod";

const arrayBufferSchema: z.ZodType<ArrayBuffer> = z.custom<ArrayBuffer>(
    (value): value is ArrayBuffer => value instanceof ArrayBuffer,
    "Expected transferable ArrayBuffer"
);

export const serializedDatabaseBackupMetadataSchema: z.ZodType<SerializedDatabaseBackupMetadata> =
    z
    .object({
        appVersion: z.string().min(1),
        checksum: z.string().min(1),
        createdAt: z.number(),
        originalPath: z.string().min(1),
        retentionHintDays: z.number(),
        schemaVersion: z.number(),
        sizeBytes: z.number(),
    })
    .strict();

export const serializedDatabaseBackupResultSchema: z.ZodType<{
    buffer: ArrayBuffer;
    fileName: string;
    metadata: z.infer<typeof serializedDatabaseBackupMetadataSchema>;
}> = z
    .object({
        buffer: arrayBufferSchema.refine(
            (buffer) => buffer.byteLength <= DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES,
            {
                message: `Backup buffer exceeds maximum IPC transfer size (${DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES} bytes)`,
            }
        ),
        fileName: z.string().min(1),
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
                    fileName: z.string().min(1),
                    filePath: z.string().min(1),
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
        buffer: arrayBufferSchema,
        fileName: z.string().min(1).optional(),
    })
    .strict();

export const serializedDatabaseRestoreResultSchema: z.ZodType<{
    metadata: z.infer<typeof serializedDatabaseBackupMetadataSchema>;
    preRestoreFileName?: string | undefined;
    restoredAt: number;
}> = z
    .object({
        metadata: serializedDatabaseBackupMetadataSchema,
        preRestoreFileName: z.string().min(1).optional(),
        restoredAt: z.number(),
    })
    .strict();

export const monitorTypeConfigSchema: z.ZodType<MonitorTypeConfig> =
    z.custom<MonitorTypeConfig>(
        (value): value is MonitorTypeConfig => isMonitorTypeConfig(value),
        {
            message: "Invalid monitor type configuration",
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
        data: z.unknown().optional(),
        errors: z.array(z.string()),
        metadata: z.record(z.string(), z.unknown()).optional(),
        success: z.boolean(),
        warnings: z.array(z.string()).optional(),
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
    serializedDatabaseRestoreResultSchema.safeParse(value) as
        | { data: SerializedDatabaseRestoreResult; success: true }
        | { error: unknown; success: false };

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

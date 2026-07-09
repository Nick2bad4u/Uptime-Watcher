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
import {
    getNativeArrayBufferByteLength,
    isNativeArrayBuffer,
} from "@shared/utils/nativeArrayBuffer";
import { isWindowsReservedFileBasename } from "@shared/utils/fileNameSafety";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import { createOwnDataRecordSchema } from "@shared/validation/ownDataRecordSchema";
import { epochMsSchema } from "@shared/validation/timestampSchemas";
import * as z from "zod";

const anyValueSchema = z.custom<unknown>(() => true, {
    error: "Any value",
});

const FORBIDDEN_RECORD_KEYS = [
    "__proto__",
    "constructor",
    "prototype",
] as const;

const WINDOWS_RESERVED_FILE_NAME_CHARACTERS = new Set([
    '"',
    "*",
    ":",
    "<",
    ">",
    "?",
    "|",
]);

const arrayBufferSchema: z.ZodType<ArrayBuffer> = z.custom<ArrayBuffer>(
    (value): value is ArrayBuffer => isNativeArrayBuffer(value),
    "Expected transferable ArrayBuffer"
);

export const hasForbiddenRecordKey = (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    FORBIDDEN_RECORD_KEYS.some((key) => Object.hasOwn(value, key));

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

const hasWindowsReservedFileNameCharacter = (value: string): boolean => {
    for (const character of value) {
        if (WINDOWS_RESERVED_FILE_NAME_CHARACTERS.has(character)) {
            return true;
        }
    }

    return false;
};

const getFileNameStem = (fileName: string): string => {
    const extensionIndex = fileName.indexOf(".");

    return extensionIndex === -1
        ? fileName
        : fileName.slice(0, extensionIndex);
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

            if (fileName.endsWith(".")) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not end with a dot`,
                });
            }

            if (hasWindowsReservedFileNameCharacter(fileName)) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not contain Windows reserved filename characters`,
                });
            }

            if (isWindowsReservedFileBasename(getFileNameStem(fileName))) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not use a Windows reserved device name`,
                });
            }

            if (/^[A-Za-z]:/u.test(fileName)) {
                context.addIssue({
                    code: "custom",
                    message: `${label} must not be a drive-relative path`,
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

const exactNonEmptyStringSchema = (label: string): z.ZodType<string> =>
    z
        .string()
        .min(1)
        .refine((value) => value === value.trim(), {
            message: `${label} must not have leading or trailing whitespace`,
        });

export const serializedDatabaseBackupMetadataSchema: z.ZodType<SerializedDatabaseBackupMetadata> =
    z
        .custom<unknown>(
            (value) => !hasForbiddenRecordKey(value),
            "Backup metadata must not include reserved object keys"
        )
        .pipe(
            z
                .object({
                    appVersion: exactNonEmptyStringSchema("Backup app version"),
                    checksum: exactNonEmptyStringSchema("Backup checksum"),
                    createdAt: epochMsSchema,
                    originalPath: exactNonEmptyStringSchema(
                        "Backup original path"
                    ),
                    retentionHintDays: z.int().nonnegative(),
                    schemaVersion: z.int().nonnegative(),
                    sizeBytes: z.int().nonnegative(),
                })
                .strict()
        );

const serializedDatabaseBackupResultSchema: z.ZodType<{
    buffer: ArrayBuffer;
    fileName: string;
    metadata: z.infer<typeof serializedDatabaseBackupMetadataSchema>;
}> = z
    .object({
        buffer: arrayBufferSchema.refine(
            (buffer) =>
                (getNativeArrayBufferByteLength(buffer) ??
                    Number.POSITIVE_INFINITY) <=
                DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES,
            {
                message: `Backup buffer exceeds maximum IPC transfer size (${DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES} bytes)`,
            }
        ),
        // Intentionally allow blank/whitespace names from upstream callers.
        // Renderer-side download logic performs fallback filename generation.
        fileName: z.string(),
        metadata: serializedDatabaseBackupMetadataSchema,
    })
    .strict()
    .superRefine((result, context) => {
        const bufferByteLength = getNativeArrayBufferByteLength(result.buffer);
        if (result.metadata.sizeBytes !== bufferByteLength) {
            context.addIssue({
                code: "custom",
                message:
                    "Backup metadata sizeBytes must match buffer byteLength",
                path: ["metadata", "sizeBytes"],
            });
        }
    });

const serializedDatabaseBackupSaveResultSchema: z.ZodType<SerializedDatabaseBackupSaveResult> =
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

const serializedDatabaseRestorePayloadSchema: z.ZodType<{
    buffer: ArrayBuffer;
    fileName?: string | undefined;
}> = z
    .custom<unknown>(
        (value) => !hasForbiddenRecordKey(value),
        "Restore payload must not include reserved object keys"
    )
    .pipe(
        z
            .object({
                buffer: arrayBufferSchema
                    .refine(
                        (buffer) =>
                            (getNativeArrayBufferByteLength(buffer) ?? 0) > 0,
                        {
                            message: "Restore buffer must not be empty",
                        }
                    )
                    .refine(
                        (buffer) =>
                            (getNativeArrayBufferByteLength(buffer) ??
                                Number.POSITIVE_INFINITY) <=
                            MAX_IPC_SQLITE_RESTORE_BYTES,
                        {
                            message: `Restore buffer exceeds maximum IPC transfer size (${MAX_IPC_SQLITE_RESTORE_BYTES} bytes)`,
                        }
                    ),
                fileName: sqliteRestoreFileNameSchema.optional(),
            })
            .strict()
    );

const serializedDatabaseRestoreResultSchema: z.ZodType<SerializedDatabaseRestoreResult> =
    z
        .object({
            metadata: serializedDatabaseBackupMetadataSchema,
            preRestoreFileName: sqliteResultFileNameSchema.optional(),
            restoredAt: epochMsSchema,
        })
        .strict();

const monitorTypeConfigSchema: z.ZodType<MonitorTypeConfig> =
    z.custom<MonitorTypeConfig>(
        (value): value is MonitorTypeConfig => isMonitorTypeConfig(value),
        {
            error: "Invalid monitor type configuration",
        }
    );

const monitorTypeConfigArraySchema: z.ZodType<MonitorTypeConfig[]> = z
    .array(monitorTypeConfigSchema)
    .min(0, "Monitor types array may be empty");

const validationResultSchema: z.ZodType<{
    data?: unknown;
    errors: string[];
    metadata?: undefined | UnknownRecord;
    success: boolean;
    warnings?: string[] | undefined;
}> = z
    .object({
        data: anyValueSchema.optional(),
        errors: z.array(z.string().trim()),
        metadata: createOwnDataRecordSchema(
            anyValueSchema,
            z.string().trim()
        ).optional(),
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

export const validateSerializedDatabaseRestorePayload = (
    value: unknown
): ReturnType<typeof serializedDatabaseRestorePayloadSchema.safeParse> =>
    serializedDatabaseRestorePayloadSchema.safeParse(value);

export const validateSerializedDatabaseRestoreResult = (
    value: unknown
): ReturnType<typeof serializedDatabaseRestoreResultSchema.safeParse> =>
    serializedDatabaseRestoreResultSchema.safeParse(value);

export const validateMonitorTypeConfigArray = (
    value: unknown
): ReturnType<typeof monitorTypeConfigArraySchema.safeParse> =>
    monitorTypeConfigArraySchema.safeParse(value);

export const validateValidationResult = (
    value: unknown
): ReturnType<typeof validationResultSchema.safeParse> =>
    validationResultSchema.safeParse(value);

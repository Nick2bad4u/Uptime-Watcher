/**
 * Tests for shared Zod schemas in validation/dataSchemas.
 */

import {
    DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES,
    MAX_IPC_SQLITE_RESTORE_BYTES,
    MAX_SQLITE_RESTORE_FILE_NAME_BYTES,
} from "@shared/constants/backup";
import {
    validateMonitorTypeConfigArray,
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseBackupSaveResult,
    validateSerializedDatabaseRestorePayload,
    validateSerializedDatabaseRestoreResult,
    validateValidationResult,
} from "@shared/validation/dataSchemas";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

const createMetadata = (sizeBytes = 8) => ({
    appVersion: "1.0.0",
    checksum: "abc",
    createdAt: 1,
    originalPath: "C:/x",
    retentionHintDays: 30,
    schemaVersion: 1,
    sizeBytes,
});

describe("dataSchemas", () => {
    it("validates a serialized backup result payload", () => {
        const buffer = new ArrayBuffer(8);

        const parsed = validateSerializedDatabaseBackupResult({
            buffer,
            fileName: "backup.sqlite",
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: 1,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 8,
            },
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects serialized backup results that exceed the IPC transfer size", () => {
        const buffer = new ArrayBuffer(
            DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES + 1
        );

        const parsed = validateSerializedDatabaseBackupResult({
            buffer,
            fileName: "backup.sqlite",
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: 1,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: buffer.byteLength,
            },
        });

        expect(parsed.success).toBeFalsy();
    });

    it("accepts blank backup filenames for renderer fallback behavior", () => {
        const buffer = new ArrayBuffer(8);

        const parsed = validateSerializedDatabaseBackupResult({
            buffer,
            fileName: " ".repeat(3),
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: 1,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: buffer.byteLength,
            },
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects serialized backup metadata with invalid numeric invariants", () => {
        const buffer = new ArrayBuffer(8);
        const metadata = {
            appVersion: "1.0.0",
            checksum: "abc",
            createdAt: 1,
            originalPath: "C:/x",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: buffer.byteLength,
        };

        for (const invalidMetadata of [
            { ...metadata, createdAt: -1 },
            { ...metadata, createdAt: MAX_VALID_DATE_EPOCH_MS + 1 },
            { ...metadata, retentionHintDays: -1 },
            { ...metadata, schemaVersion: -1 },
            { ...metadata, sizeBytes: -1 },
            { ...metadata, sizeBytes: 1.5 },
            { ...metadata, appVersion: " 1.0.0" },
            { ...metadata, checksum: "abc " },
            { ...metadata, originalPath: " C:/x" },
        ]) {
            const parsed = validateSerializedDatabaseBackupResult({
                buffer,
                fileName: "backup.sqlite",
                metadata: invalidMetadata,
            });

            expect(parsed.success).toBeFalsy();
        }
    });

    it("accepts serialized backup metadata at the Date upper bound", () => {
        const buffer = new ArrayBuffer(8);

        const parsed = validateSerializedDatabaseBackupResult({
            buffer,
            fileName: "backup.sqlite",
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: MAX_VALID_DATE_EPOCH_MS,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: buffer.byteLength,
            },
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects when the buffer is not transferable", () => {
        const parsed = validateSerializedDatabaseRestorePayload({
            buffer: Buffer.from("no"),
            fileName: "backup.sqlite",
        });

        expect(parsed.success).toBeFalsy();
    });

    it("rejects objects that spoof ArrayBuffer shape", () => {
        const parsed = validateSerializedDatabaseRestorePayload({
            buffer: {
                byteLength: 8,
                [Symbol.toStringTag]: "ArrayBuffer",
            },
            fileName: "backup.sqlite",
        });

        expect(parsed.success).toBeFalsy();
    });

    it("rejects objects that inherit from ArrayBuffer.prototype without native slots", () => {
        const parsed = validateSerializedDatabaseRestorePayload({
            buffer: Object.create(ArrayBuffer.prototype) as ArrayBuffer,
            fileName: "backup.sqlite",
        });

        expect(parsed.success).toBeFalsy();
    });

    it("validates restore payload buffer and filename invariants", () => {
        const valid = validateSerializedDatabaseRestorePayload({
            buffer: new ArrayBuffer(8),
            fileName: "restore.sqlite",
        });
        expect(valid.success).toBeTruthy();

        const reservedKeyPayload = Object.create(null) as Record<
            string,
            unknown
        >;
        reservedKeyPayload["buffer"] = new ArrayBuffer(8);
        Object.defineProperty(reservedKeyPayload, "__proto__", {
            enumerable: true,
            value: { polluted: true },
        });

        for (const payload of [
            { buffer: new ArrayBuffer(0), fileName: "restore.sqlite" },
            {
                buffer: new ArrayBuffer(MAX_IPC_SQLITE_RESTORE_BYTES + 1),
                fileName: "restore.sqlite",
            },
            { buffer: new ArrayBuffer(8), fileName: " restore.sqlite" },
            { buffer: new ArrayBuffer(8), fileName: "restore.sqlite " },
            { buffer: new ArrayBuffer(8), fileName: "restore\n.sqlite" },
            { buffer: new ArrayBuffer(8), fileName: "../restore.sqlite" },
            { buffer: new ArrayBuffer(8), fileName: "C:restore.sqlite" },
            { buffer: new ArrayBuffer(8), fileName: "." },
            {
                buffer: new ArrayBuffer(8),
                fileName: `${"a".repeat(MAX_SQLITE_RESTORE_FILE_NAME_BYTES + 1)}.sqlite`,
            },
            reservedKeyPayload,
        ]) {
            expect(
                validateSerializedDatabaseRestorePayload(payload).success
            ).toBeFalsy();
        }
    });

    it("validates restore result and returns a discriminated union", () => {
        const parsed = validateSerializedDatabaseRestoreResult({
            restoredAt: 123,
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: 1,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 8,
            },
        });

        expect(parsed.success).toBeTruthy();
        if (parsed.success) {
            expect(parsed.data.restoredAt).toBe(123);
        }
    });

    it("rejects restore results with invalid restoredAt values", () => {
        const metadata = {
            appVersion: "1.0.0",
            checksum: "abc",
            createdAt: 1,
            originalPath: "C:/x",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 8,
        };

        for (const restoredAt of [
            -1,
            1.5,
            MAX_VALID_DATE_EPOCH_MS + 1,
        ]) {
            const parsed = validateSerializedDatabaseRestoreResult({
                metadata,
                restoredAt,
            });

            expect(parsed.success).toBeFalsy();
        }
    });

    it("accepts restore results at the Date upper bound", () => {
        const parsed = validateSerializedDatabaseRestoreResult({
            restoredAt: MAX_VALID_DATE_EPOCH_MS,
            metadata: {
                appVersion: "1.0.0",
                checksum: "abc",
                createdAt: MAX_VALID_DATE_EPOCH_MS,
                originalPath: "C:/x",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 8,
            },
        });

        expect(parsed.success).toBeTruthy();
    });

    it("validates saved backup result filenames as renderer-safe basenames", () => {
        const valid = validateSerializedDatabaseBackupSaveResult({
            canceled: false,
            fileName: "backup.sqlite",
            filePath: "C:/backups/backup.sqlite",
            metadata: createMetadata(),
        });

        expect(valid.success).toBeTruthy();

        for (const fileName of [
            " backup.sqlite",
            "backup.sqlite ",
            "backup\n.sqlite",
            "../backup.sqlite",
            "C:backup.sqlite",
            ".",
            `${"a".repeat(MAX_SQLITE_RESTORE_FILE_NAME_BYTES + 1)}.sqlite`,
        ]) {
            expect(
                validateSerializedDatabaseBackupSaveResult({
                    canceled: false,
                    fileName,
                    filePath: "C:/backups/backup.sqlite",
                    metadata: createMetadata(),
                }).success
            ).toBeFalsy();
        }
    });

    it("validates restore result pre-restore filenames as renderer-safe basenames", () => {
        const valid = validateSerializedDatabaseRestoreResult({
            metadata: createMetadata(),
            preRestoreFileName: "pre-restore.sqlite",
            restoredAt: 123,
        });

        expect(valid.success).toBeTruthy();

        for (const preRestoreFileName of [
            " pre-restore.sqlite",
            "pre-restore.sqlite ",
            "pre-restore\n.sqlite",
            "../pre-restore.sqlite",
            "C:pre-restore.sqlite",
            ".",
            `${"a".repeat(MAX_SQLITE_RESTORE_FILE_NAME_BYTES + 1)}.sqlite`,
        ]) {
            expect(
                validateSerializedDatabaseRestoreResult({
                    metadata: createMetadata(),
                    preRestoreFileName,
                    restoredAt: 123,
                }).success
            ).toBeFalsy();
        }
    });

    it("validates monitor type config arrays", () => {
        const parsed = validateMonitorTypeConfigArray([
            {
                description: "desc",
                displayName: "HTTP",
                fields: [
                    {
                        label: "URL",
                        name: "url",
                        required: true,
                        type: "url",
                    },
                ],
                type: "http",
                version: "1.0.0",
            },
        ]);

        expect(parsed.success).toBeTruthy();

        const invalid = validateMonitorTypeConfigArray([{}]);
        expect(invalid.success).toBeFalsy();
    });

    it("validates the generic validation result schema", () => {
        const parsed = validateValidationResult({
            data: { ok: true },
            errors: [],
            metadata: { source: "test" },
            success: true,
            warnings: ["w"],
        });

        expect(parsed.success).toBeTruthy();
    });

    it("preserves prototype-named validation metadata as own data", () => {
        const metadata = Object.defineProperty(
            { source: "test" },
            "__proto__",
            {
                configurable: true,
                enumerable: true,
                value: "metadata-value",
                writable: true,
            }
        );

        const parsed = validateValidationResult({
            errors: [],
            metadata,
            success: true,
        });

        expect(parsed.success).toBeTruthy();
        if (!parsed.success) {
            throw new Error("Expected validation result to pass");
        }

        expect(Object.getPrototypeOf(parsed.data.metadata)).toBeNull();
        expect(Object.hasOwn(parsed.data.metadata!, "__proto__")).toBeTruthy();
        expect(Reflect.get(parsed.data.metadata!, "__proto__")).toBe(
            "metadata-value"
        );
    });

    it.each([
        new Date(0),
        new Map<string, unknown>(),
        Object.create({ inherited: "value" }),
    ])("rejects non-record validation metadata: %p", (metadata) => {
        const parsed = validateValidationResult({
            errors: [],
            metadata,
            success: true,
        });

        expect(parsed.success).toBeFalsy();
    });

    it("returns a failure result when restore result validation fails", () => {
        const parsed = validateSerializedDatabaseRestoreResult({
            restoredAt: "no",
        });
        expect(parsed.success).toBeFalsy();
    });
});

/**
 * Tests for shared Zod schemas in validation/dataSchemas.
 */

import { DEFAULT_MAX_IPC_BACKUP_TRANSFER_BYTES } from "@shared/constants/backup";
import {
    validateMonitorTypeConfigArray,
    validateSerializedDatabaseBackupResult,
    validateSerializedDatabaseRestorePayload,
    validateSerializedDatabaseRestoreResult,
    validateValidationResult,
} from "@shared/validation/dataSchemas";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

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

    it("returns a failure result when restore result validation fails", () => {
        const parsed = validateSerializedDatabaseRestoreResult({
            restoredAt: "no",
        });
        expect(parsed.success).toBeFalsy();
    });
});

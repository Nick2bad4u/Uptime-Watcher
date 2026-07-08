import { describe, expect, it, vi } from "vitest";

import { parseSerializedDatabaseBackupResult } from "../../utils/downloads/serializedBackupResult";
import { createSerializedBackupResult } from "./createSerializedBackupResult";

const INVALID_SERIALIZED_BACKUP_DATA_MESSAGE = "Invalid backup data received";

describe(parseSerializedDatabaseBackupResult, () => {
    it("returns validated backup payloads", () => {
        const baselinePayload = createSerializedBackupResult();
        const payload = createSerializedBackupResult({
            buffer: new Uint8Array([
                1,
                2,
                3,
                4,
            ]).buffer,
            metadata: {
                ...baselinePayload.metadata,
                sizeBytes: 4,
            },
        });

        const parsed = parseSerializedDatabaseBackupResult(payload);

        expect(parsed).toStrictEqual(payload);
        expect(parsed.metadata.sizeBytes).toBe(parsed.buffer.byteLength);
    });

    it("throws when schema validation fails", () => {
        expect(() => {
            parseSerializedDatabaseBackupResult({
                buffer: "not-an-array-buffer",
                fileName: "broken.sqlite",
                metadata: {},
            });
        }).toThrow(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE);
    });

    it("throws when metadata size does not match buffer length", () => {
        const baselinePayload = createSerializedBackupResult();
        const payload = createSerializedBackupResult({
            buffer: new Uint8Array([
                1,
                2,
                3,
            ]).buffer,
            metadata: {
                ...baselinePayload.metadata,
                sizeBytes: 100,
            },
        });

        expect(() => {
            parseSerializedDatabaseBackupResult(payload);
        }).toThrow(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE);
    });

    it("does not trust shadowed ArrayBuffer byteLength accessors", () => {
        const baselinePayload = createSerializedBackupResult();
        const buffer = new Uint8Array([
            1,
            2,
            3,
            4,
        ]).buffer;
        const byteLength = vi.fn(() => 100);
        Object.defineProperty(buffer, "byteLength", {
            configurable: true,
            get: byteLength,
        });
        const payload = createSerializedBackupResult({
            buffer,
            metadata: {
                ...baselinePayload.metadata,
                sizeBytes: 4,
            },
        });

        expect(parseSerializedDatabaseBackupResult(payload)).toStrictEqual(
            payload
        );
        expect(byteLength).not.toHaveBeenCalled();
    });
});

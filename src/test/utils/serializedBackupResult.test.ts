import { describe, expect, it } from "vitest";

import {
    INVALID_SERIALIZED_BACKUP_DATA_MESSAGE,
    parseSerializedDatabaseBackupResult,
} from "../../utils/downloads/serializedBackupResult";

import { createSerializedBackupResult } from "./createSerializedBackupResult";

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
        }).toThrowError(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE);
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
        }).toThrowError(INVALID_SERIALIZED_BACKUP_DATA_MESSAGE);
    });
});

import { describe, expect, it, vi } from "vitest";

import { tryBuildSerializedDatabaseRestorePayloadFromFile } from "../../../components/Settings/utils/sqliteRestorePayload";

const createRestoreFile = (contents: string, name = "restore.sqlite"): File =>
    new File([contents], name, {
        type: "application/vnd.sqlite3",
    });

describe("tryBuildSerializedDatabaseRestorePayloadFromFile", () => {
    it("builds a restore payload for a non-empty file within the byte limit", async () => {
        const file = createRestoreFile("sqlite");

        const result = await tryBuildSerializedDatabaseRestorePayloadFromFile({
            file,
            maxBytes: file.size,
        });

        expect(result).toMatchObject({
            ok: true,
            payload: {
                fileName: "restore.sqlite",
            },
        });

        if (!result.ok) {
            throw new Error("Expected restore payload to be built");
        }

        expect(result.payload.buffer.byteLength).toBe(file.size);
    });

    it("rejects empty restore files before reading them", async () => {
        const file = createRestoreFile("");
        const arrayBufferSpy = vi.spyOn(file, "arrayBuffer");

        const result = await tryBuildSerializedDatabaseRestorePayloadFromFile({
            file,
            maxBytes: 1,
        });

        expect(result).toStrictEqual({
            message: "Selected SQLite backup file is empty",
            ok: false,
        });
        expect(arrayBufferSpy).not.toHaveBeenCalled();
    });

    it("rejects restore files larger than the byte limit before reading them", async () => {
        const file = createRestoreFile("sqlite");
        const arrayBufferSpy = vi.spyOn(file, "arrayBuffer");

        const result = await tryBuildSerializedDatabaseRestorePayloadFromFile({
            file,
            maxBytes: file.size - 1,
        });

        expect(result).toStrictEqual({
            message: `Selected SQLite backup is too large to restore (${file.size} > ${
                file.size - 1
            } bytes).`,
            ok: false,
        });
        expect(arrayBufferSpy).not.toHaveBeenCalled();
    });

    it.each([
        Number.NaN,
        Number.POSITIVE_INFINITY,
        0,
        -1,
        1.5,
    ])(
        "rejects invalid byte limit %s before reading the file",
        async (maxBytes) => {
            const file = createRestoreFile("sqlite");
            const arrayBufferSpy = vi.spyOn(file, "arrayBuffer");

            const result =
                await tryBuildSerializedDatabaseRestorePayloadFromFile({
                    file,
                    maxBytes,
                });

            expect(result).toStrictEqual({
                message: "SQLite restore byte limit is invalid.",
                ok: false,
            });
            expect(arrayBufferSpy).not.toHaveBeenCalled();
        }
    );
});

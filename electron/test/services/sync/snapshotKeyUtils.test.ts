import {
    createSnapshotNonceHex,
    isValidSnapshotFileName,
    SNAPSHOT_NONCE_HEX_CHARS,
} from "@electron/services/sync/snapshotKeyUtils";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

describe("snapshotKeyUtils", () => {
    describe(isValidSnapshotFileName, () => {
        it("accepts legacy timestamp-only snapshot filenames", () => {
            expect(isValidSnapshotFileName("123.json")).toBeTruthy();
            expect(
                isValidSnapshotFileName(`${MAX_VALID_DATE_EPOCH_MS}.json`)
            ).toBeTruthy();
        });

        it("accepts v2 snapshot filenames with lowercase hex nonce suffixes", () => {
            expect(
                isValidSnapshotFileName(
                    "123-0123456789abcdef0123456789abcdef.json"
                )
            ).toBeTruthy();
        });

        it("rejects uppercase nonce suffixes", () => {
            expect(
                isValidSnapshotFileName(
                    "123-0123456789ABCDEF0123456789ABCDEF.json"
                )
            ).toBeFalsy();
        });

        it("rejects malformed snapshot filenames", () => {
            expect(isValidSnapshotFileName("1e3.json")).toBeFalsy();
            expect(
                isValidSnapshotFileName(`${MAX_VALID_DATE_EPOCH_MS + 1}.json`)
            ).toBeFalsy();
            expect(
                isValidSnapshotFileName(
                    "123-0123456789abcdef0123456789abcdeg.json"
                )
            ).toBeFalsy();
            expect(
                isValidSnapshotFileName(
                    "123-0123456789abcdef0123456789abcdef-extra.json"
                )
            ).toBeFalsy();
        });
    });

    describe(createSnapshotNonceHex, () => {
        it("creates a lowercase hex nonce of the expected length", () => {
            const nonce = createSnapshotNonceHex();

            expect(nonce).toHaveLength(SNAPSHOT_NONCE_HEX_CHARS);
            expect(nonce).toMatch(/^[\da-f]+$/v);
        });
    });
});

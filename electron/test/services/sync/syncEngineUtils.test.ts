import {
    getPersistedDeviceIdValidationError,
    isValidPersistedDeviceId,
} from "@electron/services/sync/syncEngineUtils";
import { describe, expect, it } from "vitest";

describe("syncEngineUtils", () => {
    describe("getPersistedDeviceIdValidationError()", () => {
        it("returns null for a valid deviceId", () => {
            expect(getPersistedDeviceIdValidationError("device-1")).toBeNull();
        });

        it("rejects empty or whitespace-only ids", () => {
            expect(getPersistedDeviceIdValidationError("")).toMatch(
                /non-empty/iv
            );
            expect(getPersistedDeviceIdValidationError(" ".repeat(3))).toMatch(
                /non-empty/iv
            );
        });

        it("rejects leading/trailing whitespace", () => {
            expect(getPersistedDeviceIdValidationError(" device")).toMatch(
                /leading or trailing whitespace/iv
            );
        });

        it("rejects path separators and ':' tokens", () => {
            expect(getPersistedDeviceIdValidationError("a/b")).toMatch(
                /path separators/iv
            );
            expect(getPersistedDeviceIdValidationError("a:bad")).toMatch(
                /must not contain ':'/iv
            );
        });

        it("rejects traversal segments", () => {
            expect(getPersistedDeviceIdValidationError(".")).toMatch(
                /traversal/iv
            );
            expect(getPersistedDeviceIdValidationError("..")).toMatch(
                /traversal/iv
            );
        });
    });

    describe("isValidPersistedDeviceId()", () => {
        it("agrees with getPersistedDeviceIdValidationError", () => {
            const candidates = [
                "device-1",
                "",
                " ".repeat(3),
                " device",
                "a/b",
                "a:bad",
                ".",
                "..",
            ];

            for (const candidate of candidates) {
                expect(isValidPersistedDeviceId(candidate)).toBe(
                    getPersistedDeviceIdValidationError(candidate) === null
                );
            }
        });
    });
});

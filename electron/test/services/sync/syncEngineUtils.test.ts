import { describe, expect, it } from "vitest";

import {
    getPersistedDeviceIdValidationError,
    isValidPersistedDeviceId,
} from "@electron/services/sync/syncEngineUtils";

describe("syncEngineUtils", () => {
    describe("getPersistedDeviceIdValidationError()", () => {
        it("returns null for a valid deviceId", () => {
            expect(getPersistedDeviceIdValidationError("device-1")).toBeNull();
        });

        it("rejects empty or whitespace-only ids", () => {
            expect(getPersistedDeviceIdValidationError("")).toMatch(
                /non-empty/iu
            );
            expect(getPersistedDeviceIdValidationError("   ")).toMatch(
                /non-empty/iu
            );
        });

        it("rejects leading/trailing whitespace", () => {
            expect(getPersistedDeviceIdValidationError(" device")).toMatch(
                /leading or trailing whitespace/iu
            );
        });

        it("rejects path separators and ':' tokens", () => {
            expect(getPersistedDeviceIdValidationError("a/b")).toMatch(
                /path separators/iu
            );
            expect(getPersistedDeviceIdValidationError("a:bad")).toMatch(
                /must not contain ':'/iu
            );
        });

        it("rejects traversal segments", () => {
            expect(getPersistedDeviceIdValidationError(".")).toMatch(
                /traversal/iu
            );
            expect(getPersistedDeviceIdValidationError("..")).toMatch(
                /traversal/iu
            );
        });
    });

    describe("isValidPersistedDeviceId()", () => {
        it("agrees with getPersistedDeviceIdValidationError", () => {
            const candidates = [
                "device-1",
                "",
                "   ",
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

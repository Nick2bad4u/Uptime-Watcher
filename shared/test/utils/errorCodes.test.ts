import { describe, expect, it } from "vitest";

import { tryGetErrorCode } from "@shared/utils/errorCodes";

describe("tryGetErrorCode()", () => {
    it("returns undefined for non-objects", () => {
        expect(tryGetErrorCode(undefined)).toBeUndefined();
        expect(tryGetErrorCode(null)).toBeUndefined();
        expect(tryGetErrorCode(123)).toBeUndefined();
        expect(tryGetErrorCode("ENOENT")).toBeUndefined();
    });

    it("returns undefined for empty/non-string codes", () => {
        expect(tryGetErrorCode({ code: "" })).toBeUndefined();
        expect(tryGetErrorCode({ code: 123 })).toBeUndefined();
    });

    it("returns code for objects with a string code", () => {
        expect(tryGetErrorCode({ code: "ENOENT" })).toBe("ENOENT");

        const error = Object.assign(new Error("boom"), { code: "EACCES" });
        expect(tryGetErrorCode(error)).toBe("EACCES");
    });
});

import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { describe, expect, it } from "vitest";

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

    it("does not invoke code accessors", () => {
        let getterCalls = 0;
        const error = new Error("boom");
        Object.defineProperty(error, "code", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("code getter should not run");
            },
        });

        expect(tryGetErrorCode(error)).toBeUndefined();
        expect(getterCalls).toBe(0);
    });
});

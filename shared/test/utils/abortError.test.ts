import { describe, expect, it } from "vitest";

import { createAbortError, isAbortError } from "@shared/utils/abortError";

describe("abortError", () => {
    it("creates a standardized AbortError", () => {
        const error = createAbortError();

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AbortError");
        expect(Reflect.get(error as object, "code")).toBe("ERR_CANCELED");
    });

    it("detects AbortError by name or code", () => {
        const standard = createAbortError();
        expect(isAbortError(standard)).toBeTruthy();

        const byCode = new Error("cancel");
        Reflect.set(byCode, "code", "ERR_CANCELED");
        expect(isAbortError(byCode)).toBeTruthy();

        expect(isAbortError(new Error("other"))).toBeFalsy();
        expect(isAbortError(null)).toBeFalsy();
    });
});

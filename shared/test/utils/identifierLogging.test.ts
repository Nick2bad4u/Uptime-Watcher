import { describe, expect, it } from "vitest";

import { getSafeIdentifierForLogging } from "../../utils/identifierLogging";

describe(getSafeIdentifierForLogging, () => {
    it("leaves ordinary identifiers unchanged", () => {
        expect(getSafeIdentifierForLogging("site-123")).toBe("site-123");
    });

    it("preserves undefined and blank identifiers", () => {
        expect(getSafeIdentifierForLogging(undefined)).toBeUndefined();
        expect(getSafeIdentifierForLogging("")).toBe("");
        expect(getSafeIdentifierForLogging(" ".repeat(3))).toBe(
            " ".repeat(3)
        );
    });

    it("redacts URL-shaped identifiers", () => {
        expect(
            getSafeIdentifierForLogging(
                " https://user:pass@example.com/path?access_token=secret#frag "
            )
        ).toBe("https://example.com/path");
    });
});

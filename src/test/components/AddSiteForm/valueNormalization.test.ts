import { describe, expect, it } from "vitest";

import {
    parseOptionalInteger,
    safeTrim,
    toOptionalString,
} from "../../../components/AddSiteForm/utils/valueNormalization";

describe("AddSiteForm value normalization", () => {
    it("parses trimmed positive integer strings", () => {
        expect(parseOptionalInteger(" 8080 ")).toBe(8080);
    });

    it("returns undefined for empty optional integers", () => {
        expect(parseOptionalInteger()).toBeUndefined();
        expect(parseOptionalInteger(" ".repeat(3))).toBeUndefined();
    });

    it("rejects malformed integer strings instead of partially parsing them", () => {
        const invalidValues = [
            "-1",
            "1.5",
            "1e3",
            "8080abc",
            String(Number.MAX_SAFE_INTEGER + 1),
        ];

        for (const value of invalidValues) {
            expect(parseOptionalInteger(value)).toBeUndefined();
        }
    });

    it("safely trims string values only", () => {
        expect(safeTrim(" value ")).toBe("value");
        expect(safeTrim(42)).toBe("");
    });

    it("converts blank strings to undefined", () => {
        expect(toOptionalString(" value ")).toBe("value");
        expect(toOptionalString(" ")).toBeUndefined();
    });
});

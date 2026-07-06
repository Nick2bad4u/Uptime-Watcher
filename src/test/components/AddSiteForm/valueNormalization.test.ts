import { describe, expect, it } from "vitest";

import {
    parseOptionalDecimalNumber,
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

    it("parses plain decimal number strings", () => {
        expect(parseOptionalDecimalNumber(" 8080 ")).toBe(8080);
        expect(parseOptionalDecimalNumber("0.5")).toBe(0.5);
        expect(parseOptionalDecimalNumber(".5")).toBe(0.5);
        expect(parseOptionalDecimalNumber("-1.25")).toBe(-1.25);
    });

    it("rejects non-decimal number syntax", () => {
        const invalidValues = [
            "0x10",
            "1e3",
            "Infinity",
            "NaN",
            "1_000",
            "123abc",
        ];

        for (const value of invalidValues) {
            expect(parseOptionalDecimalNumber(value)).toBeUndefined();
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

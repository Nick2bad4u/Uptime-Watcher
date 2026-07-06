import { isStrictPlainDecimalNumberString } from "@shared/utils/decimalNumberString";
import { describe, expect, it } from "vitest";

describe(isStrictPlainDecimalNumberString, () => {
    it("accepts signed decimal strings with an integer part", () => {
        for (const value of [
            "0",
            "42",
            "-10",
            "+10",
            "3.14",
            "-3.14",
        ]) {
            expect(isStrictPlainDecimalNumberString(value)).toBe(true);
        }
    });

    it("rejects values that are not strict plain decimal strings", () => {
        for (const value of [
            "",
            " ",
            ".5",
            "1.",
            "+",
            "-",
            "1e3",
            "0x10",
            "Infinity",
            "NaN",
            "١٢٣",
            "１２３",
            "123abc",
            " 123",
            "123 ",
        ]) {
            expect(isStrictPlainDecimalNumberString(value)).toBe(false);
        }
    });
});

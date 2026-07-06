import { hasAsciiLetter, isAsciiDigits } from "@shared/utils/ascii";
import { describe, expect, it } from "vitest";

describe("ascii utilities", () => {
    describe(hasAsciiLetter, () => {
        it("detects ASCII letters without treating digits or symbols as letters", () => {
            expect(hasAsciiLetter("Wed, 21 Oct 2015 07:28:00 GMT")).toBe(true);
            expect(hasAsciiLetter("abc")).toBe(true);
            expect(hasAsciiLetter("ABC")).toBe(true);
            expect(hasAsciiLetter("12345")).toBe(false);
            expect(hasAsciiLetter("123-456")).toBe(false);
            expect(hasAsciiLetter("é")).toBe(false);
            expect(hasAsciiLetter("")).toBe(false);
        });
    });

    describe(isAsciiDigits, () => {
        it("accepts only non-empty ASCII digit strings", () => {
            expect(isAsciiDigits("0")).toBe(true);
            expect(isAsciiDigits("1234567890")).toBe(true);
            expect(isAsciiDigits("")).toBe(false);
            expect(isAsciiDigits(" 123")).toBe(false);
            expect(isAsciiDigits("123 ")).toBe(false);
            expect(isAsciiDigits("12.3")).toBe(false);
            expect(isAsciiDigits("١٢٣")).toBe(false);
            expect(isAsciiDigits("１２３")).toBe(false);
        });
    });
});

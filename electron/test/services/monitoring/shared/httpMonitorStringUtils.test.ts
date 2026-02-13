import { describe, expect, it } from "vitest";

import {
    getTrimmedNonEmptyString,
    normalizeHeaderValue,
    resolveHeaderValue,
    resolveRequiredMonitorStringContext,
} from "../../../../services/monitoring/shared/httpMonitorStringUtils";

describe("httpMonitorStringUtils", () => {
    describe(normalizeHeaderValue, () => {
        it("trims and normalizes header whitespace", () => {
            expect(normalizeHeaderValue("  text\t with\nspaces  ")).toBe(
                "text with spaces"
            );
        });
    });

    describe(resolveHeaderValue, () => {
        it("resolves direct and case-insensitive header values", () => {
            expect(
                resolveHeaderValue({ "content-type": "application/json" }, "content-type")
            ).toBe("application/json");

            expect(
                resolveHeaderValue({ "content-type": "application/json" }, "Content-Type")
            ).toBe("application/json");
        });

        it("joins array header values", () => {
            expect(
                resolveHeaderValue({ "x-tag": ["a", "b"] }, "x-tag")
            ).toBe("a, b");
        });

        it("returns null when header is missing", () => {
            expect(resolveHeaderValue({}, "x-missing")).toBeNull();
        });
    });

    describe(getTrimmedNonEmptyString, () => {
        it("returns trimmed string values", () => {
            expect(getTrimmedNonEmptyString("  value  ")).toBe("value");
        });

        it("returns null for non-string or blank values", () => {
            expect(getTrimmedNonEmptyString(123)).toBeNull();
            expect(getTrimmedNonEmptyString("   ")).toBeNull();
        });
    });

    describe(resolveRequiredMonitorStringContext, () => {
        it("returns context for valid values", () => {
            const result = resolveRequiredMonitorStringContext({
                errorMessage: "missing",
                onValue: (value) => ({ keyword: value }),
                value: "  abc  ",
            });

            expect(result).toStrictEqual({
                context: { keyword: "abc" },
                kind: "context",
            });
        });

        it("returns an error result for invalid values", () => {
            const result = resolveRequiredMonitorStringContext({
                errorMessage: "missing",
                onValue: (value) => ({ keyword: value }),
                value: "   ",
            });

            expect(result.kind).toBe("error");
            if (result.kind === "error") {
                expect(result.result.error).toContain("missing");
                expect(result.result.status).toBe("down");
            }
        });
    });
});

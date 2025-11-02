/**
 * Ensures complete behavioural coverage for {@link toSentenceCase} utility.
 *
 * @file Validates edge cases around whitespace, unicode handling, and empty
 *   input behaviour so that UI bindings relying on sentence cased output remain
 *   predictable.
 */

import { describe, expect, it } from "vitest";

import { toSentenceCase } from "../../utils/text/toSentenceCase";

describe(toSentenceCase, () => {
    it("returns an empty string when provided with an empty value", () => {
        expect(toSentenceCase("")).toBe("");
    });

    it("uppercases the first alphabetical character and preserves the rest", () => {
        expect(toSentenceCase("uptime watcher")).toBe("Uptime watcher");
        expect(toSentenceCase("already Capitalised")).toBe(
            "Already Capitalised"
        );
    });

    it("preserves leading non-alphabetic characters without modification", () => {
        expect(toSentenceCase("  leading space")).toBe("  leading space");
        expect(toSentenceCase("123status")).toBe("123status");
    });

    it("handles extended unicode characters using JavaScript casing rules", () => {
        expect(toSentenceCase("éclair")).toBe("Éclair");
        expect(toSentenceCase("ßeta")).toBe("SSeta");
    });
});

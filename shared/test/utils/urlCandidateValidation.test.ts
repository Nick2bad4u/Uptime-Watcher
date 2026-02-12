/**
 * Unit tests for URL string candidate primitive validation helpers.
 */

import { describe, expect, it } from "vitest";

import { validateUrlStringCandidate } from "../../utils/urlCandidateValidation";

describe("urlCandidateValidation", () => {
    const fallbackSafeUrlForLogging = "[redacted]";
    const toSafeUrlForLogging = (url: string): string => `safe:${url}`;

    it("rejects non-string candidates with a stable reason", () => {
        const result = validateUrlStringCandidate(42, {
            fallbackSafeUrlForLogging,
            maxBytes: 100,
            toSafeUrlForLogging,
        });

        expect(result.ok).toBeFalsy();
        if (result.ok) {
            throw new Error("Expected rejection for non-string candidate");
        }

        expect(result.reason).toBe("must be a string");
        expect(result.safeUrlForLogging).toBe(fallbackSafeUrlForLogging);
    });

    it("accepts and trims valid candidates", () => {
        const result = validateUrlStringCandidate("  https://example.com  ", {
            fallbackSafeUrlForLogging,
            maxBytes: 4096,
            toSafeUrlForLogging,
        });

        expect(result.ok).toBeTruthy();
        if (!result.ok) {
            throw new Error(`Expected success, got: ${result.reason}`);
        }

        expect(result.normalizedUrl).toBe("https://example.com");
        expect(result.safeUrlForLogging).toBe("safe:https://example.com");
    });

    it("rejects control characters and newlines", () => {
        const newline = validateUrlStringCandidate(
            "https://example.com/path\nInjected",
            {
                fallbackSafeUrlForLogging,
                maxBytes: 4096,
                toSafeUrlForLogging,
            }
        );

        expect(newline.ok).toBeFalsy();
        if (newline.ok) {
            throw new Error("Expected newline rejection");
        }

        expect(newline.reason).toBe("must not contain newlines");

        const control = validateUrlStringCandidate("https://example.com/\0", {
            fallbackSafeUrlForLogging,
            maxBytes: 4096,
            toSafeUrlForLogging,
        });

        expect(control.ok).toBeFalsy();
        if (control.ok) {
            throw new Error("Expected control character rejection");
        }

        expect(control.reason).toBe("must not contain control characters");
    });
});

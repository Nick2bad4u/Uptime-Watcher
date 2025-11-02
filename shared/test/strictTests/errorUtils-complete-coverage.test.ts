/**
 * Exhaustive behavioural coverage for {@link getErrorMessage} helper.
 *
 * @file Guarantees deterministic fallbacks for unknown error values so the
 *   shared logging infrastructure remains resilient when receiving mixed
 *   exception payloads.
 */

import { describe, expect, it } from "vitest";

import { getErrorMessage } from "@shared/utils/errorUtils";

describe(getErrorMessage, () => {
    it("returns the original message when the input is an Error instance", () => {
        const error = new Error("resolver failed");

        expect(getErrorMessage(error)).toBe("resolver failed");
    });

    it("falls back to the default message when the value is not an Error", () => {
        expect(getErrorMessage(undefined)).toBe("Unknown error");
        expect(getErrorMessage({ message: "ignored" })).toBe("Unknown error");
    });

    it("allows callers to provide custom fallback messages", () => {
        expect(getErrorMessage(null, "Custom fallback")).toBe(
            "Custom fallback"
        );
    });
});

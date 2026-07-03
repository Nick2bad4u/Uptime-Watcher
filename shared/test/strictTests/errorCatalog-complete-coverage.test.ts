/**
 * Exhaustive behavioural coverage for {@link getUnknownErrorMessage}.
 *
 * @file Guarantees deterministic fallbacks for unknown error values so shared
 *   logging infrastructure remains resilient when receiving mixed exception
 *   payloads.
 */

import {
    ERROR_CATALOG,
    getUnknownErrorMessage,
} from "@shared/utils/errorCatalog";
import { describe, expect, it } from "vitest";

describe(getUnknownErrorMessage, () => {
    it("returns the original message when the input is an Error instance", () => {
        const error = new Error("resolver failed");

        expect(getUnknownErrorMessage(error)).toBe("resolver failed");
    });

    it("does not invoke Error message accessors", () => {
        let getterCalls = 0;
        const error = new Error("hidden");
        Object.defineProperty(error, "message", {
            configurable: true,
            get: () => {
                getterCalls += 1;
                return "accessor message";
            },
        });

        expect(getUnknownErrorMessage(error)).toBe(
            ERROR_CATALOG.system.UNKNOWN_ERROR
        );
        expect(getterCalls).toBe(0);
    });

    it("falls back to the default message when the value is not an Error", () => {
        expect(getUnknownErrorMessage(undefined)).toBe(
            ERROR_CATALOG.system.UNKNOWN_ERROR
        );
        expect(getUnknownErrorMessage({ message: "ignored" })).toBe(
            ERROR_CATALOG.system.UNKNOWN_ERROR
        );
    });

    it("allows callers to provide custom fallback messages", () => {
        expect(getUnknownErrorMessage(null, "Custom fallback")).toBe(
            "Custom fallback"
        );
    });
});

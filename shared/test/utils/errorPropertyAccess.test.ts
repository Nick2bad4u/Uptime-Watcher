import {
    getOwnDataCause,
    getErrorStringProperty,
    getOwnDataProperty,
    getOwnStringDataProperty,
} from "@shared/utils/errorPropertyAccess";
import { describe, expect, it } from "vitest";

describe("errorPropertyAccess", () => {
    it("reads own data properties without invoking accessors", () => {
        let getterCalls = 0;
        const value = { message: "visible" };
        Object.defineProperty(value, "computed", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return "hidden";
            },
        });

        expect(getOwnDataProperty(value, "message")).toEqual({
            found: true,
            value: "visible",
        });
        expect(getOwnDataProperty(value, "computed")).toEqual({
            found: false,
        });
        expect(getOwnStringDataProperty(value, "message")).toBe("visible");
        expect(getOwnStringDataProperty(value, "computed")).toBeUndefined();
        expect(getterCalls).toBe(0);
    });

    it("returns undefined for non-string own data properties", () => {
        expect(
            getOwnStringDataProperty({ message: 123 }, "message")
        ).toBeUndefined();
    });

    it("reads own Error cause data without invoking custom accessors", () => {
        let getterCalls = 0;
        const nested = new Error("nested");
        const errorWithCause = new Error("safe", { cause: nested });
        const errorWithAccessorCause = new Error("accessor");

        Object.defineProperty(errorWithAccessorCause, "cause", {
            configurable: true,
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return new Error("hidden");
            },
        });

        expect(getOwnDataCause(errorWithCause)).toBe(nested);
        expect(getOwnDataCause(errorWithAccessorCause)).toBeUndefined();
        expect(getOwnDataCause(new Error("none"))).toBeUndefined();
        expect(getterCalls).toBe(0);
    });

    it("reads Error string data fields without invoking custom accessors", () => {
        let getterCalls = 0;
        const error = new Error("safe");
        Object.defineProperty(error, "name", {
            configurable: true,
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return "SecretError";
            },
        });

        expect(getErrorStringProperty(error, "message")).toBe("safe");
        expect(getErrorStringProperty(error, "name")).toBeUndefined();
        expect(getterCalls).toBe(0);
    });
});

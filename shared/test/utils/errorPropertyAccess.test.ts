import {
    getCallableDataProperty,
    getOwnDataCause,
    getErrorStringProperty,
    getOwnDataProperty,
    getOwnPropertyValue,
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

    it("reads own accessor values when explicitly requested", () => {
        const value = {};
        Object.defineProperty(value, "runtime", {
            configurable: true,
            enumerable: true,
            get: () => "available",
        });

        expect(getOwnPropertyValue(value, "runtime")).toEqual({
            found: true,
            value: "available",
        });
    });

    it("treats throwing own accessors as missing when explicitly requested", () => {
        const value = {};
        Object.defineProperty(value, "runtime", {
            configurable: true,
            enumerable: true,
            get() {
                throw new Error("unavailable");
            },
        });

        expect(getOwnPropertyValue(value, "runtime")).toEqual({
            found: false,
        });
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

    it("reads callable data properties from instances and prototypes", () => {
        class ExampleService {
            public close(): string {
                return "closed";
            }
        }

        const service = new ExampleService();
        const ownCleanup = { cleanup: () => "cleaned" };

        expect(getCallableDataProperty(ownCleanup, "cleanup")?.call(ownCleanup))
            .toBe("cleaned");
        expect(getCallableDataProperty(service, "close")?.call(service)).toBe(
            "closed"
        );
        expect(getCallableDataProperty(service, "missing")).toBeUndefined();
    });

    it("does not invoke accessors while finding callable properties", () => {
        let getterCalls = 0;
        const service = {};
        Object.defineProperty(service, "cleanup", {
            configurable: true,
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return () => "hidden";
            },
        });

        expect(getCallableDataProperty(service, "cleanup")).toBeUndefined();
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

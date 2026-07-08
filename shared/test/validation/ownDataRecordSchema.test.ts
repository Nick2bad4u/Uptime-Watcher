import { describe, expect, it } from "vitest";
import * as z from "zod";

import { createOwnDataRecordSchema } from "../../validation/ownDataRecordSchema";

describe("createOwnDataRecordSchema", () => {
    const stringRecordSchema = createOwnDataRecordSchema(z.string());

    it("preserves prototype-named keys on plain records as own data", () => {
        const input = Object.defineProperty({ stable: "value" }, "__proto__", {
            configurable: true,
            enumerable: true,
            value: "prototype-value",
            writable: true,
        });

        const result = stringRecordSchema.parse(input);

        expect(Object.getPrototypeOf(result)).toBeNull();
        expect(result["stable"]).toBe("value");
        expect(Object.hasOwn(result, "__proto__")).toBeTruthy();
        expect(Reflect.get(result, "__proto__")).toBe("prototype-value");
        expect(Object.hasOwn({}, "__proto__")).toBeFalsy();
    });

    it("accepts null-prototype records", () => {
        const input = Object.create(null) as Record<string, string>;
        Object.defineProperty(input, "stable", {
            configurable: true,
            enumerable: true,
            value: "value",
            writable: true,
        });

        expect(stringRecordSchema.parse(input)).toEqual({
            stable: "value",
        });
    });

    it.each([
        new Date(0),
        new Map<string, string>(),
        Object.create({ inherited: "value" }) as object,
    ])("rejects non-record object instances: %p", (input) => {
        expect(stringRecordSchema.safeParse(input).success).toBeFalsy();
    });
});

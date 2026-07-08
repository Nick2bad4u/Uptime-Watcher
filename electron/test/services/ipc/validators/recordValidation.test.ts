import { describe, expect, it } from "vitest";

import { requireRecordParamValue } from "@electron/services/ipc/validators/utils/recordValidation";

describe(requireRecordParamValue, () => {
    it("accepts null-prototype records and returns a safe data copy", () => {
        const payload = Object.create(null) as Record<string, unknown>;
        payload["value"] = "ok";

        const result = requireRecordParamValue(payload, "payload");

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(Object.getPrototypeOf(result.record)).toBeNull();
            expect(result.record["value"]).toBe("ok");
        }
    });

    it("rejects objects with exotic prototypes", () => {
        for (const payload of [
            new Date(),
            new Map<string, unknown>(),
            Object.create({ inherited: true }) as Record<string, unknown>,
        ]) {
            const result = requireRecordParamValue(payload, "payload");

            expect(result).toStrictEqual({
                error: ["payload must be a valid object"],
                ok: false,
            });
        }
    });

    it("copies only own enumerable data properties without invoking accessors", () => {
        let getterCalled = false;
        const payload = { value: "ok" } as Record<string, unknown>;
        Object.defineProperty(payload, "unsafe", {
            enumerable: true,
            get() {
                getterCalled = true;
                throw new Error("getter should not run");
            },
        });

        const result = requireRecordParamValue(payload, "payload");

        expect(getterCalled).toBe(false);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.record["value"]).toBe("ok");
            expect(result.record["unsafe"]).toBeUndefined();
        }
    });

    it("rejects reserved prototype-pollution keys before copying", () => {
        const payload = Object.create(null) as Record<string, unknown>;
        Object.defineProperty(payload, "__proto__", {
            enumerable: true,
            value: "polluted",
        });

        const result = requireRecordParamValue(payload, "payload");

        expect(result).toStrictEqual({
            error: ["payload must not include reserved key '__proto__'"],
            ok: false,
        });
    });
});

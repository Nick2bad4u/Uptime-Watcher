import { describe, expect, it } from "vitest";

import { collectOwnPropertyValuesSafely } from "../../utils/objectIntrospection";

describe(collectOwnPropertyValuesSafely, () => {
    it("collects own data property values without inherited properties", () => {
        const prototype = {
            inherited: "ignored",
        };
        const value = Object.assign(Object.create(prototype), {
            own: "included",
        });

        expect(collectOwnPropertyValuesSafely(value)).toEqual(["included"]);
    });

    it("does not invoke accessors while collecting values", () => {
        let getterCalls = 0;
        const value = {
            own: "included",
        };

        Object.defineProperty(value, "computed", {
            enumerable: true,
            get() {
                getterCalls += 1;
                return "ignored";
            },
        });

        expect(collectOwnPropertyValuesSafely(value)).toEqual(["included"]);
        expect(getterCalls).toBe(0);
    });

    it("does not invoke accessors while collecting array values", () => {
        let getterCalls = 0;
        const value = ["included"];

        Object.defineProperty(value, "1", {
            enumerable: true,
            get() {
                getterCalls += 1;
                return "ignored";
            },
        });

        expect(collectOwnPropertyValuesSafely(value)).toEqual(["included"]);
        expect(getterCalls).toBe(0);
    });
});

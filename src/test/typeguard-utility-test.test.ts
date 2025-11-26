/**
 * Simple utility coverage test with typeGuards imports.
 */

import { describe, expect, it } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { hasProperties, hasProperty, isArray } from "@shared/utils/typeGuards";

/** Arbitrary for generating valid property names */
const propertyNameArbitrary = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((value) => /^[a-z_$][\w$]*$/iu.test(value));

/** Arbitrary for generating test objects with known properties */
const objectWithPropertiesArbitrary = fc
    .dictionary(
        propertyNameArbitrary,
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null))
    )
    .filter((obj) => Object.keys(obj).length > 0);

/** Arbitrary for generating non-empty arrays */
const nonEmptyArrayArbitrary = fc.array(fc.anything(), {
    minLength: 1,
    maxLength: 20,
});

describe("TypeGuard Utility Coverage Test", () => {
    it("should test typeguard functions with specific values", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: typeguard-utility-test", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const sampleObject = { status: "active", count: 42 };
        const sampleArray = [
            "first",
            "second",
            "third",
        ];

        expect(hasProperties(sampleObject, ["status"])).toBeTruthy();
        expect(hasProperty(sampleObject, "status")).toBeTruthy();
        expect(isArray(sampleArray)).toBeTruthy();
    });

    describe("Property-based Tests", () => {
        test.prop([objectWithPropertiesArbitrary])(
            "should correctly identify existing properties in any object",
            (obj) => {
                const keys = Object.keys(obj);
                if (keys.length > 0) {
                    const firstKey = keys[0]!;
                    expect(hasProperty(obj, firstKey)).toBeTruthy();
                    expect(hasProperties(obj, [firstKey])).toBeTruthy();
                }
            }
        );

        test.prop([objectWithPropertiesArbitrary, propertyNameArbitrary])(
            "should correctly identify missing properties",
            (obj, missingKey) => {
                // Ensure the key is not in the object
                fc.pre(!(missingKey in obj));
                expect(hasProperty(obj, missingKey)).toBeFalsy();
                expect(hasProperties(obj, [missingKey])).toBeFalsy();
            }
        );

        test.prop([nonEmptyArrayArbitrary])(
            "should correctly identify arrays",
            (arr) => {
                expect(isArray(arr)).toBeTruthy();
            }
        );

        test.prop([
            fc.oneof(fc.object(), fc.string(), fc.integer(), fc.boolean()),
        ])("should correctly identify non-arrays", (nonArray) => {
            fc.pre(!Array.isArray(nonArray));
            expect(isArray(nonArray)).toBeFalsy();
        });

        test.prop([objectWithPropertiesArbitrary])(
            "should verify all keys are present when checking multiple properties",
            (obj) => {
                const keys = Object.keys(obj);
                if (keys.length >= 2) {
                    const twoKeys = keys.slice(0, 2);
                    expect(hasProperties(obj, twoKeys)).toBeTruthy();
                }
            }
        );
    });
});

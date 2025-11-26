/**
 * @module shared/utils/objectSafety.test
 *
 * @file Direct function call tests for objectSafety to ensure coverage
 */

import { describe, expect, it } from "vitest";
import {
    safeObjectAccess,
    safeObjectIteration,
    safeObjectOmit,
    safeObjectPick,
    typedObjectEntries,
    typedObjectKeys,
    typedObjectValues,
} from "@shared/utils/objectSafety";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

/** Arbitrary for generating test objects with known values */
const testObjectArbitrary = fc.record({
    username: fc.string({ minLength: 1, maxLength: 50 }),
    age: fc.integer({ min: 0, max: 150 }),
    isActive: fc.boolean(),
    score: fc.float({ min: 0, max: 100 }),
});

describe("objectSafety Direct Function Coverage", () => {
    const sampleRecord = { username: "alice", age: 28, isActive: true };

    it("should call safeObjectAccess function", () => {
        // Test with valid object and key
        expect(safeObjectAccess(sampleRecord, "username", "default")).toBe(
            "alice"
        );
        // Test with fallback
        expect(safeObjectAccess(sampleRecord, "missing", "default")).toBe(
            "default"
        );
        // Test with invalid object
        expect(safeObjectAccess(null, "username", "default")).toBe("default");
    });

    it("should call safeObjectIteration function", () => {
        let callCount = 0;
        safeObjectIteration(sampleRecord, () => {
            callCount++;
        });
        expect(callCount).toBeGreaterThan(0);
    });

    it("should call safeObjectOmit function", () => {
        const result = safeObjectOmit(sampleRecord, ["age"]);
        expect(result).toHaveProperty("username");
        expect(result).toHaveProperty("isActive");
        expect(result).not.toHaveProperty("age");
    });

    it("should call safeObjectPick function", () => {
        const result = safeObjectPick(sampleRecord, ["username", "age"]);
        expect(result).toHaveProperty("username");
        expect(result).toHaveProperty("age");
        expect(result).not.toHaveProperty("isActive");
    });

    it("should call typedObjectEntries function", () => {
        const entries = typedObjectEntries(sampleRecord);
        expect(Array.isArray(entries)).toBeTruthy();
        expect(entries.length).toBeGreaterThan(0);
    });

    it("should call typedObjectKeys function", () => {
        const keys = typedObjectKeys(sampleRecord);
        expect(Array.isArray(keys)).toBeTruthy();
        expect(keys).toContain("username" as keyof typeof sampleRecord);
    });

    it("should call typedObjectValues function", () => {
        const values = typedObjectValues(sampleRecord);
        expect(Array.isArray(values)).toBeTruthy();
        expect(values).toContain("alice");
    });

    describe("Property-based Tests", () => {
        test.prop([testObjectArbitrary, fc.string({ minLength: 1 })])(
            "should return fallback for missing keys in any object",
            (obj, fallbackValue) => {
                const result = safeObjectAccess(
                    obj,
                    "nonExistentKey" as keyof typeof obj,
                    fallbackValue
                );
                expect(result).toBe(fallbackValue);
            }
        );

        test.prop([testObjectArbitrary])(
            "should iterate over all keys in any object",
            (obj) => {
                const visitedKeys: string[] = [];
                safeObjectIteration(obj, (key) => {
                    visitedKeys.push(key);
                });
                expect(visitedKeys).toHaveLength(Object.keys(obj).length);
            }
        );

        test.prop([testObjectArbitrary])(
            "should return entries matching object structure",
            (obj) => {
                const entries = typedObjectEntries(obj);
                expect(entries).toHaveLength(Object.keys(obj).length);
                for (const [key, value] of entries) {
                    expect(obj[key as keyof typeof obj]).toBe(value);
                }
            }
        );

        test.prop([testObjectArbitrary])(
            "should return all keys from any object",
            (obj) => {
                const keys = typedObjectKeys(obj);
                expect(keys).toHaveLength(Object.keys(obj).length);
            }
        );

        test.prop([testObjectArbitrary])(
            "should return all values from any object",
            (obj) => {
                const values = typedObjectValues(obj);
                expect(values).toHaveLength(Object.keys(obj).length);
            }
        );

        test.prop([
            fc.object({ maxDepth: 1, maxKeys: 5 }).filter((o) => {
                const keys = Object.keys(o);
                return keys.length >= 2;
            }),
        ])("should omit specified keys from any object", (obj) => {
            const keys = Object.keys(obj);
            if (keys.length >= 2) {
                const keyToOmit = keys[0]!;
                const result = safeObjectOmit(obj, [keyToOmit]);
                expect(Object.hasOwn(result, keyToOmit)).toBeFalsy();
                expect(Object.keys(result)).toHaveLength(keys.length - 1);
            }
        });

        test.prop([
            fc.object({ maxDepth: 1, maxKeys: 5 }).filter((o) => {
                const keys = Object.keys(o);
                return keys.length >= 2;
            }),
        ])("should pick specified keys from any object", (obj) => {
            const keys = Object.keys(obj);
            if (keys.length >= 2) {
                const keysToPick = keys.slice(0, 2);
                const result = safeObjectPick(obj, keysToPick);
                expect(Object.keys(result)).toHaveLength(keysToPick.length);
                for (const key of keysToPick) {
                    expect(Object.hasOwn(result, key)).toBeTruthy();
                }
            }
        });
    });
});

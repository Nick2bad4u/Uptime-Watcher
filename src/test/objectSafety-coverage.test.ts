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

describe("objectSafety Direct Function Coverage", () => {
    const testObj = { name: "test", age: 25, active: true };

    it("should call safeObjectAccess function", () => {
        // Test with valid object and key
        expect(safeObjectAccess(testObj, "name", "default")).toBe("test");
        // Test with fallback
        expect(safeObjectAccess(testObj, "missing", "default")).toBe("default");
        // Test with invalid object
        expect(safeObjectAccess(null, "name", "default")).toBe("default");
    });

    it("should call safeObjectIteration function", () => {
        let callCount = 0;
        safeObjectIteration(testObj, () => {
            callCount++;
        });
        expect(callCount).toBeGreaterThan(0);
    });

    it("should call safeObjectOmit function", () => {
        const result = safeObjectOmit(testObj, ["age"]);
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("active");
        expect(result).not.toHaveProperty("age");
    });

    it("should call safeObjectPick function", () => {
        const result = safeObjectPick(testObj, ["name", "age"]);
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("age");
        expect(result).not.toHaveProperty("active");
    });

    it("should call typedObjectEntries function", () => {
        const entries = typedObjectEntries(testObj);
        expect(Array.isArray(entries)).toBeTruthy();
        expect(entries.length).toBeGreaterThan(0);
    });

    it("should call typedObjectKeys function", () => {
        const keys = typedObjectKeys(testObj);
        expect(Array.isArray(keys)).toBeTruthy();
        expect(keys).toContain("name" as keyof typeof testObj);
    });

    it("should call typedObjectValues function", () => {
        const values = typedObjectValues(testObj);
        expect(Array.isArray(values)).toBeTruthy();
        expect(values).toContain("test");
    });
});

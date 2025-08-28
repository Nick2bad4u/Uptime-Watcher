/**
 * Simple utility coverage test with typeGuards imports.
 */

import { describe, expect, it } from "vitest";
import {
    hasProperties,
    hasProperty,
    isArray,
} from "../../shared/utils/typeGuards";

describe("TypeGuard Utility Coverage Test", () => {
    it("should test typeguard functions", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: typeguard-utility-test", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: typeguard-utility-test", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const testObj = { test: "value" };
        const testArray = [
            1,
            2,
            3,
        ];

        expect(hasProperties(testObj, ["test"])).toBe(true);
        expect(hasProperty(testObj, "test")).toBe(true);
        expect(isArray(testArray)).toBe(true);
    });
});

import { describe, it, expect } from "vitest";
// Import directly from the correct path
import { isObject } from "../../utils/typeGuards";

describe("typeGuards Debug Test", () => {
    it("should execute isObject function and achieve coverage", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: typeGuards", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // Call the function directly to ensure coverage
        const result1 = isObject({ test: "value" });
        const result2 = isObject(null);
        const result3 = isObject([]);
        const result4 = isObject("string");
        const result5 = isObject(123);
        const result6 = isObject(undefined);

        expect(result1).toBe(true);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
        expect(result4).toBe(false);
        expect(result5).toBe(false);
        expect(result6).toBe(false);
    });
});

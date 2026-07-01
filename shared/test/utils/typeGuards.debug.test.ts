import { describe, expect, it } from "vitest";

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
        const isResult1 = isObject({ test: "value" });
        const isResult2 = isObject(null);
        const isResult3 = isObject([]);
        const isResult4 = isObject("string");
        const isResult5 = isObject(123);
        const isResult6 = isObject(undefined);

        expect(isResult1).toBeTruthy();
        expect(isResult2).toBeFalsy();
        expect(isResult3).toBeFalsy();
        expect(isResult4).toBeFalsy();
        expect(isResult5).toBeFalsy();
        expect(isResult6).toBeFalsy();
    });
});

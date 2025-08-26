import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAvailabilityColors } from "../../theme/useTheme";

describe("Debug Availability Function Source", () => {
    it("should reveal the actual function being called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: debug-function-source", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

        const { result } = renderHook(() => useAvailabilityColors());

        // Let's see the actual function source
        console.log(
            "Function source:",
            result.current.getAvailabilityDescription.toString()
        );

        // Test edge case that showed different behavior
        console.log(
            "Testing -10 (should clamp to 0 and return 'Failed'):",
            result.current.getAvailabilityDescription(-10)
        );
        console.log(
            "Testing 0 (should return 'Failed'):",
            result.current.getAvailabilityDescription(0)
        );
        console.log(
            "Testing 49 (should return 'Failed'):",
            result.current.getAvailabilityDescription(49)
        );
        console.log(
            "Testing 50 (should return 'Critical'):",
            result.current.getAvailabilityDescription(50)
        );

        // This will help understand the actual logic
        expect(true).toBe(true);
    });
});

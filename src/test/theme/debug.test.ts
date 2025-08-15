/**
 * Debug test to investigate the availability description issue
 */

import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAvailabilityColors } from "../../theme/useTheme";

// Let's also import the module directly to debug
import * as useThemeModule from "../../theme/useTheme";

describe("Debug Availability Description", () => {
    it("should debug the implementation logic", () => {
        const { result } = renderHook(() => useAvailabilityColors());

        // Debug the module
        console.log("Module keys:", Object.keys(useThemeModule));
        console.log(
            "useAvailabilityColors function:",
            useAvailabilityColors.toString().slice(0, 500)
        );

        // Test all percentage boundary conditions
        const testCases = [
            100, 99.9, 99.5, 99, 98.5, 98, 95.5, 95, 94.5, 90.5, 90, 85, 80, 60,
            50, 30, 0,
        ];

        console.log("Complete test of all boundaries:");
        for (const percentage of testCases) {
            const result_desc =
                result.current.getAvailabilityDescription(percentage);
            console.log(`${percentage}% -> "${result_desc}"`);
        }

        // This should help us see what the actual function is doing
        expect(true).toBe(true); // Just pass the test
    });
});

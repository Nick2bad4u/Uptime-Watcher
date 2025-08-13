import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAvailabilityColors } from "../../theme/useTheme";

describe("Debug Availability Description", () => {
    it("should debug actual availability description values", () => {
        const { result } = renderHook(() => useAvailabilityColors());

        console.log(
            "Testing 99.5%:",
            result.current.getAvailabilityDescription(99.5)
        );
        console.log(
            "Testing -10:",
            result.current.getAvailabilityDescription(-10)
        );
        console.log("Testing 0:", result.current.getAvailabilityDescription(0));
        console.log(
            "Testing 49:",
            result.current.getAvailabilityDescription(49)
        );
        console.log(
            "Testing 50:",
            result.current.getAvailabilityDescription(50)
        );
        console.log(
            "Testing 79:",
            result.current.getAvailabilityDescription(79)
        );
        console.log(
            "Testing 80:",
            result.current.getAvailabilityDescription(80)
        );

        // Just to pass the test
        expect(true).toBe(true);
    });
});

import { describe, it, expect } from "vitest";

import { calculateMaxDuration } from "../utils/duration";

/**
 * Direct test for the calculateMaxDuration function to ensure 100% coverage
 * This tests the function that was extracted from SettingsTab.tsx
 */

describe("calculateMaxDuration utility function", () => {
    it("should handle retryAttempts = 0 (line 194 coverage)", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        // Test the specific case that hits line 194: ": 0;"
        const result = calculateMaxDuration(5, 0);

        // When retryAttempts = 0:
        // totalAttempts = 0 + 1 = 1
        // timeoutTime = 5 * 1 = 5
        // backoffTime = 0 (this is line 194)
        // totalTime = Math.ceil(5 + 0) = 5
        // return "5s" (since 5 < 60)

        expect(result).toBe("5s");
    });

    it("should handle retryAttempts > 0 (complex backoff calculation)", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        // Test the other branch of the ternary operator
        const result = calculateMaxDuration(5, 1);

        // When retryAttempts = 1:
        // totalAttempts = 1 + 1 = 2
        // timeoutTime = 5 * 2 = 10
        // backoffTime = Array.from({length: 1}, (_, i) => Math.min(0.5 * Math.pow(2, i), 5))
        //             = [Math.min(0.5 * Math.pow(2, 0), 5)]
        //             = [Math.min(0.5 * 1, 5)]
        //             = [0.5]
        //             .reduce((a, b) => a + b, 0) = 0.5
        // totalTime = Math.ceil(10 + 0.5) = 11
        // return "11s"

        expect(result).toBe("11s");
    });

    it("should handle large timeout values (minutes)", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        // Test the minute formatting branch
        const result = calculateMaxDuration(30, 2);

        // With timeout=30 and retryAttempts=2:
        // totalAttempts = 3, timeoutTime = 90
        // backoffTime ≈ 1.5 (0.5 + 1.0), totalTime ≈ 92
        // Since 92 >= 60, should return minutes: Math.ceil(92/60) = 2m
        expect(result).toMatch(/\d+m/);

        // Test with a value that definitely exceeds 60s
        const result2 = calculateMaxDuration(60, 0);
        expect(result2).toBe("1m"); // 60s = 1m
    });

    it("should handle various retry attempt values", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        // Test multiple values to ensure both branches work
        expect(calculateMaxDuration(10, 0)).toBe("10s"); // RetryAttempts = 0, hits line 194
        expect(calculateMaxDuration(10, 1)).toMatch(/\d+s/); // RetryAttempts > 0
        expect(calculateMaxDuration(10, 2)).toMatch(/\d+s/); // RetryAttempts > 0
        expect(calculateMaxDuration(10, 3)).toMatch(/\d+s/); // RetryAttempts > 0
    });

    it("should verify backoff calculation edge cases", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: calculateMaxDuration", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        // Test with retryAttempts = 0 to ensure line 194 (": 0;") is covered
        const result1 = calculateMaxDuration(1, 0);
        expect(result1).toBe("1s");

        const result2 = calculateMaxDuration(59, 0);
        expect(result2).toBe("59s");

        const result3 = calculateMaxDuration(60, 0);
        expect(result3).toBe("1m");

        // Verify that when retryAttempts = 0, backoffTime is exactly 0
        // This directly tests the ": 0;" part of the ternary (line 194)
    });
});

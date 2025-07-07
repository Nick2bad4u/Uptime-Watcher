/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTimestamp } from "../utils";

describe("time utilities - Uncovered Lines", () => {
    let originalDateNow: typeof Date.now;

    beforeEach(() => {
        // Mock Date.now to return a fixed timestamp for consistent testing
        originalDateNow = Date.now;
        Date.now = vi.fn(() => 1000000000000); // Fixed timestamp: Sunday, September 9, 2001 1:46:40 AM GMT
    });

    afterEach(() => {
        Date.now = originalDateNow;
    });

    describe("formatRelativeTimestamp", () => {
        it("should return 'Just now' for timestamps within 30 seconds", () => {
            const now = 1000000000000;

            // Test 0 seconds ago
            expect(formatRelativeTimestamp(now)).toBe("Just now");

            // Test 15 seconds ago
            expect(formatRelativeTimestamp(now - 15000)).toBe("Just now");

            // Test exactly 30 seconds ago (should still be "Just now")
            expect(formatRelativeTimestamp(now - 30000)).toBe("Just now");
        });

        it("should return seconds for timestamps between 31 seconds and 59 seconds", () => {
            const now = 1000000000000;

            // Test 31 seconds ago
            expect(formatRelativeTimestamp(now - 31000)).toBe("31 seconds ago");

            // Test 45 seconds ago
            expect(formatRelativeTimestamp(now - 45000)).toBe("45 seconds ago");

            // Test 59 seconds ago
            expect(formatRelativeTimestamp(now - 59000)).toBe("59 seconds ago");
        });

        it("should return minutes for timestamps between 1 minute and 59 minutes", () => {
            const now = 1000000000000;

            // Test 1 minute ago (singular)
            expect(formatRelativeTimestamp(now - 60000)).toBe("1 minute ago");

            // Test 2 minutes ago (plural)
            expect(formatRelativeTimestamp(now - 120000)).toBe("2 minutes ago");

            // Test 30 minutes ago
            expect(formatRelativeTimestamp(now - 1800000)).toBe("30 minutes ago");

            // Test 59 minutes ago
            expect(formatRelativeTimestamp(now - 3540000)).toBe("59 minutes ago");
        });

        it("should return hours for timestamps between 1 hour and 23 hours", () => {
            const now = 1000000000000;

            // Test 1 hour ago (singular)
            expect(formatRelativeTimestamp(now - 3600000)).toBe("1 hour ago");

            // Test 2 hours ago (plural)
            expect(formatRelativeTimestamp(now - 7200000)).toBe("2 hours ago");

            // Test 12 hours ago
            expect(formatRelativeTimestamp(now - 43200000)).toBe("12 hours ago");

            // Test 23 hours ago
            expect(formatRelativeTimestamp(now - 82800000)).toBe("23 hours ago");
        });

        it("should return days for timestamps 24 hours or older", () => {
            const now = 1000000000000;

            // Test 1 day ago (singular)
            expect(formatRelativeTimestamp(now - 86400000)).toBe("1 day ago");

            // Test 2 days ago (plural)
            expect(formatRelativeTimestamp(now - 172800000)).toBe("2 days ago");

            // Test 7 days ago
            expect(formatRelativeTimestamp(now - 604800000)).toBe("7 days ago");

            // Test 30 days ago
            expect(formatRelativeTimestamp(now - 2592000000)).toBe("30 days ago");
        });

        it("should handle edge cases around boundaries", () => {
            const now = 1000000000000;

            // Test exactly 1 minute (60 seconds)
            expect(formatRelativeTimestamp(now - 60000)).toBe("1 minute ago");

            // Test exactly 1 hour (3600 seconds)
            expect(formatRelativeTimestamp(now - 3600000)).toBe("1 hour ago");

            // Test exactly 1 day (86400 seconds)
            expect(formatRelativeTimestamp(now - 86400000)).toBe("1 day ago");
        });

        it("should handle future timestamps (negative diff)", () => {
            const now = 1000000000000;

            // Test future timestamp (should still work with negative values)
            // Math.floor of negative numbers will give us the expected behavior
            expect(formatRelativeTimestamp(now + 60000)).toBe("Just now");
        });

        it("should handle very large time differences", () => {
            const now = 1000000000000;

            // Test 365 days ago
            const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
            expect(formatRelativeTimestamp(oneYearAgo)).toBe("365 days ago");
        });

        it("should handle zero timestamp", () => {
            // This tests the case where timestamp is 0 (Unix epoch)
            const result = formatRelativeTimestamp(0);
            // Should return a valid string (will be many days ago)
            expect(result).toContain("days ago");
        });

        it("should handle plural vs singular correctly", () => {
            const now = 1000000000000;

            // Test singular forms
            expect(formatRelativeTimestamp(now - 1000)).toBe("Just now"); // 1 second
            expect(formatRelativeTimestamp(now - 60000)).toBe("1 minute ago"); // 1 minute
            expect(formatRelativeTimestamp(now - 3600000)).toBe("1 hour ago"); // 1 hour
            expect(formatRelativeTimestamp(now - 86400000)).toBe("1 day ago"); // 1 day

            // Test plural forms
            expect(formatRelativeTimestamp(now - 120000)).toBe("2 minutes ago"); // 2 minutes
            expect(formatRelativeTimestamp(now - 7200000)).toBe("2 hours ago"); // 2 hours
            expect(formatRelativeTimestamp(now - 172800000)).toBe("2 days ago"); // 2 days
        });
    });
});

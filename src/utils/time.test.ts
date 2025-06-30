/**
 * Tests for utility functions.
 */

import { describe, expect, it } from "vitest";

import { formatResponseTime } from "./time";

describe("Time Utils", () => {
    it("formats response time correctly", () => {
        expect(formatResponseTime(123)).toBe("123ms");
        expect(formatResponseTime(1500)).toBe("1.50s");
        expect(formatResponseTime(0)).toBe("0ms");
    });

    it("handles undefined response time", () => {
        expect(formatResponseTime(undefined)).toBe("N/A");
        expect(formatResponseTime()).toBe("N/A");
    });
});

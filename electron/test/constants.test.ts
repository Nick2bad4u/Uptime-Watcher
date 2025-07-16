/**
 * Tests for Electron backend constants.
 * Validates that all constants are properly exported and have expected values.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_HISTORY_LIMIT,
    DEFAULT_REQUEST_TIMEOUT,
    RETRY_BACKOFF,
    USER_AGENT,
} from "../constants";

describe("Electron Constants", () => {
    describe("Timeout Constants", () => {
        it("should export DEFAULT_REQUEST_TIMEOUT with correct value", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(10000);
            expect(typeof DEFAULT_REQUEST_TIMEOUT).toBe("number");
        });

        it("should have a reasonable timeout value", () => {
            // Should be between 5-30 seconds
            expect(DEFAULT_REQUEST_TIMEOUT).toBeGreaterThanOrEqual(5000);
            expect(DEFAULT_REQUEST_TIMEOUT).toBeLessThanOrEqual(30000);
        });
    });

    describe("Interval Constants", () => {
        it("should export DEFAULT_CHECK_INTERVAL with correct value", () => {
            expect(DEFAULT_CHECK_INTERVAL).toBe(300000); // 5 minutes
            expect(typeof DEFAULT_CHECK_INTERVAL).toBe("number");
        });

        it("should have a reasonable check interval", () => {
            // Should be between 1-30 minutes
            expect(DEFAULT_CHECK_INTERVAL).toBeGreaterThanOrEqual(60000); // 1 minute
            expect(DEFAULT_CHECK_INTERVAL).toBeLessThanOrEqual(1800000); // 30 minutes
        });
    });

    describe("User Agent", () => {
        it("should export USER_AGENT with correct format", () => {
            expect(USER_AGENT).toBe("Uptime-Watcher/1.0");
            expect(typeof USER_AGENT).toBe("string");
        });

        it("should follow standard user agent format", () => {
            expect(USER_AGENT).toMatch(/^[A-Za-z0-9-_]+\/[\d.]+$/);
        });

        it("should not be empty", () => {
            expect(USER_AGENT).not.toBe("");
            expect(USER_AGENT.length).toBeGreaterThan(0);
        });
    });

    describe("Retry Configuration", () => {
        it("should export RETRY_BACKOFF with correct structure", () => {
            expect(RETRY_BACKOFF).toEqual({
                INITIAL_DELAY: 500,
                MAX_DELAY: 5000,
            });
        });

        it("should have reasonable retry delay values", () => {
            expect(RETRY_BACKOFF.INITIAL_DELAY).toBeGreaterThan(0);
            expect(RETRY_BACKOFF.MAX_DELAY).toBeGreaterThan(RETRY_BACKOFF.INITIAL_DELAY);
            expect(RETRY_BACKOFF.MAX_DELAY).toBeLessThanOrEqual(10000); // Not more than 10 seconds
        });

        it("should be a readonly object", () => {
            // This tests the 'as const' assertion
            expect(() => {
                // @ts-expect-error - Testing immutability
                RETRY_BACKOFF.INITIAL_DELAY = 1000;
            }).toThrow();
        });
    });

    describe("History Configuration", () => {
        it("should export DEFAULT_HISTORY_LIMIT with correct value", () => {
            expect(DEFAULT_HISTORY_LIMIT).toBe(500);
            expect(typeof DEFAULT_HISTORY_LIMIT).toBe("number");
        });

        it("should have a reasonable history limit", () => {
            // Should be between 100-1000 records for good UX
            expect(DEFAULT_HISTORY_LIMIT).toBeGreaterThanOrEqual(100);
            expect(DEFAULT_HISTORY_LIMIT).toBeLessThanOrEqual(1000);
        });
    });

    describe("Constant Types", () => {
        it("should ensure all exported constants are primitives or readonly objects", () => {
            const constants = {
                DEFAULT_REQUEST_TIMEOUT,
                DEFAULT_CHECK_INTERVAL,
                USER_AGENT,
                RETRY_BACKOFF,
                DEFAULT_HISTORY_LIMIT,
            };

            Object.entries(constants).forEach(([name, value]) => {
                const type = typeof value;
                expect(
                    type === "string" || type === "number" || type === "object",
                    `Constant ${name} should be a primitive or object`
                ).toBe(true);
            });
        });
    });

    describe("Constants Integration", () => {
        it("should have timeout less than check interval", () => {
            // Request timeout should be much less than check interval
            expect(DEFAULT_REQUEST_TIMEOUT).toBeLessThan(DEFAULT_CHECK_INTERVAL);
        });

        it("should have max retry delay less than request timeout", () => {
            // Max retry delay should be less than total request timeout
            expect(RETRY_BACKOFF.MAX_DELAY).toBeLessThan(DEFAULT_REQUEST_TIMEOUT);
        });
    });
});

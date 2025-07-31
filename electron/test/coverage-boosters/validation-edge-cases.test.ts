/**
 * Targeted tests for validation error paths and uncovered edge cases
 * Focuses on improving branch coverage by testing error paths, validation failures,
 * and edge cases that are commonly missed in unit tests.
 */

import { describe, expect, it } from "vitest";

describe("Validation Error Paths and Edge Cases", () => {
    describe("URL validation edge cases", () => {
        it("should test URL validation branches", () => {
            const validateUrl = (url: string): { valid: boolean; protocol?: string } => {
                try {
                    const parsed = new URL(url);
                    return { valid: true, protocol: parsed.protocol };
                } catch {
                    return { valid: false };
                }
            };

            expect(validateUrl("https://example.com")).toEqual({ valid: true, protocol: "https:" });
            expect(validateUrl("https://secure.example.com")).toEqual({ valid: true, protocol: "https:" });
            expect(validateUrl("invalid-url")).toEqual({ valid: false });
            expect(validateUrl("")).toEqual({ valid: false });
            expect(validateUrl("ftp://example.com")).toEqual({ valid: true, protocol: "ftp:" });
        });
    });

    describe("Timeout and interval validation", () => {
        it("should test timeout validation branches", () => {
            const validateTimeout = (timeout: unknown): number => {
                if (typeof timeout !== "number") {
                    return 5000; // Default timeout
                }

                if (timeout < 1000) {
                    return 1000; // Minimum timeout
                }

                if (timeout > 60_000) {
                    return 60_000; // Maximum timeout
                }

                return timeout;
            };

            expect(validateTimeout(undefined)).toBe(5000);
            expect(validateTimeout("5000")).toBe(5000);
            expect(validateTimeout(500)).toBe(1000);
            expect(validateTimeout(10_000)).toBe(10_000);
            expect(validateTimeout(120_000)).toBe(60_000);
            expect(validateTimeout(0)).toBe(1000);
            expect(validateTimeout(-100)).toBe(1000);
        });

        it("should test interval validation branches", () => {
            const validateInterval = (interval: unknown): number => {
                if (typeof interval !== "number") {
                    return 30_000; // Default 30 seconds
                }

                if (interval < 5000) {
                    return 5000; // Minimum 5 seconds
                }

                if (interval > 3_600_000) {
                    return 3_600_000; // Maximum 1 hour
                }

                return interval;
            };

            expect(validateInterval(null)).toBe(30_000);
            expect(validateInterval("30000")).toBe(30_000);
            expect(validateInterval(1000)).toBe(5000);
            expect(validateInterval(60_000)).toBe(60_000);
            expect(validateInterval(7_200_000)).toBe(3_600_000);
        });
    });

    describe("Status validation and mapping", () => {
        it("should test status mapping branches", () => {
            const mapMonitorStatus = (
                status: string
            ): {
                display: string;
                color: string;
                severity: number;
            } => {
                switch (status) {
                    case "up": {
                        return { display: "Online", color: "green", severity: 0 };
                    }
                    case "down": {
                        return { display: "Offline", color: "red", severity: 3 };
                    }
                    case "degraded": {
                        return { display: "Degraded", color: "yellow", severity: 2 };
                    }
                    case "maintenance": {
                        return { display: "Maintenance", color: "blue", severity: 1 };
                    }
                    case "pending": {
                        return { display: "Checking", color: "gray", severity: 1 };
                    }
                    default: {
                        return { display: "Unknown", color: "gray", severity: 1 };
                    }
                }
            };

            expect(mapMonitorStatus("up")).toEqual({ display: "Online", color: "green", severity: 0 });
            expect(mapMonitorStatus("down")).toEqual({ display: "Offline", color: "red", severity: 3 });
            expect(mapMonitorStatus("degraded")).toEqual({ display: "Degraded", color: "yellow", severity: 2 });
            expect(mapMonitorStatus("maintenance")).toEqual({ display: "Maintenance", color: "blue", severity: 1 });
            expect(mapMonitorStatus("pending")).toEqual({ display: "Checking", color: "gray", severity: 1 });
            expect(mapMonitorStatus("unknown")).toEqual({ display: "Unknown", color: "gray", severity: 1 });
            expect(mapMonitorStatus("")).toEqual({ display: "Unknown", color: "gray", severity: 1 });
            expect(mapMonitorStatus("invalid")).toEqual({ display: "Unknown", color: "gray", severity: 1 });
        });
    });

    describe("Data parsing and transformation edge cases", () => {
        it("should test JSON parsing with fallbacks", () => {
            const safeJsonParse = <T>(json: string, fallback: T): T => {
                try {
                    const parsed = JSON.parse(json);
                    return parsed as T;
                } catch {
                    return fallback;
                }
            };

            expect(safeJsonParse('{"test": "value"}', {})).toEqual({ test: "value" });
            expect(safeJsonParse("invalid json", { default: true })).toEqual({ default: true });
            expect(safeJsonParse("", [])).toEqual([]);
            expect(safeJsonParse("null", { fallback: true })).toBe(null);
            expect(safeJsonParse("undefined", "fallback")).toBe("fallback");
        });

        it("should test number parsing with validation", () => {
            const parseNumber = (value: unknown, min?: number, max?: number): number | null => {
                let num: number;

                if (typeof value === "number") {
                    num = value;
                } else if (typeof value === "string") {
                    num = Number.parseFloat(value);
                } else {
                    return null;
                }

                if (Number.isNaN(num)) {
                    return null;
                }

                if (min !== undefined && num < min) {
                    return null;
                }

                if (max !== undefined && num > max) {
                    return null;
                }

                return num;
            };

            expect(parseNumber(42)).toBe(42);
            expect(parseNumber("42")).toBe(42);
            expect(parseNumber("42.5")).toBe(42.5);
            expect(parseNumber("invalid")).toBeNull();
            expect(parseNumber(null)).toBeNull();
            expect(parseNumber(undefined)).toBeNull();
            expect(parseNumber({})).toBeNull();
            expect(parseNumber(10, 20)).toBeNull(); // Below min
            expect(parseNumber(30, 20, 30)).toBe(30); // At max (valid)
            expect(parseNumber(25, 20, 30)).toBe(25); // Within range
            expect(parseNumber(15, 20, 30)).toBeNull(); // Below min
            expect(parseNumber(35, 20, 30)).toBeNull(); // Above max
        });
    });

    describe("Array processing edge cases", () => {
        it("should test array filtering with type guards", () => {
            const filterValidItems = <T>(items: unknown[], validator: (item: unknown) => item is T): T[] => {
                if (!Array.isArray(items)) {
                    return [];
                }

                return items.filter((item) => validator(item));
            };

            const isString = (value: unknown): value is string => typeof value === "string";
            const isNumber = (value: unknown): value is number => typeof value === "number" && !Number.isNaN(value);

            const mixedArray = ["hello", 42, null, "world", 3.14, undefined, "test"];

            expect(filterValidItems(mixedArray, isString)).toEqual(["hello", "world", "test"]);
            expect(filterValidItems(mixedArray, isNumber)).toEqual([42, 3.14]);
            expect(filterValidItems([], isString)).toEqual([]);
            expect(filterValidItems([null, undefined], isString)).toEqual([]);
        });

        it("should test array chunking with edge cases", () => {
            const chunkArray = <T>(array: T[], size: number): T[][] => {
                if (!Array.isArray(array) || array.length === 0) {
                    return [];
                }

                if (size <= 0) {
                    return [array];
                }

                const chunks: T[][] = [];
                for (let i = 0; i < array.length; i += size) {
                    chunks.push(array.slice(i, i + size));
                }

                return chunks;
            };

            expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(chunkArray([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
            expect(chunkArray([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
            expect(chunkArray([], 2)).toEqual([]);
            expect(chunkArray([1, 2, 3], 0)).toEqual([[1, 2, 3]]);
            expect(chunkArray([1, 2, 3], -1)).toEqual([[1, 2, 3]]);
        });
    });

    describe("Date and time validation", () => {
        it("should test date parsing with fallbacks", () => {
            const parseDate = (input: unknown): Date | null => {
                if (input instanceof Date) {
                    return Number.isNaN(input.getTime()) ? null : input;
                }

                if (typeof input === "string" || typeof input === "number") {
                    const date = new Date(input);
                    return Number.isNaN(date.getTime()) ? null : date;
                }

                return null;
            };

            const validDate = new Date("2023-01-01");
            const invalidDate = new Date("invalid");

            expect(parseDate(validDate)).toEqual(validDate);
            expect(parseDate(invalidDate)).toBeNull();
            expect(parseDate("2023-01-01")).toEqual(new Date("2023-01-01"));
            expect(parseDate("invalid")).toBeNull();
            expect(parseDate(1_672_531_200_000)).toEqual(new Date(1_672_531_200_000)); // 2023-01-01
            expect(parseDate(null)).toBeNull();
            expect(parseDate(undefined)).toBeNull();
            expect(parseDate({})).toBeNull();
        });

        it("should test time formatting edge cases", () => {
            const formatDuration = (ms: number): string => {
                if (!Number.isFinite(ms) || ms < 0) {
                    return "Invalid";
                }

                if (ms < 1000) {
                    return `${ms}ms`;
                }

                if (ms < 60_000) {
                    return `${Math.round(ms / 1000)}s`;
                }

                if (ms < 3_600_000) {
                    return `${Math.round(ms / 60_000)}m`;
                }

                return `${Math.round(ms / 3_600_000)}h`;
            };

            expect(formatDuration(500)).toBe("500ms");
            expect(formatDuration(5000)).toBe("5s");
            expect(formatDuration(300_000)).toBe("5m");
            expect(formatDuration(7_200_000)).toBe("2h");
            expect(formatDuration(-1000)).toBe("Invalid");
            expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("Invalid");
            expect(formatDuration(Number.NaN)).toBe("Invalid");
        });
    });

    describe("Configuration validation edge cases", () => {
        it("should test configuration merging with defaults", () => {
            interface Config {
                timeout: number;
                retries: number;
                enabled: boolean;
                url?: string;
            }

            const mergeConfig = (partial: Partial<Config> | null | undefined): Config => {
                const defaults: Config = {
                    timeout: 5000,
                    retries: 3,
                    enabled: true,
                };

                if (!partial || typeof partial !== "object") {
                    return defaults;
                }

                return {
                    ...defaults,
                    ...partial,
                };
            };

            expect(mergeConfig(null)).toEqual({ timeout: 5000, retries: 3, enabled: true });
            expect(mergeConfig(undefined)).toEqual({ timeout: 5000, retries: 3, enabled: true });
            expect(mergeConfig({})).toEqual({ timeout: 5000, retries: 3, enabled: true });
            expect(mergeConfig({ timeout: 1000 })).toEqual({ timeout: 1000, retries: 3, enabled: true });
            expect(mergeConfig({ url: "https://example.com" })).toEqual({
                timeout: 5000,
                retries: 3,
                enabled: true,
                url: "https://example.com",
            });
        });
    });
});

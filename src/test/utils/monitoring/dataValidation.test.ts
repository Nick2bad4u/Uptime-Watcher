/**
 * @file Comprehensive tests for monitoring data validation utilities.
 */

import { test } from "@fast-check/vitest";
import { isValidUrl } from "@shared/validation/validatorUtils";
import fc from "fast-check";
import { arrayJoin } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "../../../services/logger";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";

const alphaNumericChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
const alphaNumCharArb = fc.constantFrom(...alphaNumericChars);
const safeSegmentArb = fc
    .array(alphaNumCharArb, { maxLength: 8, minLength: 1 })
    .map((chars) => arrayJoin(chars, ""));
const safeQueryArb = fc
    .array(alphaNumCharArb, { maxLength: 6, minLength: 1 })
    .map((chars) => arrayJoin(chars, ""));
const safeHttpUrlArb = fc
    .tuple(
        fc.constantFrom("http", "https"),
        fc.domain(),
        fc.array(safeSegmentArb, { maxLength: 3 }),
        fc.option(safeQueryArb, { nil: undefined })
    )
    .map(
        ([
            scheme,
            host,
            segments,
            query,
        ]) => {
            const path =
                segments.length > 0 ? `/${arrayJoin(segments, "/")}` : "";
            const queryPart = query ? `?${query}=1` : "";
            return `${scheme}://${host}${path}${queryPart}`;
        }
    );

// Mock the logger
vi.mock("../../../services/logger", () => ({
    logger: {
        app: {
            error: vi.fn(),
            started: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        site: {
            error: vi.fn(),
            info: vi.fn(),
        },
        system: {
            error: vi.fn(),
            info: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

describe("monitoring Data Validation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(parseUptimeValue, () => {
        it("should parse valid numeric strings", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("95")).toBe(95);
            expect(parseUptimeValue("100")).toBe(100);
            expect(parseUptimeValue("0")).toBe(0);
            expect(parseUptimeValue("50.5")).toBe(50.5);
            expect(parseUptimeValue("99.99")).toBe(99.99);
        });

        it("should parse strings with percent signs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("95%")).toBe(95);
            expect(parseUptimeValue("100%")).toBe(100);
            expect(parseUptimeValue("0%")).toBe(0);
            expect(parseUptimeValue("50.5%")).toBe(50.5);
            expect(parseUptimeValue("99.99%")).toBe(99.99);
        });

        it("should parse strings with whitespace", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue(" 95 ")).toBe(95);
            expect(parseUptimeValue("\t100\t")).toBe(100);
            expect(parseUptimeValue("\n50.5\n")).toBe(50.5);
            expect(parseUptimeValue("  99.99  ")).toBe(99.99);
        });

        it("should parse strings with both percent signs and whitespace", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue(" 95% ")).toBe(95);
            expect(parseUptimeValue("\t100%\t")).toBe(100);
            expect(parseUptimeValue("\n50.5%\n")).toBe(50.5);
            expect(parseUptimeValue("  99.99%  ")).toBe(99.99);
        });

        it("should clamp values above 100", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("150")).toBe(100);
            expect(parseUptimeValue("200.5")).toBe(100);
            expect(parseUptimeValue("999%")).toBe(100);
            expect(parseUptimeValue(" 150% ")).toBe(100);
        });

        it("should clamp values below 0", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("-10")).toBe(0);
            expect(parseUptimeValue("-50.5")).toBe(0);
            expect(parseUptimeValue("-999%")).toBe(0);
            expect(parseUptimeValue(" -10% ")).toBe(0);
        });

        test.prop(
            [
                fc.float({ max: 5000, min: -5000, noNaN: true }),
                fc.boolean(),
                fc.boolean(),
            ],
            { numRuns: 75 }
        )(
            "parses numeric strings with optional percent sign and whitespace",
            (value, includePercent, includeWhitespace) => {
                let text = value.toString();
                if (includePercent) {
                    text = `${text}%`;
                }
                if (includeWhitespace) {
                    text = `\n ${text} \t`;
                }

                const parsed = parseUptimeValue(text);
                const expected = Math.max(0, Math.min(100, value));

                expect(parsed).toBeCloseTo(expected, 10);
            }
        );

        it("should return 0 for invalid numeric strings and log warning", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("invalid")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "invalid" }
            );

            vi.clearAllMocks();

            expect(parseUptimeValue("abc123")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "abc123" }
            );

            vi.clearAllMocks();

            expect(parseUptimeValue("")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "" }
            );
        });

        it("should reject partially numeric uptime strings", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const invalidValues = [
                "95abc",
                "95% uptime",
                "95%%",
                "%95",
                "9 5%",
                "95 %",
            ];

            for (const uptime of invalidValues) {
                vi.clearAllMocks();

                expect(parseUptimeValue(uptime)).toBe(0);
                expect(logger.warn).toHaveBeenCalledWith(
                    "Invalid uptime value received",
                    { uptime }
                );
            }
        });

        it("should return 0 for NaN values and log warning", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("NaN")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "NaN" }
            );

            vi.clearAllMocks();

            expect(parseUptimeValue("undefined")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "undefined" }
            );

            vi.clearAllMocks();

            expect(parseUptimeValue("Infinity")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "Infinity" }
            );

            vi.clearAllMocks();

            expect(parseUptimeValue("-Infinity")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "-Infinity" }
            );
        });

        it("should handle edge cases", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("0.0")).toBe(0);
            expect(parseUptimeValue("100.0")).toBe(100);
            expect(parseUptimeValue("0.1")).toBe(0.1);
            expect(parseUptimeValue("99.9")).toBe(99.9);
        });

        it("should handle scientific notation", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("1e2")).toBe(100); // 100
            expect(parseUptimeValue("5e1")).toBe(50); // 50
            expect(parseUptimeValue("1e3")).toBe(100); // 1000, clamped to 100
        });
    });

    describe(isValidUrl, () => {
        it("should return true for valid HTTPS URLs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://www.example.com")).toBe(true);
            expect(isValidUrl("https://example.com:443")).toBe(true);
            expect(isValidUrl("https://example.com/path")).toBe(true);
            expect(isValidUrl("https://example.com/path?query=value")).toBe(
                true
            );
            expect(isValidUrl("https://example.com#anchor")).toBe(true);
        });

        it("should return true for valid HTTP/HTTPS URLs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Validator.js only accepts HTTP/HTTPS protocols by default
            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://localhost")).toBe(true);
            expect(isValidUrl("http://localhost:3000")).toBe(true);
        });

        it("should handle different URL schemes per validator.js behavior", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Our validation rejects FTP protocol - only HTTP/HTTPS allowed
            expect(isValidUrl("ftp://example.com")).toBe(false);
            // Validator.js rejects these protocols by default
            expect(isValidUrl("file:///path/to/file")).toBe(false);
            expect(isValidUrl("mailto:test@example.com")).toBe(false);
            expect(isValidUrl("tel:+1234567890")).toBe(false);
        });

        it("should return false for invalid URLs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("example.com")).toBe(false); // Missing protocol
            expect(isValidUrl("://example.com")).toBe(false); // Missing scheme
            expect(isValidUrl("")).toBe(false);
        });

        it("should return false for null, undefined, and non-string inputs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl(null)).toBe(false);
            expect(isValidUrl(undefined)).toBe(false);
            expect(isValidUrl(123)).toBe(false);
            expect(isValidUrl({})).toBe(false);
            expect(isValidUrl([])).toBe(false);
            expect(isValidUrl(true)).toBe(false);
        });

        it("should handle edge cases and malformed URLs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://")).toBe(false);
            expect(isValidUrl("https:///")).toBe(false);
            expect(isValidUrl("https://[")).toBe(false);
            expect(isValidUrl("https://]")).toBe(false);
            // Validator.js rejects URLs with double dots for security
            expect(isValidUrl("https://example..com")).toBe(false);
        });

        it("should handle special characters in URLs", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Validator.js rejects URLs with unencoded spaces for security
            expect(isValidUrl("https://example.com/path with spaces")).toBe(
                false
            );
            expect(
                isValidUrl("https://example.com/path%20with%20encoded%20spaces")
            ).toBe(true);
            expect(
                isValidUrl("https://example.com/path?param=value&other=test")
            ).toBe(true);
        });

        test.prop([safeHttpUrlArb], { numRuns: 50 })(
            "returns true for any http/https URL with limited safe characters",
            (url) => {
                expect(isValidUrl(url)).toBe(true);
            }
        );

        test.prop([fc.domain()], { numRuns: 30 })(
            "returns false for inputs missing a scheme",
            (domain) => {
                expect(isValidUrl(domain)).toBe(false);
                expect(isValidUrl(`${domain}/path`)).toBe(false);
            }
        );
    });

    describe("integration tests", () => {
        it("should work together for URL processing workflow", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            const urls = [
                "https://example.com",
                "invalid-url",
                "https://test.com:8080/path",
            ];

            const results = urls.map((url) => ({
                isValid: isValidUrl(url),
                url,
            }));

            expect(results).toEqual([
                {
                    isValid: true,
                    url: "https://example.com",
                },
                { isValid: false, url: "invalid-url" },
                {
                    isValid: true,
                    url: "https://test.com:8080/path",
                },
            ]);
        });

        it("should handle monitoring data validation workflow", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const monitoringData = [
                { uptime: "95.5%", url: "https://example.com" },
                { uptime: "invalid", url: "not-a-url" },
                { uptime: " 100% ", url: "https://test.com" },
            ];

            const processed = monitoringData.map((data) => ({
                isValidUrl: isValidUrl(data.url),
                uptimeValue: parseUptimeValue(data.uptime),
            }));

            expect(processed).toEqual([
                {
                    isValidUrl: true,
                    uptimeValue: 95.5,
                },
                { isValidUrl: false, uptimeValue: 0 },
                { isValidUrl: true, uptimeValue: 100 },
            ]);

            // Should have logged warning for invalid uptime
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "invalid" }
            );
        });
    });
});

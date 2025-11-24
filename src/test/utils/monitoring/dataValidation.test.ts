/**
 * @file Comprehensive tests for monitoring data validation utilities Tests
 *   parseUptimeValue and safeGetHostname functions for 100% coverage
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";
import { isValidUrl } from "@shared/validation/validatorUtils";
import {
    parseUptimeValue,
    safeGetHostname,
} from "../../../utils/monitoring/dataValidation";
import { logger } from "../../../services/logger";

const alphaNumericChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
const alphaNumCharArb = fc.constantFrom(...alphaNumericChars.split(""));
const safeSegmentArb = fc
    .array(alphaNumCharArb, { minLength: 1, maxLength: 8 })
    .map((chars) => chars.join(""));
const safeQueryArb = fc
    .array(alphaNumCharArb, { minLength: 1, maxLength: 6 })
    .map((chars) => chars.join(""));
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
            const path = segments.length > 0 ? `/${segments.join("/")}` : "";
            const queryPart = query ? `?${query}=1` : "";
            return `${scheme}://${host}${path}${queryPart}`;
        }
    );

// Mock the logger
vi.mock("../../../services/logger", () => ({
    logger: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        app: {
            started: vi.fn(),
            error: vi.fn(),
        },
        site: {
            error: vi.fn(),
            info: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
        system: {
            error: vi.fn(),
            info: vi.fn(),
        },
    },
}));

describe("Monitoring Data Validation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(parseUptimeValue, () => {
        it("should parse valid numeric strings", async ({ task, annotate }) => {
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
            task,
            annotate,
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
            task,
            annotate,
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
            task,
            annotate,
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

        it("should clamp values above 100", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("150")).toBe(100);
            expect(parseUptimeValue("200.5")).toBe(100);
            expect(parseUptimeValue("999%")).toBe(100);
            expect(parseUptimeValue(" 150% ")).toBe(100);
        });

        it("should clamp values below 0", async ({ task, annotate }) => {
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
                fc.float({ min: -5000, max: 5000, noNaN: true }),
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
            task,
            annotate,
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

        it("should return 0 for NaN values and log warning", async ({
            task,
            annotate,
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
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(parseUptimeValue("0.0")).toBe(0);
            expect(parseUptimeValue("100.0")).toBe(100);
            expect(parseUptimeValue("0.1")).toBe(0.1);
            expect(parseUptimeValue("99.9")).toBe(99.9);
        });

        it("should handle scientific notation", async ({ task, annotate }) => {
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://example.com")).toBeTruthy();
            expect(isValidUrl("https://www.example.com")).toBeTruthy();
            expect(isValidUrl("https://example.com:443")).toBeTruthy();
            expect(isValidUrl("https://example.com/path")).toBeTruthy();
            expect(
                isValidUrl("https://example.com/path?query=value")
            ).toBeTruthy();
            expect(isValidUrl("https://example.com#anchor")).toBeTruthy();
        });

        it("should return true for valid HTTP/HTTPS URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Validator.js only accepts HTTP/HTTPS protocols by default
            expect(isValidUrl("https://example.com")).toBeTruthy();
            expect(isValidUrl("http://example.com")).toBeTruthy();
            expect(isValidUrl("https://localhost")).toBeTruthy();
            expect(isValidUrl("http://localhost:3000")).toBeTruthy();
        });

        it("should handle different URL schemes per validator.js behavior", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Our validation rejects FTP protocol - only HTTP/HTTPS allowed
            expect(isValidUrl("ftp://example.com")).toBeFalsy();
            // Validator.js rejects these protocols by default
            expect(isValidUrl("file:///path/to/file")).toBeFalsy();
            expect(isValidUrl("mailto:test@example.com")).toBeFalsy();
            expect(isValidUrl("tel:+1234567890")).toBeFalsy();
        });

        it("should return false for invalid URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("not-a-url")).toBeFalsy();
            expect(isValidUrl("example.com")).toBeFalsy(); // Missing protocol
            expect(isValidUrl("://example.com")).toBeFalsy(); // Missing scheme
            expect(isValidUrl("")).toBeFalsy();
        });

        it("should return false for null, undefined, and non-string inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl(null as any)).toBeFalsy();
            expect(isValidUrl(undefined as any)).toBeFalsy();
            expect(isValidUrl(123 as any)).toBeFalsy();
            expect(isValidUrl({} as any)).toBeFalsy();
            expect(isValidUrl([] as any)).toBeFalsy();
            expect(isValidUrl(true as any)).toBeFalsy();
        });

        it("should handle edge cases and malformed URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidUrl("https://")).toBeFalsy();
            expect(isValidUrl("https:///")).toBeFalsy();
            expect(isValidUrl("https://[")).toBeFalsy();
            expect(isValidUrl("https://]")).toBeFalsy();
            // Validator.js rejects URLs with double dots for security
            expect(isValidUrl("https://example..com")).toBeFalsy();
        });

        it("should handle special characters in URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Validator.js rejects URLs with unencoded spaces for security
            expect(
                isValidUrl("https://example.com/path with spaces")
            ).toBeFalsy();
            expect(
                isValidUrl("https://example.com/path%20with%20encoded%20spaces")
            ).toBeTruthy();
            expect(
                isValidUrl("https://example.com/path?param=value&other=test")
            ).toBeTruthy();
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

    describe(safeGetHostname, () => {
        it("should extract hostname from valid HTTPS URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname("https://example.com")).toBe("example.com");
            expect(safeGetHostname("https://www.example.com")).toBe(
                "www.example.com"
            );
            expect(safeGetHostname("https://sub.example.com")).toBe(
                "sub.example.com"
            );
            expect(safeGetHostname("https://example.com:443")).toBe(
                "example.com"
            );
        });

        it("should extract hostname from URLs with paths and queries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname("https://example.com/path")).toBe(
                "example.com"
            );
            expect(
                safeGetHostname("https://example.com/path/to/resource")
            ).toBe("example.com");
            expect(
                safeGetHostname("https://example.com/path?query=value")
            ).toBe("example.com");
            expect(
                safeGetHostname(
                    "https://example.com/path?query=value&other=test"
                )
            ).toBe("example.com");
            expect(safeGetHostname("https://example.com/path#anchor")).toBe(
                "example.com"
            );
        });

        it("should return empty string for invalid URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname("not-a-url")).toBe("");
            expect(safeGetHostname("example.com")).toBe(""); // Missing protocol
            expect(safeGetHostname("://example.com")).toBe(""); // Missing scheme
            expect(safeGetHostname("")).toBe("");
        });

        it("should return empty string for null, undefined, and non-string inputs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname(null as any)).toBe("");
            expect(safeGetHostname(undefined as any)).toBe("");
            expect(safeGetHostname(123 as any)).toBe("");
            expect(safeGetHostname({} as any)).toBe("");
            expect(safeGetHostname([] as any)).toBe("");
            expect(safeGetHostname(true as any)).toBe("");
        });

        it("should handle edge cases and malformed URLs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname("https://[")).toBe("");
            expect(safeGetHostname("https://]")).toBe("");
            // Since validator.js now rejects "https://example..com", hostname extraction returns empty
            expect(safeGetHostname("https://example..com")).toBe("");
        });

        it("should handle URLs with special hostnames", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(safeGetHostname("https://localhost")).toBe("localhost");
            expect(safeGetHostname("https://127.0.0.1")).toBe("127.0.0.1");
            expect(safeGetHostname("https://192.168.1.1")).toBe("192.168.1.1");
            expect(safeGetHostname("https://[::1]")).toBe("[::1]"); // IPv6
        });

        it("should use isValidUrl internally", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: dataValidation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that it relies on isValidUrl validation
            expect(safeGetHostname("invalid-url")).toBe("");
            expect(safeGetHostname("")).toBe("");
        });

        test.prop([safeHttpUrlArb], { numRuns: 50 })(
            "matches URL.hostname for any valid http/https URL",
            (url) => {
                expect(safeGetHostname(url)).toBe(new URL(url).hostname);
            }
        );

        test.prop([fc.domain()], { numRuns: 30 })(
            "returns empty string for scheme-less domain strings",
            (domain) => {
                expect(safeGetHostname(domain)).toBe("");
            }
        );
    });

    describe("Integration tests", () => {
        it("should work together for URL processing workflow", async ({
            task,
            annotate,
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
                url,
                isValid: isValidUrl(url),
                hostname: safeGetHostname(url),
            }));

            expect(results).toEqual([
                {
                    url: "https://example.com",
                    isValid: true,
                    hostname: "example.com",
                },
                { url: "invalid-url", isValid: false, hostname: "" },
                {
                    url: "https://test.com:8080/path",
                    isValid: true,
                    hostname: "test.com",
                },
            ]);
        });

        it("should handle monitoring data validation workflow", async ({
            task,
            annotate,
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
                uptimeValue: parseUptimeValue(data.uptime),
                isValidUrl: isValidUrl(data.url),
                hostname: safeGetHostname(data.url),
            }));

            expect(processed).toEqual([
                {
                    uptimeValue: 95.5,
                    isValidUrl: true,
                    hostname: "example.com",
                },
                { uptimeValue: 0, isValidUrl: false, hostname: "" },
                { uptimeValue: 100, isValidUrl: true, hostname: "test.com" },
            ]);

            // Should have logged warning for invalid uptime
            expect(logger.warn).toHaveBeenCalledWith(
                "Invalid uptime value received",
                { uptime: "invalid" }
            );
        });
    });
});

/**
 * @fileoverview Comprehensive tests for monitoring data validation utilities
 * Tests parseUptimeValue, isValidUrl, and safeGetHostname functions for 100% coverage
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseUptimeValue, isValidUrl, safeGetHostname } from "../../../utils/monitoring/dataValidation";
import logger from "../../../services/logger";

// Mock the logger
vi.mock("../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("Monitoring Data Validation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("parseUptimeValue", () => {
        it("should parse valid numeric strings", () => {
            expect(parseUptimeValue("95")).toBe(95);
            expect(parseUptimeValue("100")).toBe(100);
            expect(parseUptimeValue("0")).toBe(0);
            expect(parseUptimeValue("50.5")).toBe(50.5);
            expect(parseUptimeValue("99.99")).toBe(99.99);
        });

        it("should parse strings with percent signs", () => {
            expect(parseUptimeValue("95%")).toBe(95);
            expect(parseUptimeValue("100%")).toBe(100);
            expect(parseUptimeValue("0%")).toBe(0);
            expect(parseUptimeValue("50.5%")).toBe(50.5);
            expect(parseUptimeValue("99.99%")).toBe(99.99);
        });

        it("should parse strings with whitespace", () => {
            expect(parseUptimeValue(" 95 ")).toBe(95);
            expect(parseUptimeValue("\t100\t")).toBe(100);
            expect(parseUptimeValue("\n50.5\n")).toBe(50.5);
            expect(parseUptimeValue("  99.99  ")).toBe(99.99);
        });

        it("should parse strings with both percent signs and whitespace", () => {
            expect(parseUptimeValue(" 95% ")).toBe(95);
            expect(parseUptimeValue("\t100%\t")).toBe(100);
            expect(parseUptimeValue("\n50.5%\n")).toBe(50.5);
            expect(parseUptimeValue("  99.99%  ")).toBe(99.99);
        });

        it("should clamp values above 100", () => {
            expect(parseUptimeValue("150")).toBe(100);
            expect(parseUptimeValue("200.5")).toBe(100);
            expect(parseUptimeValue("999%")).toBe(100);
            expect(parseUptimeValue(" 150% ")).toBe(100);
        });

        it("should clamp values below 0", () => {
            expect(parseUptimeValue("-10")).toBe(0);
            expect(parseUptimeValue("-50.5")).toBe(0);
            expect(parseUptimeValue("-999%")).toBe(0);
            expect(parseUptimeValue(" -10% ")).toBe(0);
        });

        it("should return 0 for invalid numeric strings and log warning", () => {
            expect(parseUptimeValue("invalid")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "invalid" });

            vi.clearAllMocks();
            expect(parseUptimeValue("abc123")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "abc123" });

            vi.clearAllMocks();
            expect(parseUptimeValue("")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "" });
        });

        it("should return 0 for NaN values and log warning", () => {
            expect(parseUptimeValue("NaN")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "NaN" });

            vi.clearAllMocks();
            expect(parseUptimeValue("undefined")).toBe(0);
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "undefined" });
        });

        it("should handle edge cases", () => {
            expect(parseUptimeValue("0.0")).toBe(0);
            expect(parseUptimeValue("100.0")).toBe(100);
            expect(parseUptimeValue("0.1")).toBe(0.1);
            expect(parseUptimeValue("99.9")).toBe(99.9);
        });

        it("should handle scientific notation", () => {
            expect(parseUptimeValue("1e2")).toBe(100); // 100
            expect(parseUptimeValue("5e1")).toBe(50);  // 50
            expect(parseUptimeValue("1e3")).toBe(100); // 1000, clamped to 100
        });
    });

    describe("isValidUrl", () => {
        it("should return true for valid HTTPS URLs", () => {
            expect(isValidUrl("https://example.com")).toBe(true);
            expect(isValidUrl("https://www.example.com")).toBe(true);
            expect(isValidUrl("https://example.com:443")).toBe(true);
            expect(isValidUrl("https://example.com/path")).toBe(true);
            expect(isValidUrl("https://example.com/path?query=value")).toBe(true);
            expect(isValidUrl("https://example.com#anchor")).toBe(true);
        });

        it("should return true for other valid URL schemes", () => {
            expect(isValidUrl("ftp://example.com")).toBe(true);
            expect(isValidUrl("file:///path/to/file")).toBe(true);
            expect(isValidUrl("mailto:test@example.com")).toBe(true);
            expect(isValidUrl("tel:+1234567890")).toBe(true);
        });

        it("should return false for invalid URLs", () => {
            expect(isValidUrl("not-a-url")).toBe(false);
            expect(isValidUrl("example.com")).toBe(false); // missing protocol
            expect(isValidUrl("://example.com")).toBe(false); // missing scheme
            expect(isValidUrl("")).toBe(false);
        });

        it("should return false for null, undefined, and non-string inputs", () => {
            expect(isValidUrl(null as any)).toBe(false);
            expect(isValidUrl(undefined as any)).toBe(false);
            expect(isValidUrl(123 as any)).toBe(false);
            expect(isValidUrl({} as any)).toBe(false);
            expect(isValidUrl([] as any)).toBe(false);
            expect(isValidUrl(true as any)).toBe(false);
        });

        it("should handle edge cases and malformed URLs", () => {
            expect(isValidUrl("https://")).toBe(false);
            expect(isValidUrl("https:///")).toBe(false);
            expect(isValidUrl("https://[")).toBe(false);
            expect(isValidUrl("https://]")).toBe(false);
            // Note: "https://example..com" is considered valid by URL constructor
            expect(isValidUrl("https://example..com")).toBe(true);
        });

        it("should handle special characters in URLs", () => {
            // Note: URLs with spaces are actually considered valid by URL constructor
            expect(isValidUrl("https://example.com/path with spaces")).toBe(true);
            expect(isValidUrl("https://example.com/path%20with%20encoded%20spaces")).toBe(true);
            expect(isValidUrl("https://example.com/path?param=value&other=test")).toBe(true);
        });
    });

    describe("safeGetHostname", () => {
        it("should extract hostname from valid HTTPS URLs", () => {
            expect(safeGetHostname("https://example.com")).toBe("example.com");
            expect(safeGetHostname("https://www.example.com")).toBe("www.example.com");
            expect(safeGetHostname("https://sub.example.com")).toBe("sub.example.com");
            expect(safeGetHostname("https://example.com:443")).toBe("example.com");
        });

        it("should extract hostname from URLs with paths and queries", () => {
            expect(safeGetHostname("https://example.com/path")).toBe("example.com");
            expect(safeGetHostname("https://example.com/path/to/resource")).toBe("example.com");
            expect(safeGetHostname("https://example.com/path?query=value")).toBe("example.com");
            expect(safeGetHostname("https://example.com/path?query=value&other=test")).toBe("example.com");
            expect(safeGetHostname("https://example.com/path#anchor")).toBe("example.com");
        });

        it("should return empty string for invalid URLs", () => {
            expect(safeGetHostname("not-a-url")).toBe("");
            expect(safeGetHostname("example.com")).toBe(""); // missing protocol
            expect(safeGetHostname("://example.com")).toBe(""); // missing scheme
            expect(safeGetHostname("")).toBe("");
        });

        it("should return empty string for null, undefined, and non-string inputs", () => {
            expect(safeGetHostname(null as any)).toBe("");
            expect(safeGetHostname(undefined as any)).toBe("");
            expect(safeGetHostname(123 as any)).toBe("");
            expect(safeGetHostname({} as any)).toBe("");
            expect(safeGetHostname([] as any)).toBe("");
            expect(safeGetHostname(true as any)).toBe("");
        });

        it("should handle edge cases and malformed URLs", () => {
            expect(safeGetHostname("https://[")).toBe("");
            expect(safeGetHostname("https://]")).toBe("");
            // Note: "https://example..com" is valid to URL constructor and returns hostname
            expect(safeGetHostname("https://example..com")).toBe("example..com");
        });

        it("should handle URLs with special hostnames", () => {
            expect(safeGetHostname("https://localhost")).toBe("localhost");
            expect(safeGetHostname("https://127.0.0.1")).toBe("127.0.0.1");
            expect(safeGetHostname("https://192.168.1.1")).toBe("192.168.1.1");
            expect(safeGetHostname("https://[::1]")).toBe("[::1]"); // IPv6
        });

        it("should use isValidUrl internally", () => {
            // Test that it relies on isValidUrl validation
            expect(safeGetHostname("invalid-url")).toBe("");
            expect(safeGetHostname("")).toBe("");
        });
    });

    describe("Integration tests", () => {
        it("should work together for URL processing workflow", () => {
            const urls = [
                "https://example.com",
                "invalid-url",
                "https://test.com:8080/path"
            ];

            const results = urls.map(url => ({
                url,
                isValid: isValidUrl(url),
                hostname: safeGetHostname(url)
            }));

            expect(results).toEqual([
                { url: "https://example.com", isValid: true, hostname: "example.com" },
                { url: "invalid-url", isValid: false, hostname: "" },
                { url: "https://test.com:8080/path", isValid: true, hostname: "test.com" }
            ]);
        });

        it("should handle monitoring data validation workflow", () => {
            const monitoringData = [
                { uptime: "95.5%", url: "https://example.com" },
                { uptime: "invalid", url: "not-a-url" },
                { uptime: " 100% ", url: "https://test.com" }
            ];

            const processed = monitoringData.map(data => ({
                uptimeValue: parseUptimeValue(data.uptime),
                isValidUrl: isValidUrl(data.url),
                hostname: safeGetHostname(data.url)
            }));

            expect(processed).toEqual([
                { uptimeValue: 95.5, isValidUrl: true, hostname: "example.com" },
                { uptimeValue: 0, isValidUrl: false, hostname: "" },
                { uptimeValue: 100, isValidUrl: true, hostname: "test.com" }
            ]);

            // Should have logged warning for invalid uptime
            expect(logger.warn).toHaveBeenCalledWith("Invalid uptime value received", { uptime: "invalid" });
        });
    });
});

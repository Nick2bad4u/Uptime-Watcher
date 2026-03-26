/**
 * Uses fast-check to systematically test status formatting, icon mapping, and
 * identifier generation across all possible string inputs and edge cases.
 * Validates string transformation properties, emoji mapping consistency, and
 * camelCase conversion accuracy.
 *
 * @file Comprehensive property-based tests for status utilities
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-05
 */

import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

import {
    getStatusIcon,
    formatStatusWithIcon,
    createStatusIdentifier,
    type StatusIdentifier,
    type StatusWithIcon,
} from "../../utils/status";

describe("Status Utils Property-Based Tests", () => {
    /**
     * Custom arbitraries for testing status values
     */
    const knownStatusValues = fc.oneof(
        fc.constant("down"),
        fc.constant("mixed"),
        fc.constant("paused"),
        fc.constant("pending"),
        fc.constant("unknown"),
        fc.constant("up")
    );

    const statusVariations = fc.oneof(
        knownStatusValues,
        fc.string({ minLength: 1, maxLength: 20 }), // Random strings
        fc.oneof(
            fc.constant("DOWN"), // Uppercase variations
            fc.constant("Up"),
            fc.constant("MiXeD"),
            fc.constant("PENDING")
        )
    );

    const multiWordStatuses = fc.oneof(
        fc.constant("service down"),
        fc.constant("network error"),
        fc.constant("monitor status check"),
        fc.constant("connection-timeout"),
        fc.constant("ssl_certificate_expired"),
        fc.constant("DNS RESOLUTION FAILED")
    );

    describe(getStatusIcon, () => {
        test.prop([knownStatusValues])(
            "should return correct emoji for known status values",
            (status) => {
                const icon = getStatusIcon(status);

                switch (status) {
                    case "down": {
                        expect(icon).toBe("❌");
                        break;
                    }
                    case "mixed": {
                        expect(icon).toBe("🔄");
                        break;
                    }
                    case "paused": {
                        expect(icon).toBe("⏸️");
                        break;
                    }
                    case "pending": {
                        expect(icon).toBe("⏳");
                        break;
                    }
                    case "unknown": {
                        expect(icon).toBe("❓");
                        break;
                    }
                    case "up": {
                        expect(icon).toBe("✅");
                        break;
                    }
                }
            }
        );

        test.prop([
            fc.oneof(
                fc.constant("DOWN"),
                fc.constant("Up"),
                fc.constant("MiXeD")
            ),
        ])(
            "should be case-insensitive for known status values",
            (caseVariation) => {
                const icon = getStatusIcon(caseVariation);
                const lowerCaseIcon = getStatusIcon(
                    caseVariation.toLowerCase()
                );
                expect(icon).toBe(lowerCaseIcon);
            }
        );

        test.prop([
            fc.string().filter(
                (s) =>
                    ![
                        "down",
                        "mixed",
                        "paused",
                        "pending",
                        "unknown",
                        "up",
                    ].includes(s.toLowerCase())
            ),
        ])(
            "should return default emoji for unknown status values",
            (unknownStatus) => {
                const icon = getStatusIcon(unknownStatus);
                expect(icon).toBe("⚪");
            }
        );

        test.prop([fc.string()])(
            "should always return a non-empty string",
            (anyStatus) => {
                const icon = getStatusIcon(anyStatus);
                expect(typeof icon).toBe("string");
                expect(icon.length).toBeGreaterThan(0);
            }
        );

        test.prop([fc.string()])(
            "should return one of the expected emoji values",
            (anyStatus) => {
                const icon = getStatusIcon(anyStatus);
                const validIcons = [
                    "❌",
                    "🔄",
                    "⏸️",
                    "⏳",
                    "❓",
                    "✅",
                    "⚪",
                ];
                expect(validIcons).toContain(icon);
            }
        );

        test("should handle empty string", () => {
            expect(getStatusIcon("")).toBe("⚪");
        });

        test("should handle whitespace-only strings", () => {
            expect(getStatusIcon("   ")).toBe("⚪");
            expect(getStatusIcon("\t")).toBe("⚪");
            expect(getStatusIcon("\n")).toBe("⚪");
        });
    });

    describe(formatStatusWithIcon, () => {
        test.prop([knownStatusValues])(
            "should format known status values correctly",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const icon = getStatusIcon(status);
                const expectedText =
                    status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase();
                expect(formatted).toBe(`${icon} ${expectedText}`);
            }
        );

        test.prop([fc.string({ minLength: 1 })])(
            "should always include icon and capitalized text",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const parts = formatted.split(" ");

                expect(parts.length).toBeGreaterThanOrEqual(2);
                expect(parts[0]).toBe(getStatusIcon(status)); // First part should be icon

                // Remaining parts should form the capitalized text
                const textPart = parts.slice(1).join(" ");
                expect(textPart).toBeTruthy();
                expect(textPart.charAt(0)).toBe(
                    textPart.charAt(0).toUpperCase()
                );
            }
        );

        test.prop([fc.string({ minLength: 1 })])(
            "should preserve original status length in text part",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const textPart = formatted.split(" ").slice(1).join(" ");
                expect(textPart).toHaveLength(status.length);
            }
        );

        test.prop([statusVariations])(
            "should be consistent with getStatusIcon",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const expectedIcon = getStatusIcon(status);
                expect(formatted.startsWith(expectedIcon)).toBeTruthy();
            }
        );

        test("should handle single character status", () => {
            const formatted: StatusWithIcon = formatStatusWithIcon("a");
            expect(formatted).toMatch(/^.+ A$/);
        });

        test("should handle mixed case input", () => {
            const formatted: StatusWithIcon = formatStatusWithIcon("tEsT");
            expect(formatted).toMatch(/^.+ Test$/);
        });
    });

    describe(createStatusIdentifier, () => {
        test.prop([
            fc
                .string({ minLength: 1, maxLength: 50 })
                .filter((s) => s.trim().length > 0),
        ])("should always return a string", (statusText) => {
            const identifier: StatusIdentifier =
                createStatusIdentifier(statusText);
            expect(typeof identifier).toBe("string");
        });

        test.prop([multiWordStatuses])(
            "should convert multi-word statuses to camelCase",
            (statusText) => {
                const identifier: StatusIdentifier =
                    createStatusIdentifier(statusText);

                // Should not contain spaces, hyphens, or underscores
                expect(identifier).not.toMatch(/[\s_-]/);

                // Should start with lowercase letter
                expect(identifier.charAt(0)).toBe(
                    identifier.charAt(0).toLowerCase()
                );

                // Should be non-empty
                expect(identifier.length).toBeGreaterThan(0);
            }
        );

        test("should handle known test cases correctly", () => {
            expect(createStatusIdentifier("service down")).toBe("serviceDown");
            expect(createStatusIdentifier("network error")).toBe(
                "networkError"
            );
            expect(createStatusIdentifier("monitor status check")).toBe(
                "monitorStatusCheck"
            );
            expect(createStatusIdentifier("connection-timeout")).toBe(
                "connectionTimeout"
            );
            expect(createStatusIdentifier("ssl_certificate_expired")).toBe(
                "sslCertificateExpired"
            );
        });

        test.prop([
            fc.string({ minLength: 1 }).filter((s) => !/[\s_-]/.test(s)),
        ])("should handle single word inputs correctly", (singleWord) => {
            const identifier: StatusIdentifier =
                createStatusIdentifier(singleWord);
            expect(identifier).toBe(singleWord.toLowerCase());
        });

        test.prop([
            fc.array(
                fc
                    .string({ minLength: 1, maxLength: 10 })
                    .filter((s) => /^[A-Za-z]+$/.test(s)),
                { minLength: 2, maxLength: 5 }
            ),
        ])("should create valid camelCase from word arrays", (words) => {
            const statusText = words.join(" ");
            const identifier: StatusIdentifier =
                createStatusIdentifier(statusText);

            // Should not be empty
            expect(identifier.length).toBeGreaterThan(0);

            // Should start with lowercase
            expect(identifier.charAt(0)).toBe(
                identifier.charAt(0).toLowerCase()
            );

            // Should contain no spaces
            expect(identifier).not.toContain(" ");

            // Should have internal capital letters (camelCase pattern) for multiple alphabetic words
            if (words.length > 1) {
                // At least one uppercase letter should exist beyond the first character
                expect(identifier.slice(1)).toMatch(/[A-Z]/);
            }
        });

        test.prop([
            fc
                .string()
                .filter(
                    (s) => s.includes(" ") || s.includes("-") || s.includes("_")
                ),
        ])("should handle various delimiters consistently", (statusText) => {
            const identifier: StatusIdentifier =
                createStatusIdentifier(statusText);

            // Result should not contain original delimiters
            expect(identifier).not.toMatch(/[\s_-]/);

            // Should be non-empty if original had non-whitespace content
            if (statusText.replaceAll(/[\s_-]/g, "").length > 0) {
                expect(identifier.length).toBeGreaterThan(0);
            }
        });

        test("should handle edge cases", () => {
            expect(createStatusIdentifier("a")).toBe("a");
            expect(createStatusIdentifier("A")).toBe("a");
            expect(createStatusIdentifier("a b")).toBe("aB");
            expect(createStatusIdentifier("A B")).toBe("aB");
        });

        test("should handle multiple consecutive delimiters", () => {
            expect(createStatusIdentifier("test   multiple    spaces")).toBe(
                "testMultipleSpaces"
            );
            expect(createStatusIdentifier("test---hyphens")).toBe(
                "testHyphens"
            );
            expect(createStatusIdentifier("test___underscores")).toBe(
                "testUnderscores"
            );
        });
    });

    describe("Invariant properties", () => {
        test.prop([fc.string()])(
            "getStatusIcon should be deterministic",
            (status) => {
                const icon1 = getStatusIcon(status);
                const icon2 = getStatusIcon(status);
                expect(icon1).toBe(icon2);
            }
        );

        test.prop([fc.string()])(
            "formatStatusWithIcon should include correct icon",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const expectedIcon = getStatusIcon(status);
                expect(formatted.startsWith(expectedIcon)).toBeTruthy();
            }
        );

        test.prop([fc.string({ minLength: 1 })])(
            "formatStatusWithIcon should preserve content length relationship",
            (status) => {
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                // Format is "{icon} {text}" where text has same length as status
                // So formatted length should be icon length + 1 (space) + status length
                const iconLength = getStatusIcon(status).length;
                expect(formatted).toHaveLength(iconLength + 1 + status.length);
            }
        );

        test.prop([fc.string().filter((s) => s.trim().length > 0)])(
            "createStatusIdentifier should be idempotent for single words",
            (word) => {
                // Skip multi-word inputs for this test
                fc.pre(!/[\s_-]/.test(word));

                const identifier1: StatusIdentifier =
                    createStatusIdentifier(word);
                const identifier2: StatusIdentifier =
                    createStatusIdentifier(identifier1);
                expect(identifier1).toBe(identifier2);
            }
        );

        test.prop([knownStatusValues])(
            "all utilities should handle known status values consistently",
            (status) => {
                const icon = getStatusIcon(status);
                const formatted: StatusWithIcon = formatStatusWithIcon(status);
                const identifier: StatusIdentifier =
                    createStatusIdentifier(status);

                // Icon should be one of the expected values
                expect([
                    "❌",
                    "🔄",
                    "⏸️",
                    "⏳",
                    "❓",
                    "✅",
                ]).toContain(icon);

                // Formatted should start with the same icon
                expect(formatted.startsWith(icon)).toBeTruthy();

                // Identifier should be the same as the original (since they're single words)
                expect(identifier).toBe(status);
            }
        );
    });

    describe("Integration and edge cases", () => {
        test("should handle null-like inputs gracefully", () => {
            // These test what happens with various falsy/edge case inputs
            expect(() => getStatusIcon("")).not.toThrow();
            expect(() => formatStatusWithIcon("a")).not.toThrow();
            expect(() => createStatusIdentifier("a")).not.toThrow();
        });

        test.prop([fc.string().filter((s) => s.length <= 100)])(
            "should handle reasonable length inputs efficiently",
            (status) => {
                const startTime = performance.now();

                getStatusIcon(status);
                formatStatusWithIcon(status);
                if (status.trim().length > 0) {
                    createStatusIdentifier(status);
                }

                const endTime = performance.now();
                // Should complete in reasonable time (less than 10ms for property-based testing)
                expect(endTime - startTime).toBeLessThan(10);
            }
        );

        test("should handle unicode and special characters", () => {
            expect(() => getStatusIcon("测试")).not.toThrow();
            expect(() => formatStatusWithIcon("🚀 status")).not.toThrow();
            expect(() =>
                createStatusIdentifier("test-émoji_status")
            ).not.toThrow();

            // Results should still be valid
            expect(getStatusIcon("测试")).toBe("⚪");
            expect(formatStatusWithIcon("🚀").startsWith("⚪")).toBeTruthy();

            const identifier: StatusIdentifier =
                createStatusIdentifier("test-émoji_status");
            expect(identifier).not.toMatch(/[\s_-]/);
        });
    });
});

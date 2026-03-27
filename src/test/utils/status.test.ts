/**
 * Comprehensive tests for status utility functions. Tests formatting and icon
 * selection for all status types.
 *
 * @remarks
 * Enhanced with fast-check property-based testing to systematically explore
 * edge cases and validate invariants across all status utility functions.
 */

import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
    formatStatusWithIcon,
    getStatusIcon,
    createStatusIdentifier,
    type StatusIdentifier,
    type StatusWithIcon,
} from "../../utils/status";

describe("Status Utilities", () => {
    describe(getStatusIcon, () => {
        describe("Standard status icons", () => {
            it("should return down icon for 'down' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("down")).toBe("❌");
            });

            it("should return mixed icon for 'mixed' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("mixed")).toBe("🔄");
            });

            it("should return paused icon for 'paused' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("paused")).toBe("⏸️");
            });

            it("should return pending icon for 'pending' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("pending")).toBe("⏳");
            });

            it("should return unknown icon for 'unknown' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("unknown")).toBe("❓");
            });

            it("should return up icon for 'up' status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("up")).toBe("✅");
            });
        });

        describe("Case insensitive handling", () => {
            it("should handle uppercase status values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("DOWN")).toBe("❌");
                expect(getStatusIcon("UP")).toBe("✅");
                expect(getStatusIcon("MIXED")).toBe("🔄");
                expect(getStatusIcon("PAUSED")).toBe("⏸️");
                expect(getStatusIcon("PENDING")).toBe("⏳");
                expect(getStatusIcon("UNKNOWN")).toBe("❓");
            });

            it("should handle mixed case status values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("Down")).toBe("❌");
                expect(getStatusIcon("Up")).toBe("✅");
                expect(getStatusIcon("Mixed")).toBe("🔄");
                expect(getStatusIcon("Paused")).toBe("⏸️");
                expect(getStatusIcon("Pending")).toBe("⏳");
                expect(getStatusIcon("Unknown")).toBe("❓");
            });

            it("should handle weird casing combinations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("dOwN")).toBe("❌");
                expect(getStatusIcon("uP")).toBe("✅");
                expect(getStatusIcon("mIxEd")).toBe("🔄");
                expect(getStatusIcon("pAuSeD")).toBe("⏸️");
                expect(getStatusIcon("pEnDiNg")).toBe("⏳");
                expect(getStatusIcon("uNkNoWn")).toBe("❓");
            });
        });

        describe("Unknown status handling", () => {
            it("should return default icon for unknown status strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("invalid")).toBe("⚪");
                expect(getStatusIcon("custom")).toBe("⚪");
                expect(getStatusIcon("error")).toBe("⚪");
                expect(getStatusIcon("failed")).toBe("⚪");
                expect(getStatusIcon("maintenance")).toBe("⚪");
                expect(getStatusIcon("offline")).toBe("⚪");
            });

            it("should return default icon for empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("")).toBe("⚪");
            });

            it("should return default icon for whitespace-only strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon(" ")).toBe("⚪");
                expect(getStatusIcon("   ")).toBe("⚪");
                expect(getStatusIcon("\t")).toBe("⚪");
                expect(getStatusIcon("\n")).toBe("⚪");
            });

            it("should return default icon for special characters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("!@#$%")).toBe("⚪");
                expect(getStatusIcon("123")).toBe("⚪");
                expect(getStatusIcon("___")).toBe("⚪");
                expect(getStatusIcon("...")).toBe("⚪");
            });
        });

        describe("Edge cases", () => {
            it("should handle numeric status representations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("0")).toBe("⚪");
                expect(getStatusIcon("1")).toBe("⚪");
                expect(getStatusIcon("200")).toBe("⚪");
                expect(getStatusIcon("404")).toBe("⚪");
                expect(getStatusIcon("500")).toBe("⚪");
            });

            it("should handle status with extra whitespace", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon(" up ")).toBe("⚪"); // Note: doesn't trim, so this is unknown
                expect(getStatusIcon("down ")).toBe("⚪");
                expect(getStatusIcon(" mixed")).toBe("⚪");
                expect(getStatusIcon("  pending  ")).toBe("⚪");
            });

            it("should handle very long strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const longString = "a".repeat(1000);
                expect(getStatusIcon(longString)).toBe("⚪");
            });

            it("should handle unicode characters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getStatusIcon("🔴")).toBe("⚪");
                expect(getStatusIcon("✅")).toBe("⚪");
                expect(getStatusIcon("статус")).toBe("⚪"); // Russian
                expect(getStatusIcon("状態")).toBe("⚪"); // Japanese
            });
        });
    });

    describe(formatStatusWithIcon, () => {
        describe("Standard status formatting", () => {
            it("should format 'down' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const formatted: StatusWithIcon = formatStatusWithIcon("down");
                expect(formatted).toBe("❌ Down");
            });

            it("should format 'up' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const formatted: StatusWithIcon = formatStatusWithIcon("up");
                expect(formatted).toBe("✅ Up");
            });

            it("should format 'mixed' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const formatted: StatusWithIcon = formatStatusWithIcon("mixed");
                expect(formatted).toBe("🔄 Mixed");
            });

            it("should format 'paused' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("paused")).toBe("⏸️ Paused");
            });

            it("should format 'pending' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("pending")).toBe("⏳ Pending");
            });

            it("should format 'unknown' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("unknown")).toBe("❓ Unknown");
            });

            it("should format 'degraded' status correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("degraded")).toBe("⚠️ Degraded");
            });
        });

        describe("Capitalization handling", () => {
            it("should properly capitalize lowercase status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("down")).toBe("❌ Down");
                expect(formatStatusWithIcon("up")).toBe("✅ Up");
            });

            it("should properly format uppercase status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("DOWN")).toBe("❌ Down");
                expect(formatStatusWithIcon("UP")).toBe("✅ Up");
            });

            it("should properly format mixed case status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("DoWn")).toBe("❌ Down");
                expect(formatStatusWithIcon("uP")).toBe("✅ Up");
            });

            it("should properly format already capitalized status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("Down")).toBe("❌ Down");
                expect(formatStatusWithIcon("Up")).toBe("✅ Up");
            });
        });

        describe("Unknown status formatting", () => {
            it("should format unknown statuses with default icon", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("invalid")).toBe("⚪ Invalid");
                expect(formatStatusWithIcon("custom")).toBe("⚪ Custom");
                expect(formatStatusWithIcon("error")).toBe("⚪ Error");
            });

            it("should format single character statuses", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("a")).toBe("⚪ A");
                expect(formatStatusWithIcon("z")).toBe("⚪ Z");
                expect(formatStatusWithIcon("1")).toBe("⚪ 1");
                expect(formatStatusWithIcon("!")).toBe("⚪ !");
            });
        });

        describe("Edge cases", () => {
            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("")).toBe("⚪ ");
            });

            it("should handle whitespace-only strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon(" ")).toBe("⚪  "); // First char uppercased, rest lowercased
                expect(formatStatusWithIcon("   ")).toBe("⚪    ");
            });

            it("should handle special characters correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("@test")).toBe("⚪ @test");
                expect(formatStatusWithIcon("123abc")).toBe("⚪ 123abc");
                expect(formatStatusWithIcon("TEST-STATUS")).toBe(
                    "⚪ Test-status"
                );
            });

            it("should handle very long status strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const longStatus = "verylongstatusname";
                expect(formatStatusWithIcon(longStatus)).toBe(
                    "⚪ Verylongstatusname"
                );
            });

            it("should handle unicode characters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("тест")).toBe("⚪ Тест");
                expect(formatStatusWithIcon("测试")).toBe("⚪ 测试");
                expect(formatStatusWithIcon("🔴test")).toBe("⚪ 🔴test");
            });

            it("should handle numeric strings", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("404")).toBe("⚪ 404");
                expect(formatStatusWithIcon("200")).toBe("⚪ 200");
                expect(formatStatusWithIcon("0")).toBe("⚪ 0");
            });
        });

        describe("Integration with icon selection", () => {
            it("should use correct icons based on case-insensitive matching", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("UP")).toBe("✅ Up");
                expect(formatStatusWithIcon("dOwN")).toBe("❌ Down");
                expect(formatStatusWithIcon("MiXeD")).toBe("🔄 Mixed");
            });

            it("should maintain text formatting independently of icon selection", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Even though icon selection is case-insensitive, text formatting should work consistently
                expect(formatStatusWithIcon("UNKNOWN")).toBe("❓ Unknown");
                expect(formatStatusWithIcon("unknown")).toBe("❓ Unknown");
                expect(formatStatusWithIcon("Unknown")).toBe("❓ Unknown");
            });
        });

        describe("Multi-word status handling (edge case behavior)", () => {
            it("should handle hyphenated statuses", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("not-responding")).toBe(
                    "⚪ Not-responding"
                );
                expect(formatStatusWithIcon("PARTIALLY-UP")).toBe(
                    "⚪ Partially-up"
                );
            });

            it("should handle space-separated statuses", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("not responding")).toBe(
                    "⚪ Not responding"
                );
                expect(formatStatusWithIcon("PARTIALLY UP")).toBe(
                    "⚪ Partially up"
                );
            });

            it("should handle underscore-separated statuses", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: status", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(formatStatusWithIcon("not_responding")).toBe(
                    "⚪ Not_responding"
                );
                expect(formatStatusWithIcon("PARTIALLY_UP")).toBe(
                    "⚪ Partially_up"
                );
            });
        });
    });

    describe("Comprehensive edge cases and integration", () => {
        it("should handle all known statuses consistently in both functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: status", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const knownStatuses = [
                "down",
                "mixed",
                "paused",
                "pending",
                "unknown",
                "up",
            ];

            for (const status of knownStatuses) {
                const icon = getStatusIcon(status);
                const formatted = formatStatusWithIcon(status);

                // Verify icon is not the default
                expect(icon).not.toBe("⚪");

                // Verify formatted string starts with the icon
                expect(formatted).toMatch(
                    new RegExp(
                        `^${icon.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`)} `
                    )
                );

                // Verify formatted string ends with properly capitalized status
                const expectedText =
                    status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase();
                expect(formatted).toBe(`${icon} ${expectedText}`);
            }
        });

        it("should handle unknown statuses consistently in both functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: status", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const unknownStatuses = [
                "invalid",
                "custom",
                "error",
                "maintenance",
            ];

            for (const status of unknownStatuses) {
                const icon = getStatusIcon(status);
                const formatted = formatStatusWithIcon(status);

                // Verify icon is the default
                expect(icon).toBe("⚪");

                // Verify formatted string is consistent
                const expectedText =
                    status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase();
                expect(formatted).toBe(`⚪ ${expectedText}`);
            }
        });

        it("should maintain consistency across different case variations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: status", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const baseStatus = "up";
            const variations = [
                "up",
                "UP",
                "Up",
                "uP",
            ];

            // All variations should produce the same icon
            const expectedIcon = getStatusIcon(baseStatus);
            for (const variation of variations) {
                expect(getStatusIcon(variation)).toBe(expectedIcon);
            }

            // All variations should produce consistently formatted text (capitalized)
            for (const variation of variations) {
                expect(formatStatusWithIcon(variation)).toBe("✅ Up");
            }
        });
    });

    /**
     * Fast-check property-based tests for comprehensive status utility
     * validation. These tests use property-based testing to systematically
     * explore edge cases and validate invariants across all status utility
     * functions.
     */
    describe("Property-Based Fuzzing Tests", () => {
        describe("getStatusIcon property tests", () => {
            // Known status values for property testing
            const knownStatuses = [
                "down",
                "mixed",
                "paused",
                "pending",
                "unknown",
                "up",
            ];
            const statusIcons = {
                down: "❌",
                mixed: "🔄",
                paused: "⏸️",
                pending: "⏳",
                unknown: "❓",
                up: "✅",
            };

            test.prop([fc.constantFrom(...knownStatuses)])(
                "should return correct icons for known statuses",
                (status) => {
                    const result = getStatusIcon(status);

                    // Property: Should return the expected icon for known status
                    expect(result).toBe(
                        statusIcons[status as keyof typeof statusIcons]
                    );

                    // Property: Result should be a non-empty string
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                }
            );

            test.prop([fc.constantFrom(...knownStatuses)])(
                "should be case-insensitive for known statuses",
                (status) => {
                    const lowercase = status.toLowerCase();
                    const uppercase = status.toUpperCase();
                    const mixedCase =
                        status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase();

                    const lowercaseResult = getStatusIcon(lowercase);
                    const uppercaseResult = getStatusIcon(uppercase);
                    const mixedCaseResult = getStatusIcon(mixedCase);

                    // Property: All case variations should return same icon
                    expect(lowercaseResult).toBe(uppercaseResult);
                    expect(uppercaseResult).toBe(mixedCaseResult);
                    expect(lowercaseResult).toBe(
                        statusIcons[status as keyof typeof statusIcons]
                    );
                }
            );

            test.prop([
                fc
                    .string()
                    .filter((s) => !knownStatuses.includes(s.toLowerCase())),
            ])(
                "should return default icon for unknown statuses",
                (unknownStatus) => {
                    const result = getStatusIcon(unknownStatus);

                    // Property: Unknown statuses should return default icon
                    expect(result).toBe("⚪");
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(""),
                    fc.constant("   "),
                    fc.constant("\t\n")
                ),
            ])(
                "should handle empty/whitespace strings gracefully",
                (emptyStatus) => {
                    const result = getStatusIcon(emptyStatus);

                    // Property: Empty/whitespace should return default icon
                    expect(result).toBe("⚪");
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                }
            );

            test.prop([fc.string()])(
                "should always return a non-empty string",
                (status) => {
                    const result = getStatusIcon(status);

                    // Property: Result must always be a non-empty string
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                }
            );
        });

        describe("formatStatusWithIcon property tests", () => {
            const knownStatuses = [
                "down",
                "mixed",
                "paused",
                "pending",
                "unknown",
                "up",
            ];

            test.prop([fc.constantFrom(...knownStatuses)])(
                "should format known statuses correctly",
                (status) => {
                    const result = formatStatusWithIcon(status);
                    const expectedIcon = getStatusIcon(status);
                    const expectedText =
                        status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase();
                    const expected = `${expectedIcon} ${expectedText}`;

                    // Property: Should match expected format
                    expect(result).toBe(expected);

                    // Property: Should contain both icon and text
                    expect(result).toContain(expectedIcon);
                    expect(result).toContain(expectedText);

                    // Property: Should have proper spacing
                    expect(result).toMatch(/^.+ .+$/);
                }
            );

            test.prop([
                fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
            ])(
                "should always format with icon and capitalized text",
                (status) => {
                    const result = formatStatusWithIcon(status);

                    // Property: Should always contain an icon and text separated by space
                    expect(result).toMatch(/^.+ .+$/);

                    // Property: Should contain expected icon
                    const expectedIcon = getStatusIcon(status);
                    expect(result.startsWith(expectedIcon)).toBeTruthy();

                    // Property: Text portion should be properly formatted
                    // The text part is: first char uppercase + rest lowercase
                    const expectedText =
                        status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase();
                    expect(result).toContain(expectedText);
                }
            );

            test.prop([fc.constantFrom(...knownStatuses)])(
                "should be consistent with getStatusIcon",
                (status) => {
                    const formattedResult = formatStatusWithIcon(status);
                    const iconResult = getStatusIcon(status);

                    // Property: Formatted result should start with the icon from getStatusIcon
                    expect(formattedResult.startsWith(iconResult)).toBeTruthy();
                }
            );

            test.prop([fc.string().filter((s) => s.length > 0)])(
                "should handle case variations consistently",
                (status) => {
                    const lowercase = status.toLowerCase();
                    const uppercase = status.toUpperCase();

                    const lowercaseResult = formatStatusWithIcon(lowercase);
                    const uppercaseResult = formatStatusWithIcon(uppercase);

                    // Property: Different cases should produce same formatted output
                    // (since formatting normalizes the text part)
                    const lowercaseParts = lowercaseResult.split(" ");
                    const uppercaseParts = uppercaseResult.split(" ");

                    expect(lowercaseParts[0]).toBe(uppercaseParts[0]); // Same icon

                    // For text comparison, we need to be flexible about spacing issues
                    // Both should produce the same capitalized text
                    const lowercaseText = lowercaseParts.slice(1).join(" ");
                    const uppercaseText = uppercaseParts.slice(1).join(" ");
                    expect(lowercaseText).toBe(uppercaseText);
                }
            );
        });

        describe("createStatusIdentifier property tests", () => {
            test.prop([
                fc.string({ minLength: 1, maxLength: 30 }).filter((s) => {
                    // Filter to valid inputs that produce valid camelCase
                    if (!/^[a-zA-Z\s_-]+$/u.test(s)) return false;
                    if (s.trim().length === 0) return false;

                    // Test that the function would produce valid camelCase
                    const words = s.toLowerCase().split(/[\s_-]+/);
                    const camelCased = words
                        .map((word, index) =>
                            index === 0
                                ? word
                                : word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join("");

                    // Must produce valid camelCase: non-empty and starts with lowercase
                    return (
                        camelCased.length > 0 &&
                        /^[a-z][\dA-Za-z]*$/u.test(camelCased)
                    );
                }),
            ])("should create valid camelCase identifiers", (statusText) => {
                const result: StatusIdentifier =
                    createStatusIdentifier(statusText);

                // Property: Result should be a non-empty string
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(0);

                // Property: Result should be valid camelCase (starts with lowercase, no spaces/special chars)
                expect(result).toMatch(/^[a-z][\dA-Za-z]*$/);

                // Property: Should not contain original separators
                expect(result).not.toContain(" ");
                expect(result).not.toContain("-");
                expect(result).not.toContain("_");
            });

            test.prop([
                fc.constantFrom(
                    "status check",
                    "monitor down",
                    "service up",
                    "health ok"
                ),
            ])("should handle common status phrases correctly", (phrase) => {
                const result: StatusIdentifier = createStatusIdentifier(phrase);

                // Property: Should create valid identifier
                expect(result).toMatch(/^[a-z][\dA-Za-z]*$/);

                // Property: Should start with lowercase
                const firstChar = result[0];
                if (!firstChar) {
                    throw new Error(
                        "Expected result to have at least one character"
                    );
                }
                expect(firstChar).toBe(firstChar.toLowerCase());

                // Property: Should be longer than any single word (compound identifier)
                if (phrase.includes(" ")) {
                    expect(result.length).toBeGreaterThan(
                        Math.max(...phrase.split(" ").map((w) => w.length))
                    );
                }
            });

            test.prop([
                fc.constantFrom("status", "monitor", "check", "service"),
            ])("should handle single words correctly", (word) => {
                const result: StatusIdentifier = createStatusIdentifier(word);

                // Property: Single word should remain lowercase
                expect(result).toBe(word.toLowerCase());
            });

            test.prop([
                fc
                    .string({ minLength: 1, maxLength: 20 })
                    .filter((s) => /^[a-zA-Z]+$/u.test(s)),
            ])(
                "should handle alphabetic strings without separators",
                (text) => {
                    const result: StatusIdentifier =
                        createStatusIdentifier(text);

                    // Property: Should convert to lowercase for single word
                    expect(result).toBe(text.toLowerCase());
                }
            );

            test.prop([
                fc.array(
                    fc
                        .string({ minLength: 1, maxLength: 10 })
                        .filter((s) => /^[a-zA-Z]+$/u.test(s)),
                    { minLength: 2, maxLength: 5 }
                ),
            ])("should combine multiple words into camelCase", (words) => {
                const phrase = words.join(" ");
                const result: StatusIdentifier = createStatusIdentifier(phrase);

                // Property: Should start with lowercase first word
                const firstWord = words[0];
                if (!firstWord) {
                    throw new Error("Expected at least one word");
                }
                expect(result.startsWith(firstWord.toLowerCase())).toBeTruthy();

                // Property: Should not contain spaces
                expect(result).not.toContain(" ");

                // Property: Should be camelCase pattern
                expect(result).toMatch(/^[a-z][\dA-Za-z]*$/);
            });
        });

        describe("Cross-function property tests", () => {
            const knownStatuses = [
                "down",
                "mixed",
                "paused",
                "pending",
                "unknown",
                "up",
            ];

            test.prop([fc.constantFrom(...knownStatuses)])(
                "getStatusIcon and formatStatusWithIcon should be consistent",
                (status) => {
                    const icon = getStatusIcon(status);
                    const formatted = formatStatusWithIcon(status);

                    // Property: Formatted string should start with the icon
                    expect(formatted.startsWith(icon)).toBeTruthy();

                    // Property: Both functions should handle same input consistently
                    expect(typeof icon).toBe("string");
                    expect(typeof formatted).toBe("string");
                    expect(icon.length).toBeGreaterThan(0);
                    expect(formatted.length).toBeGreaterThan(icon.length);
                }
            );

            test.prop([fc.string()])(
                "all status functions should handle arbitrary input gracefully",
                (status) => {
                    // Property: None of these should throw
                    expect(() => getStatusIcon(status)).not.toThrow();
                    expect(() => formatStatusWithIcon(status)).not.toThrow();

                    // Property: All should return non-empty strings
                    const icon = getStatusIcon(status);
                    const formatted = formatStatusWithIcon(status);

                    expect(icon.length).toBeGreaterThan(0);
                    expect(formatted.length).toBeGreaterThan(0);
                }
            );

            test.prop([
                fc.string({ minLength: 1 }).filter((s) => {
                    // Filter to valid inputs that produce valid camelCase
                    if (!/^[a-zA-Z\s_-]+$/u.test(s)) return false;
                    if (s.trim().length === 0) return false;

                    // Test that the function would produce valid camelCase
                    const words = s.toLowerCase().split(/[\s_-]+/);
                    const camelCased = words
                        .map((word, index) =>
                            index === 0
                                ? word
                                : word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join("");

                    // Must produce valid camelCase: non-empty and starts with lowercase
                    return (
                        camelCased.length > 0 &&
                        /^[a-z][\dA-Za-z]*$/u.test(camelCased)
                    );
                }),
            ])(
                "createStatusIdentifier should handle valid text input gracefully",
                (text) => {
                    // Property: Should not throw with valid text input
                    expect(() => createStatusIdentifier(text)).not.toThrow();

                    const result = createStatusIdentifier(text);

                    // Property: Should produce valid identifier
                    expect(result).toMatch(/^[a-z][\dA-Za-z]*$/);
                    expect(result.length).toBeGreaterThan(0);
                }
            );
        });
    });
});

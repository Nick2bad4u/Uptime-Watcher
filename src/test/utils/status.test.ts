/**
 * Comprehensive tests for status utility functions. Tests formatting and icon
 * selection for all status types.
 */

import { describe, expect, it } from "vitest";
import { formatStatusWithIcon, getStatusIcon } from "../../utils/status";

describe("Status Utilities", () => {
    describe("getStatusIcon", () => {
        describe("Standard status icons", () => {
            it("should return down icon for 'down' status", () => {
                expect(getStatusIcon("down")).toBe("❌");
            });

            it("should return mixed icon for 'mixed' status", () => {
                expect(getStatusIcon("mixed")).toBe("🔄");
            });

            it("should return paused icon for 'paused' status", () => {
                expect(getStatusIcon("paused")).toBe("⏸️");
            });

            it("should return pending icon for 'pending' status", () => {
                expect(getStatusIcon("pending")).toBe("⏳");
            });

            it("should return unknown icon for 'unknown' status", () => {
                expect(getStatusIcon("unknown")).toBe("❓");
            });

            it("should return up icon for 'up' status", () => {
                expect(getStatusIcon("up")).toBe("✅");
            });
        });

        describe("Case insensitive handling", () => {
            it("should handle uppercase status values", () => {
                expect(getStatusIcon("DOWN")).toBe("❌");
                expect(getStatusIcon("UP")).toBe("✅");
                expect(getStatusIcon("MIXED")).toBe("🔄");
                expect(getStatusIcon("PAUSED")).toBe("⏸️");
                expect(getStatusIcon("PENDING")).toBe("⏳");
                expect(getStatusIcon("UNKNOWN")).toBe("❓");
            });

            it("should handle mixed case status values", () => {
                expect(getStatusIcon("Down")).toBe("❌");
                expect(getStatusIcon("Up")).toBe("✅");
                expect(getStatusIcon("Mixed")).toBe("🔄");
                expect(getStatusIcon("Paused")).toBe("⏸️");
                expect(getStatusIcon("Pending")).toBe("⏳");
                expect(getStatusIcon("Unknown")).toBe("❓");
            });

            it("should handle weird casing combinations", () => {
                expect(getStatusIcon("dOwN")).toBe("❌");
                expect(getStatusIcon("uP")).toBe("✅");
                expect(getStatusIcon("mIxEd")).toBe("🔄");
                expect(getStatusIcon("pAuSeD")).toBe("⏸️");
                expect(getStatusIcon("pEnDiNg")).toBe("⏳");
                expect(getStatusIcon("uNkNoWn")).toBe("❓");
            });
        });

        describe("Unknown status handling", () => {
            it("should return default icon for unknown status strings", () => {
                expect(getStatusIcon("invalid")).toBe("⚪");
                expect(getStatusIcon("custom")).toBe("⚪");
                expect(getStatusIcon("error")).toBe("⚪");
                expect(getStatusIcon("failed")).toBe("⚪");
                expect(getStatusIcon("maintenance")).toBe("⚪");
                expect(getStatusIcon("offline")).toBe("⚪");
            });

            it("should return default icon for empty strings", () => {
                expect(getStatusIcon("")).toBe("⚪");
            });

            it("should return default icon for whitespace-only strings", () => {
                expect(getStatusIcon(" ")).toBe("⚪");
                expect(getStatusIcon("   ")).toBe("⚪");
                expect(getStatusIcon("\t")).toBe("⚪");
                expect(getStatusIcon("\n")).toBe("⚪");
            });

            it("should return default icon for special characters", () => {
                expect(getStatusIcon("!@#$%")).toBe("⚪");
                expect(getStatusIcon("123")).toBe("⚪");
                expect(getStatusIcon("___")).toBe("⚪");
                expect(getStatusIcon("...")).toBe("⚪");
            });
        });

        describe("Edge cases", () => {
            it("should handle numeric status representations", () => {
                expect(getStatusIcon("0")).toBe("⚪");
                expect(getStatusIcon("1")).toBe("⚪");
                expect(getStatusIcon("200")).toBe("⚪");
                expect(getStatusIcon("404")).toBe("⚪");
                expect(getStatusIcon("500")).toBe("⚪");
            });

            it("should handle status with extra whitespace", () => {
                expect(getStatusIcon(" up ")).toBe("⚪"); // Note: doesn't trim, so this is unknown
                expect(getStatusIcon("down ")).toBe("⚪");
                expect(getStatusIcon(" mixed")).toBe("⚪");
                expect(getStatusIcon("  pending  ")).toBe("⚪");
            });

            it("should handle very long strings", () => {
                const longString = "a".repeat(1000);
                expect(getStatusIcon(longString)).toBe("⚪");
            });

            it("should handle unicode characters", () => {
                expect(getStatusIcon("🔴")).toBe("⚪");
                expect(getStatusIcon("✅")).toBe("⚪");
                expect(getStatusIcon("статус")).toBe("⚪"); // Russian
                expect(getStatusIcon("状態")).toBe("⚪"); // Japanese
            });
        });
    });

    describe("formatStatusWithIcon", () => {
        describe("Standard status formatting", () => {
            it("should format 'down' status correctly", () => {
                expect(formatStatusWithIcon("down")).toBe("❌ Down");
            });

            it("should format 'up' status correctly", () => {
                expect(formatStatusWithIcon("up")).toBe("✅ Up");
            });

            it("should format 'mixed' status correctly", () => {
                expect(formatStatusWithIcon("mixed")).toBe("🔄 Mixed");
            });

            it("should format 'paused' status correctly", () => {
                expect(formatStatusWithIcon("paused")).toBe("⏸️ Paused");
            });

            it("should format 'pending' status correctly", () => {
                expect(formatStatusWithIcon("pending")).toBe("⏳ Pending");
            });

            it("should format 'unknown' status correctly", () => {
                expect(formatStatusWithIcon("unknown")).toBe("❓ Unknown");
            });
        });

        describe("Capitalization handling", () => {
            it("should properly capitalize lowercase status", () => {
                expect(formatStatusWithIcon("down")).toBe("❌ Down");
                expect(formatStatusWithIcon("up")).toBe("✅ Up");
            });

            it("should properly format uppercase status", () => {
                expect(formatStatusWithIcon("DOWN")).toBe("❌ Down");
                expect(formatStatusWithIcon("UP")).toBe("✅ Up");
            });

            it("should properly format mixed case status", () => {
                expect(formatStatusWithIcon("DoWn")).toBe("❌ Down");
                expect(formatStatusWithIcon("uP")).toBe("✅ Up");
            });

            it("should properly format already capitalized status", () => {
                expect(formatStatusWithIcon("Down")).toBe("❌ Down");
                expect(formatStatusWithIcon("Up")).toBe("✅ Up");
            });
        });

        describe("Unknown status formatting", () => {
            it("should format unknown statuses with default icon", () => {
                expect(formatStatusWithIcon("invalid")).toBe("⚪ Invalid");
                expect(formatStatusWithIcon("custom")).toBe("⚪ Custom");
                expect(formatStatusWithIcon("error")).toBe("⚪ Error");
            });

            it("should format single character statuses", () => {
                expect(formatStatusWithIcon("a")).toBe("⚪ A");
                expect(formatStatusWithIcon("z")).toBe("⚪ Z");
                expect(formatStatusWithIcon("1")).toBe("⚪ 1");
                expect(formatStatusWithIcon("!")).toBe("⚪ !");
            });
        });

        describe("Edge cases", () => {
            it("should handle empty string", () => {
                expect(formatStatusWithIcon("")).toBe("⚪ ");
            });

            it("should handle whitespace-only strings", () => {
                expect(formatStatusWithIcon(" ")).toBe("⚪  "); // First char uppercased, rest lowercased
                expect(formatStatusWithIcon("   ")).toBe("⚪    ");
            });

            it("should handle special characters correctly", () => {
                expect(formatStatusWithIcon("@test")).toBe("⚪ @test");
                expect(formatStatusWithIcon("123abc")).toBe("⚪ 123abc");
                expect(formatStatusWithIcon("TEST-STATUS")).toBe(
                    "⚪ Test-status"
                );
            });

            it("should handle very long status strings", () => {
                const longStatus = "verylongstatusname";
                expect(formatStatusWithIcon(longStatus)).toBe(
                    "⚪ Verylongstatusname"
                );
            });

            it("should handle unicode characters", () => {
                expect(formatStatusWithIcon("тест")).toBe("⚪ Тест");
                expect(formatStatusWithIcon("测试")).toBe("⚪ 测试");
                expect(formatStatusWithIcon("🔴test")).toBe("⚪ 🔴test");
            });

            it("should handle numeric strings", () => {
                expect(formatStatusWithIcon("404")).toBe("⚪ 404");
                expect(formatStatusWithIcon("200")).toBe("⚪ 200");
                expect(formatStatusWithIcon("0")).toBe("⚪ 0");
            });
        });

        describe("Integration with icon selection", () => {
            it("should use correct icons based on case-insensitive matching", () => {
                expect(formatStatusWithIcon("UP")).toBe("✅ Up");
                expect(formatStatusWithIcon("dOwN")).toBe("❌ Down");
                expect(formatStatusWithIcon("MiXeD")).toBe("🔄 Mixed");
            });

            it("should maintain text formatting independently of icon selection", () => {
                // Even though icon selection is case-insensitive, text formatting should work consistently
                expect(formatStatusWithIcon("UNKNOWN")).toBe("❓ Unknown");
                expect(formatStatusWithIcon("unknown")).toBe("❓ Unknown");
                expect(formatStatusWithIcon("Unknown")).toBe("❓ Unknown");
            });
        });

        describe("Multi-word status handling (edge case behavior)", () => {
            it("should handle hyphenated statuses", () => {
                expect(formatStatusWithIcon("not-responding")).toBe(
                    "⚪ Not-responding"
                );
                expect(formatStatusWithIcon("PARTIALLY-UP")).toBe(
                    "⚪ Partially-up"
                );
            });

            it("should handle space-separated statuses", () => {
                expect(formatStatusWithIcon("not responding")).toBe(
                    "⚪ Not responding"
                );
                expect(formatStatusWithIcon("PARTIALLY UP")).toBe(
                    "⚪ Partially up"
                );
            });

            it("should handle underscore-separated statuses", () => {
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
        it("should handle all known statuses consistently in both functions", () => {
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

        it("should handle unknown statuses consistently in both functions", () => {
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

        it("should maintain consistency across different case variations", () => {
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
});

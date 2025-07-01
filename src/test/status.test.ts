/**
 * Tests for status utility functions.
 */

import { describe, expect, it } from "vitest";

import { getStatusIcon, formatStatusWithIcon } from "../utils/status";

describe("Status Utils", () => {
    describe("getStatusIcon", () => {
        it("returns correct icons for known statuses", () => {
            expect(getStatusIcon("up")).toBe("✅");
            expect(getStatusIcon("down")).toBe("❌");
            expect(getStatusIcon("pending")).toBe("⏳");
            expect(getStatusIcon("unknown")).toBe("❓");
        });

        it("handles case insensitive input", () => {
            expect(getStatusIcon("UP")).toBe("✅");
            expect(getStatusIcon("Down")).toBe("❌");
            expect(getStatusIcon("PENDING")).toBe("⏳");
            expect(getStatusIcon("Unknown")).toBe("❓");
        });

        it("returns default icon for unknown statuses", () => {
            expect(getStatusIcon("invalid")).toBe("⚪");
            expect(getStatusIcon("")).toBe("⚪");
            expect(getStatusIcon("random")).toBe("⚪");
        });

        it("handles mixed case input", () => {
            expect(getStatusIcon("uP")).toBe("✅");
            expect(getStatusIcon("DoWn")).toBe("❌");
            expect(getStatusIcon("PeNdInG")).toBe("⏳");
        });
    });

    describe("formatStatusWithIcon", () => {
        it("formats status with correct icon and capitalization", () => {
            expect(formatStatusWithIcon("up")).toBe("✅ Up");
            expect(formatStatusWithIcon("down")).toBe("❌ Down");
            expect(formatStatusWithIcon("pending")).toBe("⏳ Pending");
            expect(formatStatusWithIcon("unknown")).toBe("❓ Unknown");
        });

        it("handles different input cases", () => {
            expect(formatStatusWithIcon("UP")).toBe("✅ Up");
            expect(formatStatusWithIcon("DOWN")).toBe("❌ Down");
            expect(formatStatusWithIcon("PENDING")).toBe("⏳ Pending");
        });

        it("formats unknown statuses correctly", () => {
            expect(formatStatusWithIcon("invalid")).toBe("⚪ Invalid");
            expect(formatStatusWithIcon("custom")).toBe("⚪ Custom");
            expect(formatStatusWithIcon("")).toBe("⚪ ");
        });

        it("handles mixed case and capitalizes properly", () => {
            expect(formatStatusWithIcon("uP")).toBe("✅ Up");
            expect(formatStatusWithIcon("DoWn")).toBe("❌ Down");
            expect(formatStatusWithIcon("PeNdInG")).toBe("⏳ Pending");
            expect(formatStatusWithIcon("rAnDoM")).toBe("⚪ Random");
        });

        it("handles single character input", () => {
            expect(formatStatusWithIcon("u")).toBe("⚪ U");
            expect(formatStatusWithIcon("d")).toBe("⚪ D");
        });

        it("preserves longer status strings", () => {
            expect(formatStatusWithIcon("maintenance")).toBe("⚪ Maintenance");
            expect(formatStatusWithIcon("degraded")).toBe("⚪ Degraded");
        });
    });
});

/**
 * Tests for the supported status utility surface.
 */

import { STATUS_KIND } from "@shared/types";
import { describe, expect, it } from "vitest";

import { AppIcons } from "../../utils/icons";
import { formatStatusLabel, getStatusIconComponent } from "../../utils/status";

describe("status utilities", () => {
    describe(formatStatusLabel, () => {
        it("capitalizes lowercase status labels", () => {
            expect(formatStatusLabel("up")).toBe("Up");
            expect(formatStatusLabel("degraded")).toBe("Degraded");
        });

        it("normalizes mixed-case and empty labels", () => {
            expect(formatStatusLabel("PeNdInG")).toBe("Pending");
            expect(formatStatusLabel("")).toBe("");
        });
    });

    describe(getStatusIconComponent, () => {
        it("returns semantic icon components for known statuses", () => {
            expect(getStatusIconComponent(STATUS_KIND.UP)).toBe(
                AppIcons.status.upFilled
            );
            expect(getStatusIconComponent(STATUS_KIND.DOWN)).toBe(
                AppIcons.status.downFilled
            );
            expect(getStatusIconComponent(STATUS_KIND.PAUSED)).toBe(
                AppIcons.status.pausedFilled
            );
        });

        it("handles case-insensitive statuses and unknown fallbacks", () => {
            expect(getStatusIconComponent("PENDING")).toBe(
                AppIcons.status.pendingFilled
            );
            expect(getStatusIconComponent("not-a-status")).toBe(
                AppIcons.ui.info
            );
        });
    });
});

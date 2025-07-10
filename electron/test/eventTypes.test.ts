import { describe, it, expect } from "vitest";
import { isEventOfCategory, getEventPriority } from "../events/eventTypes";

describe("isEventOfCategory", () => {
    it("returns true for event in category", () => {
        expect(isEventOfCategory("site:added", "SITE")).toBe(true);
        expect(isEventOfCategory("monitor:added", "MONITOR")).toBe(true);
        expect(isEventOfCategory("system:error", "SYSTEM")).toBe(true);
    });

    it("returns false for event not in category", () => {
        expect(isEventOfCategory("site:added", "MONITOR")).toBe(false);
        expect(isEventOfCategory("monitor:added", "SITE")).toBe(false);
        expect(isEventOfCategory("system:error", "PERFORMANCE")).toBe(false);
    });

    it("handles unknown event/category gracefully", () => {
        expect(isEventOfCategory("not:an:event", "SITE")).toBe(false);
        // @ts-expect-error - intentionally testing unknown category
        expect(isEventOfCategory("site:added", "NOT_A_CATEGORY")).toBe(false);
    });
});

describe("getEventPriority", () => {
    it("returns correct priority for known events", () => {
        expect(getEventPriority("performance:warning")).toBe("CRITICAL");
        expect(getEventPriority("monitor:status-changed")).toBe("HIGH");
        expect(getEventPriority("performance:metric")).toBe("LOW");
        expect(getEventPriority("site:added")).toBe("MEDIUM");
    });

    it("returns MEDIUM for unknown events", () => {
        expect(getEventPriority("not:an:event")).toBe("MEDIUM");
    });
});

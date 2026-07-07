/**
 * Tests covering the shared icon utilities.
 */

import { describe, expect, it } from "vitest";

import { AppIcons, getIconSize } from "../../utils/icons";

describe("icon utilities", () => {
    it("exposes icon references by semantic category", () => {
        expect(AppIcons.actions.refresh).toBeTypeOf("function");
    });

    it("provides pixel sizes for named presets", () => {
        expect(getIconSize("xs")).toBe(12);
        expect(getIconSize("xl")).toBe(32);
    });
});

/**
 * Tests covering the shared icon utilities.
 */

import { describe, expect, it } from "vitest";

import { AppIcons, getIcon, getIconSize, IconSizes } from "../../utils/icons";

describe("icon utilities", () => {
    it("returns the exact icon reference for a given category and name", () => {
        const icon = getIcon("actions", "refresh");

        expect(icon).toBe(AppIcons.actions.refresh);
    });

    it("provides pixel sizes for named presets", () => {
        expect(getIconSize("xs")).toBe(IconSizes.xs);
        expect(getIconSize("xl")).toBe(IconSizes.xl);
    });
});

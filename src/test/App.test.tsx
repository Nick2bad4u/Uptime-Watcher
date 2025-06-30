/**
 * Basic constants tests.
 */

import { describe, expect, it } from "vitest";

import { FONT_FAMILY_MONO, FONT_FAMILY_SANS } from "../constants";

describe("Constants", () => {
    it("exports font families", () => {
        expect(FONT_FAMILY_MONO).toBeDefined();
        expect(Array.isArray(FONT_FAMILY_MONO)).toBe(true);
        expect(FONT_FAMILY_MONO.length).toBeGreaterThan(0);
    });

    it("exports sans serif font family", () => {
        expect(FONT_FAMILY_SANS).toBeDefined();
        expect(Array.isArray(FONT_FAMILY_SANS)).toBe(true);
        expect(FONT_FAMILY_SANS.length).toBeGreaterThan(0);
    });
});

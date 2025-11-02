/**
 * Validates complete coverage for shared site constants.
 *
 * @file Guards against unexpected drift in renderer and main process defaults
 *   when users omit explicit site names.
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";

describe("DEFAULT_SITE_NAME", () => {
    it("matches the documented fallback label", () => {
        expect(DEFAULT_SITE_NAME).toBe("Unnamed Site");
        expect(typeof DEFAULT_SITE_NAME).toBe("string");
        expect(DEFAULT_SITE_NAME.length).toBeGreaterThan(0);
    });
});

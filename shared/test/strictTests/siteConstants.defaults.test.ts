/**
 * Shared site constant behavior.
 *
 * @file Guards against unexpected drift in renderer and main process defaults
 *   when users omit explicit site names.
 */

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";
import { describe, expect, it } from "vitest";

describe("DEFAULT_SITE_NAME", () => {
    it("matches the documented fallback label", () => {
        expect(DEFAULT_SITE_NAME).toBe("Unnamed Site");
        expect(typeof DEFAULT_SITE_NAME).toBe("string");
        expect(DEFAULT_SITE_NAME.length).toBeGreaterThan(0);
    });
});

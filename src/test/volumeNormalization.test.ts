import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";

import {
    clampNormalizedVolume,
    convertNormalizedVolumeToSliderPercent,
    convertSliderPercentToNormalizedVolume,
} from "../components/Settings/utils/volumeNormalization";

describe("volumeNormalization", () => {
    it("clamps normalized volumes into [0, 1]", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: volumeNormalization", "component");
        await annotate("Category: Settings", "category");
        await annotate("Type: Business Logic", "type");

        expect(clampNormalizedVolume(-0.5)).toBe(0);
        expect(clampNormalizedVolume(0)).toBe(0);
        expect(clampNormalizedVolume(0.25)).toBe(0.25);
        expect(clampNormalizedVolume(1)).toBe(1);
        expect(clampNormalizedVolume(2)).toBe(1);
    });

    test.prop([fc.double({ noNaN: true, noDefaultInfinity: true })])(
        "always returns a clamped value",
        (value) => {
            const clamped = clampNormalizedVolume(value);
            expect(clamped).toBeGreaterThanOrEqual(0);
            expect(clamped).toBeLessThanOrEqual(1);
        }
    );

    test.prop([fc.integer({ min: 0, max: 100 })])(
        "slider percent round-trips via normalized conversion",
        (percent) => {
            const normalized = convertSliderPercentToNormalizedVolume(percent);
            const roundTripped =
                convertNormalizedVolumeToSliderPercent(normalized);

            expect(roundTripped).toBe(percent);
        }
    );
});

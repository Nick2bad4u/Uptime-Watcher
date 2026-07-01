import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import {
    clampNormalizedVolume,
    convertNormalizedVolumeToSliderPercent,
    convertSliderPercentToNormalizedVolume,
} from "../components/Settings/utils/volumeNormalization";

describe("volumeNormalization", () => {
    it("clamps normalized volumes into [0, 1]", async ({ annotate, task }) => {
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

    test.prop([fc.double({ noDefaultInfinity: true, noNaN: true })])(
        "always returns a clamped value",
        (value) => {
            const clamped = clampNormalizedVolume(value);

            expect(clamped).toBeGreaterThanOrEqual(0);
            expect(clamped).toBeLessThanOrEqual(1);
        }
    );

    test.prop([fc.integer({ max: 100, min: 0 })])(
        "slider percent round-trips via normalized conversion",
        (percent) => {
            const normalized = convertSliderPercentToNormalizedVolume(percent);
            const roundTripped =
                convertNormalizedVolumeToSliderPercent(normalized);

            expect(roundTripped).toBe(percent);
        }
    );
});

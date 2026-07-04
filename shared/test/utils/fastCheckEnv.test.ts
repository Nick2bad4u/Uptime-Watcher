import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveFastCheckEnvOverrides } from "./fastCheckEnv";

const ORIGINAL_FAST_CHECK_NUM_RUNS = process.env["FAST_CHECK_NUM_RUNS"];
const ORIGINAL_FAST_CHECK_SEED = process.env["FAST_CHECK_SEED"];

function restoreFastCheckEnv(): void {
    if (ORIGINAL_FAST_CHECK_NUM_RUNS === undefined) {
        delete process.env["FAST_CHECK_NUM_RUNS"];
    } else {
        process.env["FAST_CHECK_NUM_RUNS"] = ORIGINAL_FAST_CHECK_NUM_RUNS;
    }

    if (ORIGINAL_FAST_CHECK_SEED === undefined) {
        delete process.env["FAST_CHECK_SEED"];
    } else {
        process.env["FAST_CHECK_SEED"] = ORIGINAL_FAST_CHECK_SEED;
    }
}

describe(resolveFastCheckEnvOverrides, () => {
    afterEach(() => {
        vi.restoreAllMocks();
        restoreFastCheckEnv();
    });

    it("uses sanitized defaults when no environment overrides are set", () => {
        expect.assertions(2);

        delete process.env["FAST_CHECK_NUM_RUNS"];
        delete process.env["FAST_CHECK_SEED"];

        expect(resolveFastCheckEnvOverrides(25)).toEqual({ numRuns: 25 });
        expect(resolveFastCheckEnvOverrides(0)).toEqual({ numRuns: 10 });
    });

    it("uses valid environment overrides", () => {
        expect.assertions(1);

        process.env["FAST_CHECK_NUM_RUNS"] = "50";
        process.env["FAST_CHECK_SEED"] = "1234";

        expect(resolveFastCheckEnvOverrides(25)).toEqual({
            numRuns: 50,
            seed: 1234,
        });
    });

    it("emits warnings and falls back for invalid environment overrides", () => {
        expect.assertions(3);

        const emitWarningSpy = vi
            .spyOn(process, "emitWarning")
            .mockReturnValue(undefined);
        process.env["FAST_CHECK_NUM_RUNS"] = "invalid";
        process.env["FAST_CHECK_SEED"] = "not-a-seed";

        expect(resolveFastCheckEnvOverrides(25)).toEqual({ numRuns: 25 });
        expect(emitWarningSpy).toHaveBeenCalledWith(
            "[fast-check] Ignoring invalid FAST_CHECK_NUM_RUNS value: invalid",
            { type: "FastCheckConfigWarning" }
        );
        expect(emitWarningSpy).toHaveBeenCalledWith(
            "[fast-check] Ignoring invalid FAST_CHECK_SEED value: not-a-seed",
            { type: "FastCheckConfigWarning" }
        );
    });
});

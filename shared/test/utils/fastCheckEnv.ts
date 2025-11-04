/**
 * Utilities for deriving fast-check configuration overrides from environment
 * variables.
 *
 * @remarks
 * These helpers centralize the logic for mapping environment variables to
 * fast-check's global configuration so that all test entrypoints behave
 * consistently when callers specify custom fuzzing parameters (for example,
 * seeding or increasing the number of generated cases).
 */

import process from "node:process";

/** Name of the environment variable controlling the fast-check seed. */
const FAST_CHECK_SEED_ENV = "FAST_CHECK_SEED" as const;

/** Name of the environment variable controlling the number of fast-check runs. */
const FAST_CHECK_NUM_RUNS_ENV = "FAST_CHECK_NUM_RUNS" as const;

/**
 * Resolved overrides derived from the current process environment.
 */
export interface FastCheckEnvOverrides {
    /** Number of generated cases per property. */
    readonly numRuns: number;
    /** Optional deterministic seed for reproducible runs. */
    readonly seed?: number;
}

/**
 * Resolves fast-check configuration overrides using environment variables.
 *
 * @param defaultNumRuns - Baseline run count used when the environment does not
 *   provide an override.
 *
 * @returns A configuration object that can be spread into
 *   {@link fc.configureGlobal}.
 */
export function resolveFastCheckEnvOverrides(
    defaultNumRuns: number
): FastCheckEnvOverrides {
    const sanitizedDefault =
        Number.isFinite(defaultNumRuns) && defaultNumRuns > 0
            ? Math.trunc(defaultNumRuns)
            : 10;

    let numRuns = sanitizedDefault;
    const rawNumRuns = process.env[FAST_CHECK_NUM_RUNS_ENV];
    if (typeof rawNumRuns === "string" && rawNumRuns.trim().length > 0) {
        const parsed = Number.parseInt(rawNumRuns, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
            numRuns = Math.trunc(parsed);
        } else {
            console.warn(
                "[fast-check] Ignoring invalid FAST_CHECK_NUM_RUNS value:",
                rawNumRuns
            );
        }
    }

    const rawSeed = process.env[FAST_CHECK_SEED_ENV];
    if (typeof rawSeed === "string" && rawSeed.trim().length > 0) {
        const parsedSeed = Number.parseInt(rawSeed, 10);
        if (Number.isFinite(parsedSeed)) {
            return {
                numRuns,
                seed: Math.trunc(parsedSeed),
            };
        }

        console.warn(
            "[fast-check] Ignoring invalid FAST_CHECK_SEED value:",
            rawSeed
        );
    }

    return { numRuns };
}

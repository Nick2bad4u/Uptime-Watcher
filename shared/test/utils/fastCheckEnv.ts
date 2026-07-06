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

/** Name of the environment variable controlling the fast-check seed. */
const FAST_CHECK_SEED_ENV = "FAST_CHECK_SEED" as const;

/** Name of the environment variable controlling the number of fast-check runs. */
const FAST_CHECK_NUM_RUNS_ENV = "FAST_CHECK_NUM_RUNS" as const;

function emitInvalidFastCheckEnvWarning(
    environmentVariableName: string,
    rawValue: string
): void {
    process.emitWarning(
        `[fast-check] Ignoring invalid ${environmentVariableName} value: ${rawValue}`,
        { type: "FastCheckConfigWarning" }
    );
}

function isAsciiDigit(character: string | undefined): boolean {
    return (
        typeof character === "string" &&
        character.length === 1 &&
        character >= "0" &&
        character <= "9"
    );
}

function isUnsignedDecimalInteger(value: string): boolean {
    if (value.length === 0) {
        return false;
    }

    for (const character of value) {
        if (!isAsciiDigit(character)) {
            return false;
        }
    }

    return true;
}

function isSignedDecimalInteger(value: string): boolean {
    const startIndex = value.startsWith("+") || value.startsWith("-") ? 1 : 0;

    if (startIndex === value.length) {
        return false;
    }

    for (let index = startIndex; index < value.length; index += 1) {
        if (!isAsciiDigit(value[index])) {
            return false;
        }
    }

    return true;
}

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
        const trimmedNumRuns = rawNumRuns.trim();
        if (isUnsignedDecimalInteger(trimmedNumRuns)) {
            const parsed = Number.parseInt(trimmedNumRuns, 10);
            if (Number.isSafeInteger(parsed) && parsed > 0) {
                numRuns = parsed;
            } else {
                emitInvalidFastCheckEnvWarning(
                    FAST_CHECK_NUM_RUNS_ENV,
                    rawNumRuns
                );
            }
        } else {
            emitInvalidFastCheckEnvWarning(FAST_CHECK_NUM_RUNS_ENV, rawNumRuns);
        }
    }

    const rawSeed = process.env[FAST_CHECK_SEED_ENV];
    if (typeof rawSeed === "string" && rawSeed.trim().length > 0) {
        const trimmedSeed = rawSeed.trim();
        if (isSignedDecimalInteger(trimmedSeed)) {
            const parsedSeed = Number.parseInt(trimmedSeed, 10);
            if (Number.isSafeInteger(parsedSeed)) {
                return {
                    numRuns,
                    seed: parsedSeed,
                };
            }

            emitInvalidFastCheckEnvWarning(FAST_CHECK_SEED_ENV, rawSeed);
        } else {
            emitInvalidFastCheckEnvWarning(FAST_CHECK_SEED_ENV, rawSeed);
        }
    }

    return { numRuns };
}

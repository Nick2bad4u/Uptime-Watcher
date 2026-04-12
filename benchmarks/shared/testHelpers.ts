/**
 * Deterministic benchmark helper utilities.
 *
 * @remarks
 * Benchmarks in this repository historically imported
 * `@shared/test/testHelpers` for `secureRandomFloat()`. The benchmark TS
 * project intentionally excludes `shared/test/**`, so this local shim provides
 * the same API shape without pulling the full shared test tree into benchmark
 * compilation.
 *
 * The implementation is intentionally deterministic to keep benchmark runs more
 * comparable across executions.
 *
 * @category Benchmarks
 *
 * @benchmark Shared helpers
 */

let benchmarkRandomState = 0x6d_2b_79_f5;

/**
 * Returns a deterministic pseudo-random floating-point number in the range `[0,
 * 1)` for benchmark fixture generation.
 */
export function secureRandomFloat(): number {
    benchmarkRandomState = Math.abs(
        Math.imul(benchmarkRandomState, 1_664_525) + 1_013_904_223
    ) % 0x1_00_00_00_00;

    return benchmarkRandomState / 0x1_00_00_00_00;
}

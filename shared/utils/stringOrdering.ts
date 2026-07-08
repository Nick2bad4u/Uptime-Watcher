/**
 * Deterministic string ordering helpers for technical identifiers.
 *
 * @remarks
 * Use these helpers for provider keys, IDs, schema fields, telemetry fields,
 * and other machine-readable values where locale collation would make ordering
 * runtime-dependent.
 */

/**
 * Compares strings by JavaScript code-unit order.
 */
export function compareStringsCodeUnit(left: string, right: string): number {
    if (left === right) {
        return 0;
    }

    return left < right ? -1 : 1;
}

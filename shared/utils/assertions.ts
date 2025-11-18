/**
 * Assert that a value is never at runtime; throws a descriptive error.
 *
 * Use in exhaustive switch default branches to enforce compile-time coverage.
 */
function describeValue(v: unknown): string {
    try {
        if (v === null) {
            return "null";
        }

        if (v === undefined) {
            return "undefined";
        }

        if (typeof v === "string") {
            return v;
        }

        if (
            typeof v === "number" ||
            typeof v === "boolean" ||
            typeof v === "bigint" ||
            typeof v === "symbol"
        ) {
            return String(v);
        }

        if (typeof v === "object") {
            return JSON.stringify(v);
        }

        if (typeof v === "function") {
            return v.name ? `[Function ${v.name}]` : "[Function anonymous]";
        }

        return "<unknown>";
    } catch {
        return "<unserializable>";
    }
}

/**
 * Helper for enforcing exhaustive checks in discriminated unions.
 *
 * @param value - Value that should be impossible at this point in the control
 *   flow.
 * @param context - Optional label describing the check site.
 *
 * @throws Always throws an error including a description of the unexpected
 *   value.
 */
export function assertNever(
    value: never,
    context: string = "exhaustive-check"
): never {
    throw new Error(
        `[${context}] Reached unreachable code with value: ${describeValue(value)}`
    );
}

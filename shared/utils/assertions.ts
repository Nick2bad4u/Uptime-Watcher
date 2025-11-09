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

export function assertNever(
    value: never,
    context: string = "exhaustive-check"
): never {
    throw new Error(
        `[${context}] Reached unreachable code with value: ${describeValue(value)}`
    );
}

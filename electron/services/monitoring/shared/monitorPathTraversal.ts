/**
 * Shared path traversal utilities for monitor payload extraction.
 *
 * @packageDocumentation
 */

const ARRAY_INDEX_TOKEN_PATTERN = /^\d+$/u;

/**
 * Extracts a nested value from an arbitrary payload using a path string.
 *
 * @remarks
 * Supports both:
 * - Dot paths (`details.status.code`)
 * - Optional bracketed array indices (`items[0].value`)
 *
 * @param source - Source payload to traverse.
 * @param path - Path expression.
 * @param options - Path traversal options.
 *
 * @returns Resolved nested value, or `undefined` when traversal fails.
 */
export function extractMonitorValueAtPath(
    source: unknown,
    path: string,
    options: {
        readonly allowArrayIndexTokens?: boolean;
        readonly trimSegments?: boolean;
    } = {}
): unknown {
    if (typeof path !== "string") {
        return undefined;
    }

    const trimSegments = options.trimSegments ?? true;
    const normalizedPath = trimSegments ? path.trim() : path;
    if (normalizedPath.length === 0) {
        return undefined;
    }

    const segments = normalizedPath
        .split(".")
        .map((segment) => (trimSegments ? segment.trim() : segment))
        .filter((segment) => segment.length > 0);

    let current: unknown = source;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }

        if (options.allowArrayIndexTokens ?? false) {
            const tokens = segment
                .split("[")
                .map((token) => token.replaceAll("]", ""));
            const [firstToken, ...indexTokens] = tokens;
            const propertyToken = firstToken ?? "";

            if (propertyToken.length > 0) {
                if (
                    typeof current !== "object" ||
                    !Object.hasOwn(current, propertyToken)
                ) {
                    return undefined;
                }

                current = Reflect.get(current, propertyToken);
            }

            for (const indexToken of indexTokens) {
                if (!ARRAY_INDEX_TOKEN_PATTERN.test(indexToken)) {
                    return undefined;
                }

                if (!Array.isArray(current)) {
                    return undefined;
                }

                const parsedIndex = Number.parseInt(indexToken, 10);
                current = current[parsedIndex];
            }
        } else {
            if (typeof current !== "object" || !Object.hasOwn(current, segment)) {
                return undefined;
            }

            current = Reflect.get(current, segment);
        }
    }

    return current;
}

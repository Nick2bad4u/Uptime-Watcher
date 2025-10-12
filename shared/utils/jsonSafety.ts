/**
 * Result envelope returned by safe JSON helpers.
 *
 * @remarks
 * Operations capture thrown errors and expose them as structured metadata so
 * callers never deal with exceptions during normal control flow.
 */
export interface SafeJsonResult<T> {
    /** Parsed value when the operation succeeds. */
    data?: T;
    /**
     * Descriptive error message when the operation fails. Present only when
     * {@link SafeJsonResult.success} is `false`.
     */
    error?: string;
    /** Indicates whether the underlying operation completed successfully. */
    success: boolean;
}

/**
 * Normalizes an unknown value into an {@link Error} instance.
 *
 * @param error - Arbitrary error-like value caught during JSON operations.
 *
 * @returns A proper {@link Error} instance describing the problem.
 *
 * @internal
 */
function ensureError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

/**
 * Executes an operation and converts thrown errors into {@link SafeJsonResult}
 * objects.
 *
 * @remarks
 * When the operation succeeds the resolved data is returned with `success`
 * flagged `true`. Any thrown error is converted into a formatted message,
 * optionally prefixed, keeping control flow exception-free.
 *
 * @typeParam T - Value returned by the wrapped operation.
 *
 * @param operation - Callback that performs the JSON work.
 * @param errorPrefix - Prefix describing the failing operation for diagnostics.
 *
 * @returns Structured result describing success or failure.
 *
 * @internal
 */
function safeOperation<T>(
    operation: () => T,
    errorPrefix: string
): SafeJsonResult<T> {
    try {
        const result = operation();
        return { data: result, success: true };
    } catch (error) {
        const errorObj = ensureError(error);

        // For custom TypeErrors (validation failures), return the message
        // directly For JSON.parse errors, add the prefix
        const errorMessage =
            errorObj instanceof TypeError &&
            (errorObj.message.includes("does not match expected type") ||
                errorObj.message.includes("is not an array") ||
                errorObj.message.includes("cannot be serialized"))
                ? errorObj.message
                : `${errorPrefix}: ${errorObj.message}`;

        return {
            error: errorMessage,
            success: false,
        };
    }
}

/**
 * Parses a JSON string and validates the resulting value with a type guard.
 *
 * @remarks
 * Any failure—syntactic or semantic—becomes a structured error message inside
 * the returned {@link SafeJsonResult} object, so callers never need try/catch
 * for parsing.
 *
 * @example
 *
 * ```typescript
 * const result = safeJsonParse(jsonString, (data): data is User => {
 *     return (
 *         typeof data === "object" &&
 *         data !== null &&
 *         typeof (data as User).id === "string" &&
 *         typeof (data as User).name === "string"
 *     );
 * });
 *
 * if (result.success && result.data) {
 *     console.log(result.data.name);
 * } else {
 *     console.error(result.error);
 * }
 * ```
 *
 * @typeParam T - Validated shape returned on success.
 *
 * @param json - Raw JSON string to parse.
 * @param validator - Custom type guard ensuring the parsed value satisfies `T`.
 *
 * @returns Structured result containing either the parsed value or a message.
 */
export function safeJsonParse<T>(
    json: string,
    validator: (data: unknown) => data is T
): SafeJsonResult<T> {
    return safeOperation(() => {
        const parsed: unknown = JSON.parse(json);

        if (validator(parsed)) {
            return parsed;
        }

        throw new TypeError("Parsed data does not match expected type");
    }, "JSON parsing failed");
}

/**
 * Parses a JSON array and validates each element.
 *
 * @remarks
 * Ensures the top-level value is an array before validating each element using
 * the supplied guard. The first failing element aborts validation and surfaces
 * an informative error message.
 *
 * @example
 *
 * ```typescript
 * const result = safeJsonParseArray(
 *     jsonString,
 *     (item): item is User => typeof item === "object" && item !== null
 * );
 * ```
 *
 * @typeParam T - Element type expected inside the array.
 *
 * @param json - Raw JSON string to parse.
 * @param elementValidator - Type guard applied to each array element.
 *
 * @returns Structured result containing a typed array or an error message.
 */
export function safeJsonParseArray<T>(
    json: string,
    elementValidator: (item: unknown) => item is T
): SafeJsonResult<T[]> {
    return safeOperation(() => {
        const parsed: unknown = JSON.parse(json);

        if (!Array.isArray(parsed)) {
            throw new TypeError("Parsed data is not an array");
        }

        // Validate all elements
        for (const [i, element] of parsed.entries()) {
            if (!elementValidator(element)) {
                throw new TypeError(
                    `Array element at index ${i} does not match expected type`
                );
            }
        }

        // Type assertion is safe here as we've validated all elements
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe cast after validation of all elements in parsed array
        return parsed as T[];
    }, "JSON parsing failed");
}

/**
 * Parses JSON with validation and returns a fallback on failure.
 *
 * @remarks
 * Delegates to {@link safeJsonParse}. When parsing fails the provided fallback
 * is returned, ensuring callers always receive a value of type `T`.
 *
 * @example
 *
 * ```typescript
 * const config = safeJsonParseWithFallback(
 *     configString,
 *     (data): data is Config => isValidConfig(data),
 *     { timeout: 5000, retries: 3 }
 * );
 * ```
 *
 * @typeParam T - Validated shape returned on success or fallback.
 *
 * @param json - Raw JSON string to parse.
 * @param validator - Type guard ensuring the parsed value satisfies `T`.
 * @param fallback - Value returned when parsing or validation fails.
 *
 * @returns The validated data or the provided fallback.
 */
export function safeJsonParseWithFallback<T>(
    json: string,
    validator: (data: unknown) => data is T,
    fallback: T
): T {
    const result = safeJsonParse(json, validator);
    return result.success && result.data !== undefined ? result.data : fallback;
}

/**
 * Serializes a value to JSON without throwing.
 *
 * @remarks
 * The helper surfaces serialization failures (for example, circular references)
 * as structured errors. The optional `space` parameter mirrors
 * {@link JSON.stringify} formatting behaviour.
 *
 * @example
 *
 * ```typescript
 * const result = safeJsonStringify({ name: "John", age: 30 });
 * if (result.success) {
 *     console.log(result.data); // {"name":"John","age":30}
 * }
 * ```
 *
 * @param value - Arbitrary value to serialize.
 * @param space - Formatting argument passed to {@link JSON.stringify}.
 *
 * @returns Structured result containing the JSON string or an error message.
 */
export function safeJsonStringify(
    value: unknown,
    space?: number | string
): SafeJsonResult<string> {
    return safeOperation(() => {
        const jsonString = JSON.stringify(value, undefined, space);

        if (typeof jsonString !== "string") {
            throw new TypeError("Value cannot be serialized to JSON");
        }

        return jsonString;
    }, "JSON stringification failed");
}

/**
 * Serializes a value to JSON and returns a fallback string on failure.
 *
 * @remarks
 * Delegates to {@link safeJsonStringify}, guaranteeing a string return value
 * without requiring consumers to inspect the intermediate result envelope.
 *
 * @example
 *
 * ```typescript
 * const jsonString = safeJsonStringifyWithFallback(data, "{}");
 * ```
 *
 * @param value - Arbitrary value to serialize.
 * @param fallback - String returned when serialization fails.
 * @param space - Formatting argument passed to {@link JSON.stringify}.
 *
 * @returns The serialized JSON string or the provided fallback.
 */
export function safeJsonStringifyWithFallback(
    value: unknown,
    fallback: string,
    space?: number | string
): string {
    const result = safeJsonStringify(value, space);
    return result.success && result.data !== undefined ? result.data : fallback;
}

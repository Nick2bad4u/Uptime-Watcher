/**
 * Type-safe JSON parsing utilities.
 * Provides safe alternatives to JSON.parse with proper error handling and validation.
 */

/**
 * Safe JSON parsing result.
 */
export interface SafeJsonResult<T> {
    data?: T;
    error?: string;
    success: boolean;
}

/**
 * Ensures an error object is properly typed and formatted.
 *
 * @internal
 * @param error - Unknown error value to convert to Error instance
 * @returns Properly typed Error object
 */
function ensureError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

/**
 * Wraps any operation with consistent error handling for SafeJsonResult pattern.
 *
 * @param operation - Function to execute safely
 * @param errorPrefix - Prefix for error messages
 * @returns Safe result object with data or error
 *
 * @throws Never throws - all errors are captured and returned in the result object
 *
 * @internal Helper function to eliminate error handling duplication
 */
function safeOperation<T>(
    operation: () => T,
    errorPrefix: string
): SafeJsonResult<T> {
    try {
        const result = operation();
        return { data: result, success: true };
    } catch (error) {
        return {
            error: `${errorPrefix}: ${ensureError(error).message}`,
            success: false,
        };
    }
}

/**
 * Safely parse JSON string with type validation.
 *
 * @param json - JSON string to parse
 * @param validator - Type guard function to validate the parsed data
 * @returns Safe result object with parsed data or error
 *
 * @throws Never throws - all errors are captured and returned in the result object
 *
 * @example
 * ```typescript
 * const result = safeJsonParse(jsonString, (data): data is User => {
 *     return typeof data === "object" && data !== null &&
 *            typeof data.id === "string" && typeof data.name === "string";
 * });
 *
 * if (result.success) {
 *     console.log(result.data.name); // Type-safe access
 * } else {
 *     console.error(result.error);
 * }
 * ```
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
 * Parse JSON array with element validation.
 *
 * @param json - JSON string to parse
 * @param elementValidator - Type guard for array elements
 * @returns Safe result object with validated array or error
 *
 * @throws Never throws - all errors are captured and returned in the result object
 *
 * @example
 * ```typescript
 * const result = safeJsonParseArray(
 *     jsonString,
 *     (item): item is User => typeof item === "object" && item !== null
 * );
 * ```
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

        return parsed as T[];
    }, "JSON parsing failed");
}

/**
 * Safely parse JSON string with fallback value.
 *
 * @param json - JSON string to parse
 * @param validator - Type guard function to validate the parsed data
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed data if successful, fallback if failed
 *
 * @throws Never throws - parsing errors result in fallback value being returned
 *
 * @example
 * ```typescript
 * const config = safeJsonParseWithFallback(
 *     configString,
 *     (data): data is Config => isValidConfig(data),
 *     { timeout: 5000, retries: 3 }
 * );
 * ```
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
 * Safely stringify any value to JSON.
 *
 * @param value - Value to stringify
 * @param space - Space parameter for JSON.stringify (for formatting)
 * @returns Safe result object with JSON string or error
 *
 * @throws Never throws - all errors are captured and returned in the result object
 *
 * @example
 * ```typescript
 * const result = safeJsonStringify({ name: "John", age: 30 });
 * if (result.success) {
 *     console.log(result.data); // {"name":"John","age":30}
 * }
 * ```
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
 * Safely stringify value with fallback.
 *
 * @param value - Value to stringify
 * @param fallback - Fallback string if stringification fails
 * @param space - Space parameter for JSON.stringify (for formatting)
 * @returns JSON string if successful, fallback if failed
 *
 * @throws Never throws - stringification errors result in fallback value being returned
 *
 * @example
 * ```typescript
 * const jsonString = safeJsonStringifyWithFallback(data, "{}");
 * ```
 */
export function safeJsonStringifyWithFallback(
    value: unknown,
    fallback: string,
    space?: number | string
): string {
    const result = safeJsonStringify(value, space);
    return result.success && result.data !== undefined ? result.data : fallback;
}

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
 * Safely parse JSON string with type validation.
 *
 * @param json - JSON string to parse
 * @param validator - Type guard function to validate the parsed data
 * @returns Safe result object with parsed data or error
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
export function safeJsonParse<T>(json: string, validator: (data: unknown) => data is T): SafeJsonResult<T> {
    try {
        const parsed: unknown = JSON.parse(json);

        if (validator(parsed)) {
            return {
                data: parsed,
                success: true,
            };
        }

        return {
            error: "Parsed data does not match expected type",
            success: false,
        };
    } catch (error) {
        return {
            error: `JSON parsing failed: ${ensureError(error).message}`,
            success: false,
        };
    }
}

/**
 * Parse JSON array with element validation.
 *
 * @param json - JSON string to parse
 * @param elementValidator - Type guard for array elements
 * @returns Safe result object with validated array or error
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
    try {
        const parsed: unknown = JSON.parse(json);

        if (!Array.isArray(parsed)) {
            return {
                error: "Parsed data is not an array",
                success: false,
            };
        }

        // Validate all elements
        for (const [i, element] of parsed.entries()) {
            if (!elementValidator(element)) {
                return {
                    error: `Array element at index ${i} does not match expected type`,
                    success: false,
                };
            }
        }

        return {
            data: parsed as T[],
            success: true,
        };
    } catch (error) {
        return {
            error: `JSON parsing failed: ${ensureError(error).message}`,
            success: false,
        };
    }
}

/**
 * Safely parse JSON string with fallback value.
 *
 * @param json - JSON string to parse
 * @param validator - Type guard function to validate the parsed data
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed data if successful, fallback if failed
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
export function safeJsonParseWithFallback<T>(json: string, validator: (data: unknown) => data is T, fallback: T): T {
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
 * @example
 * ```typescript
 * const result = safeJsonStringify({ name: "John", age: 30 });
 * if (result.success) {
 *     console.log(result.data); // {"name":"John","age":30}
 * }
 * ```
 */
export function safeJsonStringify(value: unknown, space?: number | string): SafeJsonResult<string> {
    try {
        const jsonString = JSON.stringify(value, undefined, space);

        if (typeof jsonString !== "string") {
            return {
                error: "Value cannot be serialized to JSON",
                success: false,
            };
        }

        return {
            data: jsonString,
            success: true,
        };
    } catch (error) {
        return {
            error: `JSON stringification failed: ${ensureError(error).message}`,
            success: false,
        };
    }
}

/**
 * Safely stringify value with fallback.
 *
 * @param value - Value to stringify
 * @param fallback - Fallback string if stringification fails
 * @param space - Space parameter for JSON.stringify (for formatting)
 * @returns JSON string if successful, fallback if failed
 *
 * @example
 * ```typescript
 * const jsonString = safeJsonStringifyWithFallback(data, "{}");
 * ```
 */
export function safeJsonStringifyWithFallback(value: unknown, fallback: string, space?: number | string): string {
    const result = safeJsonStringify(value, space);
    return result.success && result.data !== undefined ? result.data : fallback;
}

/**
 * Ensures an error object is properly typed and formatted.
 */
function ensureError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

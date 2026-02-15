/**
 * Result envelope returned by safe JSON helpers.
 *
 * @remarks
 * Operations capture thrown errors and expose them as structured metadata so
 * callers never deal with exceptions during normal control flow.
 */
import type { Jsonifiable, JsonValue, UnknownRecord } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { collectOwnPropertyValuesSafely } from "@shared/utils/objectIntrospection";
import { isObject } from "@shared/utils/typeGuards";
import { objectHasOwn } from "ts-extras";

/**
 * Result tuple produced by the safe JSON helpers.
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

class JsonValidationError extends TypeError {
    public constructor(message: string) {
        super(message);
        this.name = "JsonValidationError";
    }
}

/**
 * Attempts to parse a JSON string into a plain object record.
 *
 * @remarks
 * This is intentionally strict: arrays are rejected.
 *
 * Use this when you need best-effort extraction from third-party payloads (e.g.
 * OAuth error bodies) without throwing.
 */
export function tryParseJsonRecord(text: string): null | UnknownRecord {
    try {
        const parsed: unknown = JSON.parse(text);
        return isObject(parsed) ? parsed : null;
    } catch {
        return null;
    }
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

        // For internal validation failures, return the message directly.
        // For JSON.parse errors, add the prefix.
        const errorMessage =
            errorObj instanceof JsonValidationError
                ? errorObj.message
                : `${errorPrefix}: ${errorObj.message}`;

        return {
            error: errorMessage,
            success: false,
        };
    }
}

const collectObjectValues = collectOwnPropertyValuesSafely;

const hasDescriptorValue = (
    descriptor: PropertyDescriptor | undefined
): descriptor is PropertyDescriptor & { value: unknown } =>
    Boolean(descriptor && objectHasOwn(descriptor, "value"));

const isNonNullObject = (value: unknown): value is object =>
    typeof value === "object" && value !== null;

const hasSerializableContent = (
    value: unknown,
    seen = new WeakSet<object>()
): boolean => {
    if (value === null) {
        return true;
    }

    if (!isNonNullObject(value)) {
        const primitiveType = typeof value;
        return (
            primitiveType === "string" ||
            primitiveType === "number" ||
            primitiveType === "boolean"
        );
    }

    const target: object = value;
    if (seen.has(target)) {
        throw new TypeError("Circular reference detected");
    }

    seen.add(target);

    const entries = collectObjectValues(target);

    try {
        if (entries.length === 0) {
            return true;
        }

        return entries.some((entry) => hasSerializableContent(entry, seen));
    } finally {
        seen.delete(target);
    }
};

const hasUnsupportedJsonValue = (
    value: unknown,
    seen = new WeakSet<object>()
): boolean => {
    if (value === null) {
        return false;
    }

    const valueType = typeof value;
    if (valueType === "bigint" || valueType === "symbol") {
        return true;
    }

    if (valueType === "function" || valueType === "undefined") {
        return false;
    }

    if (!isNonNullObject(value)) {
        return false;
    }

    const target: object = value;
    if (seen.has(target)) {
        return false;
    }

    seen.add(target);

    try {
        if (Array.isArray(value)) {
            return value.some((entry) => hasUnsupportedJsonValue(entry, seen));
        }

        for (const key of Reflect.ownKeys(target)) {
            const descriptor = Object.getOwnPropertyDescriptor(target, key);
            if (
                hasDescriptorValue(descriptor) &&
                hasUnsupportedJsonValue(descriptor.value, seen)
            ) {
                return true;
            }
        }

        return false;
    } finally {
        seen.delete(target);
    }
};

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
 * import { logger } from "@app/services/logger";
 *
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
 *     logger.info("Parsed user", { name: result.data.name });
 * } else {
 *     logger.error("Failed to parse user", result.error);
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
export function safeJsonParse<T extends JsonValue>(
    json: string,
    validator: (data: unknown) => data is T
): SafeJsonResult<T> {
    return safeOperation(() => {
        const parsed: unknown = JSON.parse(json);

        if (validator(parsed)) {
            return parsed;
        }

        throw new JsonValidationError(
            "Parsed data does not match expected type"
        );
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
 * import { logger } from "@app/services/logger";
 *
 * const result = safeJsonParseArray(
 *     jsonString,
 *     (item): item is User => typeof item === "object" && item !== null
 * );
 *
 * if (result.success) {
 *     logger.info("Parsed users", { count: result.data.length });
 * }
 * ```
 *
 * @typeParam T - Element type expected inside the array.
 *
 * @param json - Raw JSON string to parse.
 * @param elementValidator - Type guard applied to each array element.
 *
 * @returns Structured result containing a typed array or an error message.
 */
export function safeJsonParseArray<T extends JsonValue>(
    json: string,
    elementValidator: (item: unknown) => item is T
): SafeJsonResult<T[]> {
    return safeOperation(() => {
        // JSON.parse returns unknown runtime data which is validated below.

        const parsedValue: unknown = JSON.parse(json);

        if (!Array.isArray(parsedValue)) {
            throw new JsonValidationError("Parsed data is not an array");
        }

        const typedArray: T[] = [];

        parsedValue.forEach((element, index) => {
            if (!elementValidator(element)) {
                throw new JsonValidationError(
                    `Array element at index ${index} does not match expected type`
                );
            }

            typedArray.push(element);
        });

        return typedArray;
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
export function safeJsonParseWithFallback<T extends JsonValue>(
    json: string,
    validator: (data: unknown) => data is T,
    fallback: T
): T {
    const result = safeJsonParse(json, validator);
    if (result.success && result.data !== undefined) {
        return result.data;
    }
    return fallback;
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
 * import { logger } from "@app/services/logger";
 *
 * const result = safeJsonStringify({ name: "John", age: 30 });
 * if (result.success) {
 *     logger.info("Serialized JSON", { payload: result.data });
 * }
 * ```
 *
 * @param value - Arbitrary value to serialize.
 * @param space - Formatting argument passed to {@link JSON.stringify}.
 *
 * @returns Structured result containing the JSON string or an error message.
 */
export function safeJsonStringify(
    value: Jsonifiable,
    space?: number | string
): SafeJsonResult<string> {
    return safeOperation(() => {
        if (!hasSerializableContent(value)) {
            throw new TypeError("Value cannot be serialized to JSON");
        }

        const jsonString = JSON.stringify(value, undefined, space);

        if (typeof jsonString !== "string") {
            throw new TypeError("Value cannot be serialized to JSON");
        }

        return jsonString;
    }, "JSON serialization failed");
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
    value: Jsonifiable,
    fallback: string,
    space?: number | string
): string {
    if (!Array.isArray(value) && hasUnsupportedJsonValue(value)) {
        return fallback;
    }

    const result = safeJsonStringify(value, space);
    return result.success && result.data !== undefined ? result.data : fallback;
}

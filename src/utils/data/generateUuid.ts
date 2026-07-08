/**
 * Utility function for generating unique identifiers.
 *
 * @remarks
 * Uses `crypto.randomUUID` when available and falls back to
 * `crypto.getRandomValues` otherwise. Throws when secure randomness is not
 * available.
 *
 * @public
 */

import {
    getCallableDataProperty,
    getOwnPropertyValue,
} from "@shared/utils/errorPropertyAccess";

const SECURE_RANDOM_UNAVAILABLE_MESSAGE =
    "Secure random ID generation is unavailable" as const;

const STANDARD_UUID_PATTERN =
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;

type RandomUuid = () => string;
type GetRandomValues = (values: Uint32Array) => void;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

function getCryptoObject(): object | undefined {
    const property = getOwnPropertyValue(globalThis, "crypto");
    return property.found && isObjectLike(property.value)
        ? property.value
        : undefined;
}

function getCryptoRandomUuid(cryptoObject: object): RandomUuid | undefined {
    const candidate = getCallableDataProperty(cryptoObject, "randomUUID");
    if (!candidate) {
        return undefined;
    }

    return () => {
        const value = Reflect.apply(candidate, cryptoObject, []);
        return typeof value === "string" ? value : "";
    };
}

function getCryptoRandomValues(
    cryptoObject: object
): GetRandomValues | undefined {
    const candidate = getCallableDataProperty(cryptoObject, "getRandomValues");
    if (!candidate) {
        return undefined;
    }

    return (values: Uint32Array): void => {
        Reflect.apply(candidate, cryptoObject, [values]);
    };
}

/**
 * Generate a unique identifier string using crypto.randomUUID.
 *
 * @remarks
 * When crypto.randomUUID is available, returns a standard UUID. When
 * unavailable, falls back to a custom ID format backed by
 * `crypto.getRandomValues`: `site-{random}`.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (when crypto is available)
 * // or: "site-abc123def456" (getRandomValues fallback)
 * ```
 *
 * @returns A UUID string in standard format or secure fallback format.
 *
 * @throws Error when neither `crypto.randomUUID` nor `crypto.getRandomValues`
 *   is available.
 *
 * @public
 */
export function generateUuid(): string {
    const cryptoObject = getCryptoObject();
    const randomUuid = cryptoObject
        ? getCryptoRandomUuid(cryptoObject)
        : undefined;
    try {
        if (randomUuid) {
            const candidate = randomUuid();
            if (STANDARD_UUID_PATTERN.test(candidate)) {
                return candidate;
            }
        }
    } catch {
        // Crypto.randomUUID failed; try the getRandomValues fallback below.
    }

    const randomPart = tryGenerateCryptoFallbackId();
    if (randomPart) {
        return `site-${randomPart}`;
    }

    throw new Error(SECURE_RANDOM_UNAVAILABLE_MESSAGE);
}

function toBaseThirtySixSixChars(value: number): string {
    return value.toString(36).padStart(6, "0").slice(-6);
}

function tryGenerateCryptoFallbackId(): string | undefined {
    const cryptoObject = getCryptoObject();
    const getRandomValues = cryptoObject
        ? getCryptoRandomValues(cryptoObject)
        : undefined;
    if (!getRandomValues) {
        return undefined;
    }

    try {
        const values = new Uint32Array(2);
        getRandomValues(values);
        return (
            toBaseThirtySixSixChars(values[0] ?? 0) +
            toBaseThirtySixSixChars(values[1] ?? 0)
        );
    } catch {
        return undefined;
    }
}

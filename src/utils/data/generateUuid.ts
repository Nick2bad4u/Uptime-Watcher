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
import { arrayJoin } from "ts-extras";

const SECURE_RANDOM_UNAVAILABLE_MESSAGE =
    "Secure random ID generation is unavailable" as const;

const STANDARD_UUID_PATTERN =
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;

type RandomUuid = () => string;
type GetRandomValues = (values: Uint8Array) => void;

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

    return (values: Uint8Array): void => {
        Reflect.apply(candidate, cryptoObject, [values]);
    };
}

/**
 * Generate a unique identifier string using crypto.randomUUID.
 *
 * @remarks
 * When crypto.randomUUID is available, returns a standard UUID. When
 * unavailable, falls back to a UUID v4 generated from
 * `crypto.getRandomValues`.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (when crypto is available)
 * // or: "f47ac10b-58cc-4372-a567-0e02b2c3d479" (getRandomValues fallback)
 * ```
 *
 * @returns A UUID string in standard format.
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
        return randomPart;
    }

    throw new Error(SECURE_RANDOM_UNAVAILABLE_MESSAGE);
}

function formatUuidV4(bytes: Uint8Array): string {
    const uuidBytes = new Uint8Array(bytes);
    uuidBytes[6] = ((uuidBytes[6] ?? 0) % 16) + 0x40;
    uuidBytes[8] = ((uuidBytes[8] ?? 0) % 64) + 0x80;

    const hex = Array.from(uuidBytes, (byte) =>
        byte.toString(16).padStart(2, "0")
    );
    const groups = [
        arrayJoin(hex.slice(0, 4), ""),
        arrayJoin(hex.slice(4, 6), ""),
        arrayJoin(hex.slice(6, 8), ""),
        arrayJoin(hex.slice(8, 10), ""),
        arrayJoin(hex.slice(10, 16), ""),
    ];

    return arrayJoin(groups, "-");
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
        const values = new Uint8Array(16);
        getRandomValues(values);
        return formatUuidV4(values);
    } catch {
        return undefined;
    }
}

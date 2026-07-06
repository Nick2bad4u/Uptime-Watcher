import type { Tagged } from "type-fest";

import {
    getCallableDataProperty,
    getOwnPropertyValue,
} from "@shared/utils/errorPropertyAccess";
import { isValidLowercaseHexString } from "@shared/validation/validatorUtils";
import { arrayJoin } from "ts-extras";

/**
 * Branded correlation identifier shared by event metadata, IPC diagnostics, and
 * structured logging.
 */
export type CorrelationId = Tagged<string, "correlation-id">;

type GetRandomValues = Crypto["getRandomValues"];

const isGetRandomValues = (value: unknown): value is GetRandomValues =>
    typeof value === "function";

const getCryptoDataMethod = (
    cryptoInstance: object,
    methodName: "getRandomValues"
): GetRandomValues | undefined => {
    const candidate = getCallableDataProperty(cryptoInstance, methodName);
    return isGetRandomValues(candidate) ? candidate : undefined;
};

const resolveWebCrypto = (): object | null => {
    const property = getOwnPropertyValue(globalThis, "crypto");
    const candidate = property.found ? property.value : undefined;
    if (
        typeof candidate === "object" &&
        candidate !== null &&
        getCryptoDataMethod(candidate, "getRandomValues")
    ) {
        return candidate;
    }
    return null;
};

const getRandomBytes = (length: number): Uint8Array => {
    const cryptoInstance = resolveWebCrypto();
    if (!cryptoInstance) {
        throw new Error(
            "Web Crypto API is required to generate correlation IDs"
        );
    }

    const bytes = new Uint8Array(length);
    const getRandomValues = getCryptoDataMethod(
        cryptoInstance,
        "getRandomValues"
    );

    if (!getRandomValues) {
        throw new Error(
            "Web Crypto API is required to generate correlation IDs"
        );
    }

    getRandomValues.call(cryptoInstance, bytes);
    return bytes;
};

const convertBytesToHex = (bytes: Uint8Array): string => {
    const hexFragments: string[] = Array.from({ length: bytes.length });
    bytes.forEach((byte, index) => {
        hexFragments[index] = byte.toString(16).padStart(2, "0");
    });
    return arrayJoin(hexFragments, "");
};

const isCorrelationId = (value: unknown): value is CorrelationId =>
    isValidLowercaseHexString(value, 16);

export const generateCorrelationId = (): CorrelationId => {
    let attempts = 0;
    while (attempts < 3) {
        const hex = convertBytesToHex(getRandomBytes(8));
        if (isCorrelationId(hex)) {
            return hex;
        }
        attempts += 1;
    }
    throw new Error("Failed to generate correlation id after 3 attempts");
};

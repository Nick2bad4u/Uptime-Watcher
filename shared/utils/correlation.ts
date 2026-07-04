import type { CorrelationId } from "@shared/types/events";

import { isValidLowercaseHexString } from "@shared/validation/validatorUtils";
import { arrayJoin, safeCastTo } from "ts-extras";

type GetRandomValues = Crypto["getRandomValues"];

const isGetRandomValues = (value: unknown): value is GetRandomValues =>
    typeof value === "function";

const getCryptoDataMethod = (
    cryptoInstance: Crypto,
    methodName: "getRandomValues"
): GetRandomValues | undefined => {
    let current: object | null = cryptoInstance;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(current, methodName);

        if (descriptor) {
            const value: unknown = descriptor.value;
            return "value" in descriptor && isGetRandomValues(value)
                ? value
                : undefined;
        }

        const prototype: unknown = Object.getPrototypeOf(current);
        current =
            typeof prototype === "object" && prototype !== null
                ? prototype
                : null;
    }

    return undefined;
};

const resolveWebCrypto = (): Crypto | null => {
    const candidate = safeCastTo<Crypto | undefined>(
        Reflect.get(globalThis, "crypto")
    );
    if (candidate && getCryptoDataMethod(candidate, "getRandomValues")) {
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

export const isCorrelationId = (value: unknown): value is CorrelationId =>
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

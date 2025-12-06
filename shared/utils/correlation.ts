import type { CorrelationId } from "@shared/types/events";

const HEX_STRING_PATTERN = /^[a-f0-9]{16}$/v;

const resolveWebCrypto = (): Crypto | null => {
    const candidate = Reflect.get(globalThis, "crypto") as Crypto | undefined;
    if (candidate && typeof candidate.getRandomValues === "function") {
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

    return cryptoInstance.getRandomValues(new Uint8Array(length));
};

const convertBytesToHex = (bytes: Uint8Array): string => {
    const hexFragments: string[] = Array.from({ length: bytes.length });
    bytes.forEach((byte, index) => {
        hexFragments[index] = byte.toString(16).padStart(2, "0");
    });
    return hexFragments.join("");
};

export const isCorrelationId = (value: unknown): value is CorrelationId =>
    typeof value === "string" && HEX_STRING_PATTERN.test(value);

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

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateCorrelationId } from "../../utils/correlation";

const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "crypto"
);

function restoreCrypto(): void {
    if (originalCryptoDescriptor) {
        Object.defineProperty(globalThis, "crypto", originalCryptoDescriptor);
        return;
    }

    Reflect.deleteProperty(globalThis, "crypto");
}

describe(generateCorrelationId, () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        restoreCrypto();
    });

    it("uses getRandomValues methods defined on the prototype", () => {
        class PrototypeCrypto {
            public getRandomValues<T extends ArrayBufferView | null>(
                array: T
            ): T {
                if (array instanceof Uint8Array) {
                    array.fill(0xab);
                }
                return array;
            }
        }

        vi.stubGlobal("crypto", new PrototypeCrypto());

        expect(generateCorrelationId()).toBe("abababababababab");
    });

    it("does not invoke accessor-backed getRandomValues properties", () => {
        let accessCount = 0;
        const cryptoCandidate = {};
        Object.defineProperty(cryptoCandidate, "getRandomValues", {
            configurable: true,
            enumerable: true,
            get: () => {
                accessCount += 1;
                throw new Error("Unexpected getRandomValues getter access");
            },
        });

        vi.stubGlobal("crypto", cryptoCandidate);

        expect(() => generateCorrelationId()).toThrow(
            "Web Crypto API is required to generate correlation IDs"
        );
        expect(accessCount).toBe(0);
    });

    it("treats throwing global crypto accessors as unavailable", () => {
        Object.defineProperty(globalThis, "crypto", {
            configurable: true,
            enumerable: true,
            get() {
                throw new Error("crypto unavailable");
            },
        });

        expect(() => generateCorrelationId()).toThrow(
            "Web Crypto API is required to generate correlation IDs"
        );
    });
});

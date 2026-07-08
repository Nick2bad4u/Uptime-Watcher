/**
 * @remarks
 * These tests intentionally assert **observable behavior** (format, uniqueness,
 * and feature-detection fallbacks) rather than internal implementation details
 * (e.g. Math.random call counts or exact string outputs).
 *
 * @file Comprehensive tests for {@link generateUuid}.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../../../utils/data/generateUuid";

const FALLBACK_ID_REGEX =
    /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/v;
const SECURE_RANDOM_UNAVAILABLE_MESSAGE =
    "Secure random ID generation is unavailable";

interface CryptoLike {
    getRandomValues?: (array: Uint8Array) => Uint8Array;
    randomUUID?: () => string;
}

function installCryptoMock(cryptoValue: CryptoLike | undefined): {
    restore: () => void;
} {
    const original = crypto;
    // The runtime property is writable in tests; TS type is readonly.
    globalThis.crypto = cryptoValue as unknown as Crypto;
    return {
        restore: () => {
            globalThis.crypto = original;
        },
    };
}

describe(generateUuid, () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe("native crypto.randomUUID Behavior", () => {
        it("should use crypto.randomUUID when available", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const randomUUID = vi
                .fn()
                .mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
            const getRandomValues = vi.fn();

            const { restore } = installCryptoMock({
                getRandomValues,
                randomUUID,
            });

            try {
                const result = generateUuid();

                expect(result).toBe("123e4567-e89b-12d3-a456-426614174000");
                expect(randomUUID).toHaveBeenCalledTimes(1);
                expect(getRandomValues).not.toHaveBeenCalled();
            } finally {
                restore();
            }
        });

        it("should fall back when crypto.randomUUID returns an empty string", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const randomUUID = vi.fn().mockReturnValue("");
            const getRandomValues = vi
                .fn()
                .mockImplementation((array: Uint8Array) => {
                    array.fill(1);
                    return array;
                });
            const { restore } = installCryptoMock({
                getRandomValues,
                randomUUID,
            });

            try {
                expect(generateUuid()).toMatch(FALLBACK_ID_REGEX);
                expect(randomUUID).toHaveBeenCalledTimes(1);
                expect(getRandomValues).toHaveBeenCalledTimes(1);
            } finally {
                restore();
            }
        });

        it("should fall back when crypto.randomUUID returns a malformed UUID", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const randomUUID = vi.fn().mockReturnValue("not-a-real-uuid");
            const getRandomValues = vi
                .fn()
                .mockImplementation((array: Uint8Array) => {
                    array.fill(3);
                    return array;
                });
            const { restore } = installCryptoMock({
                getRandomValues,
                randomUUID,
            });

            try {
                expect(generateUuid()).toMatch(FALLBACK_ID_REGEX);
                expect(randomUUID).toHaveBeenCalledTimes(1);
                expect(getRandomValues).toHaveBeenCalledTimes(1);
            } finally {
                restore();
            }
        });

        it("should not invoke accessor-backed crypto methods", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            let accessorCalls = 0;
            const cryptoCandidate = {};
            Object.defineProperty(cryptoCandidate, "randomUUID", {
                configurable: true,
                enumerable: true,
                get() {
                    accessorCalls += 1;
                    return () => "hidden";
                },
            });
            Object.defineProperty(cryptoCandidate, "getRandomValues", {
                configurable: true,
                enumerable: true,
                get() {
                    accessorCalls += 1;
                    return (array: Uint32Array) => array;
                },
            });

            const { restore } = installCryptoMock(cryptoCandidate);
            try {
                expect(accessorCalls).toBe(0);
                expect(() => generateUuid()).toThrow(
                    SECURE_RANDOM_UNAVAILABLE_MESSAGE
                );
            } finally {
                restore();
            }
        });
    });

    describe("fallback Behavior", () => {
        it("should fail closed when crypto is unavailable", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { restore } = installCryptoMock(undefined);
            try {
                expect(() => generateUuid()).toThrow(
                    SECURE_RANDOM_UNAVAILABLE_MESSAGE
                );
            } finally {
                restore();
            }
        });

        it("should fall back when crypto.randomUUID exists but throws, and should prefer crypto.getRandomValues when available", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const randomUUID = vi.fn(() => {
                throw new Error("randomUUID failure");
            });
            const getRandomValues = vi
                .fn()
                .mockImplementation((array: Uint8Array) => {
                    array.set([
                        0x12,
                        0x34,
                        0x56,
                        0x78,
                        0x9a,
                        0xbc,
                        0xde,
                        0xf0,
                        0x01,
                        0x23,
                        0x45,
                        0x67,
                        0x89,
                        0xab,
                        0xcd,
                        0xef,
                    ]);
                    return array;
                });

            const { restore } = installCryptoMock({
                getRandomValues,
                randomUUID,
            });

            try {
                const result = generateUuid();

                expect(randomUUID).toHaveBeenCalledTimes(1);
                expect(getRandomValues).toHaveBeenCalledTimes(1);
                expect(result).toMatch(FALLBACK_ID_REGEX);
                expect(result).toBe("12345678-9abc-4ef0-8123-456789abcdef");
            } finally {
                restore();
            }
        });

        it("should fail closed when crypto.getRandomValues throws", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const getRandomValues = vi.fn(() => {
                throw new Error("getRandomValues failure");
            });

            const { restore } = installCryptoMock({ getRandomValues });
            try {
                expect(() => generateUuid()).toThrow(
                    SECURE_RANDOM_UNAVAILABLE_MESSAGE
                );
                expect(getRandomValues).toHaveBeenCalledTimes(1);
            } finally {
                restore();
            }
        });
    });

    describe("uniqueness", () => {
        it("should generate unique fallback IDs under rapid successive calls", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));

            let counter = 0;
            const getRandomValues = vi
                .fn()
                .mockImplementation((array: Uint8Array) => {
                    counter += 1;
                    let remaining = counter;
                    for (let index = array.length - 1; index >= 0; index -= 1) {
                        array[index] = remaining % 256;
                        remaining = Math.floor(remaining / 256);
                    }
                    return array;
                });

            const { restore } = installCryptoMock({ getRandomValues });
            try {
                const ids = Array.from({ length: 1000 }, () => generateUuid());

                expect(new Set(ids).size).toBe(ids.length);

                for (const id of ids) {
                    expect(id).toMatch(FALLBACK_ID_REGEX);
                }
            } finally {
                restore();
            }
        });
    });
});

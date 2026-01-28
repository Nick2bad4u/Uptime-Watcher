/**
 * @file Comprehensive tests for {@link generateUuid}.
 *
 * @remarks
 * These tests intentionally assert **observable behavior** (format, uniqueness,
 * and feature-detection fallbacks) rather than internal implementation details
 * (e.g. Math.random call counts or exact string outputs).
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../../../utils/data/generateUuid";

const FALLBACK_ID_REGEX = /^site-[\da-z]{12}-\d{16}$/;

const toBaseThirtySixSixChars = (value: number): string =>
    value.toString(36).padStart(6, "0").slice(-6);

interface CryptoLike {
    getRandomValues?: (array: Uint32Array) => Uint32Array;
    randomUUID?: () => string;
}

function installCryptoMock(
    cryptoValue: CryptoLike | undefined
): { restore: () => void } {
    const original = globalThis.crypto;
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

    describe("Native crypto.randomUUID Behavior", () => {
        it("should use crypto.randomUUID when available", async ({ task, annotate }) => {
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

        it("should tolerate crypto.randomUUID returning an empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const randomUUID = vi.fn().mockReturnValue("");
            const { restore } = installCryptoMock({ randomUUID });

            try {
                expect(generateUuid()).toBe("");
                expect(randomUUID).toHaveBeenCalledTimes(1);
            } finally {
                restore();
            }
        });
    });

    describe("Fallback Behavior", () => {
        it("should use the fallback format when crypto is unavailable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));
            const now = Date.now();

            const { restore } = installCryptoMock(undefined);
            try {
                const result = generateUuid();

                expect(result).toMatch(FALLBACK_ID_REGEX);
                expect(result).toMatch(
                    new RegExp(String.raw`^site-[\da-z]{12}-${now}\d{3}$`)
                );
            } finally {
                restore();
            }
        });

        it("should fall back when crypto.randomUUID exists but throws, and should prefer crypto.getRandomValues when available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-03-15T10:15:30.500Z"));
            const now = Date.now();

            const partA = 0x12_34_56_78;
            const partB = 0x9a_bc_de_f0;
            const expectedRandomPart = `${toBaseThirtySixSixChars(partA)}${toBaseThirtySixSixChars(partB)}`;

            const randomUUID = vi.fn(() => {
                throw new Error("randomUUID failure");
            });
            const getRandomValues = vi
                .fn()
                .mockImplementation((array: Uint32Array) => {
                    array[0] = partA;
                    array[1] = partB;
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
                expect(result).toMatch(
                    new RegExp(
                        String.raw`^site-${expectedRandomPart}-${now}\d{3}$`
                    )
                );
            } finally {
                restore();
            }
        });

        it("should fall back to the deterministic strategy when crypto.getRandomValues throws", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));
            const now = Date.now();

            const getRandomValues = vi.fn(() => {
                throw new Error("getRandomValues failure");
            });

            const { restore } = installCryptoMock({ getRandomValues });
            try {
                const result = generateUuid();

                expect(getRandomValues).toHaveBeenCalledTimes(1);
                expect(result).toMatch(FALLBACK_ID_REGEX);
                expect(result).toMatch(
                    new RegExp(String.raw`^site-[\da-z]{12}-${now}\d{3}$`)
                );
            } finally {
                restore();
            }
        });
    });

    describe("Uniqueness", () => {
        it("should generate unique fallback IDs under rapid successive calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: generateUuid", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));

            const { restore } = installCryptoMock(undefined);
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

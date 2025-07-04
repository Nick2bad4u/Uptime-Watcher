/**
 * Tests for UUID generation utility.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateUuid } from "../utils/data/generateUuid";

describe("UUID Generation", () => {
    describe("with crypto.randomUUID available", () => {
        beforeEach(() => {
            // Mock crypto.randomUUID
            Object.defineProperty(global, "crypto", {
                value: {
                    randomUUID: vi.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
                },
                configurable: true,
            });
        });

        it("should use crypto.randomUUID when available", () => {
            const uuid = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalled();
            expect(uuid).toBe("123e4567-e89b-12d3-a456-426614174000");
        });

        it("should return valid UUID format", () => {
            const uuid = generateUuid();

            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });
    });

    describe("with crypto.randomUUID unavailable", () => {
        beforeEach(() => {
            // Remove crypto or make randomUUID unavailable
            Object.defineProperty(global, "crypto", {
                value: undefined,
                configurable: true,
            });
        });

        it("should use fallback implementation when crypto is undefined", () => {
            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
        });

        it("should include timestamp in fallback", () => {
            const beforeTime = Date.now();
            const uuid = generateUuid();
            const afterTime = Date.now();

            const timestampMatch = /(\d+)$/.exec(uuid);
            expect(timestampMatch).toBeTruthy();

            if (timestampMatch) {
                const timestamp = parseInt(timestampMatch[1] ?? "");
                expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
                expect(timestamp).toBeLessThanOrEqual(afterTime);
            }
        });

        it("should generate unique IDs in fallback mode", () => {
            const ids = new Set();

            // Generate multiple IDs
            for (let i = 0; i < 100; i++) {
                ids.add(generateUuid());
            }

            // All should be unique
            expect(ids.size).toBe(100);
        });
    });

    describe("with crypto available but no randomUUID method", () => {
        beforeEach(() => {
            // Mock crypto without randomUUID
            Object.defineProperty(global, "crypto", {
                value: {
                    // randomUUID is not defined
                },
                configurable: true,
            });
        });

        it("should use fallback when randomUUID method is not available", () => {
            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
        });
    });

    describe("edge cases", () => {
        it("should handle consecutive calls", () => {
            // Mock crypto to ensure we test the function directly
            Object.defineProperty(global, "crypto", {
                value: {
                    randomUUID: vi
                        .fn()
                        .mockReturnValueOnce("uuid-1")
                        .mockReturnValueOnce("uuid-2")
                        .mockReturnValueOnce("uuid-3"),
                },
                configurable: true,
            });

            const uuid1 = generateUuid();
            const uuid2 = generateUuid();
            const uuid3 = generateUuid();

            expect(uuid1).toBe("uuid-1");
            expect(uuid2).toBe("uuid-2");
            expect(uuid3).toBe("uuid-3");
            expect(crypto.randomUUID).toHaveBeenCalledTimes(3);
        });

        it("should work with fallback in tight loops", () => {
            // Remove crypto to force fallback
            Object.defineProperty(global, "crypto", {
                value: undefined,
                configurable: true,
            });

            const ids = [];
            for (let i = 0; i < 10; i++) {
                ids.push(generateUuid());
            }

            // All should be valid and different
            ids.forEach((id) => {
                expect(id).toMatch(/^site-[a-z0-9]+-\d+$/);
            });

            // Should have different random parts (high probability)
            const randomParts = ids.map((id) => id.split("-")[1]);
            const uniqueRandomParts = new Set(randomParts);
            expect(uniqueRandomParts.size).toBeGreaterThan(1);
        });
    });

    describe("return value validation", () => {
        it("should always return a string", () => {
            const uuid = generateUuid();
            expect(typeof uuid).toBe("string");
            expect(uuid.length).toBeGreaterThan(0);
        });

        it("should not return empty string", () => {
            const uuid = generateUuid();
            expect(uuid).not.toBe("");
        });

        it("should not contain whitespace", () => {
            const uuid = generateUuid();
            expect(uuid).not.toMatch(/\s/);
        });
    });
});

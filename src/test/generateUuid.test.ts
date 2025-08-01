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
                configurable: true,
                value: {
                    randomUUID: vi.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
                },
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
            // Temporarily remove crypto to test fallback
            vi.stubGlobal("crypto", undefined);
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
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
            vi.stubGlobal("crypto", {
                getRandomValues: vi.fn(),
                // randomUUID is not defined
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID method is not available", () => {
            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
        });
    });

    describe("with crypto.randomUUID throwing error", () => {
        beforeEach(() => {
            // Mock crypto.randomUUID to throw an error
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => {
                    throw new Error("randomUUID not supported");
                }),
                getRandomValues: vi.fn(),
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID throws an error", () => {
            const uuid = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalled();
            expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
        });

        it("should handle multiple calls when randomUUID throws", () => {
            const uuid1 = generateUuid();
            const uuid2 = generateUuid();

            expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
            expect(uuid1).toMatch(/^site-[a-z0-9]+-\d+$/);
            expect(uuid2).toMatch(/^site-[a-z0-9]+-\d+$/);
            expect(uuid1).not.toBe(uuid2);
        });

        it("should handle different types of errors from randomUUID", () => {
            // Test with different error types
            const errors = [
                new Error("Not supported"),
                new TypeError("randomUUID is not a function"),
                new ReferenceError("crypto is not defined"),
                "String error",
                null,
                undefined,
            ];

            for (const error of errors) {
                vi.stubGlobal("crypto", {
                    randomUUID: vi.fn(() => {
                        throw error;
                    }),
                    getRandomValues: vi.fn(),
                });

                const uuid = generateUuid();
                expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
            }
        });
    });

    describe("with crypto.randomUUID as non-function", () => {
        beforeEach(() => {
            // Mock crypto with randomUUID as a non-function value
            vi.stubGlobal("crypto", {
                randomUUID: "not-a-function",
                getRandomValues: vi.fn(),
            });
        });

        afterEach(() => {
            // Restore the crypto mock from setup
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn((arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        arr[i] = Math.floor(Math.random() * 256);
                    }
                    return arr;
                }),
            });
        });

        it("should use fallback when randomUUID is not a function", () => {
            const uuid = generateUuid();

            expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
        });
    });

    describe("edge cases", () => {
        it("should handle consecutive calls", () => {
            // Mock crypto to ensure we test the function directly
            Object.defineProperty(global, "crypto", {
                configurable: true,
                value: {
                    randomUUID: vi
                        .fn()
                        .mockReturnValueOnce("uuid-1")
                        .mockReturnValueOnce("uuid-2")
                        .mockReturnValueOnce("uuid-3"),
                },
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
            vi.stubGlobal("crypto", undefined);

            const ids = [];
            for (let i = 0; i < 10; i++) {
                ids.push(generateUuid());
            }

            // All should be valid and different
            for (const id of ids) {
                expect(id).toMatch(/^site-[a-z0-9]+-\d+$/);
            }

            // Should have different random parts (high probability)
            const randomParts = ids.map((id) => id.split("-")[1]);
            const uniqueRandomParts = new Set(randomParts);
            expect(uniqueRandomParts.size).toBeGreaterThan(1);

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn(),
            });
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

        it("should handle rapid successive calls with crypto", () => {
            // Mock crypto to return predictable values
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "rapid-test-" + Date.now()),
            });

            const uuids = [];
            for (let i = 0; i < 5; i++) {
                uuids.push(generateUuid());
            }

            // All should be strings
            for (const uuid of uuids) {
                expect(typeof uuid).toBe("string");
                expect(uuid.length).toBeGreaterThan(0);
            }

            expect(crypto.randomUUID).toHaveBeenCalledTimes(5);
        });

        it("should handle rapid successive calls with fallback", () => {
            // Remove crypto to force fallback
            vi.stubGlobal("crypto", undefined);

            const uuids = [];
            for (let i = 0; i < 5; i++) {
                uuids.push(generateUuid());
            }

            // All should be valid fallback format
            for (const uuid of uuids) {
                expect(typeof uuid).toBe("string");
                expect(uuid).toMatch(/^site-[a-z0-9]+-\d+$/);
            }

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn(),
            });
        });

        it("should generate fallback IDs with correct structure", () => {
            // Force fallback by removing crypto
            vi.stubGlobal("crypto", undefined);

            const uuid = generateUuid();
            const parts = uuid.split("-");

            expect(parts).toHaveLength(3);
            expect(parts[0]).toBe("site");
            expect(parts[1]).toMatch(/^[a-z0-9]+$/);
            expect(parts[1]?.length).toBe(9); // substring(2, 11) gives 9 characters
            expect(parts[2]).toMatch(/^\d+$/);
            expect(parseInt(parts[2] ?? "0")).toBeGreaterThan(0);

            // Restore crypto mock
            vi.stubGlobal("crypto", {
                randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
                getRandomValues: vi.fn(),
            });
        });
    });
});

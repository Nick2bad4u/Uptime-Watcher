import {
    getPersistedDeviceIdValidationError,
    isValidPersistedDeviceId,
    mapWithConcurrency,
} from "@electron/services/sync/syncEngineUtils";
import { describe, expect, it } from "vitest";

describe("syncEngineUtils", () => {
    describe("getPersistedDeviceIdValidationError()", () => {
        it("returns null for a valid deviceId", () => {
            expect(getPersistedDeviceIdValidationError("device-1")).toBeNull();
        });

        it("rejects empty or whitespace-only ids", () => {
            expect(getPersistedDeviceIdValidationError("")).toMatch(
                /non-empty/iv
            );
            expect(getPersistedDeviceIdValidationError(" ".repeat(3))).toMatch(
                /non-empty/iv
            );
        });

        it("rejects leading/trailing whitespace", () => {
            expect(getPersistedDeviceIdValidationError(" device")).toMatch(
                /leading or trailing whitespace/iv
            );
        });

        it("rejects path separators and ':' tokens", () => {
            expect(getPersistedDeviceIdValidationError("a/b")).toMatch(
                /path separators/iv
            );
            expect(getPersistedDeviceIdValidationError("a:bad")).toMatch(
                /must not contain ':'/iv
            );
        });

        it("rejects traversal segments", () => {
            expect(getPersistedDeviceIdValidationError(".")).toMatch(
                /traversal/iv
            );
            expect(getPersistedDeviceIdValidationError("..")).toMatch(
                /traversal/iv
            );
        });
    });

    describe("isValidPersistedDeviceId()", () => {
        it("agrees with getPersistedDeviceIdValidationError", () => {
            const candidates = [
                "device-1",
                "",
                " ".repeat(3),
                " device",
                "a/b",
                "a:bad",
                ".",
                "..",
            ];

            for (const candidate of candidates) {
                expect(isValidPersistedDeviceId(candidate)).toBe(
                    getPersistedDeviceIdValidationError(candidate) === null
                );
            }
        });
    });

    describe("mapWithConcurrency()", () => {
        it("preserves input order while running tasks with bounded concurrency", async () => {
            let active = 0;
            let maxActive = 0;

            const result = await mapWithConcurrency({
                concurrency: 2,
                items: [
                    3,
                    1,
                    2,
                ],
                task: async (item) => {
                    active += 1;
                    maxActive = Math.max(maxActive, active);
                    await new Promise((resolve) => {
                        setTimeout(resolve, item);
                    });
                    active -= 1;
                    return item * 10;
                },
            });

            expect(result).toEqual([
                30,
                10,
                20,
            ]);
            expect(maxActive).toBeLessThanOrEqual(2);
        });

        it("allows undefined task results", async () => {
            const result = await mapWithConcurrency<number, number | undefined>(
                {
                    concurrency: 2,
                    items: [
                        1,
                        2,
                        3,
                    ],
                    task: async (item) => (item % 2 === 0 ? undefined : item),
                }
            );

            expect(result).toEqual([
                1,
                undefined,
                3,
            ]);
        });
    });
});

import { mapWithConcurrency } from "../../utils/boundedConcurrency";
import { describe, expect, it } from "vitest";

describe("mapWithConcurrency()", () => {
    it("preserves input order while bounding active tasks", async () => {
        let active = 0;
        let maxActive = 0;

        const result = await mapWithConcurrency({
            concurrency: 2,
            items: [
                1,
                2,
                3,
                4,
            ],
            task: async (item) => {
                active += 1;
                maxActive = Math.max(maxActive, active);
                await new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });
                active -= 1;
                return item * 10;
            },
        });

        expect(result).toEqual([
            10,
            20,
            30,
            40,
        ]);
        expect(maxActive).toBeLessThanOrEqual(2);
    });

    it("normalizes invalid concurrency to one worker", async () => {
        let active = 0;
        let maxActive = 0;

        await mapWithConcurrency({
            concurrency: Number.NaN,
            items: [1, 2],
            task: async () => {
                active += 1;
                maxActive = Math.max(maxActive, active);
                await new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });
                active -= 1;
            },
        });

        expect(maxActive).toBe(1);
    });

    it("accepts synchronous task results", async () => {
        await expect(
            mapWithConcurrency({
                concurrency: 3,
                items: [
                    1,
                    2,
                    3,
                ],
                task: (item) => item * 2,
            })
        ).resolves.toEqual([
            2,
            4,
            6,
        ]);
    });

    it("returns an empty result for empty input", async () => {
        await expect(
            mapWithConcurrency({
                concurrency: 4,
                items: [],
                task: async () => "unused",
            })
        ).resolves.toEqual([]);
    });
});

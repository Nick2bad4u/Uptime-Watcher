import { describe, expect, it, vi } from "vitest";

/**
 * Regression test for an off-by-one bug in the operational hooks exponential
 * retry delay.
 *
 * @remarks
 * `withOperationalHooks()` tracks attempts as 1-based (attempt 1..N), but the
 * backoff delay for the _first_ retry must still be `initialDelay` (not
 * `initialDelay * 2`).
 */
describe("withOperationalHooks retry delay semantics", () => {
    it("uses initialDelay for the first exponential retry", async () => {
        vi.resetModules();

        const sleepUnrefSpy = vi
            .fn<(ms: number, signal?: AbortSignal) => Promise<void>>()
            .mockResolvedValue(undefined);

        vi.doMock("@shared/utils/abortUtils", async () => {
            const actual = await vi.importActual<
                typeof import("@shared/utils/abortUtils")
            >("@shared/utils/abortUtils");

            return {
                ...actual,
                sleepUnref: sleepUnrefSpy,
            };
        });

        const { withOperationalHooks } =
            await import("../../utils/operationalHooks");

        const operation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error("fail once"))
            .mockResolvedValue("ok");

        await expect(
            withOperationalHooks(operation, {
                backoff: "exponential",
                emitEvents: false,
                initialDelay: 123,
                maxRetries: 2,
                operationName: "retry-delay-test",
            })
        ).resolves.toBe("ok");

        // The first (and only) retry delay should be exactly the configured
        // initial delay.
        expect(sleepUnrefSpy).toHaveBeenCalledTimes(1);
        expect(sleepUnrefSpy).toHaveBeenCalledWith(123, undefined);
    });
});

import { describe, expect, it } from "vitest";

import {
    mergeAbortSignals,
    withOptionalAbortSignal,
} from "../../../../services/monitoring/shared/abortSignalUtils";

describe("abortSignalUtils", () => {
    describe(mergeAbortSignals, () => {
        it.each([Number.NaN, Infinity, -Infinity, 0, -1])(
            "ignores invalid optional timeout %s",
            (timeoutMs) => {
                const controller = new AbortController();

                expect(
                    mergeAbortSignals({
                        baseSignal: controller.signal,
                        timeoutMs,
                    })
                ).toBe(controller.signal);
            }
        );

        it("preserves additional signals when optional timeout is invalid", () => {
            const baseController = new AbortController();
            const additionalController = new AbortController();
            const merged = mergeAbortSignals({
                additionalSignals: [additionalController.signal],
                baseSignal: baseController.signal,
                timeoutMs: Number.NaN,
            });

            expect(merged.aborted).toBeFalsy();

            additionalController.abort("additional");

            expect(merged.aborted).toBeTruthy();
            expect(merged.reason).toBe("additional");
        });
    });

    describe(withOptionalAbortSignal, () => {
        it("omits undefined signals", () => {
            expect(withOptionalAbortSignal(undefined)).toEqual({});
        });

        it("returns defined signals", () => {
            const controller = new AbortController();

            expect(withOptionalAbortSignal(controller.signal)).toEqual({
                signal: controller.signal,
            });
        });
    });
});

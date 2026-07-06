import { describe, expect, it } from "vitest";

import {
    createTimeoutSignal,
    mergeAbortSignals,
    withOptionalAbortSignal,
} from "../../../../services/monitoring/shared/abortSignalUtils";

describe("abortSignalUtils", () => {
    describe(createTimeoutSignal, () => {
        it.each([
            Number.NaN,
            Infinity,
            -Infinity,
            0,
            -1,
        ])(
            "returns a non-aborted signal for invalid timeout %s",
            (timeoutMs) => {
                const signal = createTimeoutSignal(timeoutMs);

                expect(signal.aborted).toBeFalsy();
            }
        );

        it("preserves the external signal when timeout is invalid", () => {
            const controller = new AbortController();
            const signal = createTimeoutSignal(Number.NaN, controller.signal);

            expect(signal).toBe(controller.signal);
        });

        it("normalizes oversized timeout values instead of throwing", () => {
            expect(() =>
                createTimeoutSignal(Number.MAX_SAFE_INTEGER)
            ).not.toThrow();
        });
    });

    describe(mergeAbortSignals, () => {
        it.each([
            Number.NaN,
            Infinity,
            -Infinity,
            0,
            -1,
        ])("ignores invalid optional timeout %s", (timeoutMs) => {
            const controller = new AbortController();

            expect(
                mergeAbortSignals({
                    baseSignal: controller.signal,
                    timeoutMs,
                })
            ).toBe(controller.signal);
        });

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

        it("normalizes oversized optional timeout values instead of throwing", () => {
            const baseController = new AbortController();

            expect(() =>
                mergeAbortSignals({
                    baseSignal: baseController.signal,
                    timeoutMs: Number.MAX_SAFE_INTEGER,
                })
            ).not.toThrow();
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

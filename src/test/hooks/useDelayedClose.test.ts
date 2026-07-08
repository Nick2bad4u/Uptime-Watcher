import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDelayedClose } from "../../hooks/ui/useDelayedClose";
import { logger } from "../../services/logger";

describe(useDelayedClose, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("marks the overlay as closing immediately", () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useDelayedClose({ onClose }));

        act(() => {
            result.current.requestClose();
        });

        expect(result.current.isClosing).toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores repeated close requests while the animation is pending", async () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useDelayedClose({ onClose }));

        act(() => {
            result.current.requestClose();
            result.current.requestClose();
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not invoke onClose after unmount", async () => {
        const onClose = vi.fn();
        const { result, unmount } = renderHook(() =>
            useDelayedClose({ onClose })
        );

        act(() => {
            result.current.requestClose();
        });

        unmount();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(onClose).not.toHaveBeenCalled();
    });

    it("logs delayed close callback failures", async () => {
        const closeError = new Error("close failed");
        const warnSpy = vi.spyOn(logger, "warn").mockReturnValue(undefined);
        const { result } = renderHook(() =>
            useDelayedClose({
                onClose: () => {
                    throw closeError;
                },
            })
        );

        act(() => {
            result.current.requestClose();
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(warnSpy).toHaveBeenCalledWith(
            "Delayed close callback failed",
            closeError
        );
    });
});

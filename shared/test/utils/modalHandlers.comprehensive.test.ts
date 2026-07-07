/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type EscapeKeyModalConfig,
    useEscapeKeyModalHandler,
} from "../../utils/modalHandlers";

describe(useEscapeKeyModalHandler, () => {
    let originalAddEventListener: typeof document.addEventListener;
    let originalRemoveEventListener: typeof document.removeEventListener;

    beforeEach(() => {
        originalAddEventListener = document.addEventListener;
        originalRemoveEventListener = document.removeEventListener;
        document.addEventListener = vi.fn();
        document.removeEventListener = vi.fn();
    });

    afterEach(() => {
        document.addEventListener = originalAddEventListener;
        document.removeEventListener = originalRemoveEventListener;
    });

    it("registers and removes the keydown listener", () => {
        const modalConfigs: EscapeKeyModalConfig[] = [
            {
                isOpen: true,
                onClose: vi.fn(),
            },
        ];

        const { unmount } = renderHook(() => {
            useEscapeKeyModalHandler(modalConfigs);
        });

        expect(document.addEventListener).toHaveBeenCalledWith(
            "keydown",
            expect.any(Function)
        );

        unmount();

        expect(document.removeEventListener).toHaveBeenCalledWith(
            "keydown",
            expect.any(Function)
        );
    });

    it("closes the highest-priority open modal on Escape", () => {
        const lowPriorityClose = vi.fn();
        const highPriorityClose = vi.fn();
        const closedModalClose = vi.fn();
        const modalConfigs: EscapeKeyModalConfig[] = [
            {
                isOpen: true,
                onClose: lowPriorityClose,
                priority: 1,
            },
            {
                isOpen: false,
                onClose: closedModalClose,
                priority: 100,
            },
            {
                isOpen: true,
                onClose: highPriorityClose,
                priority: 10,
            },
        ];

        renderHook(() => {
            useEscapeKeyModalHandler(modalConfigs);
        });

        const listener = vi.mocked(document.addEventListener).mock
            .calls[0]?.[1];
        expect(listener).toEqual(expect.any(Function));

        const event = new KeyboardEvent("keydown", { key: "Escape" });
        const preventDefault = vi.spyOn(event, "preventDefault");
        (listener as (event: KeyboardEvent) => void)(event);

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(highPriorityClose).toHaveBeenCalledTimes(1);
        expect(lowPriorityClose).not.toHaveBeenCalled();
        expect(closedModalClose).not.toHaveBeenCalled();
    });

    it("ignores non-Escape keys and closed modal lists", () => {
        const onClose = vi.fn();
        const modalConfigs: EscapeKeyModalConfig[] = [
            {
                isOpen: false,
                onClose,
                priority: 1,
            },
        ];

        renderHook(() => {
            useEscapeKeyModalHandler(modalConfigs);
        });

        const listener = vi.mocked(document.addEventListener).mock
            .calls[0]?.[1];
        expect(listener).toEqual(expect.any(Function));

        (listener as (event: KeyboardEvent) => void)(
            new KeyboardEvent("keydown", { key: "Enter" })
        );
        (listener as (event: KeyboardEvent) => void)(
            new KeyboardEvent("keydown", { key: "Escape" })
        );

        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not throw when listener attachment fails", () => {
        const addEventListener = vi.fn(() => {
            throw new Error("listener unavailable");
        });
        document.addEventListener = addEventListener;
        const modalConfigs: EscapeKeyModalConfig[] = [
            {
                isOpen: true,
                onClose: vi.fn(),
            },
        ];

        const { unmount } = renderHook(() => {
            useEscapeKeyModalHandler(modalConfigs);
        });

        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(() => {
            unmount();
        }).not.toThrow();
    });
});

import type { RefObject } from "react";

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCompactSidebarAutoDismiss } from "../../../app/sidebar/useCompactSidebarAutoDismiss";

const createMediaQueryRef = (
    matches: boolean
): RefObject<MediaQueryList | null> => ({
    current: {
        matches,
    } as MediaQueryList,
});

const createHookArgs = (
    overrides: Partial<Parameters<typeof useCompactSidebarAutoDismiss>[0]> = {}
): Parameters<typeof useCompactSidebarAutoDismiss>[0] => ({
    closeCompactSidebar: vi.fn(),
    closeNonCompactSidebar: vi.fn(),
    isCompactViewport: true,
    isSidebarOpen: true,
    sidebarMediaQueryRef: createMediaQueryRef(true),
    ...overrides,
});

interface AddEventListenerSpy {
    readonly mock: {
        readonly calls: readonly (readonly [
            string,
            EventListenerOrEventListenerObject,
            unknown?,
        ])[];
    };
}

const getPointerDownHandler = (
    addEventListener: AddEventListenerSpy
): ((event: PointerEvent) => void) => {
    const listener = addEventListener.mock.calls.find(
        ([eventName]) => eventName === "pointerdown"
    )?.[1];

    if (typeof listener !== "function") {
        throw new TypeError("Expected pointerdown listener to be registered");
    }

    return listener as (event: PointerEvent) => void;
};

describe(useCompactSidebarAutoDismiss, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("registers and removes a capture pointerdown listener when active", () => {
        const addEventListener = vi.spyOn(document, "addEventListener");
        const removeEventListener = vi.spyOn(document, "removeEventListener");
        const { unmount } = renderHook(() => {
            useCompactSidebarAutoDismiss(createHookArgs());
        });

        const handler = getPointerDownHandler(addEventListener);

        expect(addEventListener).toHaveBeenCalledWith("pointerdown", handler, {
            capture: true,
        });

        unmount();

        expect(removeEventListener).toHaveBeenCalledWith(
            "pointerdown",
            handler,
            true
        );
    });

    it("closes the compact sidebar when pointerdown occurs outside sidebar controls", () => {
        const addEventListener = vi.spyOn(document, "addEventListener");
        const closeCompactSidebar = vi.fn();

        renderHook(() => {
            useCompactSidebarAutoDismiss(
                createHookArgs({ closeCompactSidebar })
            );
        });

        const handler = getPointerDownHandler(addEventListener);
        const target = {
            closest: vi.fn(() => null),
        };

        handler({ target } as unknown as PointerEvent);

        expect(closeCompactSidebar).toHaveBeenCalledTimes(1);
    });

    it("ignores pointerdown targets inside sidebar controls", () => {
        const addEventListener = vi.spyOn(document, "addEventListener");
        const closeCompactSidebar = vi.fn();

        renderHook(() => {
            useCompactSidebarAutoDismiss(
                createHookArgs({ closeCompactSidebar })
            );
        });

        const handler = getPointerDownHandler(addEventListener);
        const target = {
            closest: vi.fn((selector: string) =>
                selector === ".app-sidebar" ? document.body : null
            ),
        };

        handler({ target } as unknown as PointerEvent);

        expect(closeCompactSidebar).not.toHaveBeenCalled();
    });

    it("does not attach a listener when sidebar is closed", () => {
        const addEventListener = vi.spyOn(document, "addEventListener");

        renderHook(() => {
            useCompactSidebarAutoDismiss(
                createHookArgs({ isSidebarOpen: false })
            );
        });

        expect(addEventListener).not.toHaveBeenCalled();
    });

    it("no-ops when listener attachment fails", () => {
        vi.spyOn(document, "addEventListener").mockImplementationOnce(() => {
            throw new Error("listener unavailable");
        });
        const removeEventListener = vi.spyOn(document, "removeEventListener");

        const { unmount } = renderHook(() => {
            useCompactSidebarAutoDismiss(createHookArgs());
        });

        expect(() => {
            unmount();
        }).not.toThrow();
        expect(removeEventListener).not.toHaveBeenCalled();
    });

    it("ignores targets without a closest method", () => {
        const addEventListener = vi.spyOn(document, "addEventListener");
        const closeCompactSidebar = vi.fn();

        renderHook(() => {
            useCompactSidebarAutoDismiss(
                createHookArgs({ closeCompactSidebar })
            );
        });

        const handler = getPointerDownHandler(addEventListener);

        handler({ target: {} } as PointerEvent);

        expect(closeCompactSidebar).not.toHaveBeenCalled();
    });
});

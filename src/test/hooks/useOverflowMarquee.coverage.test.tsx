/**
 * Focused coverage tests for {@link useOverflowMarquee} to ensure marquee
 * detection logic handles overflow, dependency updates, and lifecycle hooks.
 */

import { renderHook, waitFor } from "@testing-library/react";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { useOverflowMarquee } from "../../hooks/ui/useOverflowMarquee";

class MockResizeObserver {
    public static instances: MockResizeObserver[] = [];

    public readonly disconnect = vi.fn();

    public readonly observe = vi.fn();

    public readonly unobserve = vi.fn();

    public readonly callback: ResizeObserverCallback;

    public constructor(callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this);
        this.callback = callback;
    }
}

const originalResizeObserver = global.ResizeObserver;

interface ElementDimensions {
    readonly clientWidth: number;
    readonly scrollWidth: number;
}

const setDimensions = (
    element: HTMLElement,
    dimensions: ElementDimensions
): void => {
    Object.defineProperties(element, {
        clientWidth: {
            configurable: true,
            value: dimensions.clientWidth,
        },
        scrollWidth: {
            configurable: true,
            value: dimensions.scrollWidth,
        },
    });
};

beforeAll(() => {
    (globalThis as Record<string, unknown>)["ResizeObserver"] =
        MockResizeObserver as unknown as typeof ResizeObserver;
});

beforeEach(() => {
    MockResizeObserver.instances.length = 0;
});

afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe(useOverflowMarquee, () => {
    it("returns non-overflow state when content fits", async () => {
        const element = document.createElement("div");
        setDimensions(element, { clientWidth: 200, scrollWidth: 200 });

        const { result } = renderHook(() =>
            useOverflowMarquee({ ref: { current: element } })
        );

        await waitFor(() => {
            expect(result.current.isOverflowing).toBeFalsy();
        });
    });

    it("detects overflow and cleans up listeners", async () => {
        const element = document.createElement("div");
        setDimensions(element, { clientWidth: 100, scrollWidth: 180 });

        let resizeListener: ((event: Event) => void) | null = null;

        const addEventListenerSpy = vi.spyOn(window, "addEventListener");
        addEventListenerSpy.mockImplementation(
            (type, listener: EventListenerOrEventListenerObject): void => {
                if (type === "resize" && typeof listener === "function") {
                    resizeListener = listener as (event: Event) => void;
                }
            }
        );
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { result, unmount } = renderHook(() =>
            useOverflowMarquee({ ref: { current: element } })
        );

        await waitFor(() => {
            expect(result.current.isOverflowing).toBeTruthy();
        });

        if (resizeListener) {
            (resizeListener as (event: Event) => void)(new Event("resize"));
        }

        await waitFor(() => {
            expect(result.current.isOverflowing).toBeTruthy();
        });

        expect(MockResizeObserver.instances).toHaveLength(1);
        const [instance] = MockResizeObserver.instances;
        expect(instance).toBeDefined();
        if (!instance) {
            throw new Error("ResizeObserver instance was not created");
        }
        expect(instance.observe).toHaveBeenCalledWith(element);

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "resize",
            resizeListener
        );
        expect(instance.disconnect).toHaveBeenCalledTimes(1);
    });

    it("recomputes overflow when dependencies change", async () => {
        const element = document.createElement("div");
        setDimensions(element, { clientWidth: 220, scrollWidth: 220 });

        const externalRef = { current: element };

        const { result, rerender } = renderHook(
            ({ deps }: { readonly deps: readonly string[] }) =>
                useOverflowMarquee({ dependencies: deps, ref: externalRef }),
            {
                initialProps: { deps: ["initial"] },
            }
        );

        await waitFor(() => {
            expect(result.current.isOverflowing).toBeFalsy();
        });

        setDimensions(element, { clientWidth: 100, scrollWidth: 180 });

        rerender({ deps: ["mutated"] });

        await waitFor(() => {
            expect(result.current.isOverflowing).toBeTruthy();
        });
    });
});

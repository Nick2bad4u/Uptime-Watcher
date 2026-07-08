/**
 * Fast-check powered regression tests for the Tooltip component.
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    Tooltip,
    type TooltipPosition,
} from "../../../../components/common/Tooltip/Tooltip";

const tooltipPositions: readonly TooltipPosition[] = [
    "top",
    "bottom",
    "left",
    "right",
];

const cssClassArbitrary = fc
    .string({ maxLength: 12, minLength: 1 })
    .filter((value) => /^[-0-9A-Za-z]+$/u.test(value));

const contentArbitrary = fc
    .string({ maxLength: 40, minLength: 1 })
    .filter((value) => /\S/v.test(value));

let rafSpy: null | { mockRestore: () => void } = null;

beforeEach(() => {
    rafSpy = vi
        .spyOn(globalThis, "requestAnimationFrame")
        .mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
});

afterEach(() => {
    rafSpy?.mockRestore();
    rafSpy = null;
    vi.useRealTimers();
    document.body.replaceChildren();
});

describe("Tooltip fast-check coverage", () => {
    it("does not render tooltip content when disabled", () => {
        const { unmount } = render(
            <Tooltip content="Hidden tooltip" disabled>
                {() => <button type="button">Trigger</button>}
            </Tooltip>
        );

        expect(document.querySelector(".tooltip")).toBeNull();

        unmount();
    });

    it("cancels pending show timers when disabled before delay completes", () => {
        vi.useFakeTimers();

        const { rerender, unmount } = render(
            <Tooltip content="Delayed helper" delay={200}>
                {(triggerProps) => (
                    <button type="button" {...triggerProps}>
                        Trigger
                    </button>
                )}
            </Tooltip>
        );

        const container = document.querySelector(".tooltip-container")!;
        fireEvent.mouseEnter(container);

        rerender(
            <Tooltip content="Delayed helper" delay={200} disabled>
                {(triggerProps) => (
                    <button type="button" {...triggerProps}>
                        Trigger
                    </button>
                )}
            </Tooltip>
        );

        act(() => {
            vi.advanceTimersByTime(250);
        });

        expect(document.querySelector(".tooltip")).toBeNull();

        rerender(
            <Tooltip content="Delayed helper" delay={200}>
                {(triggerProps) => (
                    <button type="button" {...triggerProps}>
                        Trigger
                    </button>
                )}
            </Tooltip>
        );

        expect(document.querySelector(".tooltip")).toBeNull();

        unmount();
    });

    it("shows on focus and hides on blur with configured delays", async () => {
        const { unmount } = render(
            <Tooltip content="Focus helper" delay={10}>
                {(triggerProps) => (
                    <button type="button" {...triggerProps}>
                        Trigger
                    </button>
                )}
            </Tooltip>
        );

        const trigger = document.querySelector("button")!;
        fireEvent.focus(trigger);
        expect(document.querySelector(".tooltip")).toBeNull();

        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );
        const tooltip = document.querySelector(".tooltip");
        expect(tooltip).not.toBeNull();
        expect(tooltip).toHaveClass("tooltip--visible");

        fireEvent.blur(trigger);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).toBeNull();
            },
            { timeout: 500 }
        );

        unmount();
    });

    it("responds to keyboard activation and dismissal keys", async () => {
        const { unmount } = render(
            <Tooltip content="Keyboard accessible" delay={0}>
                {(triggerProps) => (
                    <button type="button" {...triggerProps}>
                        Trigger
                    </button>
                )}
            </Tooltip>
        );

        const trigger = document.querySelector("button")!;
        fireEvent.keyDown(trigger, { key: "Enter" });
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );

        fireEvent.keyDown(trigger, { key: "Escape" });
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).toBeNull();
            },
            { timeout: 500 }
        );

        unmount();
    });

    it("handles container pointer interactions to control visibility", async () => {
        const { unmount } = render(
            <Tooltip content="Pointer helper" delay={0}>
                {(triggerProps) => <span {...triggerProps}>Hover me</span>}
            </Tooltip>
        );

        const container = document.querySelector(".tooltip-container")!;

        fireEvent.mouseEnter(container);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );

        fireEvent.mouseLeave(container);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).toBeNull();
            },
            { timeout: 700 }
        );

        fireEvent.touchStart(container);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );

        fireEvent.touchEnd(container);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).toBeNull();
            },
            { timeout: 700 }
        );

        unmount();
    });

    it("cancels a pending visibility animation frame on unmount", () => {
        vi.useFakeTimers();

        rafSpy?.mockRestore();
        rafSpy = vi
            .spyOn(globalThis, "requestAnimationFrame")
            .mockReturnValue(123);

        const cancelAnimationFrameSpy = vi
            .spyOn(globalThis, "cancelAnimationFrame")
            .mockImplementation(() => {});

        const { unmount } = render(
            <Tooltip content="Pending frame helper" delay={0}>
                {(triggerProps) => <span {...triggerProps}>Hover me</span>}
            </Tooltip>
        );

        const container = document.querySelector(".tooltip-container")!;
        fireEvent.mouseEnter(container);

        act(() => {
            vi.advanceTimersByTime(0);
        });

        expect(document.querySelector(".tooltip")).not.toBeNull();

        unmount();

        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(123);

        cancelAnimationFrameSpy.mockRestore();
    });

    it("keeps rendering when reposition listener setup fails", async () => {
        vi.spyOn(globalThis, "addEventListener").mockImplementation(() => {
            throw new Error("listener unavailable");
        });

        const { unmount } = render(
            <Tooltip content="Listener setup helper" delay={0}>
                {(triggerProps) => <span {...triggerProps}>Hover me</span>}
            </Tooltip>
        );

        const container = document.querySelector(".tooltip-container")!;

        expect(() => {
            fireEvent.mouseEnter(container);
        }).not.toThrow();
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );

        expect(() => {
            unmount();
        }).not.toThrow();
    });

    it("keeps unmounting when reposition listener cleanup fails", async () => {
        vi.spyOn(globalThis, "removeEventListener").mockImplementation(() => {
            throw new Error("listener cleanup unavailable");
        });

        const { unmount } = render(
            <Tooltip content="Listener cleanup helper" delay={0}>
                {(triggerProps) => <span {...triggerProps}>Hover me</span>}
            </Tooltip>
        );

        const container = document.querySelector(".tooltip-container")!;
        fireEvent.mouseEnter(container);
        await waitFor(
            () => {
                expect(document.querySelector(".tooltip")).not.toBeNull();
            },
            { timeout: 500 }
        );

        expect(() => {
            unmount();
        }).not.toThrow();
    });

    it("keeps rendering when viewport dimensions are unavailable", async () => {
        const originalInnerWidth = Object.getOwnPropertyDescriptor(
            globalThis,
            "innerWidth"
        );

        Object.defineProperty(globalThis, "innerWidth", {
            configurable: true,
            get() {
                throw new Error("viewport unavailable");
            },
        });

        try {
            const { unmount } = render(
                <Tooltip content="Viewport helper" delay={0}>
                    {(triggerProps) => <span {...triggerProps}>Hover me</span>}
                </Tooltip>
            );

            const container = document.querySelector(".tooltip-container")!;

            expect(() => {
                fireEvent.mouseEnter(container);
            }).not.toThrow();
            await waitFor(
                () => {
                    expect(document.querySelector(".tooltip")).not.toBeNull();
                },
                { timeout: 500 }
            );

            expect(() => {
                unmount();
            }).not.toThrow();
        } finally {
            if (originalInnerWidth) {
                Object.defineProperty(
                    globalThis,
                    "innerWidth",
                    originalInnerWidth
                );
            }
        }
    });

    it("skips the portal when document body is unavailable", async () => {
        const { unmount } = render(
            <Tooltip content="Document helper" delay={0}>
                {(triggerProps) => <span {...triggerProps}>Hover me</span>}
            </Tooltip>
        );
        const container = document.querySelector(".tooltip-container")!;
        const originalBody = Object.getOwnPropertyDescriptor(document, "body");

        Object.defineProperty(document, "body", {
            configurable: true,
            get() {
                throw new Error("document body unavailable");
            },
        });

        try {
            expect(() => {
                fireEvent.mouseEnter(container);
            }).not.toThrow();

            await act(async () => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 0);
                });
            });
        } finally {
            if (originalBody) {
                Object.defineProperty(document, "body", originalBody);
            } else {
                Reflect.deleteProperty(document, "body");
            }
        }

        expect(document.querySelector(".tooltip")).toBeNull();
        unmount();
    });

    it("keeps rendering when ResizeObserver construction fails", async () => {
        const originalResizeObserver = Object.getOwnPropertyDescriptor(
            globalThis,
            "ResizeObserver"
        );

        Object.defineProperty(globalThis, "ResizeObserver", {
            configurable: true,
            value: function BrokenResizeObserver() {
                throw new Error("observer unavailable");
            },
        });

        try {
            const { unmount } = render(
                <Tooltip content="Observer helper" delay={0}>
                    {(triggerProps) => <span {...triggerProps}>Hover me</span>}
                </Tooltip>
            );

            const container = document.querySelector(".tooltip-container")!;

            expect(() => {
                fireEvent.mouseEnter(container);
            }).not.toThrow();
            await waitFor(
                () => {
                    expect(document.querySelector(".tooltip")).not.toBeNull();
                },
                { timeout: 500 }
            );

            expect(() => {
                unmount();
            }).not.toThrow();
        } finally {
            if (originalResizeObserver) {
                Object.defineProperty(
                    globalThis,
                    "ResizeObserver",
                    originalResizeObserver
                );
            }
        }
    });

    fcTest.prop(
        [
            cssClassArbitrary,
            fc.option(cssClassArbitrary, { nil: undefined }),
            contentArbitrary,
            fc.integer({ max: 360, min: 120 }),
            fc.constantFrom(...tooltipPositions),
            fc.constantFrom("inline", "block"),
        ],
        { numRuns: 6, timeout: 4000 }
    )(
        "applies positional styling and layout classes correctly",
        async (
            tooltipClass,
            containerClass,
            content,
            maxWidth,
            position,
            wrapMode
        ) => {
            const { unmount } = render(
                <Tooltip
                    className={tooltipClass}
                    content={content}
                    delay={0}
                    maxWidth={maxWidth}
                    position={position}
                    wrapMode={wrapMode}
                    {...(containerClass
                        ? { containerClassName: containerClass }
                        : {})}
                >
                    {(triggerProps) => <span {...triggerProps}>Trigger</span>}
                </Tooltip>
            );

            const container = document.querySelector(".tooltip-container")!;
            fireEvent.mouseEnter(container);
            await waitFor(
                () => {
                    expect(document.querySelector(".tooltip")).not.toBeNull();
                },
                { timeout: 500 }
            );

            const tooltip = document.querySelector<HTMLElement>(".tooltip")!;
            expect(tooltip).not.toBeNull();
            expect(tooltip).toHaveClass(`tooltip--${position}`);
            expect(tooltip).toHaveClass(tooltipClass);
            expect(tooltip.style.maxWidth).toBe(`${maxWidth}px`);
            expect(tooltip.textContent).toContain(content);

            if (wrapMode === "block") {
                expect(container).toHaveClass("tooltip-container--block");
            } else {
                expect(container).toHaveClass("tooltip-container--inline");
            }

            if (containerClass) {
                expect(container).toHaveClass(containerClass);
            }

            unmount();
        }
    );
});

/**
 * Fast-check powered regression tests for the Tooltip component.
 */

import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";

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
    .filter((value) => /^[A-Za-z0-9-]+$/u.test(value));

const contentArbitrary = fc
    .string({ maxLength: 40, minLength: 1 })
    .filter((value) => /\S/u.test(value));

let rafSpy: { mockRestore: () => void } | null = null;

beforeEach(() => {
    rafSpy = vi
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
});

afterEach(() => {
    rafSpy?.mockRestore();
    rafSpy = null;
    document.body.innerHTML = "";
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

        const trigger = document.querySelector("button") as HTMLButtonElement;
        fireEvent.focus(trigger);
        expect(document.querySelector(".tooltip")).toBeNull();

        await waitFor(
            () => expect(document.querySelector(".tooltip")).not.toBeNull(),
            { timeout: 500 }
        );
        const tooltip = document.querySelector(".tooltip");
        expect(tooltip).not.toBeNull();
        expect(tooltip).toHaveClass("tooltip--visible");

        fireEvent.blur(trigger);
        await waitFor(
            () => expect(document.querySelector(".tooltip")).toBeNull(),
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

        const trigger = document.querySelector("button") as HTMLButtonElement;
        fireEvent.keyDown(trigger, { key: "Enter" });
        await waitFor(
            () => expect(document.querySelector(".tooltip")).not.toBeNull(),
            { timeout: 500 }
        );

        fireEvent.keyDown(trigger, { key: "Escape" });
        await waitFor(
            () => expect(document.querySelector(".tooltip")).toBeNull(),
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

        const container = document.querySelector(
            ".tooltip-container"
        ) as HTMLDivElement;

        fireEvent.mouseEnter(container);
        await waitFor(
            () => expect(document.querySelector(".tooltip")).not.toBeNull(),
            { timeout: 500 }
        );

        fireEvent.mouseLeave(container);
        await waitFor(
            () => expect(document.querySelector(".tooltip")).toBeNull(),
            { timeout: 700 }
        );

        fireEvent.touchStart(container);
        await waitFor(
            () => expect(document.querySelector(".tooltip")).not.toBeNull(),
            { timeout: 500 }
        );

        fireEvent.touchEnd(container);
        await waitFor(
            () => expect(document.querySelector(".tooltip")).toBeNull(),
            { timeout: 700 }
        );

        unmount();
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

            const container = document.querySelector(
                ".tooltip-container"
            ) as HTMLDivElement;
            fireEvent.mouseEnter(container);
            await waitFor(
                () => expect(document.querySelector(".tooltip")).not.toBeNull(),
                { timeout: 500 }
            );

            const tooltip = document.querySelector(
                ".tooltip"
            ) as HTMLDivElement;
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

/**
 * Fast-check powered regression tests for the MarqueeText component.
 */

import type { CSSProperties } from "react";

import { describe, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { fc, test as fcTest } from "@fast-check/vitest";

import {
    MarqueeText,
    type MarqueeTextProperties,
} from "../../../../components/common/MarqueeText/MarqueeText";

vi.mock("../../../../hooks/ui/useOverflowMarquee", async () => {
    const actual = await vi.importActual<
        typeof import("../../../../hooks/ui/useOverflowMarquee")
    >("../../../../hooks/ui/useOverflowMarquee");

    return {
        ...actual,
        useOverflowMarquee: vi.fn(),
    } satisfies Partial<
        typeof import("../../../../hooks/ui/useOverflowMarquee")
    >;
});

const { useOverflowMarquee } =
    await import("../../../../hooks/ui/useOverflowMarquee");

const mockUseOverflowMarquee = vi.mocked(useOverflowMarquee);

const cssClassArbitrary = fc
    .string({ maxLength: 12, minLength: 1 })
    .filter((value) => /^[\w-]+$/.test(value));

const optionalCssClassArbitrary = fc.oneof(
    cssClassArbitrary,
    fc.constant(undefined)
);

const textArbitrary = fc.string({
    maxLength: 60,
    minLength: 1,
});

const gapArbitrary = fc.oneof(
    fc
        .double({ max: 25, min: 0.1, noDefaultInfinity: true, noNaN: true })
        .map((value) => `${value.toFixed(2)}rem`),
    fc.constant(undefined)
);

const durationArbitrary = fc.oneof(
    fc.integer({ max: 60, min: 1 }).map((seconds) => `${seconds}s`),
    fc.constant(undefined)
);

const colorArbitrary = fc.constantFrom(
    "red",
    "green",
    "blue",
    "purple",
    "black"
);

const fontWeightArbitrary = fc.oneof(
    fc.constantFrom("bold", "normal", "lighter", "500", "600"),
    fc.constant(undefined)
);

describe("MarqueeText fast-check coverage", () => {
    fcTest.prop<
        [
            string,
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
        ]
    >([
        textArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
    ])("renders base segment with composed classes when marquee is inactive", (
        text,
        className,
        trackClassName,
        segmentClassName,
        textPropsClassName,
        activeClassName
    ) => {
        mockUseOverflowMarquee.mockReset();
        mockUseOverflowMarquee.mockReturnValue({
            containerRef: { current: null },
            isOverflowing: false,
        });

        const textProps: MarqueeTextProperties["textProps"] =
            textPropsClassName === undefined
                ? undefined
                : { className: textPropsClassName };

        const props: MarqueeTextProperties = {
            text,
            ...(className === undefined ? {} : { className }),
            ...(trackClassName === undefined ? {} : { trackClassName }),
            ...(segmentClassName === undefined ? {} : { segmentClassName }),
            ...(textProps === undefined ? {} : { textProps }),
            ...(activeClassName === undefined ? {} : { activeClassName }),
        };

        const { container, unmount } = render(<MarqueeText {...props} />);

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper).toHaveClass("marquee-text");
        if (className) {
            expect(wrapper).toHaveClass(className);
        }
        expect(wrapper).not.toHaveClass("marquee-text--active");
        if (
            activeClassName &&
            activeClassName !== className &&
            activeClassName !== "marquee-text" &&
            activeClassName !== "marquee-text--active"
        ) {
            expect(wrapper).not.toHaveClass(activeClassName);
        }

        const trackElem = wrapper.querySelector(
            ".marquee-text__track"
        ) as HTMLElement | null;
        expect(trackElem).not.toBeNull();
        if (trackClassName) {
            expect(trackElem).toHaveClass(trackClassName);
        }

        const segments = wrapper.querySelectorAll(".marquee-text__segment");
        expect(segments).toHaveLength(1);

        const segment = segments.item(0) as HTMLElement;
        expect(segment.textContent).toBe(text);
        expect(segment).not.toHaveClass("marquee-text__segment--clone");
        if (segmentClassName) {
            expect(segment).toHaveClass(segmentClassName);
        }
        if (textPropsClassName) {
            expect(segment).toHaveClass(textPropsClassName);
        }

        const callArgs = mockUseOverflowMarquee.mock.calls.at(-1);
        expect(callArgs).toBeDefined();
        expect(callArgs?.[0]?.dependencies).toEqual([text]);

        unmount();
    });

    fcTest.prop<
        [
            string,
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
            string | undefined,
        ]
    >([
        textArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
        optionalCssClassArbitrary,
    ])(
        "renders clone segment, active classes, and aria hints when overflowing",
        (
            text,
            className,
            activeClassName,
            cloneClassName,
            segmentClassName,
            textPropsClassName
        ) => {
            mockUseOverflowMarquee.mockReset();
            mockUseOverflowMarquee.mockReturnValue({
                containerRef: { current: null },
                isOverflowing: true,
            });

            const textProps: MarqueeTextProperties["textProps"] =
                textPropsClassName === undefined
                    ? undefined
                    : { className: textPropsClassName };

            const props: MarqueeTextProperties = {
                text,
                ...(className === undefined ? {} : { className }),
                ...(activeClassName === undefined ? {} : { activeClassName }),
                ...(cloneClassName === undefined ? {} : { cloneClassName }),
                ...(segmentClassName === undefined ? {} : { segmentClassName }),
                ...(textProps === undefined ? {} : { textProps }),
            };

            const { container, unmount } = render(<MarqueeText {...props} />);

            const wrapper = container.firstElementChild as HTMLElement;
            expect(wrapper).toHaveClass("marquee-text", "marquee-text--active");
            if (className) {
                expect(wrapper).toHaveClass(className);
            }
            if (activeClassName) {
                expect(wrapper).toHaveClass(activeClassName);
            }

            const segments = wrapper.querySelectorAll(".marquee-text__segment");
            expect(segments).toHaveLength(2);

            const [primarySegment, cloneSegment] = Array.from(segments) as [
                HTMLElement,
                HTMLElement,
            ];
            expect(primarySegment.textContent).toBe(text);
            expect(primarySegment).not.toHaveClass(
                "marquee-text__segment--clone"
            );

            expect(cloneSegment.textContent).toBe(text);
            expect(cloneSegment).toHaveClass("marquee-text__segment--clone");
            if (segmentClassName) {
                expect(primarySegment).toHaveClass(segmentClassName);
                expect(cloneSegment).toHaveClass(segmentClassName);
            }
            if (textPropsClassName) {
                expect(primarySegment).toHaveClass(textPropsClassName);
                expect(cloneSegment).toHaveClass(textPropsClassName);
            }
            if (cloneClassName) {
                expect(cloneSegment).toHaveClass(cloneClassName);
            }

            const callArgs = mockUseOverflowMarquee.mock.calls.at(-1);
            expect(callArgs).toBeDefined();
            expect(callArgs?.[0]?.dependencies).toEqual([text]);

            unmount();
        }
    );

    fcTest.prop<[string, string[]]>([
        textArbitrary,
        fc.array(fc.string({ maxLength: 16 }), {
            maxLength: 5,
            minLength: 1,
        }),
    ])("passes explicit dependency lists through to the overflow hook", (
        text,
        dependencies
    ) => {
        mockUseOverflowMarquee.mockReset();
        mockUseOverflowMarquee.mockReturnValue({
            containerRef: { current: null },
            isOverflowing: false,
        });

        const { unmount } = render(
            <MarqueeText dependencies={dependencies} text={text} />
        );

        const callArgs = mockUseOverflowMarquee.mock.calls.at(-1);
        expect(callArgs).toBeDefined();
        expect(callArgs?.[0]?.dependencies).toBe(dependencies);

        unmount();
    });

    fcTest.prop<
        [string, string | undefined, string | undefined, string | undefined]
    >([
        colorArbitrary,
        fontWeightArbitrary,
        gapArbitrary,
        durationArbitrary,
    ])("merges inline style overrides with computed marquee variables", (
        color,
        fontWeight,
        gap,
        duration
    ) => {
        mockUseOverflowMarquee.mockReset();
        mockUseOverflowMarquee.mockReturnValue({
            containerRef: { current: null },
            isOverflowing: false,
        });

        const baseStyle: CSSProperties = { color };
        if (fontWeight) {
            baseStyle.fontWeight = fontWeight;
        }

        const props: MarqueeTextProperties = {
            style: baseStyle,
            text: "stylish marquee",
            ...(gap === undefined ? {} : { gap }),
            ...(duration === undefined ? {} : { duration }),
        };

        const { container, unmount } = render(<MarqueeText {...props} />);

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.style.getPropertyValue("color")).toBe(color);
        if (fontWeight) {
            expect(wrapper.style.fontWeight).toBe(fontWeight);
        }

        const gapValue = wrapper.style.getPropertyValue("--marquee-gap");
        const durationValue =
            wrapper.style.getPropertyValue("--marquee-duration");

        if (gap === undefined) {
            expect(gapValue).toBe("");
        } else {
            expect(gapValue).toBe(gap);
        }

        if (duration === undefined) {
            expect(durationValue).toBe("");
        } else {
            expect(durationValue).toBe(duration);
        }

        expect(baseStyle).not.toHaveProperty("--marquee-gap");
        expect(baseStyle).not.toHaveProperty("--marquee-duration");

        unmount();
    });
});

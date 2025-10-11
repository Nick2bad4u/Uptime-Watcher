/**
 * Hook that detects horizontal overflow and enables marquee-style animations.
 *
 * @remarks
 * Returns a ref for the scroll container and a boolean indicating whether the
 * content overflows horizontally. Consumers can use the boolean to
 * conditionally apply CSS animations (for example, marquee scrolling for long
 * titles). The hook automatically re-evaluates on window resize events and
 * whenever the provided dependency list changes. ResizeObserver is used when
 * available but the hook gracefully degrades in environments where it is
 * unsupported.
 */

import type { RefObject } from "react";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

/**
 * Return type for {@link useOverflowMarquee}.
 */
export interface OverflowMarqueeReturn<ElementType extends HTMLElement> {
    /**
     * Ref that should be attached to the element containing the scrollable
     * inline content (typically an overflow-hidden wrapper).
     */
    readonly containerRef: RefObject<ElementType | null>;
    /**
     * Indicates whether the element currently overflows horizontally. Useful
     * for conditionally enabling marquee animations.
     */
    readonly isOverflowing: boolean;
}

/**
 * Configuration options for {@link useOverflowMarquee}.
 */
export interface OverflowMarqueeOptions<ElementType extends HTMLElement> {
    /**
     * Optional dependency list that should trigger overflow re-evaluation.
     */
    readonly dependencies?: readonly unknown[];
    /**
     * Optional external ref to reuse instead of creating an internal one.
     */
    readonly ref?: RefObject<ElementType | null>;
}

/**
 * Detects horizontal overflow to support marquee animations.
 *
 * @param dependencies - Values that should trigger an overflow re-evaluation
 *   when they change (e.g. content strings, layout toggles).
 *
 * @returns {@link OverflowMarqueeReturn} With the container ref and current
 *   overflow state.
 */
const overflowReducer = (state: boolean, next: boolean): boolean =>
    state === next ? state : next;

export function useOverflowMarquee<
    ElementType extends HTMLElement = HTMLElement,
>(
    options: OverflowMarqueeOptions<ElementType> = {}
): OverflowMarqueeReturn<ElementType> {
    const { dependencies = [], ref } = options;
    const internalRef = useRef<ElementType | null>(null);
    const containerRef: RefObject<ElementType | null> = ref ?? internalRef;

    const [isOverflowing, dispatchOverflow] = useReducer(
        overflowReducer,
        false
    );

    const measureOverflow = useCallback(
        (element: ElementType | null): boolean => {
            if (!element) {
                return false;
            }

            return element.scrollWidth - element.clientWidth > 1;
        },
        []
    );

    const dependencyFingerprint = useMemo(
        () => JSON.stringify(dependencies),
        [dependencies]
    );

    useEffect(
        function monitorOverflow() {
            const runOverflowCheck = (): void => {
                const element = containerRef.current;
                const next = measureOverflow(element);
                dispatchOverflow(next);
            };

            runOverflowCheck();

            const element = containerRef.current;
            const shouldAttachWindowListener =
                typeof window !== "undefined" && element !== null;

            const handleResize = (): void => {
                runOverflowCheck();
            };

            if (shouldAttachWindowListener) {
                window.addEventListener("resize", handleResize);
            }

            let resizeObserver: null | ResizeObserver = null;

            if (element && typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(handleResize);
                resizeObserver.observe(element);
            }

            return (): void => {
                if (shouldAttachWindowListener) {
                    window.removeEventListener("resize", handleResize);
                }
                resizeObserver?.disconnect();
            };
        },
        [containerRef, measureOverflow]
    );

    useEffect(
        function syncOverflowOnDependencyChange() {
            // eslint-disable-next-line sonarjs/void-use -- Access fingerprint to note dependency usage without additional logic.
            void dependencyFingerprint;
            const element = containerRef.current;
            const next = measureOverflow(element);
            dispatchOverflow(next);
        },
        [
            containerRef,
            dependencyFingerprint,
            measureOverflow,
        ]
    );

    return {
        containerRef,
        isOverflowing,
    };
}

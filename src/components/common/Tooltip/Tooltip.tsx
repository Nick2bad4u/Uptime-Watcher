/**
 * Rich tooltip component with modern styling and animations.
 *
 * @remarks
 * This component provides accessible, animated tooltips that can be positioned
 * around any trigger element. Built with proper ARIA attributes for
 * accessibility and optimized for performance.
 *
 * @packageDocumentation
 */

import type {
    FocusEventHandler,
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEventHandler,
    NamedExoticComponent,
    ReactNode,
    TouchEventHandler,
} from "react";

import {
    memo,
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import { useMount } from "../../../hooks/useMount";
import "./tooltip.css";

/**
 * Tooltip position relative to the trigger element.
 */
export type TooltipPosition = "bottom" | "left" | "right" | "top";

/**
 * Props for the Tooltip component.
 */
export interface TooltipTriggerProperties {
    /** Associates the trigger with the tooltip element */
    readonly "aria-describedby"?: string;
    /** Blur handler to hide tooltip on focus loss */
    readonly onBlur?: FocusEventHandler<HTMLElement>;
    /** Focus handler to show tooltip when focused */
    readonly onFocus?: FocusEventHandler<HTMLElement>;
    /** Keyboard handler for accessibility interactions */
    readonly onKeyDown?: KeyboardEventHandler<HTMLElement>;
    /** Mouse enter handler */
    readonly onMouseEnter?: MouseEventHandler<HTMLElement>;
    /** Mouse leave handler */
    readonly onMouseLeave?: MouseEventHandler<HTMLElement>;
    /** Touch end handler */
    readonly onTouchEnd?: TouchEventHandler<HTMLElement>;
    /** Touch start handler */
    readonly onTouchStart?: TouchEventHandler<HTMLElement>;
}

/**
 * Properties for the {@link Tooltip} component.
 */
export interface TooltipProperties {
    /** Function that renders the trigger element */
    readonly children: (trigger: TooltipTriggerProperties) => ReactNode;
    /** Additional CSS classes */
    readonly className?: string;
    /** Optional class name for the wrapper element */
    readonly containerClassName?: string;
    /** Tooltip content text or element */
    readonly content: ReactNode;
    /** Delay in ms before showing tooltip */
    readonly delay?: number;
    /** Whether the tooltip is disabled */
    readonly disabled?: boolean;
    /** Maximum width for the tooltip content */
    readonly maxWidth?: number;
    /** Tooltip position relative to trigger */
    readonly position?: TooltipPosition;
    /**
     * Layout mode for the trigger wrapper to avoid layout shifts.
     *
     * @defaultValue "inline"
     */
    readonly wrapMode?: "block" | "inline";
}

/**
 * Rich tooltip component with animations and smart positioning.
 *
 * @example
 *
 * ```tsx
 * <Tooltip content="Click to refresh" position="top">
 *     <button>Refresh</button>
 * </Tooltip>;
 * ```
 *
 * @param props - Component props
 *
 * @returns Tooltip wrapper component
 */
const noop = (): void => {
    // No-op default for useMount convenience
};

/**
 * Ensures tooltip position switches remain exhaustive.
 */
const assertUnreachable = (value: never): never => {
    throw new Error(`Unhandled tooltip position: ${String(value)}`);
};

export const Tooltip: NamedExoticComponent<TooltipProperties> = memo(
    function Tooltip({
        children,
        className = "",
        containerClassName = "",
        content,
        delay = 200,
        disabled = false,
        maxWidth = 250,
        position = "top",
        wrapMode = "inline",
    }: TooltipProperties) {
        const [isVisible, setIsVisible] = useState(false);
        const [shouldRender, setShouldRender] = useState(false);
        const showTimerRef = useRef<NodeJS.Timeout | null>(null);
        const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
        const tooltipId = useId();
        const containerRef = useRef<HTMLDivElement | null>(null);
        const tooltipRef = useRef<HTMLDivElement | null>(null);

        const clearTimers = useCallback((): void => {
            if (showTimerRef.current) {
                clearTimeout(showTimerRef.current);
                showTimerRef.current = null;
            }

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        }, []);

        const showTooltip = useCallback(() => {
            if (disabled) {
                return;
            }

            clearTimers();

            const commitVisible = (): void => {
                if (
                    typeof window !== "undefined" &&
                    typeof window.requestAnimationFrame === "function"
                ) {
                    window.requestAnimationFrame(() => {
                        setIsVisible(true);
                    });
                } else {
                    setIsVisible(true);
                }
            };

            showTimerRef.current = setTimeout(() => {
                setShouldRender(true);
                commitVisible();
            }, delay);
        }, [
            clearTimers,
            delay,
            disabled,
        ]);

        const hideTooltip = useCallback(() => {
            if (showTimerRef.current) {
                clearTimeout(showTimerRef.current);
                showTimerRef.current = null;
            }

            setIsVisible(false);

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }

            hideTimerRef.current = setTimeout(() => {
                setShouldRender(false);
                hideTimerRef.current = null;
            }, 200);
        }, []);

        useMount(noop, clearTimers);

        const handleFocus: FocusEventHandler<HTMLElement> = useCallback(() => {
            showTooltip();
        }, [showTooltip]);

        const handleBlur: FocusEventHandler<HTMLElement> = useCallback(() => {
            hideTooltip();
        }, [hideTooltip]);

        /**
         * Pointer enter handler applied to the tooltip container to ensure
         * hover-based tooltips activate even when the trigger element cannot
         * fire pointer events (for example, disabled buttons).
         */
        const handleContainerMouseEnter: MouseEventHandler<HTMLDivElement> =
            useCallback(() => {
                showTooltip();
            }, [showTooltip]);

        /**
         * Pointer leave handler on the tooltip container. Keeps tooltip
         * dismissal consistent across trigger/container interactions.
         */
        const handleContainerMouseLeave: MouseEventHandler<HTMLDivElement> =
            useCallback(() => {
                hideTooltip();
            }, [hideTooltip]);

        /**
         * Touch start handler applied to the tooltip container. Mirrors button
         * behaviour so touch-only controls continue to surface help text.
         */
        const handleContainerTouchStart: TouchEventHandler<HTMLDivElement> =
            useCallback(() => {
                showTooltip();
            }, [showTooltip]);

        /**
         * Touch end handler applied to the tooltip container to keep the
         * tooltip lifecycle symmetric for touch interactions.
         */
        const handleContainerTouchEnd: TouchEventHandler<HTMLDivElement> =
            useCallback(() => {
                hideTooltip();
            }, [hideTooltip]);

        const handleTriggerKeyDown = useCallback(
            (event: KeyboardEvent<HTMLElement>): void => {
                if (event.key === "Escape") {
                    hideTooltip();
                }
                if (event.key === " " || event.key === "Enter") {
                    showTooltip();
                }
            },
            [hideTooltip, showTooltip]
        );

        const tooltipClasses = useMemo(
            () =>
                [
                    "tooltip",
                    `tooltip--${position}`,
                    isVisible ? "tooltip--visible" : "",
                    className,
                ]
                    .filter(Boolean)
                    .join(" "),
            [
                className,
                isVisible,
                position,
            ]
        );

        const tooltipStyle = useMemo(
            () => ({
                maxWidth: `${maxWidth}px`,
            }),
            [maxWidth]
        );

        const describedBy = disabled ? undefined : tooltipId;

        const triggerProps = useMemo<TooltipTriggerProperties>(() => {
            if (disabled || !describedBy) {
                return {};
            }

            return {
                "aria-describedby": describedBy,
            };
        }, [describedBy, disabled]);

        const containerClasses = useMemo(
            () =>
                [
                    "tooltip-container",
                    wrapMode === "block"
                        ? "tooltip-container--block"
                        : "tooltip-container--inline",
                    containerClassName,
                ]
                    .filter(Boolean)
                    .join(" "),
            [containerClassName, wrapMode]
        );

        const applyTooltipPosition = useCallback((): void => {
            const triggerNode = containerRef.current;
            const tooltipNode = tooltipRef.current;

            if (!triggerNode || !tooltipNode) {
                return;
            }

            const triggerRect = triggerNode.getBoundingClientRect();
            const tooltipRect = tooltipNode.getBoundingClientRect();
            const offset = 10;
            const viewportPadding = 12;

            const clamp = (
                value: number,
                minimum: number,
                maximum: number
            ): number => {
                if (Number.isNaN(value)) {
                    return minimum;
                }

                if (minimum > maximum) {
                    return minimum;
                }

                return Math.min(Math.max(value, minimum), maximum);
            };

            let top = triggerRect.top - tooltipRect.height - offset;
            let left =
                triggerRect.left +
                triggerRect.width / 2 -
                tooltipRect.width / 2;
            let transformOrigin = "center bottom";
            let arrowInlineOffset = 0;
            let arrowBlockOffset = 0;

            switch (position) {
                case "bottom": {
                    top = triggerRect.bottom + offset;
                    left =
                        triggerRect.left +
                        triggerRect.width / 2 -
                        tooltipRect.width / 2;
                    transformOrigin = "center top";
                    break;
                }
                case "left": {
                    top =
                        triggerRect.top +
                        triggerRect.height / 2 -
                        tooltipRect.height / 2;
                    left = triggerRect.left - tooltipRect.width - offset;
                    transformOrigin = "right center";
                    break;
                }
                case "right": {
                    top =
                        triggerRect.top +
                        triggerRect.height / 2 -
                        tooltipRect.height / 2;
                    left = triggerRect.right + offset;
                    transformOrigin = "left center";
                    break;
                }
                case "top": {
                    break;
                }
                default: {
                    assertUnreachable(position);
                }
            }

            const baseTop = top;
            const baseLeft = left;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const clampedLeft = clamp(
                left,
                viewportPadding,
                viewportWidth - tooltipRect.width - viewportPadding
            );
            const clampedTop = clamp(
                top,
                viewportPadding,
                viewportHeight - tooltipRect.height - viewportPadding
            );

            if (position === "left" || position === "right") {
                arrowBlockOffset = baseTop - clampedTop;
            } else {
                arrowInlineOffset = baseLeft - clampedLeft;
            }

            tooltipNode.style.setProperty(
                "--tooltip-arrow-offset-inline",
                `${arrowInlineOffset}px`
            );
            tooltipNode.style.setProperty(
                "--tooltip-arrow-offset-block",
                `${arrowBlockOffset}px`
            );
            tooltipNode.style.setProperty(
                "inset-inline-start",
                `${clampedLeft}px`
            );
            tooltipNode.style.setProperty(
                "inset-block-start",
                `${clampedTop}px`
            );
            tooltipNode.style.transformOrigin = transformOrigin;
        }, [position]);

        useLayoutEffect(() => {
            if (!shouldRender || disabled) {
                return (): void => {};
            }

            applyTooltipPosition();

            const handleReposition = (): void => {
                applyTooltipPosition();
            };

            const scrollListenerOptions = {
                capture: true,
                passive: true,
            } as const;

            window.addEventListener("resize", handleReposition);
            window.addEventListener(
                "scroll",
                handleReposition,
                scrollListenerOptions
            );

            const tooltipNode = tooltipRef.current;
            const triggerNode = containerRef.current;
            let resizeObserver: null | ResizeObserver = null;

            if (typeof ResizeObserver === "function") {
                resizeObserver = new ResizeObserver(() => {
                    applyTooltipPosition();
                });

                if (tooltipNode) {
                    resizeObserver.observe(tooltipNode);
                }

                if (triggerNode) {
                    resizeObserver.observe(triggerNode);
                }
            }

            return (): void => {
                window.removeEventListener("resize", handleReposition);
                window.removeEventListener(
                    "scroll",
                    handleReposition,
                    scrollListenerOptions
                );

                resizeObserver?.disconnect();
            };
        }, [
            applyTooltipPosition,
            disabled,
            shouldRender,
        ]);

        return (
            <>
                <div
                    className={containerClasses}
                    onBlur={disabled ? undefined : handleBlur}
                    onFocus={disabled ? undefined : handleFocus}
                    onKeyDown={disabled ? undefined : handleTriggerKeyDown}
                    onMouseEnter={
                        disabled ? undefined : handleContainerMouseEnter
                    }
                    onMouseLeave={
                        disabled ? undefined : handleContainerMouseLeave
                    }
                    onTouchEnd={disabled ? undefined : handleContainerTouchEnd}
                    onTouchStart={
                        disabled ? undefined : handleContainerTouchStart
                    }
                    ref={containerRef}
                >
                    {children(triggerProps)}
                </div>
                {shouldRender && !disabled
                    ? createPortal(
                          <div
                              className={tooltipClasses}
                              data-position={position}
                              id={tooltipId}
                              ref={tooltipRef}
                              role="tooltip"
                              style={tooltipStyle}
                          >
                              <div className="tooltip__content">{content}</div>
                              <div className="tooltip__arrow" />
                          </div>,
                          document.body
                      )
                    : null}
            </>
        );
    }
);

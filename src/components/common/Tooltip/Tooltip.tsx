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

import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";
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
import { arrayJoin } from "ts-extras";

import { useMount } from "../../../hooks/useMount";
import { getGlobalDocumentBodyElement } from "../../../utils/dom/queryGlobalDocumentSelector";
import "./tooltip.css";

/**
 * Tooltip position relative to the trigger element.
 */
export type TooltipPosition =
    | "bottom"
    | "left"
    | "right"
    | "top";

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
const noop = (): void => undefined;

type WindowListenerMethod = (
    this: unknown,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
) => void;

interface ViewportSize {
    readonly height: number;
    readonly width: number;
}

type ResizeObserverLike = Pick<ResizeObserver, "disconnect" | "observe">;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isWindowListenerMethod = (
    value: unknown
): value is WindowListenerMethod => typeof value === "function";

function getWindowListenerMethod(
    holder: unknown,
    key: "addEventListener" | "removeEventListener"
): WindowListenerMethod | undefined {
    if (!isObjectLike(holder)) {
        return undefined;
    }

    try {
        const candidate: unknown = Reflect.get(holder, key);
        return isWindowListenerMethod(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
}

function addWindowEventListener(
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean
): () => void {
    const windowProperty = getOwnPropertyValue(globalThis, "window");

    if (!windowProperty.found) {
        return noop;
    }

    const addEventListener = getWindowListenerMethod(
        windowProperty.value,
        "addEventListener"
    );
    const removeEventListener = getWindowListenerMethod(
        windowProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        Reflect.apply(addEventListener, windowProperty.value, [
            type,
            handler,
            options,
        ]);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            Reflect.apply(removeEventListener, windowProperty.value, [
                type,
                handler,
                options,
            ]);
        } catch {
            // Tooltip reposition listener cleanup is best-effort.
        }
    };
}

function requestAnimationFrameSafely(
    callback: FrameRequestCallback
): null | number {
    const property = getOwnPropertyValue(globalThis, "requestAnimationFrame");

    if (!property.found || typeof property.value !== "function") {
        return null;
    }

    try {
        const rafId: unknown = Reflect.apply(property.value, globalThis, [
            callback,
        ]);

        return typeof rafId === "number" ? rafId : null;
    } catch {
        return null;
    }
}

function cancelAnimationFrameSafely(handle: number): void {
    const property = getOwnPropertyValue(globalThis, "cancelAnimationFrame");

    if (!property.found || typeof property.value !== "function") {
        return;
    }

    try {
        Reflect.apply(property.value, globalThis, [handle]);
    } catch {
        // Animation-frame cleanup is best-effort during renderer teardown.
    }
}

function getViewportSize(): null | ViewportSize {
    const windowProperty = getOwnPropertyValue(globalThis, "window");

    if (!windowProperty.found || !isObjectLike(windowProperty.value)) {
        return null;
    }

    try {
        const width: unknown = Reflect.get(windowProperty.value, "innerWidth");
        const height: unknown = Reflect.get(
            windowProperty.value,
            "innerHeight"
        );

        return typeof width === "number" &&
            Number.isFinite(width) &&
            typeof height === "number" &&
            Number.isFinite(height)
            ? { height, width }
            : null;
    } catch {
        return null;
    }
}

function isResizeObserverLike(value: unknown): value is ResizeObserverLike {
    if (!isObjectLike(value)) {
        return false;
    }

    try {
        return (
            typeof Reflect.get(value, "disconnect") === "function" &&
            typeof Reflect.get(value, "observe") === "function"
        );
    } catch {
        return false;
    }
}

function createResizeObserver(
    callback: ResizeObserverCallback
): null | ResizeObserverLike {
    const property = getOwnPropertyValue(globalThis, "ResizeObserver");

    if (!property.found || typeof property.value !== "function") {
        return null;
    }

    try {
        const observer: unknown = Reflect.construct(property.value, [callback]);
        return isResizeObserverLike(observer) ? observer : null;
    } catch {
        return null;
    }
}

function observeResizeTarget(
    observer: ResizeObserverLike,
    target: Element | null
): void {
    if (!target) {
        return;
    }

    try {
        observer.observe(target);
    } catch {
        // Tooltip repositioning falls back to window events if observation
        // fails for a detached or otherwise invalid target.
    }
}

function disconnectResizeObserver(observer: ResizeObserverLike | null): void {
    try {
        observer?.disconnect();
    } catch {
        // ResizeObserver cleanup is best-effort during renderer teardown.
    }
}

/**
 * Ensures tooltip position switches remain exhaustive.
 */
const assertUnreachable = (value: never): never => {
    throw new Error(`Unhandled tooltip position: ${String(value)}`);
};

export const Tooltip: NamedExoticComponent<TooltipProperties> = memo(
    function TooltipComponent({
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
        const showTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
        const hideTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
        const visibilityRafRef = useRef<null | number>(null);
        const tooltipId = useId();
        const containerRef = useRef<HTMLDivElement | null>(null);
        const tooltipRef = useRef<HTMLDivElement | null>(null);

        const cancelVisibilityFrame = useCallback((): void => {
            const rafId = visibilityRafRef.current;
            if (rafId === null) {
                return;
            }

            visibilityRafRef.current = null;

            cancelAnimationFrameSafely(rafId);
        }, []);

        const clearTimers = useCallback((): void => {
            cancelVisibilityFrame();

            if (showTimerRef.current) {
                clearTimeout(showTimerRef.current);
                showTimerRef.current = null;
            }

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        }, [cancelVisibilityFrame]);

        const showTooltip = useCallback(() => {
            if (disabled) {
                return;
            }

            clearTimers();

            const commitVisible = (): void => {
                const rafId = requestAnimationFrameSafely(() => {
                    visibilityRafRef.current = null;
                    setIsVisible(true);
                });

                if (rafId === null) {
                    setIsVisible(true);
                    return;
                }

                visibilityRafRef.current = rafId;
            };

            showTimerRef.current = setTimeout(() => {
                showTimerRef.current = null;
                setShouldRender(true);
                commitVisible();
            }, delay);
        }, [
            clearTimers,
            delay,
            disabled,
        ]);

        const hideTooltip = useCallback(() => {
            cancelVisibilityFrame();

            if (showTimerRef.current) {
                clearTimeout(showTimerRef.current);
                showTimerRef.current = null;
            }

            setIsVisible(false);

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }

            hideTimerRef.current = setTimeout(() => {
                hideTimerRef.current = null;
                setShouldRender(false);
            }, 200);
        }, [cancelVisibilityFrame]);

        useMount(noop, clearTimers);

        useLayoutEffect(() => {
            if (!disabled) {
                return noop;
            }

            clearTimers();
            // eslint-disable-next-line @eslint-react/set-state-in-effect -- Disabling the tooltip must synchronously discard stale delayed visibility state before a later re-enable can render it.
            setIsVisible(false);
            // eslint-disable-next-line @eslint-react/set-state-in-effect -- Disabling the tooltip must synchronously discard stale delayed render state before a later re-enable can render it.
            setShouldRender(false);

            return noop;
        }, [clearTimers, disabled]);

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
                arrayJoin(
                    [
                        "tooltip",
                        `tooltip--${position}`,
                        isVisible ? "tooltip--visible" : "",
                        className,
                    ].filter(Boolean),
                    " "
                ),
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
                arrayJoin(
                    [
                        "tooltip-container",
                        wrapMode === "block"
                            ? "tooltip-container--block"
                            : "tooltip-container--inline",
                        containerClassName,
                    ].filter(Boolean),
                    " "
                ),
            [containerClassName, wrapMode]
        );

        const applyTooltipPosition = useCallback((): void => {
            const containerNode = containerRef.current;
            const tooltipNode = tooltipRef.current;

            if (!containerNode || !tooltipNode) {
                return;
            }

            // Some call sites use wrapMode="block" which makes the container
            // stretch to full width. In those cases we still want the tooltip
            // anchored to the actual trigger element (typically the first child
            // rendered by the render-prop).
            const firstChild = containerNode.firstElementChild;
            const triggerNode =
                firstChild &&
                (firstChild.tagName === "BUTTON" ||
                    firstChild.tagName === "INPUT" ||
                    firstChild.tagName === "A")
                    ? firstChild
                    : containerNode;

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
            const viewportSize = getViewportSize();

            if (!viewportSize) {
                return;
            }

            const clampedLeft = clamp(
                left,
                viewportPadding,
                viewportSize.width - tooltipRect.width - viewportPadding
            );
            const clampedTop = clamp(
                top,
                viewportPadding,
                viewportSize.height - tooltipRect.height - viewportPadding
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
                return noop;
            }

            applyTooltipPosition();

            let rafId: null | number = null;

            const scheduleReposition = (): void => {
                if (rafId !== null) {
                    return;
                }

                // RequestAnimationFrame batches DOM reads/writes into a single
                // frame, preventing scroll/resize from triggering multiple
                // layout recalculations per frame.
                rafId = requestAnimationFrameSafely(() => {
                    rafId = null;
                    applyTooltipPosition();
                });

                if (rafId === null) {
                    applyTooltipPosition();
                }
            };

            const handleReposition = (): void => {
                scheduleReposition();
            };

            const scrollListenerOptions = {
                capture: true,
                passive: true,
            } as const;

            const removeResizeListener = addWindowEventListener(
                "resize",
                handleReposition
            );
            const removeScrollListener = addWindowEventListener(
                "scroll",
                handleReposition,
                scrollListenerOptions
            );

            const tooltipNode = tooltipRef.current;
            const triggerNode = containerRef.current;
            const resizeObserver = createResizeObserver(() => {
                scheduleReposition();
            });

            if (resizeObserver) {
                observeResizeTarget(resizeObserver, tooltipNode);
                observeResizeTarget(resizeObserver, triggerNode);
            }

            return (): void => {
                if (rafId !== null) {
                    cancelAnimationFrameSafely(rafId);
                }

                removeResizeListener();
                removeScrollListener();

                disconnectResizeObserver(resizeObserver);
            };
        }, [
            applyTooltipPosition,
            disabled,
            shouldRender,
        ]);

        const portalContainer =
            shouldRender && !disabled ? getGlobalDocumentBodyElement() : null;

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
                {portalContainer
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
                          portalContainer
                      )
                    : null}
            </>
        );
    }
);

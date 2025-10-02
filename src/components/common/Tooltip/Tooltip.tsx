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

import { memo, useCallback, useId, useMemo, useRef, useState } from "react";

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
    }: TooltipProperties) {
        const [isVisible, setIsVisible] = useState(false);
        const [shouldRender, setShouldRender] = useState(false);
        const showTimerRef = useRef<NodeJS.Timeout | null>(null);
        const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
        const tooltipId = useId();

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

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }

            if (showTimerRef.current) {
                clearTimeout(showTimerRef.current);
            }

            showTimerRef.current = setTimeout(() => {
                setShouldRender(true);
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            }, delay);
        }, [delay, disabled]);

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

        const handleMouseEnter: MouseEventHandler<HTMLElement> =
            useCallback(() => {
                showTooltip();
            }, [showTooltip]);

        const handleMouseLeave: MouseEventHandler<HTMLElement> =
            useCallback(() => {
                hideTooltip();
            }, [hideTooltip]);

        const handleTouchStart: TouchEventHandler<HTMLElement> =
            useCallback(() => {
                showTooltip();
            }, [showTooltip]);

        const handleTouchEnd: TouchEventHandler<HTMLElement> =
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
            if (disabled) {
                return {};
            }

            const handlers: TooltipTriggerProperties = {
                onBlur: handleBlur,
                onFocus: handleFocus,
                onKeyDown: handleTriggerKeyDown,
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                onTouchEnd: handleTouchEnd,
                onTouchStart: handleTouchStart,
            };

            return describedBy
                ? {
                      ...handlers,
                      "aria-describedby": describedBy,
                  }
                : handlers;
        }, [
            describedBy,
            disabled,
            handleBlur,
            handleFocus,
            handleMouseEnter,
            handleMouseLeave,
            handleTouchEnd,
            handleTouchStart,
            handleTriggerKeyDown,
        ]);

        const containerClasses = useMemo(
            () =>
                ["tooltip-container", containerClassName]
                    .filter(Boolean)
                    .join(" "),
            [containerClassName]
        );

        return (
            <span className={containerClasses}>
                {children(triggerProps)}
                {shouldRender && !disabled ? (
                    <div
                        className={tooltipClasses}
                        id={tooltipId}
                        role="tooltip"
                        style={tooltipStyle}
                    >
                        <div className="tooltip__content">{content}</div>
                        <div className="tooltip__arrow" />
                    </div>
                ) : null}
            </span>
        );
    }
);

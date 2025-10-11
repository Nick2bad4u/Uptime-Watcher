/**
 * Monitor selection dropdown component. Provides interface for selecting
 * between multiple monitors for a site.
 */

import type { Monitor } from "@shared/types";
import type { EventHandlers } from "@shared/types/componentProps";
import type { KeyboardEvent, MouseEvent, NamedExoticComponent } from "react";

import {
    memo,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { ThemedSelect } from "../../../../theme/components/ThemedSelect";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../../../utils/fallbacks";
import { AppIcons } from "../../../../utils/icons";
import { formatTitleSuffix } from "../../../../utils/monitorTitleFormatters";

const DEFAULT_PORT_VALUES = new Set<number>([80, 443]);
const PLACEHOLDER_LABEL_DEFAULT = "Select a monitor";
const PLACEHOLDER_LABEL_EMPTY = "No monitors available";

const preferHostPortIdentifier = (
    monitor: Monitor,
    identifier: string,
    fallbackIdentifier: string
): string => {
    if (!identifier) {
        return fallbackIdentifier;
    }

    if (
        typeof monitor.url === "string" &&
        identifier === monitor.url &&
        typeof monitor.port === "number" &&
        monitor.port > 0 &&
        !DEFAULT_PORT_VALUES.has(monitor.port) &&
        monitor.host
    ) {
        try {
            const parsedUrl = new URL(monitor.url);

            if (parsedUrl.hostname === monitor.host && parsedUrl.port === "") {
                return `${monitor.host}:${monitor.port}`;
            }
        } catch {
            return `${monitor.host}:${monitor.port}`;
        }
    }

    return identifier;
};

/**
 * Props for the MonitorSelector component.
 *
 * @public
 */
export interface MonitorSelectorProperties {
    /** Optional CSS classes for custom styling */
    readonly className?: string;
    /** Whether the selector should be rendered in a disabled state. Defaults to
disabled when no monitors are available. */
    readonly disabled?: boolean;
    /** Array of available monitors to choose from */
    readonly monitors: Monitor[];
    /** Callback function for selection change events */
    readonly onChange: EventHandlers.ChangeWithEvent<HTMLSelectElement>;
    /** ID of the currently selected monitor */
    readonly selectedMonitorId: string;
}

/**
 * Monitor selection dropdown component for switching between site monitors.
 *
 * Features:
 *
 * - Dynamic option formatting based on monitor type and configuration
 * - Event propagation control to prevent card click conflicts
 * - Optimized with React.memo and useCallback for performance
 * - Themed select component integration
 * - Supports HTTP and port monitor types with descriptive labels
 *
 * @example
 *
 * ```tsx
 * <MonitorSelector
 *     monitors={site.monitors}
 *     selectedMonitorId="monitor-1"
 *     onChange={handleMonitorChange}
 *     className="w-32"
 * />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX.Element containing the monitor selector dropdown
 */
export const MonitorSelector: NamedExoticComponent<MonitorSelectorProperties> =
    memo(function MonitorSelector({
        className = "min-w-20",
        disabled,
        monitors,
        onChange,
        selectedMonitorId,
    }: MonitorSelectorProperties) {
        const selectRef = useRef<HTMLSelectElement | null>(null);
        const rawGeneratedId = useId();
        const controlId = useMemo(
            () => `monitor-selector-${rawGeneratedId.replace(/:/g, "")}`,
            [rawGeneratedId]
        );
        const [isSelectFocused, setIsSelectFocused] = useState(false);

        const isDisabled = (disabled ?? false) || monitors.length === 0;

        const hasSelection = useMemo(
            () => monitors.some((monitor) => monitor.id === selectedMonitorId),
            [monitors, selectedMonitorId]
        );

        const selectValue = hasSelection ? selectedMonitorId : "";

        const placeholderLabel =
            monitors.length === 0
                ? PLACEHOLDER_LABEL_EMPTY
                : PLACEHOLDER_LABEL_DEFAULT;

        useEffect(() => {
            if (isDisabled) {
                setIsSelectFocused(false);
            }
        }, [isDisabled]);

        // Memoize event handlers to prevent recreation on every render
        const handleClick = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        const handleMouseDown = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        const handleSelectFocus = useCallback(() => {
            setIsSelectFocused(true);
        }, []);

        const handleSelectBlur = useCallback(() => {
            setIsSelectFocused(false);
        }, []);

        const openSelect = useCallback(() => {
            const selectElement = selectRef.current;
            if (!selectElement || selectElement.disabled) {
                return;
            }

            try {
                if (typeof selectElement.showPicker === "function") {
                    selectElement.showPicker();
                    return;
                }
            } catch {
                // Fallback for environments without showPicker support.
            }

            selectElement.focus({ preventScroll: true });

            try {
                selectElement.dispatchEvent(
                    new window.MouseEvent("mousedown", {
                        bubbles: true,
                        cancelable: true,
                    })
                );
            } catch {
                // Ignore synthetic dispatch failures (e.g., JSDOM)
            }

            selectElement.click();
        }, []);

        const handleWrapperClick = useCallback(
            (event: MouseEvent<HTMLDivElement>) => {
                if (isDisabled) {
                    return;
                }

                const selectElement = selectRef.current;
                if (!selectElement || selectElement.disabled) {
                    return;
                }

                if (
                    event.target instanceof Element &&
                    selectElement.contains(event.target)
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                openSelect();
            },
            [isDisabled, openSelect]
        );

        const handleWrapperKeyDown = useCallback(
            (event: KeyboardEvent<HTMLDivElement>) => {
                if (isDisabled) {
                    return;
                }

                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                openSelect();
            },
            [isDisabled, openSelect]
        );

        // Memoize the option formatting to avoid recalculation
        const formatMonitorOption = useCallback((monitor: Monitor): string => {
            const monitorTypeLabel = getMonitorTypeDisplayLabel(monitor.type);
            const fallbackIdentifier = monitor.id;

            const rawSuffix = formatTitleSuffix(monitor).trim();
            const normalizedSuffix =
                rawSuffix.startsWith("(") && rawSuffix.endsWith(")")
                    ? rawSuffix.slice(1, -1)
                    : rawSuffix;

            const identifier =
                normalizedSuffix.length > 0
                    ? normalizedSuffix
                    : preferHostPortIdentifier(
                          monitor,
                          getMonitorDisplayIdentifier(
                              monitor,
                              fallbackIdentifier
                          ),
                          fallbackIdentifier
                      );

            return identifier
                ? `${monitorTypeLabel}: ${identifier}`
                : monitorTypeLabel;
        }, []);

        const composedClassName = ["monitor-selector", className]
            .filter(Boolean)
            .join(" ");

        const wrapperClassName = [
            "monitor-selector__wrapper",
            composedClassName,
            isDisabled ? "monitor-selector__wrapper--disabled" : undefined,
        ]
            .filter(Boolean)
            .join(" ");

        const MonitorIcon = AppIcons.metrics.monitor;
        const ChevronIcon = AppIcons.ui.expand;

        return (
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- Div wrapper is required to nest the native select control.
            <div
                className={wrapperClassName}
                aria-controls={controlId}
                aria-disabled={isDisabled}
                aria-expanded={isSelectFocused}
                aria-haspopup="listbox"
                data-disabled={isDisabled}
                onClick={handleWrapperClick}
                onKeyDown={handleWrapperKeyDown}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
            >
                <span
                    aria-hidden="true"
                    className="monitor-selector__icon monitor-selector__icon--leading"
                >
                    <MonitorIcon size={16} />
                </span>
                <ThemedSelect
                    aria-label="Select monitor"
                    className="monitor-selector__input"
                    disabled={isDisabled}
                    fluid={false}
                    id={controlId}
                    onChange={onChange}
                    onBlur={handleSelectBlur}
                    onClick={handleClick}
                    onFocus={handleSelectFocus}
                    onMouseDown={handleMouseDown}
                    ref={selectRef}
                    tone="transparent"
                    value={selectValue}
                >
                    {!hasSelection ? (
                        <option value="" disabled>
                            {placeholderLabel}
                        </option>
                    ) : null}
                    {monitors.map((monitor) => (
                        <option key={monitor.id} value={monitor.id}>
                            {formatMonitorOption(monitor)}
                        </option>
                    ))}
                </ThemedSelect>
                <span
                    aria-hidden="true"
                    className="monitor-selector__icon monitor-selector__icon--trailing"
                >
                    <ChevronIcon size={14} />
                </span>
            </div>
        );
    });

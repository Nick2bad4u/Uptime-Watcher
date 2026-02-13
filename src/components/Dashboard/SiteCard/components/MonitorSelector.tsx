/**
 * Monitor selection dropdown component. Provides interface for selecting
 * between multiple monitors for a site.
 */

import type { Monitor } from "@shared/types";
import type { EventHandlers } from "@shared/types/componentProps";
import type { MouseEvent, NamedExoticComponent } from "react";

import { memo, useCallback, useId, useMemo, useRef } from "react";

import { ThemedSelect } from "../../../../theme/components/ThemedSelect";
import { AppIcons } from "../../../../utils/icons";
import { buildMonitorDisplayInfo } from "../../../../utils/monitoring/monitorDisplayInfo";

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
    /**
     * Whether the selector should be rendered in a disabled state. Defaults to
     * disabled when no monitors are available.
     */
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
            () => `monitor-selector-${rawGeneratedId.replaceAll(":", "")}`,
            [rawGeneratedId]
        );

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

        // Memoize event handlers to prevent recreation on every render
        const handleClick = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        const handleMouseDown = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        // Memoize the option formatting to avoid recalculation
        const formatMonitorOption = useCallback((monitor: Monitor): string => {
            const fallbackIdentifier = monitor.id;

            const {
                connectionInfo,
                connectionInfoSource,
                monitorTypeLabel,
            } = buildMonitorDisplayInfo({
                fallbackIdentifier,
                monitor,
            });

            const identifier =
                connectionInfoSource === "identifier"
                    ? preferHostPortIdentifier(
                          monitor,
                          connectionInfo,
                          fallbackIdentifier
                      )
                    : connectionInfo;

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

        const selectedMonitorText = useMemo(() => {
            if (!hasSelection) {
                return placeholderLabel;
            }
            const selectedMonitor = monitors.find(
                (m) => m.id === selectedMonitorId
            );
            return selectedMonitor
                ? formatMonitorOption(selectedMonitor)
                : placeholderLabel;
        }, [
            formatMonitorOption,
            hasSelection,
            monitors,
            placeholderLabel,
            selectedMonitorId,
        ]);

        const MonitorIcon = AppIcons.metrics.monitor;
        const ChevronIcon = AppIcons.ui.expand;

        return (
            <div
                className={wrapperClassName}
                data-disabled={isDisabled}
                data-prevent-row-activation="true"
                title={selectedMonitorText}
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
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    ref={selectRef}
                    tone="transparent"
                    value={selectValue}
                >
                    {hasSelection ? null : (
                        <option disabled value="">
                            {placeholderLabel}
                        </option>
                    )}
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

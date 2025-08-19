/**
 * History tab component for displaying monitor check history.
 *
 * @remarks
 * Provides comprehensive monitoring history visualization with filtering,
 * pagination, and detailed record display. Shows status changes over time with
 * support for different status types (up, down, all) and configurable history
 * limits from user settings.
 *
 * Features include:
 *
 * - Real-time status filtering (all, up, down)
 * - Configurable history display limits
 * - Detailed record information with response times
 * - Monitor type-specific detail formatting
 * - Accessible keyboard navigation and ARIA labels
 *
 * @example
 *
 * ```tsx
 * <HistoryTab selectedMonitor={monitor} />;
 * ```
 *
 * @public
 */

import type { Monitor, StatusHistory } from "@shared/types";
import type { ChangeEvent, ReactElement } from "react";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiFilter, FiInbox } from "react-icons/fi";
import { MdHistory } from "react-icons/md";

import logger from "../../../services/logger";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import StatusIndicator from "../../../theme/components/StatusIndicator";
import ThemedButton from "../../../theme/components/ThemedButton";
import ThemedCard from "../../../theme/components/ThemedCard";
import ThemedSelect from "../../../theme/components/ThemedSelect";
import ThemedText from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { DetailLabel } from "../../common/MonitorUiComponents";

/**
 * Props for the HistoryTab component.
 *
 * @remarks
 * Defines the required properties for rendering the history tab, including
 * formatting functions for consistent display and the monitor whose history
 * should be displayed.
 *
 * @public
 */
export interface HistoryTabProperties {
    /** Function to format timestamps for display */
    readonly formatFullTimestamp: (timestamp: number) => string;
    /** Function to format response times for display */
    readonly formatResponseTime: (time: number) => string;
    /** Function to format status with appropriate icons */
    readonly formatStatusWithIcon: (status: string) => string;
    /** Currently selected monitor to display history for */
    readonly selectedMonitor: Monitor;
}

/**
 * Filter type for history records.
 *
 * @remarks
 * Defines the available filter options for displaying monitor history records.
 * Used to control which records are visible in the history display.
 *
 * @public
 */
type HistoryFilter = "all" | "down" | "up";

/**
 * Get the formatted label for filter buttons.
 *
 * @param filter - The filter type to get the label for
 *
 * @returns The human-readable label for the filter button
 *
 * @internal
 */
function getFilterButtonLabel(filter: HistoryFilter): string {
    if (filter === "all") {
        return "All";
    }
    if (filter === "up") {
        return "✅ Up";
    }
    return "❌ Down";
}

/**
 * History tab component displaying paginated monitor check history.
 *
 * Features:
 *
 * - Filterable history by status (all, up, down)
 * - Configurable display limits with pagination
 * - Detailed history records with timestamps and response times
 * - Export functionality for history data
 * - User action logging for analytics
 *
 * @param props - Component props containing formatting functions and monitor
 *   data
 *
 * @returns JSX element displaying history interface
 */
export const HistoryTab = ({
    formatFullTimestamp,
    formatResponseTime,
    formatStatusWithIcon,
    selectedMonitor,
}: HistoryTabProperties): JSX.Element => {
    const { settings } = useSettingsStore();
    const { currentTheme } = useTheme();
    const [historyFilter, setHistoryFilter] = useState<"all" | "down" | "up">(
        "all"
    );
    const historyLength = selectedMonitor.history.length;

    const backendLimit = settings.historyLimit || 25;

    // Track the last monitor ID and type we logged for to prevent duplicate
    // logging
    const lastLoggedMonitorRef = useRef<null | {
        id: string;
        type: string;
    }>(null);

    // Icon colors configuration
    const getIconColors = (): {
        filters: string;
        history: string;
        timeline: string;
    } => ({
        filters: currentTheme.colors.primary[600],
        history: currentTheme.colors.primary[500],
        timeline: currentTheme.colors.warning,
    });

    const iconColors = getIconColors();

    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and
    // available history)
    const maxShow = Math.min(backendLimit, historyLength);
    const showOptions = [
        10,
        25,
        50,
        100,
        250,
        500,
        1000,
        10_000,
    ].filter((opt) => opt <= maxShow);

    // Always include 'All' if there are fewer than backendLimit
    if (
        historyLength > 0 &&
        historyLength <= backendLimit &&
        !showOptions.includes(historyLength)
    ) {
        showOptions.push(historyLength);
    }

    // Ensure we always have at least one valid option, even for small history
    // counts
    if (showOptions.length === 0) {
        if (historyLength > 0) {
            showOptions.push(historyLength);
        } else {
            showOptions.push(10);
        }
    }

    // Track user's manual history limit selection
    const [userHistoryLimit, setUserHistoryLimit] = useState<number>();

    // Compute effective history limit - use user preference or auto-calculated
    // value
    const safeHistoryLength = selectedMonitor.history.length || 0;
    const autoLimit = Math.min(
        50,
        backendLimit,
        Math.max(1, safeHistoryLength)
    );

    // Use user preference if set, otherwise use auto-calculated limit
    const historyLimit = userHistoryLimit ?? autoLimit;

    // Ensure historyLimit is always valid
    const safeHistoryLimit =
        Number.isFinite(historyLimit) && historyLimit > 0
            ? historyLimit
            : Math.min(10, Math.max(1, historyLength));

    // Log when history tab is viewed - only when monitor actually changes
    useEffect(
        function logHistoryTabViewed() {
            const currentMonitor = {
                id: selectedMonitor.id,
                type: selectedMonitor.type,
            };
            const lastLogged = lastLoggedMonitorRef.current;

            // Only log if monitor ID or type has changed (not just history
            // length)
            if (
                !lastLogged ||
                lastLogged.id !== currentMonitor.id ||
                lastLogged.type !== currentMonitor.type
            ) {
                logger.user.action("History tab viewed", {
                    monitorId: selectedMonitor.id,
                    monitorType: selectedMonitor.type,
                    totalRecords: selectedMonitor.history.length,
                });
                lastLoggedMonitorRef.current = currentMonitor;
            }
        },
        [
            selectedMonitor.history.length,
            selectedMonitor.id,
            selectedMonitor.type,
        ]
    );

    const filteredHistoryRecords = selectedMonitor.history
        .filter(
            (record: StatusHistory) =>
                historyFilter === "all" || record.status === historyFilter
        )
        .slice(0, safeHistoryLimit);

    // Helper to render details with label using dynamic formatting
    function renderDetails(record: StatusHistory): null | ReactElement {
        if (!record.details) {
            return null;
        }

        return (
            <DetailLabel
                details={record.details}
                monitorType={selectedMonitor.type}
            />
        );
    }

    // Memoized event handlers
    const createFilterHandler = useCallback(
        (filter: "all" | "down" | "up") => (): void => {
            setHistoryFilter(filter);
            logger.user.action("History filter changed", {
                filter: filter,
                monitorId: selectedMonitor.id,
                monitorType: selectedMonitor.type,
                totalRecords: historyLength,
            });
        },
        [
            historyLength,
            selectedMonitor.id,
            selectedMonitor.type,
        ]
    );

    const handleHistoryLimitChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
            const newLimit = Math.min(
                Number.parseInt(event.target.value, 10),
                backendLimit,
                historyLength
            );
            setUserHistoryLimit(newLimit);
            logger.user.action("History limit changed", {
                monitorId: selectedMonitor.id,
                newLimit: newLimit,
                totalRecords: historyLength,
            });
        },
        [
            backendLimit,
            historyLength,
            selectedMonitor.id,
        ]
    );

    const filterIcon = useMemo(
        () => <FiFilter color={iconColors.filters} />,
        [iconColors.filters]
    );
    const historyIcon = useMemo(
        () => <MdHistory color={iconColors.history} />,
        [iconColors.history]
    );
    return (
        <div className="space-y-6" data-testid="history-tab">
            {/* History Controls */}
            <ThemedCard icon={filterIcon} title="History Filters">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <ThemedText size="sm" variant="secondary">
                            Filter by status:
                        </ThemedText>
                        <div className="flex space-x-1">
                            {(
                                [
                                    "all",
                                    "up",
                                    "down",
                                ] as const
                            ).map((filter) => (
                                <ThemedButton
                                    className="capitalize"
                                    key={filter}
                                    onClick={createFilterHandler(filter)}
                                    size="xs"
                                    variant={
                                        historyFilter === filter
                                            ? "primary"
                                            : "ghost"
                                    }
                                >
                                    {getFilterButtonLabel(filter)}
                                </ThemedButton>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <ThemedText size="sm" variant="secondary">
                            Show:
                        </ThemedText>
                        <ThemedSelect
                            onChange={handleHistoryLimitChange}
                            value={safeHistoryLimit}
                        >
                            {showOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === historyLength
                                        ? `All (${option})`
                                        : option}
                                </option>
                            ))}
                        </ThemedSelect>
                        <ThemedText size="xs" variant="secondary">
                            {filteredHistoryRecords.length} of {historyLength}{" "}
                            records
                            {historyFilter !== "all" &&
                                ` (${historyFilter} filter)`}
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* History List */}
            <ThemedCard icon={historyIcon} title="Check History">
                <div className="max-h-96 space-y-2 overflow-y-auto">
                    {filteredHistoryRecords.map((record) => (
                        <div
                            className="hover:bg-surface-elevated flex items-center justify-between rounded-lg p-3 transition-colors"
                            key={record.timestamp}
                        >
                            <div className="flex items-center space-x-3">
                                <StatusIndicator
                                    size="sm"
                                    status={record.status}
                                />
                                <div>
                                    <ThemedText size="sm" weight="medium">
                                        {formatFullTimestamp(record.timestamp)}
                                    </ThemedText>
                                    <ThemedText
                                        className="ml-4"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        Record #
                                        {historyLength -
                                            selectedMonitor.history.findIndex(
                                                (r) =>
                                                    r.timestamp ===
                                                    record.timestamp
                                            )}
                                    </ThemedText>
                                    {renderDetails(record)}
                                </div>
                            </div>
                            <div className="text-right">
                                <ThemedText size="sm" weight="medium">
                                    {formatResponseTime(record.responseTime)}
                                </ThemedText>
                                <ThemedText
                                    className="ml-4"
                                    size="xs"
                                    variant="secondary"
                                >
                                    {formatStatusWithIcon(record.status)}
                                </ThemedText>
                            </div>
                        </div>
                    ))}

                    {filteredHistoryRecords.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FiInbox className="mb-4 text-4xl opacity-50" />
                            <ThemedText
                                className="mb-2"
                                size="lg"
                                variant="secondary"
                            >
                                No records found
                            </ThemedText>
                            <ThemedText size="sm" variant="secondary">
                                {historyFilter === "all"
                                    ? "No monitoring records are available yet."
                                    : `No "${historyFilter}" records found. Try adjusting your filter.`}
                            </ThemedText>
                        </div>
                    )}
                </div>
            </ThemedCard>
        </div>
    );
};

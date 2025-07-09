/* eslint-disable @typescript-eslint/no-unnecessary-condition -- will be adding multiple monitor types soon */

/**
 * History tab component for displaying monitor check history.
 * Provide    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    const maxShow = Math.min(backendLimit, historyLength); pagination, and detailed history records view.
 */

import { useState, useEffect, useRef } from "react";
import { FiFilter } from "react-icons/fi";
import { MdHistory } from "react-icons/md";

import { logger } from "../../../services";
import { useSettingsStore } from "../../../stores";
import { ThemedText, ThemedButton, StatusIndicator, ThemedCard, ThemedSelect, useTheme } from "../../../theme";
import { StatusHistory, Monitor } from "../../../types";

/**
 * Get the formatted label for filter buttons
 * @param filter - The filter type
 * @returns The formatted label for the filter button
 */
function getFilterButtonLabel(filter: "all" | "up" | "down"): string {
    if (filter === "all") {
        return "All";
    }
    if (filter === "up") {
        return "✅ Up";
    }
    return "❌ Down";
}

/**
 * Props for the HistoryTab component.
 */
interface HistoryTabProperties {
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
 * History tab component displaying paginated monitor check history.
 *
 * Features:
 * - Filterable history by status (all, up, down)
 * - Configurable display limits with pagination
 * - Detailed history records with timestamps and response times
 * - Export functionality for history data
 * - User action logging for analytics
 *
 * @param props - Component props containing formatting functions and monitor data
 * @returns JSX element displaying history interface
 */
export const HistoryTab = ({
    formatFullTimestamp,
    formatResponseTime,
    formatStatusWithIcon,
    selectedMonitor,
}: HistoryTabProperties) => {
    const { settings } = useSettingsStore();
    const { currentTheme } = useTheme();
    const [historyFilter, setHistoryFilter] = useState<"all" | "up" | "down">("all");
    const historyLength = selectedMonitor.history.length;

    const backendLimit = settings.historyLimit || 25;

    // Track the last monitor ID we logged for to prevent duplicate logging
    const lastLoggedMonitorId = useRef<string | null>(null);

    // Icon colors configuration
    const getIconColors = () => ({
        filters: currentTheme.colors.primary[600],
        history: currentTheme.colors.primary[500],
        timeline: currentTheme.colors.warning,
    });

    const iconColors = getIconColors();

    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    const maxShow = Math.min(backendLimit, historyLength);
    const showOptions = [10, 25, 50, 100, 250, 500, 1000, 10_000].filter((opt) => opt <= maxShow);
    // Always include 'All' if there are fewer than backendLimit
    if (historyLength > 0 && historyLength <= backendLimit && !showOptions.includes(historyLength)) {
        showOptions.push(historyLength);
    }
    // Default to 50, but never more than backendLimit or available history
    const defaultHistoryLimit = Math.min(50, backendLimit, historyLength);
    const [historyLimit, setHistoryLimit] = useState(defaultHistoryLimit);

    // Log when history tab is viewed - only when monitor actually changes
    useEffect(() => {
        if (lastLoggedMonitorId.current !== selectedMonitor.id) {
            logger.user.action("History tab viewed", {
                monitorId: selectedMonitor.id,
                monitorType: selectedMonitor.type,
                totalRecords: selectedMonitor.history.length,
            });
            lastLoggedMonitorId.current = selectedMonitor.id;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally exclude selectedMonitor.history to prevent re-logging on history updates
    }, [selectedMonitor.id, selectedMonitor.type]);

    useEffect(() => {
        const safeHistoryLength = selectedMonitor.history.length;
        setHistoryLimit(Math.min(50, backendLimit, safeHistoryLength));
    }, [settings.historyLimit, backendLimit, selectedMonitor.history]);

    const filteredHistoryRecords = selectedMonitor.history
        .filter((record: StatusHistory) => historyFilter === "all" || record.status === historyFilter)
        .slice(0, historyLimit);

    // Helper to render details with label
    // Use 'details' as optional property to handle records that may not have detail information
    function renderDetails(record: StatusHistory) {
        if (!record.details) {
            return null;
        }

        const getDetailLabel = (): string => {
            if (selectedMonitor.type === "port") {
                return `Port: ${record.details}`;
            }
            if (selectedMonitor.type === "http") {
                return `Response Code: ${record.details}`;
            }

            return record.details ?? "";
        };

        return (
            <ThemedText size="xs" variant="secondary" className="ml-4">
                {getDetailLabel()}
            </ThemedText>
        );
    }

    return (
        <div data-testid="history-tab" className="space-y-6">
            {/* History Controls */}
            <ThemedCard icon={<FiFilter color={iconColors.filters} />} title="History Filters">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-3">
                        <ThemedText size="sm" variant="secondary">
                            Filter by status:
                        </ThemedText>
                        <div className="flex space-x-1">
                            {(["all", "up", "down"] as const).map((filter) => (
                                <ThemedButton
                                    key={filter}
                                    variant={historyFilter === filter ? "primary" : "ghost"}
                                    size="xs"
                                    onClick={() => {
                                        setHistoryFilter(filter);
                                        logger.user.action("History filter changed", {
                                            filter: filter,
                                            monitorId: selectedMonitor.id,
                                            monitorType: selectedMonitor.type,
                                            totalRecords: historyLength,
                                        });
                                    }}
                                    className="capitalize"
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
                            value={historyLimit}
                            onChange={(event) => {
                                const newLimit = Math.min(
                                    Number.parseInt(event.target.value, 10),
                                    backendLimit,
                                    historyLength
                                );
                                setHistoryLimit(newLimit);
                                logger.user.action("History limit changed", {
                                    monitorId: selectedMonitor.id,
                                    newLimit: newLimit,
                                    totalRecords: historyLength,
                                });
                            }}
                        >
                            {showOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === historyLength ? `All (${option})` : option}
                                </option>
                            ))}
                        </ThemedSelect>
                        <ThemedText size="xs" variant="secondary">
                            of {filteredHistoryRecords.length} records
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* History List */}
            <ThemedCard icon={<MdHistory color={iconColors.history} />} title="Check History">
                <div className="space-y-2 overflow-y-auto max-h-96">
                    {filteredHistoryRecords.map((record, index: number) => (
                        <div
                            key={record.timestamp}
                            className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-surface-elevated"
                        >
                            <div className="flex items-center space-x-3">
                                <StatusIndicator status={record.status} size="sm" />
                                <div>
                                    <ThemedText size="sm" weight="medium">
                                        {formatFullTimestamp(record.timestamp)}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="ml-4">
                                        Check #{selectedMonitor.history.length - index}
                                    </ThemedText>
                                    {renderDetails(record)}
                                </div>
                            </div>
                            <div className="text-right">
                                <ThemedText size="sm" weight="medium">
                                    {formatResponseTime(record.responseTime)}
                                </ThemedText>
                                <ThemedText size="xs" variant="secondary" className="ml-4">
                                    {formatStatusWithIcon(record.status)}
                                </ThemedText>
                            </div>
                        </div>
                    ))}

                    {filteredHistoryRecords.length === 0 && (
                        <div className="py-8 text-center">
                            <ThemedText variant="secondary">No records found for the selected filter.</ThemedText>
                        </div>
                    )}
                </div>
            </ThemedCard>
        </div>
    );
};

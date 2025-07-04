/**
 * History tab component for displaying monitor check history.
 * Provides filtering, pagination, and detailed history records view.
 */

import { useState, useEffect, useRef } from "react";

import logger from "../../../services/logger";
import { useSettingsStore } from "../../../stores";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator } from "../../../theme/components";
import { StatusHistory, Monitor } from "../../../types";

/**
 * Props for the HistoryTab component.
 */
interface HistoryTabProps {
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
export function HistoryTab({
    formatFullTimestamp,
    formatResponseTime,
    formatStatusWithIcon,
    selectedMonitor,
}: HistoryTabProps) {
    const { settings } = useSettingsStore();
    const [historyFilter, setHistoryFilter] = useState<"all" | "up" | "down">("all");
    const historyLength = (selectedMonitor.history || []).length;

    const backendLimit = settings.historyLimit || 25;

    // Track the last monitor ID we logged for to prevent duplicate logging
    const lastLoggedMonitorId = useRef<string | null>(null);

    /**
     * Get the display label for filter buttons
     * @param filter - The filter type
     * @returns The formatted label for the filter button
     */
    function getFilterButtonLabel(filter: "all" | "up" | "down"): string {
        if (filter === "all") return "All";
        if (filter === "up") return "✅ Up";
        return "❌ Down";
    }

    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    const maxShow = Math.min(backendLimit, historyLength);
    const showOptions = [10, 25, 50, 100, 250, 500, 1000, 10000].filter((opt) => opt <= maxShow);
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
                totalRecords: (selectedMonitor.history || []).length,
            });
            lastLoggedMonitorId.current = selectedMonitor.id;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally exclude selectedMonitor.history to prevent re-logging on history updates
    }, [selectedMonitor.id, selectedMonitor.type]);

    useEffect(() => {
        const safeHistoryLength = (selectedMonitor.history || []).length;
        setHistoryLimit(Math.min(50, backendLimit, safeHistoryLength));
    }, [settings.historyLimit, backendLimit, selectedMonitor.history]);

    const filteredHistoryRecords = (selectedMonitor.history || [])
        .filter((record: StatusHistory) => historyFilter === "all" || record.status === historyFilter)
        .slice(0, historyLimit);

    // Helper to render details with label
    // Use 'details' as optional property to handle records that may not have detail information
    function renderDetails(record: StatusHistory) {
        if (!record.details) return undefined;

        const getDetailLabel = (): string => {
            if (selectedMonitor.type === "port") return `Port: ${record.details}`;
            if (selectedMonitor.type === "http") return `Response Code: ${record.details}`;

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
            {/* History Tab */}
            <ThemedText variant="primary" weight="bold">
                History Tab
            </ThemedText>
            {/* History Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <ThemedText size="lg" weight="semibold">
                        Check History
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
                                className="ml-4 capitalize"
                            >
                                {getFilterButtonLabel(filter)}
                            </ThemedButton>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <ThemedText size="sm" variant="secondary">
                        Show:
                    </ThemedText>
                    <select
                        value={historyLimit}
                        onChange={(e) => {
                            const newLimit = Number(e.target.value);
                            setHistoryLimit(newLimit);
                            logger.user.action("History display limit changed", {
                                limit: newLimit,
                                monitorId: selectedMonitor.id,
                                monitorType: selectedMonitor.type,
                                totalRecords: historyLength,
                            });
                        }}
                        className="px-2 py-1 border rounded"
                        aria-label="History limit"
                    >
                        {showOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                        {historyLength > backendLimit && <option value={historyLength}>All ({historyLength})</option>}
                    </select>
                    <ThemedText size="sm" variant="secondary">
                        of {historyLength} checks
                    </ThemedText>
                </div>
            </div>

            {/* History List */}
            <ThemedBox surface="base" padding="md" border rounded="lg" className="overflow-y-auto max-h-96">
                <div className="space-y-2">
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
                                        Check #{(selectedMonitor.history || []).length - index}
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
                </div>
            </ThemedBox>

            {filteredHistoryRecords.length === 0 && (
                <div className="py-8 text-center">
                    <ThemedText variant="secondary">No records found for the selected filter.</ThemedText>
                </div>
            )}
        </div>
    );
}

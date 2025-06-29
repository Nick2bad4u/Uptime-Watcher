/**
 * History tab component for displaying monitor check history.
 * Provides filtering, pagination, and detailed history records view.
 */

import { useState, useEffect, useRef } from "react";

import logger from "../../../services/logger";
import { useStore } from "../../../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator } from "../../../theme/components";
import { StatusHistory, Monitor } from "../../../types";

/**
 * Props for the HistoryTab component.
 */
interface HistoryTabProps {
    /** Function to format timestamps for display */
    formatFullTimestamp: (timestamp: number) => string;
    /** Function to format response times for display */
    formatResponseTime: (time: number) => string;
    /** Function to format status with appropriate icons */
    formatStatusWithIcon: (status: string) => string;
    /** Currently selected monitor to display history for */
    selectedMonitor: Monitor;
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
    const { settings } = useStore();
    const [historyFilter, setHistoryFilter] = useState<"all" | "up" | "down">("all");
    const historyLength = (selectedMonitor.history || []).length;
    const backendLimit = settings.historyLimit || 25;

    // Track the last monitor ID we logged for to prevent duplicate logging
    const lastLoggedMonitorId = useRef<string | null>(null);

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
        setHistoryLimit(Math.min(50, backendLimit, (selectedMonitor.history || []).length));
    }, [settings.historyLimit, selectedMonitor.history.length, backendLimit, selectedMonitor.history]);

    const filteredHistoryRecords = (selectedMonitor.history || [])
        .filter((record: StatusHistory) => historyFilter === "all" || record.status === historyFilter)
        .slice(0, historyLimit);

    // Helper to render details with label
    // Use 'details' as optional property to handle records that may not have detail information
    function renderDetails(record: StatusHistory & { details?: string }) {
        if (!record.details) return undefined;
        if (selectedMonitor.type === "port") {
            return (
                <ThemedText size="xs" variant="secondary" className="ml-4">
                    Port: {record.details}
                </ThemedText>
            );
        }
        if (selectedMonitor.type === "http") {
            return (
                <ThemedText size="xs" variant="secondary" className="ml-4">
                    Response Code: {record.details}
                </ThemedText>
            );
        }
        return (
            <ThemedText size="xs" variant="secondary" className="ml-4">
                {record.details}
            </ThemedText>
        );
    }

    return (
        <div className="space-y-6">
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
                                {filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down"}
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

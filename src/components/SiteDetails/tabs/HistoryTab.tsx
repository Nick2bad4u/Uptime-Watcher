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

import type { Monitor, SiteStatus, StatusHistory } from "@shared/types";
import type {
    ChangeEvent,
    CSSProperties,
    NamedExoticComponent,
    ReactElement,
} from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { InterfaceDensity } from "../../../stores/ui/types";

import { logger } from "../../../services/logger";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import {
    formatStatusLabel,
    getStatusIconComponent,
} from "../../../utils/status";
import { DetailLabel } from "../../common/MonitorUiComponents";

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectSurfaceDensity = (state: UiStoreState): InterfaceDensity =>
    state.surfaceDensity;

const selectSetSurfaceDensity = (
    state: UiStoreState
): UiStoreState["setSurfaceDensity"] => state.setSurfaceDensity;

const HISTORY_DENSITY_OPTIONS: readonly InterfaceDensity[] = [
    "comfortable",
    "cozy",
    "compact",
];

const HISTORY_DENSITY_LABELS: Record<InterfaceDensity, string> = {
    comfortable: "Comfort",
    compact: "Compact",
    cozy: "Cozy",
};

const HISTORY_DENSITY_ICONS: Record<InterfaceDensity, IconType> = {
    comfortable: AppIcons.layout.cards,
    compact: AppIcons.layout.list,
    cozy: AppIcons.layout.compact,
};

function extractHttpStatusCode(details: string): null | number {
    const trimmed = details.trim();
    if (trimmed.length === 0) return null;

    const candidateRegex = /\b(?<statusCode>[1-5]\d{2})\b/u;
    const hasHttpContext = /\bcode\b|\bhttp\b|\bstatus\b/iu.test(trimmed);

    if (hasHttpContext) {
        const match = candidateRegex.exec(trimmed);
        const raw = match?.groups?.["statusCode"];
        return raw ? Number(raw) : null;
    }

    // Also accept strings like "200 OK" or "404 Not Found".
    const beginsWithCode = /^(?<statusCode>[1-5]\d{2})\b/u.exec(trimmed);
    const raw = beginsWithCode?.groups?.["statusCode"];
    return raw ? Number(raw) : null;
}

function getHttpStatusIcon(code: number): IconType | null {
    if (!Number.isFinite(code)) return null;

    if (code >= 200 && code <= 299) {
        return AppIcons.status.up;
    }

    if (code >= 300 && code <= 399) {
        return AppIcons.actions.refreshAlt;
    }

    if (code >= 400 && code <= 499) {
        return AppIcons.status.warning;
    }

    if (code >= 500 && code <= 599) {
        return AppIcons.status.downFilled;
    }

    return null;
}

type HistoryRowStyle = CSSProperties & {
    "--surface-order"?: number;
};

/**
 * Resolves the effective backend history limit used to cap history display
 * options.
 *
 * @remarks
 * The shared history-limit rules treat a persisted value of `0` as "unlimited"
 * retention. When the settings store reports `0`, this helper interprets it as
 * an unbounded backend limit for the purposes of the history-tab UI so that the
 * dropdown can offer up to the full available history instead of incorrectly
 * falling back to a small default window.
 *
 * For non-zero values the helper simply normalizes to a finite, positive
 * integer, falling back to the shared default when settings are not yet
 * populated.
 */
const resolveBackendHistoryLimit = (
    rawLimit: number | undefined,
    historyLength: number
): number => {
    if (rawLimit === 0) {
        // Unlimited retention – cap UI at the number of available records.
        return historyLength > 0
            ? historyLength
            : DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
    }

    if (typeof rawLimit !== "number" || Number.isNaN(rawLimit)) {
        return DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
    }

    const normalized = Math.floor(rawLimit);

    if (normalized <= 0) {
        return DEFAULT_HISTORY_LIMIT_RULES.minLimit;
    }

    return normalized;
};

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

const FILTER_LABELS: Record<HistoryFilter, string> = {
    all: "All",
    down: "Down",
    up: "Up",
};

const FILTER_OPTIONS: ReadonlyArray<{
    readonly status?: SiteStatus;
    readonly value: HistoryFilter;
}> = [
    { value: "all" },
    { status: "up", value: "up" },
    { status: "down", value: "down" },
];

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
 *   data.
 *
 * @returns JSX element displaying history interface.
 *
 * @public
 */
export const HistoryTab: NamedExoticComponent<HistoryTabProperties> = memo(
    function HistoryTab({
        formatFullTimestamp,
        formatResponseTime,
        selectedMonitor,
    }: HistoryTabProperties): JSX.Element {
        type SettingsStoreState = ReturnType<typeof useSettingsStore.getState>;
        const selectHistoryLimit = useCallback(
            (
                state: SettingsStoreState
            ): SettingsStoreState["settings"]["historyLimit"] =>
                state.settings.historyLimit,
            []
        );

        const historyLimitSetting = useSettingsStore(selectHistoryLimit);
        const historyDensity = useUIStore(selectSurfaceDensity);
        const setHistoryDensity = useUIStore(selectSetSurfaceDensity);
        const [userHistoryLimit, setUserHistoryLimit] = useState<
            number | undefined
        >();
        const { currentTheme } = useTheme();
        const [historyFilter, setHistoryFilter] =
            useState<HistoryFilter>("all");
        const historyLength = selectedMonitor.history.length;
        const backendLimit = resolveBackendHistoryLimit(
            historyLimitSetting,
            historyLength
        );

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

        const FilterIcon = AppIcons.actions.filter;
        const HistoryIcon = AppIcons.ui.history;
        const InboxIcon = AppIcons.ui.inbox;

        const FilterAllIcon = AppIcons.ui.analytics;

        // Dropdown options: a curated set of record counts plus an "All"
        // entry, clamped to the resolved backend limit and the available
        // history length.
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

        const selectedMonitorHistoryLengthRef = useRef<number>(
            selectedMonitor.history.length
        );

        useLayoutEffect(
            function syncSelectedMonitorHistoryLengthRef() {
                selectedMonitorHistoryLengthRef.current =
                    selectedMonitor.history.length;
            },
            [
                selectedMonitor.history.length,
                selectedMonitor.id,
                selectedMonitor.type,
            ]
        );

        // Log when history tab is viewed - only when monitor actually changes
        useEffect(
            function logHistoryTabViewed() {
                logger.user.action("History tab viewed", {
                    monitorId: selectedMonitor.id,
                    monitorType: selectedMonitor.type,
                    totalRecords: selectedMonitorHistoryLengthRef.current,
                });
            },
            [selectedMonitor.id, selectedMonitor.type]
        );

        const recordIndexByTimestamp = useMemo(() => {
            const map = new Map<number, number>();
            for (const [index, record] of selectedMonitor.history.entries()) {
                map.set(record.timestamp, index);
            }
            return map;
        }, [selectedMonitor.history]);

        const filteredHistoryRecords = useMemo(
            () =>
                selectedMonitor.history
                    .filter(
                        (record: StatusHistory) =>
                            historyFilter === "all" ||
                            record.status === historyFilter
                    )
                    .slice(0, safeHistoryLimit),
            [
                historyFilter,
                safeHistoryLimit,
                selectedMonitor.history,
            ]
        );

        // Helper to render details with label using dynamic formatting
        function renderDetails(record: StatusHistory): null | ReactElement {
            if (!record.details) {
                return null;
            }

            const statusCode = extractHttpStatusCode(record.details);
            const StatusCodeIcon =
                statusCode === null ? null : getHttpStatusIcon(statusCode);

            const statusIconNode = StatusCodeIcon ? (
                <StatusCodeIcon aria-hidden="true" className="size-4" />
            ) : null;

            return (
                <div className="flex items-center gap-2">
                    {statusIconNode}
                    <DetailLabel
                        details={record.details}
                        monitorType={selectedMonitor.type}
                    />
                </div>
            );
        }

        // Memoized event handlers
        const createFilterHandler = useCallback(
            (filter: HistoryFilter) => (): void => {
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
            () => <FilterIcon color={iconColors.filters} />,
            [FilterIcon, iconColors.filters]
        );
        const historyIcon = useMemo(
            () => <HistoryIcon color={iconColors.history} />,
            [HistoryIcon, iconColors.history]
        );

        const handleHistoryDensityChange = useCallback(
            (density: InterfaceDensity): void => {
                setHistoryDensity(density);
                logger.user.action("History density changed", {
                    density,
                    monitorId: selectedMonitor.id,
                    totalRecords: historyLength,
                });
            },
            [
                historyLength,
                selectedMonitor.id,
                setHistoryDensity,
            ]
        );

        const createDensityHandler = useCallback(
            (density: InterfaceDensity): (() => void) =>
                () => {
                    handleHistoryDensityChange(density);
                },
            [handleHistoryDensityChange]
        );

        const densityIconNodes = useMemo(() => {
            const ComfortableDensityIcon = HISTORY_DENSITY_ICONS.comfortable;
            const CozyDensityIcon = HISTORY_DENSITY_ICONS.cozy;
            const CompactDensityIcon = HISTORY_DENSITY_ICONS.compact;

            return {
                comfortable: (
                    <ComfortableDensityIcon aria-hidden className="size-4" />
                ),
                compact: <CompactDensityIcon aria-hidden className="size-4" />,
                cozy: <CozyDensityIcon aria-hidden className="size-4" />,
            } satisfies Record<InterfaceDensity, ReactElement>;
        }, []);

        const densityButtons = useMemo(
            () =>
                HISTORY_DENSITY_OPTIONS.map((density) => {
                    const isActive = historyDensity === density;
                    const densityIcon = densityIconNodes[density];

                    return (
                        <ThemedButton
                            icon={densityIcon}
                            key={density}
                            onClick={createDensityHandler(density)}
                            size="xs"
                            variant={isActive ? "primary" : "ghost"}
                        >
                            {HISTORY_DENSITY_LABELS[density]}
                        </ThemedButton>
                    );
                }),
            [
                createDensityHandler,
                densityIconNodes,
                historyDensity,
            ]
        );

        const historyTabClassName = `space-y-6 history-tab history-tab--${historyDensity} density--${historyDensity}`;
        const historyRowStyles = useMemo<HistoryRowStyle[]>(
            () =>
                filteredHistoryRecords.map((_, index) => ({
                    "--surface-order": index,
                })),
            [filteredHistoryRecords]
        );

        return (
            <div className={historyTabClassName} data-testid="history-tab">
                {/* History Controls */}
                <ThemedCard icon={filterIcon} title="History Filters">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <ThemedText size="sm" variant="secondary">
                                Filter by status:
                            </ThemedText>
                            <div className="flex space-x-1">
                                {FILTER_OPTIONS.map(({ status, value }) => {
                                    const isActive = historyFilter === value;
                                    const FilterIconComponent = status
                                        ? getStatusIconComponent(status)
                                        : FilterAllIcon;

                                    return (
                                        <ThemedButton
                                            className="capitalize"
                                            key={value}
                                            onClick={createFilterHandler(value)}
                                            size="xs"
                                            variant={
                                                isActive ? "primary" : "ghost"
                                            }
                                        >
                                            <span className="history-filter__content">
                                                <FilterIconComponent
                                                    aria-hidden="true"
                                                    className="history-filter__icon"
                                                    size={14}
                                                />
                                                <span className="history-filter__label">
                                                    {FILTER_LABELS[value]}
                                                </span>
                                            </span>
                                        </ThemedButton>
                                    );
                                })}
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
                                {filteredHistoryRecords.length} of{" "}
                                {historyLength} records
                                {historyFilter !== "all" &&
                                    ` (${historyFilter} filter)`}
                            </ThemedText>
                        </div>

                        <div className="flex items-center space-x-3">
                            <ThemedText size="sm" variant="secondary">
                                Density:
                            </ThemedText>
                            <div className="flex space-x-1">
                                {densityButtons}
                            </div>
                        </div>
                    </div>
                </ThemedCard>

                {/* History List */}
                <ThemedCard icon={historyIcon} title="Check History">
                    <div className="history-tab__list">
                        {filteredHistoryRecords.map((record, index) => {
                            const rawStatus = record.status as
                                | SiteStatus
                                | undefined;
                            const resolvedStatus: SiteStatus =
                                rawStatus ?? "unknown";

                            const recordIndex = recordIndexByTimestamp.get(
                                record.timestamp
                            );
                            const resolvedIndex =
                                recordIndex ??
                                Math.min(historyLength - 1, index);
                            const recordSequenceNumber =
                                historyLength - resolvedIndex;

                            const StatusIconComponent =
                                getStatusIconComponent(resolvedStatus);
                            const statusLabel =
                                formatStatusLabel(resolvedStatus);
                            const detailContent = renderDetails(record);
                            const rowClassName = detailContent
                                ? "history-tab__row history-tab__row--with-detail"
                                : "history-tab__row history-tab__row--no-detail";

                            return (
                                <div
                                    className={rowClassName}
                                    key={record.timestamp}
                                    style={historyRowStyles[index]}
                                >
                                    <div className="history-tab__row-content">
                                        <StatusIndicator
                                            size="sm"
                                            status={resolvedStatus}
                                        />
                                        <div className="history-tab__row-meta">
                                            <div className="history-tab__row-meta-header">
                                                <ThemedText
                                                    size="sm"
                                                    weight="medium"
                                                >
                                                    {formatFullTimestamp(
                                                        record.timestamp
                                                    )}
                                                </ThemedText>
                                                <ThemedText
                                                    className="history-tab__row-sequence"
                                                    size="xs"
                                                    variant="secondary"
                                                >
                                                    Record #
                                                    {recordSequenceNumber}
                                                </ThemedText>
                                            </div>
                                        </div>
                                    </div>
                                    {detailContent ? (
                                        <div className="history-tab__row-detail">
                                            {detailContent}
                                        </div>
                                    ) : null}
                                    <div className="history-tab__row-stats">
                                        <ThemedText
                                            className="history-tab__row-response"
                                            size="sm"
                                            weight="medium"
                                        >
                                            {formatResponseTime(
                                                record.responseTime
                                            )}
                                        </ThemedText>
                                        <div className="history-tab__row-status">
                                            <StatusIconComponent
                                                className="history-tab__row-status-icon"
                                                size={14}
                                            />
                                            <ThemedText
                                                size="xs"
                                                variant="secondary"
                                            >
                                                {statusLabel}
                                            </ThemedText>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredHistoryRecords.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <InboxIcon className="mb-4 text-4xl opacity-50" />
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
    }
);

/**
 * Monitoring configuration card for the Site Details Settings tab.
 */

import type { ChangeEvent, ReactElement, ReactNode } from "react";

import { useMemo } from "react";

import {
    CHECK_INTERVALS,
    RETRY_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS,
} from "../../../constants";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { formatRetryAttemptsText, getIntervalLabel } from "../../../utils/time";
import {
    calculateMaxCheckDurationSeconds,
    formatSecondsWithMinutes,
} from "./SettingsTab.utils";
import { SiteSettingsHelpText } from "./SiteSettingsHelpText";
import { SiteSettingsNumberField } from "./SiteSettingsNumberField";

const DurationIcon = AppIcons.metrics.time;
const InfoIcon = AppIcons.ui.info;
const RetryIcon = AppIcons.actions.refreshAlt;
const SaveIcon = AppIcons.actions.save;
const WarningIcon = AppIcons.status.warning;
const LastCheckedIcon = AppIcons.metrics.activity;

const CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS = 15;

/**
 * Props for {@link SettingsTabMonitoringConfigurationCard}.
 */
export interface SettingsTabMonitoringConfigurationCardProperties {
    readonly handleIntervalChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    readonly handleRetryAttemptsChange: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly handleTimeoutChange: (e: ChangeEvent<HTMLInputElement>) => void;
    readonly intervalChanged: boolean;
    readonly localCheckIntervalMs: number;
    readonly localRetryAttempts: number;
    readonly localTimeoutSeconds: number;
    readonly onSaveInterval: () => void;
    readonly onSaveRetryAttempts: () => void;
    readonly onSaveTimeout: () => void;
    readonly retryAttemptsChanged: boolean;
    readonly timeoutChanged: boolean;
}

function getMaxDurationVariant(
    maxTotalSeconds: number,
    backoffSeconds: number
): "error" | "success" | "warning" {
    if (backoffSeconds >= 16 || maxTotalSeconds >= 180) {
        return "error";
    }

    if (backoffSeconds >= 8 || maxTotalSeconds >= 60) {
        return "warning";
    }

    return "success";
}

/**
 * Renders the “Monitoring Configuration” section of
 * {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
 */
export const SettingsTabMonitoringConfigurationCard = ({
    handleIntervalChange,
    handleRetryAttemptsChange,
    handleTimeoutChange,
    intervalChanged,
    localCheckIntervalMs,
    localRetryAttempts,
    localTimeoutSeconds,
    onSaveInterval,
    onSaveRetryAttempts,
    onSaveTimeout,
    retryAttemptsChanged,
    timeoutChanged,
}: SettingsTabMonitoringConfigurationCardProperties): ReactElement => {
    const { currentTheme } = useTheme();
    const buttonIconSize = getIconSize("sm");
    const fieldIconSize = getIconSize("xs");
    const timingColor = currentTheme.colors.warning;

    const saveIcon = useMemo(
        () => <SaveIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize]
    );

    const cardIcon = useMemo(
        () => <DurationIcon color={timingColor} size={18} />,
        [timingColor]
    );

    const intervalLabelIcon = useMemo(
        () => <DurationIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );

    const timeoutFieldLabel = useMemo(
        () => (
            <span className="inline-flex items-center gap-2">
                <DurationIcon aria-hidden size={fieldIconSize} />
                Timeout (seconds)
            </span>
        ),
        [fieldIconSize]
    );

    const retryAttemptsFieldLabel = useMemo(
        () => (
            <span className="inline-flex items-center gap-2">
                <RetryIcon aria-hidden size={fieldIconSize} />
                Retry attempts
            </span>
        ),
        [fieldIconSize]
    );

    const maxCheckDuration = useMemo(
        () =>
            calculateMaxCheckDurationSeconds({
                retryAttempts: localRetryAttempts,
                timeoutSeconds: localTimeoutSeconds,
            }),
        [localRetryAttempts, localTimeoutSeconds]
    );

    const maxDurationVariant = useMemo(
        () =>
            getMaxDurationVariant(
                maxCheckDuration.totalSeconds,
                maxCheckDuration.backoffSeconds
            ),
        [maxCheckDuration.backoffSeconds, maxCheckDuration.totalSeconds]
    );

    const maxDurationLabel = useMemo(
        () => formatSecondsWithMinutes(maxCheckDuration.totalSeconds),
        [maxCheckDuration.totalSeconds]
    );

    const isTimeoutValid =
        localTimeoutSeconds >= TIMEOUT_CONSTRAINTS.MIN &&
        localTimeoutSeconds <= TIMEOUT_CONSTRAINTS.MAX;

    const isRetryAttemptsValid =
        localRetryAttempts >= RETRY_CONSTRAINTS.MIN &&
        localRetryAttempts <= RETRY_CONSTRAINTS.MAX;

    const timeoutHelperText = useMemo<ReactNode>(
        () => (
            <span>
                Maximum time to wait per attempt before it is treated as failed.
                <span className="ml-2 inline-flex items-center gap-1 font-medium">
                    <DurationIcon aria-hidden size={14} />
                    Current: {formatSecondsWithMinutes(localTimeoutSeconds)}
                </span>
                <span className="ml-2 inline-flex items-center gap-1">
                    <DurationIcon aria-hidden size={14} />
                    Max: {formatSecondsWithMinutes(TIMEOUT_CONSTRAINTS.MAX)}
                </span>
            </span>
        ),
        [localTimeoutSeconds]
    );

    const retryAttemptsHelperText = useMemo<ReactNode>(
        () => (
            <span>
                {formatRetryAttemptsText(localRetryAttempts)}.
                <span className="ml-2">Range: 0–{RETRY_CONSTRAINTS.MAX}.</span>
                <span className="ml-2">
                    Values above {RETRY_CONSTRAINTS.MAX} are clamped.
                </span>
            </span>
        ),
        [localRetryAttempts]
    );

    return (
        <ThemedCard icon={cardIcon} title="Monitoring Configuration">
            <div className="site-settings-section">
                <div className="site-settings-field">
                    <ThemedText
                        className="site-settings-field__label"
                        size="sm"
                        variant="secondary"
                        weight="medium"
                    >
                        <span className="inline-flex items-center gap-2">
                            {intervalLabelIcon}
                            Check interval
                        </span>
                    </ThemedText>
                    <div className="site-settings-field__controls">
                        <ThemedSelect
                            className="flex-1"
                            onChange={handleIntervalChange}
                            value={localCheckIntervalMs}
                        >
                            {CHECK_INTERVALS.map((interval) => {
                                const value =
                                    typeof interval === "number"
                                        ? interval
                                        : interval.value;
                                const label = getIntervalLabel(interval);
                                return (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                        </ThemedSelect>
                        <ThemedButton
                            disabled={!intervalChanged}
                            icon={saveIcon}
                            onClick={onSaveInterval}
                            size="sm"
                            variant={intervalChanged ? "primary" : "secondary"}
                        >
                            Save
                        </ThemedButton>
                    </div>
                    <div className="mt-2">
                        <SiteSettingsHelpText>
                            How often Uptime Watcher runs a check for this
                            monitor.
                            <span className="ml-2 inline-flex items-center gap-1 font-medium">
                                <DurationIcon aria-hidden size={14} />
                                Current:{" "}
                                {formatSecondsWithMinutes(
                                    Math.round(localCheckIntervalMs / 1000)
                                )}
                            </span>
                        </SiteSettingsHelpText>
                    </div>

                    {Math.round(localCheckIntervalMs / 1000) <
                    CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS ? (
                        <div className="mt-2">
                            <SiteSettingsHelpText
                                icon={WarningIcon}
                                tone="warning"
                            >
                                Intervals below{" "}
                                {CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS}s may
                                cause multiple in-flight checks if a request
                                takes longer than the interval. Not recommended.
                            </SiteSettingsHelpText>
                        </div>
                    ) : null}
                </div>

                <SiteSettingsNumberField
                    errorText={`Allowed range: ${TIMEOUT_CONSTRAINTS.MIN}-${TIMEOUT_CONSTRAINTS.MAX} seconds.`}
                    helperText={timeoutHelperText}
                    isChanged={timeoutChanged}
                    isValid={isTimeoutValid}
                    label={timeoutFieldLabel}
                    max={TIMEOUT_CONSTRAINTS.MAX}
                    min={TIMEOUT_CONSTRAINTS.MIN}
                    onChange={handleTimeoutChange}
                    onSave={onSaveTimeout}
                    placeholder="Enter timeout in seconds"
                    saveIcon={saveIcon}
                    step={TIMEOUT_CONSTRAINTS.STEP}
                    value={localTimeoutSeconds}
                />

                <SiteSettingsNumberField
                    errorText={`Retry attempts must be between ${RETRY_CONSTRAINTS.MIN} and ${RETRY_CONSTRAINTS.MAX}.`}
                    helperText={retryAttemptsHelperText}
                    isChanged={retryAttemptsChanged}
                    isValid={isRetryAttemptsValid}
                    label={retryAttemptsFieldLabel}
                    max={RETRY_CONSTRAINTS.MAX}
                    min={RETRY_CONSTRAINTS.MIN}
                    onChange={handleRetryAttemptsChange}
                    onSave={onSaveRetryAttempts}
                    placeholder="Enter retry attempts"
                    saveIcon={saveIcon}
                    step={RETRY_CONSTRAINTS.STEP}
                    value={localRetryAttempts}
                />

                {localRetryAttempts > 0 ? (
                    <ThemedBox
                        className="site-settings-duration"
                        padding="md"
                        rounded="lg"
                        variant="tertiary"
                    >
                        <div className="site-settings-duration__body">
                            <span
                                aria-hidden="true"
                                className="site-settings-duration__icon"
                            >
                                <DurationIcon size={18} />
                            </span>
                            <div className="site-settings-duration__content">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ThemedText
                                        size="sm"
                                        variant="secondary"
                                        weight="medium"
                                    >
                                        Maximum check duration
                                    </ThemedText>
                                    <ThemedBadge
                                        className="shrink-0"
                                        size="sm"
                                        variant={maxDurationVariant}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <DurationIcon
                                                aria-hidden
                                                size={14}
                                            />
                                            ~ {maxDurationLabel}
                                        </span>
                                    </ThemedBadge>
                                </div>
                                <ThemedText
                                    className="site-settings-duration__meta"
                                    size="xs"
                                    variant="secondary"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        <DurationIcon aria-hidden size={14} />
                                        {formatSecondsWithMinutes(
                                            localTimeoutSeconds
                                        )}
                                    </span>
                                    <span> per attempt</span>
                                    <span className="mx-1">×</span>
                                    <span className="inline-flex items-center gap-1">
                                        <RetryIcon aria-hidden size={14} />
                                        {maxCheckDuration.totalAttempts}{" "}
                                        attempts
                                    </span>
                                    <span className="mx-1">+</span>
                                    <span className="inline-flex items-center gap-1">
                                        <LastCheckedIcon
                                            aria-hidden
                                            size={14}
                                        />
                                        {formatSecondsWithMinutes(
                                            maxCheckDuration.backoffSeconds
                                        )}{" "}
                                        backoff
                                    </span>
                                </ThemedText>
                                <div className="mt-2">
                                    <SiteSettingsHelpText icon={InfoIcon}>
                                        This estimate updates automatically
                                        based on Timeout and Retry attempts
                                        above.
                                    </SiteSettingsHelpText>
                                </div>
                            </div>
                        </div>
                    </ThemedBox>
                ) : null}
            </div>
        </ThemedCard>
    );
};

/**
 * Indicator summarizing realtime subscription health with retry controls.
 *
 * @packageDocumentation
 */

import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo, useState } from "react";

import type { StatusUpdateSubscriptionSummary } from "../../stores/sites/baseTypes";

import { deriveStatusSubscriptionHealth } from "../../hooks/useStatusSubscriptionHealth";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";
import { Tooltip } from "../common/Tooltip/Tooltip";

const RefreshIconComponent = AppIcons.actions.refresh;

/**
 * Formats the channel label based on the supplied count.
 *
 * @param count - Number of channels attached.
 *
 * @returns Singular or plural channel label.
 */
const formatChannelLabel = (count: number): string =>
    count === 1 ? "channel" : "channels";

/**
 * Builds a concise summary describing realtime channel attachment progress.
 *
 * @param summary - Latest realtime subscription summary from the sites store.
 *
 * @returns Human-readable sentence describing channel status.
 */
const formatListenerSummary = (
    summary: StatusUpdateSubscriptionSummary | undefined
): string => {
    if (!summary) {
        return "Connection pending";
    }

    const { expectedListeners, listenersAttached } = summary;
    if (expectedListeners === 0) {
        return "Realtime channels disabled";
    }

    if (listenersAttached >= expectedListeners) {
        const noun = expectedListeners === 1 ? "channel" : "channels";
        return `${expectedListeners} ${noun} active`;
    }

    const noun = expectedListeners === 1 ? "channel" : "channels";
    return `${listenersAttached}/${expectedListeners} ${noun} attached`;
};

/**
 * Creates a detailed progress message for tooltip descriptions.
 *
 * @param summary - Latest realtime subscription summary from the sites store.
 *
 * @returns Detailed explanation of current channel attachment progress.
 */
const formatListenerDetail = (
    summary: StatusUpdateSubscriptionSummary | undefined
): string => {
    if (!summary) {
        return "Awaiting the initial realtime channel attachment.";
    }

    const { expectedListeners, listenersAttached } = summary;
    if (expectedListeners === 0) {
        return "No realtime channels are required in this environment.";
    }

    if (listenersAttached >= expectedListeners) {
        const noun = expectedListeners === 1 ? "channel" : "channels";
        return `All ${expectedListeners} ${noun} are currently attached.`;
    }

    const noun = expectedListeners === 1 ? "channel" : "channels";
    const attachedNoun = listenersAttached === 1 ? "channel" : "channels";
    return `${listenersAttached} ${attachedNoun} attached out of ${expectedListeners} ${noun}.`;
};

/**
 * Formats tooltip copy describing the latest retry attempt outcome.
 *
 * @param attempt - Most recent retry attempt summary.
 *
 * @returns Description of the retry attempt when available.
 */
const formatRetryAttemptSummary = (
    attempt: null | StatusUpdateSubscriptionSummary
): string | undefined =>
    attempt
        ? `Last retry attached ${attempt.listenersAttached}/${attempt.expectedListeners} ${formatChannelLabel(attempt.expectedListeners)}.`
        : undefined;

/**
 * Renders realtime subscription health summary with retry controls.
 *
 * @returns JSX element containing status visuals and retry actions.
 */
export const StatusSubscriptionIndicator = (): JSX.Element => {
    const { retryStatusSubscription, statusSubscriptionSummary: summary } =
        useSitesStore();

    const [isRetrying, setIsRetrying] = useState(false);
    const [lastAttempt, setLastAttempt] =
        useState<null | StatusUpdateSubscriptionSummary>(null);

    const health = useMemo(
        () => deriveStatusSubscriptionHealth(summary),
        [summary]
    );

    const triggerClassName = useMemo(
        () =>
            [
                "status-subscription-indicator",
                `status-subscription-indicator--${health.status}`,
                health.needsAttention
                    ? "status-subscription-indicator--requires-action"
                    : undefined,
            ]
                .filter(Boolean)
                .join(" "),
        [health.needsAttention, health.status]
    );

    const dotClassName = useMemo(
        () =>
            [
                "status-subscription-indicator__dot",
                `status-subscription-indicator__dot--${health.status}`,
            ].join(" "),
        [health.status]
    );

    const listenerSummary = useMemo(
        () => formatListenerSummary(summary),
        [summary]
    );

    const listenerDetail = useMemo(
        () => formatListenerDetail(summary),
        [summary]
    );

    const retryAttemptSummary = formatRetryAttemptSummary(lastAttempt);

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        void (async (): Promise<void> => {
            try {
                const result = await retryStatusSubscription();
                setLastAttempt(result);
            } finally {
                setIsRetrying(false);
            }
        })();
    }, [retryStatusSubscription]);

    const tooltipContent = useMemo(
        () => (
            <div className="status-subscription-indicator__tooltip">
                <div className="status-subscription-indicator__tooltip-header">
                    <span
                        aria-hidden="true"
                        className={`status-subscription-indicator__tooltip-dot status-subscription-indicator__tooltip-dot--${health.status}`}
                    />
                    <ThemedText size="sm" weight="semibold">
                        {health.label}
                    </ThemedText>
                </div>
                <p className="status-subscription-indicator__tooltip-description">
                    {health.description}
                </p>
                <p className="status-subscription-indicator__tooltip-progress">
                    {listenerDetail}
                </p>
                <p className="status-subscription-indicator__tooltip-summary">
                    {listenerSummary}
                </p>
                <p className="status-subscription-indicator__tooltip-context">
                    Realtime channels stream site, monitor, and history events
                    from the background engine. Their count is independent of
                    how many monitors are enabled.
                </p>
                {health.errors.length > 0 ? (
                    <ul className="status-subscription-indicator__tooltip-errors">
                        {health.errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                ) : null}
                {retryAttemptSummary ? (
                    <p className="status-subscription-indicator__tooltip-attempt">
                        {retryAttemptSummary}
                    </p>
                ) : null}
                {health.needsAttention ? (
                    <ThemedButton
                        aria-label="Retry realtime listeners"
                        className="status-subscription-indicator__tooltip-retry"
                        loading={isRetrying}
                        onClick={handleRetry}
                        size="xs"
                        variant="ghost"
                    >
                        <RefreshIconComponent size={14} />
                        <span>Retry</span>
                    </ThemedButton>
                ) : null}
            </div>
        ),
        [
            handleRetry,
            health.description,
            health.errors,
            health.label,
            health.needsAttention,
            health.status,
            isRetrying,
            listenerDetail,
            listenerSummary,
            retryAttemptSummary,
        ]
    );

    return (
        <Tooltip content={tooltipContent} position="bottom">
            {(triggerProps) => (
                <button
                    {...triggerProps}
                    aria-label={`Realtime updates: ${health.label}. ${listenerSummary}.`}
                    className={triggerClassName}
                    type="button"
                >
                    <span aria-hidden="true" className={dotClassName} />
                </button>
            )}
        </Tooltip>
    );
};

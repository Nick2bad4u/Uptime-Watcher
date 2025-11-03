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
import {
    formatListenerDetail,
    formatListenerSummary,
    formatRetryAttemptSummary,
} from "./StatusSubscriptionIndicator.utils";

const RefreshIconComponent = AppIcons.actions.refresh;

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

    const listenerStates = useMemo(
        () => summary?.listenerStates ?? [],
        [summary]
    );

    const shouldShowRetryAction = health.needsAttention;

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
                {listenerStates.length > 0 ? (
                    <div className="status-subscription-indicator__tooltip-listeners">
                        <ThemedText
                            className="status-subscription-indicator__tooltip-listeners-title"
                            size="xs"
                            weight="semibold"
                        >
                            Listener Channels
                        </ThemedText>
                        <ul className="status-subscription-indicator__tooltip-list">
                            {listenerStates.map((state) => (
                                <li
                                    className={`status-subscription-indicator__tooltip-list-item status-subscription-indicator__tooltip-list-item--${state.attached ? "attached" : "detached"}`}
                                    key={state.name}
                                >
                                    <span>{state.name}</span>
                                    <span>
                                        {state.attached
                                            ? "attached"
                                            : "not attached"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
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
                {shouldShowRetryAction ? (
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
            health.status,
            isRetrying,
            listenerDetail,
            listenerStates,
            listenerSummary,
            retryAttemptSummary,
            shouldShowRetryAction,
        ]
    );

    return (
        <div className="status-subscription-indicator__container">
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
            {shouldShowRetryAction ? (
                <ThemedButton
                    aria-label="Retry realtime listeners"
                    className="status-subscription-indicator__retry"
                    disabled={isRetrying}
                    loading={isRetrying}
                    onClick={handleRetry}
                    size="sm"
                    type="button"
                    variant="ghost"
                >
                    <RefreshIconComponent size={14} />
                    <span>Retry</span>
                </ThemedButton>
            ) : null}
        </div>
    );
};

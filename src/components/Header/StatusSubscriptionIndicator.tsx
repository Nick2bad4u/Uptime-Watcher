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
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";
import { Tooltip } from "../common/Tooltip/Tooltip";

const statusIconMap: Record<
    "degraded" | "failed" | "healthy" | "unknown",
    typeof AppIcons.status.up
> = {
    degraded: AppIcons.status.warning,
    failed: AppIcons.status.down,
    healthy: AppIcons.status.up,
    unknown: AppIcons.ui.info,
};

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
        () =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Zustand store typing ensures summary shape matches helper contract
            deriveStatusSubscriptionHealth(summary),
        [summary]
    );

    const Icon = statusIconMap[health.status];

    const tooltipContent = useMemo(
        () => (
            <div className="status-subscription-indicator__tooltip">
                <p className="status-subscription-indicator__tooltip-description">
                    {health.description}
                </p>
                <p className="status-subscription-indicator__tooltip-progress">
                    Listeners: {health.listenersProgress}
                </p>
                {health.errors.length > 0 ? (
                    <ul className="status-subscription-indicator__tooltip-errors">
                        {health.errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                ) : null}
                {lastAttempt ? (
                    <p className="status-subscription-indicator__tooltip-attempt">
                        Last retry: {lastAttempt.listenersAttached}/
                        {lastAttempt.expectedListeners} listeners
                    </p>
                ) : null}
            </div>
        ),
        [
            health.description,
            health.errors,
            health.listenersProgress,
            lastAttempt,
        ]
    );

    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        void (async (): Promise<void> => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- Zustand action typing guarantees promise result shape
                const result = await retryStatusSubscription();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Store action contract guarantees summary result typing
                setLastAttempt(result);
            } finally {
                setIsRetrying(false);
            }
        })();
    }, [retryStatusSubscription]);

    return (
        <ThemedBox
            className={`status-subscription-indicator status-subscription-indicator--${health.status}`}
            padding="md"
            rounded="lg"
            shadow="sm"
            surface="elevated"
        >
            <div className="status-subscription-indicator__body">
                <Tooltip content={tooltipContent} position="bottom">
                    {(triggerProps) => (
                        <button
                            {...triggerProps}
                            aria-label="Realtime subscription details"
                            className="status-subscription-indicator__icon"
                            type="button"
                        >
                            <Icon size={18} />
                        </button>
                    )}
                </Tooltip>
                <div className="status-subscription-indicator__meta">
                    <ThemedText size="sm" weight="semibold">
                        Realtime Updates
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                        {health.label}
                    </ThemedText>
                    <ThemedText size="xs" variant="tertiary">
                        {health.listenersProgress}
                    </ThemedText>
                </div>
            </div>
            <ThemedButton
                className="status-subscription-indicator__retry"
                loading={isRetrying}
                onClick={handleRetry}
                size="sm"
                variant="ghost"
            >
                Retry
            </ThemedButton>
        </ThemedBox>
    );
};

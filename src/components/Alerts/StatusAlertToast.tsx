/**
 * Individual alert toast component rendered within the alert toaster.
 */

import type { JSX } from "react";

import {
    type MonitorStatus,
    type SiteStatus,
    STATUS_KIND,
} from "@shared/types";
import { useCallback, useEffect, useMemo } from "react";

import type { StatusAlert } from "../../stores/alerts/useAlertStore";

import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { AppIcons } from "../../utils/icons";
import { formatStatusLabel } from "../../utils/status";

const AUTO_DISMISS_DURATION_MS = 12_000;

const STATUS_TONE: Record<
    MonitorStatus,
    "info" | "negative" | "positive" | "warning"
> = {
    degraded: "warning",
    down: "negative",
    paused: "info",
    pending: "info",
    up: "positive",
};

const STATUS_HEADLINE: Record<MonitorStatus, string> = {
    degraded: "Monitor performance degraded",
    down: "Monitor is down",
    paused: "Monitoring paused",
    pending: "Monitoring pending",
    up: "Monitor recovered",
};

const CloseIcon = AppIcons.ui.close;

/**
 * Properties for the {@link StatusAlertToast} component.
 */
export interface StatusAlertToastProperties {
    readonly alert: StatusAlert;
    readonly onDismiss: (id: string) => void;
}

export const StatusAlertToast = ({
    alert,
    onDismiss,
}: StatusAlertToastProperties): JSX.Element => {
    useEffect(
        function autoDismissAlert(): () => void {
            const timeout = window.setTimeout(() => {
                onDismiss(alert.id);
            }, AUTO_DISMISS_DURATION_MS);

            return function cleanupAutoDismiss(): void {
                window.clearTimeout(timeout);
            };
        },
        [alert.id, onDismiss]
    );

    const candidateStatus = alert.status;
    const resolvedStatus: MonitorStatus =
        typeof candidateStatus === "string" && candidateStatus.length > 0
            ? candidateStatus
            : STATUS_KIND.PENDING;
    const tone = Object.hasOwn(STATUS_TONE, resolvedStatus)
        ? STATUS_TONE[resolvedStatus]
        : STATUS_TONE.pending;
    const headline = Object.hasOwn(STATUS_HEADLINE, resolvedStatus)
        ? STATUS_HEADLINE[resolvedStatus]
        : STATUS_HEADLINE.pending;

    const { timestampDateTime, timestampLabel } = useMemo(() => {
        const date = new Date(alert.timestamp);

        if (Number.isNaN(date.getTime())) {
            const now = new Date();
            return {
                timestampDateTime: now.toISOString(),
                timestampLabel: "Just now",
            } as const;
        }

        const localizedLabel = new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);

        return {
            timestampDateTime: date.toISOString(),
            timestampLabel: localizedLabel,
        } as const;
    }, [alert.timestamp]);

    const previousLabel =
        typeof alert.previousStatus === "string" &&
        alert.previousStatus.length > 0
            ? formatStatusLabel(alert.previousStatus)
            : "Unknown";
    const currentLabel = formatStatusLabel(resolvedStatus);

    const handleDismiss = useCallback((): void => {
        onDismiss(alert.id);
    }, [alert.id, onDismiss]);

    return (
        <button
            aria-label={`${currentLabel} for ${alert.monitorName}`}
            className={`status-alert status-alert--tone-${tone}`}
            data-alert-id={alert.id}
            data-testid={`status-alert-${alert.id}`}
            onClick={handleDismiss}
            type="button"
        >
            <div className="status-alert__indicator">
                <StatusIndicator
                    size="sm"
                    status={resolvedStatus as SiteStatus}
                />
            </div>
            <div className="status-alert__content">
                <header className="status-alert__header">
                    <span className="status-alert__title">{headline}</span>
                    <time
                        aria-hidden="true"
                        className="status-alert__timestamp"
                        dateTime={timestampDateTime}
                    >
                        {timestampLabel}
                    </time>
                </header>
                <p className="status-alert__message">
                    <strong>{alert.monitorName}</strong>
                    <span className="status-alert__separator">at</span>
                    <strong>{alert.siteName}</strong> is now {currentLabel}
                    {alert.previousStatus
                        ? ` (previously ${previousLabel})`
                        : ""}
                    .
                </p>
                <footer className="status-alert__meta">
                    <span>Monitor ID: {alert.monitorId}</span>
                    <span>Site: {alert.siteIdentifier}</span>
                </footer>
            </div>
            <span aria-hidden="true" className="status-alert__dismissIcon">
                <CloseIcon aria-hidden="true" size={16} />
            </span>
        </button>
    );
};

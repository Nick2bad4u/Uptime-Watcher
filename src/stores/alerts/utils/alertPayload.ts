/**
 * Helpers for converting status updates into alert payloads.
 */

import {
    isMonitorStatus,
    type Monitor,
    type StatusUpdate,
} from "@shared/types";

import { isRecord } from "@shared/utils/typeHelpers";
import { safeParseIsoTimestamp } from "@shared/validation/statusUpdateSchemas";

import type { StatusAlertInput } from "../useAlertStore";

import { buildMonitorDisplayInfo } from "../../../utils/monitoring/monitorDisplayInfo";

/**
 * Derives a human-friendly site name for alert payloads.
 */
function deriveSiteName(update: StatusUpdate): string {
    const siteCandidate: unknown = update.site;
    let siteName: null | string = null;

    if (isRecord(siteCandidate)) {
        const nameValue = siteCandidate["name"];
        if (typeof nameValue === "string") {
            const trimmedName = nameValue.trim();
            siteName = trimmedName.length > 0 ? trimmedName : null;
        }
    }

    if (siteName) {
        return siteName;
    }

    let fallbackIdentifier = "";
    if (isRecord(siteCandidate)) {
        const identifierValue = siteCandidate["identifier"];
        if (typeof identifierValue === "string") {
            const trimmedIdentifier = identifierValue.trim();
            fallbackIdentifier =
                trimmedIdentifier.length > 0 ? trimmedIdentifier : "";
        }
    }

    if (fallbackIdentifier.length > 0) {
        return fallbackIdentifier;
    }

    const eventIdentifier = update.siteIdentifier.trim();
    return eventIdentifier.length > 0 ? eventIdentifier : "unknown-site";
}

/**
 * Derives the monitor name used in alert payloads.
 */
function deriveMonitorName(
    monitor: Monitor | undefined,
    fallbackId: string
): string {
    if (!monitor) {
        return fallbackId;
    }

    const monitorRecord: unknown = monitor;
    if (isRecord(monitorRecord) && typeof monitorRecord["name"] === "string") {
        const name = monitorRecord["name"].trim();
        if (name.length > 0) {
            return name;
        }
    }

    const { connectionInfo, monitorTypeLabel } = buildMonitorDisplayInfo({
        fallbackIdentifier: fallbackId,
        monitor,
    });

    if (connectionInfo.length > 0) {
        return `${monitorTypeLabel}: ${connectionInfo}`;
    }

    return monitorTypeLabel;
}

/**
 * Converts an ISO timestamp string into an epoch value with fallback.
 */
function deriveAlertTimestamp(timestamp: string): number {
    const result = safeParseIsoTimestamp(timestamp);
    if (!result.success) {
        return Date.now();
    }

    const parsed = Date.parse(result.data);
    return Number.isFinite(parsed) ? parsed : Date.now();
}

/**
 * Converts a {@link StatusUpdate} into a {@link StatusAlertInput}.
 */
export function mapStatusUpdateToAlert(update: StatusUpdate): StatusAlertInput {
    const siteName = deriveSiteName(update);
    const monitorName = deriveMonitorName(update.monitor, update.monitorId);
    const timestamp = deriveAlertTimestamp(update.timestamp);

    return {
        monitorId: update.monitorId,
        monitorName,
        siteIdentifier: update.siteIdentifier,
        siteName,
        status: update.status,
        timestamp,
        ...(typeof update.previousStatus === "string" &&
            isMonitorStatus(update.previousStatus) && {
                previousStatus: update.previousStatus,
            }),
    } satisfies StatusAlertInput;
}

/**
 * Helpers for converting status updates into alert payloads.
 */

import type { Monitor, StatusUpdate } from "@shared/types";

import { isRecord } from "@shared/utils/typeHelpers";

import type { StatusAlertInput } from "../useAlertStore";

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

    if (isRecord(monitorRecord)) {
        const monitorType = monitorRecord["type"];
        if (typeof monitorType === "string" && monitorType.length > 0) {
            return monitorType;
        }
    }

    return fallbackId;
}

/**
 * Converts an ISO timestamp string into an epoch value with fallback.
 */
function deriveAlertTimestamp(timestamp: string): number {
    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Converts a {@link StatusUpdate} into a {@link StatusAlertInput}.
 */
export function mapStatusUpdateToAlert(
    update: StatusUpdate
): StatusAlertInput {
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
        ...(update.previousStatus
            ? { previousStatus: update.previousStatus }
            : {}),
    } satisfies StatusAlertInput;
}

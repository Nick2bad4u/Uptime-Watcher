/**
 * App-level diagnostics helpers.
 *
 * @remarks
 * These helpers are used by `App.tsx` to keep subscription/debug logic testable
 * and to reduce noise in the root component.
 */

import type { StatusUpdate } from "@shared/types";

import { isDevelopment } from "@shared/utils/environment";
import { isRecord } from "@shared/utils/typeHelpers";

import type { StatusUpdateSubscriptionSummary } from "../stores/sites/baseTypes";

import { logger } from "../services/logger";

/**
 * Log a warning only in development builds.
 */
export function warnMissingImplementation(message: string): void {
    if (isDevelopment()) {
        logger.warn(message);
    }
}

/**
 * Resolve the site identifier for a status-update payload.
 */
export function resolveStatusUpdateSiteIdentifier(
    update: StatusUpdate
): string {
    const siteCandidate = isRecord(update) ? update.site : undefined;
    let siteIdentifierFromSite = "";

    if (isRecord(siteCandidate)) {
        const identifierCandidate = siteCandidate.identifier;
        if (typeof identifierCandidate === "string") {
            const trimmedIdentifier = identifierCandidate.trim();
            if (trimmedIdentifier.length > 0) {
                siteIdentifierFromSite = trimmedIdentifier;
            }
        }
    }

    if (siteIdentifierFromSite.length > 0) {
        return siteIdentifierFromSite;
    }

    const siteIdentifierCandidate = update.siteIdentifier;
    if (typeof siteIdentifierCandidate === "string") {
        const siteIdentifierFromEvent = siteIdentifierCandidate.trim();
        if (siteIdentifierFromEvent.length > 0) {
            return siteIdentifierFromEvent;
        }
    }

    return "unknown-site";
}

/**
 * Emit a debug log for a status update (dev-only).
 */
export function logStatusUpdateDebugInfo(update: StatusUpdate): void {
    if (!isDevelopment()) {
        return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const resolvedIdentifier = resolveStatusUpdateSiteIdentifier(update);

    logger.debug(
        `[${timestamp}] Status update received for site: ${resolvedIdentifier}`
    );
}

/**
 * Report diagnostics returned by the status update subscription.
 */
export function reportSubscriptionDiagnostics(
    summary: StatusUpdateSubscriptionSummary | undefined
): void {
    if (!summary) {
        logger.warn("Status update subscription resolved without diagnostics");
        return;
    }

    if (summary.success) {
        return;
    }

    logger.warn("Status update subscription encountered issues", {
        errors: summary.errors,
        listenersAttached: summary.listenersAttached,
    });
}

/**
 * Site status utilities wrapper module.
 *
 * @remarks
 * Provides frontend access to site status utilities from the shared module.
 * This module wraps the shared utilities to comply with ESLint rules while
 * maintaining a clean import interface for frontend components.
 *
 * @packageDocumentation
 */

import type { SiteForStatus, SiteStatus } from "@shared/types";

import * as siteStatusUtils from "@shared/utils/siteStatus";

/**
 * Calculates the overall monitoring state for a site based on its monitors.
 *
 * @param site - The site to evaluate.
 *
 * @returns The monitoring state: "running", "stopped", or "partial".
 */
export function calculateSiteMonitoringStatus(
    site: SiteForStatus
): "partial" | "running" | "stopped" {
    return siteStatusUtils.calculateSiteMonitoringStatus(site);
}

/**
 * Calculates the overall operational status for a site based on its monitors.
 *
 * @param site - The site to evaluate.
 *
 * @returns The site status.
 */
export function calculateSiteStatus(site: SiteForStatus): SiteStatus {
    return siteStatusUtils.calculateSiteStatus(site);
}

/**
 * Gets the display status for a site, considering both operational and
 * monitoring states.
 *
 * @param site - The site to evaluate.
 *
 * @returns The display status.
 */
export function getSiteDisplayStatus(site: SiteForStatus): SiteStatus {
    return siteStatusUtils.getSiteDisplayStatus(site);
}

/**
 * Gets a human-readable description for a site's status.
 *
 * @param site - The site to evaluate.
 *
 * @returns A description of the site's status.
 */
export function getSiteStatusDescription(site: SiteForStatus): string {
    return siteStatusUtils.getSiteStatusDescription(site);
}

/**
 * Gets the UI variant for a site's status (for styling purposes).
 *
 * @param status - The site status.
 *
 * @returns The variant string for UI styling.
 */
export function getSiteStatusVariant(
    status: SiteStatus
): "error" | "info" | "success" | "warning" {
    return siteStatusUtils.getSiteStatusVariant(status);
}

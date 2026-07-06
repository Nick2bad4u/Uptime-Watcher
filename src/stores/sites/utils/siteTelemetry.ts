/**
 * Safe telemetry builders for site store actions.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import { getSafeUrlForLogging } from "@shared/utils/urlSafety";
import { isDefined } from "ts-extras";

import type { SitesTelemetryPayload } from "./operationHelpers";

export const safeTextForTelemetry = (
    value: string | undefined
): string | undefined => getSafeIdentifierForLogging(value);

export const safeMonitorUrlForTelemetry = (
    url: Monitor["url"] | undefined
): string | undefined => {
    const trimmedUrl = url?.trim();
    return trimmedUrl ? getSafeUrlForLogging(trimmedUrl) : undefined;
};

export const buildMonitorTelemetry = (
    monitor: Partial<Monitor>
): SitesTelemetryPayload => ({
    ...(isDefined(monitor.id) && { monitorId: monitor.id }),
    ...(isDefined(monitor.type) && { monitorType: monitor.type }),
    ...(isDefined(monitor.url) && {
        monitorUrl: safeMonitorUrlForTelemetry(monitor.url),
    }),
});

export const buildMonitorListTelemetry = (
    monitors: readonly Partial<Monitor>[] | undefined
): SitesTelemetryPayload => {
    if (!monitors) {
        return {};
    }

    const monitorUrls = monitors
        .map((monitor) => safeMonitorUrlForTelemetry(monitor.url))
        .filter(isDefined);
    const monitorTypes = monitors
        .map((monitor) => monitor.type)
        .filter(isDefined);

    return {
        monitorCount: monitors.length,
        ...(monitorTypes.length > 0 && { monitorTypes }),
        ...(monitorUrls.length > 0 && { monitorUrls }),
    };
};

export const buildSiteTelemetry = (
    siteData: Partial<Site>
): SitesTelemetryPayload => ({
    ...(isDefined(siteData.identifier) && {
        siteIdentifier: safeTextForTelemetry(siteData.identifier),
    }),
    ...(isDefined(siteData.monitoring) && { monitoring: siteData.monitoring }),
    ...buildMonitorListTelemetry(siteData.monitors),
});

export const buildSiteSelectionTelemetry = (
    site: Site | undefined
): SitesTelemetryPayload => ({
    selected: isDefined(site),
    ...(isDefined(site) && buildSiteTelemetry(site)),
});

export const buildSiteUpdateTelemetry = (
    identifier: string,
    updates: Partial<Site>
): SitesTelemetryPayload => ({
    siteIdentifier: safeTextForTelemetry(identifier),
    updateFields: Object.keys(updates).toSorted((left, right) =>
        left.localeCompare(right)
    ),
    ...(isDefined(updates.monitoring) && { monitoring: updates.monitoring }),
    ...buildMonitorListTelemetry(updates.monitors),
});

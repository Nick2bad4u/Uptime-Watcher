import type { Monitor, Site, StatusUpdate } from "@shared/types";

import {
    STATE_SYNC_ACTION,
    STATE_SYNC_SOURCE,
    type StateSyncAction,
    type StateSyncSource,
} from "@shared/types/stateSync";
import {
    isMonitorSnapshot,
    isSiteSnapshot,
    mergeMonitorSnapshots,
} from "@shared/utils/siteSnapshots";
import { isObject } from "@shared/utils/typeGuards";

import type { UptimeEvents } from "../events/eventTypes";
import type { EventKey } from "../events/TypedEventBus";
import type { MonitorManager } from "../managers/MonitorManager";
import type { SiteManager } from "../managers/SiteManager";
import type { UpdateSitesCacheRequestData } from "../UptimeOrchestrator.types";

import { attachForwardedMetadata } from "../utils/eventMetadataForwarding";
import { logger } from "../utils/logger";

type ManualCheckCompletedPayload = UptimeEvents["monitor:check-completed"];

type EmitTyped = <TEventName extends EventKey<UptimeEvents>>(
    eventName: TEventName,
    payload: UptimeEvents[TEventName]
) => Promise<void>;

/**
 * Dependencies required to synchronize cache and state snapshots.
 */
export interface SnapshotSyncCoordinatorDependencies {
    readonly busId: string;
    readonly emitTyped: EmitTyped;
    readonly monitorManager: MonitorManager;
    readonly siteManager: SiteManager;
}

/**
 * Coordinates snapshot/state synchronization and cache-related flows.
 *
 * @remarks
 * Extracts state-sync and cache orchestration logic from
 * {@link UptimeOrchestrator} while preserving existing runtime behaviour and
 * typed event contracts.
 */
export class SnapshotSyncCoordinator {
    private readonly siteManager: SiteManager;

    private readonly monitorManager: MonitorManager;

    private readonly emitTyped: EmitTyped;

    private readonly busId: string;

    private static extractMonitorSnapshotFromResult(
        result: StatusUpdate | undefined
    ): Monitor | undefined {
        if (!result) {
            return undefined;
        }

        const resultCandidate: unknown = result;
        if (!isObject(resultCandidate)) {
            return undefined;
        }

        const { monitor } = resultCandidate as Partial<StatusUpdate> & {
            monitor?: unknown;
        };
        return isMonitorSnapshot(monitor) ? monitor : undefined;
    }

    private static extractSiteSnapshotFromResult(
        result: StatusUpdate | undefined
    ): Site | undefined {
        if (!result) {
            return undefined;
        }

        const resultCandidate: unknown = result;
        if (!isObject(resultCandidate)) {
            return undefined;
        }

        const { site } = resultCandidate as Partial<StatusUpdate> & {
            site?: unknown;
        };
        return isSiteSnapshot(site) ? site : undefined;
    }

    /**
     * Emits a sanitized site state synchronization event via
     * {@link SiteManager}.
     */
    public async emitSitesStateSynchronized(payload: {
        action: StateSyncAction;
        siteIdentifier: string;
        sites?: Site[];
        source: StateSyncSource;
        timestamp?: number;
    }): Promise<Site[]> {
        return this.siteManager.emitSitesStateSynchronized(payload);
    }

    /**
     * Handles the update sites cache request asynchronously.
     *
     * @remarks
     * Extracted from {@link UptimeOrchestrator} without behavioural changes.
     */
    private async handleUpdateSitesCacheRequest(
        data: UpdateSitesCacheRequestData
    ): Promise<void> {
        const timestamp = Date.now();

        await this.siteManager.updateSitesCache(
            data.sites,
            "UptimeOrchestrator.handleUpdateSitesCacheRequest",
            {
                action: STATE_SYNC_ACTION.BULK_SYNC,
                emitSyncEvent: true,
                siteIdentifier: "all",
                sites: data.sites,
                source: STATE_SYNC_SOURCE.CACHE,
                timestamp,
            }
        );

        // CRITICAL: Set up monitoring for each loaded site
        const setupResults = await Promise.allSettled(
            data.sites.map(async (site) => {
                try {
                    await this.monitorManager.setupSiteForMonitoring(site);
                    return { site: site.identifier, success: true } as const;
                } catch (error) {
                    logger.error(
                        `[UptimeOrchestrator] Failed to setup monitoring for site ${site.identifier}:`,
                        error
                    );
                    return {
                        error,
                        site: site.identifier,
                        success: false,
                    } as const;
                }
            })
        );

        // Validate that critical sites were set up successfully
        const successful = setupResults.filter(
            (result) => result.status === "fulfilled" && result.value.success
        ).length;
        const failed = setupResults.length - successful;

        if (failed > 0) {
            const criticalFailures = setupResults.filter(
                (result) =>
                    result.status === "rejected" || !result.value.success
            ).length;

            if (criticalFailures > 0) {
                const errorMessage = `Critical monitoring setup failures: ${criticalFailures} of ${data.sites.length} sites failed`;
                logger.error(`[UptimeOrchestrator] ${errorMessage}`);
                // For critical operations, we might want to emit an error event
                await this.emitTyped("system:error", {
                    context: "site-monitoring-setup",
                    error: new Error(errorMessage),
                    recovery:
                        "Check site configurations and restart monitoring",
                    severity: "high",
                    timestamp: Date.now(),
                });
            } else {
                logger.warn(
                    `[UptimeOrchestrator] Site monitoring setup completed: ${successful} successful, ${failed} failed`
                );
            }
        } else {
            logger.info(
                `[UptimeOrchestrator] Successfully set up monitoring for all ${successful} loaded sites`
            );
        }
    }

    /** Handles the get sites from cache request asynchronously. */
    private async handleGetSitesFromCacheRequest(): Promise<void> {
        const sites = this.siteManager.getSitesFromCache();
        await this.emitTyped(
            "internal:database:get-sites-from-cache-response",
            {
                operation: "get-sites-from-cache-response",
                sites,
                timestamp: Date.now(),
            }
        );
    }

    public constructor(dependencies: SnapshotSyncCoordinatorDependencies) {
        this.siteManager = dependencies.siteManager;
        this.monitorManager = dependencies.monitorManager;
        this.emitTyped = dependencies.emitTyped;
        this.busId = dependencies.busId;
    }

    /** Event handler for manual monitor check completion events. */
    public handleManualCheckCompletedEvent(
        eventData: UptimeEvents["internal:monitor:manual-check-completed"] & {
            _meta?: unknown;
        }
    ): void {
        void (async (): Promise<void> => {
            try {
                const {
                    identifier,
                    monitorId: manualMonitorId,
                    result,
                    timestamp,
                } = eventData;
                const monitorId = manualMonitorId ?? result.monitorId;
                const { siteIdentifier } = result;

                if (!monitorId) {
                    logger.warn(
                        "[UptimeOrchestrator] Manual check completed without monitor identifier",
                        { eventIdentifier: identifier }
                    );
                    return;
                }

                if (!siteIdentifier) {
                    logger.warn(
                        "[UptimeOrchestrator] Manual check completed without site identifier",
                        { monitorId }
                    );
                    return;
                }

                const monitorFromPayload =
                    SnapshotSyncCoordinator.extractMonitorSnapshotFromResult(
                        result
                    );
                const siteFromPayload =
                    SnapshotSyncCoordinator.extractSiteSnapshotFromResult(
                        result
                    );

                // SiteManager cache should normally hold fully-hydrated
                // snapshots, but unit tests may supply minimal shapes. Treat
                // cache data as best-effort enrichment rather than rejecting
                // it outright.
                const siteFromCache =
                    this.siteManager.getSiteFromCache(siteIdentifier);

                if (!siteFromCache) {
                    logger.warn(
                        "[UptimeOrchestrator] Manual check completion received but site missing from cache",
                        { monitorId, siteIdentifier }
                    );
                }

                const monitorFromCache = siteFromCache?.monitors.find(
                    (candidate) => candidate.id === monitorId
                );

                if (siteFromCache && !monitorFromCache) {
                    logger.warn(
                        "[UptimeOrchestrator] Manual check completion had no monitor snapshot in cache; using payload context",
                        { monitorId, siteIdentifier }
                    );
                }

                // When the manual-check completion payload already includes a
                // validated monitor+site snapshot, do not mutate it. Unit
                // tests (and upstream contracts) expect the forwarded
                // `StatusUpdate` to preserve the original snapshots.
                const hasPayloadSnapshots = Boolean(
                    monitorFromPayload && siteFromPayload
                );

                // Default to the original result (no mutation). Only override
                // when payload snapshots are missing and we need to enrich from
                // the cache.
                let enrichedResult: StatusUpdate = result;

                if (!hasPayloadSnapshots) {
                    const fallbackSite = siteFromPayload ?? siteFromCache;
                    const fallbackMonitor =
                        monitorFromPayload ?? monitorFromCache;

                    if (!fallbackMonitor) {
                        logger.warn(
                            "[UptimeOrchestrator] Manual check completion missing monitor context after validation",
                            { monitorId, siteIdentifier }
                        );

                        return;
                    }

                    if (!fallbackSite) {
                        logger.warn(
                            "[UptimeOrchestrator] Manual check completion missing site context after validation",
                            { monitorId, siteIdentifier }
                        );

                        return;
                    }

                    // If we're falling back to the cached snapshots but we do
                    // have a validated monitor snapshot from the payload,
                    // layer the payload monitor onto the cached monitor so the
                    // emitted payload reflects the freshest status details.
                    const effectiveMonitor =
                        monitorFromPayload &&
                        monitorFromCache &&
                        isMonitorSnapshot(monitorFromCache)
                            ? mergeMonitorSnapshots(
                                  monitorFromCache,
                                  monitorFromPayload
                              )
                            : fallbackMonitor;

                    const effectiveSite =
                        monitorFromPayload && fallbackSite === siteFromCache
                            ? {
                                  ...fallbackSite,
                                  monitors: fallbackSite.monitors.map(
                                      (candidate) => {
                                          if (candidate.id !== monitorId) {
                                              return candidate;
                                          }

                                          return isMonitorSnapshot(candidate)
                                              ? mergeMonitorSnapshots(
                                                    candidate,
                                                    monitorFromPayload
                                                )
                                              : candidate;
                                      }
                                  ),
                              }
                            : fallbackSite;

                    enrichedResult = {
                        ...result,
                        monitor: effectiveMonitor,
                        site: effectiveSite,
                    };
                }

                const payload: ManualCheckCompletedPayload = {
                    checkType: "manual",
                    monitorId,
                    result: enrichedResult,
                    siteIdentifier,
                    timestamp,
                };

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "monitor:check-completed",
                    payload,
                    source: eventData,
                });

                await this.emitTyped("monitor:check-completed", payload);
            } catch (error) {
                logger.error(
                    "[UptimeOrchestrator] Error handling internal:monitor:manual-check-completed:",
                    error
                );
            }
        })();
    }

    /** Event handler for sites cache update requests. */
    public handleUpdateSitesCacheRequestedEvent(
        data: UpdateSitesCacheRequestData
    ): void {
        void (async (): Promise<void> => {
            try {
                await this.handleUpdateSitesCacheRequest(data);
            } catch (error) {
                logger.error(
                    "[UptimeOrchestrator] Error handling update-sites-cache-requested:",
                    error
                );
            }
        })();
    }

    /** Event handler for retrieving sites from cache. */
    public handleGetSitesFromCacheRequestedEvent(): void {
        void (async (): Promise<void> => {
            try {
                await this.handleGetSitesFromCacheRequest();
            } catch (error) {
                logger.error(
                    "[UptimeOrchestrator] Error handling get-sites-from-cache-requested:",
                    error
                );
            }
        })();
    }
}

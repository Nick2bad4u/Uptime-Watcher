/**
 * Bridges internal manager events to renderer-facing events.
 *
 * @remarks
 * `UptimeOrchestrator` receives internal events (e.g. `internal:site:*`,
 * `internal:monitor:*`) from manager event buses and is responsible for
 * broadcasting the corresponding public events to renderer listeners.
 *
 * This coordinator extracts the relatively noisy forwarding logic (payload
 * shaping, metadata forwarding, edge-case logging) out of
 * `electron/UptimeOrchestrator.ts` so the orchestrator can stay focused on
 * lifecycle orchestration and high-level delegation.
 */

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
} from "@shared/types";

import { SITE_ADDED_SOURCE } from "@shared/types/events";

import type { TypedEventBus } from "../events/TypedEventBus";
import type { MonitorManager } from "../managers/MonitorManager";
import type { SiteManager } from "../managers/SiteManager";
import type {
    OrchestratorEvents,
    SiteEventData,
} from "../UptimeOrchestrator.types";

import { attachForwardedMetadata } from "../utils/eventMetadataForwarding";
import { fireAndForgetLogged } from "../utils/fireAndForget";
import { logger } from "../utils/logger";

/** Construction options for {@link OrchestratorEventForwardingCoordinator}. */
export interface OrchestratorEventForwardingCoordinatorOptions {
    /** Logical event bus identifier applied to forwarded renderer events. */
    busId: string;
    /** Event bus used to listen for internal events and emit public events. */
    eventBus: TypedEventBus<OrchestratorEvents>;
    /** Monitor manager used for active monitor counts in summary payloads. */
    monitorManager: MonitorManager;
    /** Site manager used for cache lookups needed in summary payloads. */
    siteManager: SiteManager;
}

type MonitoringOperationScope = "global" | "monitor" | "site";

const determineMonitoringScope = (
    identifier: string,
    monitorId?: string
): MonitoringOperationScope => {
    if (identifier === "all") {
        return "global";
    }

    if (typeof monitorId === "string" && monitorId.length > 0) {
        return "monitor";
    }

    return "site";
};

/**
 * Coordinator that registers listeners for internal events and forwards them to
 * renderer consumers.
 */
export class OrchestratorEventForwardingCoordinator {
    private readonly busId: string;

    private readonly eventBus: TypedEventBus<OrchestratorEvents>;

    private readonly monitorManager: MonitorManager;

    private readonly siteManager: SiteManager;

    private isRegistered = false;

    /**
     * Internal handler for site addition events.
     */
    private readonly handleSiteAddedEvent = (
        data: SiteEventData & { _meta?: unknown }
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[OrchestratorEventForwardingCoordinator] Error handling internal:site:added",
            task: async () => {
                if (!data.site) {
                    logger.error(
                        "[OrchestratorEventForwardingCoordinator] Received internal:site:added without site payload",
                        { identifier: data.identifier }
                    );
                    return;
                }

                const source = data.source ?? SITE_ADDED_SOURCE.USER;
                const payload = {
                    site: data.site,
                    source,
                    timestamp: data.timestamp,
                } satisfies OrchestratorEvents["site:added"];

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "site:added",
                    payload,
                    source: data,
                });

                await this.eventBus.emitTyped("site:added", payload);
            },
        });
    };

    /**
     * Internal handler for site removal events.
     */
    private readonly handleSiteRemovedEvent = (
        data: SiteEventData & { _meta?: unknown }
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[OrchestratorEventForwardingCoordinator] Error handling internal:site:removed",
            task: async () => {
                const siteIdentifier =
                    data.identifier ?? data.site?.identifier ?? "unknown-site";
                const siteName = data.site?.name ?? "Unknown";
                const cascade = data.cascade === true;

                if (!data.site) {
                    logger.warn(
                        "[OrchestratorEventForwardingCoordinator] internal:site:removed emitted without site snapshot; using fallback values",
                        { siteIdentifier }
                    );
                }

                const payload = {
                    cascade,
                    siteIdentifier,
                    siteName,
                    timestamp: data.timestamp,
                } satisfies OrchestratorEvents["site:removed"];

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "site:removed",
                    payload,
                    source: data,
                });

                await this.eventBus.emitTyped("site:removed", payload);
            },
        });
    };

    /**
     * Internal handler for site update events.
     */
    private readonly handleSiteUpdatedEvent = (
        data: SiteEventData & { _meta?: unknown; previousSite?: Site }
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[OrchestratorEventForwardingCoordinator] Error handling internal:site:updated",
            task: async () => {
                if (!data.site) {
                    logger.error(
                        "[OrchestratorEventForwardingCoordinator] Received internal:site:updated without site payload",
                        { identifier: data.identifier }
                    );
                    return;
                }

                const payload = {
                    previousSite: data.previousSite ?? data.site,
                    site: data.site,
                    timestamp: data.timestamp,
                    updatedFields: data.updatedFields ?? [],
                } satisfies OrchestratorEvents["site:updated"];

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "site:updated",
                    payload,
                    source: data,
                });

                await this.eventBus.emitTyped("site:updated", payload);
            },
        });
    };

    /**
     * Internal handler for monitor start lifecycle events.
     */
    private readonly handleMonitorStartedEvent = (
        eventData: OrchestratorEvents["internal:monitor:started"] & {
            _meta?: unknown;
        }
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[OrchestratorEventForwardingCoordinator] Error handling internal:monitor:started:",
            task: async () => {
                const { identifier, monitorId, summary } = eventData;
                const scope = determineMonitoringScope(identifier, monitorId);

                if (scope !== "global") {
                    logger.debug(
                        "[OrchestratorEventForwardingCoordinator] Skipping monitoring:started broadcast for scoped operation",
                        { identifier, monitorId, scope }
                    );
                    return;
                }

                const sites = this.siteManager.getSitesFromCache();

                const siteCount = summary?.siteCount ?? sites.length;
                const monitorCount =
                    summary?.succeeded ??
                    sites.reduce(
                        (total: number, site: Site) =>
                            total + site.monitors.length,
                        0
                    );

                const payloadBase = {
                    monitorCount,
                    siteCount,
                    timestamp: Date.now(),
                } satisfies OrchestratorEvents["monitoring:started"];

                const payload: OrchestratorEvents["monitoring:started"] =
                    summary
                        ? {
                              ...payloadBase,
                              summary: summary satisfies MonitoringStartSummary,
                          }
                        : payloadBase;

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "monitoring:started",
                    payload,
                    source: eventData,
                });

                await this.eventBus.emitTyped("monitoring:started", payload);
            },
        });
    };

    /**
     * Internal handler for monitor stop lifecycle events.
     */
    private readonly handleMonitorStoppedEvent = (
        eventData: OrchestratorEvents["internal:monitor:stopped"] & {
            _meta?: unknown;
        }
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[OrchestratorEventForwardingCoordinator] Error handling internal:monitor:stopped:",
            task: async () => {
                const { identifier, monitorId, reason, summary } = eventData;
                const scope = determineMonitoringScope(identifier, monitorId);

                if (scope !== "global") {
                    logger.debug(
                        "[OrchestratorEventForwardingCoordinator] Skipping monitoring:stopped broadcast for scoped operation",
                        { identifier, monitorId, scope }
                    );
                    return;
                }

                const activeMonitors =
                    this.monitorManager.getActiveMonitorCount();

                const stopPayloadBase = {
                    activeMonitors,
                    reason,
                    timestamp: Date.now(),
                } satisfies OrchestratorEvents["monitoring:stopped"];

                const payload: OrchestratorEvents["monitoring:stopped"] =
                    summary
                        ? {
                              ...stopPayloadBase,
                              summary: summary satisfies MonitoringStopSummary,
                          }
                        : stopPayloadBase;

                attachForwardedMetadata({
                    busId: this.busId,
                    forwardedEvent: "monitoring:stopped",
                    payload,
                    source: eventData,
                });

                await this.eventBus.emitTyped("monitoring:stopped", payload);
            },
        });
    };

    public constructor(options: OrchestratorEventForwardingCoordinatorOptions) {
        this.busId = options.busId;
        this.eventBus = options.eventBus;
        this.monitorManager = options.monitorManager;
        this.siteManager = options.siteManager;
    }

    /** Register forwarding listeners. */
    public register(): void {
        if (this.isRegistered) return;

        // Site event forwarding
        this.eventBus.on("internal:site:added", this.handleSiteAddedEvent);
        this.eventBus.on("internal:site:removed", this.handleSiteRemovedEvent);
        this.eventBus.on("internal:site:updated", this.handleSiteUpdatedEvent);

        // Monitoring lifecycle forwarding
        this.eventBus.on(
            "internal:monitor:started",
            this.handleMonitorStartedEvent
        );
        this.eventBus.on(
            "internal:monitor:stopped",
            this.handleMonitorStoppedEvent
        );

        this.isRegistered = true;
    }

    /** Remove forwarding listeners. */
    public unregister(): void {
        if (!this.isRegistered) return;

        this.eventBus.off("internal:site:added", this.handleSiteAddedEvent);
        this.eventBus.off("internal:site:removed", this.handleSiteRemovedEvent);
        this.eventBus.off("internal:site:updated", this.handleSiteUpdatedEvent);

        this.eventBus.off(
            "internal:monitor:started",
            this.handleMonitorStartedEvent
        );
        this.eventBus.off(
            "internal:monitor:stopped",
            this.handleMonitorStoppedEvent
        );

        this.isRegistered = false;
    }
}

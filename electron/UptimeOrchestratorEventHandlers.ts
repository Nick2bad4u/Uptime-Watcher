import type { MonitoringLifecycleCoordinator } from "./coordinators/MonitoringLifecycleCoordinator";
import type { SnapshotSyncCoordinator } from "./coordinators/SnapshotSyncCoordinator";
import type { UptimeEvents } from "./events/eventTypes";
import type {
    IsMonitoringActiveRequestData,
    RestartMonitoringRequestData,
    StartMonitoringRequestData,
    StopMonitoringRequestData,
    UpdateSitesCacheRequestData,
} from "./UptimeOrchestrator.types";

import { fireAndForgetLogged } from "./utils/fireAndForget";
import { logger } from "./utils/logger";

/**
 * Dependency contract for {@link UptimeOrchestratorEventHandlers}.
 */
export interface UptimeOrchestratorEventHandlersOptions {
    readonly monitoringLifecycleCoordinator: MonitoringLifecycleCoordinator;
    readonly onDatabaseInitialized: () => Promise<void>;
    readonly snapshotSyncCoordinator: SnapshotSyncCoordinator;
}

/**
 * Centralizes the bound event-handler functions for {@link UptimeOrchestrator}.
 *
 * @remarks
 * Keeping these handlers out of the orchestrator class reduces file size and
 * keeps the orchestrator focused on high-level orchestration instead of
 * callback plumbing.
 */
export class UptimeOrchestratorEventHandlers {
    private readonly monitoringLifecycleCoordinator: MonitoringLifecycleCoordinator;

    private readonly onDatabaseInitialized: () => Promise<void>;

    private readonly snapshotSyncCoordinator: SnapshotSyncCoordinator;

    /** Event handler for sites cache update requests. */
    public readonly handleUpdateSitesCacheRequestedEvent = (
        data: UpdateSitesCacheRequestData
    ): void => {
        this.snapshotSyncCoordinator.handleUpdateSitesCacheRequestedEvent(data);
    };

    /** Event handler for retrieving sites from cache. */
    public readonly handleGetSitesFromCacheRequestedEvent = (): void => {
        this.snapshotSyncCoordinator.handleGetSitesFromCacheRequestedEvent();
    };

    /** Event handler for database initialization completion. */
    public readonly handleDatabaseInitializedEvent = (): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[UptimeOrchestrator] Error handling internal:database:initialized:",
            task: async () => {
                await this.onDatabaseInitialized();
            },
        });
    };

    /** Event handler for manual monitor check completion events. */
    public readonly handleManualCheckCompletedEvent = (
        eventData: UptimeEvents["internal:monitor:manual-check-completed"] & {
            _meta?: unknown;
        }
    ): void => {
        this.snapshotSyncCoordinator.handleManualCheckCompletedEvent(eventData);
    };

    /** Event handler for monitoring start requests. */
    public readonly handleStartMonitoringRequestedEvent = (
        data: StartMonitoringRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleStartMonitoringRequestedEvent(
            data
        );
    };

    /** Event handler for monitoring stop requests. */
    public readonly handleStopMonitoringRequestedEvent = (
        data: StopMonitoringRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleStopMonitoringRequestedEvent(
            data
        );
    };

    /** Event handler for monitoring status check requests. */
    public readonly handleIsMonitoringActiveRequestedEvent = (
        data: IsMonitoringActiveRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleIsMonitoringActiveRequestedEvent(
            data
        );
    };

    /** Event handler for monitoring restart requests. */
    public readonly handleRestartMonitoringRequestedEvent = (
        data: RestartMonitoringRequestData
    ): void => {
        this.monitoringLifecycleCoordinator.handleRestartMonitoringRequestedEvent(
            data
        );
    };

    public constructor(options: UptimeOrchestratorEventHandlersOptions) {
        this.monitoringLifecycleCoordinator =
            options.monitoringLifecycleCoordinator;
        this.onDatabaseInitialized = options.onDatabaseInitialized;
        this.snapshotSyncCoordinator = options.snapshotSyncCoordinator;
    }
}

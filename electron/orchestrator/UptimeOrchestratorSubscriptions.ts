import type { HistoryLimitCoordinator } from "../coordinators/HistoryLimitCoordinator";
import type { OrchestratorEventForwardingCoordinator } from "../coordinators/OrchestratorEventForwardingCoordinator";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { OrchestratorEvents } from "../UptimeOrchestrator.types";
import type { UptimeOrchestratorEventHandlers } from "../UptimeOrchestratorEventHandlers";

/**
 * Dependencies for {@link UptimeOrchestratorSubscriptions}.
 */
export interface UptimeOrchestratorSubscriptionsOptions {
    /** Event bus to register listeners against (the orchestrator itself). */
    readonly eventBus: TypedEventBus<OrchestratorEvents>;
    /** Coordinator that forwards manager events to renderer listeners. */
    readonly eventForwardingCoordinator: Pick<
        OrchestratorEventForwardingCoordinator,
        "register" | "unregister"
    >;
    /** Bound handler functions for internal orchestrator events. */
    readonly eventHandlers: UptimeOrchestratorEventHandlers;
    /** Coordinator that wires the history-limit flow. */
    readonly historyLimitCoordinator: Pick<
        HistoryLimitCoordinator,
        "register" | "unregister"
    >;
}

/**
 * Registers and unregisters all event-bus subscriptions used by
 * {@link UptimeOrchestrator}.
 *
 * @remarks
 * This exists solely to keep `UptimeOrchestrator.ts` focused on orchestration
 * and public API surface, rather than listener plumbing.
 */
export class UptimeOrchestratorSubscriptions {
    private readonly eventBus: TypedEventBus<OrchestratorEvents>;

    private readonly eventHandlers: UptimeOrchestratorEventHandlers;

    private readonly historyLimitCoordinator: Pick<
        HistoryLimitCoordinator,
        "register" | "unregister"
    >;

    private readonly eventForwardingCoordinator: Pick<
        OrchestratorEventForwardingCoordinator,
        "register" | "unregister"
    >;

    private isRegistered = false;

    public constructor(options: UptimeOrchestratorSubscriptionsOptions) {
        this.eventBus = options.eventBus;
        this.eventHandlers = options.eventHandlers;
        this.historyLimitCoordinator = options.historyLimitCoordinator;
        this.eventForwardingCoordinator = options.eventForwardingCoordinator;
    }

    /**
     * Registers all orchestrator event listeners.
     *
     * @remarks
     * Idempotent: repeated calls are ignored.
     */
    public register(): void {
        if (this.isRegistered) {
            return;
        }

        this.isRegistered = true;

        // Set up database manager event handlers.

        this.eventBus.on(
            "internal:database:update-sites-cache-requested",
            this.eventHandlers.handleUpdateSitesCacheRequestedEvent
        );

        this.eventBus.on(
            "internal:database:get-sites-from-cache-requested",
            this.eventHandlers.handleGetSitesFromCacheRequestedEvent
        );

        this.eventBus.on(
            "internal:database:initialized",
            this.eventHandlers.handleDatabaseInitializedEvent
        );

        this.historyLimitCoordinator.register();
        this.eventForwardingCoordinator.register();

        // Set up monitoring event handlers.

        this.eventBus.on(
            "internal:monitor:manual-check-completed",
            this.eventHandlers.handleManualCheckCompletedEvent
        );

        // Set up site manager event handlers.

        this.eventBus.on(
            "internal:site:start-monitoring-requested",
            this.eventHandlers.handleStartMonitoringRequestedEvent
        );

        this.eventBus.on(
            "internal:site:stop-monitoring-requested",
            this.eventHandlers.handleStopMonitoringRequestedEvent
        );

        this.eventBus.on(
            "internal:site:is-monitoring-active-requested",
            this.eventHandlers.handleIsMonitoringActiveRequestedEvent
        );

        this.eventBus.on(
            "internal:site:restart-monitoring-requested",
            this.eventHandlers.handleRestartMonitoringRequestedEvent
        );
    }

    /**
     * Unregisters all orchestrator event listeners.
     *
     * @remarks
     * Idempotent: repeated calls are ignored.
     */
    public unregister(): void {
        if (!this.isRegistered) {
            return;
        }

        this.isRegistered = false;

        this.historyLimitCoordinator.unregister();
        this.eventForwardingCoordinator.unregister();

        this.eventBus.off(
            "internal:database:update-sites-cache-requested",
            this.eventHandlers.handleUpdateSitesCacheRequestedEvent
        );
        this.eventBus.off(
            "internal:database:get-sites-from-cache-requested",
            this.eventHandlers.handleGetSitesFromCacheRequestedEvent
        );
        this.eventBus.off(
            "internal:database:initialized",
            this.eventHandlers.handleDatabaseInitializedEvent
        );

        this.eventBus.off(
            "internal:monitor:manual-check-completed",
            this.eventHandlers.handleManualCheckCompletedEvent
        );

        this.eventBus.off(
            "internal:site:start-monitoring-requested",
            this.eventHandlers.handleStartMonitoringRequestedEvent
        );
        this.eventBus.off(
            "internal:site:stop-monitoring-requested",
            this.eventHandlers.handleStopMonitoringRequestedEvent
        );
        this.eventBus.off(
            "internal:site:is-monitoring-active-requested",
            this.eventHandlers.handleIsMonitoringActiveRequestedEvent
        );
        this.eventBus.off(
            "internal:site:restart-monitoring-requested",
            this.eventHandlers.handleRestartMonitoringRequestedEvent
        );
    }
}

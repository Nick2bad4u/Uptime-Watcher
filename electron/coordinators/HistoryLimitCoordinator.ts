/**
 * Coordinates history-limit updates between the database layer and renderer
 * listeners.
 *
 * @remarks
 * Listens for `internal:database:history-limit-updated` events emitted by the
 * {@link DatabaseManager}, tracks the previous limit for telemetry, and forwards
 * sanitized updates to frontend consumers via `settings:history-limit-updated`.
 * This helper keeps {@link UptimeOrchestrator} focused on high level manager
 * orchestration while avoiding duplication of history-limit bookkeeping.
 */

import { ensureError } from "@shared/utils/errorHandling";

import type { TypedEventBus } from "../events/TypedEventBus";
import type { DatabaseManager } from "../managers/DatabaseManager";
import type { OrchestratorEvents } from "../UptimeOrchestrator.types";

import { DEFAULT_HISTORY_LIMIT } from "../constants";
import { fireAndForgetLogged } from "../utils/fireAndForget";
import { logger } from "../utils/logger";

/**
 * Options required to construct a {@link HistoryLimitCoordinator} instance.
 */
export interface HistoryLimitCoordinatorOptions {
    /** Database manager providing authoritative history-limit information. */
    databaseManager: DatabaseManager;
    /** Event bus used to subscribe to database and emit renderer events. */
    eventBus: TypedEventBus<OrchestratorEvents>;
}

/**
 * Bridges database history-limit events to renderer listeners.
 *
 * @remarks
 * Maintains the last known limit to provide `previousLimit` telemetry, applies
 * lightweight sanity checks, and ensures renderer consumers are notified of
 * updates without bloating the main orchestrator module.
 */
export class HistoryLimitCoordinator {
    /** Database manager dependency supplying history-limit state. */
    private readonly databaseManager: DatabaseManager;

    /** Event bus used to consume and emit typed events. */
    private readonly eventBus: TypedEventBus<OrchestratorEvents>;

    /** Cached history-limit value for `previousLimit` telemetry. */
    private lastKnownLimit: number;

    /** Tracks whether listeners have been registered. */
    private isRegistered = false;

    /**
     * Bound event handler forwarding database history-limit updates.
     */
    private readonly handleHistoryLimitUpdatedEvent = (
        eventData: OrchestratorEvents["internal:database:history-limit-updated"]
    ): void => {
        fireAndForgetLogged({
            logger,
            message:
                "[HistoryLimitCoordinator] Unhandled error processing history limit update",
            task: async () => {
                await this.processHistoryLimitUpdate(eventData);
            },
        });
    };

    /**
     * Processes history-limit updates and emits renderer notifications.
     *
     * @param eventData - Event payload emitted by the database layer.
     */
    private async processHistoryLimitUpdate(
        eventData: OrchestratorEvents["internal:database:history-limit-updated"]
    ): Promise<void> {
        const { limit, operation, timestamp } = eventData;

        if (typeof limit !== "number" || Number.isNaN(limit)) {
            logger.warn(
                "[HistoryLimitCoordinator] Ignoring history limit update with non-numeric payload",
                { limit, timestamp }
            );
            return;
        }

        if (!Number.isFinite(limit) || limit < 0) {
            logger.warn(
                "[HistoryLimitCoordinator] Ignoring history limit update with invalid value",
                { limit, timestamp }
            );
            return;
        }

        const previousLimit = this.lastKnownLimit;
        this.lastKnownLimit = limit;

        logger.debug(
            "[HistoryLimitCoordinator] Forwarding history limit update to renderer",
            {
                limit,
                operation,
                previousLimit,
                timestamp,
            }
        );

        await this.eventBus.emitTyped("settings:history-limit-updated", {
            limit,
            operation,
            previousLimit,
            timestamp,
        });
    }

    /**
     * Creates a new {@link HistoryLimitCoordinator} instance.
     *
     * @param options - Construction options.
     */
    public constructor(options: HistoryLimitCoordinatorOptions) {
        this.databaseManager = options.databaseManager;
        this.eventBus = options.eventBus;
        this.lastKnownLimit = this.resolveInitialHistoryLimit();
    }

    /**
     * Registers listeners for history-limit updates.
     */
    public register(): void {
        if (this.isRegistered) return;

        this.eventBus.on(
            "internal:database:history-limit-updated",
            this.handleHistoryLimitUpdatedEvent
        );
        this.isRegistered = true;
    }

    /**
     * Removes previously registered listeners.
     */
    public unregister(): void {
        if (!this.isRegistered) return;

        this.eventBus.off(
            "internal:database:history-limit-updated",
            this.handleHistoryLimitUpdatedEvent
        );
        this.isRegistered = false;
    }

    /**
     * Gets the most recently observed history-limit value.
     *
     * @returns The cached history-limit.
     */
    public getLastKnownLimit(): number {
        return this.lastKnownLimit;
    }

    /**
     * Resolves the starting history-limit from the database manager.
     *
     * @returns A sane baseline history-limit value.
     */
    private resolveInitialHistoryLimit(): number {
        try {
            const limit = this.databaseManager.getHistoryLimit();

            if (
                typeof limit === "number" &&
                Number.isFinite(limit) &&
                limit >= 0
            ) {
                return limit;
            }

            logger.warn(
                "[HistoryLimitCoordinator] DatabaseManager returned invalid history limit; defaulting to baseline",
                { defaultLimit: DEFAULT_HISTORY_LIMIT, receivedLimit: limit }
            );
        } catch (error: unknown) {
            logger.error(
                "[HistoryLimitCoordinator] Failed to read history limit from DatabaseManager; defaulting to baseline",
                ensureError(error)
            );
        }

        return DEFAULT_HISTORY_LIMIT;
    }
}

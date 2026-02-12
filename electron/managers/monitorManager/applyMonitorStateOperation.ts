/**
 * Monitor state persistence and event emission.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep
 * the manager focused on lifecycle orchestration.
 *
 * This helper:
 *
 * - Mutates the cached monitor + site objects
 * - Persists the monitor changes inside a transaction
 * - Emits the canonical `monitor:status-changed` payload
 *
 * @packageDocumentation
 */

import type { Monitor, MonitorStatus, Site, StatusUpdate } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { withDatabaseOperation } from "../../utils/operationalHooks";

/**
 * Dependencies required to apply and persist monitor state.
 *
 * @public
 */
export interface ApplyMonitorStateDependencies {
    readonly databaseService: DatabaseService;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly monitorRepository: MonitorRepository;
    readonly sitesCache: StandardizedCache<Site>;
}

/**
 * Applies monitor state changes to cache + database, then emits a status-change
 * event.
 *
 * @param args - Operation arguments.
 */
export async function applyMonitorStateOperation(args: {
    readonly changes: Partial<Monitor>;
    readonly dependencies: ApplyMonitorStateDependencies;
    readonly monitor: Monitor;
    readonly newStatus: MonitorStatus;
    readonly site: Site;
}): Promise<void> {
    const { changes, dependencies, monitor, newStatus, site } = args;

    const previousStatus = monitor.status;

    // Update cached monitor object
    Object.assign(monitor, changes);

    // Update monitor in cached site
    const monitorIndex = site.monitors.findIndex((m) => m.id === monitor.id);
    if (monitorIndex !== -1) {
        site.monitors[monitorIndex] = monitor;
    }

    // Update cached site
    dependencies.sitesCache.set(site.identifier, site);

    // Persist to database within transaction
    await withDatabaseOperation(
        async () =>
            dependencies.databaseService.executeTransaction((db) => {
                const monitorTx =
                    dependencies.monitorRepository.createTransactionAdapter(db);

                monitorTx.update(monitor.id, changes);
                return Promise.resolve();
            }),
        "monitor-manager-apply-state-change",
        dependencies.eventEmitter,
        { changes, monitorId: monitor.id }
    );

    // Emit status-changed event with full payload
    const statusUpdate: StatusUpdate = {
        monitor,
        monitorId: monitor.id,
        previousStatus,
        responseTime: monitor.responseTime,
        site,
        siteIdentifier: site.identifier,
        status: newStatus,
        timestamp: new Date().toISOString(),
    };

    await dependencies.eventEmitter.emitTyped(
        "monitor:status-changed",
        statusUpdate
    );
}

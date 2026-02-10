/**
 * Builders for {@link electron/managers/MonitorManager#MonitorManager} enhanced lifecycle inputs.
 *
 * @remarks
 * Extracted from `MonitorManager.ts` to reduce file size and keep object-shape
 * construction (which is easy to get wrong under strict typing) in one place.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { EnhancedMonitoringServices } from "../../services/monitoring/EnhancedMonitoringServiceFactory";
import type { MonitorScheduler } from "../../services/monitoring/MonitorScheduler";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type {
    EnhancedLifecycleConfig,
    EnhancedLifecycleHost,
} from "../MonitorManagerEnhancedLifecycle";

/**
 * Creates the dependency bundle required by enhanced lifecycle helpers.
 */
export function createEnhancedLifecycleConfigOperation(args: {
    readonly databaseService: DatabaseService;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    readonly logger: Logger;
    readonly monitorRepository: MonitorRepository;
    readonly monitorScheduler: MonitorScheduler;
    readonly sites: StandardizedCache<Site>;
}): EnhancedLifecycleConfig {
    return {
        databaseService: args.databaseService,
        eventEmitter: args.eventEmitter,
        logger: args.logger,
        monitorRepository: args.monitorRepository,
        monitorScheduler: args.monitorScheduler,
        sites: args.sites,
    };
}

/**
 * Creates the host hooks required by enhanced lifecycle helpers.
 */
export function createEnhancedLifecycleHostOperation(args: {
    readonly applyMonitorState: EnhancedLifecycleHost["applyMonitorState"];
    readonly runSequentially: EnhancedLifecycleHost["runSequentially"];
    readonly services: EnhancedMonitoringServices;
}): EnhancedLifecycleHost {
    return {
        applyMonitorState: args.applyMonitorState,
        runSequentially: args.runSequentially,
        services: args.services,
    };
}

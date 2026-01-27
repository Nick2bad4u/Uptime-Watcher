/**
 * Strategy-registry initialization for {@link EnhancedMonitorChecker}.
 *
 * @remarks
 * We keep `servicesByType` as a stable, mutable map so tests can override
 * monitor services (`checker["servicesByType"].set(...)`) without rebuilding the
 * strategy registry.
 *
 * @packageDocumentation
 */

import type { Monitor } from "@shared/types";

import type { IMonitorService } from "../types";

import {
    createMonitorStrategyRegistry,
    type MonitorStrategyRegistry,
} from "../strategies/MonitorStrategyRegistry";

const getServiceOrThrow = (
    servicesByType: Map<Monitor["type"], IMonitorService>,
    type: Monitor["type"]
): IMonitorService => {
    const service = servicesByType.get(type);
    if (!service) {
        throw new Error(`No monitor service registered for type: ${type}`);
    }

    return service;
};

/**
 * Creates the shared service-map and strategy registry used by
 * {@link EnhancedMonitorChecker}.
 *
 * @param args - Builder arguments.
 */
export function createServicesByTypeAndStrategyRegistry(args: {
    readonly getServiceForType: (type: Monitor["type"]) => IMonitorService;
    readonly registeredTypes: ReadonlyArray<Monitor["type"]>;
}): {
    readonly servicesByType: Map<Monitor["type"], IMonitorService>;
    readonly strategyRegistry: MonitorStrategyRegistry;
} {
    const servicesByType = new Map(
        args.registeredTypes.map((type) => [type, args.getServiceForType(type)])
    );

    const strategyRegistry = createMonitorStrategyRegistry(
        args.registeredTypes.map((type) => ({
            getService: (): IMonitorService => getServiceOrThrow(servicesByType, type),
            type,
        }))
    );

    return {
        servicesByType,
        strategyRegistry,
    };
}

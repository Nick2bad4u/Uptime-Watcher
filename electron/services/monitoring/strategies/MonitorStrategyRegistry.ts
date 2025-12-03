import type { Monitor } from "@shared/types";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";

import type { MonitorCheckContext } from "../checkContext";
import type {
    IMonitorService,
    MonitorCheckResult as ServiceMonitorCheckResult,
} from "../types";

import { monitorLogger as logger } from "../../../utils/logger";

/**
 * Execution context forwarded to monitor strategy services.
 */
export type StrategyExecutionContext = MonitorCheckContext;

/**
 * Registry entry describing how to execute a monitor strategy.
 */
export interface StrategyEntry {
    readonly getService: () => IMonitorService;
    readonly type: Monitor["type"];
}

/**
 * Contract for executing monitor strategies based on monitor type.
 */
export interface MonitorStrategyRegistry {
    execute: (
        monitor: Monitor,
        context?: StrategyExecutionContext
    ) => Promise<ServiceMonitorCheckResult>;
}

/**
 * Builds a monitor strategy registry backed by the provided entries.
 */
export function createMonitorStrategyRegistry(
    entries: readonly StrategyEntry[]
): MonitorStrategyRegistry {
    const registry = new Map<Monitor["type"], StrategyEntry["getService"]>();

    for (const entry of entries) {
        registry.set(entry.type, entry.getService);
    }

    const execute = async (
        monitor: Monitor,
        context?: StrategyExecutionContext
    ): Promise<ServiceMonitorCheckResult> => {
        const getService = registry.get(monitor.type);

        if (!getService) {
            logger.warn(LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_CHECK, {
                monitorType: monitor.type,
            });
            return {
                details: `Unknown monitor type: ${monitor.type as string}`,
                responseTime: 0,
                status: "down",
            } satisfies ServiceMonitorCheckResult;
        }

        const service = getService();
        return service.check(monitor, context?.signal);
    };

    return { execute } satisfies MonitorStrategyRegistry;
}

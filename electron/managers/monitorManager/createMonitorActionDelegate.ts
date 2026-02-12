/**
 * Recursion-safe monitor action delegate.
 *
 * @remarks
 * Extracted from {@link electron/managers/MonitorManager#MonitorManager} to keep
 * the manager focused on orchestration.
 */

import type { Logger } from "@shared/utils/logger/interfaces";

import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { MonitorActionDelegate } from "../MonitorManagerEnhancedLifecycle";

/**
 * Produces a recursion-safe delegate for nested monitor operations.
 *
 * @param args - Operation arguments.
 */
export function createMonitorActionDelegate(args: {
    readonly action: (
        siteIdentifier: string,
        monitorIdentifier?: string
    ) => Promise<boolean>;
    readonly identifier: string;
    readonly logger: Logger;
    readonly monitorId: string | undefined;
}): MonitorActionDelegate {
    const { action, identifier, logger, monitorId } = args;

    return async (recursiveId, recursiveMonitorId) => {
        if (recursiveId !== identifier || recursiveMonitorId !== monitorId) {
            return action(recursiveId, recursiveMonitorId);
        }

        logger.warn(
            interpolateLogTemplate(
                LOG_TEMPLATES.warnings.RECURSIVE_CALL_PREVENTED,
                {
                    identifier,
                    monitorId: monitorId ?? "all",
                }
            )
        );

        return false;
    };
}

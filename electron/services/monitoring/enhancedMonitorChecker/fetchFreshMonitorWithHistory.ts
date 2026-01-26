import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import type { EnhancedMonitorCheckConfig } from "../EnhancedMonitorChecker";

/**
 * Loads the latest monitor record plus persisted history.
 */
export async function fetchFreshMonitorWithHistory(args: {
    readonly historyRepository: EnhancedMonitorCheckConfig["historyRepository"];
    readonly logger: Logger;
    readonly monitorId: string;
    readonly monitorRepository: EnhancedMonitorCheckConfig["monitorRepository"];
}): Promise<Site["monitors"][0] | undefined> {
    const { historyRepository, logger, monitorId, monitorRepository } = args;

    const freshMonitor = await monitorRepository.findByIdentifier(monitorId);

    if (!freshMonitor) {
        logger.warn(`Fresh monitor data not found for ${monitorId}`);
        return undefined;
    }

    const freshHistory = await historyRepository.findByMonitorId(monitorId);

    return {
        ...freshMonitor,
        history: freshHistory,
    };
}

interface MonitorCheckQueueEntry {
    readonly completion: Promise<void>;
}

interface MonitorCheckBlock {
    count: number;
    readonly completion: Promise<void>;
    readonly release: () => void;
}

const activeMonitorChecks = new Map<string, MonitorCheckQueueEntry>();
const blockedMonitorChecks = new Map<string, MonitorCheckBlock>();

/**
 * Blocks new checks for the supplied monitors until the returned release
 * callback is invoked.
 *
 * @remarks
 * Correlated checks are skipped while blocked. Manual checks wait so they can
 * revalidate persistence after the lifecycle mutation completes.
 */
export function blockMonitorChecks(monitorIds: readonly string[]): () => void {
    const uniqueMonitorIds = [...new Set(monitorIds)].filter(
        (monitorId) => monitorId.length > 0
    );

    for (const monitorId of uniqueMonitorIds) {
        const currentBlock = blockedMonitorChecks.get(monitorId);
        if (currentBlock) {
            currentBlock.count += 1;
            continue;
        }

        let releaseBlock = (): void => undefined;
        const completion = new Promise<void>((resolve) => {
            releaseBlock = resolve;
        });
        blockedMonitorChecks.set(monitorId, {
            completion,
            count: 1,
            release: releaseBlock,
        });
    }

    let isReleased = false;
    return (): void => {
        if (isReleased) {
            return;
        }
        isReleased = true;

        for (const monitorId of uniqueMonitorIds) {
            const currentBlock = blockedMonitorChecks.get(monitorId);
            if (!currentBlock) {
                continue;
            }

            currentBlock.count -= 1;
            if (currentBlock.count === 0) {
                blockedMonitorChecks.delete(monitorId);
                currentBlock.release();
            }
        }
    };
}

/**
 * Runs an operation with per-monitor exclusivity.
 *
 * @remarks
 * Correlated checks skip busy monitors. Manual checks and lifecycle mutations
 * wait for earlier operations to settle, preserving request order.
 */
export async function runExclusiveMonitorCheck<T>(args: {
    readonly ignoreBlock?: boolean;
    readonly monitorId: string;
    readonly operation: () => Promise<T>;
    readonly skipIfBusy: boolean;
}): Promise<T | undefined> {
    const { ignoreBlock = false, monitorId, operation, skipIfBusy } = args;
    const block = blockedMonitorChecks.get(monitorId);
    if (block && !ignoreBlock) {
        if (skipIfBusy) {
            return undefined;
        }
        await block.completion;
    }

    const previousEntry = activeMonitorChecks.get(monitorId);

    if (previousEntry && skipIfBusy) {
        return undefined;
    }

    let releaseEntry: () => void = () => undefined;
    const entry: MonitorCheckQueueEntry = {
        completion: new Promise<void>((resolve) => {
            releaseEntry = resolve;
        }),
    };
    activeMonitorChecks.set(monitorId, entry);

    try {
        if (previousEntry) {
            await previousEntry.completion;
        }

        return await operation();
    } finally {
        releaseEntry();
        if (activeMonitorChecks.get(monitorId) === entry) {
            activeMonitorChecks.delete(monitorId);
        }
    }
}

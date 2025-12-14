import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";

import type { CloudObjectEntry } from "../providers/CloudStorageProvider.types";

interface PreviewDevice {
    deviceId: string;
    newestCreatedAtEpochMs?: number | undefined;
    oldestCreatedAtEpochMs?: number | undefined;
    operationObjectCount: number;
}

const opsKeyPattern =
    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- This pattern does not require Unicode sets; /v is optional.
    /^sync\/devices\/(?<deviceId>[^/]+)\/ops\/(?<createdAtEpochMs>\d+)-\d+-\d+\.ndjson$/u;

/**
 * Builds a {@link CloudSyncResetPreview} from a remote manifest and a list of
 * remote objects under `sync/`.
 */
export function buildCloudSyncResetPreview(args: {
    manifest: CloudSyncManifest;
    syncObjects: readonly CloudObjectEntry[];
}): CloudSyncResetPreview {
    const perDeviceMap = new Map<string, PreviewDevice>();

    function upsertDeviceOperation(
        deviceId: string,
        createdAtEpochMs: number
    ): void {
        const existing = perDeviceMap.get(deviceId);
        if (!existing) {
            perDeviceMap.set(deviceId, {
                deviceId,
                newestCreatedAtEpochMs: createdAtEpochMs,
                oldestCreatedAtEpochMs: createdAtEpochMs,
                operationObjectCount: 1,
            });
            return;
        }

        existing.operationObjectCount += 1;

        if (
            existing.oldestCreatedAtEpochMs === undefined ||
            createdAtEpochMs < existing.oldestCreatedAtEpochMs
        ) {
            existing.oldestCreatedAtEpochMs = createdAtEpochMs;
        }

        if (
            existing.newestCreatedAtEpochMs === undefined ||
            createdAtEpochMs > existing.newestCreatedAtEpochMs
        ) {
            existing.newestCreatedAtEpochMs = createdAtEpochMs;
        }
    }

    let operationObjectCount = 0;
    let snapshotObjectCount = 0;
    let otherObjectCount = 0;

    for (const entry of args.syncObjects) {
        const { key } = entry;

        if (key.includes("/ops/")) {
            operationObjectCount += 1;

            const match = opsKeyPattern.exec(key);
            const deviceId = match?.groups?.["deviceId"];
            const createdAtString = match?.groups?.["createdAtEpochMs"];

            if (deviceId && createdAtString) {
                const createdAtEpochMs = Number(createdAtString);
                if (Number.isFinite(createdAtEpochMs)) {
                    upsertDeviceOperation(deviceId, createdAtEpochMs);
                }
            }
        } else if (key.includes("/snapshots/")) {
            snapshotObjectCount += 1;
        } else {
            otherObjectCount += 1;
        }
    }

    const perDevice: PreviewDevice[] = [];
    for (const value of perDeviceMap.values() as Iterable<PreviewDevice>) {
        perDevice.push(value);
    }
    perDevice.sort((a, b) => a.deviceId.localeCompare(b.deviceId));

    const deviceIds = Object.keys(args.manifest.devices);
    deviceIds.sort((a, b) => a.localeCompare(b));

    return {
        deviceIds,
        fetchedAt: Date.now(),
        operationDeviceIds: perDevice.map((entry) => entry.deviceId),
        operationObjectCount,
        otherObjectCount,
        perDevice,
        snapshotObjectCount,
        syncObjectCount: args.syncObjects.length,
    };
}

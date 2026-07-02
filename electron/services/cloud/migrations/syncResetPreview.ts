import type { CloudSyncManifest } from "@shared/types/cloudSyncManifest";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";

import { isDefined, objectKeys, safeCastTo } from "ts-extras";

import type { CloudObjectEntry } from "../providers/CloudStorageProvider.types";

import { parseOpsObjectKeyMetadata } from "../../sync/syncEngineKeyUtils";

interface PreviewDevice {
    deviceId: string;
    newestCreatedAtEpochMs?: number | undefined;
    oldestCreatedAtEpochMs?: number | undefined;
    operationObjectCount: number;
}

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
            !isDefined(existing.oldestCreatedAtEpochMs) ||
            createdAtEpochMs < existing.oldestCreatedAtEpochMs
        ) {
            existing.oldestCreatedAtEpochMs = createdAtEpochMs;
        }

        if (
            !isDefined(existing.newestCreatedAtEpochMs) ||
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

            const metadata = parseOpsObjectKeyMetadata(key);
            if (metadata) {
                upsertDeviceOperation(metadata.deviceId, metadata.createdAt);
            }
        } else if (key.includes("/snapshots/")) {
            snapshotObjectCount += 1;
        } else {
            otherObjectCount += 1;
        }
    }

    const perDevice: PreviewDevice[] = [
        ...safeCastTo<Iterable<PreviewDevice>>(perDeviceMap.values()),
    ];
    perDevice.sort((a, b) => a.deviceId.localeCompare(b.deviceId));

    const deviceIds = objectKeys(args.manifest.devices);
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

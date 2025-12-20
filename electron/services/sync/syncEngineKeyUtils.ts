/**
 * SyncEngine key parsing helpers.
 */

const OPS_OBJECT_SUFFIX = ".ndjson" as const;

/**
 * Parses metadata from a validated operation object key.
 *
 * @remarks
 * Expected format: `sync/devices/<deviceId>/ops/<createdAt>-<firstOpId>-<lastOpId>.ndjson`
 */
export function parseOpsObjectKeyMetadata(key: string):
    | null
    | Readonly<{
          createdAt: number;
          deviceId: string;
          lastOpId: number;
      }> {
    const segments = key.split("/");
    // Expected: sync/devices/<deviceId>/ops/<createdAt>-<firstOpId>-<lastOpId>.ndjson
    if (segments.length !== 5) {
        return null;
    }

    const [syncSegment, devicesSegment, deviceId, opsSegment, fileName] =
        segments;

    if (
        syncSegment !== "sync" ||
        devicesSegment !== "devices" ||
        opsSegment !== "ops" ||
        !deviceId ||
        !fileName
    ) {
        return null;
    }

    if (!fileName.endsWith(OPS_OBJECT_SUFFIX)) {
        return null;
    }

    const stem = fileName.slice(0, -OPS_OBJECT_SUFFIX.length);
    const parts = stem.split("-");
    if (parts.length !== 3) {
        return null;
    }

    const [createdAtRaw, , lastOpIdRaw] = parts;
    if (!createdAtRaw || !lastOpIdRaw) {
        return null;
    }

    const createdAt = Number(createdAtRaw);
    const lastOpId = Number(lastOpIdRaw);

    if (
        !Number.isSafeInteger(createdAt) ||
        createdAt < 0 ||
        !Number.isSafeInteger(lastOpId) ||
        lastOpId < 0
    ) {
        return null;
    }

    return {
        createdAt,
        deviceId,
        lastOpId,
    };
}

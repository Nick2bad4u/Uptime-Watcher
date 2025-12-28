/**
 * SyncEngine key parsing helpers.
 */

import { isAsciiDigits, isValidPersistedDeviceId } from "./syncEngineUtils";

export const OPS_OBJECT_SUFFIX = ".ndjson" as const;

/**
 * Parsed metadata from an ops object filename.
 *
 * @remarks
 * Expected filename format: `<createdAt>-<firstOpId>-<lastOpId>.ndjson`
 */
export type OpsObjectFileNameMetadata = Readonly<{
    createdAt: number;
    firstOpId: number;
    lastOpId: number;
}>;

/**
 * Parses and validates an operation object filename.
 *
 * @remarks
 * This helper is intentionally strict and used by both the sync engine and the
 * provider transport to avoid drift in what keys are considered valid.
 *
 * @param fileName - Provider object filename segment.
 */
export function parseOpsObjectFileNameMetadata(
    fileName: string
): null | OpsObjectFileNameMetadata {
    if (!fileName.endsWith(OPS_OBJECT_SUFFIX)) {
        return null;
    }

    const stem = fileName.slice(0, -OPS_OBJECT_SUFFIX.length);
    const parts = stem.split("-");
    if (parts.length !== 3) {
        return null;
    }

    const [
        createdAtRaw,
        firstOpIdRaw,
        lastOpIdRaw,
    ] = parts;
    if (!createdAtRaw || !firstOpIdRaw || !lastOpIdRaw) {
        return null;
    }

    if (
        !isAsciiDigits(createdAtRaw) ||
        !isAsciiDigits(firstOpIdRaw) ||
        !isAsciiDigits(lastOpIdRaw)
    ) {
        return null;
    }

    const createdAt = Number(createdAtRaw);
    const firstOpId = Number(firstOpIdRaw);
    const lastOpId = Number(lastOpIdRaw);

    if (
        !Number.isSafeInteger(createdAt) ||
        createdAt < 0 ||
        !Number.isSafeInteger(firstOpId) ||
        firstOpId < 0 ||
        !Number.isSafeInteger(lastOpId) ||
        lastOpId < 0 ||
        lastOpId < firstOpId
    ) {
        return null;
    }

    return {
        createdAt,
        firstOpId,
        lastOpId,
    };
}

/**
 * Parses metadata from a validated operation object key.
 *
 * @remarks
 * Expected format:
 * `sync/devices/<deviceId>/ops/<createdAt>-<firstOpId>-<lastOpId>.ndjson`
 */
export function parseOpsObjectKeyMetadata(key: string): null | Readonly<{
    createdAt: number;
    deviceId: string;
    lastOpId: number;
}> {
    const segments = key.split("/");
    // Expected: sync/devices/<deviceId>/ops/<createdAt>-<firstOpId>-<lastOpId>.ndjson
    if (segments.length !== 5) {
        return null;
    }

    const [
        syncSegment,
        devicesSegment,
        deviceId,
        opsSegment,
        fileName,
    ] = segments;

    if (
        syncSegment !== "sync" ||
        devicesSegment !== "devices" ||
        opsSegment !== "ops" ||
        !deviceId ||
        !fileName
    ) {
        return null;
    }

    if (!isValidPersistedDeviceId(deviceId)) {
        return null;
    }

    const parsedFileName = parseOpsObjectFileNameMetadata(fileName);
    if (!parsedFileName) {
        return null;
    }

    return {
        createdAt: parsedFileName.createdAt,
        deviceId,
        lastOpId: parsedFileName.lastOpId,
    };
}

import {
    CLOUD_SYNC_SCHEMA_VERSION,
    type CloudSyncOperation,
    parseCloudSyncOperation,
} from "@shared/types/cloudSync";
import {
    CLOUD_SYNC_MANIFEST_VERSION,
    type CloudSyncManifest,
    parseCloudSyncManifest,
} from "@shared/types/cloudSyncManifest";
import {
    CLOUD_SYNC_SNAPSHOT_VERSION,
    type CloudSyncSnapshot,
    parseCloudSyncSnapshot,
} from "@shared/types/cloudSyncSnapshot";
import { readNumberEnv } from "@shared/utils/environment";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../cloud/providers/CloudStorageProvider.types";
import type { CloudSyncTransport } from "./CloudSyncTransport.types";

import { logger } from "../../utils/logger";
import { CloudSyncCorruptRemoteObjectError } from "./cloudSyncTransportErrors";
import {
    OPS_OBJECT_SUFFIX,
    parseOpsObjectFileNameMetadata,
} from "./syncEngineKeyUtils";
import {
    getPersistedDeviceIdValidationError,
    hasAsciiControlCharacters,
    isAsciiDigits,
} from "./syncEngineUtils";

const MANIFEST_KEY = "manifest.json" as const;
const OPS_PREFIX = "sync/devices" as const;

const DEFAULT_MAX_OPS_OBJECT_BYTES = 5 * 1024 * 1024; // 5 MiB
const DEFAULT_MAX_OPS_OBJECT_LINES = 50_000;
const DEFAULT_MAX_OPS_LINE_CHARS = 256_000;

const DEFAULT_MAX_SNAPSHOT_BYTES = 25 * 1024 * 1024; // 25 MiB
const DEFAULT_MAX_MANIFEST_BYTES = 256 * 1024; // 256 KiB

/** Maximum byte budget accepted for provider object keys handled by sync. */
const MAX_SYNC_KEY_BYTES = 2048;

function getMaxOpsObjectBytes(): number {
    return readNumberEnv(
        "UW_CLOUD_SYNC_MAX_OPS_OBJECT_BYTES",
        DEFAULT_MAX_OPS_OBJECT_BYTES
    );
}

function getMaxOpsObjectLines(): number {
    return readNumberEnv(
        "UW_CLOUD_SYNC_MAX_OPS_OBJECT_LINES",
        DEFAULT_MAX_OPS_OBJECT_LINES
    );
}

function getMaxOpsLineChars(): number {
    return readNumberEnv(
        "UW_CLOUD_SYNC_MAX_OPS_LINE_CHARS",
        DEFAULT_MAX_OPS_LINE_CHARS
    );
}

function getMaxSnapshotBytes(): number {
    return readNumberEnv(
        "UW_CLOUD_SYNC_MAX_SNAPSHOT_BYTES",
        DEFAULT_MAX_SNAPSHOT_BYTES
    );
}

function getMaxManifestBytes(): number {
    return readNumberEnv(
        "UW_CLOUD_SYNC_MAX_MANIFEST_BYTES",
        DEFAULT_MAX_MANIFEST_BYTES
    );
}

function isProviderNotFoundError(error: unknown): boolean {
    return tryGetErrorCode(error) === "ENOENT";
}

function isCloudSyncJsonValidationError(error: unknown): boolean {
    const resolved = ensureError(error);
    return resolved instanceof SyntaxError || resolved.name === "ZodError";
}

function isCloudSyncSizeLimitError(error: unknown): boolean {
    const resolved = ensureError(error);
    return resolved.message.includes("exceeds size limit");
}

function getSnapshotsPrefix(): string {
    return `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}`;
}

function encodeUtf8(value: string): Buffer {
    return Buffer.from(value, "utf8");
}

function decodeUtf8(buffer: Buffer): string {
    return buffer.toString("utf8");
}

function toNdjson(operations: readonly CloudSyncOperation[]): string {
    return `${operations.map((op) => JSON.stringify(op)).join("\n")}\n`;
}

function assertValidDeviceId(deviceId: string): void {
    // Keep the historical TypeError for non-string values (even though call
    // sites are typed as string).
    if (typeof deviceId !== "string") {
        throw new TypeError("deviceId must be a non-empty string");
    }

    const error = getPersistedDeviceIdValidationError(deviceId);
    if (error !== null) {
        throw new Error(error);
    }
}

function assertSafeProviderKey(key: string): void {
    if (typeof key !== "string" || key.trim().length === 0) {
        throw new Error("Key must be a non-empty string");
    }

    if (Buffer.byteLength(key, "utf8") > MAX_SYNC_KEY_BYTES) {
        throw new Error(`Invalid key: exceeds ${MAX_SYNC_KEY_BYTES} bytes`);
    }

    // Provider keys are always POSIX-style.
    if (key.includes("\\")) {
        throw new Error("Invalid key: backslashes are not allowed");
    }

    if (hasAsciiControlCharacters(key)) {
        throw new Error("Invalid key: control characters are not allowed");
    }

    if (key.startsWith("/")) {
        throw new Error("Invalid key: absolute keys are not allowed");
    }

    // Treat provider keys as logical identifiers, not OS paths or URLs.
    if (key.includes("://")) {
        throw new Error("Invalid key: URL-like keys are not allowed");
    }

    if (key.includes(":")) {
        throw new Error("Invalid key: ':' tokens are not allowed");
    }

    const segments = key.split("/");
    if (
        segments.some(
            (segment) =>
                segment.length === 0 || segment === "." || segment === ".."
        )
    ) {
        throw new Error("Invalid key: traversal segments are not allowed");
    }
}

function assertOpsObjectKey(key: string): void {
    assertSafeProviderKey(key);

    const segments = key.split("/");
    // Expected: sync/devices/<deviceId>/ops/<file>.ndjson
    if (segments.length !== 5) {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/<deviceId>/ops/<file>.ndjson): ${key}`
        );
    }

    const [
        syncSegment,
        devicesSegment,
        deviceIdSegment,
        opsSegment,
        fileName,
    ] = segments;

    if (
        !syncSegment ||
        !devicesSegment ||
        !deviceIdSegment ||
        !opsSegment ||
        !fileName
    ) {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/<deviceId>/ops/<file>.ndjson): ${key}`
        );
    }

    if (syncSegment !== "sync" || devicesSegment !== "devices") {
        throw new Error(
            `Invalid sync operations object key (expected ${OPS_PREFIX}/...): ${key}`
        );
    }

    if (opsSegment !== "ops") {
        throw new Error(
            `Invalid sync operations object key (expected ops segment): ${key}`
        );
    }

    assertValidDeviceId(deviceIdSegment);

    const parsedFileName = parseOpsObjectFileNameMetadata(fileName);
    if (!parsedFileName) {
        throw new Error(
            `Invalid sync operations object key (expected <createdAt>-<firstOpId>-<lastOpId>${OPS_OBJECT_SUFFIX}): ${key}`
        );
    }
}

function isValidOpsObjectKey(key: string): boolean {
    try {
        assertOpsObjectKey(key);
        return true;
    } catch {
        return false;
    }
}

function assertSnapshotKey(key: string): void {
    assertSafeProviderKey(key);

    const segments = key.split("/");
    // Expected: sync/snapshots/<schemaVersion>/<createdAt>.json
    if (segments.length !== 4) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    const [
        syncSegment,
        snapshotsSegment,
        schemaSegment,
        fileName,
    ] = segments;
    if (syncSegment !== "sync" || snapshotsSegment !== "snapshots") {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    const expectedSchemaSegment = String(CLOUD_SYNC_SCHEMA_VERSION);
    if (schemaSegment !== expectedSchemaSegment) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    if (!fileName?.endsWith(".json")) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    const stem = fileName.slice(0, -".json".length);
    if (!isAsciiDigits(stem)) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }
}

function parseNdjsonOperations(args: {
    key: string;
    maxLineChars: number;
    maxLines: number;
    raw: string;
}): CloudSyncOperation[] {
    const { key, maxLineChars, maxLines, raw } = args;
    const lines = raw.split(/\r?\n/u);
    const operations: CloudSyncOperation[] = [];

    for (const [index, candidate] of lines.entries()) {
        const line = typeof candidate === "string" ? candidate.trim() : "";
        if (line.length > 0) {
            if (line.length > maxLineChars) {
                throw new CloudSyncCorruptRemoteObjectError(
                    `Cloud sync operation line exceeds max length (${maxLineChars} chars) in ${key} at line ${index + 1}`,
                    {
                        key,
                        kind: "operations",
                    }
                );
            }

            if (operations.length >= maxLines) {
                throw new CloudSyncCorruptRemoteObjectError(
                    `Cloud sync operation object exceeds max operation count (${maxLines}) in ${key}`,
                    {
                        key,
                        kind: "operations",
                    }
                );
            }

            try {
                const parsed: unknown = JSON.parse(line);
                operations.push(parseCloudSyncOperation(parsed));
            } catch (error: unknown) {
                const normalized = ensureError(error);
                throw new CloudSyncCorruptRemoteObjectError(
                    `Failed to parse cloud sync operation in ${key} at line ${index + 1}: ${normalized.message}`,
                    {
                        cause: error,
                        key,
                        kind: "operations",
                    }
                );
            }
        }
    }

    return operations;
}

function createEmptyManifest(): CloudSyncManifest {
    return {
        devices: {},
        lastCompactionAt: undefined,
        latestSnapshotKey: undefined,
        manifestVersion: CLOUD_SYNC_MANIFEST_VERSION,
        syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    };
}

function createSnapshotKey(createdAt: number): string {
    return `${getSnapshotsPrefix()}/${createdAt}.json`;
}

function createOpsKey(
    deviceId: string,
    createdAt: number,
    firstOpId: number,
    lastOpId: number
): string {
    return `${OPS_PREFIX}/${deviceId}/ops/${createdAt}-${firstOpId}-${lastOpId}${OPS_OBJECT_SUFFIX}`;
}

/**
 * Provider-backed transport that stores sync artifacts as plain objects.
 */
export class ProviderCloudSyncTransport implements CloudSyncTransport {
    private readonly provider: CloudStorageProvider;

    public static create(
        provider: CloudStorageProvider
    ): ProviderCloudSyncTransport {
        return new ProviderCloudSyncTransport(provider);
    }

    public static createEmptyManifest(): CloudSyncManifest {
        return createEmptyManifest();
    }

    public static createSnapshot(
        createdAt: number,
        state: CloudSyncSnapshot["state"]
    ): CloudSyncSnapshot {
        return {
            createdAt,
            snapshotVersion: CLOUD_SYNC_SNAPSHOT_VERSION,
            state,
            syncSchemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
        };
    }

    public async appendOperations(
        deviceId: string,
        operations: readonly CloudSyncOperation[],
        createdAtEpochMs?: number
    ): Promise<CloudObjectEntry> {
        if (operations.length === 0) {
            throw new Error("appendOperations requires at least one operation");
        }

        assertValidDeviceId(deviceId);

        const createdAtCandidate = createdAtEpochMs ?? Date.now();
        if (
            !Number.isSafeInteger(createdAtCandidate) ||
            createdAtCandidate < 0
        ) {
            throw new Error(
                "createdAtEpochMs must be a non-negative safe integer"
            );
        }

        const createdAt = createdAtCandidate;
        const firstOpId = operations[0]?.opId ?? 0;
        const lastOpId = operations.at(-1)?.opId ?? firstOpId;

        return this.provider.uploadObject({
            buffer: encodeUtf8(toNdjson(operations)),
            key: createOpsKey(deviceId, createdAt, firstOpId, lastOpId),
            overwrite: false,
        });
    }

    public async deleteObject(key: string): Promise<void> {
        // Defense-in-depth: refuse to delete arbitrary provider keys.
        if (key === MANIFEST_KEY) {
            await this.provider.deleteObject(key);
            return;
        }

        if (key.endsWith(OPS_OBJECT_SUFFIX)) {
            assertOpsObjectKey(key);
            await this.provider.deleteObject(key);
            return;
        }

        if (key.endsWith(".json")) {
            assertSnapshotKey(key);
            await this.provider.deleteObject(key);
            return;
        }

        throw new Error(`Refusing to delete unexpected sync key: ${key}`);
    }

    public async listOperationObjects(): Promise<CloudObjectEntry[]> {
        const objects = await this.provider.listObjects(`${OPS_PREFIX}/`);
        return objects.filter((entry) => isValidOpsObjectKey(entry.key));
    }

    public async readManifest(): Promise<CloudSyncManifest | null> {
        try {
            const buffer = await this.provider.downloadObject(MANIFEST_KEY);
            const maxBytes = getMaxManifestBytes();
            if (buffer.byteLength > maxBytes) {
                throw new Error(
                    `Cloud sync manifest exceeds size limit (${maxBytes} bytes)`
                );
            }

            const raw = decodeUtf8(buffer);
            return parseCloudSyncManifest(JSON.parse(raw));
        } catch (error) {
            if (isProviderNotFoundError(error)) {
                return null;
            }

            // Treat an invalid/corrupt manifest as "missing" so sync can
            // recover by rebuilding remote state.
            if (
                isCloudSyncJsonValidationError(error) ||
                (error instanceof Error &&
                    error.message.includes(
                        "Cloud sync manifest exceeds size limit"
                    ))
            ) {
                const resolved = ensureError(error);
                logger.warn(
                    "[ProviderCloudSyncTransport] Remote manifest is invalid; treating as missing",
                    {
                        message: resolved.message,
                        name: resolved.name,
                    }
                );
                return null;
            }

            throw new Error("Failed to read cloud sync manifest", {
                cause: error,
            });
        }
    }

    public async readOperationsObject(
        key: string
    ): Promise<CloudSyncOperation[]> {
        assertOpsObjectKey(key);

        const buffer = await this.provider.downloadObject(key);

        const maxBytes = getMaxOpsObjectBytes();
        if (buffer.byteLength > maxBytes) {
            throw new CloudSyncCorruptRemoteObjectError(
                `Cloud sync operation object '${key}' exceeds size limit (${maxBytes} bytes)`,
                {
                    key,
                    kind: "operations",
                }
            );
        }

        const raw = decodeUtf8(buffer);
        return parseNdjsonOperations({
            key,
            maxLineChars: getMaxOpsLineChars(),
            maxLines: getMaxOpsObjectLines(),
            raw,
        });
    }

    public async readSnapshot(key: string): Promise<CloudSyncSnapshot> {
        assertSnapshotKey(key);
        try {
            const buffer = await this.provider.downloadObject(key);
            const maxBytes = getMaxSnapshotBytes();
            if (buffer.byteLength > maxBytes) {
                throw new Error(
                    `Cloud sync snapshot '${key}' exceeds size limit (${maxBytes} bytes)`
                );
            }

            const raw = decodeUtf8(buffer);
            return parseCloudSyncSnapshot(JSON.parse(raw));
        } catch (error) {
            if (
                isCloudSyncJsonValidationError(error) ||
                isCloudSyncSizeLimitError(error)
            ) {
                const resolved = ensureError(error);
                throw new CloudSyncCorruptRemoteObjectError(
                    `Cloud sync snapshot '${key}' is corrupt or invalid: ${resolved.message}`,
                    {
                        cause: error,
                        key,
                        kind: "snapshot",
                    }
                );
            }

            throw new Error(`Failed to read cloud sync snapshot '${key}'`, {
                cause: error,
            });
        }
    }

    public async writeManifest(manifest: CloudSyncManifest): Promise<void> {
        const json = JSON.stringify(manifest, null, 2);
        await this.provider.uploadObject({
            buffer: encodeUtf8(json),
            key: MANIFEST_KEY,
            overwrite: true,
        });
    }

    public async writeSnapshot(
        snapshot: CloudSyncSnapshot
    ): Promise<CloudObjectEntry> {
        const json = JSON.stringify(snapshot, null, 2);
        return this.provider.uploadObject({
            buffer: encodeUtf8(json),
            key: createSnapshotKey(snapshot.createdAt),
            overwrite: true,
        });
    }

    public constructor(provider: CloudStorageProvider) {
        this.provider = provider;
    }
}

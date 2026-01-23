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

/** Minimum hex chars used for snapshot nonce suffix. */
const SNAPSHOT_NONCE_HEX_CHARS = 32;

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

class CloudSyncSizeLimitError extends Error {
    public readonly maxBytes: number;

    public readonly actualBytes: number;

    public readonly objectKind: "manifest" | "snapshot";

    public constructor(args: {
        actualBytes: number;
        maxBytes: number;
        objectKind: "manifest" | "snapshot";
    }) {
        super(
            `Cloud sync ${args.objectKind} exceeds size limit of ${args.maxBytes} bytes. Actual: ${args.actualBytes} bytes.`
        );
        this.name = "CloudSyncSizeLimitError";
        this.actualBytes = args.actualBytes;
        this.maxBytes = args.maxBytes;
        this.objectKind = args.objectKind;
    }
}

function isCloudSyncSizeLimitError(error: unknown): boolean {
    return ensureError(error) instanceof CloudSyncSizeLimitError;
}

function getSnapshotsPrefix(): string {
    return `sync/snapshots/${CLOUD_SYNC_SCHEMA_VERSION}`;
}

function encodeUtf8(value: string): Buffer {
    return Buffer.from(value, "utf8");
}

const utfEightDecoder = new TextDecoder("utf-8", { fatal: true });

function decodeUtfEightStrict(buffer: Buffer): string {
    // Node's Buffer#toString('utf8') is permissive and will replace invalid
    // byte sequences. For sync artifacts, permissive decoding can mask remote
    // corruption and lead to hard-to-diagnose state issues.
    return utfEightDecoder.decode(buffer);
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
    // Expected:
    // - legacy: sync/snapshots/<schemaVersion>/<createdAt>.json
    // - v2:     sync/snapshots/<schemaVersion>/<createdAt>-<nonceHex>.json
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

    const [
        createdAtRaw,
        nonceRaw,
        ...rest
    ] = stem.split("-");
    if (!createdAtRaw || rest.length > 0) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    if (!isAsciiDigits(createdAtRaw)) {
        throw new Error(`Invalid snapshot key: ${key}`);
    }

    if (nonceRaw !== undefined) {
        const normalized = nonceRaw.toLowerCase();
        if (normalized.length !== SNAPSHOT_NONCE_HEX_CHARS) {
            throw new Error(`Invalid snapshot key: ${key}`);
        }

        // Keep this strict: the suffix is an internal nonce used for
        // collision avoidance and should be ASCII hex.
        for (const char of normalized) {
            const codePoint = char.codePointAt(0);
            if (codePoint === undefined) {
                throw new Error(`Invalid snapshot key: ${key}`);
            }

            const isDigit = codePoint >= 48 && codePoint <= 57;
            const isHexLower = codePoint >= 97 && codePoint <= 102;
            if (!isDigit && !isHexLower) {
                throw new Error(`Invalid snapshot key: ${key}`);
            }
        }
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

function parseOpsKeyExpectations(key: string): {
    createdAt: number;
    deviceId: string;
    firstOpId: number;
    lastOpId: number;
} {
    // Key is already validated by assertOpsObjectKey.
    const segments = key.split("/");
    const deviceId = segments[2] ?? "";
    const fileName = segments[4] ?? "";

    const parsed = parseOpsObjectFileNameMetadata(fileName);
    if (!parsed) {
        throw new Error(`Invalid sync operations object key filename: ${key}`);
    }

    return {
        createdAt: parsed.createdAt,
        deviceId,
        firstOpId: parsed.firstOpId,
        lastOpId: parsed.lastOpId,
    };
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

function createSnapshotNonceHex(): string {
    if (typeof globalThis.crypto.randomUUID !== "function") {
        throw new TypeError("crypto.randomUUID is unavailable");
    }

    // RandomUUID is RFC4122 (hex + dashes). Remove dashes to get 32 hex chars.
    return globalThis.crypto.randomUUID().replaceAll("-", "");
}

function createSnapshotKey(createdAt: number): string {
    const nonceHex = createSnapshotNonceHex();
    return `${getSnapshotsPrefix()}/${createdAt}-${nonceHex}.json`;
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

    /**
     * Returns true if the key represents a cloud-sync object that this transport
     * is willing to delete.
     *
     * @remarks
     * This is intended for maintenance operations (e.g. remote sync reset) that
     * may enumerate provider keys in bulk. Using this helper avoids relying on
     * string-matching error messages from {@link deleteObject}.
     */
    public static isDeletableSyncKey(key: string): boolean {
        try {
            if (key === MANIFEST_KEY) {
                return true;
            }

            if (key.endsWith(OPS_OBJECT_SUFFIX)) {
                assertOpsObjectKey(key);
                return true;
            }

            if (key.endsWith(".json")) {
                assertSnapshotKey(key);
                return true;
            }

            return false;
        } catch {
            return false;
        }
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

        let minOpId = Number.POSITIVE_INFINITY;
        let maxOpId = Number.NEGATIVE_INFINITY;
        for (const op of operations) {
            if (op.deviceId !== deviceId) {
                throw new Error(
                    "appendOperations requires all operations to match the supplied deviceId"
                );
            }

            minOpId = Math.min(minOpId, op.opId);
            maxOpId = Math.max(maxOpId, op.opId);
        }

        if (!Number.isFinite(minOpId) || !Number.isFinite(maxOpId)) {
            throw new TypeError(
                "appendOperations internal error (missing op ids)"
            );
        }

        const firstOpId = minOpId;
        const lastOpId = maxOpId;

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
        const filtered = objects.filter((entry) =>
            isValidOpsObjectKey(entry.key)
        );

        // Providers may return keys in arbitrary order or even duplicate keys.
        // Deduplicate by key and sort deterministically.
        const byKey = new Map<string, CloudObjectEntry>();
        for (const entry of filtered) {
            // Keep the newest metadata if duplicates exist.
            const existing = byKey.get(entry.key);
            if (!existing || entry.lastModifiedAt > existing.lastModifiedAt) {
                byKey.set(entry.key, entry);
            }
        }

        return Array.from(byKey.values()).toSorted((a, b) =>
            a.key.localeCompare(b.key)
        );
    }

    public async readManifest(): Promise<CloudSyncManifest | null> {
        try {
            const buffer = await this.provider.downloadObject(MANIFEST_KEY);
            const maxBytes = getMaxManifestBytes();
            if (buffer.byteLength > maxBytes) {
                throw new CloudSyncSizeLimitError({
                    actualBytes: buffer.byteLength,
                    maxBytes,
                    objectKind: "manifest",
                });
            }

            const rawOrNull = ((): null | string => {
                try {
                    return decodeUtfEightStrict(buffer);
                } catch (error) {
                    // Treat invalid UTF-8 as a corrupt manifest. We
                    // intentionally recover by treating the manifest as
                    // missing.
                    const resolved = ensureError(error);
                    logger.warn(
                        "[ProviderCloudSyncTransport] Remote manifest contains invalid UTF-8; treating as missing",
                        {
                            message: resolved.message,
                            name: resolved.name,
                        }
                    );
                    return null;
                }
            })();

            if (rawOrNull === null) {
                return null;
            }

            return parseCloudSyncManifest(JSON.parse(rawOrNull));
        } catch (error) {
            if (isProviderNotFoundError(error)) {
                return null;
            }

            // Treat an invalid/corrupt manifest as "missing" so sync can
            // recover by rebuilding remote state.
            if (
                isCloudSyncJsonValidationError(error) ||
                isCloudSyncSizeLimitError(error)
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

        const expectations = parseOpsKeyExpectations(key);

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

        const raw = ((): string => {
            try {
                return decodeUtfEightStrict(buffer);
            } catch (error: unknown) {
                const resolved = ensureError(error);
                throw new CloudSyncCorruptRemoteObjectError(
                    `Cloud sync operation object '${key}' contains invalid UTF-8: ${resolved.message}`,
                    {
                        cause: error,
                        key,
                        kind: "operations",
                    }
                );
            }
        })();

        const operations = parseNdjsonOperations({
            key,
            maxLineChars: getMaxOpsLineChars(),
            maxLines: getMaxOpsObjectLines(),
            raw,
        });

        if (operations.length === 0) {
            throw new CloudSyncCorruptRemoteObjectError(
                `Cloud sync operation object '${key}' is empty`,
                {
                    key,
                    kind: "operations",
                }
            );
        }

        let actualMinOpId = Number.POSITIVE_INFINITY;
        let actualMaxOpId = Number.NEGATIVE_INFINITY;
        for (const op of operations) {
            if (op.deviceId !== expectations.deviceId) {
                throw new CloudSyncCorruptRemoteObjectError(
                    `Cloud sync operation object '${key}' contains operations for unexpected deviceId '${op.deviceId}'`,
                    {
                        key,
                        kind: "operations",
                    }
                );
            }

            actualMinOpId = Math.min(actualMinOpId, op.opId);
            actualMaxOpId = Math.max(actualMaxOpId, op.opId);
        }

        if (
            actualMinOpId < expectations.firstOpId ||
            actualMaxOpId > expectations.lastOpId
        ) {
            throw new CloudSyncCorruptRemoteObjectError(
                `Cloud sync operation object '${key}' opId range is inconsistent with key metadata`,
                {
                    key,
                    kind: "operations",
                }
            );
        }

        return operations;
    }

    public async readSnapshot(key: string): Promise<CloudSyncSnapshot> {
        assertSnapshotKey(key);
        try {
            const buffer = await this.provider.downloadObject(key);
            const maxBytes = getMaxSnapshotBytes();
            if (buffer.byteLength > maxBytes) {
                throw new CloudSyncSizeLimitError({
                    actualBytes: buffer.byteLength,
                    maxBytes,
                    objectKind: "snapshot",
                });
            }

            const raw = ((): string => {
                try {
                    return decodeUtfEightStrict(buffer);
                } catch (error: unknown) {
                    const resolved = ensureError(error);
                    throw new CloudSyncCorruptRemoteObjectError(
                        `Cloud sync snapshot '${key}' contains invalid UTF-8: ${resolved.message}`,
                        {
                            cause: error,
                            key,
                            kind: "snapshot",
                        }
                    );
                }
            })();

            return parseCloudSyncSnapshot(JSON.parse(raw));
        } catch (error) {
            if (
                ensureError(error) instanceof CloudSyncCorruptRemoteObjectError
            ) {
                throw error;
            }

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
            overwrite: false,
        });
    }

    public constructor(provider: CloudStorageProvider) {
        this.provider = provider;
    }
}

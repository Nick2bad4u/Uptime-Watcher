import type { Site } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { ConfigurationManager } from "../../managers/ConfigurationManager";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { DatabaseRestorePayload } from "../database/utils/backup/databaseBackup";
import type { DatabaseServiceFactory } from "../factories/DatabaseServiceFactory";

/**
 * Dependencies required by database commands.
 *
 * @remarks
 * Database commands are designed to support two construction patterns:
 *
 * 1. **Explicit arguments**: `(serviceFactory, eventEmitter, cache, ...)`
 * 2. **Context object**: `({ serviceFactory, eventEmitter, cache, ... })`
 *
 * This interface centralizes the context contract and enables shared runtime
 * narrowing helpers.
 *
 * @public
 */
export interface DatabaseCommandContext {
    /** Site cache used for synchronization during operations. */
    cache: StandardizedCache<Site>;
    /** Optional configuration manager used for validation flows. */
    configurationManager?: ConfigurationManager | undefined;
    /** Event bus for emitting command execution events. */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Factory for creating database services/repositories. */
    serviceFactory: DatabaseServiceFactory;
    /** Optional history-limit updater for settings propagation. */
    updateHistoryLimit?: ((limit: number) => Promise<void>) | undefined;
}

/**
 * Runtime type guard for {@link DatabaseCommandContext}.
 */
export function isDatabaseCommandContext(
    value: unknown
): value is DatabaseCommandContext {
    if (value === null || typeof value !== "object") {
        return false;
    }

    return (
        "serviceFactory" in value && "eventEmitter" in value && "cache" in value
    );
}

/**
 * Normalizes the supported constructor patterns into a context object.
 */
export function resolveDatabaseCommandContext(
    value: DatabaseCommandContext | DatabaseServiceFactory,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    cache?: StandardizedCache<Site>
): DatabaseCommandContext {
    if (isDatabaseCommandContext(value)) {
        return value;
    }

    if (!eventEmitter || !cache) {
        throw new TypeError(
            "DatabaseCommand requires eventEmitter and cache when a context object is not provided."
        );
    }

    return {
        cache,
        eventEmitter,
        serviceFactory: value,
    };
}

/**
 * Narrows to an import context (context object plus `data`).
 */
export function isImportContext(
    value: unknown
): value is DatabaseCommandContext & { data: string } {
    if (!isDatabaseCommandContext(value)) {
        return false;
    }

    const data: unknown = Reflect.get(value, "data");
    return typeof data === "string";
}

/**
 * Narrows to a restore context (context object plus `payload`).
 */
export function isRestoreContext(
    value: unknown
): value is DatabaseCommandContext & { payload: DatabaseRestorePayload } {
    if (!isDatabaseCommandContext(value)) {
        return false;
    }

    const payload: unknown = Reflect.get(value, "payload");
    if (payload === null || typeof payload !== "object") {
        return false;
    }

    return Buffer.isBuffer(Reflect.get(payload, "buffer"));
}

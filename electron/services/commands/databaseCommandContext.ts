import type { Site } from "@shared/types";

import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { castUnchecked } from "@shared/utils/typeHelpers";
import { isObject } from "@shared/utils/typeGuards";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { ConfigurationManager } from "../../managers/ConfigurationManager";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { DatabaseRestorePayload } from "../database/utils/backup/databaseBackup";
import type { DatabaseCommandServiceFactory } from "../factories/DatabaseServiceFactory";

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
    serviceFactory: DatabaseCommandServiceFactory;
    /** Optional history-limit updater for settings propagation. */
    updateHistoryLimit?: ((limit: number) => Promise<void>) | undefined;
}

/**
 * Runtime type guard for {@link DatabaseCommandContext}.
 */
function isDatabaseCommandContext(
    value: unknown
): value is DatabaseCommandContext {
    if (!isObject(value)) {
        return false;
    }

    return (
        getOwnDataProperty(value, "serviceFactory").found &&
        getOwnDataProperty(value, "eventEmitter").found &&
        getOwnDataProperty(value, "cache").found
    );
}

function getRequiredContextProperty(
    context: DatabaseCommandContext,
    key: keyof DatabaseCommandContext
): unknown {
    const property = getOwnDataProperty(context, key);
    if (!property.found) {
        throw new TypeError(`Database command context is missing ${key}.`);
    }

    return property.value;
}

function getOptionalContextProperty(
    context: DatabaseCommandContext,
    key: keyof DatabaseCommandContext
): unknown {
    const property = getOwnDataProperty(context, key);
    return property.found ? property.value : undefined;
}

function normalizeDatabaseCommandContext(
    context: DatabaseCommandContext
): DatabaseCommandContext {
    return {
        cache: castUnchecked<StandardizedCache<Site>>(
            getRequiredContextProperty(context, "cache")
        ),
        configurationManager: castUnchecked<ConfigurationManager | undefined>(
            getOptionalContextProperty(context, "configurationManager")
        ),
        eventEmitter: castUnchecked<TypedEventBus<UptimeEvents>>(
            getRequiredContextProperty(context, "eventEmitter")
        ),
        serviceFactory: castUnchecked<DatabaseCommandServiceFactory>(
            getRequiredContextProperty(context, "serviceFactory")
        ),
        updateHistoryLimit: castUnchecked<
            ((limit: number) => Promise<void>) | undefined
        >(getOptionalContextProperty(context, "updateHistoryLimit")),
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

    const data = getOwnDataProperty(value, "data");
    return data.found && typeof data.value === "string";
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

    const payloadProperty = getOwnDataProperty(value, "payload");
    if (!payloadProperty.found) {
        return false;
    }

    const { value: payload } = payloadProperty;
    if (payload === null || typeof payload !== "object") {
        return false;
    }

    const buffer = getOwnDataProperty(payload, "buffer");
    return buffer.found && Buffer.isBuffer(buffer.value);
}

/**
 * Normalizes the supported constructor patterns into a context object.
 */
export function resolveDatabaseCommandContext(
    value: DatabaseCommandContext | DatabaseCommandServiceFactory,
    eventEmitter?: TypedEventBus<UptimeEvents>,
    cache?: StandardizedCache<Site>
): DatabaseCommandContext {
    if (isDatabaseCommandContext(value)) {
        return normalizeDatabaseCommandContext(value);
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

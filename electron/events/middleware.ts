/**
 * Pre-built middleware functions for the TypedEventBus event system.
 *
 * @remarks
 * The helpers in this file are used by the Electron main-process event bus but
 * remain generic so they can be reused anywhere a strongly typed middleware
 * chain is required.
 */

import type { UnknownRecord } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { collectOwnPropertyValuesSafely } from "@shared/utils/objectIntrospection";
import { createNullPrototypeObject } from "@shared/utils/objectSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { isDefined, isPresent } from "ts-extras";

import type {
    EventKey,
    EventMiddleware,
    EventPayloadValue,
    TypedEventMap,
} from "./TypedEventBus";

import { logger as baseLogger } from "../utils/logger";
import { tryStructuredClone } from "./utils/structuredClone";

const EVENT_EMITTED_MSG = "[EventBus] Event emitted";
const NON_SERIALIZABLE_PLACEHOLDER = "[Unserializable object]" as const;

type CloneableValue = object;

const isCloneableValue = (value: unknown): value is CloneableValue =>
    typeof value === "object" && value !== null;

const collectCloneableEntries = collectOwnPropertyValuesSafely;

const hasCircularReference = (
    value: CloneableValue,
    seen = new WeakSet<object>()
): boolean => {
    if (seen.has(value)) {
        return true;
    }

    seen.add(value);

    for (const entry of collectCloneableEntries(value)) {
        if (isCloneableValue(entry) && hasCircularReference(entry, seen)) {
            seen.delete(value);
            return true;
        }
    }

    seen.delete(value);
    return false;
};

const cloneObjectForLogging = (
    value: CloneableValue,
    clones = new WeakMap<object, unknown>(),
    stack = new WeakSet<object>()
): unknown => {
    const target = value;
    if (stack.has(target)) {
        throw new TypeError("circular reference detected");
    }

    if (clones.has(target)) {
        return clones.get(target);
    }

    stack.add(target);

    if (Array.isArray(value)) {
        const clonedArray: unknown[] = [];
        clones.set(target, clonedArray);

        for (const key of Reflect.ownKeys(value)) {
            if (key === "length") {
                continue;
            }

            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (!descriptor?.enumerable || !("value" in descriptor)) {
                continue;
            }

            const entry = descriptor.value as unknown;
            Object.defineProperty(clonedArray, key, {
                configurable: true,
                enumerable: true,
                value: isCloneableValue(entry)
                    ? cloneObjectForLogging(entry, clones, stack)
                    : entry,
                writable: true,
            });
        }

        stack.delete(target);
        return clonedArray;
    }

    const clonedObject = createNullPrototypeObject<UnknownRecord>();
    clones.set(target, clonedObject);

    for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (!descriptor?.enumerable || !("value" in descriptor)) {
            continue;
        }

        const propertyValue = descriptor.value as unknown;
        const normalizedValue = isCloneableValue(propertyValue)
            ? cloneObjectForLogging(propertyValue, clones, stack)
            : propertyValue;
        Object.defineProperty(clonedObject, key, {
            configurable: true,
            enumerable: true,
            value: normalizedValue,
            writable: true,
        });
    }

    stack.delete(target);
    return clonedObject;
};

/**
 * Safely serializes a value for logging purposes.
 *
 * @internal
 */
function safeSerialize(data: unknown): string {
    if (!isPresent(data)) {
        return "";
    }

    if (typeof data === "string") {
        return data;
    }

    if (typeof data === "number" || typeof data === "boolean") {
        return String(data);
    }

    if (typeof data === "bigint") {
        return String(data);
    }

    if (typeof data === "symbol") {
        return String(data);
    }

    if (typeof data === "function") {
        return data.name ? `[Function: ${data.name}]` : "[Function]";
    }

    if (Array.isArray(data) || typeof data === "object") {
        try {
            const serializableData = isCloneableValue(data)
                ? cloneObjectForLogging(data)
                : data;
            return JSON.stringify(serializableData);
        } catch (error) {
            const message = getUserFacingErrorDetail(error);
            return `${NON_SERIALIZABLE_PLACEHOLDER}: ${message}`;
        }
    }

    return "[Unsupported value]";
}

const formatLoggableData = (data: unknown): unknown => {
    if (!isPresent(data)) {
        return data;
    }

    const dataType = typeof data;
    if (
        dataType === "string" ||
        dataType === "number" ||
        dataType === "boolean"
    ) {
        return data;
    }

    if (dataType === "bigint" || dataType === "symbol") {
        return safeSerialize(data);
    }

    if (dataType === "function") {
        return data;
    }

    if (dataType === "object") {
        if (!isCloneableValue(data)) {
            return safeSerialize(data);
        }

        if (hasCircularReference(data)) {
            return safeSerialize(data);
        }

        try {
            return cloneObjectForLogging(data);
        } catch {
            const cloned = tryStructuredClone(data);
            if (isDefined(cloned)) {
                return cloned;
            }
            return safeSerialize(data);
        }
    }

    return safeSerialize(data);
};

/**
 * Captures middleware errors and optionally continues execution.
 */
export function createErrorHandlingMiddleware<
    EventMap extends TypedEventMap = Record<string, EventPayloadValue>,
>(
    options: {
        continueOnError?: boolean;
        onError?: (
            error: Error,
            context: {
                data: EventMap[EventKey<EventMap>];
                event: EventKey<EventMap>;
            }
        ) => void;
    } = {}
): EventMiddleware<EventMap> {
    const { continueOnError = true, onError } = options;

    return (event, data, next) => {
        const typedEvent = event as EventKey<EventMap>;
        const typedData = data as EventMap[typeof typedEvent];
        const proceed = next;

        return (async (): Promise<void> => {
            try {
                await proceed();
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                const errorContext = {
                    data: formatLoggableData(typedData),
                    event: typedEvent,
                    serializedData: safeSerialize(data),
                };

                baseLogger.error(
                    `[EventBus] Error in event '${typedEvent}': ${normalizedError.message}`,
                    normalizedError,
                    errorContext
                );

                onError?.(normalizedError, {
                    data: typedData,
                    event: typedEvent,
                });

                if (!continueOnError) {
                    throw normalizedError;
                }
            }
        })();
    };
}

/**
 * Logs every event with optional payload serialization.
 */
export function createLoggingMiddleware<
    EventMap extends TypedEventMap = Record<string, EventPayloadValue>,
>(
    options: {
        filter?: (eventName: EventKey<EventMap>) => boolean;
        includeData?: boolean;
        level?:
            | "debug"
            | "error"
            | "info"
            | "warn";
    } = {}
): EventMiddleware<EventMap> {
    const { filter, includeData = false, level = "info" } = options;

    return (event, data, next) => {
        const typedEvent = event as EventKey<EventMap>;
        if (filter && !filter(typedEvent)) {
            return next();
        }

        const logData = includeData
            ? {
                  data: formatLoggableData(data),
                  event: typedEvent,
              }
            : { event: typedEvent };

        const loggerByLevel = {
            debug: baseLogger.debug.bind(baseLogger),
            error: baseLogger.error.bind(baseLogger),
            info: baseLogger.info.bind(baseLogger),
            warn: baseLogger.warn.bind(baseLogger),
        } as const;

        const logMethod = loggerByLevel[level];

        logMethod(EVENT_EMITTED_MSG, logData);

        return next();
    };
}

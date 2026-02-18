/**
 * Pre-built middleware functions and helpers for the TypedEventBus event
 * system.
 *
 * @remarks
 * Every middleware exported from this module is fully typed and can be composed
 * safely via {@link composeMiddleware}. The helpers in this file are used by the
 * Electron main-process event bus but remain generic so they can be reused
 * anywhere a strongly typed middleware chain is required.
 */

import type { UnknownRecord } from "type-fest";

import { isDevelopment } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";
import { collectOwnPropertyValuesSafely } from "@shared/utils/objectIntrospection";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { EventKey, EventMiddleware, TypedEventMap } from "./TypedEventBus";

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

        for (const entry of value) {
            if (isCloneableValue(entry)) {
                clonedArray.push(cloneObjectForLogging(entry, clones, stack));
            } else {
                clonedArray.push(entry);
            }
        }

        stack.delete(target);
        return clonedArray;
    }

    const clonedObject: UnknownRecord = {};
    clones.set(target, clonedObject);

    for (const key of Reflect.ownKeys(value)) {
        try {
            const propertyValue: unknown = Reflect.get(value, key);
            const normalizedValue = isCloneableValue(propertyValue)
                ? cloneObjectForLogging(propertyValue, clones, stack)
                : propertyValue;
            Reflect.set(clonedObject, key, normalizedValue);
        } catch {
            Reflect.set(clonedObject, key, undefined);
        }
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
    if (data === null || data === undefined) {
        return "";
    }

    if (typeof data === "string") {
        return data;
    }

    if (typeof data === "number" || typeof data === "boolean") {
        return String(data);
    }

    if (typeof data === "bigint") {
        return data.toString();
    }

    if (typeof data === "symbol") {
        return data.toString();
    }

    if (typeof data === "function") {
        return data.name ? `[Function: ${data.name}]` : "[Function]";
    }

    if (Array.isArray(data) || typeof data === "object") {
        try {
            return JSON.stringify(data);
        } catch (error) {
            const message = getUserFacingErrorDetail(error);
            return `${NON_SERIALIZABLE_PLACEHOLDER}: ${message}`;
        }
    }

    return "[Unsupported value]";
}

const formatLoggableData = (data: unknown): unknown => {
    if (data === null || data === undefined) {
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
            if (cloned !== undefined) {
                return cloned;
            }
            return safeSerialize(data);
        }
    }

    return safeSerialize(data);
};

/**
 * Callback invoked when metrics middleware tracks a counter or timing event.
 */
type MetricsCallback<EventName extends string = string> = (metric: {
    event: EventName;
    name: string;
    type: "counter" | "timing";
    value: number;
}) => void;

const trackEventCount = <EventName extends string>(
    event: EventName,
    eventCounts: Map<EventName, number>,
    metricsCallback?: MetricsCallback<EventName>
): void => {
    const count = eventCounts.get(event) ?? 0;
    const newCount = count + 1;
    eventCounts.set(event, newCount);

    metricsCallback?.({
        event,
        name: `events.${event}.count`,
        type: "counter",
        value: newCount,
    });
};

const trackEventTiming = <EventName extends string>(
    event: EventName,
    duration: number,
    eventTimings: Map<EventName, number[]>,
    metricsCallback?: MetricsCallback<EventName>
): void => {
    const timings = eventTimings.get(event) ?? [];
    timings.push(duration);
    eventTimings.set(event, timings);

    metricsCallback?.({
        event,
        name: `events.${event}.duration`,
        type: "timing",
        value: duration,
    });
};

/** Reason emitted by the rate limit middleware when throttling an event. */
type RateLimitReason = "burst" | "rate";

/** Structured context supplied to rate-limit callbacks. */
interface RateLimitContext<EventMap extends TypedEventMap> {
    data: EventMap[EventKey<EventMap>];
    event: EventKey<EventMap>;
    reason: RateLimitReason;
}

/** Function invoked whenever the rate limit middleware throttles an event. */
type RateLimitCallback<EventMap extends TypedEventMap> = (
    context: RateLimitContext<EventMap>
) => void;

/** Standard validation result returned by validator functions. */
type ValidationResult = boolean | { error?: string; isValid: boolean };

type ValidatorFunction<TData> = (data: TData) => ValidationResult;

type ValidatorMap<EventMap extends TypedEventMap> = Partial<{
    [K in EventKey<EventMap>]: ValidatorFunction<EventMap[K]>;
}>;

/* eslint-disable etc/no-misused-generics -- Middleware factories allow explicit type arguments but cannot infer generics from their parameter lists by design. */
/** Middleware stack helpers exposed to consumers. */
export interface MiddlewareStacks {
    custom: <EventMap extends TypedEventMap>(
        middlewares: Array<EventMiddleware<EventMap>>
    ) => EventMiddleware<EventMap>;
    development: <
        EventMap extends TypedEventMap = TypedEventMap,
    >() => EventMiddleware<EventMap>;
    production: <
        EventMap extends TypedEventMap = TypedEventMap,
    >() => EventMiddleware<EventMap>;
    testing: <
        EventMap extends TypedEventMap = TypedEventMap,
    >() => EventMiddleware<EventMap>;
}

/**
 * Composes multiple {@link EventMiddleware} functions into a single chain.
 */
export function composeMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(...middlewares: Array<EventMiddleware<EventMap>>): EventMiddleware<EventMap> {
    return (event, data, next) => {
        let index = 0;

        const processNext = (): Promise<void> => {
            if (index >= middlewares.length) {
                return Promise.resolve(next());
            }

            const middleware = middlewares[index];
            index += 1;

            if (!middleware) {
                return processNext();
            }

            return Promise.resolve(middleware(event, data, processNext));
        };

        return processNext();
    };
}

/**
 * Emits detailed debug logs for every event when enabled.
 */
export function createDebugMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(
    options: { enabled?: boolean; verbose?: boolean } = {}
): EventMiddleware<EventMap> {
    const { enabled = isDevelopment(), verbose = false } = options;

    return (event, data, next) => {
        if (!enabled) {
            return next();
        }

        const typedEvent = event as EventKey<EventMap>;
        const startTime = Date.now();

        const processingContext = {
            event: typedEvent,
            ...(verbose
                ? {
                      data: formatLoggableData(data),
                      serializedData: safeSerialize(data),
                  }
                : undefined),
            timestamp: startTime,
        };

        baseLogger.debug(
            `[EventBus:Debug] Processing event '${typedEvent}'`,
            processingContext
        );

        const proceed = next;

        return (async (): Promise<void> => {
            await proceed();
            const duration = Date.now() - startTime;
            baseLogger.debug(
                `[EventBus:Debug] Completed event '${typedEvent}' in ${duration}ms`
            );
        })();
    };
}

/**
 * Captures middleware errors and optionally continues execution.
 */
export function createErrorHandlingMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
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
 * Filters events using allow/block lists or a custom predicate.
 */
export function createFilterMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(
    options: {
        allowList?: Array<EventKey<EventMap>>;
        blockList?: Array<EventKey<EventMap>>;
        condition?: <K extends EventKey<EventMap>>(
            event: K,
            data: EventMap[K]
        ) => boolean;
    } = {}
): EventMiddleware<EventMap> {
    const { allowList, blockList, condition } = options;

    return (event, data, next) => {
        const typedEvent = event as EventKey<EventMap>;

        if (allowList && !allowList.includes(typedEvent)) {
            baseLogger.debug(
                `[EventBus] Event '${typedEvent}' blocked by allow list`
            );
            return Promise.resolve();
        }

        if (blockList?.includes(typedEvent)) {
            baseLogger.debug(
                `[EventBus] Event '${typedEvent}' blocked by block list`
            );
            return Promise.resolve();
        }

        if (
            condition &&
            !condition(typedEvent, data as EventMap[typeof typedEvent])
        ) {
            baseLogger.debug(
                `[EventBus] Event '${typedEvent}' blocked by custom condition`
            );
            return Promise.resolve();
        }

        return next();
    };
}

/**
 * Logs every event with optional payload serialization.
 */
export function createLoggingMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(
    options: {
        filter?: (eventName: EventKey<EventMap>) => boolean;
        includeData?: boolean;
        level?: "debug" | "error" | "info" | "warn";
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

/**
 * Tracks event counts and timing information for observability.
 */
export function createMetricsMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(
    options: {
        metricsCallback?: MetricsCallback<EventKey<EventMap>>;
        trackCounts?: boolean;
        trackTiming?: boolean;
    } = {}
): EventMiddleware<EventMap> {
    const { metricsCallback, trackCounts = true, trackTiming = true } = options;
    const eventCounts = new Map<EventKey<EventMap>, number>();
    const eventTimings = new Map<EventKey<EventMap>, number[]>();

    return (event, _data, next) => {
        const typedEvent = event as EventKey<EventMap>;
        const startTime = Date.now();

        if (trackCounts) {
            trackEventCount(typedEvent, eventCounts, metricsCallback);
        }

        const proceed = next;

        return (async (): Promise<void> => {
            await proceed();
            if (trackTiming) {
                const duration = Date.now() - startTime;
                trackEventTiming(
                    typedEvent,
                    duration,
                    eventTimings,
                    metricsCallback
                );
            }
        })();
    };
}

/**
 * Throttles high-frequency events using burst and sustained-rate limits.
 */
export function createRateLimitMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(
    options: {
        burstLimit?: number;
        maxEventsPerSecond?: number;
        onRateLimit?: RateLimitCallback<EventMap>;
    } = {}
): EventMiddleware<EventMap> {
    const { burstLimit = 10, maxEventsPerSecond = 100, onRateLimit } = options;
    const burstWindows = new Map<EventKey<EventMap>, number[]>();
    const perSecondCounts = new Map<string, number>();

    return (event, data, next) => {
        const typedEvent = event as EventKey<EventMap>;
        const payload = data as EventMap[typeof typedEvent];
        const now = Date.now();
        const windowStart = now - 1000;

        const timestamps = burstWindows.get(typedEvent) ?? [];
        const recent = timestamps.filter(
            (timestamp) => timestamp >= windowStart
        );

        if (recent.length >= burstLimit) {
            baseLogger.warn(
                `[EventBus] Rate limit exceeded for event '${event}' (burst limit: ${burstLimit})`
            );
            onRateLimit?.({
                data: payload,
                event: typedEvent,
                reason: "burst",
            });
            return Promise.resolve();
        }

        const bucket = Math.floor(now / 1000);
        const bucketKey = `${typedEvent}:${bucket}`;
        const count = (perSecondCounts.get(bucketKey) ?? 0) + 1;
        perSecondCounts.set(bucketKey, count);
        perSecondCounts.delete(`${typedEvent}:${bucket - 2}`);

        if (count > maxEventsPerSecond) {
            baseLogger.warn(
                `[EventBus] Rate limit exceeded for event '${event}' (rate limit: ${maxEventsPerSecond}/sec)`
            );
            onRateLimit?.({ data: payload, event: typedEvent, reason: "rate" });
            return Promise.resolve();
        }

        recent.push(now);
        burstWindows.set(typedEvent, recent);

        return next();
    };
}

/**
 * Validates event payloads before they reach business logic handlers.
 */
export function createValidationMiddleware<
    EventMap extends TypedEventMap = TypedEventMap,
>(validators: ValidatorMap<EventMap>): EventMiddleware<EventMap> {
    return (event, data, next) => {
        const typedEvent = event as EventKey<EventMap>;
        const validator = validators[typedEvent];
        if (!validator) {
            return next();
        }

        const proceed = next;
        const payload = data as EventMap[typeof typedEvent];

        return (async (): Promise<void> => {
            try {
                const result = validator(payload);
                const normalized =
                    typeof result === "boolean"
                        ? {
                              error: result ? undefined : "Validation failed",
                              isValid: result,
                          }
                        : result;

                if (!normalized.isValid) {
                    const details = normalized.error ?? "Validation failed";
                    baseLogger.error(
                        `[EventBus] Validation failed for event '${event}': ${details}`,
                        {
                            data: formatLoggableData(payload),
                            event,
                            serializedData: safeSerialize(payload),
                        }
                    );
                    throw new TypeError(
                        `Validation failed for event '${event}': ${details}`
                    );
                }

                await proceed();
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                baseLogger.error(
                    `[EventBus] Validator threw error for event '${event}'`,
                    normalizedError,
                    {
                        data: formatLoggableData(data),
                        event,
                        serializedData: safeSerialize(data),
                    }
                );
                throw normalizedError;
            }
        })();
    };
}

/**
 * Preconfigured middleware stacks for common environments.
 */
const createCustomStack = <EventMap extends TypedEventMap>(
    middlewares: Array<EventMiddleware<EventMap>>
): EventMiddleware<EventMap> => composeMiddleware<EventMap>(...middlewares);

function createDevelopmentStack<
    EventMap extends TypedEventMap = TypedEventMap,
>(): EventMiddleware<EventMap> {
    return composeMiddleware<EventMap>(
        createErrorHandlingMiddleware<EventMap>({ continueOnError: true }),
        createDebugMiddleware<EventMap>({ enabled: true, verbose: true }),
        createLoggingMiddleware<EventMap>({
            includeData: true,
            level: "debug",
        })
    );
}

function createProductionStack<
    EventMap extends TypedEventMap = TypedEventMap,
>(): EventMiddleware<EventMap> {
    return composeMiddleware<EventMap>(
        createErrorHandlingMiddleware<EventMap>({ continueOnError: true }),
        createRateLimitMiddleware<EventMap>({
            burstLimit: 5,
            maxEventsPerSecond: 50,
        }),
        createMetricsMiddleware<EventMap>({
            trackCounts: true,
            trackTiming: true,
        }),
        createLoggingMiddleware<EventMap>({
            includeData: false,
            level: "info",
        })
    );
}

function createTestingStack<
    EventMap extends TypedEventMap = TypedEventMap,
>(): EventMiddleware<EventMap> {
    return composeMiddleware<EventMap>(
        createErrorHandlingMiddleware<EventMap>({ continueOnError: false }),
        createLoggingMiddleware<EventMap>({
            includeData: false,
            level: "warn",
        })
    );
}

export const MIDDLEWARE_STACKS: MiddlewareStacks = {
    custom: createCustomStack,
    development: createDevelopmentStack,
    production: createProductionStack,
    testing: createTestingStack,
};
/* eslint-enable etc/no-misused-generics -- Restore default linting after middleware factories */

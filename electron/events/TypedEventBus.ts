/**
 * Type-safe event bus with middleware support and debugging capabilities.
 *
 * @remarks
 * Enhances the standard Node.js EventEmitter with compile-time type safety
 * while preserving rich debugging capabilities.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "../utils/logger";
 *
 * interface MyEvents {
 *     "user:login": { userId: string; timestamp: number };
 *     "data:updated": { table: string; records: number };
 * }
 *
 * const bus = new TypedEventBus<MyEvents>("app-events");
 * bus.onTyped("user:login", (data) => {
 *     logger.info("User login", data);
 * });
 * await bus.emitTyped("user:login", {
 *     userId: "123",
 *     timestamp: Date.now(),
 * });
 * ```
 *
 * @packageDocumentation
 */

import type { EventMetadata } from "@shared/types/events";
import type { Simplify } from "type-fest";

import { generateCorrelationId } from "@shared/utils/correlation";
import {
    createTemplateLogger,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { isObject } from "@shared/utils/typeGuards";
import { EventEmitter } from "node:events";

import { logger as baseLogger } from "../utils/logger";
import { isEventMetadata } from "./eventMetadataGuards";

const logger = createTemplateLogger(baseLogger);

interface MetaCarrier {
    readonly _meta: EventMetadata;
}

interface OriginalMetaCarrier {
    readonly _originalMeta: EventMetadata;
}

const resolveOriginalMetadata = (
    ...candidates: readonly unknown[]
): EventMetadata | undefined => candidates.find(isEventMetadata);

/**
 * Internal symbol used to carry original metadata through event forwarding.
 */
export const ORIGINAL_METADATA_SYMBOL: unique symbol = Symbol(
    "typed-event-bus:original-meta"
);

const defineHiddenProperty = (
    target: object,
    key: string | symbol,
    value: unknown,
    options?: { enumerable?: boolean }
): void => {
    Object.defineProperty(target, key, {
        configurable: false,
        enumerable: options?.enumerable ?? true,
        value,
        writable: false,
    });
};

const structuredCloneFn =
    typeof globalThis.structuredClone === "function"
        ? globalThis.structuredClone.bind(globalThis)
        : undefined;

const cloneArrayPayload = <TPayload extends ArrayPayload>(
    payload: TPayload
): TPayload => {
    if (structuredCloneFn) {
        try {
            return structuredCloneFn(payload);
        } catch {
            // Fall through to manual cloning for non-cloneable payload entries (e.g., functions).
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Fallback cloning preserves tuple structures when structuredClone is unavailable.
    return Array.from(payload) as TPayload;
};

const cloneObjectPayload = <TPayload extends NonArrayObjectPayload>(
    payload: TPayload
): TPayload => {
    if (structuredCloneFn) {
        try {
            return structuredCloneFn(payload);
        } catch {
            // Fall through to manual cloning for non-cloneable payload entries (e.g., functions).
        }
    }

    const prototype = Reflect.getPrototypeOf(payload) ?? Object.prototype;
    const clone: NonArrayObjectPayload = { ...payload };
    Reflect.setPrototypeOf(clone, prototype);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Manual cloning retains the payload shape when structuredClone is unavailable.
    return clone as TPayload;
};

const getHiddenProperty = (
    target: NonArrayObjectPayload,
    key: string | symbol
): unknown => {
    if (!Reflect.has(target, key)) {
        return undefined;
    }

    return Reflect.get(target, key);
};

const attachMetadata: <TPayload extends object>(
    payload: TPayload,
    metadata: EventMetadata,
    options?: { enumerable?: boolean }
) => asserts payload is MetaCarrier & TPayload = (
    payload,
    metadata,
    options
) => {
    defineHiddenProperty(payload, "_meta", metadata, options);
};

const attachOriginalMetadata: <TPayload extends object>(
    payload: TPayload,
    metadata: EventMetadata
) => asserts payload is OriginalMetaCarrier & TPayload = (
    payload,
    metadata
) => {
    defineHiddenProperty(payload, "_originalMeta", metadata);
};

/**
 * Diagnostic information about a {@link TypedEventBus} instance.
 *
 * @remarks
 * Provides runtime insights into event bus configuration and usage, including
 * listener and middleware statistics.
 *
 * @public
 */
export interface EventBusDiagnostics<
    EventMap extends TypedEventMap = TypedEventMap,
> {
    /** Unique identifier for this event bus instance. */
    busId: string;
    /** Number of listeners registered for each event. */
    listenerCounts: Partial<Record<EventKey<EventMap>, number>>;
    /** Maximum number of listeners allowed per event. */
    maxListeners: number;
    /** Maximum number of middleware functions allowed. */
    maxMiddleware: number;
    /** Number of registered middleware functions. */
    middlewareCount: number;
    /** Percentage of middleware slots used (0-100). */
    middlewareUtilization: number;
}

/**
 * Middleware function for event processing.
 *
 * @remarks
 * Middleware can inspect event data, add logging, collect metrics, perform
 * validation, or handle other cross-cutting concerns. Middleware should NOT
 * modify the data object, as modifications will not be reflected in the final
 * event delivered to listeners. Call `next()` to continue processing or throw
 * an error to stop the middleware chain. Data transformations should be
 * performed before calling {@link TypedEventBus.emitTyped}.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "../utils/logger";
 *
 * const loggingMiddleware: EventMiddleware = async (event, data, next) => {
 *     logger.debug("Processing event", { event, data });
 *     await next(); // Continue to next middleware
 *     logger.debug("Completed event", { event });
 * };
 * ```
 *
 * @typeParam T - The type of event data payload.
 *
 * @param event - Name of the event being processed.
 * @param data - Event data payload (read-only for inspection).
 * @param next - Function to call to continue to the next middleware.
 *
 * @returns A promise that resolves when the middleware chain is complete.
 *
 * @throws Error if the middleware wishes to abort event processing.
 */

/**
 * Read-only array payload supported by the event bus.
 */
type ArrayPayload = readonly unknown[] | unknown[];

/**
 * Primitive payload supported by the event bus.
 */
type PrimitivePayload =
    | bigint
    | boolean
    | null
    | number
    | string
    | symbol
    | undefined;

/**
 * Non-array object payload shape used to distinguish plain objects from arrays.
 * The optional `length` exclusion prevents accidental array matches.
 */
type NonArrayObjectPayload = Record<PropertyKey, unknown> & {
    readonly length?: never;
};

/**
 * Supported event payload value for the typed event bus.
 */
export type EventPayloadValue =
    | ArrayPayload
    | NonArrayObjectPayload
    | PrimitivePayload;

type PrimitiveEventPayload<Value extends PrimitivePayload> = Readonly<{
    _meta: EventMetadata;
    _originalMeta?: EventMetadata;
    value: Value;
}>;

/**
 * Mapping between event keys and their typed payload values.
 */
export type TypedEventMap = Record<string, EventPayloadValue>;

/**
 * Extracts the string key union from a typed event map.
 */
export type EventKey<EventMap> = Extract<keyof EventMap, string>;

/**
 * Payload enriched with metadata for downstream listeners.
 */
export type EnhancedEventPayload<Payload extends EventPayloadValue> =
    // Force distributive behaviour for union payloads so discriminated unions
    // (e.g. StateSyncEventData) preserve their member shapes after metadata
    // enrichment.
    Payload extends unknown
        ? Payload extends ArrayPayload
            ? Payload &
                  Readonly<{
                      readonly _meta: EventMetadata;
                      readonly _originalMeta?: EventMetadata;
                  }>
            : Payload extends PrimitivePayload
              ? PrimitiveEventPayload<Payload>
              : Simplify<
                    Payload & {
                        readonly _meta: EventMetadata;
                        readonly _originalMeta?: EventMetadata;
                    }
                >
        : never;

/**
 * Function signature for strongly typed event listeners.
 */
export type TypedEventListener<
    EventMap extends TypedEventMap,
    K extends EventKey<EventMap>,
> = (payload: EnhancedEventPayload<EventMap[K]>) => void;

/**
 * Middleware function signature used by {@link TypedEventBus} to process events
 * before they are emitted to listeners.
 */
export type EventMiddleware<EventMap extends TypedEventMap = TypedEventMap> = <
    K extends EventKey<EventMap>,
>(
    event: K,
    data: EventMap[K],
    next: () => Promise<void> | void
) => Promise<void> | void;

type MiddlewareExecutor<EventMap extends TypedEventMap> = (
    event: EventKey<EventMap>,
    data: EventMap[EventKey<EventMap>],
    next: () => Promise<void> | void
) => Promise<void> | void;

/**
 * Enhanced event bus with type safety and middleware support.
 *
 * @remarks
 * Provides compile-time type checking for events, automatic correlation
 * tracking, middleware processing, and comprehensive debugging capabilities.
 * Events are processed through a middleware chain before emission.
 *
 * **Type Constraints:** EventMap values must be object types (not primitives)
 * to support metadata enhancement.
 *
 * @typeParam EventMap - Map of event names to their data types. Values must be
 *   object types.
 *
 * @public
 */
export class TypedEventBus<
    EventMap extends TypedEventMap,
    // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
> extends EventEmitter {
    /**
     * Unique identifier for this event bus instance.
     *
     * @remarks
     * Used for debugging and logging to distinguish between multiple event bus
     * instances. Included in event metadata and log messages.
     */
    private readonly busId: string;

    /**
     * Maximum number of middleware functions allowed.
     *
     * @remarks
     * Enforces a reasonable limit on middleware to prevent performance
     * degradation and infinite middleware chains. Set during initialization.
     */
    private readonly maxMiddleware: number;

    /**
     * Array of registered middleware functions.
     *
     * @remarks
     * Middleware functions are executed in order during event emission. Used
     * for cross-cutting concerns like logging, validation, and rate limiting.
     */
    private readonly middlewares: Array<MiddlewareExecutor<EventMap>> = [];

    private readonly middlewareExecutors = new Map<
        EventMiddleware<EventMap>,
        Array<MiddlewareExecutor<EventMap>>
    >();

    /**
     * Emit a typed event through the middleware chain.
     *
     * @remarks
     * Guarantees type safety between event name and data. The event is
     * processed through all registered middleware before being emitted to
     * listeners. Automatic metadata is added including correlation ID,
     * timestamp, and bus ID.
     *
     * **Middleware Processing:**
     *
     * - Middleware is intended for cross-cutting concerns (logging, validation,
     *   rate limiting). - Middleware receives the original event data for
     *   inspection but cannot modify the data that gets delivered to
     *   listeners.
     * - Data transformations should be performed before calling
     *   {@link TypedEventBus.emitTyped}. - If middleware throws an error, event
     *   emission is aborted.
     *
     * **Data Transformation Behavior:**
     *
     * - **Objects**: Spread with added `_meta` property.
     * - **Arrays**: Preserved with non-enumerable `_meta` property.
     * - **Primitives**: Wrapped as `{ value: primitiveData, _meta: metadata }`.
     * - **Objects with _meta**: Original `_meta` preserved as `_originalMeta`.
     *
     * @example
     *
     * ```typescript
     * // Object event (typical case)
     * await bus.emitTyped("user:login", {
     *     userId: "123",
     *     timestamp: Date.now(),
     * });
     * // Listener receives: { userId: '123', timestamp: Date.now(), _meta: {...} }
     *
     * // Array event
     * await bus.emitTyped("data:batch", [1, 2, 3]);
     * // Listener receives: [1, 2, 3] with _meta property attached
     *
     * // Primitive event
     * await bus.emitTyped("count:updated", 42);
     * // Listener receives: { value: 42, _meta: {...} }
     * ```
     *
     * @typeParam K - The event name (must be a key in EventMap).
     *
     * @param event - The event name.
     * @param data - The event data (must match the type for this event).
     *
     * @returns A promise that resolves when the event has been emitted.
     *
     * @throws Error when middleware processing fails.
     */
    public async emitTyped<K extends EventKey<EventMap>>(
        event: K,
        data: EventMap[K]
    ): Promise<void> {
        const correlationId = generateCorrelationId();
        const eventName = event;

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_EMISSION_START, {
            busId: this.busId,
            correlationId,
            eventName,
        });

        try {
            // Process through middleware chain
            await this.processMiddleware(event, data, correlationId);

            // Emit the actual event with enhanced data
            const enhancedData = this.createEnhancedData<EventMap[K]>(data, {
                busId: this.busId,
                correlationId,
                eventName,
                timestamp: Date.now(),
            });

            // Use EventEmitter's emit to respect once() semantics and internal bookkeeping
            try {
                this.emit(eventName, enhancedData);
            } catch (listenerError) {
                // Log listener errors but don't let them fail the emission
                // Use base logger directly for error objects since
                // template logger doesn't support error objects
                baseLogger.error(
                    `[TypedEventBus:${this.busId}] Listener error for '${eventName}' [${correlationId}]`,
                    listenerError
                );
            }

            logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_EMISSION_SUCCESS, {
                busId: this.busId,
                correlationId,
                eventName,
            });
        } catch (error) {
            logger.error(LOG_TEMPLATES.errors.EVENT_BUS_EMISSION_FAILED, {
                busId: this.busId,
                correlationId,
                eventName,
            });
            throw error;
        }
    }

    /**
     * Process event through middleware chain.
     *
     * @remarks
     * Executes middleware in registration order. If any middleware throws an
     * error, the chain is aborted and the error is propagated to the caller.
     *
     * @param eventName - Name of the event being processed.
     * @param data - Event data payload.
     * @param correlationId - Unique ID for tracking this event emission.
     *
     * @returns A promise that resolves when all middleware have completed.
     *
     * @throws Error if any middleware in the chain throws.
     */
    private async processMiddleware<K extends EventKey<EventMap>>(
        event: K,
        data: EventMap[K],
        correlationId: string
    ): Promise<void> {
        if (this.middlewares.length === 0) {
            return;
        }

        const eventName = event;

        const processNext = async (
            index: number,
            currentEvent: K,
            currentData: EventMap[K]
        ): Promise<void> => {
            if (index >= this.middlewares.length) {
                return;
            }

            const middleware = this.middlewares[index];
            if (!middleware) {
                return;
            }

            try {
                await middleware(currentEvent, currentData, () =>
                    processNext(index + 1, currentEvent, currentData)
                );
            } catch (error) {
                baseLogger.error(
                    `[TypedEventBus:${this.busId}] Middleware error for '${eventName}' [${correlationId}]`,
                    error
                );
                throw error;
            }
        };

        await processNext(0, event, data);
    }

    /**
     * Create a new typed event bus.
     *
     * @remarks
     * If no name is provided, a unique correlation ID will be generated. The
     * bus is configured with a reasonable max listener limit for development
     * use. A maximum middleware limit prevents memory leaks from excessive
     * middleware registration.
     *
     * @example
     *
     * ```typescript
     * // Default configuration
     * const bus = new TypedEventBus<MyEvents>("my-bus");
     *
     * // Custom middleware limit
     * const bus = new TypedEventBus<MyEvents>("my-bus", {
     *     maxMiddleware: 30,
     * });
     * ```
     *
     * @param name - Optional name for the bus (used in logging and
     *   diagnostics).
     * @param options - Optional configuration options.
     *
     * @throws Error when `maxMiddleware` is not positive.
     */
    public constructor(name?: string, options?: { maxMiddleware?: number }) {
        super();
        this.busId = name ?? generateCorrelationId();

        const maxMiddleware = options?.maxMiddleware ?? 20;
        if (maxMiddleware <= 0) {
            throw new Error(
                `maxMiddleware must be positive, got ${maxMiddleware}`
            );
        }
        this.maxMiddleware = maxMiddleware;

        // Set max listeners to prevent warnings in development
        this.setMaxListeners(50);

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_CREATED, {
            busId: this.busId,
            maxMiddleware: this.maxMiddleware,
        });
    }

    /**
     * Clear all registered middleware.
     *
     * @remarks
     * Removes all middleware functions from the processing chain. Events will
     * be emitted directly without middleware processing.
     */
    public clearMiddleware(): void {
        const count = this.middlewares.length;
        this.middlewares.length = 0;
        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_CLEARED, {
            busId: this.busId,
            count,
        });
    }

    /**
     * Get diagnostic information about the event bus.
     *
     * @remarks
     * Provides listener counts per event, middleware utilization statistics,
     * and configured limits. Useful for debugging middleware leaks and
     * verifying listener cleanup in tests.
     *
     * @returns Diagnostic data including listener counts and middleware
     *   information.
     */
    public getDiagnostics(): EventBusDiagnostics<EventMap> {
        const listenerCounts: Partial<Record<EventKey<EventMap>, number>> = {};
        for (const eventName of this.eventNames()) {
            if (this.isKnownEvent(eventName)) {
                listenerCounts[eventName] = this.listenerCount(eventName);
            }
        }

        return {
            busId: this.busId,
            listenerCounts,
            maxListeners: this.getMaxListeners(),
            maxMiddleware: this.maxMiddleware,
            middlewareCount: this.middlewares.length,
            middlewareUtilization:
                this.maxMiddleware > 0
                    ? Math.min(
                          (this.middlewares.length / this.maxMiddleware) * 100,
                          100
                      )
                    : 0,
        };
    }

    /**
     * Remove typed event listener(s).
     *
     * @remarks
     * If no listener is specified, all listeners for the event are removed.
     *
     * @example
     *
     * ```typescript
     * bus.offTyped("user:login"); // Remove all listeners for 'user:login'
     * bus.offTyped("user:login", myListener); // Remove specific listener
     * ```
     *
     * @typeParam K - The event name (must be a key in EventMap).
     *
     * @param event - The event name to remove listeners for.
     * @param listener - Specific listener to remove, or `undefined` to remove
     *   all listeners for the event.
     *
     * @returns This event bus instance for chaining.
     */
    public offTyped<K extends EventKey<EventMap>>(
        event: K,
        listener?: TypedEventListener<EventMap, K>
    ): this {
        const eventName = event;
        if (listener) {
            this.off(eventName, listener);
        } else {
            this.removeAllListeners(eventName);
        }

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_LISTENER_REMOVED, {
            busId: this.busId,
            eventName,
        });
        return this;
    }

    private isKnownEvent(name: unknown): name is EventKey<EventMap> {
        return typeof name === "string";
    }

    /**
     * Register a one-time typed event listener.
     *
     * @remarks
     * Invokes the listener exactly once and then removes it automatically.
     * Useful for events that should only trigger a single reaction, such as
     * initialization hooks.
     *
     * @example
     *
     * ```typescript
     * bus.onceTyped("user:login", (data) => {
     *     logger.info("User logged in", data);
     * });
     * ```
     *
     * @typeParam K - The event name (must be a key in EventMap).
     *
     * @param event - The event name to listen for.
     * @param listener - Function to call when the event is emitted (called only
     *   once).
     *
     * @returns This event bus instance for chaining.
     */
    public onceTyped<K extends EventKey<EventMap>>(
        event: K,
        listener: TypedEventListener<EventMap, K>
    ): this {
        const eventName = event;
        this.once(eventName, listener);

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_ONE_TIME_LISTENER, {
            busId: this.busId,
            eventName,
        });
        return this;
    }

    /**
     * Register a typed event listener with guaranteed type safety.
     *
     * @remarks
     * The listener receives the original event data plus automatically added
     * metadata. TypeScript will enforce that the listener signature matches the
     * event data type.
     *
     * @typeParam K - The event name (must be a key in EventMap).
     *
     * @param event - The event name to listen for.
     * @param listener - Function to call when the event is emitted.
     *
     * @returns This event bus instance for chaining.
     */
    public onTyped<K extends EventKey<EventMap>>(
        event: K,
        listener: TypedEventListener<EventMap, K>
    ): this {
        const eventName = event;
        this.on(eventName, listener);

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_LISTENER_REGISTERED, {
            busId: this.busId,
            eventName,
        });
        return this;
    }

    /**
     * Remove a specific middleware from the processing chain.
     *
     * @remarks
     * If the middleware is found, it is removed from the chain.
     *
     * @param middleware - The middleware function to remove.
     *
     * @returns `true` if middleware was found and removed, `false` otherwise.
     */
    public removeMiddleware(middleware: EventMiddleware<EventMap>): boolean {
        const executors = this.middlewareExecutors.get(middleware);
        if (!executors || executors.length === 0) {
            return false;
        }

        const executor = executors.pop();
        if (!executor) {
            return false;
        }

        const index = this.middlewares.indexOf(executor);
        if (index === -1) {
            return false;
        }

        this.middlewares.splice(index, 1);
        if (executors.length === 0) {
            this.middlewareExecutors.delete(middleware);
        }

        logger.debug(LOG_TEMPLATES.debug.EVENT_BUS_MIDDLEWARE_REMOVED, {
            busId: this.busId,
            count: this.middlewares.length,
        });

        return true;
    }

    /**
     * Register middleware to process events before emission.
     *
     * @remarks
     * Middleware is executed in registration order. Each middleware must call
     * `next()` to continue the chain or throw an error to abort processing. A
     * maximum middleware limit prevents memory leaks from excessive
     * registrations. If you need more middleware, consider increasing the limit
     * in the constructor or combining multiple middleware functions into one.
     *
     * @param middleware - Middleware function to register.
     *
     * @throws Error when the maximum middleware limit is exceeded.
     */
    public registerMiddleware(middleware: EventMiddleware<EventMap>): void {
        if (this.maxMiddleware <= this.middlewares.length) {
            throw new Error(
                `Maximum middleware limit (${this.maxMiddleware}) exceeded. ` +
                    `Consider increasing maxMiddleware or combining middleware functions.`
            );
        }

        const executeMiddleware: MiddlewareExecutor<EventMap> = (
            event,
            data,
            next
        ) => middleware(event, data, next);

        this.middlewares.push(executeMiddleware);
        const executorStack = this.middlewareExecutors.get(middleware);
        if (executorStack) {
            executorStack.push(executeMiddleware);
        } else {
            this.middlewareExecutors.set(middleware, [executeMiddleware]);
        }
        logger.debug(
            `[TypedEventBus:${this.busId}] Registered middleware (total: ${this.middlewares.length}/${this.maxMiddleware})`
        );
    }

    /**
     * Create enhanced event data with metadata, handling edge cases safely.
     *
     * @remarks
     * Handles arrays, objects with existing `_meta` properties, and primitives
     * safely. Preserves original data structure and type safety.
     *
     * **Special Behaviors:**
     *
     * - **Arrays**: Preserves array structure with non-enumerable `_meta`
     *   property.
     * - **Objects with _meta**: Existing `_meta` preserved as `_originalMeta`
     *   property.
     * - **Primitives**: Wrapped in `{ value: data, _meta: metadata }` structure.
     * - **Type Safety**: All transformations maintain compile-time type
     *   guarantees.
     *
     * @example
     *
     * ```typescript
     * // Array handling
     * createEnhancedData([1, 2, 3], meta); // → [1, 2, 3] with _meta attached
     *
     * // Object with existing _meta
     * createEnhancedData({ data: "test", _meta: "existing" }, meta);
     * // → { data: 'test', _meta: newMeta, _originalMeta: 'existing' }
     *
     * // Primitive handling
     * createEnhancedData(42, meta); // → { value: 42, _meta: meta }
     * ```
     *
     * @typeParam T - The type of the original event data.
     *
     * @param data - Original event data.
     * @param metadata - Metadata to add.
     *
     * @returns Enhanced data with `_meta` property.
     */
    private createEnhancedData<Payload extends EventPayloadValue>(
        data: Payload,
        metadata: EventMetadata
    ): EnhancedEventPayload<Payload> {
        if (this.isPrimitivePayload(data)) {
            return this.wrapPrimitivePayload(data, metadata);
        }

        if (this.isArrayPayload(data)) {
            const clonedArray = cloneArrayPayload(data);
            attachMetadata(clonedArray, metadata, { enumerable: false });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Metadata attachment guarantees payload satisfies EnhancedEventPayload.
            return clonedArray as EnhancedEventPayload<Payload>;
        }

        if (!this.isObjectPayload(data)) {
            throw new TypeError(
                "TypedEventBus received an unsupported payload type"
            );
        }

        const sourcePayload = data;
        const existingMetaCandidate = getHiddenProperty(sourcePayload, "_meta");
        const existingOriginalMetaCandidate = getHiddenProperty(
            sourcePayload,
            "_originalMeta"
        );
        const symbolOriginalMetaCandidate = getHiddenProperty(
            sourcePayload,
            ORIGINAL_METADATA_SYMBOL
        );

        const clonedPayload = cloneObjectPayload(data);

        if (Reflect.has(clonedPayload, "_meta")) {
            Reflect.deleteProperty(clonedPayload, "_meta");
        }

        if (Reflect.has(clonedPayload, "_originalMeta")) {
            Reflect.deleteProperty(clonedPayload, "_originalMeta");
        }

        if (Reflect.has(clonedPayload, ORIGINAL_METADATA_SYMBOL)) {
            Reflect.deleteProperty(clonedPayload, ORIGINAL_METADATA_SYMBOL);
        }

        const metadataCandidates = [
            symbolOriginalMetaCandidate,
            existingOriginalMetaCandidate,
            existingMetaCandidate,
        ].filter((candidate): candidate is EventMetadata =>
            isEventMetadata(candidate)
        );

        const resolvedOriginalMeta =
            metadataCandidates.length > 0
                ? resolveOriginalMetadata(...metadataCandidates)
                : undefined;
        const rawOriginalMetaCandidate =
            symbolOriginalMetaCandidate ??
            existingOriginalMetaCandidate ??
            existingMetaCandidate;

        attachMetadata(clonedPayload, metadata);

        if (resolvedOriginalMeta !== undefined) {
            attachOriginalMetadata(clonedPayload, resolvedOriginalMeta);
        } else if (rawOriginalMetaCandidate !== undefined) {
            defineHiddenProperty(
                clonedPayload,
                "_originalMeta",
                rawOriginalMetaCandidate
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Metadata attachment guarantees payload satisfies EnhancedEventPayload.
        return clonedPayload as EnhancedEventPayload<Payload>;
    }

    private wrapPrimitivePayload<Payload extends PrimitivePayload>(
        value: Payload,
        metadata: EventMetadata
    ): EnhancedEventPayload<Payload> {
        const wrapper = { value };
        attachMetadata(wrapper, metadata);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Wrapper structure matches PrimitiveEventPayload after metadata attachment.
        return wrapper as EnhancedEventPayload<Payload>;
    }

    private isPrimitivePayload(
        value: EventPayloadValue
    ): value is PrimitivePayload {
        return typeof value !== "object" || value === null;
    }

    private isArrayPayload(value: EventPayloadValue): value is ArrayPayload {
        return Array.isArray(value);
    }

    private isObjectPayload(
        value: EventPayloadValue
    ): value is NonArrayObjectPayload {
        return isObject(value);
    }
}

/**
 * Factory function to create a new typed event bus instance.
 *
 * @remarks
 * This function is a convenience wrapper for the {@link TypedEventBus}
 * constructor.
 *
 * @example
 *
 * ```typescript
 * const bus = createTypedEventBus<MyEvents>("my-bus", {
 *     maxMiddleware: 30,
 * });
 * ```
 *
 * @typeParam EventMap - Map of event names to their data types. Values can be
 *   any type.
 *
 * @param name - Optional name for the bus (used in logging and diagnostics).
 * @param options - Optional configuration options for the event bus.
 *
 * @returns A new {@link TypedEventBus} instance.
 */
// eslint-disable-next-line etc/no-misused-generics -- EventMap must be explicitly provided for type safety
export function createTypedEventBus<EventMap extends TypedEventMap>(
    name?: string,
    options?: { maxMiddleware?: number }
): TypedEventBus<EventMap> {
    return new TypedEventBus<EventMap>(name, options);
}

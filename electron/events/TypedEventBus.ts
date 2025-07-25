/**
 * Type-safe event bus with middleware support and debugging capabilities.
 *
 * @remarks
 * Enhances the standard Node.js EventEmitter with compile-time type safety,
 * middleware processing, correlation tracking, and comprehensive logging.
 * Ensures events are properly typed and provides rich debugging information.
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'user:login': { userId: string; timestamp: number };
 *   'data:updated': { table: string; records: number };
 * }
 *
 * const bus = new TypedEventBus<MyEvents>('app-events');
 * bus.onTyped('user:login', (data) => {
 *   console.log(`User ${data.userId} logged in at ${data.timestamp}`);
 * });
 * await bus.emitTyped('user:login', { userId: '123', timestamp: Date.now() });
 * ```
 *
 * @packageDocumentation
 */

import { EventEmitter } from "node:events";

import { generateCorrelationId } from "../utils/correlation";
import { logger } from "../utils/logger";

/**
 * Diagnostic information about an event bus instance.
 *
 * @remarks
 * Provides runtime insights into event bus configuration and usage.
 * Useful for debugging, monitoring, and performance analysis.
 *
 * @public
 */
export interface EventBusDiagnostics {
    /** Unique identifier for this event bus instance */
    busId: string;
    /** Number of listeners registered for each event */
    listenerCounts: Record<string, number>;
    /** Maximum number of listeners allowed per event */
    maxListeners: number;
    /** Maximum number of middleware functions allowed */
    maxMiddleware: number;
    /** Number of registered middleware functions */
    middlewareCount: number;
    /** Percentage of middleware slots used (0-100) */
    middlewareUtilization: number;
}

/**
 * Metadata automatically added to all emitted events.
 *
 * @remarks
 * Provides debugging and tracking information automatically added to every event.
 * Available in all event listeners under the `_meta` property.
 *
 * @public
 */
export interface EventMetadata {
    /** Identifier of the event bus that emitted this event */
    busId: string;
    /** Unique identifier for tracking this specific event emission */
    correlationId: string;
    /** Name of the event that was emitted */
    eventName: string;
    /** Unix timestamp when the event was emitted */
    timestamp: number;
}

/**
 * Middleware function for event processing.
 *
 * @param event - Name of the event being processed
 * @param data - Event data payload (read-only for inspection)
 * @param next - Function to call to continue to the next middleware
 *
 * @remarks
 * Middleware can inspect event data, add logging, collect metrics, perform validation,
 * or handle other cross-cutting concerns. Middleware should NOT modify the data object
 * as modifications will not be reflected in the final event delivered to listeners.
 *
 * Call `next()` to continue processing or throw an error to stop the middleware chain.
 * Data transformations should be performed before calling `emitTyped()` rather than
 * within middleware functions.
 *
 * @example
 * ```typescript
 * const loggingMiddleware: EventMiddleware = async (event, data, next) => {
 *   console.log(`Processing event: ${event}`);
 *   await next(); // Continue to next middleware
 *   console.log(`Completed event: ${event}`);
 * };
 *
 * const validationMiddleware: EventMiddleware = async (event, data, next) => {
 *   if (!isValidData(data)) {
 *     throw new Error('Invalid event data'); // Stop processing
 *   }
 *   await next(); // Continue if valid
 * };
 * ```
 */
export type EventMiddleware<T = unknown> = (
    event: string,
    data: T,
    next: () => Promise<void> | void
) => Promise<void> | void;

/**
 * Enhanced event bus with type safety and middleware support.
 *
 * @remarks
 * Provides compile-time type checking for events, automatic correlation tracking,
 * middleware processing, and comprehensive debugging capabilities. Events are
 * processed through a middleware chain before emission.
 *
 * @typeParam EventMap - Map of event names to their data types
 *
 * @public
 */
// eslint-disable-next-line unicorn/prefer-event-target -- EventEmitter required for Node.js specific features
export class TypedEventBus<EventMap extends Record<string, unknown>> extends EventEmitter {
    private readonly busId: string;
    private readonly maxMiddleware: number;
    private readonly middlewares: EventMiddleware[] = [];

    /**
     * Create a new typed event bus.
     *
     * @param name - Optional name for the bus (used in logging and diagnostics)
     * @param options - Optional configuration options
     *
     * @throws {@link Error} When maxMiddleware is not positive
     *
     * @remarks
     * If no name is provided, a unique correlation ID will be generated.
     * The bus is configured with a reasonable max listener limit for development use.
     * A maximum middleware limit prevents memory leaks from excessive middleware registration.
     *
     * **Configuration Guidelines:**
     * - options.maxMiddleware: Maximum number of middleware functions allowed (default: 20, must be positive)
     * - Values ≤ 0 will throw an error
     * - Consider performance impact with high middleware counts
     *
     * @example
     * ```typescript
     * // Default configuration
     * const bus = new TypedEventBus<MyEvents>('my-bus');
     *
     * // Custom middleware limit
     * const bus = new TypedEventBus<MyEvents>('my-bus', { maxMiddleware: 30 });
     * ```
     */
    constructor(name?: string, options?: { maxMiddleware?: number }) {
        super();
        this.busId = name ?? generateCorrelationId();

        const maxMiddleware = options?.maxMiddleware ?? 20;
        if (maxMiddleware <= 0) {
            throw new Error(`maxMiddleware must be positive, got ${maxMiddleware}`);
        }
        this.maxMiddleware = maxMiddleware;

        // Set max listeners to prevent warnings in development
        this.setMaxListeners(50);

        logger.debug(`[TypedEventBus:${this.busId}] Created new event bus (max middleware: ${this.maxMiddleware})`);
    }

    /**
     * Clear all registered middleware.
     *
     * @remarks
     * Removes all middleware functions from the processing chain.
     * Events will be emitted directly without middleware processing.
     */
    clearMiddleware(): void {
        const count = this.middlewares.length;
        this.middlewares.length = 0;
        logger.debug(`[TypedEventBus:${this.busId}] Cleared ${count} middleware functions`);
    }

    /**
     * Emit a typed event through the middleware chain.
     *
     * @param event - The event name (must be a key in EventMap)
     * @param data - The event data (must match the type for this event)
     *
     * @throws {@link Error} When middleware processing fails
     *
     * @remarks
     * Guarantees type safety between event name and data. The event is processed
     * through all registered middleware before being emitted to listeners.
     * Automatic metadata is added including correlation ID, timestamp, and bus ID.
     *
     * **Middleware Processing:**
     * - Middleware is intended for cross-cutting concerns (logging, validation, rate limiting)
     * - Middleware receives the original event data for inspection but cannot modify
     *   the data that gets delivered to listeners
     * - Data transformations should be performed before calling emitTyped()
     * - If middleware throws an error, event emission is aborted
     *
     * **Data Transformation Behavior:**
     * - **Objects**: Spread with added _meta property
     * - **Arrays**: Preserved with non-enumerable _meta property
     * - **Primitives**: Wrapped as \{ value: primitiveData, _meta: metadata \}
     * - **Objects with _meta**: Original _meta preserved as _originalMeta
     *
     * @example
     * ```typescript
     * // Object event (typical case)
     * await bus.emitTyped('user:login', { userId: '123', timestamp: Date.now() });
     * // Listener receives: { userId: '123', timestamp: Date.now(), _meta: {...} }
     *
     * // Array event
     * await bus.emitTyped('data:batch', [1, 2, 3]);
     * // Listener receives: [1, 2, 3] with _meta property attached
     *
     * // Primitive event
     * await bus.emitTyped('count:updated', 42);
     * // Listener receives: { value: 42, _meta: {...} }
     * ```
     */
    async emitTyped<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
        const correlationId = generateCorrelationId();
        const eventName = event as string;

        logger.debug(`[TypedEventBus:${this.busId}] Starting emission of '${eventName}' [${correlationId}]`);

        try {
            // Process through middleware chain
            await this.processMiddleware(eventName, data, correlationId);

            // Emit the actual event with enhanced data
            const enhancedData = this.createEnhancedData(data, {
                busId: this.busId,
                correlationId,
                eventName,
                timestamp: Date.now(),
            });

            this.emit(eventName, enhancedData);

            logger.debug(`[TypedEventBus:${this.busId}] Successfully emitted '${eventName}' [${correlationId}]`);
        } catch (error) {
            logger.error(`[TypedEventBus:${this.busId}] Failed to emit '${eventName}' [${correlationId}]`, error);
            throw error;
        }
    }

    /**
     * Get diagnostic information about the event bus.
     *
     * @returns Diagnostic data including listener counts and middleware information
     *
     * @remarks
     * Provides runtime information useful for debugging and monitoring.
     * Includes listener counts per event, middleware count, and configuration.
     */
    getDiagnostics(): EventBusDiagnostics {
        const listenerCounts: Record<string, number> = {};
        for (const eventName of this.eventNames()) {
            listenerCounts[eventName as string] = this.listenerCount(eventName);
        }

        return {
            busId: this.busId,
            listenerCounts,
            maxListeners: this.getMaxListeners(),
            maxMiddleware: this.maxMiddleware,
            middlewareCount: this.middlewares.length,
            middlewareUtilization:
                this.maxMiddleware > 0 ? Math.min((this.middlewares.length / this.maxMiddleware) * 100, 100) : 0,
        };
    }

    /**
     * Remove typed event listener(s).
     *
     * @param event - The event name to remove listeners for.
     * @param listener - Specific listener to remove, or undefined to remove all listeners for the event.
     * @returns This event bus instance for chaining.
     *
     * @remarks
     * If no listener is specified, all listeners for the event are removed.
     *
     * @example
     * ```typescript
     * bus.offTyped('user:login'); // Remove all listeners for 'user:login'
     * bus.offTyped('user:login', myListener); // Remove specific listener
     * ```
     */
    offTyped<K extends keyof EventMap>(
        event: K,
        listener?: (data: EventMap[K] & { _meta: EventMetadata }) => void
    ): this {
        const eventName = event as string;
        if (listener) {
            this.off(eventName, listener);
        } else {
            this.removeAllListeners(eventName);
        }

        logger.debug(`[TypedEventBus:${this.busId}] Removed listener(s) for '${eventName}'`);
        return this;
    }

    /**
     * Register a one-time typed event listener.
     *
     * @param event - The event name to listen for.
     * @param listener - Function to call when the event is emitted (called only once).
     * @returns This event bus instance for chaining.
     *
     * @remarks
     * The listener is automatically removed after the first time the event is emitted.
     *
     * @example
     * ```typescript
     * bus.onceTyped('user:login', (data) => {
     *   console.log('User logged in:', data.userId);
     * });
     * ```
     */
    onceTyped<K extends keyof EventMap>(
        event: K,
        listener: (data: EventMap[K] & { _meta: EventMetadata }) => void
    ): this {
        const eventName = event as string;
        this.once(eventName, listener);

        logger.debug(`[TypedEventBus:${this.busId}] Registered one-time listener for '${eventName}'`);
        return this;
    }

    /**
     * Register a typed event listener with guaranteed type safety.
     *
     * @param event - The event name to listen for
     * @param listener - Function to call when the event is emitted
     * @returns This event bus instance for chaining
     *
     * @remarks
     * The listener receives the original event data plus automatically added metadata.
     * TypeScript will enforce that the listener signature matches the event data type.
     */
    onTyped<K extends keyof EventMap>(
        event: K,
        listener: (data: EventMap[K] & { _meta: EventMetadata }) => void
    ): this {
        const eventName = event as string;
        this.on(eventName, listener);

        logger.debug(`[TypedEventBus:${this.busId}] Registered listener for '${eventName}'`);
        return this;
    }

    /**
     * Remove a specific middleware from the processing chain.
     *
     * @param middleware - The middleware function to remove
     * @returns `true` if middleware was found and removed, `false` otherwise
     */
    removeMiddleware(middleware: EventMiddleware): boolean {
        const index = this.middlewares.indexOf(middleware);
        if (index !== -1) {
            this.middlewares.splice(index, 1);
            logger.debug(`[TypedEventBus:${this.busId}] Removed middleware (remaining: ${this.middlewares.length})`);
            return true;
        }
        return false;
    }

    /**
     * Register middleware to process events before emission.
     *
     * @param middleware - Middleware function to register
     * @throws {@link Error} When the maximum middleware limit is exceeded
     *
     * @remarks
     * Middleware is executed in registration order. Each middleware must call
     * `next()` to continue the chain or throw an error to abort processing.
     *
     * A maximum middleware limit prevents memory leaks from excessive registrations.
     * If you need more middleware, consider increasing the limit in the constructor
     * or combining multiple middleware functions into one.
     */
    use(middleware: EventMiddleware): void {
        if (this.middlewares.length >= this.maxMiddleware) {
            throw new Error(
                `Maximum middleware limit (${this.maxMiddleware}) exceeded. ` +
                    `Consider increasing maxMiddleware or combining middleware functions.`
            );
        }

        this.middlewares.push(middleware);
        logger.debug(
            `[TypedEventBus:${this.busId}] Registered middleware (total: ${this.middlewares.length}/${this.maxMiddleware})`
        );
    }

    /**
     * Create enhanced event data with metadata, handling edge cases safely.
     *
     * @param data - Original event data
     * @param metadata - Metadata to add
     * @returns Enhanced data with _meta property
     *
     * @remarks
     * Handles arrays, objects with existing _meta properties, and primitives safely.
     * Preserves original data structure and type safety.
     *
     * **Special Behaviors:**
     * - **Arrays**: Preserves array structure with non-enumerable _meta property
     * - **Objects with _meta**: Existing _meta preserved as _originalMeta property
     * - **Primitives**: Wrapped in \{ value: data, _meta: metadata \} structure
     * - **Type Safety**: All transformations maintain compile-time type guarantees
     *
     * @example
     * ```typescript
     * // Array handling
     * createEnhancedData([1, 2, 3], meta) // → [1, 2, 3] with _meta attached
     *
     * // Object with existing _meta
     * createEnhancedData({ data: 'test', _meta: 'existing' }, meta)
     * // → { data: 'test', _meta: newMeta, _originalMeta: 'existing' }
     *
     * // Primitive handling
     * createEnhancedData(42, meta) // → { value: 42, _meta: meta }
     * ```
     */
    private createEnhancedData<T>(data: T, metadata: EventMetadata): T & { _meta: EventMetadata } {
        // Handle arrays specially to preserve array nature
        if (Array.isArray(data)) {
            const result = [...data];
            // Use defineProperty to add non-enumerable _meta, preserving array immutability expectations
            Object.defineProperty(result, "_meta", {
                configurable: false,
                enumerable: false,
                value: metadata,
                writable: false,
            });
            return result as T & { _meta: EventMetadata };
        }

        // Handle objects with potential _meta conflicts
        if (typeof data === "object" && data != null) {
            const hasExistingMeta = Object.hasOwn(data, "_meta");
            if (hasExistingMeta) {
                logger.debug(
                    `[TypedEventBus:${this.busId}] Event data contains _meta property, preserving as _originalMeta`
                );
                return {
                    ...data,
                    _meta: metadata,
                    _originalMeta: (data as Record<string, unknown>)._meta,
                } as T & { _meta: EventMetadata };
            }

            return { ...data, _meta: metadata } as T & { _meta: EventMetadata };
        }

        // Handle primitives
        return { _meta: metadata, value: data } as unknown as T & { _meta: EventMetadata };
    }

    /**
     * Process event through middleware chain.
     *
     * @param eventName - Name of the event being processed
     * @param data - Event data payload
     * @param correlationId - Unique ID for tracking this event emission
     *
     * @throws {@link Error} When any middleware in the chain throws
     *
     * @remarks
     * Executes middleware in registration order. If any middleware throws an error,
     * the chain is aborted and the error is propagated to the caller.
     */
    private async processMiddleware(eventName: string, data: unknown, correlationId: string): Promise<void> {
        if (this.middlewares.length === 0) {
            return;
        }

        const processNext = async (currentIndex: number): Promise<void> => {
            if (currentIndex < this.middlewares.length) {
                // eslint-disable-next-line security/detect-object-injection
                const middleware = this.middlewares[currentIndex];

                if (middleware) {
                    try {
                        await middleware(eventName, data, () => processNext(currentIndex + 1));
                    } catch (error) {
                        logger.error(
                            `[TypedEventBus:${this.busId}] Middleware error for '${eventName}' [${correlationId}]`,
                            error
                        );
                        throw error;
                    }
                }
            }
        };

        await processNext(0);
    }
}

/**
 * Factory function to create a new typed event bus instance.
 *
 * @typeParam EventMap - Map of event names to their data types.
 * @param name - Optional name for the bus (used in logging and diagnostics).
 * @param options - Optional configuration options for the event bus.
 * @returns A new {@link TypedEventBus} instance.
 *
 * @remarks
 * This function is a convenience wrapper for the TypedEventBus constructor.
 *
 * @example
 * ```typescript
 * const bus = createTypedEventBus<MyEvents>('my-bus', { maxMiddleware: 30 });
 * ```
 */
export function createTypedEventBus<EventMap extends Record<string, unknown>>(
    name?: string,
    options?: { maxMiddleware?: number }
): TypedEventBus<EventMap> {
    return new TypedEventBus<EventMap>(name, options);
}

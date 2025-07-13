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

import { generateCorrelationId, logger } from "../utils/index";

/**
 * Middleware function for event processing.
 *
 * @param event - Name of the event being processed
 * @param data - Event data payload
 * @param next - Function to call to continue to the next middleware
 *
 * @remarks
 * Middleware can modify event data, add logging, collect metrics, or perform
 * other cross-cutting concerns. Call `next()` to continue processing or throw
 * an error to stop the middleware chain.
 *
 * @example
 * ```typescript
 * const loggingMiddleware: EventMiddleware = async (event, data, next) => {
 *   console.log(`Processing event: ${event}`);
 *   await next();
 *   console.log(`Completed event: ${event}`);
 * };
 * ```
 */
export type EventMiddleware<T = unknown> = (
    event: string,
    data: T,
    next: () => void | Promise<void>
) => void | Promise<void>;

/**
 * Enhanced event bus with type safety and middleware support.
 *
 * @remarks
 * Provides compile-time type checking for events, automatic correlation tracking,
 * middleware processing, and comprehensive debugging capabilities. Events are
 * processed through a middleware chain before emission.
 *
 * Features:
 * - **Type Safety**: Compile-time checking of event names and data
 * - **Middleware Support**: Pluggable processing pipeline
 * - **Correlation Tracking**: Automatic correlation IDs for debugging
 * - **Rich Metadata**: Timestamps, bus IDs, and diagnostic information
 * - **Error Handling**: Graceful error handling in middleware chain
 *
 * @typeParam EventMap - Map of event names to their data types
 *
 * @public
 */
// eslint-disable-next-line unicorn/prefer-event-target -- EventEmitter required for Node.js specific features
export class TypedEventBus<EventMap extends Record<string, unknown>> extends EventEmitter {
    private readonly middlewares: EventMiddleware[] = [];
    private readonly busId: string;

    /**
     * Create a new typed event bus.
     *
     * @param name - Optional name for the bus (used in logging and diagnostics)
     *
     * @remarks
     * If no name is provided, a unique correlation ID will be generated.
     * The bus is configured with a reasonable max listener limit for development use.
     */
    constructor(name?: string) {
        super();
        this.busId = name ?? generateCorrelationId();

        // Set max listeners to prevent warnings in development
        this.setMaxListeners(50);

        logger.debug(`[TypedEventBus:${this.busId}] Created new event bus`);
    }

    /**
     * Register middleware to process events before emission.
     *
     * @param middleware - Middleware function to register
     *
     * @remarks
     * Middleware is executed in registration order. Each middleware must call
     * `next()` to continue the chain or throw an error to abort processing.
     */
    use(middleware: EventMiddleware): void {
        this.middlewares.push(middleware);
        logger.debug(`[TypedEventBus:${this.busId}] Registered middleware (total: ${this.middlewares.length})`);
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
     */
    async emitTyped<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
        const correlationId = generateCorrelationId();
        const eventName = event as string;

        logger.debug(`[TypedEventBus:${this.busId}] Starting emission of '${eventName}' [${correlationId}]`);

        try {
            // Process through middleware chain
            await this.processMiddleware(eventName, data, correlationId);

            // Emit the actual event with enhanced data
            const enhancedData = {
                ...(typeof data === "object" && data !== null ? data : { value: data }),
                _meta: {
                    busId: this.busId,
                    correlationId,
                    eventName,
                    timestamp: Date.now(),
                },
            };

            this.emit(eventName, enhancedData);

            logger.debug(`[TypedEventBus:${this.busId}] Successfully emitted '${eventName}' [${correlationId}]`);
        } catch (error) {
            logger.error(`[TypedEventBus:${this.busId}] Failed to emit '${eventName}' [${correlationId}]`, error);
            throw error;
        }
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
     * Register a one-time typed event listener.
     *
     * @param event - The event name to listen for
     * @param listener - Function to call when the event is emitted (called only once)
     * @returns This event bus instance for chaining
     *
     * @remarks
     * The listener is automatically removed after the first time the event is emitted.
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
     * Remove typed event listener(s).
     *
     * @param event - The event name
     * @param listener - Specific listener to remove, or undefined to remove all listeners
     * @returns This event bus instance for chaining
     *
     * @remarks
     * If no listener is specified, all listeners for the event are removed.
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
            middlewareCount: this.middlewares.length,
        };
    }
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
    /** Unique identifier for tracking this specific event emission */
    correlationId: string;
    /** Identifier of the event bus that emitted this event */
    busId: string;
    /** Unix timestamp when the event was emitted */
    timestamp: number;
    /** Name of the event that was emitted */
    eventName: string;
}

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
    /** Number of registered middleware functions */
    middlewareCount: number;
    /** Number of listeners registered for each event */
    listenerCounts: Record<string, number>;
    /** Maximum number of listeners allowed per event */
    maxListeners: number;
}

/**
 * Utility function to create a typed event bus instance.
 *
 * @param name - Optional name for the bus
 * @returns A new TypedEventBus instance
 *
 * @remarks
 * Convenience factory function for creating typed event bus instances.
 * Equivalent to `new TypedEventBus<EventMap>(name)`.
 *
 * @example
 * ```typescript
 * interface AppEvents {
 *   'user:login': { userId: string };
 * }
 *
 * const bus = createTypedEventBus<AppEvents>('main-bus');
 * ```
 */
export function createTypedEventBus<EventMap extends Record<string, unknown>>(name?: string): TypedEventBus<EventMap> {
    return new TypedEventBus<EventMap>(name);
}

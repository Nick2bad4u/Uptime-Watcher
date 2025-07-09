/**
 * Type-safe event bus with middleware support.
 * Enhances the standard EventEmitter with type safety, middleware, and debugging capabilities.
 */

import { EventEmitter } from "node:events";

import { generateCorrelationId, logger } from "../utils/index";



/**
 * Middleware function for event processing.
 * Can modify event data, add logging, metrics, or perform other cross-cutting concerns.
 */
export type EventMiddleware<T = unknown> = (
    event: string,
    data: T,
    next: () => void | Promise<void>
) => void | Promise<void>;

/**
 * Enhanced event bus with type safety and middleware support.
 * Provides compile-time type checking for events and runtime middleware processing.
 */
export class TypedEventBus<EventMap extends Record<string, unknown>> extends EventEmitter {
    private middlewares: EventMiddleware[] = [];
    private readonly busId: string;

    constructor(name?: string) {
        super();
        this.busId = name || generateCorrelationId();

        // Set max listeners to prevent warnings in development
        this.setMaxListeners(50);

        logger.debug(`[TypedEventBus:${this.busId}] Created new event bus`);
    }

    /**
     * Register middleware to process events before emission.
     * Middleware is executed in registration order.
     */
    use(middleware: EventMiddleware): void {
        this.middlewares.push(middleware);
        logger.debug(`[TypedEventBus:${this.busId}] Registered middleware (total: ${this.middlewares.length})`);
    }

    /**
     * Remove a specific middleware from the processing chain.
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
     */
    clearMiddleware(): void {
        const count = this.middlewares.length;
        this.middlewares.length = 0;
        logger.debug(`[TypedEventBus:${this.busId}] Cleared ${count} middleware functions`);
    }

    /**
     * Emit a typed event through the middleware chain.
     * Guarantees type safety between event name and data.
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
     */
    getDiagnostics(): EventBusDiagnostics {
        return {
            busId: this.busId,
            listenerCounts: this.eventNames().reduce(
                (acc, eventName) => {
                    acc[eventName as string] = this.listenerCount(eventName);
                    return acc;
                },
                {} as Record<string, number>
            ),
            maxListeners: this.getMaxListeners(),
            middlewareCount: this.middlewares.length,
        };
    }
}

/**
 * Metadata automatically added to all emitted events.
 */
export interface EventMetadata {
    correlationId: string;
    busId: string;
    timestamp: number;
    eventName: string;
}

/**
 * Diagnostic information about an event bus instance.
 */
export interface EventBusDiagnostics {
    busId: string;
    middlewareCount: number;
    listenerCounts: Record<string, number>;
    maxListeners: number;
}

/**
 * Utility function to create a typed event bus instance.
 */
export function createTypedEventBus<EventMap extends Record<string, unknown>>(name?: string): TypedEventBus<EventMap> {
    return new TypedEventBus<EventMap>(name);
}

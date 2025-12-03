/**
 * Property-based fuzzing tests for TypedEventBus operations.
 *
 * @remarks
 * Tests event bus operations using property-based testing with fast-check.
 * Validates that event handling, middleware processing, and data transformation
 * handle malformed input and edge cases gracefully.
 *
 * Key areas tested:
 *
 * - Event data serialization and metadata injection
 * - Middleware chain execution with various data types
 * - Error handling in event processing
 * - Memory safety with large event payloads
 * - Correlation ID generation and tracking
 *
 * @packageDocumentation
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import {
    TypedEventBus,
    type EventPayloadValue,
} from "../../events/TypedEventBus";

// Define test event map with index signature for TypedEventBus compatibility
interface TestEvents extends Record<string, EventPayloadValue> {
    "test:simple": { message: string };
    "test:complex": {
        id: string;
        data: unknown;
        metadata?: Record<string, unknown> | undefined;
    };
    "test:empty": Record<string, never>;
    [key: string]: EventPayloadValue; // Index signature for UnknownRecord constraint
    [key: symbol]: EventPayloadValue; // Symbol index signature
}

describe("TypedEventBus Fuzzing Tests", () => {
    let eventBus: TypedEventBus<TestEvents>;

    beforeEach(() => {
        vi.clearAllMocks();
        eventBus = new TypedEventBus<TestEvents>("test-bus");
    });

    afterEach(() => {
        eventBus.clearMiddleware();
        eventBus.removeAllListeners();
    });

    describe("Event Data Transformation Fuzzing", () => {
        it("should handle various data types in event payloads", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.string({ minLength: 0, maxLength: 200 }),
                        data: fc.oneof(
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.boolean(),
                            fc.integer(),
                            fc.float(),
                            fc.string({ maxLength: 1000 }),
                            fc.array(fc.anything(), { maxLength: 100 }),
                            fc.dictionary(
                                fc.string({ maxLength: 50 }),
                                fc.anything(),
                                { maxKeys: 20 }
                            ),
                            // Test circular references (should be handled safely)
                            fc.constant({}).map((obj) => {
                                (obj as any).circular = obj;
                                return obj;
                            }),
                            // Test functions and symbols (should be serialized safely)
                            fc.constant(() => "test function"),
                            fc.constant(Symbol("test")),
                            // Test date objects
                            fc.date(),
                            // Test regexp
                            fc.constant(/test-pattern/gi)
                        ),
                        metadata: fc.option(
                            fc.dictionary(
                                fc.string({ maxLength: 50 }),
                                fc.oneof(
                                    fc.string({ maxLength: 100 }),
                                    fc.integer(),
                                    fc.boolean(),
                                    fc.constant(undefined)
                                )
                            ),
                            { nil: undefined }
                        ),
                    }),
                    async (eventData) => {
                        const receivedEvents: any[] = [];

                        // Set up listener to capture events
                        eventBus.onTyped("test:complex", (data) => {
                            receivedEvents.push(data);
                        });

                        // Emit event and verify it doesn't crash
                        await expect(
                            eventBus.emitTyped("test:complex", eventData)
                        ).resolves.toBeUndefined();

                        // Verify event was received
                        expect(receivedEvents).toHaveLength(1);

                        const received = receivedEvents[0];

                        // Verify metadata was added
                        expect(received).toHaveProperty("_meta");
                        expect(received._meta).toHaveProperty("busId");
                        expect(received._meta).toHaveProperty("correlationId");
                        expect(received._meta).toHaveProperty("timestamp");
                        expect(received._meta).toHaveProperty("eventName");

                        // Verify original data is preserved (for serializable data)
                        expect(received.id).toBe(eventData.id);

                        // Data might be transformed for safety, but should be defined
                        expect(received).toHaveProperty("data");

                        // Clean up listeners after each iteration to prevent accumulation
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("should handle events with existing _meta properties safely", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.string({ minLength: 1, maxLength: 100 }),
                        data: fc.anything(),
                        _meta: fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.record({
                                existing: fc.string(),
                                busId: fc.option(fc.string()),
                                correlationId: fc.option(fc.string()),
                            }),
                            fc.constant(null),
                            fc.array(fc.anything())
                        ),
                    }),
                    async (eventData) => {
                        const receivedEvents: any[] = [];

                        eventBus.onTyped("test:complex", (data) => {
                            receivedEvents.push(data);
                        });

                        await eventBus.emitTyped("test:complex", eventData);

                        expect(receivedEvents).toHaveLength(1);
                        const received = receivedEvents[0];

                        // Should have new _meta, but preserve original as _originalMeta if it existed
                        expect(received).toHaveProperty("_meta");
                        expect(received._meta).toHaveProperty("busId");
                        expect(received._meta).toHaveProperty("correlationId");

                        // Original _meta should be preserved as _originalMeta
                        if (eventData._meta !== undefined) {
                            expect(received).toHaveProperty("_originalMeta");
                        }

                        // Clean up listeners after each iteration to prevent accumulation
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("Middleware Processing Fuzzing", () => {
        it("should handle middleware with various data transformations", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            // Middleware behavior type
                            behavior: fc.constantFrom(
                                "passthrough",
                                "modify",
                                "delay",
                                "throw",
                                "async-throw"
                            ),
                            delay: fc.integer({ min: 0, max: 100 }),
                            shouldCallNext: fc.boolean(),
                        }),
                        { minLength: 0, maxLength: 10 }
                    ),
                    fc.record({
                        message: fc.string({ maxLength: 200 }),
                    }),
                    async (middlewareConfigs, eventData) => {
                        // Clear any middleware from previous property test iterations
                        eventBus.clearMiddleware();

                        const executionOrder: string[] = [];
                        let shouldExpectError = false;

                        // Determine if any throw middleware will actually be reached
                        for (let i = 0; i < middlewareConfigs.length; i++) {
                            const config = middlewareConfigs[i];

                            // Check if this middleware will be reached (all previous must call next)
                            const allPreviousCallNext = middlewareConfigs
                                .slice(0, i)
                                .every((prev) => prev.shouldCallNext);

                            if (
                                allPreviousCallNext &&
                                (config!.behavior === "throw" ||
                                    config!.behavior === "async-throw")
                            ) {
                                shouldExpectError = true;
                                break; // Found the first throwing middleware that will execute
                            }

                            // If this middleware doesn't call next, no subsequent middleware will execute
                            if (!config!.shouldCallNext) {
                                break;
                            }
                        }

                        // Register middleware based on configs
                        for (const [
                            index,
                            config,
                        ] of middlewareConfigs.entries()) {
                            eventBus.registerMiddleware(
                                async (_eventName, _data, next) => {
                                    executionOrder.push(
                                        `middleware-${index}-start`
                                    );

                                    switch (config.behavior) {
                                        case "delay": {
                                            await new Promise((resolve) =>
                                                setTimeout(
                                                    resolve,
                                                    config.delay
                                                )
                                            );
                                            break;
                                        }
                                        case "throw": {
                                            throw new Error(
                                                `Middleware ${index} error`
                                            );
                                        }
                                        case "async-throw": {
                                            await Promise.reject(
                                                new Error(
                                                    `Async middleware ${index} error`
                                                )
                                            );
                                            break;
                                        }
                                    }

                                    if (config.shouldCallNext) {
                                        await next();
                                    }

                                    executionOrder.push(
                                        `middleware-${index}-end`
                                    );
                                }
                            );
                        }

                        const receivedEvents: any[] = [];
                        eventBus.onTyped("test:simple", (data) => {
                            receivedEvents.push(data);
                        });

                        if (shouldExpectError) {
                            // Should throw if any middleware throws
                            await expect(
                                eventBus.emitTyped("test:simple", eventData)
                            ).rejects.toThrowError();
                            // Event should not be delivered if middleware fails
                            expect(receivedEvents).toHaveLength(0);
                        } else {
                            // Should complete successfully
                            await expect(
                                eventBus.emitTyped("test:simple", eventData)
                            ).resolves.toBeUndefined();

                            // Event should be delivered if all middleware completes
                            if (
                                middlewareConfigs.every((m) => m.shouldCallNext)
                            ) {
                                expect(receivedEvents).toHaveLength(1);
                            }
                        }

                        // Clean up listeners and middleware after each iteration
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 25 }
            );
        });

        it("should handle middleware registration limits", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 1, max: 50 }),
                    async (middlewareCount) => {
                        const busWithLimit = new TypedEventBus<TestEvents>(
                            "test-bus",
                            {
                                maxMiddleware: 5,
                            }
                        );

                        let registeredCount = 0;
                        let threwError = false;

                        try {
                            for (let i = 0; i < middlewareCount; i++) {
                                busWithLimit.registerMiddleware(
                                    async (_eventName, _data, next) => {
                                        await next();
                                    }
                                );
                                registeredCount++;
                            }
                        } catch (error) {
                            threwError = true;
                        }

                        if (middlewareCount <= 5) {
                            expect(threwError).toBeFalsy();
                            expect(registeredCount).toBe(middlewareCount);
                        } else {
                            expect(threwError).toBeTruthy();
                            expect(registeredCount).toBeLessThan(
                                middlewareCount
                            );
                        }

                        // Clean up the test bus after each iteration
                        busWithLimit.removeAllListeners();
                        busWithLimit.clearMiddleware();
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("Memory and Performance Fuzzing", () => {
        it("should handle large event payloads efficiently", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        id: fc.string({ maxLength: 100 }),
                        data: fc.oneof(
                            // Large string
                            fc.string({ minLength: 10_000, maxLength: 50_000 }),
                            // Large array
                            fc.array(fc.string({ maxLength: 100 }), {
                                minLength: 100,
                                maxLength: 1000,
                            }),
                            // Deep nested object
                            fc.letrec((tie) => ({
                                leaf: fc.record({
                                    value: fc.string({ maxLength: 50 }),
                                }),
                                node: fc.record({
                                    children: fc.array(tie("leaf"), {
                                        maxLength: 10,
                                    }),
                                    metadata: fc.dictionary(
                                        fc.string({ maxLength: 20 }),
                                        fc.string({ maxLength: 100 })
                                    ),
                                }),
                            })).node
                        ),
                    }),
                    async (largeEventData) => {
                        const startTime = Date.now();
                        const receivedEvents: any[] = [];

                        eventBus.onTyped("test:complex", (data) => {
                            receivedEvents.push(data);
                        });

                        // Should handle large payloads without hanging
                        await Promise.race([
                            eventBus.emitTyped("test:complex", largeEventData),
                            new Promise((_, reject) =>
                                setTimeout(
                                    () => reject(new Error("Timeout")),
                                    5000
                                )
                            ),
                        ]);

                        const duration = Date.now() - startTime;

                        // Should complete in reasonable time (less than 1 second for even large payloads)
                        expect(duration).toBeLessThan(1000);
                        expect(receivedEvents).toHaveLength(1);

                        // Should preserve basic structure
                        expect(receivedEvents[0]).toHaveProperty("id");
                        expect(receivedEvents[0]).toHaveProperty("data");
                        expect(receivedEvents[0]).toHaveProperty("_meta");

                        // Clean up listeners after each iteration to prevent accumulation
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 10 } // Fewer runs for performance tests
            );
        });
    });

    describe("Listener Management Fuzzing", () => {
        it("should handle rapid listener registration and removal", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            action: fc.constantFrom(
                                "add",
                                "remove",
                                "removeAll"
                            ),
                            eventType: fc.constantFrom(
                                "test:simple",
                                "test:complex",
                                "test:empty"
                            ),
                        }),
                        { minLength: 5, maxLength: 100 }
                    ),
                    async (actions) => {
                        const listeners = new Map<string, Function[]>();

                        for (const action of actions) {
                            switch (action.action) {
                                case "add": {
                                    const listener = vi.fn();
                                    if (action.eventType === "test:simple") {
                                        eventBus.onTyped(
                                            "test:simple",
                                            listener
                                        );
                                    } else if (
                                        action.eventType === "test:complex"
                                    ) {
                                        eventBus.onTyped(
                                            "test:complex",
                                            listener
                                        );
                                    }

                                    const existing =
                                        listeners.get(action.eventType) ?? [];
                                    listeners.set(action.eventType, [
                                        ...existing,
                                        listener,
                                    ]);
                                    break;
                                }
                                case "remove": {
                                    const existing =
                                        listeners.get(action.eventType) ?? [];
                                    if (existing.length > 0) {
                                        const listener = existing[0];
                                        if (
                                            action.eventType === "test:simple"
                                        ) {
                                            eventBus.offTyped(
                                                "test:simple",
                                                listener as any
                                            );
                                        } else if (
                                            action.eventType === "test:complex"
                                        ) {
                                            eventBus.offTyped(
                                                "test:complex",
                                                listener as any
                                            );
                                        }
                                        listeners.set(
                                            action.eventType,
                                            existing.slice(1)
                                        );
                                    }
                                    break;
                                }
                                case "removeAll": {
                                    if (action.eventType === "test:simple") {
                                        eventBus.offTyped("test:simple");
                                    } else if (
                                        action.eventType === "test:complex"
                                    ) {
                                        eventBus.offTyped("test:complex");
                                    }
                                    listeners.set(action.eventType, []);
                                    break;
                                }
                            }
                        }

                        // Should not crash during rapid listener manipulation
                        expect(true).toBeTruthy();

                        // Should still be able to emit events
                        await expect(
                            eventBus.emitTyped("test:simple", {
                                message: "test",
                            })
                        ).resolves.toBeUndefined();

                        // Clean up listeners after each iteration to prevent accumulation
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 15 }
            );
        });
    });

    describe("Error Resilience Fuzzing", () => {
        it("should handle listener errors gracefully", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            shouldThrow: fc.boolean(),
                            errorType: fc.constantFrom(
                                "sync",
                                "async",
                                "timeout"
                            ),
                            errorMessage: fc.string({ maxLength: 100 }),
                        }),
                        { minLength: 1, maxLength: 10 }
                    ),
                    fc.record({
                        message: fc.string({ maxLength: 200 }),
                    }),
                    async (listenerConfigs, eventData) => {
                        const executedListeners: number[] = [];

                        // Register listeners based on configs
                        for (const [
                            index,
                            config,
                        ] of listenerConfigs.entries()) {
                            eventBus.onTyped("test:simple", async (_data) => {
                                executedListeners.push(index);

                                if (config.shouldThrow) {
                                    switch (config.errorType) {
                                        case "sync": {
                                            throw new Error(
                                                config.errorMessage
                                            );
                                        }
                                        case "async": {
                                            await Promise.reject(
                                                new Error(config.errorMessage)
                                            );
                                            break;
                                        }
                                        case "timeout": {
                                            await new Promise((_, reject) =>
                                                setTimeout(
                                                    () =>
                                                        reject(
                                                            new Error(
                                                                config.errorMessage
                                                            )
                                                        ),
                                                    50
                                                )
                                            );
                                            break;
                                        }
                                    }
                                }
                            });
                        }

                        // Event emission should not throw even if listeners throw
                        await expect(
                            eventBus.emitTyped("test:simple", eventData)
                        ).resolves.toBeUndefined();

                        // All listeners should have been called despite some throwing
                        expect(executedListeners).toHaveLength(
                            listenerConfigs.length
                        );

                        // Clean up listeners after each iteration to prevent accumulation
                        eventBus.removeAllListeners();
                        eventBus.clearMiddleware();
                    }
                ),
                { numRuns: 20 }
            );
        });
    });
});

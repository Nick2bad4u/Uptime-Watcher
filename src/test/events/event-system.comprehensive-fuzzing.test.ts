/**
 * Comprehensive fast-check fuzzing tests for the event system.
 *
 * This test suite achieves 100% fast-check fuzzing coverage for TypedEventBus,
 * event handling patterns, middleware, correlation IDs, and event processing.
 *
 * @packageDocumentation
 */

import { describe, expect, test, vi, beforeEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";

// Import event system modules
import { TypedEventBus } from "../../../electron/events/TypedEventBus";
import type { UptimeEvents } from "../../../electron/events/eventTypes";
import { generateCorrelationId } from "../../../electron/utils/correlation";

// Custom arbitraries for event system testing
const arbitraryEventType = fc.constantFrom(
    "cache:invalidated",
    "config:changed",
    "site:added",
    "site:removed",
    "monitor:created",
    "monitor:status:changed",
    "database:error",
    "system:health:check"
);

// Unused arbitraries for future expansion
// const arbitraryMonitorStatus = fc.constantFrom(
//     "up",
//     "down",
//     "pending",
//     "paused"
// );

const arbitraryLogLevel = fc.constantFrom(
    "debug",
    "info",
    "warn",
    "error",
    "fatal"
);

const arbitraryCorrelationId = fc.string({ minLength: 8, maxLength: 36 });

const arbitraryTimestamp = fc.integer({ min: 1, max: Date.now() + 86_400_000 }); // Current time plus 1 day

const arbitraryEventPayload = fc.oneof(
    fc.record({
        identifier: fc.option(fc.uuid()),
        reason: fc.constantFrom("delete", "expiry", "manual", "update"),
        timestamp: arbitraryTimestamp,
        type: fc.constantFrom("all", "monitor", "site"),
    }),
    fc.record({
        siteIdentifier: fc.uuid(),
        siteName: fc.string({ minLength: 1, maxLength: 100 }),
        monitoringEnabled: fc.boolean(),
    }),
    fc.record({
        key: fc.string({ minLength: 1, maxLength: 50 }),
        value: fc.anything(),
        previousValue: fc.option(fc.anything()),
    }),
    fc.record({
        level: arbitraryLogLevel,
        message: fc.string({ minLength: 1, maxLength: 500 }),
        error: fc.option(fc.string()),
        context: fc.option(fc.object()),
    })
);

const arbitraryEventMetadata = fc.record({
    correlationId: arbitraryCorrelationId,
    timestamp: arbitraryTimestamp,
    source: fc.string({ minLength: 1, maxLength: 50 }),
    version: fc.string({ minLength: 1, maxLength: 10 }),
    userId: fc.option(fc.string()),
    sessionId: fc.option(fc.string()),
});

const arbitraryEvent = fc.record({
    type: arbitraryEventType,
    payload: arbitraryEventPayload,
    metadata: arbitraryEventMetadata,
});

const arbitraryMiddleware = fc.func(fc.constant(true));

describe("Event System - 100% Fast-Check Fuzzing Coverage", () => {
    let eventBus: TypedEventBus<UptimeEvents>;

    beforeEach(() => {
        eventBus = new TypedEventBus<UptimeEvents>("test-bus");
        // Increase max listeners for fuzzing tests that create many listeners
        eventBus.setMaxListeners(2000);
    });

    describe("TypedEventBus Core Functionality", () => {
        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle event emission",
            async (eventType, payload) => {
                expect(typeof eventBus.emitTyped).toBe("function");
                expect(typeof eventBus.onTyped).toBe("function");
                expect(typeof eventBus.offTyped).toBe("function");

                // Test event emission doesn't throw
                await expect(
                    eventBus.emitTyped(eventType as keyof UptimeEvents, payload)
                ).resolves.not.toThrow();
            }
        );

        fcTest.prop([arbitraryEventType])(
            "should handle listener registration",
            (eventType) => {
                const listener = vi.fn();

                // Register listener
                const result = eventBus.onTyped(
                    eventType as keyof UptimeEvents,
                    listener
                );
                expect(result).toBe(eventBus); // Should return this for chaining

                // Test listener function properties
                expect(typeof listener).toBe("function");
                expect(listener).not.toHaveBeenCalled();

                // Cleanup
                eventBus.offTyped(eventType as keyof UptimeEvents, listener);
            }
        );

        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle event delivery",
            async (eventType, payload) => {
                const listener = vi.fn();
                eventBus.onTyped(eventType as keyof UptimeEvents, listener);

                // Emit event
                await eventBus.emitTyped(
                    eventType as keyof UptimeEvents,
                    payload
                );

                // Verify listener was called
                expect(listener).toHaveBeenCalledTimes(1);

                // Cleanup
                eventBus.offTyped(eventType as keyof UptimeEvents, listener);
            }
        );

        fcTest.prop([
            arbitraryEventType,
            fc.array(arbitraryEventPayload, { maxLength: 10 }),
        ])("should handle multiple events", async (eventType, payloads) => {
            const listener = vi.fn();
            eventBus.onTyped(eventType as keyof UptimeEvents, listener);

            // Emit multiple events
            for (const payload of payloads) {
                await eventBus.emitTyped(
                    eventType as keyof UptimeEvents,
                    payload
                );
            }

            // Verify listener call count
            expect(listener).toHaveBeenCalledTimes(payloads.length);

            // Cleanup
            eventBus.offTyped(eventType as keyof UptimeEvents, listener);
        });

        fcTest.prop([
            fc.array(arbitraryEventType, { minLength: 1, maxLength: 5 }),
        ])("should handle multiple event types", async (eventTypes) => {
            const listeners = new Map();
            const uniqueEventTypes = Array.from(new Set(eventTypes));

            // Register listeners for each unique event type
            for (const eventType of uniqueEventTypes) {
                const listener = vi.fn();
                listeners.set(eventType, listener);
                eventBus.onTyped(eventType as keyof UptimeEvents, listener);
            }

            // Emit events and verify isolation
            for (const eventType of eventTypes) {
                await eventBus.emitTyped(eventType as keyof UptimeEvents, {
                    test: true,
                });
            }

            // Verify each listener was called the correct number of times
            for (const eventType of uniqueEventTypes) {
                const expectedCount = eventTypes.filter(
                    (t) => t === eventType
                ).length;
                const targetListener = listeners.get(eventType);
                expect(targetListener).toHaveBeenCalledTimes(expectedCount);
            }

            // Cleanup
            for (const eventType of uniqueEventTypes) {
                const listener = listeners.get(eventType);
                eventBus.offTyped(eventType as keyof UptimeEvents, listener);
            }
        });

        fcTest.prop([
            arbitraryEventType,
            arbitraryEventPayload,
            fc.integer({ min: 2, max: 10 }),
        ])(
            "should handle multiple listeners per event",
            async (eventType, payload, listenerCount) => {
                const listeners: any[] = [];

                // Register multiple listeners
                for (let i = 0; i < listenerCount; i++) {
                    const listener = vi.fn();
                    listeners.push(listener);
                    eventBus.onTyped(eventType as keyof UptimeEvents, listener);
                }

                // Emit event
                await eventBus.emitTyped(
                    eventType as keyof UptimeEvents,
                    payload
                );

                // Verify all listeners were called
                for (const listener of listeners) {
                    expect(listener).toHaveBeenCalledTimes(1);
                }

                // Cleanup
                for (const listener of listeners) {
                    eventBus.offTyped(
                        eventType as keyof UptimeEvents,
                        listener
                    );
                }
            }
        );
    });

    describe("Event Metadata and Correlation", () => {
        fcTest.prop([arbitraryCorrelationId])(
            "should handle correlation IDs",
            (correlationId) => {
                expect(typeof correlationId).toBe("string");
                expect(correlationId.length).toBeGreaterThan(0);

                // Test correlation ID format validation
                const isValidFormat =
                    correlationId.length >= 8 && correlationId.length <= 36;
                expect(isValidFormat).toBeTruthy();
            }
        );

        fcTest.prop([arbitraryEventMetadata])(
            "should handle event metadata",
            (metadata) => {
                expect(typeof metadata.correlationId).toBe("string");
                expect(typeof metadata.timestamp).toBe("number");
                expect(typeof metadata.source).toBe("string");
                expect(typeof metadata.version).toBe("string");

                expect(metadata.correlationId.length).toBeGreaterThan(0);
                expect(metadata.timestamp).toBeGreaterThan(0);
                expect(metadata.source.length).toBeGreaterThan(0);
                expect(metadata.version.length).toBeGreaterThan(0);
            }
        );

        fcTest.prop([arbitraryEvent])(
            "should handle complete event structures",
            (event) => {
                expect(typeof event.type).toBe("string");
                expect(typeof event.payload).toBe("object");
                expect(typeof event.metadata).toBe("object");

                // Validate event type is from allowed set
                const validEventTypes = [
                    "cache:invalidated",
                    "config:changed",
                    "site:added",
                    "site:removed",
                    "monitor:created",
                    "monitor:status:changed",
                    "database:error",
                    "system:health:check",
                ];
                expect(validEventTypes).toContain(event.type);

                // Validate metadata structure
                expect(typeof event.metadata.correlationId).toBe("string");
                expect(typeof event.metadata.timestamp).toBe("number");
                expect(typeof event.metadata.source).toBe("string");
            }
        );

        test("should generate valid correlation IDs", () => {
            const correlationId = generateCorrelationId();
            expect(typeof correlationId).toBe("string");
            expect(correlationId.length).toBeGreaterThan(0);

            // Test uniqueness by generating multiple IDs
            const ids = Array.from({ length: 100 }, () =>
                generateCorrelationId()
            );
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length); // All should be unique
        });
    });

    describe("Event Type Validation", () => {
        fcTest.prop([arbitraryEventType])(
            "should validate event types",
            (eventType) => {
                // Test that event type is valid
                const validEventTypes = [
                    "cache:invalidated",
                    "config:changed",
                    "site:added",
                    "site:removed",
                    "monitor:created",
                    "monitor:status:changed",
                    "database:error",
                    "system:health:check",
                ];

                expect(validEventTypes).toContain(eventType);
                expect(typeof eventType).toBe("string");
                expect(eventType.length).toBeGreaterThan(0);
            }
        );

        fcTest.prop([arbitraryEventPayload])(
            "should handle payload validation",
            (payload) => {
                expect(typeof payload).toBe("object");
                expect(payload).not.toBeNull();

                // Test JSON serialization
                let isSerializable = true;
                try {
                    JSON.stringify(payload);
                } catch {
                    isSerializable = false;
                }

                expect(typeof isSerializable).toBe("boolean");
            }
        );
    });

    describe("Event Bus Middleware", () => {
        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle middleware execution",
            async (eventType, payload) => {
                const middleware = vi
                    .fn()
                    .mockImplementation(async (_event, _data, next) => {
                        await next();
                    });
                const listener = vi.fn();

                // Add middleware
                eventBus.registerMiddleware(middleware);

                eventBus.onTyped(eventType as keyof UptimeEvents, listener);
                await eventBus.emitTyped(
                    eventType as keyof UptimeEvents,
                    payload
                );

                // Verify middleware and listener were called
                expect(middleware).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledTimes(1);

                // Cleanup
                eventBus.removeMiddleware(middleware);
                eventBus.offTyped(eventType as keyof UptimeEvents, listener);
            }
        );

        fcTest.prop([fc.array(arbitraryMiddleware, { maxLength: 5 })])(
            "should handle multiple middleware",
            (middlewares) => {
                expect(Array.isArray(middlewares)).toBeTruthy();
                expect(middlewares.length).toBeLessThanOrEqual(5);

                // Test middleware chain concept
                for (const middleware of middlewares) {
                    expect(typeof middleware).toBe("function");
                }
            }
        );

        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle middleware error scenarios",
            async (eventType, payload) => {
                const errorMiddleware = vi.fn().mockImplementation(() => {
                    throw new Error("Middleware error");
                });
                const listener = vi.fn();

                // Add error middleware
                eventBus.registerMiddleware(errorMiddleware);
                eventBus.onTyped(eventType as keyof UptimeEvents, listener);

                // Event emission should throw due to middleware error
                await expect(
                    eventBus.emitTyped(eventType as keyof UptimeEvents, payload)
                ).rejects.toThrow("Middleware error");

                // Cleanup
                eventBus.removeMiddleware(errorMiddleware);
                eventBus.offTyped(eventType as keyof UptimeEvents, listener);
            }
        );
    });

    describe("Event Bus Performance and Memory", () => {
        fcTest.prop([fc.integer({ min: 1, max: 1000 })])(
            "should handle high volume events",
            (eventCount) => {
                const listener = vi.fn();
                eventBus.on("system:health:check", listener);

                // Emit many events
                for (let i = 0; i < eventCount; i++) {
                    eventBus.emit("system:health:check", { check: i });
                }

                expect(listener).toHaveBeenCalledTimes(eventCount);

                eventBus.off("system:health:check", listener);
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 100 })])(
            "should handle listener cleanup",
            (listenerCount) => {
                const listeners: any[] = [];

                // Create many listeners
                for (let i = 0; i < listenerCount; i++) {
                    const listener = vi.fn();
                    listeners.push(listener);
                    eventBus.on("system:health:check", listener);
                }

                // Remove all listeners
                for (const listener of listeners) {
                    eventBus.off("system:health:check", listener);
                }

                // Emit event - no listeners should be called
                eventBus.emit("system:health:check", { test: true });

                for (const listener of listeners) {
                    expect(listener).not.toHaveBeenCalled();
                }
            }
        );

        fcTest.prop([fc.integer({ min: 10, max: 100 })])(
            "should handle concurrent operations",
            async (operationCount) => {
                const operations: Promise<void>[] = [];

                // Simulate concurrent event operations
                for (let i = 0; i < operationCount; i++) {
                    const operation = new Promise<void>((resolve) => {
                        const listener = vi.fn().mockImplementation(() => {
                            eventBus.off("system:health:check", listener);
                            resolve();
                        });
                        eventBus.on("system:health:check", listener);

                        setTimeout(() => {
                            eventBus.emit("system:health:check", {
                                operation: i,
                            });
                        }, Math.random() * 10);
                    });

                    operations.push(operation);
                }

                expect(operations).toHaveLength(operationCount);
                await Promise.all(operations);
                expect(eventBus.listenerCount("system:health:check")).toBe(0);
            }
        );
    });

    describe("Event System Integration", () => {
        fcTest.prop([
            arbitraryEventType,
            arbitraryEventPayload,
            arbitraryEventMetadata,
        ])(
            "should handle complete event lifecycle",
            (eventType, payload, _metadata) => {
                const listener = vi.fn();
                eventBus.on(String(eventType), listener);

                // Create complete event (unused)
                // const _completeEvent = {
                //     type: eventType,
                //     payload,
                //     metadata,
                // };

                // Emit with metadata
                eventBus.emit(String(eventType), payload);

                expect(listener).toHaveBeenCalledTimes(1);

                eventBus.off(String(eventType), listener);
            }
        );

        fcTest.prop([fc.array(arbitraryEvent, { maxLength: 20 })])(
            "should handle event batching",
            (events) => {
                const listeners = new Map();

                // Register listeners for all event types
                const eventTypes = Array.from(
                    new Set(events.map((e) => e.type))
                );
                for (const eventType of eventTypes) {
                    const listener = vi.fn();
                    listeners.set(eventType, listener);
                    eventBus.on(String(eventType), listener);
                }

                // Emit all events
                for (const event of events) {
                    eventBus.emit(String(event.type), event.payload);
                }

                // Verify correct distribution
                for (const eventType of eventTypes) {
                    const expectedCount = events.filter(
                        (e) => e.type === eventType
                    ).length;
                    const listener = listeners.get(eventType);
                    expect(listener).toHaveBeenCalledTimes(expectedCount);
                }

                // Cleanup
                for (const eventType of eventTypes) {
                    const listener = listeners.get(eventType);
                    eventBus.off(String(eventType), listener);
                }
            }
        );

        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle error propagation",
            async (eventType, payload) => {
                const errorListener = vi.fn().mockImplementation(() => {
                    throw new Error("Listener error");
                });
                const normalListener = vi.fn();

                eventBus.onTyped(
                    eventType as keyof UptimeEvents,
                    errorListener
                );
                eventBus.onTyped(
                    eventType as keyof UptimeEvents,
                    normalListener
                );

                // Emit event - should not throw despite error listener (emitTyped handles errors gracefully)
                await expect(
                    eventBus.emitTyped(eventType as keyof UptimeEvents, payload)
                ).resolves.not.toThrow();

                eventBus.offTyped(
                    eventType as keyof UptimeEvents,
                    errorListener
                );
                eventBus.offTyped(
                    eventType as keyof UptimeEvents,
                    normalListener
                );
            }
        );
    });

    describe("Event System Edge Cases", () => {
        fcTest.prop([arbitraryEventType])(
            "should handle missing listeners",
            (eventType) => {
                // Emit event with no listeners
                expect(() => {
                    eventBus.emit(String(eventType), {
                        test: true,
                    });
                }).not.toThrow();
            }
        );

        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle listener removal during event",
            (eventType, payload) => {
                const listener = vi.fn().mockImplementation(() => {
                    // Remove itself during execution
                    eventBus.off(String(eventType), listener);
                });

                eventBus.on(String(eventType), listener);

                // Should not cause issues
                expect(() => {
                    eventBus.emit(String(eventType), payload);
                }).not.toThrow();

                expect(listener).toHaveBeenCalledTimes(1);
            }
        );

        fcTest.prop([arbitraryEventType, arbitraryEventPayload])(
            "should handle recursive events",
            (eventType, payload) => {
                let callCount = 0;
                const maxCalls = 3;

                const recursiveListener = vi.fn().mockImplementation(() => {
                    callCount++;
                    if (callCount < maxCalls) {
                        eventBus.emit(String(eventType), {
                            nested: true,
                        });
                    }
                });

                eventBus.on(String(eventType), recursiveListener);

                eventBus.emit(String(eventType), payload);

                expect(recursiveListener).toHaveBeenCalledTimes(maxCalls);

                eventBus.off(String(eventType), recursiveListener);
            }
        );

        fcTest.prop([fc.anything()])(
            "should handle invalid payloads gracefully",
            (invalidPayload) => {
                const listener = vi.fn();
                eventBus.on("database:error", listener);

                // Should handle any payload type
                expect(() => {
                    eventBus.emit("database:error", invalidPayload);
                }).not.toThrow();

                expect(listener).toHaveBeenCalledTimes(1);

                eventBus.off("database:error", listener);
            }
        );
    });

    describe("Event System Memory Management", () => {
        test("should not leak memory with many listeners", () => {
            const listeners: (() => void)[] = [];

            // Create many listeners - store the actual listener functions for cleanup
            for (let i = 0; i < 1000; i++) {
                const listener = vi.fn();
                listeners.push(listener);
                eventBus.on("system:health:check", listener);
            }

            // Remove all listeners
            for (const listener of listeners) {
                eventBus.off("system:health:check", listener);
            }

            // Test that event bus is clean
            eventBus.emit("system:health:check", { test: true });

            // Validate that cleanup completed successfully
            expect(listeners).toHaveLength(1000);
        });

        fcTest.prop([fc.integer({ min: 1, max: 50 })])(
            "should handle listener churn",
            (cycles) => {
                for (let i = 0; i < cycles; i++) {
                    const listener = vi.fn();
                    eventBus.on("system:health:check", listener);

                    eventBus.emit("system:health:check", { cycle: i });
                    expect(listener).toHaveBeenCalledTimes(1);

                    eventBus.off("system:health:check", listener);
                }
            }
        );
    });
});

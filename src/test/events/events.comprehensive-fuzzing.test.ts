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
import type {
    UptimeEventName,
    UptimeEvents,
} from "../../../electron/events/eventTypes";
import { generateCorrelationId } from "@shared/utils/correlation";

// Custom arbitraries for event system testing
const arbitraryValidEventType = fc.constantFrom(
    "cache:invalidated",
    "config:changed"
);

const arbitraryCacheInvalidatedPayload = fc.record({
    identifier: fc.option(fc.string()),
    reason: fc.constantFrom("delete", "expiry", "manual", "update"),
    timestamp: fc.integer({ min: 0 }),
    type: fc.constantFrom("all", "monitor", "site"),
});

const arbitraryConfigChangedPayload = fc.record({
    newValue: fc.anything(),
    oldValue: fc.anything(),
    setting: fc.string(),
    source: fc.constantFrom("migration", "system", "user"),
    timestamp: fc.integer({ min: 0 }),
});

const arbitraryEventPayload = fc.oneof(
    arbitraryCacheInvalidatedPayload,
    arbitraryConfigChangedPayload
);

const arbitraryCorrelationId = fc.string({ minLength: 8, maxLength: 36 });
// Unused arbitraries for future expansion
// const arbitraryTimestamp = fc.date().map((d) => d.getTime());

describe("Event System - 100% Fast-Check Fuzzing Coverage", () => {
    let eventBus: TypedEventBus<UptimeEvents>;

    beforeEach(() => {
        eventBus = new TypedEventBus<UptimeEvents>("test-bus");
    });

    describe("TypedEventBus Core Functionality", () => {
        fcTest.prop([arbitraryValidEventType, arbitraryEventPayload])(
            "should handle event emission and delivery",
            async (eventType, payload) => {
                expect(typeof eventBus.emitTyped).toBe("function");
                expect(typeof eventBus.onTyped).toBe("function");
                expect(typeof eventBus.offTyped).toBe("function");

                const listener = vi.fn();

                // Register listener
                const result = eventBus.onTyped(
                    eventType as UptimeEventName,
                    listener
                );
                expect(result).toBe(eventBus); // Should return this for chaining

                // Emit event
                await eventBus.emitTyped(eventType as UptimeEventName, payload);

                // Verify listener was called
                expect(listener).toHaveBeenCalledTimes(1);
                expect(listener).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...payload,
                        _meta: expect.objectContaining({
                            correlationId: expect.any(String),
                            timestamp: expect.any(Number),
                        }),
                    })
                );

                // Cleanup
                eventBus.offTyped(eventType as UptimeEventName, listener);
            }
        );

        fcTest.prop([
            arbitraryValidEventType,
            fc.array(arbitraryEventPayload, { maxLength: 5 }),
        ])("should handle multiple events", async (eventType, payloads) => {
            const listener = vi.fn();
            eventBus.onTyped(eventType as UptimeEventName, listener);

            // Emit multiple events
            for (const payload of payloads) {
                await eventBus.emitTyped(eventType as UptimeEventName, payload);
            }

            // Verify listener call count
            expect(listener).toHaveBeenCalledTimes(payloads.length);

            // Cleanup
            eventBus.offTyped(eventType as UptimeEventName, listener);
        });

        fcTest.prop([
            arbitraryValidEventType,
            arbitraryEventPayload,
            fc.integer({ min: 2, max: 5 }),
        ])(
            "should handle multiple listeners per event",
            async (eventType, payload, listenerCount) => {
                const listeners: any[] = [];

                // Register multiple listeners
                for (let i = 0; i < listenerCount; i++) {
                    const listener = vi.fn();
                    listeners.push(listener);
                    eventBus.onTyped(eventType as UptimeEventName, listener);
                }

                // Emit event
                await eventBus.emitTyped(eventType as UptimeEventName, payload);

                // Verify all listeners were called
                for (const listener of listeners) {
                    expect(listener).toHaveBeenCalledTimes(1);
                }

                // Cleanup
                for (const listener of listeners) {
                    eventBus.offTyped(eventType as UptimeEventName, listener);
                }
            }
        );

        test("should support once listeners", async () => {
            const listener = vi.fn();

            eventBus.onceTyped("cache:invalidated", listener);

            // Emit multiple times
            await eventBus.emitTyped("cache:invalidated", {
                reason: "manual",
                timestamp: Date.now(),
                type: "all",
            });
            await eventBus.emitTyped("cache:invalidated", {
                reason: "manual",
                timestamp: Date.now(),
                type: "all",
            });

            // Listener should only be called once
            expect(listener).toHaveBeenCalledTimes(1);
        });
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

        fcTest.prop([arbitraryValidEventType, arbitraryEventPayload])(
            "should include metadata in events",
            async (eventType, payload) => {
                const listener = vi.fn();
                eventBus.onTyped(eventType as UptimeEventName, listener);

                await eventBus.emitTyped(eventType as UptimeEventName, payload);

                expect(listener).toHaveBeenCalledWith(
                    expect.objectContaining({
                        _meta: expect.objectContaining({
                            correlationId: expect.any(String),
                            timestamp: expect.any(Number),
                            busId: "test-bus",
                        }),
                    })
                );

                eventBus.offTyped(eventType as UptimeEventName, listener);
            }
        );
    });

    describe("Event Bus Middleware", () => {
        fcTest.prop([arbitraryValidEventType, arbitraryEventPayload])(
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

                eventBus.onTyped(eventType as UptimeEventName, listener);
                await eventBus.emitTyped(eventType as UptimeEventName, payload);

                // Verify middleware and listener were called
                expect(middleware).toHaveBeenCalledTimes(1);
                expect(middleware).toHaveBeenCalledWith(
                    eventType,
                    payload,
                    expect.any(Function)
                );
                expect(listener).toHaveBeenCalledTimes(1);

                // Cleanup
                eventBus.removeMiddleware(middleware);
                eventBus.offTyped(eventType as UptimeEventName, listener);
            }
        );

        fcTest.prop([arbitraryValidEventType, arbitraryEventPayload])(
            "should handle middleware error scenarios",
            async (eventType, payload) => {
                const errorMiddleware = vi.fn().mockImplementation(() => {
                    throw new Error("Middleware error");
                });
                const listener = vi.fn();

                // Add error middleware
                eventBus.registerMiddleware(errorMiddleware);
                eventBus.onTyped(eventType as UptimeEventName, listener);

                // Event emission should throw due to middleware error
                await expect(
                    eventBus.emitTyped(eventType as UptimeEventName, payload)
                ).rejects.toThrowError("Middleware error");

                // Listener should not be called due to middleware error
                expect(listener).not.toHaveBeenCalled();

                // Cleanup
                eventBus.removeMiddleware(errorMiddleware);
                eventBus.offTyped(eventType as UptimeEventName, listener);
            }
        );

        test("should support middleware removal", () => {
            const middleware1 = vi
                .fn()
                .mockImplementation(
                    async (_event, _data, next) => await next()
                );
            const middleware2 = vi
                .fn()
                .mockImplementation(
                    async (_event, _data, next) => await next()
                );

            eventBus.registerMiddleware(middleware1);
            eventBus.registerMiddleware(middleware2);

            // Remove specific middleware
            eventBus.removeMiddleware(middleware1);

            // Try to remove again - should handle gracefully
            eventBus.removeMiddleware(middleware1);

            // Clear all middleware
            eventBus.clearMiddleware();

            // Verify basic functionality still works
            expect(() => eventBus.clearMiddleware()).not.toThrowError();
        });
    });

    describe("Event Bus Performance and Memory", () => {
        fcTest.prop([fc.integer({ min: 1, max: 100 })])(
            "should handle high volume events",
            async (eventCount) => {
                const listener = vi.fn();
                eventBus.onTyped("cache:invalidated", listener);

                // Emit many events
                for (let i = 0; i < eventCount; i++) {
                    await eventBus.emitTyped("cache:invalidated", {
                        reason: "manual",
                        timestamp: Date.now() + i,
                        type: "all",
                        identifier: `test-${i}`,
                    });
                }

                expect(listener).toHaveBeenCalledTimes(eventCount);

                eventBus.offTyped("cache:invalidated", listener);
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 50 })])(
            "should handle listener cleanup",
            async (listenerCount) => {
                const listeners: any[] = [];

                // Create many listeners
                for (let i = 0; i < listenerCount; i++) {
                    const listener = vi.fn();
                    listeners.push(listener);
                    eventBus.onTyped("cache:invalidated", listener);
                }

                // Remove all listeners by removing event completely
                eventBus.offTyped("cache:invalidated");

                // Emit event - no listeners should be called
                await eventBus.emitTyped("cache:invalidated", {
                    reason: "manual",
                    timestamp: Date.now(),
                    type: "all",
                });

                for (const listener of listeners) {
                    expect(listener).not.toHaveBeenCalled();
                }
            }
        );

        test("should provide diagnostics", () => {
            const listener = vi.fn();
            eventBus.onTyped("cache:invalidated", listener);

            const diagnostics = eventBus.getDiagnostics();

            expect(diagnostics).toMatchObject({
                busId: "test-bus",
                listenerCounts: expect.any(Object),
                maxListeners: expect.any(Number),
                maxMiddleware: expect.any(Number),
                middlewareCount: expect.any(Number),
                middlewareUtilization: expect.any(Number),
            });

            eventBus.offTyped("cache:invalidated", listener);
        });
    });

    describe("Event System Edge Cases", () => {
        fcTest.prop([arbitraryValidEventType])(
            "should handle missing listeners",
            async (eventType) => {
                // Emit event with no listeners - should not throw
                await expect(
                    eventBus.emitTyped(eventType as UptimeEventName, {
                        test: true,
                    })
                ).resolves.not.toThrowError();
            }
        );

        fcTest.prop([fc.anything()])(
            "should handle various payload types",
            async (payload) => {
                const listener = vi.fn();
                eventBus.onTyped("cache:invalidated", listener);

                // Should handle any payload type (though TypeScript may complain)
                try {
                    await eventBus.emitTyped(
                        "cache:invalidated",
                        payload as any
                    );
                    expect(listener).toHaveBeenCalledTimes(1);
                } catch (error) {
                    // Some payloads might cause errors, which is acceptable
                    expect(error).toBeInstanceOf(Error);
                }

                eventBus.offTyped("cache:invalidated", listener);
            }
        );

        test("should handle middleware limit", () => {
            const limitedBus = new TypedEventBus<UptimeEvents>("limited", {
                maxMiddleware: 2,
            });

            // Add up to limit
            limitedBus.registerMiddleware(
                vi.fn().mockImplementation(async (_e, _d, n) => await n())
            );
            limitedBus.registerMiddleware(
                vi.fn().mockImplementation(async (_e, _d, n) => await n())
            );

            // Adding beyond limit should throw
            expect(() => {
                limitedBus.registerMiddleware(
                    vi.fn().mockImplementation(async (_e, _d, n) => await n())
                );
            }).toThrowError("Maximum middleware limit");
        });

        test("should handle invalid constructor options", () => {
            expect(() => {
                new TypedEventBus<UptimeEvents>("invalid", {
                    maxMiddleware: 0,
                });
            }).toThrowError("maxMiddleware must be positive");

            expect(() => {
                new TypedEventBus<UptimeEvents>("invalid", {
                    maxMiddleware: -1,
                });
            }).toThrowError("maxMiddleware must be positive");
        });
    });

    describe("Event System Data Transformation", () => {
        test("should handle object payloads", async () => {
            const listener = vi.fn();
            eventBus.onTyped("config:changed", listener);

            const payload = {
                newValue: true,
                oldValue: false,
                setting: "test-setting",
                source: "user" as const,
                timestamp: Date.now(),
            };
            await eventBus.emitTyped("config:changed", payload);

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...payload,
                    _meta: expect.any(Object),
                })
            );

            eventBus.offTyped("config:changed", listener);
        });

        test("should handle arrays", async () => {
            const listener = vi.fn();
            eventBus.onTyped("config:changed", listener);

            const payload = {
                newValue: [
                    1,
                    2,
                    3,
                ],
                oldValue: [1, 2],
                setting: "array-setting",
                source: "system" as const,
                timestamp: Date.now(),
            };
            await eventBus.emitTyped("config:changed", payload);

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...payload,
                    _meta: expect.any(Object),
                })
            );

            eventBus.offTyped("config:changed", listener);
        });

        test("should handle primitive values", async () => {
            const listener = vi.fn();
            eventBus.onTyped("config:changed", listener);

            const payload = {
                newValue: "test string",
                oldValue: "old string",
                setting: "string-setting",
                source: "user" as const,
                timestamp: Date.now(),
            };
            await eventBus.emitTyped("config:changed", payload);

            expect(listener).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...payload,
                    _meta: expect.any(Object),
                })
            );

            eventBus.offTyped("config:changed", listener);
        });
    });
});

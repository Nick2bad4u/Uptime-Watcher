/**
 * Comprehensive tests for TypedEventBus - targeting 90%+ branch coverage
 * Tests all middleware, error handling, data transformation, and edge cases
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TypedEventBus, createTypedEventBus, type EventMiddleware, type EventBusDiagnostics } from "../../events/TypedEventBus";

// Mock logger to prevent actual logging during tests
vi.mock("../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock correlation ID generator to get predictable results
vi.mock("../../utils/correlation", () => ({
    generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

// Define comprehensive test event types
interface TestEvents extends Record<string, unknown> {
    "string-event": string;
    "number-event": number;
    "object-event": { data: string; nested: { value: number } };
    "array-event": number[];
    "object-with-meta": { data: string; _meta: string };
    "complex-object": { id: string; items: Array<{ name: string; value: number }> };
    "primitive-boolean": boolean;
    "null-event": null;
    "undefined-event": undefined;
}

describe("TypedEventBus - Comprehensive Coverage", () => {
    let eventBus: TypedEventBus<TestEvents>;
    let mockMiddleware: EventMiddleware;
    let mockMiddleware2: EventMiddleware;
    let mockListener: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        eventBus = new TypedEventBus<TestEvents>("test-bus");
        mockListener = vi.fn();
        mockMiddleware = vi.fn(async (event, data, next) => {
            await next();
        });
        mockMiddleware2 = vi.fn(async (event, data, next) => {
            await next();
        });
    });

    afterEach(() => {
        eventBus.removeAllListeners();
        eventBus.clearMiddleware();
    });

    describe("Constructor and Configuration", () => {
        it("should create with default name when none provided", () => {
            const bus = new TypedEventBus<TestEvents>();
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.busId).toBe("test-correlation-id");
        });

        it("should create with custom name", () => {
            const bus = new TypedEventBus<TestEvents>("custom-name");
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.busId).toBe("custom-name");
        });

        it("should use custom maxMiddleware option", () => {
            const bus = new TypedEventBus<TestEvents>("test", { maxMiddleware: 5 });
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.maxMiddleware).toBe(5);
        });

        it("should throw error for invalid maxMiddleware", () => {
            expect(() => new TypedEventBus<TestEvents>("test", { maxMiddleware: 0 })).toThrow(
                "maxMiddleware must be positive, got 0"
            );
            expect(() => new TypedEventBus<TestEvents>("test", { maxMiddleware: -1 })).toThrow(
                "maxMiddleware must be positive, got -1"
            );
        });

        it("should set max listeners to 50 by default", () => {
            const bus = new TypedEventBus<TestEvents>();
            expect(bus.getMaxListeners()).toBe(50);
        });
    });

    describe("Factory Function", () => {
        it("should create TypedEventBus instance via factory", () => {
            const bus = createTypedEventBus<TestEvents>("factory-test", { maxMiddleware: 15 });
            expect(bus).toBeInstanceOf(TypedEventBus);
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.busId).toBe("factory-test");
            expect(diagnostics.maxMiddleware).toBe(15);
        });

        it("should create with default options via factory", () => {
            const bus = createTypedEventBus<TestEvents>();
            expect(bus).toBeInstanceOf(TypedEventBus);
        });
    });

    describe("Middleware System", () => {
        it("should register middleware successfully", () => {
            eventBus.use(mockMiddleware);
            const diagnostics = eventBus.getDiagnostics();
            expect(diagnostics.middlewareCount).toBe(1);
            expect(diagnostics.middlewareUtilization).toBe(5); // 1/20 * 100
        });

        it("should execute middleware in order", async () => {
            const executionOrder: number[] = [];
            
            const middleware1: EventMiddleware = vi.fn(async (event, data, next) => {
                executionOrder.push(1);
                await next();
                executionOrder.push(4);
            });

            const middleware2: EventMiddleware = vi.fn(async (event, data, next) => {
                executionOrder.push(2);
                await next();
                executionOrder.push(3);
            });

            eventBus.use(middleware1);
            eventBus.use(middleware2);
            eventBus.onTyped("string-event", mockListener);

            await eventBus.emitTyped("string-event", "test");

            expect(executionOrder).toEqual([1, 2, 3, 4]);
            expect(middleware1).toHaveBeenCalledWith("string-event", "test", expect.any(Function));
            expect(middleware2).toHaveBeenCalledWith("string-event", "test", expect.any(Function));
            expect(mockListener).toHaveBeenCalled();
        });

        it("should throw error when middleware limit exceeded", () => {
            const bus = new TypedEventBus<TestEvents>("test", { maxMiddleware: 2 });
            
            bus.use(mockMiddleware);
            bus.use(mockMiddleware2);
            
            expect(() => bus.use(vi.fn())).toThrow(
                "Maximum middleware limit (2) exceeded. Consider increasing maxMiddleware or combining middleware functions."
            );
        });

        it("should handle middleware errors and abort emission", async () => {
            const errorMiddleware: EventMiddleware = vi.fn(async () => {
                throw new Error("Middleware error");
            });

            eventBus.use(errorMiddleware);
            eventBus.use(mockMiddleware2); // This should not be called
            eventBus.onTyped("string-event", mockListener);

            await expect(eventBus.emitTyped("string-event", "test")).rejects.toThrow("Middleware error");
            
            expect(errorMiddleware).toHaveBeenCalled();
            expect(mockMiddleware2).not.toHaveBeenCalled();
            expect(mockListener).not.toHaveBeenCalled();
        });

        it("should handle synchronous middleware", async () => {
            const syncMiddleware: EventMiddleware = vi.fn((event, data, next) => {
                next(); // Synchronous call
            });

            eventBus.use(syncMiddleware);
            eventBus.onTyped("string-event", mockListener);

            await eventBus.emitTyped("string-event", "test");

            expect(syncMiddleware).toHaveBeenCalled();
            expect(mockListener).toHaveBeenCalled();
        });

        it("should remove specific middleware", () => {
            eventBus.use(mockMiddleware);
            eventBus.use(mockMiddleware2);
            
            expect(eventBus.getDiagnostics().middlewareCount).toBe(2);
            
            const removed = eventBus.removeMiddleware(mockMiddleware);
            expect(removed).toBe(true);
            expect(eventBus.getDiagnostics().middlewareCount).toBe(1);
        });

        it("should return false when removing non-existent middleware", () => {
            eventBus.use(mockMiddleware);
            const nonExistentMiddleware = vi.fn();
            
            const removed = eventBus.removeMiddleware(nonExistentMiddleware);
            expect(removed).toBe(false);
            expect(eventBus.getDiagnostics().middlewareCount).toBe(1);
        });

        it("should clear all middleware", () => {
            eventBus.use(mockMiddleware);
            eventBus.use(mockMiddleware2);
            
            expect(eventBus.getDiagnostics().middlewareCount).toBe(2);
            
            eventBus.clearMiddleware();
            expect(eventBus.getDiagnostics().middlewareCount).toBe(0);
        });

        it("should skip middleware processing when no middleware registered", async () => {
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(mockListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: "test",
                    _meta: expect.any(Object),
                })
            );
        });
    });

    describe("Data Type Transformations", () => {
        it("should handle string primitives correctly", async () => {
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test string");
            
            expect(mockListener).toHaveBeenCalledWith({
                value: "test string",
                _meta: expect.objectContaining({
                    busId: "test-bus",
                    correlationId: "test-correlation-id",
                    eventName: "string-event",
                    timestamp: expect.any(Number),
                }),
            });
        });

        it("should handle number primitives correctly", async () => {
            eventBus.onTyped("number-event", mockListener);
            
            await eventBus.emitTyped("number-event", 42);
            
            expect(mockListener).toHaveBeenCalledWith({
                value: 42,
                _meta: expect.any(Object),
            });
        });

        it("should handle boolean primitives correctly", async () => {
            eventBus.onTyped("primitive-boolean", mockListener);
            
            await eventBus.emitTyped("primitive-boolean", true);
            
            expect(mockListener).toHaveBeenCalledWith({
                value: true,
                _meta: expect.any(Object),
            });
        });

        it("should handle null values correctly", async () => {
            eventBus.onTyped("null-event", mockListener);
            
            await eventBus.emitTyped("null-event", null);
            
            expect(mockListener).toHaveBeenCalledWith({
                value: null,
                _meta: expect.any(Object),
            });
        });

        it("should handle undefined values correctly", async () => {
            eventBus.onTyped("undefined-event", mockListener);
            
            await eventBus.emitTyped("undefined-event", undefined);
            
            expect(mockListener).toHaveBeenCalledWith({
                value: undefined,
                _meta: expect.any(Object),
            });
        });

        it("should handle objects without _meta property", async () => {
            eventBus.onTyped("object-event", mockListener);
            
            const testData = { data: "test", nested: { value: 123 } };
            await eventBus.emitTyped("object-event", testData);
            
            expect(mockListener).toHaveBeenCalledWith({
                data: "test",
                nested: { value: 123 },
                _meta: expect.any(Object),
            });
        });

        it("should handle objects with existing _meta property", async () => {
            eventBus.onTyped("object-with-meta", mockListener);
            
            const testData = { data: "test", _meta: "existing-meta" };
            await eventBus.emitTyped("object-with-meta", testData);
            
            expect(mockListener).toHaveBeenCalledWith({
                data: "test",
                _meta: expect.any(Object),
                _originalMeta: "existing-meta",
            });
        });

        it("should handle arrays correctly", async () => {
            eventBus.onTyped("array-event", mockListener);
            
            const testArray = [1, 2, 3, 4, 5];
            await eventBus.emitTyped("array-event", testArray);
            
            const receivedData = mockListener.mock.calls[0]?.[0];
            expect(Array.isArray(receivedData)).toBe(true);
            expect(receivedData).toEqual([1, 2, 3, 4, 5]);
            expect(receivedData._meta).toEqual(expect.any(Object));
            
            // Verify _meta is non-enumerable
            expect(Object.propertyIsEnumerable.call(receivedData, "_meta")).toBe(false);
        });

        it("should handle complex objects correctly", async () => {
            eventBus.onTyped("complex-object", mockListener);
            
            const complexData = {
                id: "test-id",
                items: [
                    { name: "item1", value: 10 },
                    { name: "item2", value: 20 },
                ],
            };
            
            await eventBus.emitTyped("complex-object", complexData);
            
            expect(mockListener).toHaveBeenCalledWith({
                id: "test-id",
                items: [
                    { name: "item1", value: 10 },
                    { name: "item2", value: 20 },
                ],
                _meta: expect.any(Object),
            });
        });
    });

    describe("Typed Event Methods", () => {
        it("should support onTyped method", async () => {
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(mockListener).toHaveBeenCalledTimes(1);
        });

        it("should support onceTyped method", async () => {
            eventBus.onceTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test1");
            await eventBus.emitTyped("string-event", "test2");
            
            expect(mockListener).toHaveBeenCalledTimes(1);
        });

        it("should support offTyped with specific listener", async () => {
            eventBus.onTyped("string-event", mockListener);
            eventBus.offTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(mockListener).not.toHaveBeenCalled();
        });

        it("should support offTyped without listener to remove all", async () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            
            eventBus.onTyped("string-event", listener1);
            eventBus.onTyped("string-event", listener2);
            eventBus.offTyped("string-event"); // Remove all listeners
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).not.toHaveBeenCalled();
        });
    });

    describe("Diagnostics", () => {
        it("should provide accurate diagnostics", () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            
            eventBus.onTyped("string-event", listener1);
            eventBus.onTyped("string-event", listener2);
            eventBus.onTyped("number-event", listener1);
            
            eventBus.use(mockMiddleware);
            eventBus.use(mockMiddleware2);
            
            const diagnostics: EventBusDiagnostics = eventBus.getDiagnostics();
            
            expect(diagnostics).toEqual({
                busId: "test-bus",
                listenerCounts: {
                    "string-event": 2,
                    "number-event": 1,
                },
                maxListeners: 50,
                maxMiddleware: 20,
                middlewareCount: 2,
                middlewareUtilization: 10, // 2/20 * 100
            });
        });

        it("should handle empty diagnostics", () => {
            const diagnostics = eventBus.getDiagnostics();
            
            expect(diagnostics).toEqual({
                busId: "test-bus",
                listenerCounts: {},
                maxListeners: 50,
                maxMiddleware: 20,
                middlewareCount: 0,
                middlewareUtilization: 0,
            });
        });

        it("should calculate middleware utilization correctly", () => {
            const bus = new TypedEventBus<TestEvents>("test", { maxMiddleware: 4 });
            
            bus.use(mockMiddleware);
            bus.use(mockMiddleware2);
            
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.middlewareUtilization).toBe(50); // 2/4 * 100
        });

        it("should handle maxMiddleware of 0 in utilization calculation", () => {
            // This tests the edge case protection in getDiagnostics
            const bus = new TypedEventBus<TestEvents>("test", { maxMiddleware: 1 });
            
            // Manually set maxMiddleware to 0 to test the protection
            (bus as any).maxMiddleware = 0;
            
            const diagnostics = bus.getDiagnostics();
            expect(diagnostics.middlewareUtilization).toBe(0);
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle middleware that doesn't call next", async () => {
            const badMiddleware: EventMiddleware = vi.fn(); // Doesn't call next()
            
            eventBus.use(badMiddleware);
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(badMiddleware).toHaveBeenCalled();
            expect(mockListener).toHaveBeenCalled(); // Should still be called
        });

        it("should handle undefined/null middleware in chain", async () => {
            eventBus.use(mockMiddleware);
            
            // Manually insert null middleware to test the safety check
            (eventBus as any).middlewares.push(undefined);
            
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "test");
            
            expect(mockMiddleware).toHaveBeenCalled();
            expect(mockListener).toHaveBeenCalled();
        });

        it("should handle events with no listeners", async () => {
            await expect(eventBus.emitTyped("string-event", "test")).resolves.not.toThrow();
        });

        it("should preserve array indices and length", async () => {
            eventBus.onTyped("array-event", mockListener);
            
            const sparseArray = [1, , 3]; // Sparse array with empty slot
            sparseArray[10] = 10;
            
            await eventBus.emitTyped("array-event", sparseArray);
            
            const receivedData = mockListener.mock.calls[0]?.[0];
            expect(receivedData.length).toBe(11);
            expect(receivedData[0]).toBe(1);
            expect(receivedData[1]).toBeUndefined();
            expect(receivedData[2]).toBe(3);
            expect(receivedData[10]).toBe(10);
        });

        it("should handle objects with special properties", async () => {
            eventBus.onTyped("object-event", mockListener);
            
            const objectWithSpecialProps = {
                data: "test",
                nested: { value: 123 },
                constructor: "custom",
                toString: "custom-toString",
            };
            
            await eventBus.emitTyped("object-event", objectWithSpecialProps);
            
            expect(mockListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: "test",
                    nested: { value: 123 },
                    constructor: "custom",
                    toString: "custom-toString",
                    _meta: expect.any(Object),
                })
            );
        });

        it("should handle zero as a valid number", async () => {
            eventBus.onTyped("number-event", mockListener);
            
            await eventBus.emitTyped("number-event", 0);
            
            expect(mockListener).toHaveBeenCalledWith({
                value: 0,
                _meta: expect.any(Object),
            });
        });

        it("should handle empty string", async () => {
            eventBus.onTyped("string-event", mockListener);
            
            await eventBus.emitTyped("string-event", "");
            
            expect(mockListener).toHaveBeenCalledWith({
                value: "",
                _meta: expect.any(Object),
            });
        });

        it("should handle empty object", async () => {
            eventBus.onTyped("object-event", mockListener);
            
            await eventBus.emitTyped("object-event", { data: "", nested: { value: 0 } });
            
            expect(mockListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: "",
                    nested: { value: 0 },
                    _meta: expect.any(Object),
                })
            );
        });

        it("should handle empty array", async () => {
            eventBus.onTyped("array-event", mockListener);
            
            await eventBus.emitTyped("array-event", []);
            
            const receivedData = mockListener.mock.calls[0]?.[0];
            expect(Array.isArray(receivedData)).toBe(true);
            expect(receivedData.length).toBe(0);
            expect(receivedData._meta).toEqual(expect.any(Object));
        });
    });

    describe("Chaining Support", () => {
        it("should support method chaining for onTyped", () => {
            const result = eventBus.onTyped("string-event", mockListener);
            expect(result).toBe(eventBus);
        });

        it("should support method chaining for onceTyped", () => {
            const result = eventBus.onceTyped("string-event", mockListener);
            expect(result).toBe(eventBus);
        });

        it("should support method chaining for offTyped", () => {
            const result = eventBus.offTyped("string-event", mockListener);
            expect(result).toBe(eventBus);
        });
    });
});

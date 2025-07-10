import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypedEventBus, createTypedEventBus, EventMiddleware } from "../events/TypedEventBus";

// Mock logger to silence output and track calls
vi.mock("../utils/index", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    generateCorrelationId: () => "test-correlation-id",
}));

type TestEvents = {
    foo: { value: number };
    bar: { message: string };
    baz: string;
};

describe("TypedEventBus", () => {
    let bus: TypedEventBus<TestEvents>;

    beforeEach(() => {
        bus = createTypedEventBus<TestEvents>("test-bus");
    });

    it("emits and receives typed events with metadata", async () => {
        const handler = vi.fn();
        bus.onTyped("foo", handler);

        await bus.emitTyped("foo", { value: 42 });

        expect(handler).toHaveBeenCalledTimes(1);
        const callArg = handler.mock.calls[0][0];
        expect(callArg.value).toBe(42);
        expect(callArg._meta).toMatchObject({
            busId: "test-bus",
            correlationId: "test-correlation-id",
            eventName: "foo",
        });
        expect(typeof callArg._meta.timestamp).toBe("number");
    });

    it("supports onceTyped for one-time listeners", async () => {
        const handler = vi.fn();
        bus.onceTyped("bar", handler);

        await bus.emitTyped("bar", { message: "hello" });
        await bus.emitTyped("bar", { message: "again" });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].message).toBe("hello");
    });

    it("removes listeners with offTyped", async () => {
        const handler = vi.fn();
        bus.onTyped("foo", handler);
        bus.offTyped("foo", handler);

        await bus.emitTyped("foo", { value: 1 });
        expect(handler).not.toHaveBeenCalled();
    });

    it("removes all listeners for an event with offTyped (no handler)", async () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        bus.onTyped("foo", handler1);
        bus.onTyped("foo", handler2);

        bus.offTyped("foo");
        await bus.emitTyped("foo", { value: 2 });
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();
    });

    it("processes middleware in order", async () => {
        const order: string[] = [];
        const mw1: EventMiddleware = async (event, data, next) => {
            order.push("mw1");
            await next();
        };
        const mw2: EventMiddleware = async (event, data, next) => {
            order.push("mw2");
            await next();
        };
        bus.use(mw1);
        bus.use(mw2);

        const handler = vi.fn();
        bus.onTyped("foo", handler);

        await bus.emitTyped("foo", { value: 5 });
        expect(order).toEqual(["mw1", "mw2"]);
        expect(handler).toHaveBeenCalled();
    });

    it("removes and clears middleware", async () => {
        const mw: EventMiddleware = vi.fn(async (event, data, next) => {
            await next();
        });
        bus.use(mw);
        expect(bus.removeMiddleware(mw)).toBe(true);
        expect(bus.removeMiddleware(mw)).toBe(false);

        bus.use(mw);
        bus.clearMiddleware();
        // Should not call middleware after clearing
        const handler = vi.fn();
        bus.onTyped("foo", handler);
        await bus.emitTyped("foo", { value: 10 });
        expect(mw).not.toHaveBeenCalled();
    });

    it("handles middleware errors and logs them", async () => {
        const error = new Error("middleware fail");
        const mw: EventMiddleware = async () => {
            throw error;
        };
        bus.use(mw);

        await expect(bus.emitTyped("foo", { value: 1 })).rejects.toThrow("middleware fail");
    });

    it("emits primitive data as { value }", async () => {
        const handler = vi.fn();
        bus.onTyped("baz", handler);
        await bus.emitTyped("baz", "hello");
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                value: "hello",
                _meta: expect.any(Object),
            })
        );
    });

    it("getDiagnostics returns correct info", () => {
        const handler = () => {};
        bus.onTyped("foo", handler);
        bus.use(async (e, d, n) => {
            await n();
        });

        const diag = bus.getDiagnostics();
        expect(diag.busId).toBe("test-bus");
        expect(diag.middlewareCount).toBe(1);
        expect(diag.listenerCounts.foo).toBe(1);
        expect(typeof diag.maxListeners).toBe("number");
    });
});

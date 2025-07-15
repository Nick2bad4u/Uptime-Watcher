/**
 * Tests for TypedEventBus middleware memory leak prevention.
 *
 * This test directly validates the middleware limit enforcement to prevent memory leaks.
 */

import { describe, it, expect, vi } from "vitest";

// Mock logger to avoid import issues
vi.mock("../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock correlation ID generator
vi.mock("../utils/correlation", () => ({
    generateCorrelationId: vi.fn(() => "test-correlation-id"),
}));

// Import after mocking
import { TypedEventBus } from "../../electron/events/TypedEventBus";

describe("TypedEventBus - Memory Leak Prevention", () => {
    interface TestEvents extends Record<string, unknown> {
        "test:event": { message: string };
    }

    it("should enforce middleware limit by default", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus");
        const middleware = vi.fn(async (_event, _data, next) => next());

        // Default limit is 20
        for (let i = 0; i < 20; i++) {
            expect(() => bus.use(middleware)).not.toThrow();
        }

        // 21st middleware should throw
        expect(() => bus.use(middleware)).toThrow(/Maximum middleware limit.*exceeded/);
    });

    it("should allow custom middleware limit", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 5 });
        const middleware = vi.fn(async (_event, _data, next) => next());

        for (let i = 0; i < 5; i++) {
            expect(() => bus.use(middleware)).not.toThrow();
        }

        expect(() => bus.use(middleware)).toThrow(/Maximum middleware limit \(5\) exceeded/);
    });

    it("should include middleware limits in diagnostics", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 10 });
        const middleware = vi.fn(async (_event, _data, next) => next());

        bus.use(middleware);
        bus.use(middleware);

        const diagnostics = bus.getDiagnostics();
        expect(diagnostics.middlewareCount).toBe(2);
        expect(diagnostics.maxMiddleware).toBe(10);
        expect(diagnostics.middlewareUtilization).toBe(20); // 2/10 * 100
    });

    it("should allow middleware removal to free up slots", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 2 });
        const middleware1 = vi.fn(async (_event, _data, next) => next());
        const middleware2 = vi.fn(async (_event, _data, next) => next());
        const middleware3 = vi.fn(async (_event, _data, next) => next());

        bus.use(middleware1);
        bus.use(middleware2);

        // Should be at limit
        expect(() => bus.use(middleware3)).toThrow();

        // Remove middleware and try again
        bus.removeMiddleware(middleware1);
        expect(() => bus.use(middleware3)).not.toThrow();
    });

    it("should allow clearing all middleware", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 2 });
        const middleware = vi.fn(async (_event, _data, next) => next());

        bus.use(middleware);
        bus.use(middleware);

        // Should be at limit
        expect(() => bus.use(middleware)).toThrow();

        // Clear all middleware
        bus.clearMiddleware();

        // Should be able to add middleware again
        expect(() => bus.use(middleware)).not.toThrow();
        expect(() => bus.use(middleware)).not.toThrow();
    });

    it("should properly track middleware utilization", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 4 });
        const middleware = vi.fn(async (_event, _data, next) => next());

        // Start with 0% utilization
        expect(bus.getDiagnostics().middlewareUtilization).toBe(0);

        // Add 1 middleware - 25% utilization
        bus.use(middleware);
        expect(bus.getDiagnostics().middlewareUtilization).toBe(25);

        // Add another - 50% utilization
        bus.use(middleware);
        expect(bus.getDiagnostics().middlewareUtilization).toBe(50);

        // Add 2 more - 100% utilization
        bus.use(middleware);
        bus.use(middleware);
        expect(bus.getDiagnostics().middlewareUtilization).toBe(100);
    });

    it("should provide clear error message when limit is exceeded", () => {
        const bus = new TypedEventBus<TestEvents>("test-bus", { maxMiddleware: 1 });
        const middleware = vi.fn(async (_event, _data, next) => next());

        bus.use(middleware);

        expect(() => bus.use(middleware)).toThrow(
            "Maximum middleware limit (1) exceeded. Consider increasing maxMiddleware or combining middleware functions."
        );
    });
});

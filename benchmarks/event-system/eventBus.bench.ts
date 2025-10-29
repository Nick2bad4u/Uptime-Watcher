/**
 * Event Bus Performance Benchmarks
 *
 * @file Performance benchmarks for TypedEventBus operations using real
 *   implementation.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @updated 2025-09-22 - Updated to use real TypedEventBus implementation
 *
 * @benchmark Event-EventBus
 *
 * @tags ["performance", "events", "event-bus", "messaging"]
 */

import { bench, describe } from "vitest";
import { TypedEventBus } from "../../electron/events/TypedEventBus";
import type { UptimeEvents } from "../../electron/events/eventTypes";

// Real event interfaces from the actual codebase
interface TestEventTypes extends UptimeEvents {
    "benchmark:test": { id: string; payload: any; timestamp: number };
    "benchmark:heavy": { data: any[]; processing: boolean };
    "benchmark:simple": { message: string };
}

describe("Event Bus Performance", () => {
    let eventBus: TypedEventBus<TestEventTypes>;

    bench(
        "event bus initialization",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "register single listener",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.onTyped("benchmark:simple", () => {});
        },
        { warmupIterations: 10, iterations: 10_000 }
    );

    bench(
        "register multiple listeners",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.onTyped("benchmark:test", () => {});
            eventBus.onTyped("benchmark:simple", () => {});
            eventBus.onTyped("benchmark:heavy", () => {});
            // Add more listeners for realistic testing
            for (let i = 0; i < 7; i++) {
                eventBus.onTyped("benchmark:simple", () => {});
            }
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "emit event with no listeners",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.emitTyped("benchmark:simple", { message: "test" });
        },
        { warmupIterations: 10, iterations: 10_000 }
    );

    bench(
        "emit event with single listener",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.onTyped("benchmark:simple", () => {});
            eventBus.emitTyped("benchmark:simple", { message: "test" });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "emit event with multiple listeners",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            for (let i = 0; i < 10; i++) {
                eventBus.onTyped("benchmark:simple", () => {});
            }
            eventBus.emitTyped("benchmark:simple", { message: "test" });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "emit events with middleware",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.registerMiddleware(async (eventName, data, next) => {
                // Process the data and continue to next middleware
                await next();
            });
            eventBus.registerMiddleware(async (eventName, data, next) => {
                // Another middleware layer
                await next();
            });
            eventBus.onTyped("benchmark:test", () => {});
            eventBus.emitTyped("benchmark:test", {
                id: "test-id",
                payload: { data: "test" },
                timestamp: Date.now(),
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "unregister listeners",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            const listener = () => {};
            eventBus.onTyped("benchmark:simple", listener);
            eventBus.offTyped("benchmark:simple", listener);
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "bulk event emission",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.onTyped("benchmark:heavy", () => {});
            for (let i = 0; i < 100; i++) {
                eventBus.emitTyped("benchmark:heavy", {
                    data: Array.from({ length: 10 }, (_, idx) => ({
                        index: idx,
                        value: Math.random(),
                    })),
                    processing: i % 2 === 0,
                });
            }
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "event diagnostics and introspection",
        () => {
            eventBus = new TypedEventBus<TestEventTypes>("benchmark-bus");
            eventBus.onTyped("benchmark:test", () => {});
            eventBus.onTyped("benchmark:simple", () => {});
            eventBus.onTyped("benchmark:heavy", () => {});
            const diagnostics = eventBus.getDiagnostics();
            // Access diagnostic properties to ensure they're computed
            const { busId, listenerCounts, middlewareCount } = diagnostics;
        },
        { warmupIterations: 5, iterations: 1000 }
    );
});

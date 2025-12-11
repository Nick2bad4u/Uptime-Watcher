/**
 * Event System Performance Benchmarks
 *
 * @file Performance benchmarks for the event system in the Uptime Watcher
 *   application, focusing on event emission, listener performance, and event
 *   propagation.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark Event-System
 *
 * @tags ["performance", "events", "emitters", "listeners", "async"]
 */

import { bench, describe } from "vitest";

/**
 * Lightweight in-memory event bus that mimics the TypedEventBus surface for
 * benchmark scenarios.
 *
 * @internal
 */
class MockTypedEventBus {
    private listeners = new Map<string, Set<Function>>();
    private oneTimeListeners = new Map<string, Set<Function>>();

    /**
     * Registers a listener that fires on every emission of the matching event.
     *
     * @param event - Event identifier to subscribe to.
     * @param listener - Callback invoked when the event is emitted.
     */
    on(event: string, listener: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    /**
     * Registers a listener that is removed after processing the first event.
     *
     * @param event - Event identifier to subscribe to once.
     * @param listener - Callback invoked a single time when the event occurs.
     */
    once(event: string, listener: Function): void {
        if (!this.oneTimeListeners.has(event)) {
            this.oneTimeListeners.set(event, new Set());
        }
        this.oneTimeListeners.get(event)!.add(listener);
    }

    /**
     * Removes a previously registered listener for both persistent and one-time
     * collections.
     *
     * @param event - Event identifier to remove the listener from.
     * @param listener - Callback that should no longer receive events.
     */
    off(event: string, listener: Function): void {
        this.listeners.get(event)?.delete(listener);
        this.oneTimeListeners.get(event)?.delete(listener);
    }

    /**
     * Synchronously emits an event to all registered listeners.
     *
     * @param event - Identifier of the event being emitted.
     * @param args - Variadic payload forwarded to listeners.
     */
    emit(event: string, ...args: any[]): void {
        // Emit to regular listeners
        this.listeners.get(event)?.forEach((listener) => {
            try {
                listener(...args);
            } catch (error) {
                console.error("Event listener error:", error);
            }
        });

        // Emit to one-time listeners and remove them
        const oneTimeSet = this.oneTimeListeners.get(event);
        if (oneTimeSet) {
            oneTimeSet.forEach((listener) => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error("One-time event listener error:", error);
                }
            });
            this.oneTimeListeners.delete(event);
        }
    }

    /**
     * Emits an event, waiting for any async listener responses before
     * completing.
     *
     * @param event - Identifier of the event being emitted.
     * @param args - Variadic payload forwarded to listeners.
     */
    async emitAsync(event: string, ...args: any[]): Promise<void> {
        const promises: Promise<any>[] = [];

        // Emit to regular listeners
        this.listeners.get(event)?.forEach((listener) => {
            try {
                const result = listener(...args);
                if (result instanceof Promise) {
                    promises.push(result);
                }
            } catch (error) {
                console.error("Async event listener error:", error);
            }
        });

        // Emit to one-time listeners and remove them
        const oneTimeSet = this.oneTimeListeners.get(event);
        if (oneTimeSet) {
            oneTimeSet.forEach((listener) => {
                try {
                    const result = listener(...args);
                    if (result instanceof Promise) {
                        promises.push(result);
                    }
                } catch (error) {
                    console.error(
                        "One-time async event listener error:",
                        error
                    );
                }
            });
            this.oneTimeListeners.delete(event);
        }

        await Promise.all(promises);
    }

    /**
     * Removes listeners for a specific event or clears the entire registry.
     *
     * @param event - Optional event identifier to prune. When omitted all
     *   listeners are removed.
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.listeners.delete(event);
            this.oneTimeListeners.delete(event);
        } else {
            this.listeners.clear();
            this.oneTimeListeners.clear();
        }
    }

    /**
     * Returns the number of listeners registered for the provided event.
     *
     * @param event - Event identifier to inspect.
     *
     * @returns Aggregate listener count across persistent and one-time sets.
     */
    listenerCount(event: string): number {
        const regularCount = this.listeners.get(event)?.size || 0;
        const oneTimeCount = this.oneTimeListeners.get(event)?.size || 0;
        return regularCount + oneTimeCount;
    }
}

/**
 * Represents site-centric payloads emitted from the event bus benchmarks.
 *
 * @internal
 */
interface SiteEvent {
    site: {
        identifier: string;
        name: string;
        monitoring: boolean;
    };
    timestamp: number;
    correlationId: string;
}

/**
 * Represents monitor-centric payloads exercised during benchmark runs.
 *
 * @internal
 */
interface MonitorEvent {
    monitor: {
        id: string;
        siteIdentifier: string;
        type: string;
        status: "up" | "down";
    };
    timestamp: number;
    correlationId: string;
}

/**
 * Represents monitor status updates used by downstream benchmark listeners.
 *
 * @internal
 */
interface StatusUpdateEvent {
    monitorId: string;
    status: "up" | "down";
    responseTime: number;
    timestamp: number;
    correlationId: string;
}

/**
 * Creates a pseudo-random site event payload to drive benchmark iterations.
 *
 * @returns Synthetic {@link SiteEvent} data populated with randomized values.
 */
function generateSiteEvent(): SiteEvent {
    return {
        site: {
            identifier: `site-${Math.floor(Math.random() * 1000)}`,
            name: `Site ${Math.floor(Math.random() * 1000)}`,
            monitoring: Math.random() > 0.2,
        },
        timestamp: Date.now(),
        correlationId: `corr-${Date.now()}-${Math.random()}`,
    };
}

/**
 * Creates a pseudo-random monitor event payload to simulate monitor operations.
 *
 * @returns Synthetic {@link MonitorEvent} data populated with randomized values.
 */
function generateMonitorEvent(): MonitorEvent {
    return {
        monitor: {
            id: `monitor-${Math.floor(Math.random() * 1000)}`,
            siteIdentifier: `site-${Math.floor(Math.random() * 100)}`,
            type: [
                "http",
                "ping",
                "port",
            ][Math.floor(Math.random() * 3)],
            status: Math.random() > 0.05 ? "up" : "down",
        },
        timestamp: Date.now(),
        correlationId: `corr-${Date.now()}-${Math.random()}`,
    };
}

/**
 * Creates a pseudo-random status update payload used by monitoring benchmarks.
 *
 * @returns Synthetic {@link StatusUpdateEvent} describing monitor health.
 */
function generateStatusUpdateEvent(): StatusUpdateEvent {
    return {
        monitorId: `monitor-${Math.floor(Math.random() * 1000)}`,
        status: Math.random() > 0.05 ? "up" : "down",
        responseTime: Math.floor(Math.random() * 1000) + 10,
        timestamp: Date.now(),
        correlationId: `corr-${Date.now()}-${Math.random()}`,
    };
}

/**
 * Produces a synchronous listener that applies lightweight work to incoming
 * data.
 *
 * @param id - Identifier used to differentiate listeners during debug runs.
 *
 * @returns Event listener that performs synchronous CPU-bound work.
 */
const createSyncListener = (id: string) => (data: any) => {
    // Simulate some processing
    JSON.stringify(data);
    Math.floor(Math.random() * 100);
};

/**
 * Produces an asynchronous listener that optionally waits before resolving.
 *
 * @param id - Identifier used to differentiate listeners during debug runs.
 * @param delay - Milliseconds to wait before completing.
 *
 * @returns Async event listener that simulates IO latency.
 */
const createAsyncListener = (id: string, delay: number = 0) =>
    async (data: any) => {
        // Simulate async processing
        JSON.stringify(data);
        if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        Math.floor(Math.random() * 100);
    };

/**
 * Produces a listener that executes heavy CPU-bound work to simulate worst case
 * scenarios.
 *
 * @param id - Identifier used to differentiate listeners during debug runs.
 *
 * @returns Event listener that stresses the CPU for benchmarking purposes.
 */
const createHeavyListener = (id: string) => (data: any) => {
    // Simulate heavy processing
    for (let i = 0; i < 1000; i++) {
        JSON.stringify(data);
        Math.floor(Math.random() * 100);
    }
};

describe("Event System Performance Benchmarks", () => {
    describe("Basic Event Operations", () => {
        bench(
            "Create and configure event bus",
            () => {
                const eventBus = new MockTypedEventBus();

                // Add multiple listeners for different events
                for (let i = 0; i < 50; i++) {
                    eventBus.on(`site:${i}`, createSyncListener(`site-${i}`));
                    eventBus.on(
                        `monitor:${i}`,
                        createSyncListener(`monitor-${i}`)
                    );
                    eventBus.on(
                        `status:${i}`,
                        createSyncListener(`status-${i}`)
                    );
                }
            },
            { iterations: 1000 }
        );

        bench(
            "Add and remove listeners",
            () => {
                const eventBus = new MockTypedEventBus();
                const listeners: Function[] = [];

                // Add listeners
                for (let i = 0; i < 100; i++) {
                    const listener = createSyncListener(`test-${i}`);
                    listeners.push(listener);
                    eventBus.on("test-event", listener);
                }

                // Remove listeners
                for (const listener of listeners) {
                    eventBus.off("test-event", listener);
                }
            },
            { iterations: 500 }
        );

        bench(
            "Event emission with no listeners",
            () => {
                const eventBus = new MockTypedEventBus();

                for (let i = 0; i < 100; i++) {
                    eventBus.emit(
                        `nonexistent-event-${i}`,
                        generateSiteEvent()
                    );
                }
            },
            { iterations: 1000 }
        );
    });

    describe("Small-Scale Event Scenarios", () => {
        bench(
            "Single event, 10 listeners",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup listeners
                for (let i = 0; i < 10; i++) {
                    eventBus.on(
                        "site:added",
                        createSyncListener(`listener-${i}`)
                    );
                }

                // Emit events
                for (let i = 0; i < 50; i++) {
                    eventBus.emit("site:added", generateSiteEvent());
                }
            },
            { iterations: 200 }
        );

        bench(
            "Multiple events, few listeners each",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup listeners for multiple events
                const events = [
                    "site:added",
                    "site:removed",
                    "monitor:started",
                    "monitor:stopped",
                    "status:updated",
                ];
                for (const event of events) {
                    for (let i = 0; i < 5; i++) {
                        eventBus.on(event, createSyncListener(`${event}-${i}`));
                    }
                }

                // Emit events
                for (let i = 0; i < 100; i++) {
                    const event = events[i % events.length];
                    if (event.startsWith("site:")) {
                        eventBus.emit(event, generateSiteEvent());
                    } else if (event.startsWith("monitor:")) {
                        eventBus.emit(event, generateMonitorEvent());
                    } else {
                        eventBus.emit(event, generateStatusUpdateEvent());
                    }
                }
            },
            { iterations: 100 }
        );

        bench(
            "One-time listeners performance",
            () => {
                const eventBus = new MockTypedEventBus();

                // Add one-time listeners
                for (let i = 0; i < 50; i++) {
                    eventBus.once(
                        "initialization:complete",
                        createSyncListener(`once-${i}`)
                    );
                }

                // Emit event (should trigger all listeners once)
                eventBus.emit("initialization:complete", { initialized: true });

                // Try to emit again (should have no listeners)
                eventBus.emit("initialization:complete", { initialized: true });
            },
            { iterations: 200 }
        );
    });

    describe("Medium-Scale Event Scenarios", () => {
        bench(
            "Heavy listener scenario (100 listeners per event)",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup many listeners
                for (let i = 0; i < 100; i++) {
                    eventBus.on(
                        "status:updated",
                        createSyncListener(`status-${i}`)
                    );
                }

                // Emit events
                for (let i = 0; i < 50; i++) {
                    eventBus.emit(
                        "status:updated",
                        generateStatusUpdateEvent()
                    );
                }
            },
            { iterations: 50 }
        );

        bench(
            "Mixed sync/async listeners",
            async () => {
                const eventBus = new MockTypedEventBus();

                // Setup mixed listeners
                for (let i = 0; i < 25; i++) {
                    eventBus.on(
                        "monitor:checked",
                        createSyncListener(`sync-${i}`)
                    );
                    eventBus.on(
                        "monitor:checked",
                        createAsyncListener(`async-${i}`, 1)
                    );
                }

                // Emit events
                for (let i = 0; i < 20; i++) {
                    await eventBus.emitAsync(
                        "monitor:checked",
                        generateMonitorEvent()
                    );
                }
            },
            { iterations: 10 }
        );

        bench(
            "Event cascading (events triggering other events)",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup cascading listeners
                eventBus.on("site:added", (siteEvent: SiteEvent) => {
                    // Simulate site added triggering monitor events
                    for (let i = 0; i < 3; i++) {
                        eventBus.emit(
                            "monitor:created",
                            generateMonitorEvent()
                        );
                    }
                });

                eventBus.on("monitor:created", (monitorEvent: MonitorEvent) => {
                    // Simulate monitor created triggering status check
                    eventBus.emit(
                        "status:updated",
                        generateStatusUpdateEvent()
                    );
                });

                eventBus.on(
                    "status:updated",
                    createSyncListener("status-processor")
                );

                // Trigger cascade
                for (let i = 0; i < 20; i++) {
                    eventBus.emit("site:added", generateSiteEvent());
                }
            },
            { iterations: 50 }
        );
    });

    describe("Large-Scale Event Scenarios", () => {
        bench(
            "Massive event emission (1000 events)",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup listeners
                for (let i = 0; i < 50; i++) {
                    eventBus.on(
                        "status:updated",
                        createSyncListener(`status-${i}`)
                    );
                }

                // Emit many events
                for (let i = 0; i < 1000; i++) {
                    eventBus.emit(
                        "status:updated",
                        generateStatusUpdateEvent()
                    );
                }
            },
            { iterations: 10 }
        );

        bench(
            "High-frequency monitoring events",
            () => {
                const eventBus = new MockTypedEventBus();

                // Setup listeners for monitoring events
                eventBus.on(
                    "monitor:heartbeat",
                    createSyncListener("heartbeat-processor")
                );
                eventBus.on(
                    "monitor:status-change",
                    createSyncListener("status-processor")
                );
                eventBus.on(
                    "monitor:error",
                    createSyncListener("error-processor")
                );

                // Simulate high-frequency monitoring
                for (let i = 0; i < 500; i++) {
                    eventBus.emit("monitor:heartbeat", {
                        monitorId: `monitor-${i % 100}`,
                        timestamp: Date.now(),
                    });

                    if (i % 20 === 0) {
                        eventBus.emit(
                            "monitor:status-change",
                            generateStatusUpdateEvent()
                        );
                    }

                    if (i % 100 === 0) {
                        eventBus.emit("monitor:error", {
                            error: "Connection timeout",
                            monitorId: `monitor-${i % 100}`,
                        });
                    }
                }
            },
            { iterations: 20 }
        );

        bench(
            "Memory pressure: Many listeners with cleanup",
            () => {
                const eventBus = new MockTypedEventBus();
                const listeners: Function[] = [];

                // Add many listeners
                for (let i = 0; i < 500; i++) {
                    const listener = createSyncListener(`memory-test-${i}`);
                    listeners.push(listener);
                    eventBus.on("memory:test", listener);
                }

                // Emit events
                for (let i = 0; i < 100; i++) {
                    eventBus.emit("memory:test", {
                        data: `test-${i}`,
                        timestamp: Date.now(),
                    });
                }

                // Cleanup listeners
                for (const listener of listeners) {
                    eventBus.off("memory:test", listener);
                }
            },
            { iterations: 10 }
        );
    });

    describe("Error Handling and Edge Cases", () => {
        bench(
            "Listeners with errors",
            () => {
                const eventBus = new MockTypedEventBus();

                // Add listeners that throw errors
                for (let i = 0; i < 20; i++) {
                    eventBus.on("error:test", (data: any) => {
                        if (Math.random() > 0.7) {
                            throw new Error(`Simulated error ${i}`);
                        }
                        createSyncListener(`error-test-${i}`)(data);
                    });
                }

                // Emit events
                for (let i = 0; i < 100; i++) {
                    eventBus.emit("error:test", { test: true });
                }
            },
            { iterations: 50 }
        );

        bench(
            "Heavy computation in listeners",
            () => {
                const eventBus = new MockTypedEventBus();

                // Add heavy listeners
                for (let i = 0; i < 10; i++) {
                    eventBus.on(
                        "heavy:computation",
                        createHeavyListener(`heavy-${i}`)
                    );
                }

                // Emit events
                for (let i = 0; i < 10; i++) {
                    eventBus.emit("heavy:computation", generateMonitorEvent());
                }
            },
            { iterations: 10 }
        );

        bench(
            "Rapid listener addition/removal during emission",
            () => {
                const eventBus = new MockTypedEventBus();

                // Initial listeners
                const initialListeners: Function[] = [];
                for (let i = 0; i < 50; i++) {
                    const listener = createSyncListener(`initial-${i}`);
                    initialListeners.push(listener);
                    eventBus.on("dynamic:test", listener);
                }

                // Simulate dynamic listener management during emission
                for (let i = 0; i < 100; i++) {
                    // Add new listener
                    const newListener = createSyncListener(`dynamic-${i}`);
                    eventBus.on("dynamic:test", newListener);

                    // Emit event
                    eventBus.emit("dynamic:test", { iteration: i });

                    // Remove a listener
                    if (i < initialListeners.length) {
                        eventBus.off("dynamic:test", initialListeners[i]);
                    }

                    // Remove the newly added listener
                    eventBus.off("dynamic:test", newListener);
                }
            },
            { iterations: 20 }
        );
    });

    describe("Async Event Performance", () => {
        bench(
            "Async event emission with fast listeners",
            async () => {
                const eventBus = new MockTypedEventBus();

                // Setup async listeners
                for (let i = 0; i < 20; i++) {
                    eventBus.on(
                        "async:fast",
                        createAsyncListener(`async-fast-${i}`, 0)
                    );
                }

                // Emit async events
                for (let i = 0; i < 50; i++) {
                    await eventBus.emitAsync(
                        "async:fast",
                        generateStatusUpdateEvent()
                    );
                }
            },
            { iterations: 10 }
        );

        bench(
            "Async event emission with slow listeners",
            async () => {
                const eventBus = new MockTypedEventBus();

                // Setup slow async listeners
                for (let i = 0; i < 5; i++) {
                    eventBus.on(
                        "async:slow",
                        createAsyncListener(`async-slow-${i}`, 5)
                    );
                }

                // Emit async events
                for (let i = 0; i < 10; i++) {
                    await eventBus.emitAsync(
                        "async:slow",
                        generateStatusUpdateEvent()
                    );
                }
            },
            { iterations: 3 }
        );

        bench(
            "Mixed sync/async emission patterns",
            async () => {
                const eventBus = new MockTypedEventBus();

                // Setup mixed listeners
                for (let i = 0; i < 10; i++) {
                    eventBus.on("mixed:event", createSyncListener(`sync-${i}`));
                    eventBus.on(
                        "mixed:event",
                        createAsyncListener(`async-${i}`, 1)
                    );
                }

                // Mixed emission pattern
                for (let i = 0; i < 30; i++) {
                    if (i % 2 === 0) {
                        eventBus.emit("mixed:event", generateSiteEvent());
                    } else {
                        await eventBus.emitAsync(
                            "mixed:event",
                            generateSiteEvent()
                        );
                    }
                }
            },
            { iterations: 5 }
        );
    });
});

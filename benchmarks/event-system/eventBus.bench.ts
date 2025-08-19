/**
 * Event Bus Performance Benchmarks
 *
 * @file Performance benchmarks for TypedEventBus operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Event-EventBus
 * @tags ["performance", "events", "event-bus", "messaging"]
 */

import { bench, describe } from "vitest";

interface EventData {
    id: string;
    timestamp: number;
    payload: any;
}

class MockTypedEventBus {
    private listeners = new Map<string, Function[]>();
    private middleware: Function[] = [];
    private eventHistory: EventData[] = [];

    on(eventType: string, listener: Function): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(listener);
    }

    off(eventType: string, listener: Function): void {
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(eventType: string, data: any): void {
        const eventData: EventData = {
            id: `event-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            payload: data
        };

        // Apply middleware
        let processedData = eventData;
        for (const middleware of this.middleware) {
            processedData = middleware(processedData);
        }

        // Store in history
        this.eventHistory.push(processedData);
        if (this.eventHistory.length > 1000) {
            this.eventHistory.shift();
        }

        // Notify listeners
        const listeners = this.listeners.get(eventType);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(processedData.payload);
                } catch (error) {
                    console.error('Event listener error:', error);
                }
            }
        }
    }

    addMiddleware(middleware: Function): void {
        this.middleware.push(middleware);
    }

    removeAllListeners(eventType?: string): void {
        if (eventType) {
            this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
        }
    }

    getListenerCount(eventType: string): number {
        return this.listeners.get(eventType)?.length || 0;
    }

    getAllEvents(): EventData[] {
        return [...this.eventHistory];
    }
}

describe("Event Bus Performance", () => {
    let eventBus: MockTypedEventBus;

    bench("event bus initialization", () => {
        eventBus = new MockTypedEventBus();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("register single listener", () => {
        eventBus = new MockTypedEventBus();
        eventBus.on('test-event', () => {});
    }, { warmupIterations: 10, iterations: 10_000 });

    bench("register multiple listeners", () => {
        eventBus = new MockTypedEventBus();
        for (let i = 0; i < 10; i++) {
            eventBus.on(`event-${i}`, () => {});
        }
    }, { warmupIterations: 10, iterations: 1000 });

    bench("emit event with no listeners", () => {
        eventBus = new MockTypedEventBus();
        eventBus.emit('non-existent-event', { data: 'test' });
    }, { warmupIterations: 10, iterations: 10_000 });

    bench("emit event with single listener", () => {
        eventBus = new MockTypedEventBus();
        eventBus.on('test-event', () => {});
        eventBus.emit('test-event', { data: 'test' });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("emit event with multiple listeners", () => {
        eventBus = new MockTypedEventBus();
        for (let i = 0; i < 10; i++) {
            eventBus.on('test-event', () => {});
        }
        eventBus.emit('test-event', { data: 'test' });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("emit events with middleware", () => {
        eventBus = new MockTypedEventBus();
        eventBus.addMiddleware((data: EventData) => ({ ...data, processed: true }));
        eventBus.addMiddleware((data: EventData) => ({ ...data, timestamp: Date.now() }));
        eventBus.on('test-event', () => {});
        eventBus.emit('test-event', { data: 'test' });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("unregister listeners", () => {
        eventBus = new MockTypedEventBus();
        const listener = () => {};
        eventBus.on('test-event', listener);
        eventBus.off('test-event', listener);
    }, { warmupIterations: 10, iterations: 5000 });

    bench("bulk event emission", () => {
        eventBus = new MockTypedEventBus();
        eventBus.on('bulk-event', () => {});
        for (let i = 0; i < 100; i++) {
            eventBus.emit('bulk-event', { index: i });
        }
    }, { warmupIterations: 5, iterations: 100 });

    bench("event history management", () => {
        eventBus = new MockTypedEventBus();
        for (let i = 0; i < 1500; i++) {
            eventBus.emit('history-event', { index: i });
        }
        eventBus.getAllEvents();
    }, { warmupIterations: 5, iterations: 50 });
});

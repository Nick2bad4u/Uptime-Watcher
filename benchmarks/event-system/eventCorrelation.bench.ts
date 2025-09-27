/**
 * Event Correlation Performance Benchmarks
 *
 * @file Performance benchmarks for event correlation and tracking.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Event-EventCorrelation
 *
 * @tags ["performance", "events", "correlation", "tracking"]
 */

import { bench, describe } from "vitest";

interface CorrelatedEvent {
    id: string;
    type: string;
    correlationId: string;
    causationId?: string;
    timestamp: number;
    payload: any;
    metadata: Record<string, any>;
}

interface CorrelationChain {
    correlationId: string;
    rootEventId: string;
    events: CorrelatedEvent[];
    startTime: number;
    endTime?: number;
    status: "active" | "completed" | "failed";
    metadata?: Record<string, any>;
}

class MockEventCorrelator {
    private correlationChains = new Map<string, CorrelationChain>();
    private eventLookup = new Map<string, CorrelatedEvent>();
    private correlationIndex = new Map<string, string[]>(); // EventType -> correlationIds
    private metrics = {
        chainsCreated: 0,
        chainsCompleted: 0,
        chainsFailed: 0,
        eventsCorrelated: 0,
        averageChainLength: 0,
    };

    startCorrelation(rootEvent: CorrelatedEvent): string {
        const correlationId =
            rootEvent.correlationId || this.generateCorrelationId();

        const chain: CorrelationChain = {
            correlationId,
            rootEventId: rootEvent.id,
            events: [rootEvent],
            startTime: rootEvent.timestamp,
            status: "active",
        };

        this.correlationChains.set(correlationId, chain);
        this.eventLookup.set(rootEvent.id, rootEvent);
        this.indexEventType(rootEvent.type, correlationId);

        this.metrics.chainsCreated++;
        return correlationId;
    }

    correlateEvent(event: CorrelatedEvent): void {
        const chain = this.correlationChains.get(event.correlationId);
        if (!chain) {
            throw new Error(
                `No correlation chain found for ID: ${event.correlationId}`
            );
        }

        chain.events.push(event);
        this.eventLookup.set(event.id, event);
        this.indexEventType(event.type, event.correlationId);

        this.metrics.eventsCorrelated++;
        this.updateAverageChainLength();
    }

    completeCorrelation(correlationId: string): void {
        const chain = this.correlationChains.get(correlationId);
        if (chain) {
            chain.status = "completed";
            chain.endTime = Date.now();
            this.metrics.chainsCompleted++;
        }
    }

    failCorrelation(correlationId: string, reason?: string): void {
        const chain = this.correlationChains.get(correlationId);
        if (chain) {
            chain.status = "failed";
            chain.endTime = Date.now();
            if (reason) {
                chain.metadata = { ...chain.metadata, failureReason: reason };
            }
            this.metrics.chainsFailed++;
        }
    }

    getCorrelationChain(correlationId: string): CorrelationChain | undefined {
        return this.correlationChains.get(correlationId);
    }

    getEventsByCorrelation(correlationId: string): CorrelatedEvent[] {
        const chain = this.correlationChains.get(correlationId);
        return chain ? Array.from(chain.events) : [];
    }

    getCorrelationsByEventType(eventType: string): string[] {
        return this.correlationIndex.get(eventType) || [];
    }

    getRelatedEvents(eventId: string): CorrelatedEvent[] {
        const event = this.eventLookup.get(eventId);
        if (!event) {
            return [];
        }

        const chain = this.correlationChains.get(event.correlationId);
        return chain ? chain.events.filter((e) => e.id !== eventId) : [];
    }

    getCausationChain(eventId: string): CorrelatedEvent[] {
        const event = this.eventLookup.get(eventId);
        if (!event) {
            return [];
        }

        const chain: CorrelatedEvent[] = [event];
        let currentEvent = event;

        // Follow causation chain backwards
        while (currentEvent.causationId) {
            const parentEvent = this.eventLookup.get(currentEvent.causationId);
            if (parentEvent) {
                chain.unshift(parentEvent);
                currentEvent = parentEvent;
            } else {
                break;
            }
        }

        return chain;
    }

    findOrphanedEvents(): CorrelatedEvent[] {
        const orphaned: CorrelatedEvent[] = [];

        for (const event of this.eventLookup.values()) {
            if (event.causationId) {
                const parent = this.eventLookup.get(event.causationId);
                if (!parent) {
                    orphaned.push(event);
                }
            }
        }

        return orphaned;
    }

    getActiveCorrelations(): CorrelationChain[] {
        return Array.from(this.correlationChains.values()).filter(
            (chain) => chain.status === "active"
        );
    }

    getCompletedCorrelations(): CorrelationChain[] {
        return Array.from(this.correlationChains.values()).filter(
            (chain) => chain.status === "completed"
        );
    }

    getCorrelationMetrics(): any {
        return {
            ...this.metrics,
            totalChains: this.correlationChains.size,
            activeChains: this.getActiveCorrelations().length,
            completedChains: this.getCompletedCorrelations().length,
            totalEvents: this.eventLookup.size,
        };
    }

    cleanupOldCorrelations(maxAge: number = 24 * 60 * 60 * 1000): number {
        const cutoff = Date.now() - maxAge;
        let cleaned = 0;

        for (const [correlationId, chain] of this.correlationChains) {
            if (chain.endTime && chain.endTime < cutoff) {
                // Remove from all indexes
                for (const event of chain.events) {
                    this.eventLookup.delete(event.id);
                }

                this.correlationChains.delete(correlationId);
                cleaned++;
            }
        }

        return cleaned;
    }

    private generateCorrelationId(): string {
        return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    private indexEventType(eventType: string, correlationId: string): void {
        if (!this.correlationIndex.has(eventType)) {
            this.correlationIndex.set(eventType, []);
        }

        const correlationIds = this.correlationIndex.get(eventType)!;
        if (!correlationIds.includes(correlationId)) {
            correlationIds.push(correlationId);
        }
    }

    private updateAverageChainLength(): void {
        const totalEvents = this.metrics.eventsCorrelated;
        const totalChains = this.metrics.chainsCreated;
        this.metrics.averageChainLength =
            totalChains > 0 ? totalEvents / totalChains : 0;
    }

    reset(): void {
        this.correlationChains.clear();
        this.eventLookup.clear();
        this.correlationIndex.clear();
        this.metrics = {
            chainsCreated: 0,
            chainsCompleted: 0,
            chainsFailed: 0,
            eventsCorrelated: 0,
            averageChainLength: 0,
        };
    }
}

describe("Event Correlation Performance", () => {
    let correlator: MockEventCorrelator;

    bench(
        "correlator initialization",
        () => {
            correlator = new MockEventCorrelator();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "start new correlation",
        () => {
            correlator = new MockEventCorrelator();
            const rootEvent: CorrelatedEvent = {
                id: "event-1",
                type: "site.check.started",
                correlationId: "corr-1",
                timestamp: Date.now(),
                payload: { siteId: "site-1" },
                metadata: {},
            };
            correlator.startCorrelation(rootEvent);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "correlate single event",
        () => {
            correlator = new MockEventCorrelator();
            const rootEvent: CorrelatedEvent = {
                id: "event-1",
                type: "site.check.started",
                correlationId: "corr-1",
                timestamp: Date.now(),
                payload: { siteId: "site-1" },
                metadata: {},
            };
            correlator.startCorrelation(rootEvent);

            const correlatedEvent: CorrelatedEvent = {
                id: "event-2",
                type: "site.check.completed",
                correlationId: "corr-1",
                causationId: "event-1",
                timestamp: Date.now(),
                payload: { siteId: "site-1", status: "online" },
                metadata: {},
            };
            correlator.correlateEvent(correlatedEvent);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "build correlation chain",
        () => {
            correlator = new MockEventCorrelator();
            const correlationId = "chain-corr";

            // Start with root event
            const rootEvent: CorrelatedEvent = {
                id: "root-event",
                type: "monitor.check.initiated",
                correlationId,
                timestamp: Date.now(),
                payload: { monitorId: "monitor-1" },
                metadata: {},
            };
            correlator.startCorrelation(rootEvent);

            // Add 10 related events
            let previousEventId = rootEvent.id;
            for (let i = 1; i <= 10; i++) {
                const event: CorrelatedEvent = {
                    id: `chain-event-${i}`,
                    type: `step.${i}.completed`,
                    correlationId,
                    causationId: previousEventId,
                    timestamp: Date.now() + i,
                    payload: { step: i, result: `result-${i}` },
                    metadata: {},
                };
                correlator.correlateEvent(event);
                previousEventId = event.id;
            }
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "retrieve correlation chain",
        () => {
            correlator = new MockEventCorrelator();
            const correlationId = "retrieve-corr";

            // Setup correlation with multiple events
            const rootEvent: CorrelatedEvent = {
                id: "retrieve-root",
                type: "process.started",
                correlationId,
                timestamp: Date.now(),
                payload: { processId: "proc-1" },
                metadata: {},
            };
            correlator.startCorrelation(rootEvent);

            for (let i = 1; i <= 5; i++) {
                const event: CorrelatedEvent = {
                    id: `retrieve-event-${i}`,
                    type: `process.step.${i}`,
                    correlationId,
                    timestamp: Date.now() + i,
                    payload: { step: i },
                    metadata: {},
                };
                correlator.correlateEvent(event);
            }

            // Retrieve the chain
            correlator.getCorrelationChain(correlationId);
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "get events by correlation",
        () => {
            correlator = new MockEventCorrelator();
            const correlationId = "events-corr";

            // Setup correlation
            const rootEvent: CorrelatedEvent = {
                id: "events-root",
                type: "batch.started",
                correlationId,
                timestamp: Date.now(),
                payload: { batchId: "batch-1" },
                metadata: {},
            };
            correlator.startCorrelation(rootEvent);

            for (let i = 1; i <= 20; i++) {
                const event: CorrelatedEvent = {
                    id: `events-item-${i}`,
                    type: "item.processed",
                    correlationId,
                    timestamp: Date.now() + i,
                    payload: { itemId: i },
                    metadata: {},
                };
                correlator.correlateEvent(event);
            }

            correlator.getEventsByCorrelation(correlationId);
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "get correlations by event type",
        () => {
            correlator = new MockEventCorrelator();

            // Create multiple correlations with same event types
            for (let i = 1; i <= 10; i++) {
                const correlationId = `type-corr-${i}`;
                const rootEvent: CorrelatedEvent = {
                    id: `type-root-${i}`,
                    type: "common.event.type",
                    correlationId,
                    timestamp: Date.now(),
                    payload: { id: i },
                    metadata: {},
                };
                correlator.startCorrelation(rootEvent);
            }

            correlator.getCorrelationsByEventType("common.event.type");
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "trace causation chain",
        () => {
            correlator = new MockEventCorrelator();
            const correlationId = "causation-corr";

            // Build a deep causation chain
            const events: CorrelatedEvent[] = [];
            for (let i = 0; i < 10; i++) {
                const event: CorrelatedEvent = {
                    id: `causation-event-${i}`,
                    type: `causation.step.${i}`,
                    correlationId,
                    causationId: i > 0 ? `causation-event-${i - 1}` : undefined,
                    timestamp: Date.now() + i,
                    payload: { step: i },
                    metadata: {},
                };
                events.push(event);
            }

            correlator.startCorrelation(events[0]);
            for (let i = 1; i < events.length; i++) {
                correlator.correlateEvent(events[i]);
            }

            // Trace from the last event
            correlator.getCausationChain("causation-event-9");
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "find orphaned events",
        () => {
            correlator = new MockEventCorrelator();

            // Create some valid correlations
            for (let i = 1; i <= 5; i++) {
                const correlationId = `valid-corr-${i}`;
                const rootEvent: CorrelatedEvent = {
                    id: `valid-root-${i}`,
                    type: "valid.event",
                    correlationId,
                    timestamp: Date.now(),
                    payload: { id: i },
                    metadata: {},
                };
                correlator.startCorrelation(rootEvent);
            }

            // Create orphaned events
            for (let i = 1; i <= 3; i++) {
                const orphanEvent: CorrelatedEvent = {
                    id: `orphan-${i}`,
                    type: "orphan.event",
                    correlationId: "orphan-corr",
                    causationId: `non-existent-parent-${i}`,
                    timestamp: Date.now(),
                    payload: { id: i },
                    metadata: {},
                };
                correlator.startCorrelation(orphanEvent);
            }

            correlator.findOrphanedEvents();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "cleanup old correlations",
        () => {
            correlator = new MockEventCorrelator();

            // Create old completed correlations
            for (let i = 1; i <= 50; i++) {
                const correlationId = `old-corr-${i}`;
                const rootEvent: CorrelatedEvent = {
                    id: `old-root-${i}`,
                    type: "old.event",
                    correlationId,
                    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
                    payload: { id: i },
                    metadata: {},
                };
                correlator.startCorrelation(rootEvent);
                correlator.completeCorrelation(correlationId);
            }

            // Cleanup correlations older than 1 day
            correlator.cleanupOldCorrelations(24 * 60 * 60 * 1000);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "massive correlation processing",
        () => {
            correlator = new MockEventCorrelator();

            // Create 100 correlations with 10 events each
            for (let i = 1; i <= 100; i++) {
                const correlationId = `massive-corr-${i}`;
                const rootEvent: CorrelatedEvent = {
                    id: `massive-root-${i}`,
                    type: "massive.process.started",
                    correlationId,
                    timestamp: Date.now(),
                    payload: { processId: i },
                    metadata: {},
                };
                correlator.startCorrelation(rootEvent);

                for (let j = 1; j <= 10; j++) {
                    const event: CorrelatedEvent = {
                        id: `massive-event-${i}-${j}`,
                        type: `massive.step.${j}`,
                        correlationId,
                        timestamp: Date.now() + j,
                        payload: { processId: i, step: j },
                        metadata: {},
                    };
                    correlator.correlateEvent(event);
                }

                correlator.completeCorrelation(correlationId);
            }

            correlator.getCorrelationMetrics();
        },
        { warmupIterations: 3, iterations: 10 }
    );
});

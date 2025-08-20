/**
 * Event Handler Performance Benchmarks
 *
 * @file Performance benchmarks for domain event handlers.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Event-EventHandler
 *
 * @tags ["performance", "events", "event-handlers", "domain-events"]
 */

import { bench, describe } from "vitest";

interface DomainEvent {
    id: string;
    type: string;
    timestamp: number;
    correlationId: string;
    payload: any;
}

class MockEventHandler {
    private handlers = new Map<string, Function[]>();
    private processingQueue: DomainEvent[] = [];
    private isProcessing = false;
    private metrics = {
        processed: 0,
        failed: 0,
        averageProcessingTime: 0,
    };

    registerHandler(eventType: string, handler: Function): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
    }

    async handleEvent(event: DomainEvent): Promise<void> {
        const startTime = Date.now();
        const handlers = this.handlers.get(event.type);

        if (!handlers || handlers.length === 0) {
            return;
        }

        try {
            for (const handler of handlers) {
                await handler(event);
            }
            this.metrics.processed++;
        } catch (error) {
            this.metrics.failed++;
            throw error;
        } finally {
            const processingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(processingTime);
        }
    }

    enqueueEvent(event: DomainEvent): void {
        this.processingQueue.push(event);
        this.processQueue();
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        try {
            while (this.processingQueue.length > 0) {
                const event = this.processingQueue.shift()!;
                await this.handleEvent(event);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private updateAverageProcessingTime(newTime: number): void {
        const totalProcessed = this.metrics.processed + this.metrics.failed;
        this.metrics.averageProcessingTime =
            (this.metrics.averageProcessingTime * (totalProcessed - 1) +
                newTime) /
            totalProcessed;
    }

    handleSiteStatusChanged(event: DomainEvent): void {
        // Simulate site status change handling
        const { siteId, status, responseTime } = event.payload;
        if (status === "offline") {
            this.triggerAlert(siteId);
        }
    }

    handleMonitorCreated(event: DomainEvent): void {
        // Simulate monitor creation handling
        const { monitorId, siteId, type } = event.payload;
        this.initializeMonitor(monitorId, siteId, type);
    }

    handleAlertTriggered(event: DomainEvent): void {
        // Simulate alert handling
        const { alertId, severity, message } = event.payload;
        this.processAlert(alertId, severity, message);
    }

    private triggerAlert(siteId: string): void {
        // Simulate alert triggering logic
        const alertId = `alert-${Date.now()}`;
        // Process alert...
    }

    private initializeMonitor(
        monitorId: string,
        siteId: string,
        type: string
    ): void {
        // Simulate monitor initialization
        // Setup monitoring...
    }

    private processAlert(
        alertId: string,
        severity: string,
        message: string
    ): void {
        // Simulate alert processing
        // Send notifications...
    }

    getMetrics(): any {
        return { ...this.metrics };
    }

    clearMetrics(): void {
        this.metrics = {
            processed: 0,
            failed: 0,
            averageProcessingTime: 0,
        };
    }
}

describe("Event Handler Performance", () => {
    let eventHandler: MockEventHandler;

    bench(
        "event handler initialization",
        () => {
            eventHandler = new MockEventHandler();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "register single handler",
        () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler("site.status.changed", () => {});
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "register multiple handlers",
        () => {
            eventHandler = new MockEventHandler();
            const eventTypes = [
                "site.status.changed",
                "monitor.created",
                "alert.triggered",
            ];
            eventTypes.forEach((type) => {
                eventHandler.registerHandler(type, () => {});
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "handle single event",
        async () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler("test.event", async () => {
                // Simulate async processing
                await new Promise((resolve) => setTimeout(resolve, 1));
            });

            const event: DomainEvent = {
                id: "event-1",
                type: "test.event",
                timestamp: Date.now(),
                correlationId: "corr-1",
                payload: { data: "test" },
            };

            await eventHandler.handleEvent(event);
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "handle site status change event",
        () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler(
                "site.status.changed",
                eventHandler.handleSiteStatusChanged.bind(eventHandler)
            );

            const event: DomainEvent = {
                id: "event-1",
                type: "site.status.changed",
                timestamp: Date.now(),
                correlationId: "corr-1",
                payload: {
                    siteId: "site-1",
                    status: "offline",
                    responseTime: 5000,
                },
            };

            eventHandler.handleEvent(event);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "handle monitor created event",
        () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler(
                "monitor.created",
                eventHandler.handleMonitorCreated.bind(eventHandler)
            );

            const event: DomainEvent = {
                id: "event-2",
                type: "monitor.created",
                timestamp: Date.now(),
                correlationId: "corr-2",
                payload: {
                    monitorId: "monitor-1",
                    siteId: "site-1",
                    type: "http",
                },
            };

            eventHandler.handleEvent(event);
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "queue multiple events",
        () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler("queued.event", () => {});

            for (let i = 0; i < 50; i++) {
                const event: DomainEvent = {
                    id: `event-${i}`,
                    type: "queued.event",
                    timestamp: Date.now(),
                    correlationId: `corr-${i}`,
                    payload: { index: i },
                };
                eventHandler.enqueueEvent(event);
            }
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "handle batch events",
        async () => {
            eventHandler = new MockEventHandler();
            eventHandler.registerHandler("batch.event", async () => {
                // Simulate processing
            });

            const events: DomainEvent[] = Array.from(
                { length: 20 },
                (_, i) => ({
                    id: `batch-event-${i}`,
                    type: "batch.event",
                    timestamp: Date.now(),
                    correlationId: `batch-corr-${i}`,
                    payload: { index: i },
                })
            );

            for (const event of events) {
                await eventHandler.handleEvent(event);
            }
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "metrics collection",
        () => {
            eventHandler = new MockEventHandler();
            // Simulate some processing to generate metrics
            eventHandler.getMetrics();
            eventHandler.clearMetrics();
        },
        { warmupIterations: 10, iterations: 5000 }
    );
});

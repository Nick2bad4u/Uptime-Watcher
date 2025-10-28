/**
 * Event Processing Benchmarks.
 *
 * @packageDocumentation
 *
 * Exercises event processing benchmark scenarios to measure service throughput and resilience.
 */

import { bench, describe } from "vitest";

// Core event system interfaces
/**
 * Represents base event data in the event processing benchmark.
 */
interface BaseEvent {
    id: string;
    type: string;
    timestamp: number;
    source: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Represents site status changed event data in the event processing benchmark.
 */
interface SiteStatusChangedEvent extends BaseEvent {
    type: "site-status-changed";
    payload: {
        siteIdentifier: string;
        previousStatus: "up" | "down" | "degraded";
        currentStatus: "up" | "down" | "degraded";
        responseTime: number;
        monitorId: string;
    };
}

/**
 * Represents monitor check completed event data in the event processing
 * benchmark.
 */
interface MonitorCheckCompletedEvent extends BaseEvent {
    type: "monitor-check-completed";
    payload: {
        monitorId: string;
        siteIdentifier: string;
        status: "up" | "down" | "degraded";
        responseTime: number;
        details?: string;
        error?: string;
    };
}

/**
 * Represents alert triggered event data in the event processing benchmark.
 */
interface AlertTriggeredEvent extends BaseEvent {
    type: "alert-triggered";
    payload: {
        alertId: string;
        severity: "low" | "medium" | "high" | "critical";
        message: string;
        affectedSites: string[];
        triggerCondition: string;
    };
}

/**
 * Represents database operation event data in the event processing benchmark.
 */
interface DatabaseOperationEvent extends BaseEvent {
    type: "database-operation";
    payload: {
        operation: "insert" | "update" | "delete" | "select";
        table: string;
        recordCount: number;
        duration: number;
        success: boolean;
        error?: string;
    };
}

/**
 * Utility type describing event type for the event processing benchmark.
 */
type EventType =
    | SiteStatusChangedEvent
    | MonitorCheckCompletedEvent
    | AlertTriggeredEvent
    | DatabaseOperationEvent;

// Event handler types
/**
 * Utility type describing event handler for the event processing benchmark.
 */
type EventHandler<T extends BaseEvent = BaseEvent> = (
    event: T
) => Promise<void> | void;
/**
 * Utility type describing event middleware for the event processing benchmark.
 */
type EventMiddleware<T extends BaseEvent = BaseEvent> = (
    event: T,
    next: () => Promise<void>
) => Promise<void>;

/**
 * Represents event subscription data in the event processing benchmark.
 */
interface EventSubscription {
    id: string;
    eventType: string;
    handler: EventHandler;
    priority: number;
    enabled: boolean;
    metadata: Record<string, unknown>;
}

/**
 * Represents event processing stats data in the event processing benchmark.
 */
interface EventProcessingStats {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
    throughputPerSecond: number;
    middlewareExecutionTime: number;
    handlerExecutionTime: number;
}

// Mock TypedEventBus implementation
/**
 * Mock typed event bus used to drive the event processing benchmark.
 */
class MockTypedEventBus {
    private subscriptions = new Map<string, EventSubscription[]>();
    private middleware: EventMiddleware[] = [];
    private eventHistory: BaseEvent[] = [];
    private processingStats: EventProcessingStats = {
        totalEvents: 0,
        processedEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        throughputPerSecond: 0,
        middlewareExecutionTime: 0,
        handlerExecutionTime: 0,
    };
    private correlationTracker = new Map<string, BaseEvent[]>();

    /**
     * Adds middleware to the event processing pipeline
     */
    use(middleware: EventMiddleware): void {
        this.middleware.push(middleware);
    }

    /**
     * Subscribes to events with priority and metadata
     */
    subscribe<T extends BaseEvent>(
        eventType: string,
        handler: EventHandler<T>,
        options: {
            priority?: number;
            enabled?: boolean;
            metadata?: Record<string, unknown>;
        } = {}
    ): string {
        const subscription: EventSubscription = {
            id: `sub-${Date.now()}-${Math.random()}`,
            eventType,
            handler: handler as EventHandler,
            priority: options.priority ?? 0,
            enabled: options.enabled ?? true,
            metadata: options.metadata ?? {},
        };

        const existingSubscriptions = this.subscriptions.get(eventType) ?? [];
        existingSubscriptions.push(subscription);

        // Sort by priority (higher first)
        existingSubscriptions.sort((a, b) => b.priority - a.priority);

        this.subscriptions.set(eventType, existingSubscriptions);
        return subscription.id;
    }

    /**
     * Unsubscribes from events
     */
    unsubscribe(subscriptionId: string): boolean {
        for (const [eventType, subscriptions] of this.subscriptions) {
            const index = subscriptions.findIndex(
                (sub) => sub.id === subscriptionId
            );
            if (index !== -1) {
                subscriptions.splice(index, 1);
                if (subscriptions.length === 0) {
                    this.subscriptions.delete(eventType);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Emits a single event through the processing pipeline
     */
    async emit<T extends BaseEvent>(event: T): Promise<void> {
        const startTime = performance.now();
        this.processingStats.totalEvents++;

        try {
            // Add to history
            this.eventHistory.push(event);

            // Track correlation
            if (event.correlationId) {
                const correlated =
                    this.correlationTracker.get(event.correlationId) ?? [];
                correlated.push(event);
                this.correlationTracker.set(event.correlationId, correlated);
            }

            // Execute middleware chain
            const middlewareStartTime = performance.now();
            await this.executeMiddleware(event);
            this.processingStats.middlewareExecutionTime +=
                performance.now() - middlewareStartTime;

            // Execute handlers
            const handlerStartTime = performance.now();
            await this.executeHandlers(event);
            this.processingStats.handlerExecutionTime +=
                performance.now() - handlerStartTime;

            this.processingStats.processedEvents++;
        } catch (error) {
            this.processingStats.failedEvents++;
            throw error;
        } finally {
            const processingTime = performance.now() - startTime;
            this.updateProcessingStats(processingTime);
        }
    }

    /**
     * Emits multiple events in batch
     */
    async emitBatch<T extends BaseEvent>(events: T[]): Promise<void> {
        const promises = events.map((event) => this.emit(event));
        await Promise.all(promises);
    }

    /**
     * Emits events with different concurrency strategies
     */
    async emitConcurrent<T extends BaseEvent>(
        events: T[],
        strategy: "parallel" | "sequential" | "batch",
        batchSize: number = 10
    ): Promise<void> {
        switch (strategy) {
            case "parallel": {
                await Promise.all(events.map((event) => this.emit(event)));
                break;
            }
            case "sequential": {
                for (const event of events) {
                    await this.emit(event);
                }
                break;
            }
            case "batch": {
                for (let i = 0; i < events.length; i += batchSize) {
                    const batch = events.slice(i, i + batchSize);
                    await this.emitBatch(batch);
                }
                break;
            }
        }
    }

    /**
     * Processes events with filtering and transformation
     */
    async processFilteredEvents<T extends BaseEvent>(
        events: T[],
        filter: (event: T) => boolean,
        transformer?: (event: T) => T
    ): Promise<void> {
        const filteredEvents = events.filter((event) => filter(event));
        const transformedEvents = transformer
            ? filteredEvents.map((event) => transformer(event))
            : filteredEvents;

        await this.emitBatch(transformedEvents);
    }

    /**
     * Handles event replay for debugging and recovery
     */
    async replayEvents(
        fromTimestamp: number,
        toTimestamp?: number,
        eventTypeFilter?: string
    ): Promise<void> {
        let eventsToReplay = this.eventHistory.filter(
            (event) => event.timestamp >= fromTimestamp
        );

        if (toTimestamp) {
            eventsToReplay = eventsToReplay.filter(
                (event) => event.timestamp <= toTimestamp
            );
        }

        if (eventTypeFilter) {
            eventsToReplay = eventsToReplay.filter(
                (event) => event.type === eventTypeFilter
            );
        }

        await this.emitBatch(eventsToReplay);
    }

    /**
     * Manages subscription lifecycle with bulk operations
     */
    bulkSubscribe(
        subscriptions: {
            eventType: string;
            handler: EventHandler;
            options?: {
                priority?: number;
                enabled?: boolean;
                metadata?: Record<string, unknown>;
            };
        }[]
    ): string[] {
        return subscriptions.map((sub) =>
            this.subscribe(sub.eventType, sub.handler, sub.options)
        );
    }

    bulkUnsubscribe(subscriptionIds: string[]): number {
        return subscriptionIds.reduce(
            (count, id) => (this.unsubscribe(id) ? count + 1 : count),
            0
        );
    }

    /**
     * Advanced event correlation and analysis
     */
    analyzeEventCorrelations(correlationId: string): {
        events: BaseEvent[];
        timeline: { timestamp: number; eventType: string; gap: number }[];
        totalDuration: number;
        eventCount: number;
    } {
        const events = this.correlationTracker.get(correlationId) ?? [];
        const sortedEvents = events.toSorted(
            (a, b) => a.timestamp - b.timestamp
        );

        const timeline = sortedEvents.map((event, index) => ({
            timestamp: event.timestamp,
            eventType: event.type,
            gap:
                index > 0
                    ? event.timestamp - sortedEvents[index - 1].timestamp
                    : 0,
        }));

        const totalDuration =
            sortedEvents.length > 1
                ? sortedEvents.at(-1)!.timestamp - sortedEvents[0].timestamp
                : 0;

        return {
            events: sortedEvents,
            timeline,
            totalDuration,
            eventCount: events.length,
        };
    }

    /**
     * Performance monitoring and metrics
     */
    getProcessingStats(): EventProcessingStats {
        return { ...this.processingStats };
    }

    getEventHistory(limit?: number): BaseEvent[] {
        return limit
            ? this.eventHistory.slice(-limit)
            : Array.from(this.eventHistory);
    }

    getActiveSubscriptions(): Map<string, number> {
        const counts = new Map<string, number>();
        for (const [eventType, subscriptions] of this.subscriptions) {
            counts.set(
                eventType,
                subscriptions.filter((sub) => sub.enabled).length
            );
        }
        return counts;
    }

    clearHistory(): void {
        this.eventHistory.length = 0;
        this.correlationTracker.clear();
    }

    resetStats(): void {
        this.processingStats = {
            totalEvents: 0,
            processedEvents: 0,
            failedEvents: 0,
            averageProcessingTime: 0,
            throughputPerSecond: 0,
            middlewareExecutionTime: 0,
            handlerExecutionTime: 0,
        };
    }

    // Private helper methods
    private async executeMiddleware(event: BaseEvent): Promise<void> {
        let index = 0;

        const next = async (): Promise<void> => {
            if (index >= this.middleware.length) return;

            const middleware = this.middleware[index++];
            await middleware(event, next);
        };

        await next();
    }

    private async executeHandlers(event: BaseEvent): Promise<void> {
        const subscriptions = this.subscriptions.get(event.type) ?? [];
        const enabledSubscriptions = subscriptions.filter((sub) => sub.enabled);

        // Execute handlers in priority order
        const handlerPromises = enabledSubscriptions.map(
            async (subscription) => {
                try {
                    await subscription.handler(event);
                } catch (error) {
                    // Log error but don't throw to prevent stopping other handlers
                    console.error(`Handler ${subscription.id} failed:`, error);
                }
            }
        );

        await Promise.all(handlerPromises);
    }

    private updateProcessingStats(processingTime: number): void {
        const stats = this.processingStats;
        stats.averageProcessingTime =
            (stats.averageProcessingTime * (stats.processedEvents - 1) +
                processingTime) /
            stats.processedEvents;

        // Simple throughput calculation (events per second over last period)
        const now = Date.now();
        const recentEvents = this.eventHistory.filter(
            (event) => now - event.timestamp < 1000
        );
        stats.throughputPerSecond = recentEvents.length;
    }
}

// Helper functions for generating test data
/**
 * Creates site status events for the event processing benchmark.
 */
function generateSiteStatusEvents(
    count: number,
    siteIds: string[]
): SiteStatusChangedEvent[] {
    const events: SiteStatusChangedEvent[] = [];
    const statuses = [
        "up",
        "down",
        "degraded",
    ] as const;

    for (let i = 0; i < count; i++) {
        const siteIdentifier =
            siteIds[Math.floor(Math.random() * siteIds.length)];
        const currentStatus =
            statuses[Math.floor(Math.random() * statuses.length)];
        const previousStatus =
            statuses[Math.floor(Math.random() * statuses.length)];

        events.push({
            id: `status-event-${i}`,
            type: "site-status-changed",
            timestamp: Date.now() - Math.random() * 86_400_000, // Last 24 hours
            source: "monitoring-service",
            correlationId:
                Math.random() > 0.7 ? `corr-${Math.floor(i / 5)}` : undefined,
            payload: {
                siteIdentifier,
                previousStatus,
                currentStatus,
                responseTime: Math.random() * 2000,
                monitorId: `${siteIdentifier}-monitor-${Math.floor(
                    Math.random() * 5
                )}`,
            },
        });
    }

    return events;
}

/**
 * Creates monitor check events for the event processing benchmark.
 */
function generateMonitorCheckEvents(
    count: number,
    siteIds: string[]
): MonitorCheckCompletedEvent[] {
    const events: MonitorCheckCompletedEvent[] = [];
    const statuses = [
        "up",
        "down",
        "degraded",
    ] as const;

    for (let i = 0; i < count; i++) {
        const siteIdentifier =
            siteIds[Math.floor(Math.random() * siteIds.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        events.push({
            id: `check-event-${i}`,
            type: "monitor-check-completed",
            timestamp: Date.now() - Math.random() * 3_600_000, // Last hour
            source: "monitor-checker",
            correlationId:
                Math.random() > 0.8
                    ? `check-corr-${Math.floor(i / 3)}`
                    : undefined,
            payload: {
                monitorId: `${siteIdentifier}-monitor-${Math.floor(
                    Math.random() * 10
                )}`,
                siteIdentifier,
                status,
                responseTime: status === "down" ? 0 : Math.random() * 1500,
                details: status === "down" ? "Connection timeout" : undefined,
                error: status === "down" ? "ECONNREFUSED" : undefined,
            },
        });
    }

    return events;
}

/**
 * Creates alert events for the event processing benchmark.
 */
function generateAlertEvents(
    count: number,
    siteIds: string[]
): AlertTriggeredEvent[] {
    const events: AlertTriggeredEvent[] = [];
    const severities = [
        "low",
        "medium",
        "high",
        "critical",
    ] as const;

    for (let i = 0; i < count; i++) {
        const severity =
            severities[Math.floor(Math.random() * severities.length)];
        const affectedSites = siteIds.slice(
            0,
            Math.floor(Math.random() * 3) + 1
        );

        events.push({
            id: `alert-event-${i}`,
            type: "alert-triggered",
            timestamp: Date.now() - Math.random() * 7_200_000, // Last 2 hours
            source: "alert-manager",
            correlationId: `alert-corr-${Math.floor(i / 2)}`,
            payload: {
                alertId: `alert-${i}`,
                severity,
                message: `${severity.toUpperCase()}: Site monitoring alert`,
                affectedSites,
                triggerCondition: "response_time > 5000ms OR uptime < 95%",
            },
        });
    }

    return events;
}

/**
 * Creates database events for the event processing benchmark.
 */
function generateDatabaseEvents(count: number): DatabaseOperationEvent[] {
    const events: DatabaseOperationEvent[] = [];
    const operations = [
        "insert",
        "update",
        "delete",
        "select",
    ] as const;
    const tables = [
        "sites",
        "monitors",
        "status_history",
        "alerts",
        "settings",
    ];

    for (let i = 0; i < count; i++) {
        const operation =
            operations[Math.floor(Math.random() * operations.length)];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const success = Math.random() > 0.05; // 95% success rate

        events.push({
            id: `db-event-${i}`,
            type: "database-operation",
            timestamp: Date.now() - Math.random() * 1_800_000, // Last 30 minutes
            source: "database-service",
            correlationId:
                Math.random() > 0.6
                    ? `db-corr-${Math.floor(i / 4)}`
                    : undefined,
            payload: {
                operation,
                table,
                recordCount: Math.floor(Math.random() * 1000) + 1,
                duration: Math.random() * 500,
                success,
                error: success ? undefined : "Constraint violation",
            },
        });
    }

    return events;
}

/**
 * Creates mixed events for the event processing benchmark.
 */
function generateMixedEvents(count: number, siteIds: string[]): BaseEvent[] {
    const events: BaseEvent[] = [
        ...generateSiteStatusEvents(Math.floor(count * 0.4), siteIds),
        ...generateMonitorCheckEvents(Math.floor(count * 0.3), siteIds),
        ...generateAlertEvents(Math.floor(count * 0.2), siteIds),
        ...generateDatabaseEvents(Math.floor(count * 0.1)),
    ];

    return events.toSorted((a, b) => a.timestamp - b.timestamp);
}

// Benchmark test suites
describe("TypedEventBus and Event Processing Benchmarks", () => {
    let eventBus: MockTypedEventBus;
    const siteIds = Array.from({ length: 20 }, (_, i) => `site-${i + 1}`);

    beforeEach(() => {
        eventBus = new MockTypedEventBus();
    });

    describe("Basic Event Operations", () => {
        bench(
            "Single event emission",
            async () => {
                const event = generateSiteStatusEvents(1, ["site-1"])[0];
                await eventBus.emit(event);
            },
            { iterations: 1000 }
        );

        bench(
            "Batch event emission - 10 events",
            async () => {
                const events = generateSiteStatusEvents(10, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 200 }
        );

        bench(
            "Batch event emission - 50 events",
            async () => {
                const events = generateMixedEvents(50, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 50 }
        );

        bench(
            "Batch event emission - 200 events",
            async () => {
                const events = generateMixedEvents(200, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 10 }
        );
    });

    describe("Subscription Management", () => {
        bench(
            "Subscribe to single event type",
            () => {
                eventBus.subscribe("site-status-changed", async () => {
                    // Simple handler
                });
            },
            { iterations: 1000 }
        );

        bench(
            "Bulk subscription - 50 handlers",
            () => {
                const subscriptions = Array.from({ length: 50 }, (_, i) => ({
                    eventType: "monitor-check-completed",
                    handler: async () => {
                        // Handler logic
                    },
                    options: { priority: i % 10, metadata: { handlerId: i } },
                }));

                eventBus.bulkSubscribe(subscriptions);
            },
            { iterations: 50 }
        );

        bench(
            "Bulk subscription - mixed event types",
            () => {
                const eventTypes = [
                    "site-status-changed",
                    "monitor-check-completed",
                    "alert-triggered",
                    "database-operation",
                ];
                const subscriptions = Array.from({ length: 100 }, (_, i) => ({
                    eventType: eventTypes[i % eventTypes.length],
                    handler: async () => {
                        // Handler logic
                    },
                    options: { priority: Math.floor(Math.random() * 10) },
                }));

                eventBus.bulkSubscribe(subscriptions);
            },
            { iterations: 20 }
        );

        bench(
            "Subscribe and unsubscribe cycle",
            () => {
                const subscriptionId = eventBus.subscribe(
                    "site-status-changed",
                    async () => {}
                );
                eventBus.unsubscribe(subscriptionId);
            },
            { iterations: 500 }
        );
    });

    describe("Middleware Processing", () => {
        bench(
            "Single middleware - simple processing",
            async () => {
                eventBus.use(async (event, next) => {
                    // Simple middleware
                    await next();
                });

                const event = generateSiteStatusEvents(1, ["site-1"])[0];
                await eventBus.emit(event);
            },
            { iterations: 500 }
        );

        bench(
            "Multiple middleware - complex chain",
            async () => {
                // Logging middleware
                eventBus.use(async (event, next) => {
                    const startTime = performance.now();
                    await next();
                    const duration = performance.now() - startTime;
                    event.metadata = {
                        ...event.metadata,
                        processingTime: duration,
                    };
                });

                // Validation middleware
                eventBus.use(async (event, next) => {
                    if (!event.id || !event.type) {
                        throw new Error("Invalid event");
                    }
                    await next();
                });

                // Enrichment middleware
                eventBus.use(async (event, next) => {
                    event.metadata = {
                        ...event.metadata,
                        enrichedAt: Date.now(),
                        version: "1.0",
                    };
                    await next();
                });

                // Rate limiting middleware
                eventBus.use(async (event, next) => {
                    // Simulate rate limiting check
                    await new Promise((resolve) => setTimeout(resolve, 1));
                    await next();
                });

                const events = generateMixedEvents(10, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 100 }
        );

        bench(
            "Heavy middleware processing",
            async () => {
                // Simulate heavy processing middleware
                eventBus.use(async (event, next) => {
                    // Simulate complex validation
                    const validationResult = JSON.stringify(event).length > 100;
                    if (!validationResult) throw new Error("Validation failed");

                    // Simulate transformation
                    event.metadata = {
                        ...event.metadata,
                        processed: true,
                        validationScore: Math.random(),
                        transformedAt: Date.now(),
                    };

                    await next();
                });

                const events = generateMixedEvents(25, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 50 }
        );
    });

    describe("Concurrent Event Processing", () => {
        bench(
            "Parallel processing - 50 events",
            async () => {
                const events = generateMixedEvents(50, siteIds);
                await eventBus.emitConcurrent(events, "parallel");
            },
            { iterations: 50 }
        );

        bench(
            "Sequential processing - 50 events",
            async () => {
                const events = generateMixedEvents(50, siteIds);
                await eventBus.emitConcurrent(events, "sequential");
            },
            { iterations: 30 }
        );

        bench(
            "Batch processing - 100 events, batch size 10",
            async () => {
                const events = generateMixedEvents(100, siteIds);
                await eventBus.emitConcurrent(events, "batch", 10);
            },
            { iterations: 20 }
        );

        bench(
            "High-throughput processing - 500 events",
            async () => {
                const events = generateMixedEvents(500, siteIds);
                await eventBus.emitConcurrent(events, "parallel");
            },
            { iterations: 5 }
        );
    });

    describe("Event Filtering and Transformation", () => {
        bench(
            "Filter critical events only",
            async () => {
                const events = generateMixedEvents(100, siteIds);

                await eventBus.processFilteredEvents(events, (event) => {
                    if (event.type === "alert-triggered") {
                        const alertEvent = event as AlertTriggeredEvent;
                        return alertEvent.payload.severity === "critical";
                    }
                    if (event.type === "site-status-changed") {
                        const statusEvent = event as SiteStatusChangedEvent;
                        return statusEvent.payload.currentStatus === "down";
                    }
                    return false;
                });
            },
            { iterations: 100 }
        );

        bench(
            "Transform and enrich events",
            async () => {
                const events = generateMixedEvents(50, siteIds);

                await eventBus.processFilteredEvents(
                    events,
                    () => true, // Process all events
                    (event) => ({
                        ...event,
                        metadata: {
                            ...event.metadata,
                            processedAt: Date.now(),
                            enrichedBy: "transformation-service",
                            eventVersion: "2.0",
                        },
                    })
                );
            },
            { iterations: 100 }
        );

        bench(
            "Complex filtering with multiple conditions",
            async () => {
                const events = generateMixedEvents(200, siteIds);

                await eventBus.processFilteredEvents(events, (event) => {
                    // Multiple complex conditions
                    const isRecent = Date.now() - event.timestamp < 3_600_000; // Last hour
                    const hasCorrelation = Boolean(event.correlationId);
                    const isHighPriority =
                        (event.type === "alert-triggered" &&
                            (event as AlertTriggeredEvent).payload.severity ===
                                "high") ||
                        (event.type === "site-status-changed" &&
                            (event as SiteStatusChangedEvent).payload
                                .currentStatus === "down");

                    return isRecent && hasCorrelation && isHighPriority;
                });
            },
            { iterations: 50 }
        );
    });

    describe("Event Replay and History Management", () => {
        bench(
            "Replay last hour events",
            async () => {
                // Populate history
                const historyEvents = generateMixedEvents(100, siteIds);
                await eventBus.emitBatch(historyEvents);

                // Replay
                const oneHourAgo = Date.now() - 3_600_000;
                await eventBus.replayEvents(oneHourAgo);
            },
            { iterations: 20 }
        );

        bench(
            "Replay with event type filter",
            async () => {
                // Populate history
                const historyEvents = generateMixedEvents(150, siteIds);
                await eventBus.emitBatch(historyEvents);

                // Replay only alert events
                const sixHoursAgo = Date.now() - 21_600_000;
                await eventBus.replayEvents(
                    sixHoursAgo,
                    Date.now(),
                    "alert-triggered"
                );
            },
            { iterations: 15 }
        );

        bench(
            "Event history analysis",
            () => {
                // Populate history
                const historyEvents = generateMixedEvents(200, siteIds);
                historyEvents.forEach((event) => eventBus.emit(event));

                // Analyze history
                const history = eventBus.getEventHistory();
                const stats = eventBus.getProcessingStats();
                const subscriptions = eventBus.getActiveSubscriptions();

                // Perform analysis
                const eventTypeCounts = history.reduce(
                    (acc, event) => {
                        acc[event.type] = (acc[event.type] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                const correlatedEvents = history.filter(
                    (event) => event.correlationId
                );
                const recentEvents = history.filter(
                    (event) => Date.now() - event.timestamp < 1_800_000 // Last 30 minutes
                );
            },
            { iterations: 50 }
        );
    });

    describe("Event Correlation and Analysis", () => {
        bench(
            "Correlation tracking and analysis",
            async () => {
                // Generate correlated events
                const correlationId = "test-correlation-1";
                const correlatedEvents = generateMixedEvents(20, siteIds).map(
                    (event) => ({
                        ...event,
                        correlationId,
                    })
                );

                await eventBus.emitBatch(correlatedEvents);

                // Analyze correlations
                const analysis =
                    eventBus.analyzeEventCorrelations(correlationId);

                // Additional analysis
                const eventsByType = analysis.events.reduce(
                    (acc, event) => {
                        acc[event.type] = (acc[event.type] || 0) + 1;
                        return acc;
                    },
                    {} as Record<string, number>
                );

                const averageGap =
                    analysis.timeline.reduce((sum, item) => sum + item.gap, 0) /
                    (analysis.timeline.length - 1 || 1);
            },
            { iterations: 100 }
        );

        bench(
            "Multiple correlation analysis",
            async () => {
                // Generate multiple correlation chains
                const correlationIds = [
                    "corr-1",
                    "corr-2",
                    "corr-3",
                    "corr-4",
                    "corr-5",
                ];

                for (const corrId of correlationIds) {
                    const events = generateMixedEvents(15, siteIds).map(
                        (event) => ({
                            ...event,
                            correlationId: corrId,
                        })
                    );
                    await eventBus.emitBatch(events);
                }

                // Analyze all correlations
                const analyses = correlationIds.map((corrId) =>
                    eventBus.analyzeEventCorrelations(corrId)
                );

                // Aggregate analysis
                const totalEvents = analyses.reduce(
                    (sum, analysis) => sum + analysis.eventCount,
                    0
                );
                const averageDuration =
                    analyses.reduce(
                        (sum, analysis) => sum + analysis.totalDuration,
                        0
                    ) / analyses.length;
            },
            { iterations: 20 }
        );
    });

    describe("High-Load Stress Testing", () => {
        bench(
            "High-frequency event emission - 1000 events",
            async () => {
                const events = generateMixedEvents(1000, siteIds);
                await eventBus.emitConcurrent(events, "parallel");
            },
            { iterations: 3 }
        );

        bench(
            "Complex handlers with processing",
            async () => {
                // Setup complex handlers
                eventBus.subscribe(
                    "site-status-changed",
                    async (event) => {
                        // Simulate complex processing
                        const data = JSON.stringify(event);

                        // Simple hash calculation avoiding bitwise operations
                        let hash = 0;
                        for (const char of data) {
                            const code = char.codePointAt(0) ?? 0;
                            hash = Math.abs(hash * 31 + code) % 1_000_000;
                        }

                        // Simulate async work
                        await new Promise((resolve) =>
                            setTimeout(resolve, Math.random() * 5)
                        );
                    },
                    { priority: 10 }
                );

                eventBus.subscribe(
                    "monitor-check-completed",
                    async (event) => {
                        // Simulate database write
                        await new Promise((resolve) =>
                            setTimeout(resolve, Math.random() * 10)
                        );

                        // Type-safe check for monitor event
                        if (event.type === "monitor-check-completed") {
                            const monitorEvent =
                                event as MonitorCheckCompletedEvent;
                            if (monitorEvent.payload.responseTime > 5000) {
                                // Trigger alert (would emit another event in real scenario)
                            }
                        }
                    },
                    { priority: 5 }
                );

                eventBus.subscribe(
                    "alert-triggered",
                    async (event) => {
                        // Simulate notification sending
                        await new Promise((resolve) =>
                            setTimeout(resolve, Math.random() * 15)
                        );
                    },
                    { priority: 1 }
                );

                const events = generateMixedEvents(100, siteIds);
                await eventBus.emitBatch(events);
            },
            { iterations: 10 }
        );

        bench(
            "Memory intensive event processing",
            async () => {
                // Create many subscriptions
                const subscriptionIds: string[] = [];
                for (let i = 0; i < 200; i++) {
                    const id = eventBus.subscribe(
                        "site-status-changed",
                        async (event) => {
                            // Store event data in memory (simulate caching)
                            const cache = new Map([[event.id, event]]);

                            // Process event
                            const processed = {
                                ...event,
                                processedBy: `handler-${i}`,
                                processedAt: Date.now(),
                            };
                        }
                    );
                    subscriptionIds.push(id);
                }

                // Process events
                const events = generateSiteStatusEvents(50, siteIds);
                await eventBus.emitBatch(events);

                // Cleanup
                eventBus.bulkUnsubscribe(subscriptionIds);
            },
            { iterations: 5 }
        );

        bench(
            "Event system performance under load",
            async () => {
                // Setup comprehensive system
                eventBus.use(async (event, next) => {
                    event.metadata = { ...event.metadata, middleware1: true };
                    await next();
                });

                eventBus.use(async (event, next) => {
                    event.metadata = {
                        ...event.metadata,
                        middleware2: Date.now(),
                    };
                    await next();
                });

                // Multiple handlers for each event type
                const eventTypes = [
                    "site-status-changed",
                    "monitor-check-completed",
                    "alert-triggered",
                    "database-operation",
                ];
                const subscriptionIds: string[] = [];

                for (const eventType of eventTypes) {
                    for (let i = 0; i < 10; i++) {
                        const id = eventBus.subscribe(
                            eventType,
                            async () => {
                                await new Promise((resolve) =>
                                    setTimeout(resolve, Math.random() * 3)
                                );
                            },
                            { priority: Math.floor(Math.random() * 10) }
                        );
                        subscriptionIds.push(id);
                    }
                }

                // Generate and process large number of events
                const events = generateMixedEvents(500, siteIds);
                await eventBus.emitConcurrent(events, "batch", 25);

                // Analyze performance
                const stats = eventBus.getProcessingStats();
                const history = eventBus.getEventHistory(100);

                // Cleanup
                eventBus.bulkUnsubscribe(subscriptionIds);
            },
            { iterations: 2 }
        );
    });
});

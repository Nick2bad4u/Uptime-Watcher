/**
 * Domain Events Performance Benchmarks
 *
 * @file Performance benchmarks for domain event creation, serialization, and processing.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Event-DomainEvents
 * @tags ["performance", "events", "domain-events", "serialization"]
 */

import { bench, describe } from "vitest";

interface BaseDomainEvent {
    id: string;
    type: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    timestamp: number;
    correlationId: string;
    causationId?: string;
    metadata: Record<string, any>;
}

interface SiteCreatedEvent extends BaseDomainEvent {
    type: 'site.created';
    payload: {
        name: string;
        url: string;
        monitorType: string;
        interval: number;
    };
}

interface SiteStatusChangedEvent extends BaseDomainEvent {
    type: 'site.status.changed';
    payload: {
        previousStatus: string;
        newStatus: string;
        responseTime?: number;
        error?: string;
    };
}

interface MonitorCreatedEvent extends BaseDomainEvent {
    type: 'monitor.created';
    payload: {
        monitorType: string;
        interval: number;
        timeout: number;
        configuration: Record<string, any>;
    };
}

type DomainEvent = SiteCreatedEvent | SiteStatusChangedEvent | MonitorCreatedEvent;

class MockDomainEventFactory {
    private eventIdCounter = 0;

    createSiteCreatedEvent(aggregateId: string, payload: SiteCreatedEvent['payload']): SiteCreatedEvent {
        return {
            id: this.generateEventId(),
            type: 'site.created',
            aggregateId,
            aggregateType: 'Site',
            version: 1,
            timestamp: Date.now(),
            correlationId: this.generateCorrelationId(),
            metadata: this.createMetadata(),
            payload
        };
    }

    createSiteStatusChangedEvent(aggregateId: string, payload: SiteStatusChangedEvent['payload']): SiteStatusChangedEvent {
        return {
            id: this.generateEventId(),
            type: 'site.status.changed',
            aggregateId,
            aggregateType: 'Site',
            version: 1,
            timestamp: Date.now(),
            correlationId: this.generateCorrelationId(),
            metadata: this.createMetadata(),
            payload
        };
    }

    createMonitorCreatedEvent(aggregateId: string, payload: MonitorCreatedEvent['payload']): MonitorCreatedEvent {
        return {
            id: this.generateEventId(),
            type: 'monitor.created',
            aggregateId,
            aggregateType: 'Monitor',
            version: 1,
            timestamp: Date.now(),
            correlationId: this.generateCorrelationId(),
            metadata: this.createMetadata(),
            payload
        };
    }

    private generateEventId(): string {
        return `event-${++this.eventIdCounter}-${Date.now()}`;
    }

    private generateCorrelationId(): string {
        return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    private createMetadata(): Record<string, any> {
        return {
            source: 'uptime-watcher',
            version: '1.0.0',
            environment: 'test',
            userId: `user-${Math.floor(Math.random() * 100)}`
        };
    }
}

class MockEventSerializer {
    serialize(event: DomainEvent): string {
        return JSON.stringify(event);
    }

    deserialize(data: string): DomainEvent {
        return JSON.parse(data);
    }

    serializeBatch(events: DomainEvent[]): string {
        return JSON.stringify(events);
    }

    deserializeBatch(data: string): DomainEvent[] {
        return JSON.parse(data);
    }

    compress(data: string): string {
        // Simulate compression (simplified)
        return Buffer.from(data).toString('base64');
    }

    decompress(compressedData: string): string {
        // Simulate decompression
        return Buffer.from(compressedData, 'base64').toString();
    }
}

class MockEventStore {
    private events = new Map<string, DomainEvent[]>();
    private eventsByType = new Map<string, DomainEvent[]>();

    append(aggregateId: string, events: DomainEvent[]): void {
        if (!this.events.has(aggregateId)) {
            this.events.set(aggregateId, []);
        }
        
        const aggregateEvents = this.events.get(aggregateId)!;
        aggregateEvents.push(...events);
        
        // Index by type
        for (const event of events) {
            if (!this.eventsByType.has(event.type)) {
                this.eventsByType.set(event.type, []);
            }
            this.eventsByType.get(event.type)!.push(event);
        }
    }

    getEvents(aggregateId: string, fromVersion?: number): DomainEvent[] {
        const events = this.events.get(aggregateId) || [];
        return fromVersion ? events.filter(e => e.version >= fromVersion) : events;
    }

    getEventsByType(eventType: string): DomainEvent[] {
        return this.eventsByType.get(eventType) || [];
    }

    getAllEvents(): DomainEvent[] {
        const allEvents: DomainEvent[] = [];
        for (const events of this.events.values()) {
            allEvents.push(...events);
        }
        return allEvents.sort((a, b) => a.timestamp - b.timestamp);
    }

    getEventCount(): number {
        return this.getAllEvents().length;
    }

    clear(): void {
        this.events.clear();
        this.eventsByType.clear();
    }
}

class MockEventProjector {
    private projections = new Map<string, any>();

    project(event: DomainEvent): void {
        switch (event.type) {
            case 'site.created': {
                this.projectSiteCreated(event);
                break;
            }
            case 'site.status.changed': {
                this.projectSiteStatusChanged(event);
                break;
            }
            case 'monitor.created': {
                this.projectMonitorCreated(event);
                break;
            }
        }
    }

    private projectSiteCreated(event: SiteCreatedEvent): void {
        const siteId = event.aggregateId;
        this.projections.set(`site:${siteId}`, {
            id: siteId,
            name: event.payload.name,
            url: event.payload.url,
            status: 'unknown',
            created: event.timestamp,
            lastUpdated: event.timestamp
        });
    }

    private projectSiteStatusChanged(event: SiteStatusChangedEvent): void {
        const siteId = event.aggregateId;
        const projection = this.projections.get(`site:${siteId}`);
        if (projection) {
            projection.status = event.payload.newStatus;
            projection.lastUpdated = event.timestamp;
            if (event.payload.responseTime) {
                projection.lastResponseTime = event.payload.responseTime;
            }
        }
    }

    private projectMonitorCreated(event: MonitorCreatedEvent): void {
        const monitorId = event.aggregateId;
        this.projections.set(`monitor:${monitorId}`, {
            id: monitorId,
            type: event.payload.monitorType,
            interval: event.payload.interval,
            timeout: event.payload.timeout,
            configuration: event.payload.configuration,
            created: event.timestamp
        });
    }

    getProjection(key: string): any {
        return this.projections.get(key);
    }

    getAllProjections(): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [key, value] of this.projections) {
            result[key] = value;
        }
        return result;
    }

    clear(): void {
        this.projections.clear();
    }
}

describe("Domain Events Performance", () => {
    let factory: MockDomainEventFactory;
    let serializer: MockEventSerializer;
    let eventStore: MockEventStore;
    let projector: MockEventProjector;

    bench("event factory initialization", () => {
        factory = new MockDomainEventFactory();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("create site created event", () => {
        factory = new MockDomainEventFactory();
        factory.createSiteCreatedEvent('site-1', {
            name: 'Test Site',
            url: 'https://test.com',
            monitorType: 'http',
            interval: 60_000
        });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("create site status changed event", () => {
        factory = new MockDomainEventFactory();
        factory.createSiteStatusChangedEvent('site-1', {
            previousStatus: 'online',
            newStatus: 'offline',
            responseTime: 5000,
            error: 'Timeout'
        });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("create monitor created event", () => {
        factory = new MockDomainEventFactory();
        factory.createMonitorCreatedEvent('monitor-1', {
            monitorType: 'http',
            interval: 30_000,
            timeout: 10_000,
            configuration: { followRedirects: true, validateSSL: true }
        });
    }, { warmupIterations: 10, iterations: 5000 });

    bench("serialize single event", () => {
        factory = new MockDomainEventFactory();
        serializer = new MockEventSerializer();
        const event = factory.createSiteCreatedEvent('site-1', {
            name: 'Test Site',
            url: 'https://test.com',
            monitorType: 'http',
            interval: 60_000
        });
        serializer.serialize(event);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("serialize batch of events", () => {
        factory = new MockDomainEventFactory();
        serializer = new MockEventSerializer();
        const events: DomainEvent[] = [];
        for (let i = 0; i < 50; i++) {
            events.push(factory.createSiteStatusChangedEvent(`site-${i}`, {
                previousStatus: 'online',
                newStatus: 'offline',
                responseTime: Math.random() * 1000
            }));
        }
        serializer.serializeBatch(events);
    }, { warmupIterations: 5, iterations: 500 });

    bench("deserialize single event", () => {
        factory = new MockDomainEventFactory();
        serializer = new MockEventSerializer();
        const event = factory.createSiteCreatedEvent('site-1', {
            name: 'Test Site',
            url: 'https://test.com',
            monitorType: 'http',
            interval: 60_000
        });
        const serialized = serializer.serialize(event);
        serializer.deserialize(serialized);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("store events", () => {
        factory = new MockDomainEventFactory();
        eventStore = new MockEventStore();
        const events = [
            factory.createSiteCreatedEvent('site-1', {
                name: 'Test Site',
                url: 'https://test.com',
                monitorType: 'http',
                interval: 60_000
            }),
            factory.createSiteStatusChangedEvent('site-1', {
                previousStatus: 'unknown',
                newStatus: 'online',
                responseTime: 200
            })
        ];
        eventStore.append('site-1', events);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("retrieve events by aggregate", () => {
        factory = new MockDomainEventFactory();
        eventStore = new MockEventStore();
        // Pre-populate store
        for (let i = 0; i < 100; i++) {
            const events = [factory.createSiteStatusChangedEvent(`site-${i % 10}`, {
                previousStatus: 'online',
                newStatus: 'offline',
                responseTime: Math.random() * 1000
            })];
            eventStore.append(`site-${i % 10}`, events);
        }
        eventStore.getEvents('site-5');
    }, { warmupIterations: 10, iterations: 1000 });

    bench("retrieve events by type", () => {
        factory = new MockDomainEventFactory();
        eventStore = new MockEventStore();
        // Pre-populate store
        for (let i = 0; i < 200; i++) {
            const events = [factory.createSiteStatusChangedEvent(`site-${i}`, {
                previousStatus: 'online',
                newStatus: 'offline',
                responseTime: Math.random() * 1000
            })];
            eventStore.append(`site-${i}`, events);
        }
        eventStore.getEventsByType('site.status.changed');
    }, { warmupIterations: 5, iterations: 500 });

    bench("project single event", () => {
        factory = new MockDomainEventFactory();
        projector = new MockEventProjector();
        const event = factory.createSiteCreatedEvent('site-1', {
            name: 'Test Site',
            url: 'https://test.com',
            monitorType: 'http',
            interval: 60_000
        });
        projector.project(event);
    }, { warmupIterations: 10, iterations: 2000 });

    bench("project batch of events", () => {
        factory = new MockDomainEventFactory();
        projector = new MockEventProjector();
        const events: DomainEvent[] = [];
        for (let i = 0; i < 20; i++) {
            events.push(factory.createSiteCreatedEvent(`site-${i}`, {
                name: `Site ${i}`,
                url: `https://site${i}.com`,
                monitorType: 'http',
                interval: 60_000
            }));
            events.push(factory.createSiteStatusChangedEvent(`site-${i}`, {
                previousStatus: 'unknown',
                newStatus: 'online',
                responseTime: Math.random() * 500
            }));
        }
        for (const event of events) {
            projector.project(event);
        }
    }, { warmupIterations: 5, iterations: 200 });

    bench("complete event lifecycle", () => {
        factory = new MockDomainEventFactory();
        serializer = new MockEventSerializer();
        eventStore = new MockEventStore();
        projector = new MockEventProjector();
        
        // Create event
        const event = factory.createSiteCreatedEvent('site-lifecycle', {
            name: 'Lifecycle Site',
            url: 'https://lifecycle.com',
            monitorType: 'http',
            interval: 60_000
        });
        
        // Serialize
        const serialized = serializer.serialize(event);
        
        // Deserialize
        const deserialized = serializer.deserialize(serialized);
        
        // Store
        eventStore.append('site-lifecycle', [deserialized]);
        
        // Project
        projector.project(deserialized);
    }, { warmupIterations: 5, iterations: 500 });
});

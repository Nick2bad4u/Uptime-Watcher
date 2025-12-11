/**
 * Event Subscriptions Performance Benchmarks
 *
 * @file Performance benchmarks for event subscription and unsubscription
 *   operations.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Event-EventSubscriptions
 *
 * @tags ["performance", "events", "subscriptions", "pub-sub"]
 */

import { bench, describe } from "vitest";

interface EventSubscription {
    id: string;
    eventType: string;
    handler: Function;
    priority: number;
    filter?: (event: any) => boolean;
    metadata: Record<string, any>;
    created: number;
    lastTriggered?: number;
    triggerCount: number;
}

interface SubscriptionGroup {
    name: string;
    subscriptions: Set<string>;
    isActive: boolean;
    metadata: Record<string, any>;
}

class MockEventSubscriptionManager {
    private subscriptions = new Map<string, EventSubscription>();
    private subscriptionsByType = new Map<string, Set<string>>();
    private subscriptionGroups = new Map<string, SubscriptionGroup>();
    private subscriptionCounter = 0;
    private metrics = {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalUnsubscriptions: 0,
        eventsHandled: 0,
        averageHandlerTime: 0,
    };

    subscribe(eventType: string, handler: Function, options: any = {}): string {
        const subscriptionId = this.generateSubscriptionId();

        const subscription: EventSubscription = {
            id: subscriptionId,
            eventType,
            handler,
            priority: options.priority || 0,
            filter: options.filter,
            metadata: options.metadata || {},
            created: Date.now(),
            triggerCount: 0,
        };

        this.subscriptions.set(subscriptionId, subscription);

        // Index by event type
        if (!this.subscriptionsByType.has(eventType)) {
            this.subscriptionsByType.set(eventType, new Set());
        }
        this.subscriptionsByType.get(eventType)!.add(subscriptionId);

        this.metrics.totalSubscriptions++;
        this.metrics.activeSubscriptions++;

        return subscriptionId;
    }

    unsubscribe(subscriptionId: string): boolean {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            return false;
        }

        // Remove from type index
        const subscriptionsOfType = this.subscriptionsByType.get(
            subscription.eventType
        );
        if (subscriptionsOfType) {
            subscriptionsOfType.delete(subscriptionId);
            if (subscriptionsOfType.size === 0) {
                this.subscriptionsByType.delete(subscription.eventType);
            }
        }

        // Remove from groups
        for (const group of this.subscriptionGroups.values()) {
            group.subscriptions.delete(subscriptionId);
        }

        this.subscriptions.delete(subscriptionId);
        this.metrics.totalUnsubscriptions++;
        this.metrics.activeSubscriptions--;

        return true;
    }

    unsubscribeByType(eventType: string): number {
        const subscriptionIds = this.subscriptionsByType.get(eventType);
        if (!subscriptionIds) {
            return 0;
        }

        const count = subscriptionIds.size;
        for (const subscriptionId of Array.from(subscriptionIds)) {
            this.unsubscribe(subscriptionId);
        }

        return count;
    }

    createSubscriptionGroup(
        groupName: string,
        subscriptionIds: string[]
    ): void {
        const group: SubscriptionGroup = {
            name: groupName,
            subscriptions: new Set(subscriptionIds),
            isActive: true,
            metadata: {},
        };

        this.subscriptionGroups.set(groupName, group);
    }

    activateGroup(groupName: string): void {
        const group = this.subscriptionGroups.get(groupName);
        if (group) {
            group.isActive = true;
        }
    }

    deactivateGroup(groupName: string): void {
        const group = this.subscriptionGroups.get(groupName);
        if (group) {
            group.isActive = false;
        }
    }

    removeGroup(groupName: string): boolean {
        return this.subscriptionGroups.delete(groupName);
    }

    async publishEvent(eventType: string, payload: any): Promise<void> {
        const subscriptionIds = this.subscriptionsByType.get(eventType);
        if (!subscriptionIds || subscriptionIds.size === 0) {
            return;
        }

        // Get all matching subscriptions
        const activeSubscriptions: EventSubscription[] = [];
        for (const subscriptionId of subscriptionIds) {
            const subscription = this.subscriptions.get(subscriptionId);
            if (subscription && this.isSubscriptionActive(subscription)) {
                if (!subscription.filter) {
                    activeSubscriptions.push(subscription);
                } else if (subscription.filter.call(this, payload)) {
                    activeSubscriptions.push(subscription);
                }
            }
        }

        // Sort by priority (higher first)
        activeSubscriptions.sort((a, b) => b.priority - a.priority);

        // Execute handlers
        for (const subscription of activeSubscriptions) {
            const startTime = Date.now();
            try {
                await subscription.handler(payload);
                subscription.triggerCount++;
                subscription.lastTriggered = Date.now();
                this.metrics.eventsHandled++;

                const handlerTime = Date.now() - startTime;
                this.updateAverageHandlerTime(handlerTime);
            } catch (error) {
                console.error(
                    `Handler error for subscription ${subscription.id}:`,
                    error
                );
            }
        }
    }

    private isSubscriptionActive(subscription: EventSubscription): boolean {
        // Check if subscription is in any deactivated groups
        for (const group of this.subscriptionGroups.values()) {
            if (group.subscriptions.has(subscription.id) && !group.isActive) {
                return false;
            }
        }
        return true;
    }

    getSubscriptionsByType(eventType: string): EventSubscription[] {
        const subscriptionIds = this.subscriptionsByType.get(eventType);
        if (!subscriptionIds) {
            return [];
        }

        const subscriptions: EventSubscription[] = [];
        for (const subscriptionId of subscriptionIds) {
            const subscription = this.subscriptions.get(subscriptionId);
            if (subscription) {
                subscriptions.push(subscription);
            }
        }

        return subscriptions;
    }

    getSubscription(subscriptionId: string): EventSubscription | undefined {
        return this.subscriptions.get(subscriptionId);
    }

    getAllSubscriptions(): EventSubscription[] {
        return Array.from(this.subscriptions.values());
    }

    getActiveSubscriptions(): EventSubscription[] {
        return this.getAllSubscriptions().filter((sub) =>
            this.isSubscriptionActive(sub));
    }

    getSubscriptionGroups(): SubscriptionGroup[] {
        return Array.from(this.subscriptionGroups.values());
    }

    getSubscriptionMetrics(): any {
        return {
            ...this.metrics,
            subscriptionsByType: Array.from(
                this.subscriptionsByType.entries(),
                ([type, subs]) => ({
                    eventType: type,
                    count: subs.size,
                })
            ),
            groups: this.subscriptionGroups.size,
        };
    }

    private generateSubscriptionId(): string {
        return `sub-${++this.subscriptionCounter}-${Date.now()}`;
    }

    private updateAverageHandlerTime(newTime: number): void {
        this.metrics.averageHandlerTime =
            (this.metrics.averageHandlerTime *
                (this.metrics.eventsHandled - 1) +
                newTime) /
            this.metrics.eventsHandled;
    }

    // Utility method for creating common subscription types
    subscribeSiteEvents(handler: Function): string[] {
        const subscriptions: string[] = [];
        const siteEvents = [
            "site.created",
            "site.updated",
            "site.deleted",
            "site.status.changed",
        ];

        for (const eventType of siteEvents) {
            const subId = this.subscribe(eventType, handler, { priority: 5 });
            subscriptions.push(subId);
        }

        return subscriptions;
    }

    subscribeMonitorEvents(handler: Function): string[] {
        const subscriptions: string[] = [];
        const monitorEvents = [
            "monitor.created",
            "monitor.updated",
            "monitor.deleted",
            "monitor.check.completed",
            "monitor.check.failed",
        ];

        for (const eventType of monitorEvents) {
            const subId = this.subscribe(eventType, handler, { priority: 3 });
            subscriptions.push(subId);
        }

        return subscriptions;
    }

    clear(): void {
        this.subscriptions.clear();
        this.subscriptionsByType.clear();
        this.subscriptionGroups.clear();
        this.subscriptionCounter = 0;
        this.metrics = {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            totalUnsubscriptions: 0,
            eventsHandled: 0,
            averageHandlerTime: 0,
        };
    }
}

describe("Event Subscriptions Performance", () => {
    let subscriptionManager: MockEventSubscriptionManager;

    bench(
        "subscription manager initialization",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "single subscription",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            subscriptionManager.subscribe("test.event", () => {});
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "subscription with options",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            subscriptionManager.subscribe("complex.event", () => {}, {
                priority: 10,
                filter: (event: any) => event.important === true,
                metadata: { component: "test" },
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "multiple subscriptions same type",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            for (let i = 0; i < 10; i++) {
                subscriptionManager.subscribe("popular.event", () => {});
            }
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "subscribe to multiple event types",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            const eventTypes = [
                "site.created",
                "site.updated",
                "site.deleted",
                "monitor.created",
                "monitor.updated",
                "monitor.deleted",
                "alert.triggered",
                "alert.resolved",
            ];

            for (const eventType of eventTypes) {
                subscriptionManager.subscribe(eventType, () => {});
            }
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "unsubscribe single subscription",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            const subscriptionId = subscriptionManager.subscribe(
                "test.event",
                () => {}
            );
            subscriptionManager.unsubscribe(subscriptionId);
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "unsubscribe by event type",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            // Create multiple subscriptions for same type
            for (let i = 0; i < 20; i++) {
                subscriptionManager.subscribe("batch.event", () => {});
            }
            subscriptionManager.unsubscribeByType("batch.event");
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "create subscription group",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            const subscriptionIds: string[] = [];
            for (let i = 0; i < 5; i++) {
                const subId = subscriptionManager.subscribe(
                    `group.event.${i}`,
                    () => {}
                );
                subscriptionIds.push(subId);
            }
            subscriptionManager.createSubscriptionGroup(
                "test-group",
                subscriptionIds
            );
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "publish event with no subscribers",
        async () => {
            subscriptionManager = new MockEventSubscriptionManager();
            await subscriptionManager.publishEvent("empty.event", {
                data: "test",
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "publish event with single subscriber",
        async () => {
            subscriptionManager = new MockEventSubscriptionManager();
            subscriptionManager.subscribe("single.event", async (
                payload: any
            ) => {
                // Simulate handler work
            });
            await subscriptionManager.publishEvent("single.event", {
                data: "test",
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "publish event with multiple subscribers",
        async () => {
            subscriptionManager = new MockEventSubscriptionManager();
            for (let i = 0; i < 10; i++) {
                subscriptionManager.subscribe(
                    "multi.event",
                    async (payload: any) => {
                        // Simulate handler work
                    },
                    { priority: i }
                );
            }
            await subscriptionManager.publishEvent("multi.event", {
                data: "test",
            });
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "publish with filtered subscriptions",
        async () => {
            subscriptionManager = new MockEventSubscriptionManager();

            // Subscriptions with different filters
            subscriptionManager.subscribe("filtered.event", async () => {}, {
                filter: (event: any) => event.category === "important",
            });
            subscriptionManager.subscribe("filtered.event", async () => {}, {
                filter: (event: any) => event.category === "normal",
            });
            subscriptionManager.subscribe("filtered.event", async () => {}); // No filter

            await subscriptionManager.publishEvent("filtered.event", {
                category: "important",
                data: "test",
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "bulk subscription operations",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            const siteSubscriptions = subscriptionManager.subscribeSiteEvents(
                () => {}
            );
            const monitorSubscriptions =
                subscriptionManager.subscribeMonitorEvents(() => {});

            subscriptionManager.createSubscriptionGroup(
                "site-group",
                siteSubscriptions
            );
            subscriptionManager.createSubscriptionGroup(
                "monitor-group",
                monitorSubscriptions
            );
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "group activation/deactivation",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            const subscriptions = subscriptionManager.subscribeSiteEvents(
                () => {}
            );
            subscriptionManager.createSubscriptionGroup(
                "toggle-group",
                subscriptions
            );

            subscriptionManager.deactivateGroup("toggle-group");
            subscriptionManager.activateGroup("toggle-group");
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "get subscriptions by type",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();
            // Create subscriptions for multiple types
            for (let i = 0; i < 50; i++) {
                subscriptionManager.subscribe(`type.${i % 5}`, () => {});
            }

            subscriptionManager.getSubscriptionsByType("type.0");
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "subscription metrics collection",
        () => {
            subscriptionManager = new MockEventSubscriptionManager();

            // Create diverse subscription scenario
            subscriptionManager.subscribeSiteEvents(() => {});
            subscriptionManager.subscribeMonitorEvents(() => {});

            for (let i = 0; i < 20; i++) {
                subscriptionManager.subscribe(`random.event.${i}`, () => {});
            }

            subscriptionManager.getSubscriptionMetrics();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "large-scale subscription management",
        async () => {
            subscriptionManager = new MockEventSubscriptionManager();

            // Create 200 subscriptions across 20 event types
            for (let i = 0; i < 200; i++) {
                const eventType = `scale.event.${i % 20}`;
                subscriptionManager.subscribe(
                    eventType,
                    async () => {
                        // Simulate work
                        await new Promise((resolve) => setTimeout(resolve, 1));
                    },
                    { priority: Math.floor(Math.random() * 10) }
                );
            }

            // Publish to one of the event types
            await subscriptionManager.publishEvent("scale.event.5", {
                id: "large-scale-test",
                timestamp: Date.now(),
            });

            // Get metrics
            subscriptionManager.getSubscriptionMetrics();
        },
        { warmupIterations: 3, iterations: 50 }
    );
});

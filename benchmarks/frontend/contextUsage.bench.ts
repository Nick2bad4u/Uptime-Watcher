/**
 * Performance benchmarks for React Context usage patterns Tests the performance
 * of context providers, consumers, and optimization strategies
 */

import { bench, describe } from "vitest";

// Interface definitions for React Context system
type ContextValue = Record<string, any>;

interface ContextProvider {
    id: string;
    contextId: string;
    value: ContextValue;
    children: ComponentInstance[];
    updateCount: number;
    subscriptionCount: number;
    renderTime: number;
    valueSize: number;
    lastUpdate: number;
}

interface ContextConsumer {
    id: string;
    contextId: string;
    componentId: string;
    subscribedKeys: string[];
    lastValue: ContextValue;
    renderCount: number;
    renderTime: number;
    selectorFunction?: (value: ContextValue) => any;
    memoizedResult?: any;
}

interface ComponentInstance {
    id: string;
    type: string;
    depth: number;
    parent: ComponentInstance | null;
    children: ComponentInstance[];
    contextProviders: string[];
    contextConsumers: string[];
    renderTime: number;
    rerenderCause?: string;
}

interface ContextUpdate {
    contextId: string;
    providerId: string;
    oldValue: ContextValue;
    newValue: ContextValue;
    affectedConsumers: string[];
    updateTime: number;
    propagationTime: number;
    timestamp: number;
}

interface ContextMetrics {
    totalProviders: number;
    totalConsumers: number;
    totalUpdates: number;
    averageUpdateTime: number;
    averageRenderTime: number;
    totalRerenders: number;
    memoryUsage: number;
    subscriptionEfficiency: number;
}

interface SelectorPerformance {
    selectorId: string;
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    memoryUsage: number;
}

// Mock React Context system
class MockReactContext {
    private providers = new Map<string, ContextProvider>();
    private consumers = new Map<string, ContextConsumer>();
    private components = new Map<string, ComponentInstance>();
    private contextUpdates: ContextUpdate[] = [];
    private selectorCache = new Map<
        string,
        { value: any; deps: any[]; timestamp: number }
    >();
    private nextId = 0;

    // Context creation and management
    createContext(contextId: string, initialValue: ContextValue): string {
        const providerId = `provider-${this.nextId++}`;

        const provider: ContextProvider = {
            id: providerId,
            contextId,
            value: { ...initialValue },
            children: [],
            updateCount: 0,
            subscriptionCount: 0,
            renderTime: 0,
            valueSize: this.calculateValueSize(initialValue),
            lastUpdate: Date.now(),
        };

        this.providers.set(providerId, provider);
        return providerId;
    }

    createProvider(
        contextId: string,
        value: ContextValue,
        children: ComponentInstance[] = []
    ): ContextProvider {
        const providerId = `provider-${this.nextId++}`;

        const provider: ContextProvider = {
            id: providerId,
            contextId,
            value: { ...value },
            children: Array.from(children),
            updateCount: 0,
            subscriptionCount: 0,
            renderTime: 0,
            valueSize: this.calculateValueSize(value),
            lastUpdate: Date.now(),
        };

        this.providers.set(providerId, provider);

        // Update children to reference this provider
        children.forEach((child) => {
            child.contextProviders.push(providerId);
        });

        return provider;
    }

    createConsumer(
        contextId: string,
        componentId: string,
        subscribedKeys: string[] = [],
        selectorFunction?: (value: ContextValue) => any
    ): ContextConsumer {
        const consumerId = `consumer-${this.nextId++}`;

        const consumer: ContextConsumer = {
            id: consumerId,
            contextId,
            componentId,
            subscribedKeys: Array.from(subscribedKeys),
            lastValue: {},
            renderCount: 0,
            renderTime: 0,
            selectorFunction,
            memoizedResult: undefined,
        };

        this.consumers.set(consumerId, consumer);

        // Update provider subscription count
        const provider = this.findProviderForContext(contextId);
        if (provider) {
            provider.subscriptionCount++;
        }

        return consumer;
    }

    private findProviderForContext(
        contextId: string
    ): ContextProvider | undefined {
        for (const provider of this.providers.values()) {
            if (provider.contextId === contextId) {
                return provider;
            }
        }
        return undefined;
    }

    // Context value updates
    updateContextValue(
        providerId: string,
        newValue: ContextValue,
        mergeStrategy: "replace" | "merge" | "selective" = "merge"
    ): ContextUpdate {
        const startTime = performance.now();
        const provider = this.providers.get(providerId);

        if (!provider) {
            throw new Error(`Provider ${providerId} not found`);
        }

        const oldValue = { ...provider.value };
        let updatedValue: ContextValue;

        switch (mergeStrategy) {
            case "replace": {
                updatedValue = { ...newValue };
                break;
            }
            case "merge": {
                updatedValue = { ...provider.value, ...newValue };
                break;
            }
            case "selective": {
                updatedValue = { ...provider.value };
                Object.keys(newValue).forEach((key) => {
                    if (
                        this.shouldUpdateKey(key, oldValue[key], newValue[key])
                    ) {
                        updatedValue[key] = newValue[key];
                    }
                });
                break;
            }
        }

        provider.value = updatedValue;
        provider.updateCount++;
        provider.lastUpdate = Date.now();
        provider.valueSize = this.calculateValueSize(updatedValue);

        // Find affected consumers
        const affectedConsumers = this.findAffectedConsumers(
            provider.contextId,
            oldValue,
            updatedValue
        );

        const updateTime = performance.now() - startTime;

        // Trigger consumer updates
        const propagationStartTime = performance.now();
        this.propagateContextUpdate(
            provider.contextId,
            updatedValue,
            affectedConsumers
        );
        const propagationTime = performance.now() - propagationStartTime;

        const contextUpdate: ContextUpdate = {
            contextId: provider.contextId,
            providerId,
            oldValue,
            newValue: updatedValue,
            affectedConsumers,
            updateTime,
            propagationTime,
            timestamp: Date.now(),
        };

        this.contextUpdates.push(contextUpdate);
        return contextUpdate;
    }

    private shouldUpdateKey(
        key: string,
        oldValue: any,
        newValue: any
    ): boolean {
        // Shallow comparison for performance
        if (oldValue === newValue) return false;

        // Deep comparison for objects (simplified)
        if (typeof oldValue === "object" && typeof newValue === "object") {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }

        return true;
    }

    private findAffectedConsumers(
        contextId: string,
        oldValue: ContextValue,
        newValue: ContextValue
    ): string[] {
        const affected: string[] = [];

        for (const consumer of this.consumers.values()) {
            if (consumer.contextId !== contextId) continue;

            // Check if any subscribed keys changed
            if (consumer.subscribedKeys.length === 0) {
                // Subscribe to all changes
                affected.push(consumer.id);
            } else {
                // Check specific keys
                const hasChanges = consumer.subscribedKeys.some(
                    (key) => oldValue[key] !== newValue[key]
                );

                if (hasChanges) {
                    affected.push(consumer.id);
                }
            }
        }

        return affected;
    }

    private propagateContextUpdate(
        contextId: string,
        newValue: ContextValue,
        affectedConsumers: string[]
    ): void {
        for (const consumerId of affectedConsumers) {
            const consumer = this.consumers.get(consumerId);
            if (!consumer) continue;

            const renderStartTime = performance.now();

            // Update consumer value
            consumer.lastValue = { ...newValue };
            consumer.renderCount++;

            // Apply selector if present
            if (consumer.selectorFunction) {
                consumer.memoizedResult = this.applySelectorWithMemoization(
                    consumer.id,
                    consumer.selectorFunction,
                    newValue
                );
            }

            // Simulate render work
            const renderWork = this.simulateConsumerRender(consumer);

            consumer.renderTime = performance.now() - renderStartTime;
        }
    }

    private applySelectorWithMemoization(
        selectorId: string,
        selectorFunction: (value: ContextValue) => any,
        value: ContextValue
    ): any {
        const cached = this.selectorCache.get(selectorId);
        const currentTimestamp = Date.now();

        // Simple dependency checking (compare value)
        const valueHash = JSON.stringify(value);

        if (
            cached &&
            valueHash === JSON.stringify(cached.deps[0]) &&
            currentTimestamp - cached.timestamp < 1000
        ) {
            // Cache hit
            return cached.value;
        }

        // Cache miss - compute new value
        const startTime = performance.now();
        const result = selectorFunction(value);
        const computationTime = performance.now() - startTime;

        // Update cache
        this.selectorCache.set(selectorId, {
            value: result,
            deps: [value],
            timestamp: currentTimestamp,
        });

        return result;
    }

    private simulateConsumerRender(consumer: ContextConsumer): number {
        // Base render work
        let renderWork = Math.random() * 2;

        // Additional work based on value size
        renderWork += consumer.lastValue
            ? this.calculateValueSize(consumer.lastValue) * 0.01
            : 0;

        // Additional work for selector computation
        if (consumer.selectorFunction) {
            renderWork += Number(Math.random()) * 1;
        }

        return renderWork;
    }

    // Component creation and management
    createComponent(
        type: string,
        depth: number = 0,
        parent: ComponentInstance | null = null
    ): ComponentInstance {
        const component: ComponentInstance = {
            id: `component-${this.nextId++}`,
            type,
            depth,
            parent,
            children: [],
            contextProviders: [],
            contextConsumers: [],
            renderTime: 0,
        };

        this.components.set(component.id, component);
        return component;
    }

    // Context selectors and optimization
    createSelector<T>(
        selectorFunction: (value: ContextValue) => T,
        dependencies: string[] = []
    ): (value: ContextValue) => T {
        const selectorId = `selector-${this.nextId++}`;

        return (value: ContextValue): T =>
            this.applySelectorWithMemoization(
                selectorId,
                selectorFunction,
                value
            );
    }

    // Context splitting for performance
    splitContext(
        originalContextId: string,
        splitStrategy: "by-key" | "by-usage" | "by-update-frequency"
    ): string[] {
        const provider = this.findProviderForContext(originalContextId);
        if (!provider) return [];

        const newContextIds: string[] = [];

        switch (splitStrategy) {
            case "by-key": {
                // Split by object keys
                const keys = Object.keys(provider.value);
                const keyGroups = this.groupKeysByUsage(
                    keys,
                    originalContextId
                );

                keyGroups.forEach((keyGroup, index) => {
                    const newContextId = `${originalContextId}-split-${index}`;
                    const splitValue: ContextValue = {};
                    keyGroup.forEach((key) => {
                        splitValue[key] = provider.value[key];
                    });

                    this.createContext(newContextId, splitValue);
                    newContextIds.push(newContextId);
                });
                break;
            }

            case "by-usage": {
                // Split by consumer usage patterns
                const usagePatterns =
                    this.analyzeConsumerUsagePatterns(originalContextId);
                usagePatterns.forEach((pattern, index) => {
                    const newContextId = `${originalContextId}-usage-${index}`;
                    this.createContext(newContextId, pattern.value);
                    newContextIds.push(newContextId);
                });
                break;
            }

            case "by-update-frequency": {
                // Split by update frequency
                const frequencyGroups = this.groupByUpdateFrequency(
                    provider.value
                );
                frequencyGroups.forEach((group, index) => {
                    const newContextId = `${originalContextId}-freq-${index}`;
                    this.createContext(newContextId, group);
                    newContextIds.push(newContextId);
                });
                break;
            }
        }

        return newContextIds;
    }

    private groupKeysByUsage(keys: string[], contextId: string): string[][] {
        const usageMap = new Map<string, number>();

        // Analyze key usage frequency
        for (const consumer of this.consumers.values()) {
            if (consumer.contextId === contextId) {
                consumer.subscribedKeys.forEach((key) => {
                    usageMap.set(key, (usageMap.get(key) || 0) + 1);
                });
            }
        }

        // Group keys by usage frequency
        const highUsage: string[] = [];
        const lowUsage: string[] = [];

        keys.forEach((key) => {
            const usage = usageMap.get(key) || 0;
            if (usage > 2) {
                highUsage.push(key);
            } else {
                lowUsage.push(key);
            }
        });

        return [highUsage, lowUsage].filter((group) => group.length > 0);
    }

    private analyzeConsumerUsagePatterns(
        contextId: string
    ): { value: ContextValue; consumers: string[] }[] {
        const patterns: { value: ContextValue; consumers: string[] }[] = [];
        const consumerGroups = new Map<string, string[]>();

        // Group consumers by their subscription patterns
        for (const consumer of this.consumers.values()) {
            if (consumer.contextId === contextId) {
                const pattern = consumer.subscribedKeys.toSorted().join(",");
                if (!consumerGroups.has(pattern)) {
                    consumerGroups.set(pattern, []);
                }
                consumerGroups.get(pattern)!.push(consumer.id);
            }
        }

        // Create value subsets for each pattern
        const provider = this.findProviderForContext(contextId);
        if (provider) {
            consumerGroups.forEach((consumers, pattern) => {
                const keys = pattern.split(",").filter((k) => k.length > 0);
                const value: ContextValue = {};
                keys.forEach((key) => {
                    if (Object.hasOwn(provider.value, key)) {
                        value[key] = provider.value[key];
                    }
                });
                patterns.push({ value, consumers });
            });
        }

        return patterns;
    }

    private groupByUpdateFrequency(value: ContextValue): ContextValue[] {
        // Simulate grouping by update frequency
        const highFreq: ContextValue = {};
        const lowFreq: ContextValue = {};

        Object.entries(value).forEach(([key, val]) => {
            // Simulate frequency analysis
            if (Math.random() > 0.5) {
                highFreq[key] = val;
            } else {
                lowFreq[key] = val;
            }
        });

        return [highFreq, lowFreq].filter(
            (group) => Object.keys(group).length > 0
        );
    }

    // Performance monitoring
    analyzeContextPerformance(): ContextMetrics {
        const totalProviders = this.providers.size;
        const totalConsumers = this.consumers.size;
        const totalUpdates = this.contextUpdates.length;

        const totalUpdateTime = this.contextUpdates.reduce(
            (sum, update) => sum + update.updateTime,
            0
        );
        const averageUpdateTime =
            totalUpdates > 0 ? totalUpdateTime / totalUpdates : 0;

        const totalRenderTime = Array.from(this.consumers.values()).reduce(
            (sum, consumer) => sum + consumer.renderTime,
            0
        );
        const averageRenderTime =
            totalConsumers > 0 ? totalRenderTime / totalConsumers : 0;

        const totalRerenders = Array.from(this.consumers.values()).reduce(
            (sum, consumer) => sum + consumer.renderCount,
            0
        );

        const totalMemoryUsage = Array.from(this.providers.values()).reduce(
            (sum, provider) => sum + provider.valueSize,
            0
        );

        // Calculate subscription efficiency (affected vs total consumers)
        const totalAffectedConsumers = this.contextUpdates.reduce(
            (sum, update) => sum + update.affectedConsumers.length,
            0
        );
        const subscriptionEfficiency =
            totalUpdates > 0
                ? totalAffectedConsumers / (totalUpdates * totalConsumers)
                : 0;

        return {
            totalProviders,
            totalConsumers,
            totalUpdates,
            averageUpdateTime,
            averageRenderTime,
            totalRerenders,
            memoryUsage: totalMemoryUsage,
            subscriptionEfficiency,
        };
    }

    analyzeSelectorPerformance(): SelectorPerformance[] {
        const selectorStats: SelectorPerformance[] = [];

        this.selectorCache.forEach((cached, selectorId) => {
            // Simulate selector performance analysis
            const executionCount = Math.floor(Math.random() * 100) + 1;
            const totalExecutionTime = Math.random() * 50;
            const cacheHitRate = Math.random() * 0.8 + 0.2; // 20-100%

            selectorStats.push({
                selectorId,
                executionCount,
                totalExecutionTime,
                averageExecutionTime: totalExecutionTime / executionCount,
                cacheHitRate,
                memoryUsage: JSON.stringify(cached.value).length * 2,
            });
        });

        return selectorStats;
    }

    // Utility methods
    private calculateValueSize(value: ContextValue): number {
        return JSON.stringify(value).length * 2; // UTF-16 chars
    }

    // Cleanup
    reset(): void {
        this.providers.clear();
        this.consumers.clear();
        this.components.clear();
        this.contextUpdates = [];
        this.selectorCache.clear();
        this.nextId = 0;
    }
}

describe("React Context Performance", () => {
    // Helper function to create complex context hierarchies
    const createContextHierarchy = (
        contextSystem: MockReactContext,
        depth: number,
        contextsPerLevel: number,
        consumersPerContext: number
    ): ComponentInstance[] => {
        const components: ComponentInstance[] = [];

        // Create root component
        const root = contextSystem.createComponent("App", 0);
        components.push(root);

        let currentLevelComponents = [root];

        for (let level = 0; level < depth; level++) {
            const nextLevelComponents: ComponentInstance[] = [];

            for (const parent of currentLevelComponents) {
                // Create contexts at this level
                for (
                    let contextIndex = 0;
                    contextIndex < contextsPerLevel;
                    contextIndex++
                ) {
                    const contextId = `context-${level}-${contextIndex}`;
                    const contextValue = {
                        level,
                        contextIndex,
                        data: Array.from({ length: 10 }, (_, i) => ({
                            id: i,
                            value: Math.random() * 100,
                            timestamp: Date.now(),
                        })),
                        settings: {
                            theme: ["light", "dark"][
                                Math.floor(Math.random() * 2)
                            ],
                            language: [
                                "en",
                                "es",
                                "fr",
                            ][Math.floor(Math.random() * 3)],
                            notifications: Math.random() > 0.5,
                        },
                        user: {
                            id: Math.floor(Math.random() * 1000),
                            role: [
                                "admin",
                                "user",
                                "guest",
                            ][Math.floor(Math.random() * 3)],
                            permissions: Array.from(
                                { length: 5 },
                                () => Math.random() > 0.5
                            ),
                        },
                    };

                    const providerId = contextSystem.createContext(
                        contextId,
                        contextValue
                    );

                    // Create consumers for this context
                    for (
                        let consumerIndex = 0;
                        consumerIndex < consumersPerContext;
                        consumerIndex++
                    ) {
                        const consumerComponent = contextSystem.createComponent(
                            `Consumer${level}-${contextIndex}-${consumerIndex}`,
                            level + 1,
                            parent
                        );

                        const subscribedKeys = [
                            "data",
                            "settings",
                            "user",
                        ].filter(() => Math.random() > 0.3);

                        contextSystem.createConsumer(
                            contextId,
                            consumerComponent.id,
                            subscribedKeys,
                            Math.random() > 0.5
                                ? (value) => ({
                                      processedData: value.data?.slice(0, 5),
                                      isAdmin: value.user?.role === "admin",
                                      themeClass: `theme-${value.settings?.theme}`,
                                  })
                                : undefined
                        );

                        components.push(consumerComponent);
                        nextLevelComponents.push(consumerComponent);
                    }
                }
            }

            currentLevelComponents = nextLevelComponents;
        }

        return components;
    };

    // Basic context operations
    bench("context creation and initial rendering", () => {
        const contextSystem = new MockReactContext();
        const results: string[] = [];

        for (let i = 0; i < 100; i++) {
            const contextValue = {
                id: i,
                name: `Context ${i}`,
                data: Array.from({ length: 20 }, (_, j) => ({
                    id: j,
                    value: Math.random() * 100,
                    nested: {
                        deep: {
                            value: Math.random(),
                            array: Array.from({ length: 5 }, () =>
                                Math.random()
                            ),
                        },
                    },
                })),
                metadata: {
                    created: Date.now(),
                    version: Math.floor(Math.random() * 10),
                    flags: Array.from(
                        { length: 10 },
                        () => Math.random() > 0.5
                    ),
                },
            };

            const providerId = contextSystem.createContext(
                `context-${i}`,
                contextValue
            );
            results.push(providerId);
        }

        contextSystem.reset();
    });

    bench("context consumer creation - multiple subscriptions", () => {
        const contextSystem = new MockReactContext();
        const contextIds: string[] = [];

        // Create contexts
        for (let i = 0; i < 20; i++) {
            const contextValue = {
                theme: { primary: "blue", secondary: "gray" },
                user: { id: i, role: "user" },
                settings: { notifications: true, language: "en" },
                data: Array.from({ length: 15 }, (_, j) => ({
                    id: j,
                    value: Math.random(),
                })),
            };

            const providerId = contextSystem.createContext(
                `context-${i}`,
                contextValue
            );
            contextIds.push(`context-${i}`);
        }

        // Create many consumers
        const consumers: string[] = [];
        for (let i = 0; i < 200; i++) {
            const contextId =
                contextIds[Math.floor(Math.random() * contextIds.length)];
            const component = contextSystem.createComponent(`Component${i}`, 0);

            const subscribedKeys = [
                "theme",
                "user",
                "settings",
                "data",
            ].filter(() => Math.random() > 0.4);

            const consumer = contextSystem.createConsumer(
                contextId,
                component.id,
                subscribedKeys,
                Math.random() > 0.6
                    ? (value) => ({
                          userTheme: `${value.user?.role}-${value.theme?.primary}`,
                          hasNotifications: value.settings?.notifications,
                          dataCount: value.data?.length || 0,
                      })
                    : undefined
            );

            consumers.push(consumer.id);
        }

        contextSystem.reset();
    });

    // Context update patterns
    bench("context updates - frequent small updates", () => {
        const contextSystem = new MockReactContext();

        // Setup context with consumers
        const contextValue = {
            counter: 0,
            timestamp: Date.now(),
            user: { online: true, lastActivity: Date.now() },
            ui: { loading: false, error: null },
            data: Array.from({ length: 10 }, (_, i) => ({ id: i, value: i })),
        };

        const providerId = contextSystem.createContext(
            "main-context",
            contextValue
        );

        // Create consumers
        for (let i = 0; i < 50; i++) {
            const component = contextSystem.createComponent(`Component${i}`, 0);
            contextSystem.createConsumer(
                "main-context",
                component.id,
                i % 2 === 0 ? ["counter", "timestamp"] : ["user", "ui"],
                (value) => ({
                    counterDisplay: `Count: ${value.counter}`,
                    userStatus: value.user?.online ? "online" : "offline",
                    hasError: Boolean(value.ui?.error),
                })
            );
        }

        // Perform many small updates
        const updateResults: any[] = [];
        for (let i = 0; i < 300; i++) {
            const updateType = Math.floor(Math.random() * 4);
            let update: any;

            switch (updateType) {
                case 0: {
                    update = { counter: i };
                    break;
                }
                case 1: {
                    update = { timestamp: Date.now() + i };
                    break;
                }
                case 2: {
                    update = {
                        user: {
                            online: Math.random() > 0.5,
                            lastActivity: Date.now(),
                        },
                    };
                    break;
                }
                case 3: {
                    update = {
                        ui: {
                            loading: Math.random() > 0.8,
                            error: Math.random() > 0.9 ? "Error!" : null,
                        },
                    };
                    break;
                }
            }

            const result = contextSystem.updateContextValue(
                providerId,
                update,
                "merge"
            );
            updateResults.push(result);
        }

        contextSystem.reset();
    });

    bench("context updates - large bulk updates", () => {
        const contextSystem = new MockReactContext();

        // Setup large context
        const largeContextValue = {
            items: Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                data: Array.from({ length: 10 }, () => Math.random()),
                metadata: {
                    created: Date.now(),
                    updated: Date.now(),
                    tags: Array.from({ length: 5 }, (_, j) => `tag${j}`),
                },
            })),
            filters: {
                category: "all",
                sortBy: "name",
                ascending: true,
                search: "",
            },
            pagination: {
                page: 1,
                pageSize: 20,
                total: 100,
            },
            selections: new Set<number>(),
        };

        const providerId = contextSystem.createContext(
            "bulk-context",
            largeContextValue
        );

        // Create consumers
        for (let i = 0; i < 30; i++) {
            const component = contextSystem.createComponent(
                `BulkComponent${i}`,
                0
            );
            contextSystem.createConsumer(
                "bulk-context",
                component.id,
                [
                    "items",
                    "filters",
                    "pagination",
                ],
                (value) => ({
                    filteredItems: value.items
                        ?.filter(
                            (item: any) =>
                                value.filters?.category === "all" ||
                                item.category === value.filters?.category
                        )
                        .slice(0, value.pagination?.pageSize || 20),
                    totalPages: Math.ceil(
                        (value.items?.length || 0) /
                            (value.pagination?.pageSize || 20)
                    ),
                    hasSelection: (value.selections as Set<number>)?.size > 0,
                })
            );
        }

        // Perform bulk updates
        const bulkUpdateResults: any[] = [];
        for (let i = 0; i < 50; i++) {
            const bulkUpdate = {
                items: largeContextValue.items.map((item) => ({
                    ...item,
                    data: item.data.map(() => Math.random()),
                    metadata: {
                        ...item.metadata,
                        updated: Date.now(),
                    },
                })),
                filters: {
                    ...largeContextValue.filters,
                    search: `search${i}`,
                    category: [
                        "all",
                        "category1",
                        "category2",
                    ][Math.floor(Math.random() * 3)],
                },
                pagination: {
                    ...largeContextValue.pagination,
                    page: Math.floor(Math.random() * 5) + 1,
                },
            };

            const result = contextSystem.updateContextValue(
                providerId,
                bulkUpdate,
                "merge"
            );
            bulkUpdateResults.push(result);
        }

        contextSystem.reset();
    });

    // Context selector performance
    bench("context selectors - memoized computations", () => {
        const contextSystem = new MockReactContext();

        // Create complex context value
        const complexValue = {
            users: Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `User ${i}`,
                role: [
                    "admin",
                    "user",
                    "guest",
                ][Math.floor(Math.random() * 3)],
                permissions: Array.from(
                    { length: 10 },
                    () => Math.random() > 0.5
                ),
                profile: {
                    avatar: `avatar${i}.jpg`,
                    bio: `Bio for user ${i}`,
                    preferences: {
                        theme: ["light", "dark"][Math.floor(Math.random() * 2)],
                        notifications: Array.from(
                            { length: 5 },
                            () => Math.random() > 0.5
                        ),
                    },
                },
            })),
            teams: Array.from({ length: 10 }, (_, i) => ({
                id: i,
                name: `Team ${i}`,
                members: Array.from(
                    { length: Math.floor(Math.random() * 10) },
                    () => Math.floor(Math.random() * 50)
                ),
            })),
            projects: Array.from({ length: 20 }, (_, i) => ({
                id: i,
                title: `Project ${i}`,
                status: [
                    "active",
                    "completed",
                    "paused",
                ][Math.floor(Math.random() * 3)],
                assignees: Array.from(
                    { length: Math.floor(Math.random() * 5) },
                    () => Math.floor(Math.random() * 50)
                ),
            })),
        };

        const providerId = contextSystem.createContext(
            "complex-context",
            complexValue
        );

        // Create selectors with varying complexity
        const selectorResults: any[] = [];
        for (let i = 0; i < 100; i++) {
            const component = contextSystem.createComponent(
                `SelectorComponent${i}`,
                0
            );

            const selectorComplexity = Math.floor(Math.random() * 4);
            let selectorFunction: (value: any) => any = (value) => ({
                default: true,
            });

            switch (selectorComplexity) {
                case 0: {
                    // Simple selector
                    selectorFunction = (value) => ({
                        userCount: value.users?.length || 0,
                        teamCount: value.teams?.length || 0,
                    });
                    break;
                }
                case 1: {
                    // Medium selector with filtering
                    selectorFunction = (value) => ({
                        adminUsers:
                            value.users?.filter(
                                (u: any) => u.role === "admin"
                            ) || [],
                        activeProjects:
                            value.projects?.filter(
                                (p: any) => p.status === "active"
                            ) || [],
                    });
                    break;
                }
                case 2: {
                    // Complex selector with computation
                    selectorFunction = (value) => {
                        const users = value.users || [];
                        const teams = value.teams || [];
                        const projects = value.projects || [];

                        return {
                            usersByTeam: teams.map((team: any) => ({
                                ...team,
                                users: users.filter((user: any) =>
                                    team.members.includes(user.id)
                                ),
                            })),
                            projectWorkload: users.map((user: any) => ({
                                userId: user.id,
                                projectCount: projects.filter((project: any) =>
                                    project.assignees.includes(user.id)
                                ).length,
                            })),
                        };
                    };
                    break;
                }
                case 3: {
                    // Very complex selector with deep computation
                    selectorFunction = (value) => {
                        const users = value.users || [];
                        const teams = value.teams || [];
                        const projects = value.projects || [];

                        // Compute team efficiency
                        const teamEfficiency = teams.map((team: any) => {
                            const teamUsers = users.filter((user: any) =>
                                team.members.includes(user.id)
                            );
                            const teamProjects = projects.filter(
                                (project: any) =>
                                    project.assignees.some((assignee: number) =>
                                        team.members.includes(assignee)
                                    )
                            );

                            return {
                                teamId: team.id,
                                memberCount: teamUsers.length,
                                projectCount: teamProjects.length,
                                efficiency:
                                    teamUsers.length > 0
                                        ? teamProjects.length / teamUsers.length
                                        : 0,
                                avgPermissions:
                                    teamUsers.reduce(
                                        (sum: number, user: any) =>
                                            sum +
                                            user.permissions.filter(Boolean)
                                                .length,
                                        0
                                    ) / teamUsers.length,
                            };
                        });

                        return { teamEfficiency };
                    };
                    break;
                }
            }

            const consumer = contextSystem.createConsumer(
                "complex-context",
                component.id,
                [
                    "users",
                    "teams",
                    "projects",
                ],
                selectorFunction
            );

            selectorResults.push(consumer);
        }

        // Trigger multiple updates to test memoization
        for (let update = 0; update < 20; update++) {
            const updateData = {
                users: complexValue.users.map((user) => ({
                    ...user,
                    profile: {
                        ...user.profile,
                        preferences: {
                            ...user.profile.preferences,
                            notifications:
                                user.profile.preferences.notifications.map(
                                    () => Math.random() > 0.5
                                ),
                        },
                    },
                })),
            };

            contextSystem.updateContextValue(providerId, updateData, "merge");
        }

        contextSystem.reset();
    });

    // Context optimization strategies
    bench("context splitting - performance optimization", () => {
        const contextSystem = new MockReactContext();

        // Create monolithic context that should be split
        const monolithicValue = {
            // Fast-changing data
            realTimeData: {
                timestamp: Date.now(),
                onlineUsers: Math.floor(Math.random() * 100),
                systemLoad: Math.random(),
            },

            // Medium-changing data
            userInterface: {
                theme: "light",
                sidebar: { collapsed: false, width: 250 },
                notifications: Array.from({ length: 5 }, (_, i) => ({
                    id: i,
                    read: Math.random() > 0.5,
                    timestamp: Date.now(),
                })),
            },

            // Slow-changing data
            configuration: {
                apiUrl: "https://api.example.com",
                features: {
                    newUI: true,
                    analytics: false,
                    debugging: true,
                },
                permissions: Array.from(
                    { length: 20 },
                    () => Math.random() > 0.5
                ),
            },

            // Static data
            constants: {
                appName: "MyApp",
                version: "1.0.0",
                supportedLanguages: [
                    "en",
                    "es",
                    "fr",
                    "de",
                ],
                maxFileSize: 10 * 1024 * 1024,
            },
        };

        const originalProviderId = contextSystem.createContext(
            "monolithic",
            monolithicValue
        );

        // Create consumers with different usage patterns
        const consumerIds: string[] = [];
        for (let i = 0; i < 60; i++) {
            const component = contextSystem.createComponent(
                `OptimizationComponent${i}`,
                0
            );

            let subscribedKeys: string[];
            if (i < 20) {
                // Real-time consumers
                subscribedKeys = ["realTimeData"];
            } else if (i < 40) {
                // UI consumers
                subscribedKeys = ["userInterface", "realTimeData"];
            } else if (i < 50) {
                // Configuration consumers
                subscribedKeys = ["configuration", "userInterface"];
            } else {
                // Mixed consumers
                subscribedKeys = [
                    "realTimeData",
                    "configuration",
                    "constants",
                ];
            }

            const consumer = contextSystem.createConsumer(
                "monolithic",
                component.id,
                subscribedKeys
            );
            consumerIds.push(consumer.id);
        }

        // Test splitting strategies
        const splittingResults: any[] = [];

        // Split by key groups
        const keyBasedSplit = contextSystem.splitContext(
            "monolithic",
            "by-key"
        );
        splittingResults.push({ strategy: "by-key", contexts: keyBasedSplit });

        // Split by usage patterns
        const usageBasedSplit = contextSystem.splitContext(
            "monolithic",
            "by-usage"
        );
        splittingResults.push({
            strategy: "by-usage",
            contexts: usageBasedSplit,
        });

        // Split by update frequency
        const frequencyBasedSplit = contextSystem.splitContext(
            "monolithic",
            "by-update-frequency"
        );
        splittingResults.push({
            strategy: "by-update-frequency",
            contexts: frequencyBasedSplit,
        });

        contextSystem.reset();
    });

    // Deep context hierarchy performance
    bench("deep context hierarchy - provider nesting", () => {
        const contextSystem = new MockReactContext();
        const hierarchyResults: ComponentInstance[] = [];

        for (let hierarchy = 0; hierarchy < 10; hierarchy++) {
            const components = createContextHierarchy(contextSystem, 5, 2, 3);
            hierarchyResults.push(...components);
        }

        contextSystem.reset();
    });

    // Context performance analysis
    bench("context performance analysis", () => {
        const contextSystem = new MockReactContext();

        // Create realistic context usage scenario
        const components = createContextHierarchy(contextSystem, 4, 3, 4);

        // Simulate application usage
        const analysisResults: any[] = [];
        for (let cycle = 0; cycle < 20; cycle++) {
            // Simulate user interactions triggering context updates
            const activeContexts = Array.from(
                { length: 8 },
                (_, i) => `context-${Math.floor(i / 2)}-${i % 3}`
            );

            for (const contextId of activeContexts) {
                const updateData = {
                    timestamp: Date.now(),
                    userAction: `action-${cycle}-${contextId}`,
                    data: Array.from({ length: 5 }, () => Math.random()),
                };

                try {
                    // Some updates might fail if context doesn't exist
                    const provider = Array.from(
                        contextSystem["providers"].values()
                    ).find((p) => p.contextId === contextId);

                    if (provider) {
                        contextSystem.updateContextValue(
                            provider.id,
                            updateData,
                            "merge"
                        );
                    }
                } catch {
                    // Context not found, skip
                }
            }

            // Analyze performance after each cycle
            const metrics = contextSystem.analyzeContextPerformance();
            const selectorPerf = contextSystem.analyzeSelectorPerformance();

            analysisResults.push({
                cycle,
                metrics,
                selectorCount: selectorPerf.length,
                avgSelectorTime:
                    selectorPerf.reduce(
                        (sum, s) => sum + s.averageExecutionTime,
                        0
                    ) / selectorPerf.length || 0,
            });
        }

        contextSystem.reset();
    });
});

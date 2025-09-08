/**
 * @module benchmarks/electron/serviceContainer
 *
 * @file Benchmarks for service container operations in the Electron main
 *   process.
 *
 *   Tests performance of dependency injection, service registration, resolution,
 *   lifecycle management, and inter-service communication.
 */

import { bench, describe } from "vitest";

// Define comprehensive interfaces for type safety
interface ServiceDefinition {
    id: string;
    name: string;
    type: "singleton" | "transient" | "scoped";
    dependencies: string[];
    factory?: boolean;
    lazy: boolean;
    priority: number;
    metadata: Record<string, unknown>;
}

interface ServiceInstance {
    instanceId: string;
    serviceId: string;
    createdAt: number;
    lastAccessedAt: number;
    accessCount: number;
    memoryUsage: number;
    state: "initializing" | "active" | "disposing" | "disposed";
    dependencies: ServiceInstance[];
    children: ServiceInstance[];
}

interface ServiceResolution {
    resolutionId: string;
    serviceId: string;
    startTime: number;
    endTime: number;
    success: boolean;
    fromCache: boolean;
    dependencyCount: number;
    circularDependency: boolean;
    resolutionDepth: number;
    memoryAllocated: number;
    error?: string;
}

interface ContainerStats {
    totalServices: number;
    singletonServices: number;
    transientServices: number;
    scopedServices: number;
    activeInstances: number;
    totalResolutions: number;
    cacheHitRate: number;
    averageResolutionTime: number;
    memoryUsage: number;
    circularDependencies: number;
}

interface ServiceScope {
    scopeId: string;
    parentScopeId?: string;
    createdAt: number;
    serviceInstances: ServiceInstance[];
    disposed: boolean;
    childScopes: ServiceScope[];
}

describe("Service Container Benchmarks", () => {
    const serviceTypes = [
        "singleton",
        "transient",
        "scoped",
    ] as const;
    const serviceCategories = [
        "database",
        "monitoring",
        "ipc",
        "window",
        "notification",
        "validation",
        "cache",
        "logger",
        "config",
        "security",
    ];

    // Service registration performance
    bench("service registration simulation", () => {
        const serviceDefinitions: ServiceDefinition[] = [];

        const registrationScenarios = [
            {
                name: "core-services",
                count: 20,
                dependencyProbability: 0.4,
                maxDependencies: 3,
                lazyProbability: 0.3,
                factoryProbability: 0.2,
            },
            {
                name: "plugin-services",
                count: 50,
                dependencyProbability: 0.6,
                maxDependencies: 5,
                lazyProbability: 0.7,
                factoryProbability: 0.4,
            },
            {
                name: "utility-services",
                count: 30,
                dependencyProbability: 0.2,
                maxDependencies: 2,
                lazyProbability: 0.5,
                factoryProbability: 0.1,
            },
        ];

        for (const scenario of registrationScenarios) {
            for (let i = 0; i < scenario.count; i++) {
                const category =
                    serviceCategories[
                        Math.floor(Math.random() * serviceCategories.length)
                    ];
                const serviceType =
                    serviceTypes[
                        Math.floor(Math.random() * serviceTypes.length)
                    ];

                // Generate dependencies
                const dependencies: string[] = [];
                if (Math.random() < scenario.dependencyProbability) {
                    const depCount =
                        Math.floor(Math.random() * scenario.maxDependencies) +
                        1;
                    const availableServices = serviceDefinitions.slice(
                        -Math.min(10, serviceDefinitions.length)
                    );

                    for (
                        let j = 0;
                        j < depCount && j < availableServices.length;
                        j++
                    ) {
                        const depService =
                            availableServices[
                                Math.floor(
                                    Math.random() * availableServices.length
                                )
                            ];
                        if (!dependencies.includes(depService.id)) {
                            dependencies.push(depService.id);
                        }
                    }
                }

                const serviceDefinition: ServiceDefinition = {
                    id: `${category}-service-${i}`,
                    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Service ${i}`,
                    type: serviceType,
                    dependencies,
                    factory: Math.random() < scenario.factoryProbability,
                    lazy: Math.random() < scenario.lazyProbability,
                    priority: Math.floor(Math.random() * 100),
                    metadata: {
                        category,
                        scenario: scenario.name,
                        registrationTime: Date.now(),
                        version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
                    },
                };

                serviceDefinitions.push(serviceDefinition);
            }
        }

        // Calculate registration metrics
        const servicesByType = serviceTypes.map((type) => ({
            type,
            count: serviceDefinitions.filter((s) => s.type === type).length,
            averageDependencies:
                serviceDefinitions
                    .filter((s) => s.type === type)
                    .reduce((sum, s) => sum + s.dependencies.length, 0) /
                    serviceDefinitions.filter((s) => s.type === type).length ||
                0,
        }));

        const lazyServices = serviceDefinitions.filter((s) => s.lazy);
        const factoryServices = serviceDefinitions.filter((s) => s.factory);
        const totalDependencies = serviceDefinitions.reduce(
            (sum, s) => sum + s.dependencies.length,
            0
        );
    });

    // Service resolution performance
    bench("service resolution simulation", () => {
        // Create a set of pre-registered services
        const registeredServices: ServiceDefinition[] = [];

        // Register core services first
        const coreServices = [
            { id: "logger", name: "Logger Service", dependencies: [] },
            {
                id: "config",
                name: "Configuration Service",
                dependencies: ["logger"],
            },
            {
                id: "database",
                name: "Database Service",
                dependencies: ["logger", "config"],
            },
            {
                id: "cache",
                name: "Cache Service",
                dependencies: ["logger", "config"],
            },
            {
                id: "validation",
                name: "Validation Service",
                dependencies: ["logger"],
            },
        ];

        for (const core of coreServices) {
            registeredServices.push({
                id: core.id,
                name: core.name,
                type: "singleton",
                dependencies: core.dependencies,
                factory: false,
                lazy: false,
                priority: 100,
                metadata: { category: "core" },
            });
        }

        // Register additional services with dependencies
        const additionalServices = [
            { id: "ipc", dependencies: ["logger", "validation"] },
            {
                id: "monitoring",
                dependencies: [
                    "database",
                    "cache",
                    "logger",
                ],
            },
            { id: "notification", dependencies: ["logger", "config"] },
            { id: "window", dependencies: ["logger", "ipc"] },
            {
                id: "security",
                dependencies: [
                    "logger",
                    "config",
                    "validation",
                ],
            },
        ];

        for (const additional of additionalServices) {
            registeredServices.push({
                id: additional.id,
                name: `${additional.id.charAt(0).toUpperCase() + additional.id.slice(1)} Service`,
                type: Math.random() > 0.5 ? "singleton" : "transient",
                dependencies: additional.dependencies,
                factory: Math.random() > 0.7,
                lazy: Math.random() > 0.6,
                priority: Math.floor(Math.random() * 50) + 50,
                metadata: { category: "business" },
            });
        }

        const serviceResolutions: ServiceResolution[] = [];
        const serviceInstances: ServiceInstance[] = [];

        // Simulate service resolutions
        for (let i = 0; i < 500; i++) {
            const targetService =
                registeredServices[
                    Math.floor(Math.random() * registeredServices.length)
                ];
            const resolutionStartTime = Date.now();

            // Check if service can be resolved from cache (singleton)
            const existingInstance = serviceInstances.find(
                (instance) =>
                    instance.serviceId === targetService.id &&
                    targetService.type === "singleton"
            );

            const fromCache = Boolean(existingInstance);
            let success = true;
            let dependencyCount = 0;
            let circularDependency = false;
            let resolutionDepth = 0;
            let memoryAllocated = 0;
            let error: string | undefined;

            if (fromCache) {
                // Update existing instance access info
                existingInstance.lastAccessedAt = Date.now();
                existingInstance.accessCount++;
                dependencyCount = existingInstance.dependencies.length;
                memoryAllocated = 0; // No new memory allocation
            } else {
                // Simulate dependency resolution
                const resolvedDependencies: string[] = [];
                const resolutionStack: string[] = [targetService.id];

                const resolveDependencies = (
                    serviceId: string,
                    depth: number
                ): boolean => {
                    if (depth > 10) {
                        error = "Maximum resolution depth exceeded";
                        return false;
                    }

                    const service = registeredServices.find(
                        (s) => s.id === serviceId
                    );
                    if (!service) {
                        error = `Service not found: ${serviceId}`;
                        return false;
                    }

                    resolutionDepth = Math.max(resolutionDepth, depth);

                    for (const depId of service.dependencies) {
                        if (resolutionStack.includes(depId)) {
                            circularDependency = true;
                            error = `Circular dependency detected: ${resolutionStack.join(" -> ")} -> ${depId}`;
                            return false;
                        }

                        if (!resolvedDependencies.includes(depId)) {
                            resolutionStack.push(depId);
                            const depResolved = resolveDependencies(
                                depId,
                                depth + 1
                            );
                            resolutionStack.pop();

                            if (!depResolved) {
                                return false;
                            }

                            resolvedDependencies.push(depId);
                            dependencyCount++;
                        }
                    }

                    // Simulate memory allocation for service creation
                    const baseMemory = 1024; // 1KB base
                    const dependencyMemory = service.dependencies.length * 512; // 512B per dependency
                    const factoryMemory = service.factory ? 2048 : 0; // 2KB for factory services
                    memoryAllocated +=
                        baseMemory + dependencyMemory + factoryMemory;

                    return true;
                };

                success = resolveDependencies(targetService.id, 0);

                if (success) {
                    // Create service instance
                    const serviceInstance: ServiceInstance = {
                        instanceId: `instance-${i}`,
                        serviceId: targetService.id,
                        createdAt: Date.now(),
                        lastAccessedAt: Date.now(),
                        accessCount: 1,
                        memoryUsage: memoryAllocated,
                        state: "active",
                        dependencies: serviceInstances.filter((si) =>
                            targetService.dependencies.includes(si.serviceId)
                        ),
                        children: [],
                    };

                    serviceInstances.push(serviceInstance);
                }
            }

            // Simulate resolution time based on complexity
            const baseResolutionTime = 10; // 10ms base
            const dependencyTime = dependencyCount * 5; // 5ms per dependency
            const factoryTime = targetService.factory ? 50 : 0; // 50ms for factory
            const lazyTime = targetService.lazy && !fromCache ? 20 : 0; // 20ms for lazy initialization
            const errorTime = error ? Math.random() * 100 : 0; // Up to 100ms for error handling

            const totalResolutionTime =
                baseResolutionTime +
                dependencyTime +
                factoryTime +
                lazyTime +
                errorTime;
            const resolutionEndTime = resolutionStartTime + totalResolutionTime;

            const serviceResolution: ServiceResolution = {
                resolutionId: `resolution-${i}`,
                serviceId: targetService.id,
                startTime: resolutionStartTime,
                endTime: resolutionEndTime,
                success,
                fromCache,
                dependencyCount,
                circularDependency,
                resolutionDepth,
                memoryAllocated,
                error,
            };

            serviceResolutions.push(serviceResolution);
        }

        // Calculate resolution metrics
        const successfulResolutions = serviceResolutions.filter(
            (r) => r.success
        );
        const cacheHits = serviceResolutions.filter((r) => r.fromCache);
        const circularDeps = serviceResolutions.filter(
            (r) => r.circularDependency
        );

        const averageResolutionTime =
            serviceResolutions.reduce(
                (sum, r) => sum + (r.endTime - r.startTime),
                0
            ) / serviceResolutions.length;

        const cacheHitRate = cacheHits.length / serviceResolutions.length;
        const totalMemoryAllocated = serviceResolutions.reduce(
            (sum, r) => sum + r.memoryAllocated,
            0
        );
        const averageDependencyCount =
            successfulResolutions.reduce(
                (sum, r) => sum + r.dependencyCount,
                0
            ) / successfulResolutions.length;
    });

    // Service lifecycle management
    bench("service lifecycle simulation", () => {
        interface LifecycleEvent {
            eventId: string;
            serviceId: string;
            instanceId: string;
            eventType:
                | "created"
                | "initialized"
                | "accessed"
                | "disposing"
                | "disposed";
            timestamp: number;
            metadata: Record<string, unknown>;
        }

        const lifecycleEvents: LifecycleEvent[] = [];
        const managedInstances: ServiceInstance[] = [];

        // Create initial service instances
        const serviceConfigs = [
            {
                id: "persistent-service",
                type: "singleton",
                lifetime: 3_600_000,
            }, // 1 hour
            { id: "session-service", type: "scoped", lifetime: 1_800_000 }, // 30 minutes
            { id: "request-service", type: "transient", lifetime: 60_000 }, // 1 minute
            { id: "cache-service", type: "singleton", lifetime: 7_200_000 }, // 2 hours
            { id: "temp-service", type: "transient", lifetime: 30_000 }, // 30 seconds
        ];

        let currentTime = Date.now();

        for (let cycle = 0; cycle < 100; cycle++) {
            // Create new instances based on usage patterns
            for (const config of serviceConfigs) {
                const shouldCreate =
                    config.type === "transient" ||
                    (config.type === "scoped" && Math.random() > 0.7) ||
                    (config.type === "singleton" &&
                        !managedInstances.some(
                            (i) => i.serviceId === config.id
                        ));

                if (shouldCreate) {
                    const instanceId = `${config.id}-instance-${cycle}-${Math.random().toString(36).slice(7)}`;

                    // Create instance
                    const instance: ServiceInstance = {
                        instanceId,
                        serviceId: config.id,
                        createdAt: currentTime,
                        lastAccessedAt: currentTime,
                        accessCount: 0,
                        memoryUsage: Math.floor(Math.random() * 10_000) + 1000, // 1-11KB
                        state: "initializing",
                        dependencies: [],
                        children: [],
                    };

                    managedInstances.push(instance);

                    // Log creation event
                    lifecycleEvents.push({
                        eventId: `event-${lifecycleEvents.length}`,
                        serviceId: config.id,
                        instanceId,
                        eventType: "created",
                        timestamp: currentTime,
                        metadata: { type: config.type, cycle },
                    });

                    // Simulate initialization
                    setTimeout(() => {
                        instance.state = "active";
                        lifecycleEvents.push({
                            eventId: `event-${lifecycleEvents.length}`,
                            serviceId: config.id,
                            instanceId,
                            eventType: "initialized",
                            timestamp: currentTime + Math.random() * 1000,
                            metadata: {
                                initializationTime: Math.random() * 1000,
                            },
                        });
                    }, 0);
                }
            }

            // Simulate service access
            const accessibleInstances = managedInstances.filter(
                (i) => i.state === "active"
            );
            const accessCount = Math.floor(Math.random() * 20) + 5;

            for (
                let i = 0;
                i < accessCount && i < accessibleInstances.length;
                i++
            ) {
                const instance =
                    accessibleInstances[
                        Math.floor(Math.random() * accessibleInstances.length)
                    ];
                instance.lastAccessedAt = currentTime;
                instance.accessCount++;

                lifecycleEvents.push({
                    eventId: `event-${lifecycleEvents.length}`,
                    serviceId: instance.serviceId,
                    instanceId: instance.instanceId,
                    eventType: "accessed",
                    timestamp: currentTime,
                    metadata: { totalAccesses: instance.accessCount },
                });
            }

            // Check for instances that should be disposed
            const instancesToDispose = managedInstances.filter((instance) => {
                if (
                    instance.state === "disposed" ||
                    instance.state === "disposing"
                ) {
                    return false;
                }

                const config = serviceConfigs.find(
                    (c) => c.id === instance.serviceId
                );
                if (!config) return false;

                const timeSinceLastAccess =
                    currentTime - instance.lastAccessedAt;
                const timeSinceCreation = currentTime - instance.createdAt;

                // Dispose based on lifetime and access patterns
                if (
                    config.type === "transient" &&
                    timeSinceLastAccess > config.lifetime * 0.5
                ) {
                    return true;
                }

                if (
                    config.type === "scoped" &&
                    timeSinceCreation > config.lifetime
                ) {
                    return true;
                }

                // Singleton services rarely dispose unless explicitly requested
                if (config.type === "singleton" && Math.random() < 0.001) {
                    return true;
                }

                return false;
            });

            // Dispose selected instances
            for (const instance of instancesToDispose) {
                instance.state = "disposing";

                lifecycleEvents.push({
                    eventId: `event-${lifecycleEvents.length}`,
                    serviceId: instance.serviceId,
                    instanceId: instance.instanceId,
                    eventType: "disposing",
                    timestamp: currentTime,
                    metadata: {
                        lifetime: currentTime - instance.createdAt,
                        accessCount: instance.accessCount,
                    },
                });

                // Simulate disposal delay
                setTimeout(() => {
                    instance.state = "disposed";
                    lifecycleEvents.push({
                        eventId: `event-${lifecycleEvents.length}`,
                        serviceId: instance.serviceId,
                        instanceId: instance.instanceId,
                        eventType: "disposed",
                        timestamp: currentTime + Math.random() * 500,
                        metadata: { disposalTime: Math.random() * 500 },
                    });
                }, 0);
            }

            // Remove disposed instances
            const activeInstanceCount = managedInstances.length;
            for (let i = managedInstances.length - 1; i >= 0; i--) {
                if (managedInstances[i].state === "disposed") {
                    managedInstances.splice(i, 1);
                }
            }

            // Advance time
            currentTime += Math.random() * 10_000 + 5000; // 5-15 seconds
        }

        // Calculate lifecycle metrics
        const eventsByType = lifecycleEvents.reduce(
            (acc, event) => {
                acc[event.eventType] = (acc[event.eventType] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const instanceStats = serviceConfigs.map((config) => {
            const configEvents = lifecycleEvents.filter(
                (e) => e.serviceId === config.id
            );
            const createdCount = configEvents.filter(
                (e) => e.eventType === "created"
            ).length;
            const disposedCount = configEvents.filter(
                (e) => e.eventType === "disposed"
            ).length;
            const accessCount = configEvents.filter(
                (e) => e.eventType === "accessed"
            ).length;

            return {
                serviceId: config.id,
                type: config.type,
                instancesCreated: createdCount,
                instancesDisposed: disposedCount,
                totalAccesses: accessCount,
                averageAccessesPerInstance:
                    createdCount > 0 ? accessCount / createdCount : 0,
            };
        });

        const totalLifetime = lifecycleEvents
            .filter((e) => e.eventType === "disposed")
            .reduce((sum, e) => {
                const created = lifecycleEvents.find(
                    (ce) =>
                        ce.instanceId === e.instanceId &&
                        ce.eventType === "created"
                );
                return sum + (created ? e.timestamp - created.timestamp : 0);
            }, 0);

        const averageInstanceLifetime =
            eventsByType.disposed > 0
                ? totalLifetime / eventsByType.disposed
                : 0;
    });

    // Service scope management
    bench("service scope simulation", () => {
        const serviceScopes: ServiceScope[] = [];
        const scopeOperations: {
            operationId: string;
            type: "create" | "resolve" | "dispose" | "inherit";
            scopeId: string;
            parentScopeId?: string;
            serviceId?: string;
            timestamp: number;
            duration: number;
            success: boolean;
        }[] = [];

        // Create root scope
        const rootScope: ServiceScope = {
            scopeId: "root-scope",
            createdAt: Date.now(),
            serviceInstances: [],
            disposed: false,
            childScopes: [],
        };
        serviceScopes.push(rootScope);

        let currentTime = Date.now();

        // Simulate scope operations
        for (let operation = 0; operation < 300; operation++) {
            const operationType = Math.random();
            let opType: "create" | "resolve" | "dispose" | "inherit";
            let targetScope: ServiceScope;

            if (operationType < 0.3) {
                // Create new scope
                opType = "create";
                const parentScope =
                    serviceScopes[
                        Math.floor(Math.random() * serviceScopes.length)
                    ];

                const newScope: ServiceScope = {
                    scopeId: `scope-${operation}`,
                    parentScopeId: parentScope.scopeId,
                    createdAt: currentTime,
                    serviceInstances: [],
                    disposed: false,
                    childScopes: [],
                };

                serviceScopes.push(newScope);
                parentScope.childScopes.push(newScope);
                targetScope = newScope;
            } else if (operationType < 0.7) {
                // Resolve service in scope
                opType = "resolve";
                const activeScopes = serviceScopes.filter((s) => !s.disposed);
                targetScope =
                    activeScopes[
                        Math.floor(Math.random() * activeScopes.length)
                    ];

                const serviceId = `scoped-service-${Math.floor(Math.random() * 10)}`;

                // Check if service already exists in scope hierarchy
                let existingInstance: ServiceInstance | undefined;
                let currentScope: ServiceScope | undefined = targetScope;

                while (currentScope && !existingInstance) {
                    existingInstance = currentScope.serviceInstances.find(
                        (si) => si.serviceId === serviceId
                    );
                    if (!existingInstance && currentScope.parentScopeId) {
                        currentScope = serviceScopes.find(
                            (s) => s.scopeId === currentScope!.parentScopeId
                        );
                    } else {
                        break;
                    }
                }

                if (existingInstance) {
                    existingInstance.lastAccessedAt = currentTime;
                    existingInstance.accessCount++;
                } else {
                    // Create new service instance in scope
                    const newInstance: ServiceInstance = {
                        instanceId: `scoped-instance-${operation}`,
                        serviceId,
                        createdAt: currentTime,
                        lastAccessedAt: currentTime,
                        accessCount: 1,
                        memoryUsage: Math.floor(Math.random() * 5000) + 1000,
                        state: "active",
                        dependencies: [],
                        children: [],
                    };

                    targetScope.serviceInstances.push(newInstance);
                }
            } else if (operationType < 0.9) {
                // Inherit from parent scope
                opType = "inherit";
                const childScopes = serviceScopes.filter(
                    (s) => !s.disposed && s.parentScopeId
                );
                if (childScopes.length > 0) {
                    targetScope =
                        childScopes[
                            Math.floor(Math.random() * childScopes.length)
                        ];

                    const parentScope = serviceScopes.find(
                        (s) => s.scopeId === targetScope.parentScopeId
                    );
                    if (
                        parentScope &&
                        parentScope.serviceInstances.length > 0
                    ) {
                        const inheritedService =
                            parentScope.serviceInstances[
                                Math.floor(
                                    Math.random() *
                                        parentScope.serviceInstances.length
                                )
                            ];

                        // Create reference in child scope
                        const inheritedInstance: ServiceInstance = {
                            instanceId: `inherited-${operation}`,
                            serviceId: inheritedService.serviceId,
                            createdAt: inheritedService.createdAt,
                            lastAccessedAt: currentTime,
                            accessCount: 1,
                            memoryUsage: 0, // Shared instance
                            state: "active",
                            dependencies: inheritedService.dependencies,
                            children: [],
                        };

                        targetScope.serviceInstances.push(inheritedInstance);
                    }
                } else {
                    targetScope = rootScope;
                }
            } else {
                // Dispose scope
                opType = "dispose";
                const disposableScopes = serviceScopes.filter(
                    (s) =>
                        !s.disposed &&
                        s.scopeId !== "root-scope" &&
                        s.childScopes.length === 0
                );

                if (disposableScopes.length > 0) {
                    targetScope =
                        disposableScopes[
                            Math.floor(Math.random() * disposableScopes.length)
                        ];

                    // Dispose all service instances in scope
                    for (const instance of targetScope.serviceInstances) {
                        instance.state = "disposing";
                        setTimeout(() => {
                            instance.state = "disposed";
                        }, Math.random() * 100);
                    }

                    targetScope.disposed = true;

                    // Remove from parent's child scopes
                    if (targetScope.parentScopeId) {
                        const parentScope = serviceScopes.find(
                            (s) => s.scopeId === targetScope.parentScopeId
                        );
                        if (parentScope) {
                            const childIndex =
                                parentScope.childScopes.findIndex(
                                    (c) => c.scopeId === targetScope.scopeId
                                );
                            if (childIndex !== -1) {
                                parentScope.childScopes.splice(childIndex, 1);
                            }
                        }
                    }
                } else {
                    targetScope = rootScope;
                }
            }

            // Calculate operation duration based on complexity
            let duration: number;
            switch (opType) {
                case "create": {
                    duration = Math.random() * 50 + 10; // 10-60ms
                    break;
                }
                case "resolve": {
                    const scopeDepth = targetScope.parentScopeId ? 2 : 1;
                    duration = Math.random() * 30 * scopeDepth + 5; // 5-65ms based on depth
                    break;
                }
                case "inherit": {
                    duration = Math.random() * 20 + 5; // 5-25ms
                    break;
                }
                case "dispose": {
                    const instanceCount = targetScope.serviceInstances.length;
                    duration = Math.random() * 10 * instanceCount + 10; // 10ms + 10ms per instance
                    break;
                }
                default: {
                    duration = 10;
                }
            }

            const success = Math.random() > 0.02; // 98% success rate

            scopeOperations.push({
                operationId: `scope-op-${operation}`,
                type: opType,
                scopeId: targetScope.scopeId,
                parentScopeId: targetScope.parentScopeId,
                timestamp: currentTime,
                duration,
                success,
            });

            currentTime += Math.random() * 1000 + 100; // 100ms - 1.1s between operations
        }

        // Calculate scope metrics
        const operationsByType = scopeOperations.reduce(
            (acc, op) => {
                acc[op.type] = (acc[op.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const activeScopeCount = serviceScopes.filter(
            (s) => !s.disposed
        ).length;
        const totalScopeCount = serviceScopes.length;
        const averageChildScopes =
            serviceScopes.reduce((sum, s) => sum + s.childScopes.length, 0) /
            serviceScopes.length;

        const scopeLifetimes = serviceScopes
            .filter((s) => s.disposed)
            .map((s) => {
                const createOp = scopeOperations.find(
                    (op) => op.scopeId === s.scopeId && op.type === "create"
                );
                const disposeOp = scopeOperations.find(
                    (op) => op.scopeId === s.scopeId && op.type === "dispose"
                );
                return disposeOp && createOp
                    ? disposeOp.timestamp - createOp.timestamp
                    : 0;
            })
            .filter((lifetime) => lifetime > 0);

        const averageScopeLifetime =
            scopeLifetimes.length > 0
                ? scopeLifetimes.reduce((sum, lt) => sum + lt, 0) /
                  scopeLifetimes.length
                : 0;

        const totalServiceInstances = serviceScopes.reduce(
            (sum, s) => sum + s.serviceInstances.length,
            0
        );
        const averageInstancesPerScope =
            serviceScopes.length > 0
                ? totalServiceInstances / serviceScopes.length
                : 0;
    });

    // Container performance and memory management
    bench("container performance simulation", () => {
        interface ContainerMetrics {
            timestamp: number;
            activeServices: number;
            totalInstances: number;
            memoryUsage: number;
            resolutionTimeP95: number;
            cacheHitRate: number;
            errorRate: number;
            gcCollections: number;
        }

        const performanceMetrics: ContainerMetrics[] = [];
        const operationHistory: {
            operation: string;
            startTime: number;
            endTime: number;
            memoryBefore: number;
            memoryAfter: number;
            success: boolean;
        }[] = [];

        let currentMemory = 50 * 1024 * 1024; // Start with 50MB
        let totalGcCollections = 0;
        let currentTime = Date.now();

        // Simulate container performance over time
        for (let interval = 0; interval < 200; interval++) {
            const intervalStart = currentTime;

            // Simulate various operations during this interval
            const operationCount = Math.floor(Math.random() * 50) + 20; // 20-70 operations
            const intervalOperations: typeof operationHistory = [];

            for (let i = 0; i < operationCount; i++) {
                const operationType = Math.random();
                let operation: string;
                let operationDuration: number;
                let memoryDelta: number;
                let successRate: number;

                if (operationType < 0.4) {
                    // Service resolution
                    operation = "resolve";
                    operationDuration = Math.random() * 50 + 5; // 5-55ms
                    memoryDelta = Math.random() * 1024 * 10; // 0-10KB
                    successRate = 0.98;
                } else if (operationType < 0.6) {
                    // Service creation
                    operation = "create";
                    operationDuration = Math.random() * 100 + 20; // 20-120ms
                    memoryDelta = Math.random() * 1024 * 50 + 1024 * 10; // 10-60KB
                    successRate = 0.95;
                } else if (operationType < 0.8) {
                    // Service disposal
                    operation = "dispose";
                    operationDuration = Math.random() * 30 + 10; // 10-40ms
                    memoryDelta = -(Math.random() * 1024 * 30 + 1024 * 5); // Free 5-35KB
                    successRate = 0.99;
                } else if (operationType < 0.9) {
                    // Cache operation
                    operation = "cache";
                    operationDuration = Math.random() * 10 + 1; // 1-11ms
                    memoryDelta = Math.random() * 1024 * 5; // 0-5KB
                    successRate = 0.999;
                } else {
                    // GC operation
                    operation = "gc";
                    operationDuration = Math.random() * 200 + 50; // 50-250ms
                    memoryDelta = -(
                        currentMemory * 0.1 +
                        Math.random() * currentMemory * 0.2
                    ); // Free 10-30%
                    successRate = 0.99;
                    totalGcCollections++;
                }

                const opStartTime = currentTime + i * 10;
                const memoryBefore = currentMemory;
                const success = Math.random() < successRate;

                if (success) {
                    currentMemory = Math.max(0, currentMemory + memoryDelta);
                }

                const historyEntry = {
                    operation,
                    startTime: opStartTime,
                    endTime: opStartTime + operationDuration,
                    memoryBefore,
                    memoryAfter: currentMemory,
                    success,
                };

                intervalOperations.push(historyEntry);
                operationHistory.push(historyEntry);
            }

            // Calculate interval metrics
            const intervalEnd = currentTime + 60_000; // 1-minute intervals
            const activeServices = Math.floor(Math.random() * 50) + 10; // 10-60 active services
            const totalInstances = Math.floor(Math.random() * 200) + 50; // 50-250 instances

            // Calculate resolution time P95
            const resolutions = intervalOperations.filter(
                (op) => op.operation === "resolve" && op.success
            );
            const resolutionTimes = resolutions
                .map((r) => r.endTime - r.startTime)
                .toSorted((a, b) => a - b);
            const p95Index = Math.floor(resolutionTimes.length * 0.95);
            const resolutionTimeP95 =
                resolutionTimes.length > 0 ? resolutionTimes[p95Index] || 0 : 0;

            // Calculate cache hit rate (simulate)
            const cacheOperations = intervalOperations.filter(
                (op) => op.operation === "cache"
            );
            const cacheHitRate =
                cacheOperations.length > 0 ? Math.random() * 0.3 + 0.6 : 0.8; // 60-90% hit rate

            // Calculate error rate
            const failedOperations = intervalOperations.filter(
                (op) => !op.success
            );
            const errorRate =
                intervalOperations.length > 0
                    ? failedOperations.length / intervalOperations.length
                    : 0;

            const metrics: ContainerMetrics = {
                timestamp: intervalEnd,
                activeServices,
                totalInstances,
                memoryUsage: currentMemory,
                resolutionTimeP95,
                cacheHitRate,
                errorRate,
                gcCollections: totalGcCollections,
            };

            performanceMetrics.push(metrics);

            // Simulate memory pressure and trigger GC if needed
            const memoryPressure = currentMemory / (200 * 1024 * 1024); // Pressure at 200MB
            if (memoryPressure > 0.8 && Math.random() < 0.5) {
                // Force GC
                const gcAmount = currentMemory * (0.2 + Math.random() * 0.3);
                currentMemory = Math.max(
                    currentMemory * 0.3,
                    currentMemory - gcAmount
                );
                totalGcCollections++;
            }

            currentTime = intervalEnd;
        }

        // Calculate overall performance metrics
        const avgMemoryUsage =
            performanceMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
            performanceMetrics.length;
        const avgResolutionTime =
            performanceMetrics.reduce(
                (sum, m) => sum + m.resolutionTimeP95,
                0
            ) / performanceMetrics.length;
        const avgCacheHitRate =
            performanceMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) /
            performanceMetrics.length;
        const avgErrorRate =
            performanceMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
            performanceMetrics.length;

        const maxMemoryUsage = Math.max(
            ...performanceMetrics.map((m) => m.memoryUsage)
        );
        const minMemoryUsage = Math.min(
            ...performanceMetrics.map((m) => m.memoryUsage)
        );

        const totalOperations = operationHistory.length;
        const successfulOperations = operationHistory.filter(
            (op) => op.success
        ).length;
        const overallSuccessRate = successfulOperations / totalOperations;

        // Performance trend analysis
        const earlyMetrics = performanceMetrics.slice(
            0,
            Math.floor(performanceMetrics.length * 0.3)
        );
        const lateMetrics = performanceMetrics.slice(
            Math.floor(performanceMetrics.length * 0.7)
        );

        const performanceTrend = {
            memoryGrowth:
                lateMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
                    lateMetrics.length -
                earlyMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
                    earlyMetrics.length,
            resolutionTimeChange:
                lateMetrics.reduce((sum, m) => sum + m.resolutionTimeP95, 0) /
                    lateMetrics.length -
                earlyMetrics.reduce((sum, m) => sum + m.resolutionTimeP95, 0) /
                    earlyMetrics.length,
            errorRateChange:
                lateMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
                    lateMetrics.length -
                earlyMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
                    earlyMetrics.length,
        };
    });
});

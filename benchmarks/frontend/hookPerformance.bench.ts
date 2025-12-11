/**
 * Performance benchmarks for React hook operations.
 *
 * @packageDocumentation
 *
 * Exercises synthetic implementations of core and custom hooks to evaluate
 * render scheduling, memoization, and dependency tracking costs.
 */

import type { EffectCallback as ReactEffectCallback } from "react";
import { bench, describe } from "vitest";

// Interface definitions for React Hooks

/**
 * Captures common bookkeeping data for synthetic hook instances.
 */
interface HookState {
    id: string;
    type: HookType;
    value: any;
    dependencies?: any[];
    cleanup?: () => void;
    hasChanged: boolean;
    executionCount: number;
    totalExecutionTime: number;
    lastExecutionTime: number;
    memoryUsage: number;
}

/**
 * Extends {@link HookState} with `useState`-specific metadata.
 */
interface UseStateHook extends HookState {
    type: "useState";
    value: [any, (newValue: any) => void];
    updateCount: number;
    batchedUpdates: any[];
}

/**
 * Extends {@link HookState} with `useEffect` execution tracking.
 */
interface UseEffectHook extends HookState {
    type: "useEffect";
    value: EffectCallback;
    dependencies: any[];
    cleanup?: () => void;
    hasRun: boolean;
    skipCount: number;
}

/**
 * Extends {@link HookState} with memoization-specific metrics.
 */
interface UseMemoHook extends HookState {
    type: "useMemo";
    value: any;
    dependencies: any[];
    computationFunction: () => any;
    cacheHits: number;
    cacheMisses: number;
    computationTime: number;
}

/**
 * Extends {@link HookState} with callable memoization metrics.
 */
interface UseCallbackHook extends HookState {
    type: "useCallback";
    value: (...args: any[]) => any;
    dependencies: any[];
    originalFunction: (...args: any[]) => any;
    callCount: number;
    memoizationHits: number;
}

/**
 * Extends {@link HookState} for ref mutation tracking.
 */
interface UseRefHook extends HookState {
    type: "useRef";
    value: { current: any };
    mutationCount: number;
}

/**
 * Represents custom hook executions composed from internal hooks.
 */
interface CustomHookState extends HookState {
    type: "custom";
    name: string;
    internalHooks: HookState[];
    returnValue: any;
    complexity: number;
}

type EffectCallback = ReactEffectCallback;
type EffectCleanup = ReturnType<EffectCallback>;

/**
 * Enumerates supported hook types tracked by the benchmark.
 */
type HookType =
    | "useState"
    | "useEffect"
    | "useMemo"
    | "useCallback"
    | "useRef"
    | "custom";

/**
 * Tracks hook execution context for a single synthetic component.
 */
interface ComponentHookContext {
    componentId: string;
    hooks: HookState[];
    renderCount: number;
    totalHookExecutionTime: number;
    hookDependencyChanges: number;
    memoryFootprint: number;
}

/**
 * Aggregated metrics describing hook execution characteristics.
 */
interface HookPerformanceMetrics {
    totalHooks: number;
    hookTypeDistribution: Record<HookType, number>;
    averageExecutionTime: Record<HookType, number>;
    totalMemoryUsage: number;
    dependencyOptimizationRate: number;
    memoizationEffectiveness: number;
    effectSkipRate: number;
}

// Mock React Hooks system

/**
 * In-memory simulation of React's hook runtime supporting benchmarking flows.
 */
class MockReactHooks {
    private components = new Map<string, ComponentHookContext>();
    private globalHookIndex = 0;
    private currentComponentId: string | null = null;
    private hookExecutionOrder: string[] = [];
    private dependencyComparator = new DependencyComparator();

    // Hook registration and execution
    /**
     * Registers a component and prepares hook bookkeeping structures.
     *
     * @param componentId - Identifier for the synthetic component.
     *
     * @returns The initialised component hook context.
     */
    registerComponent(componentId: string): ComponentHookContext {
        const context: ComponentHookContext = {
            componentId,
            hooks: [],
            renderCount: 0,
            totalHookExecutionTime: 0,
            hookDependencyChanges: 0,
            memoryFootprint: 0,
        };

        this.components.set(componentId, context);
        return context;
    }

    /**
     * Sets the component currently executing hooks.
     *
     * @param componentId - Identifier bound to subsequent hook calls.
     */
    setCurrentComponent(componentId: string): void {
        this.currentComponentId = componentId;
    }

    // UseState implementation
    /**
     * Simulates React's `useState` hook.
     *
     * @param initialValue - Initial state value.
     *
     * @returns State tuple of value and setter.
     */
    useState<T>(initialValue: T): [T, (newValue: T) => void] {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as UseStateHook | undefined;

        if (!hook) {
            // Initialize hook
            hook = {
                id: `useState-${this.globalHookIndex++}`,
                type: "useState",
                value: [
                    initialValue,
                    (newValue: T) =>
                        this.setStateValue(
                            context.componentId,
                            hookIndex,
                            newValue
                        ),
                ],
                hasChanged: false,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: this.calculateValueSize(initialValue),
                updateCount: 0,
                batchedUpdates: [],
            };

            context.hooks.push(hook);
        }

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.totalExecutionTime += executionTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;

        return hook.value;
    }

    /**
     * Updates the stored state for a component hook and schedules re-rendering
     * when needed.
     */
    private setStateValue(
        componentId: string,
        hookIndex: number,
        newValue: any
    ): void {
        const context = this.components.get(componentId);
        if (!context) return;

        const hook = context.hooks[hookIndex] as UseStateHook;
        if (!hook || hook.type !== "useState") return;

        const [currentValue] = hook.value;

        // Check if value actually changed
        const hasChanged = !this.shallowEqual(currentValue, newValue);

        if (hasChanged) {
            hook.value[0] = newValue;
            hook.hasChanged = true;
            hook.updateCount++;
            hook.memoryUsage = this.calculateValueSize(newValue);

            // Schedule re-render
            this.scheduleRerender(componentId);
        }
    }

    // UseEffect implementation
    /**
     * Simulates React's `useEffect` hook.
     */
    useEffect(effect: EffectCallback, dependencies?: any[]): void {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as UseEffectHook | undefined;

        if (hook) {
            // Check dependencies
            const depsChanged = dependencies
                ? this.dependencyComparator.hasDependenciesChanged(
                      hook.dependencies,
                      dependencies
                  )
                : true;

            if (depsChanged) {
                hook.hasChanged = true;
                hook.dependencies = dependencies
                    ? Array.from(dependencies)
                    : [];
                context.hookDependencyChanges++;
            } else {
                hook.hasChanged = false;
                hook.skipCount++;
            }
        } else {
            // Initialize hook
            hook = {
                id: `useEffect-${this.globalHookIndex++}`,
                type: "useEffect",
                value: effect,
                dependencies: dependencies ? Array.from(dependencies) : [],
                hasChanged: true,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: this.calculateEffectSize(effect, dependencies),
                hasRun: false,
                skipCount: 0,
            };

            context.hooks.push(hook);
        }

        // Execute effect if dependencies changed
        if (hook.hasChanged) {
            // Cleanup previous effect
            if (hook.cleanup) {
                hook.cleanup();
            }

            const effectStartTime = performance.now();
            const cleanup = effect();
            const effectTime = performance.now() - effectStartTime;

            hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
            hook.hasRun = true;
            hook.totalExecutionTime += effectTime;
        }

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;
    }

    // UseMemo implementation
    /**
     * Simulates React's `useMemo` hook.
     */
    useMemo<T>(computationFunction: () => T, dependencies: any[]): T {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as UseMemoHook | undefined;

        if (hook) {
            // Check dependencies
            const depsChanged =
                this.dependencyComparator.hasDependenciesChanged(
                    hook.dependencies,
                    dependencies
                );

            if (depsChanged) {
                // Recompute
                const computationStartTime = performance.now();
                const newValue = computationFunction();
                const computationTime =
                    performance.now() - computationStartTime;

                hook.value = newValue;
                hook.dependencies = Array.from(dependencies);
                hook.hasChanged = true;
                hook.cacheMisses++;
                hook.computationTime += computationTime;
                hook.memoryUsage = this.calculateValueSize(newValue);
                context.hookDependencyChanges++;
            } else {
                // Use cached value
                hook.hasChanged = false;
                hook.cacheHits++;
            }
        } else {
            // Initialize hook
            const computationStartTime = performance.now();
            const value = computationFunction();
            const computationTime = performance.now() - computationStartTime;

            hook = {
                id: `useMemo-${this.globalHookIndex++}`,
                type: "useMemo",
                value,
                dependencies: Array.from(dependencies),
                computationFunction,
                hasChanged: true,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: this.calculateValueSize(value),
                cacheHits: 0,
                cacheMisses: 1,
                computationTime,
            };

            context.hooks.push(hook);
        }

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.totalExecutionTime += executionTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;

        return hook.value;
    }

    // UseCallback implementation
    /**
     * Simulates React's `useCallback` hook.
     */
    useCallback<T extends (...args: any[]) => any>(
        callback: T,
        dependencies: any[]
    ): T {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as UseCallbackHook | undefined;

        if (hook) {
            // Check dependencies
            const depsChanged =
                this.dependencyComparator.hasDependenciesChanged(
                    hook.dependencies,
                    dependencies
                );

            if (depsChanged) {
                // Create new callback
                hook.value = callback;
                hook.dependencies = Array.from(dependencies);
                hook.hasChanged = true;
                hook.originalFunction = callback;
                context.hookDependencyChanges++;
            } else {
                // Use memoized callback
                hook.hasChanged = false;
                hook.memoizationHits++;
            }
        } else {
            // Initialize hook
            hook = {
                id: `useCallback-${this.globalHookIndex++}`,
                type: "useCallback",
                value: callback,
                dependencies: Array.from(dependencies),
                originalFunction: callback,
                hasChanged: true,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: this.calculateFunctionSize(callback),
                callCount: 0,
                memoizationHits: 0,
            };

            context.hooks.push(hook);
        }

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.totalExecutionTime += executionTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;

        return hook.value as T;
    }

    // UseRef implementation
    /**
     * Simulates React's `useRef` hook.
     */
    useRef<T>(initialValue: T): { current: T } {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as UseRefHook | undefined;

        if (!hook) {
            // Initialize hook
            hook = {
                id: `useRef-${this.globalHookIndex++}`,
                type: "useRef",
                value: { current: initialValue },
                hasChanged: false,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: this.calculateValueSize(initialValue),
                mutationCount: 0,
            };

            context.hooks.push(hook);
        }

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.totalExecutionTime += executionTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;

        return hook.value;
    }

    // Custom hook implementation
    /**
     * Runs a synthetic custom hook, tracking nested hook usage.
     */
    useCustomHook(
        name: string,
        hookFunction: () => any,
        complexity: number = 1
    ): any {
        const startTime = performance.now();
        const context = this.getCurrentContext();
        const hookIndex = context.hooks.length;

        let hook = context.hooks[hookIndex] as CustomHookState | undefined;

        if (!hook) {
            // Initialize hook
            hook = {
                id: `custom-${name}-${this.globalHookIndex++}`,
                type: "custom",
                name,
                value: undefined,
                hasChanged: true,
                executionCount: 0,
                totalExecutionTime: 0,
                lastExecutionTime: 0,
                memoryUsage: 0,
                internalHooks: [],
                returnValue: undefined,
                complexity,
            };

            context.hooks.push(hook);
        }

        // Execute custom hook
        const previousHookCount = context.hooks.length;
        const returnValue = hookFunction();
        const newHookCount = context.hooks.length;

        // Track internal hooks created by this custom hook
        hook.internalHooks = context.hooks.slice(
            previousHookCount,
            newHookCount
        );
        hook.returnValue = returnValue;
        hook.value = returnValue;
        hook.memoryUsage = this.calculateValueSize(returnValue);

        hook.executionCount++;
        const executionTime = performance.now() - startTime;
        hook.totalExecutionTime += executionTime;
        hook.lastExecutionTime = executionTime;
        context.totalHookExecutionTime += executionTime;

        return returnValue;
    }

    // Component rendering
    /**
     * Executes a synthetic render for the specified component.
     *
     * @param componentId - Component identifier.
     *
     * @returns Simulated render duration in milliseconds.
     */
    renderComponent(componentId: string): number {
        const startTime = performance.now();
        const context = this.components.get(componentId);

        if (!context) {
            throw new Error(`Component ${componentId} not found`);
        }

        this.setCurrentComponent(componentId);
        context.renderCount++;

        // Reset hook change flags
        context.hooks.forEach((hook) => {
            hook.hasChanged = false;
        });

        // Simulate component render work
        const renderWork = this.simulateRenderWork(context);

        const endTime = performance.now();
        return endTime - startTime;
    }

    /**
     * Estimates render work based on registered hooks.
     */
    private simulateRenderWork(context: ComponentHookContext): number {
        // Simulate render work based on hook complexity
        let work = 0;

        context.hooks.forEach((hook) => {
            switch (hook.type) {
                case "useState": {
                    work += 0.1;
                    break;
                }
                case "useEffect": {
                    work += 0.2;
                    break;
                }
                case "useMemo": {
                    const memoHook = hook as UseMemoHook;
                    work += memoHook.hasChanged
                        ? memoHook.computationTime * 0.1
                        : 0.05;
                    break;
                }
                case "useCallback": {
                    work += 0.1;
                    break;
                }
                case "useRef": {
                    work += 0.05;
                    break;
                }
                case "custom": {
                    const customHook = hook as CustomHookState;
                    work += customHook.complexity * 0.3;
                    break;
                }
            }
        });

        return work;
    }

    // Dependency comparison and optimization
    /** Synchronously triggers a render for benchmarking purposes. */
    private scheduleRerender(componentId: string): void {
        // Simulate scheduling a re-render synchronously for benchmarks
        // Using setTimeout(0) can cause hangs in benchmark environment
        this.renderComponent(componentId);
    }

    /** Retrieves the active component context. */
    private getCurrentContext(): ComponentHookContext {
        if (!this.currentComponentId) {
            throw new Error("No current component set");
        }

        const context = this.components.get(this.currentComponentId);
        if (!context) {
            throw new Error(`Component ${this.currentComponentId} not found`);
        }

        return context;
    }

    /** Performs a shallow equality comparison used by `useState`. */
    private shallowEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (
            typeof a !== "object" ||
            typeof b !== "object" ||
            a === null ||
            b === null
        ) {
            return false;
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        for (const key of keysA) {
            if (a[key] !== b[key]) return false;
        }

        return true;
    }

    // Size calculation utilities
    /** Approximates the memory footprint of a given value. */
    private calculateValueSize(value: any): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === "boolean") return 1;
        if (typeof value === "number") return 8;
        if (typeof value === "string") return value.length * 2;
        if (typeof value === "function") return 100; // Estimated
        if (Array.isArray(value)) {
            return value.reduce(
                (sum, item) => sum + this.calculateValueSize(item),
                8
            );
        }
        if (typeof value === "object") {
            return Object.entries(value).reduce(
                (sum, [key, val]) =>
                    sum + key.length * 2 + this.calculateValueSize(val),
                16
            );
        }
        return 8; // Default
    }

    /** Estimates effect size including dependency contributions. */
    private calculateEffectSize(
        effect: Function,
        dependencies?: any[]
    ): number {
        let size = 100; // Base effect size
        if (dependencies) {
            size += dependencies.reduce(
                (sum, dep) => sum + this.calculateValueSize(dep),
                0
            );
        }
        return size;
    }

    /** Approximates function size for memoization statistics. */
    private calculateFunctionSize(fn: Function): number {
        return fn.toString().length * 2 + 100; // Estimated overhead
    }

    // Performance analysis
    /**
     * Generates aggregate performance metrics across all components.
     */
    analyzeHookPerformance(): HookPerformanceMetrics {
        const allHooks: HookState[] = [];
        let totalMemoryUsage = 0;
        let totalDependencyChanges = 0;
        let totalRenders = 0;

        // Collect all hooks from all components
        for (const context of this.components.values()) {
            allHooks.push(...context.hooks);
            totalMemoryUsage += context.memoryFootprint;
            totalDependencyChanges += context.hookDependencyChanges;
            totalRenders += context.renderCount;
        }

        // Calculate hook type distribution
        const hookTypeDistribution: Record<HookType, number> = {
            useState: 0,
            useEffect: 0,
            useMemo: 0,
            useCallback: 0,
            useRef: 0,
            custom: 0,
        };

        const averageExecutionTime: Record<HookType, number> = {
            useState: 0,
            useEffect: 0,
            useMemo: 0,
            useCallback: 0,
            useRef: 0,
            custom: 0,
        };

        // Group hooks by type
        const hooksByType: Record<HookType, HookState[]> = {
            useState: [],
            useEffect: [],
            useMemo: [],
            useCallback: [],
            useRef: [],
            custom: [],
        };

        allHooks.forEach((hook) => {
            hookTypeDistribution[hook.type]++;
            hooksByType[hook.type].push(hook);
        });

        // Calculate average execution times
        Object.entries(hooksByType).forEach(([type, hooks]) => {
            if (hooks.length > 0) {
                const totalTime = hooks.reduce(
                    (sum, hook) => sum + hook.totalExecutionTime,
                    0
                );
                averageExecutionTime[type as HookType] =
                    totalTime / hooks.length;
            }
        });

        // Calculate memoization effectiveness
        const memoHooks = hooksByType.useMemo as UseMemoHook[];
        const memoizationEffectiveness =
            memoHooks.length > 0
                ? memoHooks.reduce((sum, hook) => sum + hook.cacheHits, 0) /
                  memoHooks.reduce(
                      (sum, hook) => sum + hook.cacheHits + hook.cacheMisses,
                      0
                  )
                : 0;

        // Calculate effect skip rate
        const effectHooks = hooksByType.useEffect as UseEffectHook[];
        const effectSkipRate =
            effectHooks.length > 0
                ? effectHooks.reduce((sum, hook) => sum + hook.skipCount, 0) /
                  effectHooks.reduce(
                      (sum, hook) => sum + hook.executionCount,
                      0
                  )
                : 0;

        // Calculate dependency optimization rate
        const dependencyOptimizationRate =
            totalRenders > 0 ? 1 - totalDependencyChanges / totalRenders : 0;

        return {
            totalHooks: allHooks.length,
            hookTypeDistribution,
            averageExecutionTime,
            totalMemoryUsage,
            dependencyOptimizationRate,
            memoizationEffectiveness,
            effectSkipRate,
        };
    }

    // Cleanup
    /** Clears all hook state and resets counters. */
    reset(): void {
        this.components.clear();
        this.globalHookIndex = 0;
        this.currentComponentId = null;
        this.hookExecutionOrder = [];
    }
}

// Dependency comparison utility

/**
 * Provides helper utilities for dependency array comparison and analysis.
 */
class DependencyComparator {
    /**
     * Determines whether dependency arrays differ.
     */
    hasDependenciesChanged(oldDeps: any[], newDeps: any[]): boolean {
        if (oldDeps.length !== newDeps.length) return true;

        for (const [i, oldDep] of oldDeps.entries()) {
            if (!Object.is(oldDep, newDeps[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Filters dependency arrays by removing unstable placeholders.
     */
    optimizeDependencies(dependencies: any[]): any[] {
        // Remove undefined and null values
        return dependencies.filter((dep) => dep !== undefined && dep !== null);
    }

    /**
     * Produces basic stability statistics for dependency arrays.
     */
    analyzeDependencyStability(dependencies: any[]): {
        stableCount: number;
        unstableCount: number;
        recommendations: string[];
    } {
        let stableCount = 0;
        let unstableCount = 0;
        const recommendations: string[] = [];

        dependencies.forEach((dep, index) => {
            if (typeof dep === "function") {
                unstableCount++;
                recommendations.push(
                    `Dependency ${index}: Consider using useCallback for function`
                );
            } else if (typeof dep === "object" && dep !== null) {
                unstableCount++;
                recommendations.push(
                    `Dependency ${index}: Consider using useMemo for object`
                );
            } else {
                stableCount++;
            }
        });

        return { stableCount, unstableCount, recommendations };
    }
}

describe("React Hook Performance", () => {
    // UseState benchmarks
    bench("useState - simple state updates", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        // Create components with useState
        for (let i = 0; i < 100; i++) {
            const componentId = `useState-component-${i}`;
            const context = hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            // Initialize useState hooks
            const [count, setCount] = hookSystem.useState(0);
            const [name, setName] = hookSystem.useState(`Component ${i}`);
            const [data, setData] = hookSystem.useState({
                value: i,
                items: [],
            });

            components.push(componentId);
        }

        // Perform state updates
        for (let update = 0; update < 500; update++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.setCurrentComponent(componentId);

            // Simulate different types of state updates
            const updateType = Math.floor(Math.random() * 3);
            switch (updateType) {
                case 0: {
                    hookSystem.renderComponent(componentId);
                    break;
                }
                case 1: {
                    hookSystem.renderComponent(componentId);
                    break;
                }
                case 2: {
                    hookSystem.renderComponent(componentId);
                    break;
                }
            }
        }

        hookSystem.reset();
    });

    bench("useState - complex state objects", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        for (let i = 0; i < 50; i++) {
            const componentId = `complex-state-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            // Complex initial state
            const [appState, setAppState] = hookSystem.useState({
                user: {
                    id: i,
                    name: `User ${i}`,
                    profile: {
                        avatar: `avatar${i}.jpg`,
                        preferences: {
                            theme: "light",
                            notifications: Array.from(
                                { length: 10 },
                                () => Math.random() > 0.5
                            ),
                        },
                    },
                },
                ui: {
                    loading: false,
                    errors: [],
                    modal: { open: false, content: null },
                },
                data: {
                    items: Array.from({ length: 20 }, (_, j) => ({
                        id: j,
                        value: Math.random() * 100,
                        metadata: { created: Date.now(), tags: [`tag${j}`] },
                    })),
                    filters: { category: "all", sortBy: "name" },
                    pagination: { page: 1, pageSize: 10 },
                },
            });

            components.push(componentId);
        }

        // Complex state updates
        for (let update = 0; update < 200; update++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        hookSystem.reset();
    });

    // UseEffect benchmarks
    bench("useEffect - dependency optimization", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        for (let i = 0; i < 80; i++) {
            const componentId = `effect-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            const [count, setCount] = hookSystem.useState(0);
            const [data, setData] = hookSystem.useState([]);
            const [config, setConfig] = hookSystem.useState({
                url: "api.example.com",
            });

            // Effects with different dependency patterns
            hookSystem.useEffect(() => {
                // Effect with stable dependencies
                console.log("Effect with count:", count);
            }, [count]);

            hookSystem.useEffect(() => {
                // Effect with object dependency (unstable)
                console.log("Effect with config:", config);
            }, [config]);

            hookSystem.useEffect(() => {
                // Effect with array dependency (unstable)
                console.log("Effect with data:", data);
            }, [data]);

            hookSystem.useEffect(() => {
                // Effect with no dependencies (runs every render)
                console.log("Effect with no deps");
            });

            hookSystem.useEffect(() => {
                // Effect with empty dependencies (runs once)
                console.log("Effect with empty deps");
            }, []);

            components.push(componentId);
        }

        // Trigger re-renders to test effect optimization
        for (let render = 0; render < 300; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        hookSystem.reset();
    });

    bench("useEffect - cleanup performance", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];
        const activeIntervals: NodeJS.Timeout[] = [];

        for (let i = 0; i < 60; i++) {
            const componentId = `cleanup-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            const [isActive, setIsActive] = hookSystem.useState(true);

            // Effects with expensive cleanup - using mock intervals instead of real ones
            hookSystem.useEffect(() => {
                // Mock interval that doesn't actually run
                const intervalId = {} as NodeJS.Timeout; // Mock interval ID

                const subscription = {
                    unsubscribe: () => Math.random() * 100, // Simulate cleanup work
                };

                const eventListener = () => Math.random() * 50; // Simulate event work

                return () => {
                    // Simulate cleanup work without real timers
                    void (Math.random() * 1000); // Simulate clearInterval work
                    subscription.unsubscribe();
                    void (Math.random() * 5); // Simulate work
                };
            }, [isActive]);

            hookSystem.useEffect(() => {
                // Another effect with cleanup
                const observers = Array.from({ length: 5 }, () => ({
                    disconnect: () => Math.random() * 2, // Cleanup work
                }));

                return () => {
                    observers.forEach((observer) => observer.disconnect());
                };
            }, []);

            components.push(componentId);
        }

        // Trigger many re-renders to test cleanup
        for (let render = 0; render < 250; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        // Clear any remaining intervals
        activeIntervals.forEach((interval) => clearInterval(interval));

        hookSystem.reset();
    });

    // UseMemo benchmarks
    bench("useMemo - expensive computations", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        for (let i = 0; i < 40; i++) {
            const componentId = `memo-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            const [items, setItems] = hookSystem.useState(
                Array.from({ length: 100 }, (_, j) => ({
                    id: j,
                    value: Math.random() * 100,
                }))
            );
            const [filter, setFilter] = hookSystem.useState("");
            const [sortBy, setSortBy] = hookSystem.useState("id");

            // Expensive computation without memoization
            const expensiveComputation = () => {
                let result = 0;
                for (let k = 0; k < 1000; k++) {
                    result += Math.sqrt(k * Math.random());
                }
                return result;
            };

            // Memoized expensive computation
            const memoizedValue = hookSystem.useMemo(
                () => expensiveComputation(),
                [items.length]
            );

            // Memoized filtered and sorted data
            const processedData = hookSystem.useMemo(
                () =>
                    items
                        .filter((item) =>
                            item.value.toString().includes(filter))
                        .toSorted((a, b) => {
                            if (sortBy === "id") return a.id - b.id;
                            if (sortBy === "value") return a.value - b.value;
                            return 0;
                        }),
                [
                    items,
                    filter,
                    sortBy,
                ]
            );

            // Memoized statistics
            const statistics = hookSystem.useMemo(() => {
                const values = processedData.map((item) => item.value);
                return {
                    count: values.length,
                    sum: values.reduce((a, b) => a + b, 0),
                    average:
                        values.length > 0
                            ? values.reduce((a, b) => a + b, 0) / values.length
                            : 0,
                    min: Math.min(...values),
                    max: Math.max(...values),
                };
            }, [processedData]);

            components.push(componentId);
        }

        // Trigger renders to test memoization
        for (let render = 0; render < 200; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        hookSystem.reset();
    });

    // UseCallback benchmarks
    bench("useCallback - function memoization", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        for (let i = 0; i < 50; i++) {
            const componentId = `callback-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            const [count, setCount] = hookSystem.useState(0);
            const [data, setData] = hookSystem.useState([]);
            const [config, setConfig] = hookSystem.useState({ multiplier: 1 });

            // Memoized event handlers
            const handleClick = hookSystem.useCallback(() => {
                console.log(`Clicked with count: ${count}`);
            }, [count]);

            const handleSubmit = hookSystem.useCallback((formData: any) => {
                console.log("Submitting:", formData);
                // Simulate form processing
                const processing = Math.random() * 3;
            }, []);

            const handleDataUpdate = hookSystem.useCallback(
                (newItem: any) => {
                    console.log("Updating data with:", newItem);
                    // Simulate data update
                    const update = [...data, newItem];
                },
                [data]
            );

            const handleCalculation = hookSystem.useCallback(
                (value: number) => value * config.multiplier * Math.random(),
                [config.multiplier]
            );

            // Complex callback with multiple dependencies
            const handleComplexOperation = hookSystem.useCallback(
                (params: any) => {
                    // Complex operation simulation
                    let result = 0;
                    for (let j = 0; j < count; j++) {
                        result += params.value * config.multiplier;
                    }
                    return result;
                },
                [count, config.multiplier]
            );

            components.push(componentId);
        }

        // Trigger renders to test callback memoization
        for (let render = 0; render < 250; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        hookSystem.reset();
    });

    // Custom hooks benchmarks
    bench("custom hooks - complex logic", () => {
        const hookSystem = new MockReactHooks();
        const components: string[] = [];

        // Define custom hooks
        const useCounter = (initialValue: number = 0) => {
            const [count, setCount] = hookSystem.useState(initialValue);

            const increment = hookSystem.useCallback(() => {
                setCount(count + 1);
            }, [count]);

            const decrement = hookSystem.useCallback(() => {
                setCount(count - 1);
            }, [count]);

            const reset = hookSystem.useCallback(() => {
                setCount(initialValue);
            }, [initialValue]);

            return { count, increment, decrement, reset };
        };

        const useLocalStorage = (key: string, defaultValue: any) => {
            const [value, setValue] = hookSystem.useState(
                () =>
                    // Simulate localStorage read
                    defaultValue
            );

            const setStoredValue = hookSystem.useCallback((newValue: any) => {
                setValue(newValue);
                // Simulate localStorage write
                const writeWork = Number(Math.random());
            }, []);

            return [value, setStoredValue];
        };

        const useDataFetcher = (url: string) => {
            const [data, setData] = hookSystem.useState<any>(null);
            const [loading, setLoading] = hookSystem.useState(false);
            const [error, setError] = hookSystem.useState<any>(null);

            const fetchData = hookSystem.useCallback(async () => {
                setLoading(true);
                try {
                    // Simulate API call
                    const fetchWork = Math.random() * 10;
                    const result = { id: Math.random(), data: "fetched data" };
                    setData(result);
                    setError(null);
                } catch (error_) {
                    setError(error_);
                } finally {
                    setLoading(false);
                }
            }, [url]);

            hookSystem.useEffect(() => {
                fetchData();
            }, [fetchData]);

            return { data, loading, error, refetch: fetchData };
        };

        for (let i = 0; i < 30; i++) {
            const componentId = `custom-hook-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            // Use custom hooks
            const counter = hookSystem.useCustomHook(
                "useCounter",
                () => useCounter(i),
                2
            );

            const [storedValue, setStoredValue] = hookSystem.useCustomHook(
                "useLocalStorage",
                () => useLocalStorage(`key-${i}`, `default-${i}`),
                3
            );

            const fetcher = hookSystem.useCustomHook(
                "useDataFetcher",
                () => useDataFetcher(`https://api.example.com/data/${i}`),
                4
            );

            components.push(componentId);
        }

        // Trigger renders to test custom hooks
        for (let render = 0; render < 150; render++) {
            const componentId =
                components[Math.floor(Math.random() * components.length)];
            hookSystem.renderComponent(componentId);
        }

        hookSystem.reset();
    });

    // Hook performance analysis
    bench("hook performance analysis and optimization", () => {
        const hookSystem = new MockReactHooks();
        const dependencyAnalyzer = new DependencyComparator();

        // Create a realistic application scenario
        const components: string[] = [];

        for (let i = 0; i < 20; i++) {
            const componentId = `analysis-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            // Mix of optimized and unoptimized hooks
            const [counter, setCounter] = hookSystem.useState(0);
            const [user, setUser] = hookSystem.useState({
                id: i,
                name: `User ${i}`,
            });
            const [items, setItems] = hookSystem.useState(
                Array.from({ length: 50 }, (_, j) => ({
                    id: j,
                    value: Math.random(),
                }))
            );

            // Well-optimized hooks
            const memoizedSum = hookSystem.useMemo(
                () => items.reduce((sum, item) => sum + item.value, 0),
                [items]
            );

            const optimizedCallback = hookSystem.useCallback(() => {
                console.log("Optimized callback");
            }, []);

            // Poorly optimized hooks (for comparison)
            const unoptimizedMemo = hookSystem.useMemo(
                () => ({ sum: memoizedSum, timestamp: Date.now() }), // Creates new object every time
                [memoizedSum]
            );

            const unoptimizedCallback = hookSystem.useCallback(() => {
                console.log("Unoptimized callback", { user, counter }); // Dependencies change frequently
            }, [user, counter]);

            // Effects with different optimization levels
            hookSystem.useEffect(() => {
                console.log("Optimized effect");
            }, [counter]); // Stable dependency

            hookSystem.useEffect(() => {
                console.log("Unoptimized effect");
            }, [user]); // Object dependency (unstable)

            components.push(componentId);
        }

        // Simulate application usage
        const analysisResults: any[] = [];

        for (let cycle = 0; cycle < 10; cycle++) {
            // Trigger many renders
            for (let render = 0; render < 50; render++) {
                const componentId =
                    components[Math.floor(Math.random() * components.length)];
                hookSystem.renderComponent(componentId);
            }

            // Analyze performance
            const metrics = hookSystem.analyzeHookPerformance();
            analysisResults.push({
                cycle,
                totalHooks: metrics.totalHooks,
                memoizationEffectiveness: metrics.memoizationEffectiveness,
                effectSkipRate: metrics.effectSkipRate,
                dependencyOptimization: metrics.dependencyOptimizationRate,
                memoryUsage: metrics.totalMemoryUsage,
            });
        }

        hookSystem.reset();
    });

    // Stress test - many hooks
    bench("stress test - hook scalability", () => {
        const hookSystem = new MockReactHooks();
        const stressComponents: string[] = [];

        // Create components with many hooks each
        for (let i = 0; i < 10; i++) {
            const componentId = `stress-component-${i}`;
            hookSystem.registerComponent(componentId);
            hookSystem.setCurrentComponent(componentId);

            // Create many state hooks
            const states: any[] = [];
            for (let j = 0; j < 20; j++) {
                const [state, setState] = hookSystem.useState({
                    id: j,
                    value: Math.random() * 100,
                    data: Array.from({ length: 10 }, () => Math.random()),
                });
                states.push([state, setState]);
            }

            // Create many memo hooks
            for (let j = 0; j < 15; j++) {
                const memoValue = hookSystem.useMemo(() => {
                    // Expensive computation
                    let result = 0;
                    for (let k = 0; k < 100; k++) {
                        result += Math.sqrt(k * Math.random());
                    }
                    return result + j;
                }, [states[j % states.length][0].value]);
            }

            // Create many callback hooks
            for (let j = 0; j < 10; j++) {
                const callback = hookSystem.useCallback(() => {
                    console.log(`Callback ${j}`);
                    return Math.random() * j;
                }, [states[j % states.length][0].id]);
            }

            // Create many effect hooks
            for (let j = 0; j < 8; j++) {
                hookSystem.useEffect(() => {
                    console.log(`Effect ${j}`);
                    const work = Math.random() * 2;

                    return () => {
                        const cleanup = Number(Math.random());
                    };
                }, [states[j % states.length][0].value]);
            }

            stressComponents.push(componentId);
        }

        // Stress test with many renders
        for (let render = 0; render < 100; render++) {
            const componentId =
                stressComponents[
                    Math.floor(Math.random() * stressComponents.length)
                ];
            hookSystem.renderComponent(componentId);
        }

        const finalMetrics = hookSystem.analyzeHookPerformance();
        hookSystem.reset();
    });
});

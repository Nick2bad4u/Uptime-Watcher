/**
 * Performance benchmarks for React component lifecycle operations.
 *
 * @packageDocumentation Emulates
 *
 * mounting, updating, and unmounting flows to analyze lifecycle
 * overhead and render scheduling behaviour.
 */

import { bench, describe } from "vitest";

// Interface definitions for component lifecycle

/**
 * Represents component instance state tracked by the benchmark harness.
 */
interface ComponentState {
    [key: string]: any;
    isInitialized: boolean;
    lastUpdated: number;
    renderCount: number;
    updateQueue: ComponentUpdate[];
}

/**
 * Synthetic component props shape used during benchmarking.
 */
interface ComponentProps {
    [key: string]: any;
    id: string;
    className?: string;
    children?: ComponentInstance[];
    key?: string | number;
}

/**
 * Describes a queued update applied to a component instance.
 */
interface ComponentUpdate {
    id: string;
    type: "props" | "state" | "force";
    timestamp: number;
    payload: any;
    source: string;
    priority: number;
}

/**
 * In-memory representation of a component tree node.
 */
interface ComponentInstance {
    id: string;
    type: string;
    props: ComponentProps;
    state: ComponentState;
    parent: ComponentInstance | null;
    children: ComponentInstance[];
    lifecyclePhase: LifecyclePhase;
    mountTime: number;
    updateCount: number;
    renderTime: number;
    unmountTime?: number;
    hooks: HookState[];
    effectCleanups: (() => void)[];
    refs: Map<string, any>;
}

/**
 * Captures hook state registered against a component instance.
 */
interface HookState {
    id: string;
    type:
        | "useState"
        | "useEffect"
        | "useMemo"
        | "useCallback"
        | "useRef"
        | "useContext";
    value: any;
    dependencies?: any[];
    cleanup?: () => void;
    hasChanged: boolean;
}

/**
 * Records lifecycle phase metrics emitted during simulation.
 */
interface LifecycleMetrics {
    phase: LifecyclePhase;
    componentId: string;
    duration: number;
    memoryDelta: number;
    timestamp: number;
    triggeredBy: string;
    childrenAffected: number;
}

/** Lifecycle phases emitted during simulation. */
type LifecyclePhase =
    | "constructing"
    | "mounting"
    | "mounted"
    | "updating"
    | "updated"
    | "unmounting"
    | "unmounted"
    | "error";

/**
 * Aggregates component tree metadata for scheduling and analytics.
 */
interface ComponentTree {
    root: ComponentInstance | null;
    componentCount: number;
    maxDepth: number;
    mountedComponents: Map<string, ComponentInstance>;
    updateQueue: ComponentUpdate[];
    lifecycleHistory: LifecycleMetrics[];
}

// Mock React-like component lifecycle system

/**
 * Simulates a React-like component lifecycle manager for benchmarking.
 */
class MockComponentLifecycle {
    private componentTree: ComponentTree = {
        root: null,
        componentCount: 0,
        maxDepth: 0,
        mountedComponents: new Map(),
        updateQueue: [],
        lifecycleHistory: [],
    };

    private nextId = 0;
    private batchUpdateInProgress = false;
    private pendingEffects: (() => void)[] = [];

    // Component creation and mounting
    /**
     * Creates a synthetic component instance and attaches it to the tree.
     */
    createComponent(
        type: string,
        props: ComponentProps,
        parent: ComponentInstance | null = null
    ): ComponentInstance {
        const component: ComponentInstance = {
            id: `${type}-${this.nextId++}`,
            type,
            props: { ...props, id: props.id || `component-${this.nextId}` },
            state: {
                isInitialized: false,
                lastUpdated: Date.now(),
                renderCount: 0,
                updateQueue: [],
            },
            parent,
            children: [],
            lifecyclePhase: "constructing",
            mountTime: 0,
            updateCount: 0,
            renderTime: 0,
            hooks: [],
            effectCleanups: [],
            refs: new Map(),
        };

        if (parent) {
            parent.children.push(component);
        } else {
            this.componentTree.root = component;
        }

        this.componentTree.componentCount++;
        return component;
    }

    /**
     * Executes the full mount lifecycle for a component instance.
     */
    mountComponent(component: ComponentInstance): LifecycleMetrics {
        const startTime = performance.now();
        const startMemory = Math.random() * 1000; // Simulated memory usage

        // Constructor phase
        component.lifecyclePhase = "constructing";
        this.initializeHooks(component);
        this.callLifecycleMethod(component, "constructor");

        // Mount phase
        component.lifecyclePhase = "mounting";
        this.callLifecycleMethod(component, "componentWillMount");

        // Render
        this.renderComponent(component);

        // Did mount
        component.lifecyclePhase = "mounted";
        component.mountTime = Date.now();
        this.callLifecycleMethod(component, "componentDidMount");

        // Execute effects
        this.executeEffects(component);

        this.componentTree.mountedComponents.set(component.id, component);

        const endTime = performance.now();
        const endMemory = Math.random() * 1000;

        const metrics: LifecycleMetrics = {
            phase: "mounted",
            componentId: component.id,
            duration: endTime - startTime,
            memoryDelta: endMemory - startMemory,
            timestamp: Date.now(),
            triggeredBy: "mount",
            childrenAffected: component.children.length,
        };

        this.componentTree.lifecycleHistory.push(metrics);
        return metrics;
    }

    /**
     * Runs an update lifecycle including diffing and effect scheduling.
     */
    updateComponent(
        component: ComponentInstance,
        newProps?: Partial<ComponentProps>,
        newState?: Partial<ComponentState>
    ): LifecycleMetrics {
        const startTime = performance.now();
        const startMemory = Math.random() * 1000;

        component.lifecyclePhase = "updating";
        component.updateCount++;

        // Prepare update
        const prevProps = { ...component.props };
        const prevState = { ...component.state };

        if (newProps) {
            Object.assign(component.props, newProps);
        }
        if (newState) {
            Object.assign(component.state, newState);
        }

        // Lifecycle methods
        const shouldUpdate = this.callLifecycleMethod(
            component,
            "shouldComponentUpdate",
            { prevProps, prevState }
        );

        if (shouldUpdate !== false) {
            this.callLifecycleMethod(component, "componentWillUpdate", {
                prevProps,
                prevState,
            });

            // Re-render
            this.renderComponent(component);

            component.lifecyclePhase = "updated";
            this.callLifecycleMethod(component, "componentDidUpdate", {
                prevProps,
                prevState,
            });

            // Update hooks and effects
            this.updateHooks(component);
            this.executeEffects(component);
        }

        const endTime = performance.now();
        const endMemory = Math.random() * 1000;

        const metrics: LifecycleMetrics = {
            phase: "updated",
            componentId: component.id,
            duration: endTime - startTime,
            memoryDelta: endMemory - startMemory,
            timestamp: Date.now(),
            triggeredBy: "update",
            childrenAffected: component.children.length,
        };

        this.componentTree.lifecycleHistory.push(metrics);
        return metrics;
    }

    /** Executes the unmount lifecycle and cleans up descendants. */
    unmountComponent(component: ComponentInstance): LifecycleMetrics {
        const startTime = performance.now();
        const startMemory = Math.random() * 1000;

        component.lifecyclePhase = "unmounting";

        // Cleanup effects
        component.effectCleanups.forEach((cleanup) => {
            try {
                cleanup();
            } catch (error) {
                console.error("Effect cleanup error:", error);
            }
        });

        // Lifecycle method
        this.callLifecycleMethod(component, "componentWillUnmount");

        // Unmount children recursively
        const childrenAffected = this.unmountChildren(component);

        // Remove from tree
        this.componentTree.mountedComponents.delete(component.id);
        if (component.parent) {
            const index = component.parent.children.indexOf(component);
            if (index !== -1) {
                component.parent.children.splice(index, 1);
            }
        }

        component.lifecyclePhase = "unmounted";
        component.unmountTime = Date.now();
        this.componentTree.componentCount--;

        const endTime = performance.now();
        const endMemory = Math.random() * 1000;

        const metrics: LifecycleMetrics = {
            phase: "unmounted",
            componentId: component.id,
            duration: endTime - startTime,
            memoryDelta: endMemory - startMemory,
            timestamp: Date.now(),
            triggeredBy: "unmount",
            childrenAffected,
        };

        this.componentTree.lifecycleHistory.push(metrics);
        return metrics;
    }

    private unmountChildren(component: ComponentInstance): number {
        let childrenAffected = 0;

        for (const child of component.children) {
            childrenAffected += this.unmountChildren(child) + 1;
            this.unmountComponent(child);
        }

        return childrenAffected;
    }

    private renderComponent(component: ComponentInstance): number {
        const startTime = performance.now();

        component.state.renderCount++;
        component.state.lastUpdated = Date.now();

        // Simulate rendering work
        const complexity = Math.max(
            1,
            component.children.length * Math.random() * 10
        );
        let renderWork = 0;

        for (let i = 0; i < complexity; i++) {
            renderWork += Math.sqrt(Math.random() * 1000);
        }

        // Simulate virtual DOM operations
        this.performVirtualDOMOperations(component);

        const endTime = performance.now();
        component.renderTime = endTime - startTime;

        return component.renderTime;
    }

    private performVirtualDOMOperations(component: ComponentInstance): void {
        // Simulate virtual DOM diff and patch operations
        const operations = [
            "createElement",
            "updateElement",
            "removeElement",
            "moveElement",
            "updateProps",
            "updateText",
        ];

        const operationCount = Math.floor(Math.random() * 20) + 1;

        for (let i = 0; i < operationCount; i++) {
            const operation =
                operations[Math.floor(Math.random() * operations.length)];

            // Simulate operation work
            switch (operation) {
                case "createElement": {
                    const elementCreation = Math.random() * 2;
                    break;
                }
                case "updateElement": {
                    const elementUpdate = Math.random() * 1.5;
                    break;
                }
                case "removeElement": {
                    const elementRemoval = Number(Math.random()) * 1;
                    break;
                }
                case "moveElement": {
                    const elementMove = Math.random() * 3;
                    break;
                }
                case "updateProps": {
                    const propsUpdate = Math.random() * 2.5;
                    break;
                }
                case "updateText": {
                    const textUpdate = Math.random() * 0.5;
                    break;
                }
            }
        }
    }

    private callLifecycleMethod(
        component: ComponentInstance,
        method: string,
        args?: any
    ): any {
        // Simulate lifecycle method execution
        const executionTime = Math.random() * 5; // Random execution time

        switch (method) {
            case "constructor": {
                component.state.isInitialized = true;
                break;
            }
            case "componentWillMount": {
                // Prior method simulation
                break;
            }
            case "componentDidMount": {
                // Post-mount work simulation
                this.scheduleEffect(() => {
                    const postMountWork = Math.random() * 10;
                });
                break;
            }
            case "shouldComponentUpdate": {
                // Return random decision for simulation
                return Math.random() > 0.1;
            } // 90% update rate
            case "componentWillUpdate": {
                // Pre-update work simulation
                break;
            }
            case "componentDidUpdate": {
                // Post-update work simulation
                this.scheduleEffect(() => {
                    const postUpdateWork = Math.random() * 8;
                });
                break;
            }
            case "componentWillUnmount": {
                // Cleanup work simulation
                component.effectCleanups.forEach((cleanup) => {
                    const cleanupWork = Math.random() * 3;
                });
                break;
            }
        }

        return true;
    }

    private initializeHooks(component: ComponentInstance): void {
        const hookTypes: HookState["type"][] = [
            "useState",
            "useEffect",
            "useMemo",
            "useCallback",
            "useRef",
            "useContext",
        ];

        const hookCount = Math.floor(Math.random() * 8) + 1;

        for (let i = 0; i < hookCount; i++) {
            const hook: HookState = {
                id: `hook-${component.id}-${i}`,
                type: hookTypes[Math.floor(Math.random() * hookTypes.length)],
                value: this.generateHookValue(),
                dependencies:
                    Math.random() > 0.5
                        ? this.generateDependencies()
                        : undefined,
                hasChanged: false,
            };

            if (hook.type === "useEffect") {
                hook.cleanup = () => {
                    const cleanupWork = Math.random() * 2;
                };
                component.effectCleanups.push(hook.cleanup);
            }

            component.hooks.push(hook);
        }
    }

    private updateHooks(component: ComponentInstance): void {
        component.hooks.forEach((hook) => {
            const oldValue = hook.value;

            // Simulate hook updates based on type
            switch (hook.type) {
                case "useState": {
                    if (Math.random() > 0.7) {
                        hook.value = this.generateHookValue();
                        hook.hasChanged = true;
                    }
                    break;
                }
                case "useMemo": {
                    if (this.dependenciesChanged(hook.dependencies)) {
                        hook.value = this.computeMemoizedValue();
                        hook.hasChanged = true;
                    }
                    break;
                }
                case "useCallback": {
                    if (this.dependenciesChanged(hook.dependencies)) {
                        hook.value = () => Math.random();
                        hook.hasChanged = true;
                    }
                    break;
                }
                case "useEffect": {
                    if (this.dependenciesChanged(hook.dependencies)) {
                        // Schedule effect
                        this.scheduleEffect(() => {
                            const effectWork = Math.random() * 5;
                        });
                    }
                    break;
                }
            }
        });
    }

    private generateHookValue(): any {
        const valueTypes = [
            () => Math.random() * 100,
            () => `string-${Math.random().toString(36).slice(2, 11)}`,
            () => ({ key: Math.random(), nested: { value: Math.random() } }),
            () =>
                Array.from({ length: Math.floor(Math.random() * 10) }, () =>
                    Math.random()
                ),
            () => new Date(),
            () => Math.random() > 0.5,
        ];

        return valueTypes[Math.floor(Math.random() * valueTypes.length)]();
    }

    private generateDependencies(): any[] {
        const depCount = Math.floor(Math.random() * 5) + 1;
        return Array.from({ length: depCount }, () => Math.random());
    }

    private dependenciesChanged(dependencies?: any[]): boolean {
        return !dependencies || Math.random() > 0.6;
    }

    private computeMemoizedValue(): any {
        // Simulate expensive computation
        let result = 0;
        for (let i = 0; i < 100; i++) {
            result += Math.sqrt(Math.random() * 1000);
        }
        return result;
    }

    private executeEffects(component: ComponentInstance): void {
        this.pendingEffects.forEach((effect) => {
            try {
                effect();
            } catch (error) {
                console.error("Effect execution error:", error);
            }
        });
        this.pendingEffects = [];
    }

    private scheduleEffect(effect: () => void): void {
        this.pendingEffects.push(effect);
    }

    // Batch updating system
    batchUpdate(
        updates: { component: ComponentInstance; props?: any; state?: any }[]
    ): LifecycleMetrics[] {
        this.batchUpdateInProgress = true;
        const metrics: LifecycleMetrics[] = [];

        try {
            for (const update of updates) {
                const updateMetrics = this.updateComponent(
                    update.component,
                    update.props,
                    update.state
                );
                metrics.push(updateMetrics);
            }
        } finally {
            this.batchUpdateInProgress = false;
            this.flushEffects();
        }

        return metrics;
    }

    private flushEffects(): void {
        this.executeEffects(this.componentTree.root!);
    }

    // Error boundaries simulation
    handleComponentError(
        component: ComponentInstance,
        error: Error
    ): LifecycleMetrics {
        const startTime = performance.now();

        component.lifecyclePhase = "error";

        // Error boundary logic
        this.callLifecycleMethod(component, "componentDidCatch", { error });

        // Error recovery or unmounting
        if (Math.random() > 0.5) {
            // Recover
            component.lifecyclePhase = "mounted";
        } else {
            // Unmount
            return this.unmountComponent(component);
        }

        const endTime = performance.now();

        const metrics: LifecycleMetrics = {
            phase: "error",
            componentId: component.id,
            duration: endTime - startTime,
            memoryDelta: 0,
            timestamp: Date.now(),
            triggeredBy: "error",
            childrenAffected: 0,
        };

        this.componentTree.lifecycleHistory.push(metrics);
        return metrics;
    }

    // Performance analysis
    getLifecycleStatistics(): {
        totalComponents: number;
        mountedComponents: number;
        avgMountTime: number;
        avgUpdateTime: number;
        avgUnmountTime: number;
        phaseDistribution: Record<LifecyclePhase, number>;
        memoryUsage: number;
    } {
        const history = this.componentTree.lifecycleHistory;

        const phaseDistribution: Record<LifecyclePhase, number> = {
            constructing: 0,
            mounting: 0,
            mounted: 0,
            updating: 0,
            updated: 0,
            unmounting: 0,
            unmounted: 0,
            error: 0,
        };

        let totalMountTime = 0;
        let totalUpdateTime = 0;
        let totalUnmountTime = 0;
        let mountCount = 0;
        let updateCount = 0;
        let unmountCount = 0;

        history.forEach((metrics) => {
            phaseDistribution[metrics.phase]++;

            switch (metrics.phase) {
                case "mounted": {
                    totalMountTime += metrics.duration;
                    mountCount++;
                    break;
                }
                case "updated": {
                    totalUpdateTime += metrics.duration;
                    updateCount++;
                    break;
                }
                case "unmounted": {
                    totalUnmountTime += metrics.duration;
                    unmountCount++;
                    break;
                }
            }
        });

        return {
            totalComponents: this.componentTree.componentCount,
            mountedComponents: this.componentTree.mountedComponents.size,
            avgMountTime: mountCount > 0 ? totalMountTime / mountCount : 0,
            avgUpdateTime: updateCount > 0 ? totalUpdateTime / updateCount : 0,
            avgUnmountTime:
                unmountCount > 0 ? totalUnmountTime / unmountCount : 0,
            phaseDistribution,
            memoryUsage: Math.random() * 1000, // Simulated
        };
    }
}

describe("React Component Lifecycle Performance", () => {
    // Component mounting benchmarks
    bench("component mounting - single components", () => {
        const lifecycle = new MockComponentLifecycle();
        const mountMetrics: LifecycleMetrics[] = [];

        for (let i = 0; i < 200; i++) {
            const component = lifecycle.createComponent("TestComponent", {
                id: `test-${i}`,
                className: "test-class",
                data: {
                    value: Math.random() * 100,
                    items: Array.from(
                        { length: Math.floor(Math.random() * 10) },
                        (_, j) => `item-${j}`
                    ),
                    config: {
                        enabled: Math.random() > 0.5,
                        threshold: Math.random() * 50,
                    },
                },
            });

            const metrics = lifecycle.mountComponent(component);
            mountMetrics.push(metrics);
        }
    });

    bench("component mounting - nested components", () => {
        const lifecycle = new MockComponentLifecycle();
        const mountMetrics: LifecycleMetrics[] = [];

        // Create component tree
        for (let i = 0; i < 50; i++) {
            const rootComponent = lifecycle.createComponent("RootComponent", {
                id: `root-${i}`,
                level: 0,
            });

            // Add children at multiple levels
            let currentParent = rootComponent;
            const maxDepth = Math.floor(Math.random() * 5) + 2;

            for (let depth = 1; depth < maxDepth; depth++) {
                const childrenCount = Math.floor(Math.random() * 4) + 1;

                for (let j = 0; j < childrenCount; j++) {
                    const child = lifecycle.createComponent(
                        `ChildComponent${depth}`,
                        {
                            id: `child-${i}-${depth}-${j}`,
                            level: depth,
                            parentId: currentParent.id,
                        },
                        currentParent
                    );

                    if (j === 0) {
                        currentParent = child; // Continue nesting with first child
                    }
                }
            }

            // Mount the entire tree
            const metrics = lifecycle.mountComponent(rootComponent);
            mountMetrics.push(metrics);
        }
    });

    // Component updating benchmarks
    bench("component updating - props changes", () => {
        const lifecycle = new MockComponentLifecycle();
        const updateMetrics: LifecycleMetrics[] = [];

        // Create and mount components
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 100; i++) {
            const component = lifecycle.createComponent("UpdatableComponent", {
                id: `updatable-${i}`,
                value: Math.random() * 100,
                items: Array.from({ length: 5 }, (_, j) => `item-${j}`),
            });
            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Perform many updates
        for (let update = 0; update < 300; update++) {
            const component =
                components[Math.floor(Math.random() * components.length)];

            const newProps = {
                value: Math.random() * 100,
                timestamp: Date.now(),
                items: Array.from(
                    { length: Math.floor(Math.random() * 10) },
                    (_, j) => `updated-item-${j}`
                ),
                metadata: {
                    updateCount: update,
                    random: Math.random(),
                },
            };

            const metrics = lifecycle.updateComponent(component, newProps);
            updateMetrics.push(metrics);
        }
    });

    bench("component updating - state changes", () => {
        const lifecycle = new MockComponentLifecycle();
        const updateMetrics: LifecycleMetrics[] = [];

        // Create components with complex state
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 100; i++) {
            const component = lifecycle.createComponent("StatefulComponent", {
                id: `stateful-${i}`,
            });

            // Initialize complex state
            component.state = {
                ...component.state,
                counter: 0,
                data: Array.from({ length: 20 }, () => Math.random()),
                nested: {
                    flags: Array.from(
                        { length: 10 },
                        () => Math.random() > 0.5
                    ),
                    cache: new Map(),
                    history: [],
                },
                computed: {},
            };

            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Perform state updates
        for (let update = 0; update < 500; update++) {
            const component =
                components[Math.floor(Math.random() * components.length)];

            const newState = {
                counter: component.state.counter + 1,
                data: component.state.data.map(
                    (val: number) => val + Math.random() - 0.5
                ),
                nested: {
                    ...component.state.nested,
                    flags: component.state.nested.flags.map(
                        () => Math.random() > 0.5
                    ),
                    history: [
                        ...component.state.nested.history,
                        Date.now(),
                    ].slice(-50),
                },
                computed: {
                    average:
                        component.state.data.reduce(
                            (a: number, b: number) => a + b,
                            0
                        ) / component.state.data.length,
                    max: Math.max(...component.state.data),
                    min: Math.min(...component.state.data),
                },
            };

            const metrics = lifecycle.updateComponent(
                component,
                undefined,
                newState
            );
            updateMetrics.push(metrics);
        }
    });

    // Batch updating benchmarks
    bench("batch updates - multiple components", () => {
        const lifecycle = new MockComponentLifecycle();

        // Create many components
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 150; i++) {
            const component = lifecycle.createComponent("BatchComponent", {
                id: `batch-${i}`,
                value: i,
            });
            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Perform batch updates
        for (let batch = 0; batch < 20; batch++) {
            const batchSize = Math.floor(Math.random() * 20) + 5;
            const updates = Array.from({ length: batchSize }, () => {
                const component =
                    components[Math.floor(Math.random() * components.length)];
                return {
                    component,
                    props: {
                        value: Math.random() * 1000,
                        batchId: batch,
                        timestamp: Date.now(),
                    },
                    state: {
                        updateCount: (component.state.updateCount || 0) + 1,
                        lastBatch: batch,
                    },
                };
            });

            const batchMetrics = lifecycle.batchUpdate(updates);
        }
    });

    // Component unmounting benchmarks
    bench("component unmounting - cleanup heavy", () => {
        const lifecycle = new MockComponentLifecycle();
        const unmountMetrics: LifecycleMetrics[] = [];

        // Create components with many effects and cleanups
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 100; i++) {
            const component = lifecycle.createComponent("CleanupComponent", {
                id: `cleanup-${i}`,
            });

            // Add many cleanup functions
            for (let j = 0; j < 10; j++) {
                component.effectCleanups.push(() => {
                    // Simulate cleanup work
                    const cleanupWork = Math.random() * 5;
                });
            }

            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Unmount all components
        components.forEach((component) => {
            const metrics = lifecycle.unmountComponent(component);
            unmountMetrics.push(metrics);
        });
    });

    bench("component unmounting - deep trees", () => {
        const lifecycle = new MockComponentLifecycle();
        const unmountMetrics: LifecycleMetrics[] = [];

        // Create deep component trees
        for (let tree = 0; tree < 20; tree++) {
            const rootComponent = lifecycle.createComponent("TreeRoot", {
                id: `tree-root-${tree}`,
            });

            // Build deep tree
            const buildTree = (
                parent: ComponentInstance,
                depth: number,
                maxDepth: number
            ) => {
                if (depth >= maxDepth) return;

                const childrenCount = Math.floor(Math.random() * 3) + 2;
                for (let i = 0; i < childrenCount; i++) {
                    const child = lifecycle.createComponent(
                        `TreeNode${depth}`,
                        {
                            id: `tree-${tree}-depth-${depth}-child-${i}`,
                            depth,
                            parentId: parent.id,
                        },
                        parent
                    );

                    // Add some effects
                    child.effectCleanups.push(() => {
                        const work = Math.random() * 2;
                    });

                    buildTree(child, depth + 1, maxDepth);
                }
            };

            buildTree(rootComponent, 0, 6);
            lifecycle.mountComponent(rootComponent);

            // Unmount entire tree
            const metrics = lifecycle.unmountComponent(rootComponent);
            unmountMetrics.push(metrics);
        }
    });

    // Hook lifecycle benchmarks
    bench("hook updates - useState and useEffect", () => {
        const lifecycle = new MockComponentLifecycle();
        const updateMetrics: LifecycleMetrics[] = [];

        // Create components with many hooks
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 80; i++) {
            const component = lifecycle.createComponent("HookedComponent", {
                id: `hooked-${i}`,
            });

            // Initialize many hooks
            for (let j = 0; j < 15; j++) {
                component.hooks.push({
                    id: `hook-${i}-${j}`,
                    type: j % 2 === 0 ? "useState" : "useEffect",
                    value: Math.random(),
                    dependencies: Array.from({ length: 3 }, () =>
                        Math.random()
                    ),
                    hasChanged: false,
                });
            }

            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Trigger hook updates
        for (let update = 0; update < 300; update++) {
            const component =
                components[Math.floor(Math.random() * components.length)];

            // Simulate props/state change that affects hooks
            const metrics = lifecycle.updateComponent(component, {
                hookTrigger: Math.random(),
                updateId: update,
            });
            updateMetrics.push(metrics);
        }
    });

    // Error boundary simulation
    bench("error boundaries and recovery", () => {
        const lifecycle = new MockComponentLifecycle();
        const errorMetrics: LifecycleMetrics[] = [];

        // Create components
        const components: ComponentInstance[] = [];
        for (let i = 0; i < 50; i++) {
            const component = lifecycle.createComponent("ErrorProneComponent", {
                id: `error-prone-${i}`,
                errorRate: Math.random(),
            });
            lifecycle.mountComponent(component);
            components.push(component);
        }

        // Simulate errors and recovery
        for (let i = 0; i < 100; i++) {
            const component =
                components[Math.floor(Math.random() * components.length)];
            const error = new Error(`Simulated error ${i}`);

            const metrics = lifecycle.handleComponentError(component, error);
            errorMetrics.push(metrics);
        }
    });

    // Performance analysis benchmark
    bench("lifecycle performance analysis", () => {
        const lifecycle = new MockComponentLifecycle();

        // App initialization
        const initializeApp = () => {
            const app = lifecycle.createComponent("App", { id: "app" });
            lifecycle.mountComponent(app);
            return app;
        };

        // Route changes (mount/unmount pages)
        const simulateRouteChanges = (app: ComponentInstance) => {
            for (let i = 0; i < 5; i++) {
                const page = lifecycle.createComponent(
                    "Page",
                    { id: `page-${i}`, route: `/page${i}` },
                    app
                );
                lifecycle.mountComponent(page);

                // Simulate user interactions
                for (let j = 0; j < 10; j++) {
                    lifecycle.updateComponent(page, {
                        userAction: `action-${j}`,
                        timestamp: Date.now(),
                    });
                }

                lifecycle.unmountComponent(page);
            }
        };

        // Memory and performance analysis
        const analyzePerformance = () => lifecycle.getLifecycleStatistics();

        const app = initializeApp();
        simulateRouteChanges(app);
        const finalStats = analyzePerformance();
    });
});

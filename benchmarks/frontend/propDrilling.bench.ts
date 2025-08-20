/**
 * Performance benchmarks for React prop drilling operations Tests the
 * performance impact of passing props through multiple component layers
 */

import { bench, describe } from "vitest";

// Interface definitions for prop drilling
interface ComponentProps {
    [key: string]: any;
    id: string;
    depth: number;
    children?: ComponentInstance[];
}

interface ComponentInstance {
    id: string;
    type: string;
    props: ComponentProps;
    depth: number;
    parent: ComponentInstance | null;
    children: ComponentInstance[];
    propPath: string[];
    renderTime: number;
    propProcessingTime: number;
    totalProps: number;
    inheritedProps: number;
    ownProps: number;
}

interface PropTransfer {
    source: string;
    target: string;
    propName: string;
    propValue: any;
    transferTime: number;
    transformations: PropTransformation[];
}

interface PropTransformation {
    type: "rename" | "merge" | "split" | "filter" | "compute";
    input: any;
    output: any;
    processingTime: number;
}

interface PropAnalysis {
    componentId: string;
    depth: number;
    totalPropBytes: number;
    uniqueProps: number;
    duplicatedProps: number;
    propTransferCount: number;
    renderImpact: number;
    memoryUsage: number;
}

interface PropDrillingMetrics {
    maxDepth: number;
    totalComponents: number;
    totalPropTransfers: number;
    averagePropCount: number;
    propDuplicationRatio: number;
    renderPerformanceImpact: number;
    memoryOverhead: number;
    totalProcessingTime: number;
}

// Mock component hierarchy system
class MockPropDrillingSystem {
    private components = new Map<string, ComponentInstance>();
    private propTransfers: PropTransfer[] = [];
    private propAnalyses: PropAnalysis[] = [];
    private nextId = 0;

    // Component creation
    createComponent(
        type: string,
        ownProps: ComponentProps,
        parent: ComponentInstance | null = null
    ): ComponentInstance {
        const depth = parent ? parent.depth + 1 : 0;
        const inheritedProps = parent
            ? this.inheritPropsFromParent(parent, ownProps)
            : {};
        const allProps = { ...inheritedProps, ...ownProps, depth };

        const component: ComponentInstance = {
            id: `${type}-${this.nextId++}`,
            type,
            props: allProps,
            depth,
            parent,
            children: [],
            propPath: parent ? [...parent.propPath, type] : [type],
            renderTime: 0,
            propProcessingTime: 0,
            totalProps: Object.keys(allProps).length,
            inheritedProps: Object.keys(inheritedProps).length,
            ownProps: Object.keys(ownProps).length,
        };

        if (parent) {
            parent.children.push(component);
            this.recordPropTransfer(parent, component, allProps);
        }

        this.components.set(component.id, component);
        return component;
    }

    private inheritPropsFromParent(
        parent: ComponentInstance,
        ownProps: ComponentProps
    ): Partial<ComponentProps> {
        const startTime = performance.now();
        const inherited: Partial<ComponentProps> = {};

        // Simulate prop inheritance patterns
        const inheritanceRules = [
            // Theme props
            { pattern: /^theme/, inherit: true },
            { pattern: /^color/, inherit: true },
            { pattern: /^size/, inherit: true },

            // User context props
            { pattern: /^user/, inherit: true },
            { pattern: /^auth/, inherit: true },

            // Configuration props
            { pattern: /^config/, inherit: true },
            { pattern: /^feature/, inherit: true },

            // Event handlers (selective inheritance)
            { pattern: /^on[A-Z]/, inherit: Math.random() > 0.7 },

            // Data props
            { pattern: /^data/, inherit: Math.random() > 0.5 },
        ];

        for (const [propName, propValue] of Object.entries(parent.props)) {
            // Skip if already defined in own props
            if (ownProps.hasOwnProperty(propName)) continue;

            // Apply inheritance rules
            for (const rule of inheritanceRules) {
                if (
                    rule.pattern.test(propName) &&
                    (rule.inherit === true ||
                        (typeof rule.inherit === "boolean" && rule.inherit))
                ) {
                    inherited[propName] = this.transformPropForInheritance(
                        propName,
                        propValue
                    );
                    break;
                }
            }
        }

        const endTime = performance.now();
        return inherited;
    }

    private transformPropForInheritance(propName: string, propValue: any): any {
        // Simulate prop transformation during inheritance
        if (typeof propValue === "object" && propValue !== null) {
            // Deep clone for objects to prevent mutation
            return JSON.parse(JSON.stringify(propValue));
        } else if (typeof propValue === "function") {
            // Wrap functions to track usage
            return (...args: any[]) => {
                const result = propValue(...args);
                return result;
            };
        }
        // Primitive values passed as-is
        return propValue;
    }

    private recordPropTransfer(
        source: ComponentInstance,
        target: ComponentInstance,
        transferredProps: ComponentProps
    ): void {
        const startTime = performance.now();

        for (const [propName, propValue] of Object.entries(transferredProps)) {
            const transformations: PropTransformation[] = [];

            // Simulate prop transformations
            if (Math.random() > 0.8) {
                // 20% chance of transformation
                transformations.push({
                    type: Math.random() > 0.5 ? "rename" : "compute",
                    input: propValue,
                    output: propValue,
                    processingTime: Math.random() * 0.5,
                });
            }

            const transfer: PropTransfer = {
                source: source.id,
                target: target.id,
                propName,
                propValue,
                transferTime: performance.now() - startTime,
                transformations,
            };

            this.propTransfers.push(transfer);
        }
    }

    // Render simulation with prop processing
    renderComponent(component: ComponentInstance): number {
        const startTime = performance.now();

        // Simulate prop processing overhead
        const propProcessingStart = performance.now();
        this.processPropsDuringRender(component);
        component.propProcessingTime = performance.now() - propProcessingStart;

        // Simulate actual rendering work
        const renderWork = this.simulateRenderWork(component);

        // Render children
        for (const child of component.children) {
            renderWork + this.renderComponent(child);
        }

        const endTime = performance.now();
        component.renderTime = endTime - startTime;

        return component.renderTime;
    }

    private processPropsDuringRender(component: ComponentInstance): void {
        // Simulate prop validation
        for (const [propName, propValue] of Object.entries(component.props)) {
            this.validateProp(propName, propValue);
        }

        // Simulate prop memoization checks
        for (let i = 0; i < component.totalProps; i++) {
            const memoCheck = Math.random() * 0.1;
        }

        // Simulate computed prop derivations
        const computedProps = Math.floor(component.totalProps * 0.3);
        for (let i = 0; i < computedProps; i++) {
            const computation = Math.random() * 0.5;
        }
    }

    private validateProp(propName: string, propValue: any): boolean {
        // Simulate prop validation overhead
        const validationWork = Math.random() * 0.1;

        // Simple validation rules
        if (propName.includes("id") && typeof propValue !== "string") {
            return false;
        }
        if (propName.includes("count") && typeof propValue !== "number") {
            return false;
        }
        if (propName.startsWith("on") && typeof propValue !== "function") {
            return false;
        }

        return true;
    }

    private simulateRenderWork(component: ComponentInstance): number {
        // Base render work
        let renderWork = Math.random() * 2;

        // Additional work based on prop count
        renderWork += component.totalProps * 0.1;

        // Additional work based on depth (prop drilling overhead)
        renderWork += component.depth * 0.2;

        return renderWork;
    }

    // Prop optimization strategies
    memoizeComponent(component: ComponentInstance): ComponentInstance {
        // Simulate memoization setup overhead
        const memoizationWork = Math.random() * 1;

        // Create memoized version
        const memoizedComponent = {
            ...component,
            id: `${component.id}-memoized`,
            renderTime: component.renderTime * 0.7, // Simulate performance improvement
        };

        return memoizedComponent;
    }

    usePropContext(
        rootComponent: ComponentInstance,
        contextProps: string[]
    ): {
        contextSize: number;
        affectedComponents: number;
        performanceImprovement: number;
    } {
        let contextSize = 0;
        let affectedComponents = 0;
        let totalImprovement = 0;

        const processComponent = (component: ComponentInstance) => {
            let componentImprovement = 0;

            // Check if component uses context props
            for (const propName of contextProps) {
                if (component.props.hasOwnProperty(propName)) {
                    contextSize += this.calculatePropSize(
                        component.props[propName]
                    );
                    componentImprovement += component.depth * 0.1; // Improvement based on depth
                    affectedComponents++;
                }
            }

            totalImprovement += componentImprovement;

            // Process children
            for (const child of component.children) {
                processComponent(child);
            }
        };

        processComponent(rootComponent);

        return {
            contextSize,
            affectedComponents,
            performanceImprovement: totalImprovement,
        };
    }

    private calculatePropSize(propValue: any): number {
        if (typeof propValue === "string") {
            return propValue.length * 2; // UTF-16 chars
        } else if (typeof propValue === "number") {
            return 8; // 64-bit number
        } else if (typeof propValue === "boolean") {
            return 1;
        } else if (typeof propValue === "object" && propValue !== null) {
            return JSON.stringify(propValue).length * 2;
        } else if (typeof propValue === "function") {
            return 100; // Estimated function size
        }
        return 4; // Default size
    }

    // Analysis and metrics
    analyzePropDrilling(rootComponent: ComponentInstance): PropAnalysis[] {
        const analyses: PropAnalysis[] = [];

        const analyzeComponent = (component: ComponentInstance) => {
            const propBytes = Object.entries(component.props).reduce(
                (total, [_, value]) => total + this.calculatePropSize(value),
                0
            );

            const uniqueProps = new Set(Object.keys(component.props)).size;
            const parentProps = component.parent
                ? Object.keys(component.parent.props)
                : [];
            const duplicatedProps = Object.keys(component.props).filter(
                (prop) => parentProps.includes(prop)
            ).length;

            const propTransferCount = this.propTransfers.filter(
                (transfer) => transfer.target === component.id
            ).length;

            const analysis: PropAnalysis = {
                componentId: component.id,
                depth: component.depth,
                totalPropBytes: propBytes,
                uniqueProps,
                duplicatedProps,
                propTransferCount,
                renderImpact: component.renderTime,
                memoryUsage: propBytes + component.children.length * 50, // Estimated
            };

            analyses.push(analysis);

            // Analyze children
            for (const child of component.children) {
                analyzeComponent(child);
            }
        };

        analyzeComponent(rootComponent);
        return analyses;
    }

    calculateMetrics(): PropDrillingMetrics {
        const allComponents = Array.from(this.components.values());

        const maxDepth = Math.max(...allComponents.map((c) => c.depth));
        const totalComponents = allComponents.length;
        const totalPropTransfers = this.propTransfers.length;
        const averagePropCount =
            allComponents.reduce((sum, c) => sum + c.totalProps, 0) /
            totalComponents;

        const totalInherited = allComponents.reduce(
            (sum, c) => sum + c.inheritedProps,
            0
        );
        const totalOwn = allComponents.reduce((sum, c) => sum + c.ownProps, 0);
        const propDuplicationRatio =
            totalInherited / (totalInherited + totalOwn);

        const renderPerformanceImpact = allComponents.reduce(
            (sum, c) => sum + c.renderTime,
            0
        );
        const memoryOverhead = this.propTransfers.reduce(
            (sum, t) => sum + this.calculatePropSize(t.propValue),
            0
        );

        const totalProcessingTime = allComponents.reduce(
            (sum, c) => sum + c.propProcessingTime,
            0
        );

        return {
            maxDepth,
            totalComponents,
            totalPropTransfers,
            averagePropCount,
            propDuplicationRatio,
            renderPerformanceImpact,
            memoryOverhead,
            totalProcessingTime,
        };
    }

    // Prop drilling optimization simulation
    optimizePropDrilling(
        rootComponent: ComponentInstance,
        strategy: "context" | "composition" | "memoization" | "state-lifting"
    ): {
        strategy: string;
        originalMetrics: PropDrillingMetrics;
        optimizedMetrics: PropDrillingMetrics;
        improvement: number;
    } {
        const originalMetrics = this.calculateMetrics();
        let optimizedMetrics: PropDrillingMetrics;

        switch (strategy) {
            case "context": {
                optimizedMetrics =
                    this.simulateContextOptimization(rootComponent);
                break;
            }
            case "composition": {
                optimizedMetrics =
                    this.simulateCompositionOptimization(rootComponent);
                break;
            }
            case "memoization": {
                optimizedMetrics =
                    this.simulateMemoizationOptimization(rootComponent);
                break;
            }
            case "state-lifting": {
                optimizedMetrics =
                    this.simulateStateLiftingOptimization(rootComponent);
                break;
            }
            default: {
                optimizedMetrics = originalMetrics;
            }
        }

        const improvement =
            ((originalMetrics.renderPerformanceImpact -
                optimizedMetrics.renderPerformanceImpact) /
                originalMetrics.renderPerformanceImpact) *
            100;

        return {
            strategy,
            originalMetrics,
            optimizedMetrics,
            improvement,
        };
    }

    private simulateContextOptimization(
        rootComponent: ComponentInstance
    ): PropDrillingMetrics {
        // Simulate moving commonly drilled props to context
        const originalMetrics = this.calculateMetrics();

        return {
            ...originalMetrics,
            propDuplicationRatio: originalMetrics.propDuplicationRatio * 0.6,
            renderPerformanceImpact:
                originalMetrics.renderPerformanceImpact * 0.8,
            memoryOverhead: originalMetrics.memoryOverhead * 1.1, // Context has slight overhead
        };
    }

    private simulateCompositionOptimization(
        rootComponent: ComponentInstance
    ): PropDrillingMetrics {
        // Simulate component composition to reduce prop drilling
        const originalMetrics = this.calculateMetrics();

        return {
            ...originalMetrics,
            totalPropTransfers: Math.floor(
                originalMetrics.totalPropTransfers * 0.7
            ),
            renderPerformanceImpact:
                originalMetrics.renderPerformanceImpact * 0.85,
            totalProcessingTime: originalMetrics.totalProcessingTime * 0.9,
        };
    }

    private simulateMemoizationOptimization(
        rootComponent: ComponentInstance
    ): PropDrillingMetrics {
        // Simulate React.memo and useMemo optimizations
        const originalMetrics = this.calculateMetrics();

        return {
            ...originalMetrics,
            renderPerformanceImpact:
                originalMetrics.renderPerformanceImpact * 0.75,
            totalProcessingTime: originalMetrics.totalProcessingTime * 0.8,
            memoryOverhead: originalMetrics.memoryOverhead * 1.05, // Memoization overhead
        };
    }

    private simulateStateLiftingOptimization(
        rootComponent: ComponentInstance
    ): PropDrillingMetrics {
        // Simulate lifting state to reduce prop passing
        const originalMetrics = this.calculateMetrics();

        return {
            ...originalMetrics,
            averagePropCount: originalMetrics.averagePropCount * 0.8,
            propDuplicationRatio: originalMetrics.propDuplicationRatio * 0.7,
            renderPerformanceImpact:
                originalMetrics.renderPerformanceImpact * 0.9,
        };
    }

    // Cleanup
    reset(): void {
        this.components.clear();
        this.propTransfers = [];
        this.propAnalyses = [];
        this.nextId = 0;
    }
}

describe("React Prop Drilling Performance", () => {
    // Helper function to create complex component hierarchies
    const createDeepHierarchy = (
        system: MockPropDrillingSystem,
        depth: number,
        breadth: number,
        propsCount: number
    ): ComponentInstance => {
        // Create root props
        const rootProps: ComponentProps = {
            id: "root",
            depth: 0,
            themeColor: "blue",
            themeSize: "medium",
            userRole: "admin",
            userPermissions: [
                "read",
                "write",
                "delete",
            ],
            configApiUrl: "https://api.example.com",
            configTimeout: 5000,
            featureFlags: {
                newUI: true,
                analytics: false,
                experimental: true,
            },
        };

        // Add additional random props
        for (let i = 0; i < propsCount; i++) {
            rootProps[`prop${i}`] = {
                value: Math.random() * 100,
                metadata: {
                    id: i,
                    timestamp: Date.now(),
                    data: Array.from({ length: 10 }, () => Math.random()),
                },
            };
        }

        const root = system.createComponent("RootComponent", rootProps);

        // Build hierarchy recursively
        const buildLevel = (
            parent: ComponentInstance,
            currentDepth: number
        ) => {
            if (currentDepth >= depth) return;

            for (let i = 0; i < breadth; i++) {
                const childProps: ComponentProps = {
                    id: `child-${currentDepth}-${i}`,
                    depth: currentDepth + 1,
                    localState: Math.random() * 50,
                    onClick: () =>
                        console.log(`Clicked child ${currentDepth}-${i}`),
                    onHover: () =>
                        console.log(`Hovered child ${currentDepth}-${i}`),
                };

                // Add some child-specific props that will be inherited
                if (Math.random() > 0.5) {
                    childProps.dataItems = Array.from(
                        { length: 5 },
                        (_, j) => ({
                            id: j,
                            value: Math.random(),
                        })
                    );
                }

                const child = system.createComponent(
                    `Level${currentDepth}Component`,
                    childProps,
                    parent
                );

                buildLevel(child, currentDepth + 1);
            }
        };

        buildLevel(root, 1);
        return root;
    };

    // Basic prop drilling benchmarks
    bench("prop drilling - shallow hierarchy", () => {
        const system = new MockPropDrillingSystem();
        const hierarchies: ComponentInstance[] = [];

        for (let i = 0; i < 50; i++) {
            const hierarchy = createDeepHierarchy(system, 3, 4, 10);
            system.renderComponent(hierarchy);
            hierarchies.push(hierarchy);
        }

        const metrics = system.calculateMetrics();
        system.reset();
    });

    bench("prop drilling - deep hierarchy", () => {
        const system = new MockPropDrillingSystem();
        const hierarchies: ComponentInstance[] = [];

        for (let i = 0; i < 20; i++) {
            const hierarchy = createDeepHierarchy(system, 8, 2, 15);
            system.renderComponent(hierarchy);
            hierarchies.push(hierarchy);
        }

        const metrics = system.calculateMetrics();
        system.reset();
    });

    bench("prop drilling - wide hierarchy", () => {
        const system = new MockPropDrillingSystem();
        const hierarchies: ComponentInstance[] = [];

        for (let i = 0; i < 30; i++) {
            const hierarchy = createDeepHierarchy(system, 4, 8, 12);
            system.renderComponent(hierarchy);
            hierarchies.push(hierarchy);
        }

        const metrics = system.calculateMetrics();
        system.reset();
    });

    // Prop volume impact benchmarks
    bench("prop drilling - lightweight props", () => {
        const system = new MockPropDrillingSystem();
        const hierarchies: ComponentInstance[] = [];

        for (let i = 0; i < 40; i++) {
            const hierarchy = createDeepHierarchy(system, 5, 3, 5);
            system.renderComponent(hierarchy);
            hierarchies.push(hierarchy);
        }

        const metrics = system.calculateMetrics();
        system.reset();
    });

    bench("prop drilling - heavyweight props", () => {
        const system = new MockPropDrillingSystem();
        const hierarchies: ComponentInstance[] = [];

        for (let i = 0; i < 25; i++) {
            const hierarchy = createDeepHierarchy(system, 5, 3, 30);
            system.renderComponent(hierarchy);
            hierarchies.push(hierarchy);
        }

        const metrics = system.calculateMetrics();
        system.reset();
    });

    // Prop inheritance patterns
    bench("prop inheritance - complex patterns", () => {
        const system = new MockPropDrillingSystem();
        const results: PropAnalysis[][] = [];

        for (let test = 0; test < 30; test++) {
            const hierarchy = createDeepHierarchy(system, 6, 3, 20);
            system.renderComponent(hierarchy);

            const analysis = system.analyzePropDrilling(hierarchy);
            results.push(analysis);
        }

        system.reset();
    });

    // Context optimization simulation
    bench("context optimization - prop reduction", () => {
        const system = new MockPropDrillingSystem();
        const optimizationResults: {
            strategy: string;
            improvement: number;
        }[] = [];

        for (let test = 0; test < 20; test++) {
            const hierarchy = createDeepHierarchy(system, 6, 3, 15);
            system.renderComponent(hierarchy);

            // Test context optimization
            const contextResult = system.optimizePropDrilling(
                hierarchy,
                "context"
            );
            optimizationResults.push({
                strategy: "context",
                improvement: contextResult.improvement,
            });

            system.reset();
        }
    });

    bench("composition optimization - structural changes", () => {
        const system = new MockPropDrillingSystem();
        const optimizationResults: {
            strategy: string;
            improvement: number;
        }[] = [];

        for (let test = 0; test < 20; test++) {
            const hierarchy = createDeepHierarchy(system, 5, 4, 12);
            system.renderComponent(hierarchy);

            // Test composition optimization
            const compositionResult = system.optimizePropDrilling(
                hierarchy,
                "composition"
            );
            optimizationResults.push({
                strategy: "composition",
                improvement: compositionResult.improvement,
            });

            system.reset();
        }
    });

    // Memoization impact
    bench("memoization - component optimization", () => {
        const system = new MockPropDrillingSystem();
        const memoizationResults: ComponentInstance[] = [];

        for (let test = 0; test < 100; test++) {
            const hierarchy = createDeepHierarchy(system, 4, 4, 10);

            // Collect all components for memoization
            const allComponents: ComponentInstance[] = [];
            const collectComponents = (component: ComponentInstance) => {
                allComponents.push(component);
                component.children.forEach(collectComponents);
            };
            collectComponents(hierarchy);

            // Memoize random components
            const componentsToMemoize = allComponents.filter(
                () => Math.random() > 0.7
            );
            const memoizedComponents = componentsToMemoize.map((c) =>
                system.memoizeComponent(c)
            );

            memoizationResults.push(...memoizedComponents);
        }

        system.reset();
    });

    // Prop context usage
    bench("prop context - usage patterns", () => {
        const system = new MockPropDrillingSystem();
        const contextResults: {
            contextSize: number;
            affectedComponents: number;
            performanceImprovement: number;
        }[] = [];

        for (let test = 0; test < 25; test++) {
            const hierarchy = createDeepHierarchy(system, 5, 3, 18);
            system.renderComponent(hierarchy);

            // Define context props
            const contextProps = [
                "themeColor",
                "themeSize",
                "userRole",
                "userPermissions",
                "configApiUrl",
                "featureFlags",
            ];

            const contextResult = system.usePropContext(
                hierarchy,
                contextProps
            );
            contextResults.push(contextResult);
        }

        system.reset();
    });

    // Performance analysis across strategies
    bench("optimization strategies - comparison", () => {
        const system = new MockPropDrillingSystem();
        const strategyComparisons: {
            context: number;
            composition: number;
            memoization: number;
            stateLiing: number;
        }[] = [];

        for (let test = 0; test < 15; test++) {
            const hierarchy = createDeepHierarchy(system, 6, 3, 20);
            system.renderComponent(hierarchy);

            const strategies = [
                "context",
                "composition",
                "memoization",
                "state-lifting",
            ] as const;
            const improvements = strategies.map((strategy) => {
                const result = system.optimizePropDrilling(hierarchy, strategy);
                return result.improvement;
            });

            strategyComparisons.push({
                context: improvements[0],
                composition: improvements[1],
                memoization: improvements[2],
                stateLiing: improvements[3],
            });

            system.reset();
        }
    });

    // Memory overhead analysis
    bench("memory overhead - prop duplication", () => {
        const system = new MockPropDrillingSystem();
        const memoryAnalyses: PropAnalysis[][] = [];

        for (let test = 0; test < 30; test++) {
            // Create hierarchy with intentional prop duplication
            const hierarchy = createDeepHierarchy(system, 7, 2, 25);
            system.renderComponent(hierarchy);

            const analysis = system.analyzePropDrilling(hierarchy);
            memoryAnalyses.push(analysis);
        }

        // Calculate total memory overhead
        const totalMemoryOverhead = memoryAnalyses
            .flat()
            .reduce((sum, analysis) => sum + analysis.memoryUsage, 0);

        system.reset();
    });

    // Stress test - extreme prop drilling
    bench("stress test - extreme prop drilling", () => {
        const system = new MockPropDrillingSystem();
        const stressResults: {
            components: number;
            propTransfers: number;
            renderTime: number;
            memoryUsage: number;
        }[] = [];

        for (let test = 0; test < 10; test++) {
            // Create very deep and wide hierarchy with many props
            const hierarchy = createDeepHierarchy(system, 10, 4, 40);
            const renderTime = system.renderComponent(hierarchy);

            const metrics = system.calculateMetrics();

            stressResults.push({
                components: metrics.totalComponents,
                propTransfers: metrics.totalPropTransfers,
                renderTime: metrics.renderPerformanceImpact,
                memoryUsage: metrics.memoryOverhead,
            });

            system.reset();
        }
    });
});

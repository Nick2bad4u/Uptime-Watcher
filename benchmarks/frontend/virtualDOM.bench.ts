/**
 * Performance benchmarks for React Virtual DOM operations Tests the performance
 * of virtual DOM diffing, patching, and reconciliation
 */

import { bench, describe } from "vitest";

// Interface definitions for Virtual DOM
interface VNode {
    type: string | ComponentConstructor;
    props: VNodeProps;
    children: VNode[];
    key?: string | number;
    ref?: VNodeRef;
    __vnode: true;
    __internal: {
        id: string;
        depth: number;
        parentId?: string;
        fiber?: FiberNode;
    };
}

interface VNodeProps {
    [key: string]: any;
    className?: string;
    style?: Record<string, string | number>;
    onClick?: (event: Event) => void;
    onChange?: (event: Event) => void;
    children?: VNode | VNode[] | string | number;
}

interface VNodeRef {
    current: Element | null;
}

interface ComponentConstructor {
    (props: VNodeProps): VNode;
    displayName?: string;
}

interface FiberNode {
    id: string;
    type: string | ComponentConstructor;
    props: VNodeProps;
    stateNode: Element | null;
    child: FiberNode | null;
    sibling: FiberNode | null;
    parent: FiberNode | null;
    alternate: FiberNode | null;
    effectTag: EffectTag;
    updateQueue: Update[];
    memoizedProps: VNodeProps;
    memoizedState: any;
    priority: number;
    expirationTime: number;
}

type EffectTag =
    | "NoEffect"
    | "Placement"
    | "Update"
    | "PlacementAndUpdate"
    | "Deletion"
    | "ContentReset"
    | "Callback"
    | "Snapshot"
    | "Passive";

interface Update {
    id: string;
    type: "state" | "props" | "callback";
    payload: any;
    callback?: () => void;
    priority: number;
    timestamp: number;
}

interface DiffResult {
    patches: Patch[];
    deletions: FiberNode[];
    insertions: FiberNode[];
    updates: FiberNode[];
    moveOperations: { from: number; to: number; node: FiberNode }[];
    totalOperations: number;
    diffTime: number;
}

interface Patch {
    type: "INSERT" | "DELETE" | "UPDATE" | "MOVE" | "REPLACE";
    targetId: string;
    parentId?: string;
    index?: number;
    newNode?: VNode;
    oldNode?: VNode;
    props?: Partial<VNodeProps>;
    position?: { from: number; to: number };
}

interface ReconcilerMetrics {
    nodesProcessed: number;
    patchesGenerated: number;
    reconciliationTime: number;
    memoryUsage: number;
    reusedNodes: number;
    createdNodes: number;
    deletedNodes: number;
    maxDepth: number;
}

// Mock Virtual DOM implementation
class MockVirtualDOM {
    private nodeIdCounter = 0;
    private fiberRoot: FiberNode | null = null;
    private currentTree: VNode | null = null;
    private updateQueue: Update[] = [];
    private reconcilerMetrics: ReconcilerMetrics = {
        nodesProcessed: 0,
        patchesGenerated: 0,
        reconciliationTime: 0,
        memoryUsage: 0,
        reusedNodes: 0,
        createdNodes: 0,
        deletedNodes: 0,
        maxDepth: 0,
    };

    // Virtual node creation
    createElement(
        type: string | ComponentConstructor,
        props: VNodeProps | null = null,
        ...children: (VNode | string | number)[]
    ): VNode {
        const normalizedProps = props || {};
        const normalizedChildren = this.normalizeChildren(children);

        const vnode: VNode = {
            type,
            props: { ...normalizedProps, children: normalizedChildren },
            children: normalizedChildren,
            key: normalizedProps.key,
            ref: normalizedProps.ref,
            __vnode: true,
            __internal: {
                id: `vnode-${this.nodeIdCounter++}`,
                depth: 0,
            },
        };

        return vnode;
    }

    private normalizeChildren(children: (VNode | string | number)[]): VNode[] {
        const normalized: VNode[] = [];

        for (const child of children) {
            if (typeof child === "string" || typeof child === "number") {
                normalized.push(
                    this.createElement("text", { value: child.toString() })
                );
            } else if (Array.isArray(child)) {
                normalized.push(...this.normalizeChildren(child));
            } else if (child && typeof child === "object" && child.__vnode) {
                normalized.push(child);
            }
        }

        return normalized;
    }

    // Component creation helpers
    createComponent(
        name: string,
        render: (props: VNodeProps) => VNode
    ): ComponentConstructor {
        const component = (props: VNodeProps) => render(props);
        component.displayName = name;
        return component;
    }

    // Diffing algorithm
    diff(oldTree: VNode | null, newTree: VNode | null): DiffResult {
        const startTime = performance.now();
        const patches: Patch[] = [];
        const deletions: FiberNode[] = [];
        const insertions: FiberNode[] = [];
        const updates: FiberNode[] = [];
        const moveOperations: { from: number; to: number; node: FiberNode }[] =
            [];

        if (!oldTree && !newTree) {
            return this.createDiffResult(
                patches,
                deletions,
                insertions,
                updates,
                moveOperations,
                startTime
            );
        }

        if (!oldTree && newTree) {
            // Full tree insertion
            this.diffInsertTree(newTree, patches, insertions);
        } else if (oldTree && !newTree) {
            // Full tree deletion
            this.diffDeleteTree(oldTree, patches, deletions);
        } else if (oldTree && newTree) {
            // Tree comparison
            this.diffTrees(
                oldTree,
                newTree,
                patches,
                deletions,
                insertions,
                updates,
                moveOperations
            );
        }

        return this.createDiffResult(
            patches,
            deletions,
            insertions,
            updates,
            moveOperations,
            startTime
        );
    }

    private diffTrees(
        oldNode: VNode,
        newNode: VNode,
        patches: Patch[],
        deletions: FiberNode[],
        insertions: FiberNode[],
        updates: FiberNode[],
        moveOperations: { from: number; to: number; node: FiberNode }[]
    ): void {
        // Type comparison
        if (oldNode.type !== newNode.type) {
            patches.push({
                type: "REPLACE",
                targetId: oldNode.__internal.id,
                newNode,
                oldNode,
            });
            return;
        }

        // Props comparison
        if (this.shouldUpdateProps(oldNode.props, newNode.props)) {
            patches.push({
                type: "UPDATE",
                targetId: oldNode.__internal.id,
                props: this.diffProps(oldNode.props, newNode.props),
            });
        }

        // Children comparison
        this.diffChildren(
            oldNode.children,
            newNode.children,
            oldNode.__internal.id,
            patches,
            deletions,
            insertions,
            updates,
            moveOperations
        );
    }

    private diffChildren(
        oldChildren: VNode[],
        newChildren: VNode[],
        parentId: string,
        patches: Patch[],
        deletions: FiberNode[],
        insertions: FiberNode[],
        updates: FiberNode[],
        moveOperations: { from: number; to: number; node: FiberNode }[]
    ): void {
        const oldKeyed = new Map<
            string | number,
            { node: VNode; index: number }
        >();
        const newKeyed = new Map<
            string | number,
            { node: VNode; index: number }
        >();

        // Build key maps
        oldChildren.forEach((child, index) => {
            if (child.key !== undefined) {
                oldKeyed.set(child.key, { node: child, index });
            }
        });

        newChildren.forEach((child, index) => {
            if (child.key !== undefined) {
                newKeyed.set(child.key, { node: child, index });
            }
        });

        // Process new children
        newChildren.forEach((newChild, newIndex) => {
            if (newChild.key === undefined) {
                // Non-keyed element
                const oldChild = oldChildren[newIndex];
                if (oldChild) {
                    this.diffTrees(
                        oldChild,
                        newChild,
                        patches,
                        deletions,
                        insertions,
                        updates,
                        moveOperations
                    );
                } else {
                    patches.push({
                        type: "INSERT",
                        targetId: newChild.__internal.id,
                        parentId,
                        index: newIndex,
                        newNode: newChild,
                    });
                }
            } else {
                const oldEntry = oldKeyed.get(newChild.key);
                if (oldEntry) {
                    // Keyed element moved
                    if (oldEntry.index !== newIndex) {
                        moveOperations.push({
                            from: oldEntry.index,
                            to: newIndex,
                            node: oldEntry.node.__internal.fiber!,
                        });
                    }
                    this.diffTrees(
                        oldEntry.node,
                        newChild,
                        patches,
                        deletions,
                        insertions,
                        updates,
                        moveOperations
                    );
                } else {
                    // New keyed element
                    patches.push({
                        type: "INSERT",
                        targetId: newChild.__internal.id,
                        parentId,
                        index: newIndex,
                        newNode: newChild,
                    });
                }
            }
        });

        // Process deletions
        oldChildren.forEach((oldChild, oldIndex) => {
            if (oldChild.key !== undefined) {
                if (!newKeyed.has(oldChild.key)) {
                    patches.push({
                        type: "DELETE",
                        targetId: oldChild.__internal.id,
                        parentId,
                        oldNode: oldChild,
                    });
                }
            } else if (oldIndex >= newChildren.length) {
                patches.push({
                    type: "DELETE",
                    targetId: oldChild.__internal.id,
                    parentId,
                    oldNode: oldChild,
                });
            }
        });
    }

    private shouldUpdateProps(
        oldProps: VNodeProps,
        newProps: VNodeProps
    ): boolean {
        const oldKeys = Object.keys(oldProps);
        const newKeys = Object.keys(newProps);

        if (oldKeys.length !== newKeys.length) {
            return true;
        }

        for (const key of oldKeys) {
            if (oldProps[key] !== newProps[key]) {
                return true;
            }
        }

        return false;
    }

    private diffProps(
        oldProps: VNodeProps,
        newProps: VNodeProps
    ): Partial<VNodeProps> {
        const changes: Partial<VNodeProps> = {};
        const allKeys = new Set([
            ...Object.keys(oldProps),
            ...Object.keys(newProps),
        ]);

        for (const key of allKeys) {
            if (oldProps[key] !== newProps[key]) {
                changes[key] = newProps[key];
            }
        }

        return changes;
    }

    private diffInsertTree(
        node: VNode,
        patches: Patch[],
        insertions: FiberNode[]
    ): void {
        patches.push({
            type: "INSERT",
            targetId: node.__internal.id,
            newNode: node,
        });

        node.children.forEach((child) => {
            this.diffInsertTree(child, patches, insertions);
        });
    }

    private diffDeleteTree(
        node: VNode,
        patches: Patch[],
        deletions: FiberNode[]
    ): void {
        patches.push({
            type: "DELETE",
            targetId: node.__internal.id,
            oldNode: node,
        });

        node.children.forEach((child) => {
            this.diffDeleteTree(child, patches, deletions);
        });
    }

    private createDiffResult(
        patches: Patch[],
        deletions: FiberNode[],
        insertions: FiberNode[],
        updates: FiberNode[],
        moveOperations: { from: number; to: number; node: FiberNode }[],
        startTime: number
    ): DiffResult {
        const endTime = performance.now();

        return {
            patches,
            deletions,
            insertions,
            updates,
            moveOperations,
            totalOperations: patches.length + moveOperations.length,
            diffTime: endTime - startTime,
        };
    }

    // Reconciliation
    reconcile(diffResult: DiffResult): ReconcilerMetrics {
        const startTime = performance.now();

        this.reconcilerMetrics.nodesProcessed = 0;
        this.reconcilerMetrics.patchesGenerated = diffResult.patches.length;

        // Apply patches
        for (const patch of diffResult.patches) {
            this.applyPatch(patch);
            this.reconcilerMetrics.nodesProcessed++;
        }

        // Apply move operations
        for (const moveOp of diffResult.moveOperations) {
            this.applyMoveOperation(moveOp);
            this.reconcilerMetrics.nodesProcessed++;
        }

        const endTime = performance.now();
        this.reconcilerMetrics.reconciliationTime = endTime - startTime;
        this.reconcilerMetrics.memoryUsage = Math.random() * 1000; // Simulated

        return { ...this.reconcilerMetrics };
    }

    private applyPatch(patch: Patch): void {
        switch (patch.type) {
            case "INSERT": {
                this.handleInsertPatch(patch);
                this.reconcilerMetrics.createdNodes++;
                break;
            }
            case "DELETE": {
                this.handleDeletePatch(patch);
                this.reconcilerMetrics.deletedNodes++;
                break;
            }
            case "UPDATE": {
                this.handleUpdatePatch(patch);
                break;
            }
            case "MOVE": {
                this.handleMovePatch(patch);
                break;
            }
            case "REPLACE": {
                this.handleReplacePatch(patch);
                this.reconcilerMetrics.deletedNodes++;
                this.reconcilerMetrics.createdNodes++;
                break;
            }
        }
    }

    private handleInsertPatch(patch: Patch): void {
        // Simulate DOM insertion
        const insertionWork = Math.random() * 3;

        if (patch.newNode) {
            // Create fiber node
            const fiber = this.createFiberNode(patch.newNode);
            patch.newNode.__internal.fiber = fiber;
        }
    }

    private handleDeletePatch(patch: Patch): void {
        // Simulate DOM deletion and cleanup
        const deletionWork = Math.random() * 2;

        if (patch.oldNode) {
            // Cleanup fiber and effects
            this.cleanupFiberNode(patch.oldNode.__internal.fiber);
        }
    }

    private handleUpdatePatch(patch: Patch): void {
        // Simulate DOM property updates
        const updateWork = Math.random() * 1.5;

        if (patch.props) {
            // Update properties
            const propCount = Object.keys(patch.props).length;
            const propUpdateWork = propCount * Math.random();
        }
    }

    private handleMovePatch(patch: Patch): void {
        // Simulate DOM node movement
        const moveWork = Math.random() * 2.5;
    }

    private handleReplacePatch(patch: Patch): void {
        // Simulate node replacement
        if (patch.oldNode) {
            this.handleDeletePatch({ ...patch, type: "DELETE" });
        }
        if (patch.newNode) {
            this.handleInsertPatch({ ...patch, type: "INSERT" });
        }
    }

    private applyMoveOperation(moveOp: {
        from: number;
        to: number;
        node: FiberNode;
    }): void {
        // Simulate DOM node reordering
        const moveWork = Math.random() * 3;
    }

    private createFiberNode(vnode: VNode): FiberNode {
        const fiber: FiberNode = {
            id: `fiber-${this.nodeIdCounter++}`,
            type: vnode.type,
            props: vnode.props,
            stateNode: null,
            child: null,
            sibling: null,
            parent: null,
            alternate: null,
            effectTag: "NoEffect",
            updateQueue: [],
            memoizedProps: vnode.props,
            memoizedState: null,
            priority: 1,
            expirationTime: Date.now() + 1000,
        };

        return fiber;
    }

    // Public method to create fiber nodes for testing
    public createPublicFiberNode(vnode: VNode): FiberNode {
        return this.createFiberNode(vnode);
    }

    private cleanupFiberNode(fiber?: FiberNode): void {
        if (!fiber) return;

        // Simulate cleanup work
        const cleanupWork = Math.random() * 2;

        // Cleanup children
        let child = fiber.child;
        while (child) {
            this.cleanupFiberNode(child);
            child = child.sibling;
        }
    }

    // Fiber scheduling simulation
    scheduleWork(fiber: FiberNode, expirationTime: number): void {
        fiber.expirationTime = expirationTime;

        // Add to work queue
        this.updateQueue.push({
            id: `update-${Date.now()}-${Math.random()}`,
            type: "state",
            payload: null,
            priority: this.calculatePriority(expirationTime),
            timestamp: Date.now(),
        });
    }

    private calculatePriority(expirationTime: number): number {
        const now = Date.now();
        const timeLeft = expirationTime - now;

        if (timeLeft < 0) return 1; // Expired - highest priority
        if (timeLeft < 100) return 2; // High priority
        if (timeLeft < 1000) return 3; // Normal priority
        return 4; // Low priority
    }

    // Batch processing
    processWorkQueue(timeSlice: number = 16): {
        processed: number;
        remaining: number;
        timeUsed: number;
    } {
        const startTime = performance.now();
        let processed = 0;

        while (
            this.updateQueue.length > 0 &&
            performance.now() - startTime < timeSlice
        ) {
            const update = this.updateQueue.shift()!;

            // Process update
            const processingTime = Math.random() * 2;
            processed++;
        }

        const timeUsed = performance.now() - startTime;

        return {
            processed,
            remaining: this.updateQueue.length,
            timeUsed,
        };
    }

    // Memory optimization
    optimizeMemory(): {
        nodesOptimized: number;
        memoryFreed: number;
        optimizationTime: number;
    } {
        const startTime = performance.now();
        let nodesOptimized = 0;
        let memoryFreed = 0;

        // Simulate memory optimization
        for (let i = 0; i < 100; i++) {
            const optimizationWork = Number(Math.random());
            nodesOptimized++;
            memoryFreed += Math.random() * 10;
        }

        const endTime = performance.now();

        return {
            nodesOptimized,
            memoryFreed,
            optimizationTime: endTime - startTime,
        };
    }

    // Statistics
    getStatistics(): {
        totalNodes: number;
        activeUpdates: number;
        reconcilerMetrics: ReconcilerMetrics;
        memoryUsage: number;
    } {
        return {
            totalNodes: this.nodeIdCounter,
            activeUpdates: this.updateQueue.length,
            reconcilerMetrics: this.reconcilerMetrics,
            memoryUsage: Math.random() * 2000,
        };
    }
}

describe("React Virtual DOM Performance", () => {
    // Helper function to create complex trees
    const createComplexTree = (
        vdom: MockVirtualDOM,
        depth: number,
        breadth: number
    ): VNode => {
        if (depth === 0) {
            return vdom.createElement(
                "div",
                {
                    className: "leaf",
                    "data-depth": depth,
                },
                `Leaf node ${Math.random()}`
            );
        }

        const children: VNode[] = [];
        for (let i = 0; i < breadth; i++) {
            children.push(createComplexTree(vdom, depth - 1, breadth));
        }

        return vdom.createElement(
            "div",
            {
                className: `node-depth-${depth}`,
                "data-depth": depth,
                style: {
                    padding: `${depth}px`,
                    margin: `${depth * 2}px`,
                    backgroundColor: `hsl(${depth * 60}, 50%, 80%)`,
                },
            },
            ...children
        );
    };

    // Virtual DOM creation benchmarks
    bench("vnode creation - simple elements", () => {
        const vdom = new MockVirtualDOM();
        const vnodes: VNode[] = [];

        for (let i = 0; i < 1000; i++) {
            const vnode = vdom.createElement(
                "div",
                {
                    id: `element-${i}`,
                    className: "test-element",
                    "data-index": i,
                    style: {
                        width: `${Math.random() * 100}px`,
                        height: `${Math.random() * 50}px`,
                        color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                    },
                    onClick: () => console.log(`Clicked ${i}`),
                },
                `Element content ${i}`
            );
            vnodes.push(vnode);
        }
    });

    bench("vnode creation - complex nested structures", () => {
        const vdom = new MockVirtualDOM();
        const complexTrees: VNode[] = [];

        for (let i = 0; i < 50; i++) {
            const tree = createComplexTree(vdom, 5, 3);
            complexTrees.push(tree);
        }
    });

    bench("vnode creation - lists with keys", () => {
        const vdom = new MockVirtualDOM();
        const lists: VNode[] = [];

        for (let listIndex = 0; listIndex < 20; listIndex++) {
            const items: VNode[] = [];

            for (let i = 0; i < 100; i++) {
                items.push(
                    vdom.createElement(
                        "li",
                        {
                            key: `item-${listIndex}-${i}`,
                            className: "list-item",
                            "data-list": listIndex,
                            "data-item": i,
                        },
                        vdom.createElement(
                            "span",
                            { className: "item-text" },
                            `Item ${i}`
                        ),
                        vdom.createElement(
                            "button",
                            {
                                className: "item-action",
                                onClick: () => {},
                            },
                            "Action"
                        )
                    )
                );
            }

            const list = vdom.createElement(
                "ul",
                {
                    key: `list-${listIndex}`,
                    className: "item-list",
                    "data-list-id": listIndex,
                },
                ...items
            );

            lists.push(list);
        }
    });

    // Diffing algorithm benchmarks
    bench("diffing - simple prop changes", () => {
        const vdom = new MockVirtualDOM();
        const diffResults: DiffResult[] = [];

        for (let i = 0; i < 200; i++) {
            const oldTree = vdom.createElement("div", {
                id: `element-${i}`,
                className: "old-class",
                style: { color: "red" },
                value: i,
            });

            const newTree = vdom.createElement("div", {
                id: `element-${i}`,
                className: "new-class",
                style: { color: "blue", backgroundColor: "yellow" },
                value: i + 1,
                newProp: "added",
            });

            const diffResult = vdom.diff(oldTree, newTree);
            diffResults.push(diffResult);
        }
    });

    bench("diffing - child reordering", () => {
        const vdom = new MockVirtualDOM();
        const diffResults: DiffResult[] = [];

        for (let test = 0; test < 50; test++) {
            // Create original list
            const oldChildren: VNode[] = [];
            for (let i = 0; i < 20; i++) {
                oldChildren.push(
                    vdom.createElement(
                        "div",
                        {
                            key: `item-${i}`,
                            id: `item-${i}`,
                        },
                        `Item ${i}`
                    )
                );
            }
            const oldTree = vdom.createElement("div", {}, ...oldChildren);

            // Create reordered list
            const newChildren = Array.from(oldChildren);
            // Shuffle array
            for (let i = newChildren.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newChildren[i], newChildren[j]] = [
                    newChildren[j],
                    newChildren[i],
                ];
            }
            const newTree = vdom.createElement("div", {}, ...newChildren);

            const diffResult = vdom.diff(oldTree, newTree);
            diffResults.push(diffResult);
        }
    });

    bench("diffing - complex tree changes", () => {
        const vdom = new MockVirtualDOM();
        const diffResults: DiffResult[] = [];

        for (let test = 0; test < 30; test++) {
            const oldTree = createComplexTree(vdom, 4, 3);

            // Create modified tree
            const newTree = createComplexTree(vdom, 4, 3);

            // Randomly modify some nodes
            const modifyTree = (node: VNode): VNode => {
                if (Math.random() > 0.7) {
                    return vdom.createElement(
                        node.type as string,
                        {
                            ...node.props,
                            className: `${node.props.className}-modified`,
                            "data-modified": true,
                            style: {
                                ...node.props.style,
                                border: "2px solid red",
                            },
                        },
                        ...node.children.map((child) => modifyTree(child))
                    );
                }
                return vdom.createElement(
                    node.type as string,
                    node.props,
                    ...node.children.map((child) => modifyTree(child))
                );
            };

            const modifiedTree = modifyTree(newTree);
            const diffResult = vdom.diff(oldTree, modifiedTree);
            diffResults.push(diffResult);
        }
    });

    bench("diffing - list insertions and deletions", () => {
        const vdom = new MockVirtualDOM();
        const diffResults: DiffResult[] = [];

        for (let test = 0; test < 100; test++) {
            // Original list
            const oldItems: VNode[] = [];
            for (let i = 0; i < 15; i++) {
                oldItems.push(
                    vdom.createElement(
                        "li",
                        {
                            key: `item-${i}`,
                            className: "list-item",
                        },
                        `Original Item ${i}`
                    )
                );
            }
            const oldTree = vdom.createElement("ul", {}, ...oldItems);

            // Modified list with insertions and deletions
            const newItems: VNode[] = [];

            // Keep some original items
            for (let i = 0; i < 15; i++) {
                if (Math.random() > 0.3) {
                    // 70% chance to keep
                    newItems.push(oldItems[i]);
                }
            }

            // Add new items
            for (let i = 0; i < 10; i++) {
                if (Math.random() > 0.5) {
                    // 50% chance to add
                    newItems.push(
                        vdom.createElement(
                            "li",
                            {
                                key: `new-item-${i}`,
                                className: "list-item new-item",
                            },
                            `New Item ${i}`
                        )
                    );
                }
            }

            // Shuffle the new items
            for (let i = newItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
            }

            const newTree = vdom.createElement("ul", {}, ...newItems);
            const diffResult = vdom.diff(oldTree, newTree);
            diffResults.push(diffResult);
        }
    });

    // Reconciliation benchmarks
    bench("reconciliation - patch application", () => {
        const vdom = new MockVirtualDOM();
        const reconcilerMetrics: ReconcilerMetrics[] = [];

        for (let i = 0; i < 100; i++) {
            const oldTree = createComplexTree(vdom, 3, 4);
            const newTree = createComplexTree(vdom, 3, 4);

            const diffResult = vdom.diff(oldTree, newTree);
            const metrics = vdom.reconcile(diffResult);
            reconcilerMetrics.push(metrics);
        }
    });

    bench("reconciliation - fiber tree updates", () => {
        const vdom = new MockVirtualDOM();
        const workResults: {
            processed: number;
            remaining: number;
            timeUsed: number;
        }[] = [];

        // Schedule many updates
        for (let i = 0; i < 200; i++) {
            const tree = createComplexTree(vdom, 2, 5);
            const fiber = vdom.createPublicFiberNode(tree);
            vdom.scheduleWork(fiber, Date.now() + Math.random() * 1000);
        }

        // Process work in time slices
        for (let slice = 0; slice < 50; slice++) {
            const result = vdom.processWorkQueue(16); // 16ms time slice
            workResults.push(result);
        }
    });

    // Component creation and rendering
    bench("component creation and rendering", () => {
        const vdom = new MockVirtualDOM();
        const components: VNode[] = [];

        // Create component types
        const ButtonComponent = vdom.createComponent("Button", (props) => {
            const children = Array.isArray(props.children)
                ? props.children[0]
                : props.children;
            return vdom.createElement(
                "button",
                {
                    className: `btn ${props.variant || "default"}`,
                    onClick: props.onClick,
                    disabled: props.disabled,
                },
                children || "Button"
            );
        });

        const CardComponent = vdom.createComponent("Card", (props) => {
            const children = Array.isArray(props.children)
                ? props.children[0]
                : props.children;
            return vdom.createElement(
                "div",
                {
                    className: "card",
                    style: { padding: "16px", border: "1px solid #ccc" },
                },
                vdom.createElement(
                    "h3",
                    { className: "card-title" },
                    props.title
                ),
                vdom.createElement(
                    "div",
                    { className: "card-content" },
                    children || ""
                )
            );
        });

        const ListComponent = vdom.createComponent("List", (props) => {
            const items = (props.items || []).map((item: any, index: number) =>
                vdom.createElement(
                    "li",
                    { key: index, className: "list-item" },
                    vdom.createElement(
                        ButtonComponent,
                        {
                            variant: "small",
                            onClick: () => {},
                        },
                        item.label
                    )
                )
            );

            return vdom.createElement("ul", { className: "list" }, ...items);
        });

        // Render many component instances
        for (let i = 0; i < 100; i++) {
            const items = Array.from(
                { length: Math.floor(Math.random() * 10) + 1 },
                (_, j) => ({
                    id: j,
                    label: `Item ${j}`,
                })
            );

            const component = vdom.createElement(
                CardComponent,
                {
                    title: `Card ${i}`,
                },
                vdom.createElement(ListComponent, { items }),
                vdom.createElement(
                    ButtonComponent,
                    {
                        variant: "primary",
                        onClick: () => {},
                    },
                    "Action"
                )
            );

            components.push(component);
        }
    });

    // Memory optimization benchmarks
    bench("memory optimization and cleanup", () => {
        const vdom = new MockVirtualDOM();
        const optimizationResults: {
            nodesOptimized: number;
            memoryFreed: number;
            optimizationTime: number;
        }[] = [];

        // Create many nodes to simulate memory pressure
        for (let i = 0; i < 500; i++) {
            const tree = createComplexTree(vdom, 3, 3);
            const diffResult = vdom.diff(null, tree);
            vdom.reconcile(diffResult);
        }

        // Perform memory optimization cycles
        for (let cycle = 0; cycle < 20; cycle++) {
            const result = vdom.optimizeMemory();
            optimizationResults.push(result);
        }
    });

    // Stress test - large scale operations
    bench("stress test - large virtual DOM operations", () => {
        const vdom = new MockVirtualDOM();
        const operations: {
            type: "create" | "diff" | "reconcile";
            time: number;
            nodesProcessed: number;
        }[] = [];

        let currentTree: VNode | null = null;

        for (let operation = 0; operation < 200; operation++) {
            const operationType = [
                "create",
                "diff",
                "reconcile",
            ][Math.floor(Math.random() * 3)] as "create" | "diff" | "reconcile";
            const startTime = performance.now();

            switch (operationType) {
                case "create": {
                    currentTree = createComplexTree(vdom, 4, 3);
                    operations.push({
                        type: operationType,
                        time: performance.now() - startTime,
                        nodesProcessed: 1,
                    });
                    break;
                }

                case "diff": {
                    if (currentTree) {
                        const newTree = createComplexTree(vdom, 4, 3);
                        const diffResult = vdom.diff(currentTree, newTree);
                        operations.push({
                            type: operationType,
                            time: performance.now() - startTime,
                            nodesProcessed: diffResult.totalOperations,
                        });
                        currentTree = newTree;
                    }
                    break;
                }

                case "reconcile": {
                    if (currentTree) {
                        const newTree = createComplexTree(vdom, 4, 3);
                        const diffResult = vdom.diff(currentTree, newTree);
                        const metrics = vdom.reconcile(diffResult);
                        operations.push({
                            type: operationType,
                            time: performance.now() - startTime,
                            nodesProcessed: metrics.nodesProcessed,
                        });
                    }
                    break;
                }
            }
        }

        // Final statistics
        const stats = vdom.getStatistics();
    });
});

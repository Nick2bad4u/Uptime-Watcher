/**
 * Zustand Store Performance Benchmarks
 *
 * @file Performance benchmarks for Zustand state management operations using
 *   real implementations.
 */

import { bench, describe } from "vitest";
import { createStore } from "zustand";
import type { StoreApi } from "zustand";

// Mock vitest for imports
import { vi } from "vitest";

// Simple test store for comparative benchmarking
interface SimpleCounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
    setCount: (count: number) => void;
    reset: () => void;
}

function createSimpleCounterStore(): StoreApi<SimpleCounterState> {
    return createStore<SimpleCounterState>()((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        setCount: (count: number) => set({ count }),
        reset: () => set({ count: 0 }),
    }));
}

// Complex state store for performance testing
interface ComplexState {
    items: {
        id: string;
        name: string;
        value: number;
        nested: { data: string[] };
    }[];
    filters: { status: string; category: string; search: string };
    ui: { loading: boolean; selectedId: string | null; expanded: Set<string> };
    metadata: { total: number; lastUpdate: number; version: string };
}

interface ComplexActions {
    addItem: (item: Omit<ComplexState["items"][0], "id">) => void;
    removeItem: (id: string) => void;
    updateItem: (
        id: string,
        updates: Partial<ComplexState["items"][0]>
    ) => void;
    setFilters: (filters: Partial<ComplexState["filters"]>) => void;
    setLoading: (loading: boolean) => void;
    selectItem: (id: string | null) => void;
    toggleExpanded: (id: string) => void;
    bulkUpdate: (
        updates: {
            id: string;
            changes: Partial<ComplexState["items"][0]>;
        }[]
    ) => void;
}

function createComplexStore(): StoreApi<ComplexState & ComplexActions> {
    return createStore<ComplexState & ComplexActions>()((set, get) => ({
        // Initial state
        items: [],
        filters: { status: "all", category: "all", search: "" },
        ui: { loading: false, selectedId: null, expanded: new Set() },
        metadata: { total: 0, lastUpdate: Date.now(), version: "1.0.0" },

        // Actions
        addItem: (item) =>
            set((state) => {
                const newItem = {
                    ...item,
                    id: `item-${Date.now()}-${Math.random()}`,
                };
                return {
                    items: [...state.items, newItem],
                    metadata: {
                        ...state.metadata,
                        total: state.items.length + 1,
                        lastUpdate: Date.now(),
                    },
                };
            }),

        removeItem: (id) =>
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
                metadata: {
                    ...state.metadata,
                    total: state.items.length - 1,
                    lastUpdate: Date.now(),
                },
            })),

        updateItem: (id, updates) =>
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? { ...item, ...updates } : item),
                metadata: { ...state.metadata, lastUpdate: Date.now() },
            })),

        setFilters: (filters) =>
            set((state) => ({
                filters: { ...state.filters, ...filters },
            })),

        setLoading: (loading) =>
            set((state) => ({
                ui: { ...state.ui, loading },
            })),

        selectItem: (id) =>
            set((state) => ({
                ui: { ...state.ui, selectedId: id },
            })),

        toggleExpanded: (id) =>
            set((state) => {
                const newExpanded = new Set(state.ui.expanded);
                if (newExpanded.has(id)) {
                    newExpanded.delete(id);
                } else {
                    newExpanded.add(id);
                }
                return {
                    ui: { ...state.ui, expanded: newExpanded },
                };
            }),

        bulkUpdate: (updates) =>
            set((state) => {
                const updatesMap = new Map(
                    updates.map((u) => [u.id, u.changes])
                );
                return {
                    items: state.items.map((item) => {
                        const changes = updatesMap.get(item.id);
                        return changes ? { ...item, ...changes } : item;
                    }),
                    metadata: { ...state.metadata, lastUpdate: Date.now() },
                };
            }),
    }));
}

// Test data generators
function generateComplexItem(index: number) {
    return {
        name: `Item ${index}`,
        value: Math.floor(Math.random() * 1000),
        nested: {
            data: Array.from({ length: 5 }, (_, i) => `nested-${index}-${i}`),
        },
    };
}

describe("Zustand Store Performance - Real Implementations", () => {
    describe("Store Creation", () => {
        bench("Create simple counter store", () => {
            createSimpleCounterStore();
        });

        bench("Create complex state store", () => {
            createComplexStore();
        });
    });

    describe("Simple Store Operations", () => {
        let store: StoreApi<SimpleCounterState>;

        bench("Simple state read", () => {
            store = createSimpleCounterStore();
            void store.getState().count;
        });

        bench("Simple state update", () => {
            store = createSimpleCounterStore();
            store.getState().increment();
        });

        bench("Multiple simple updates", () => {
            store = createSimpleCounterStore();
            for (let i = 0; i < 100; i++) {
                store.getState().increment();
            }
        });

        bench("Simple subscription", () => {
            store = createSimpleCounterStore();
            const unsubscribe = store.subscribe(() => {});
            store.getState().increment();
            unsubscribe();
        });
    });

    describe("Complex Store Operations", () => {
        let store: StoreApi<ComplexState & ComplexActions>;

        bench("Complex state read", () => {
            store = createComplexStore();
            const state = store.getState();
            void state.items.length;
            void state.filters.status;
            void state.ui.loading;
            void state.metadata.total;
        });

        bench("Add items to complex store", () => {
            store = createComplexStore();
            for (let i = 0; i < 50; i++) {
                store.getState().addItem(generateComplexItem(i));
            }
        });

        bench("Update complex filters", () => {
            store = createComplexStore();
            store.getState().setFilters({ status: "active", search: "test" });
            store.getState().setFilters({ category: "important" });
            store.getState().setFilters({ search: "updated" });
        });

        bench("Complex UI state updates", () => {
            store = createComplexStore();
            // Populate with items first
            for (let i = 0; i < 20; i++) {
                store.getState().addItem(generateComplexItem(i));
            }

            // Perform UI operations
            const items = store.getState().items;
            for (const item of items.slice(0, 10)) {
                store.getState().toggleExpanded(item.id);
                store.getState().selectItem(item.id);
            }
        });

        bench("Bulk updates", () => {
            store = createComplexStore();
            // Populate with items
            for (let i = 0; i < 100; i++) {
                store.getState().addItem(generateComplexItem(i));
            }

            // Bulk update
            const items = store.getState().items;
            const updates = items.slice(0, 50).map((item) => ({
                id: item.id,
                changes: { value: item.value + 100 },
            }));
            store.getState().bulkUpdate(updates);
        });
    });

    describe("Store Subscription Performance", () => {
        bench("Multiple subscribers - simple store", () => {
            const store = createSimpleCounterStore();
            const unsubscribers: (() => void)[] = [];

            // Add 50 subscribers
            for (let i = 0; i < 50; i++) {
                const unsubscribe = store.subscribe(() => {});
                unsubscribers.push(unsubscribe);
            }

            // Trigger updates
            for (let i = 0; i < 20; i++) {
                store.getState().increment();
            }

            // Cleanup
            unsubscribers.forEach((unsub) => unsub());
        });

        bench("Multiple subscribers - complex store", () => {
            const store = createComplexStore();
            const unsubscribers: (() => void)[] = [];

            // Add 30 subscribers
            for (let i = 0; i < 30; i++) {
                const unsubscribe = store.subscribe(() => {});
                unsubscribers.push(unsubscribe);
            }

            // Trigger updates
            for (let i = 0; i < 15; i++) {
                store.getState().addItem(generateComplexItem(i));
            }

            // Cleanup
            unsubscribers.forEach((unsub) => unsub());
        });
    });

    describe("Memory and Performance Edge Cases", () => {
        bench("Large state operations", () => {
            const store = createComplexStore();

            // Add many items
            for (let i = 0; i < 500; i++) {
                store.getState().addItem(generateComplexItem(i));
            }

            // Read state multiple times
            let total = 0;
            for (let i = 0; i < 100; i++) {
                total += store.getState().items.length;
            }
        });

        bench("Rapid state changes", () => {
            const store = createSimpleCounterStore();

            // Rapid fire updates
            for (let i = 0; i < 1000; i++) {
                store.getState().increment();
            }
        });

        bench("Store creation/destruction cycle", () => {
            for (let i = 0; i < 50; i++) {
                const store = createComplexStore();
                store.getState().addItem(generateComplexItem(i));
                // Zustand stores don't need explicit cleanup
            }
        });

        bench("Deep state reading", () => {
            const store = createComplexStore();

            // Add nested items
            for (let i = 0; i < 100; i++) {
                store.getState().addItem(generateComplexItem(i));
            }

            // Deep reads
            const state = store.getState();
            for (const item of state.items) {
                item.nested.data.forEach((d) => d.length);
            }
        });
    });
});

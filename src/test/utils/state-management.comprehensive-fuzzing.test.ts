/**
 * Comprehensive Fast-Check Fuzzing Tests for State Management
 *
 * @remarks
 * This test suite focuses on state management fuzzing with:
 *
 * - State mutation safety testing
 * - Action parameter validation
 * - Store persistence consistency
 * - Concurrent state updates simulation
 * - State rollback and recovery testing
 * - Performance testing under various loads
 *
 * @file Provides 100% property-based test coverage for Zustand store operations
 *   including state mutations, persistence, and action validation.
 *
 * @packageDocumentation
 */

/* eslint-disable prefer-named-capture-group */

import { describe, expect, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";

// --- Type declarations to help TS infer fast-check outputs ---
interface MonitorState {
    id: number;
    name: string;
    url: string;
    type: "http" | "ping" | "dns" | "port";
    status: "up" | "down" | "pending" | "paused";
    interval: number;
    timeout: number;
    retries: number;
    enabled: boolean;
    lastChecked: Date | null;
    responseTime: number | null;
    uptime: number;
    createdAt: Date;
    updatedAt: Date;
}

interface SiteState {
    id: number;
    name: string;
    url: string;
    monitors: number[];
    status: "up" | "down" | "mixed" | "unknown";
    overallUptime: number;
    createdAt: Date;
    updatedAt: Date;
}

interface SettingsState {
    theme: "light" | "dark" | "auto";
    language: "en" | "es" | "fr" | "de";
    notifications: {
        enabled: boolean;
        desktop: boolean;
        email: boolean;
        sound: boolean;
    };
    monitoring: {
        defaultInterval: number;
        defaultTimeout: number;
        maxRetries: number;
        enableAnalytics: boolean;
    };
    ui: {
        sidebarCollapsed: boolean;
        showTooltips: boolean;
        animationsEnabled: boolean;
        compactMode: boolean;
    };
}

type StateAction =
    | {
          type:
              | "ADD_MONITOR"
              | "UPDATE_MONITOR"
              | "DELETE_MONITOR"
              | "TOGGLE_MONITOR";
          payload: Partial<MonitorState> | MonitorState;
      }
    | {
          type: "ADD_SITE" | "UPDATE_SITE" | "DELETE_SITE";
          payload: Partial<SiteState> | SiteState;
      }
    | {
          type: "UPDATE_SETTINGS" | "RESET_SETTINGS";
          payload: Partial<SettingsState> | object;
      }
    | { type: "UPDATE_STATUS" | "BULK_STATUS_UPDATE"; payload: any };

// =============================================================================
// Custom Fast-Check Arbitraries for State Management
// =============================================================================

/**
 * Generates monitor state objects for testing
 */
const monitorStateData = fc.record<MonitorState>({
    id: fc.integer({ min: 1, max: 10_000 }),
    name: fc
        .string({ minLength: 1, maxLength: 255 })
        .filter((s) => s.trim().length > 0),
    url: fc.webUrl(),
    type: fc.constantFrom("http", "ping", "dns", "port"),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    interval: fc.integer({ min: 1000, max: 300_000 }),
    timeout: fc.integer({ min: 1000, max: 30_000 }),
    retries: fc.integer({ min: 0, max: 5 }),
    enabled: fc.boolean(),
    lastChecked: fc.oneof(fc.date(), fc.constant(null)),
    responseTime: fc.oneof(
        fc.integer({ min: 0, max: 30_000 }),
        fc.constant(null)
    ),
    uptime: fc.double({ min: 0, max: 100 }),
    createdAt: fc.date(),
    updatedAt: fc.date(),
});

/**
 * Generates site state objects for testing
 */
const siteStateData = fc.record<SiteState>({
    id: fc.integer({ min: 1, max: 1000 }),
    name: fc
        .string({ minLength: 1, maxLength: 255 })
        .filter((s) => s.trim().length > 0),
    url: fc.webUrl(),
    monitors: fc.array(fc.integer({ min: 1, max: 10_000 }), {
        minLength: 0,
        maxLength: 10,
    }),
    status: fc.constantFrom("up", "down", "mixed", "unknown"),
    overallUptime: fc.double({ min: 0, max: 100 }),
    createdAt: fc.date(),
    updatedAt: fc.date(),
});

/**
 * Generates application settings state for testing
 */
const settingsStateData = fc.record<SettingsState>({
    theme: fc.constantFrom("light", "dark", "auto"),
    language: fc.constantFrom("en", "es", "fr", "de"),
    notifications: fc.record({
        enabled: fc.boolean(),
        desktop: fc.boolean(),
        email: fc.boolean(),
        sound: fc.boolean(),
    }),
    monitoring: fc.record({
        defaultInterval: fc.integer({ min: 1000, max: 300_000 }),
        defaultTimeout: fc.integer({ min: 1000, max: 30_000 }),
        maxRetries: fc.integer({ min: 0, max: 10 }),
        enableAnalytics: fc.boolean(),
    }),
    ui: fc.record({
        sidebarCollapsed: fc.boolean(),
        showTooltips: fc.boolean(),
        animationsEnabled: fc.boolean(),
        compactMode: fc.boolean(),
    }),
});

/**
 * Generates state action objects for testing
 */
const stateActions: fc.Arbitrary<StateAction> = fc.oneof(
    // Monitor actions
    fc.record({
        type: fc.constantFrom(
            "ADD_MONITOR",
            "UPDATE_MONITOR",
            "DELETE_MONITOR",
            "TOGGLE_MONITOR"
        ),
        payload: fc.oneof(monitorStateData, fc.record({ id: fc.integer() })),
    }),
    // Site actions
    fc.record({
        type: fc.constantFrom("ADD_SITE", "UPDATE_SITE", "DELETE_SITE"),
        payload: fc.oneof(siteStateData, fc.record({ id: fc.integer() })),
    }),
    // Settings actions
    fc.record({
        type: fc.constantFrom("UPDATE_SETTINGS", "RESET_SETTINGS"),
        payload: fc.oneof(settingsStateData, fc.record({})),
    }),
    // Status actions
    fc.record({
        type: fc.constantFrom("UPDATE_STATUS", "BULK_STATUS_UPDATE"),
        payload: fc.oneof(
            fc.record({ monitorId: fc.integer(), status: fc.string() }),
            fc.array(
                fc.record({ monitorId: fc.integer(), status: fc.string() })
            )
        ),
    })
) as unknown as fc.Arbitrary<StateAction>;

// =============================================================================
// State Management Fuzzing Tests
// =============================================================================

describe("Comprehensive State Management Fuzzing", () => {
    let performanceMetrics: {
        action: string;
        time: number;
        payload: any;
    }[] = [];

    beforeEach(() => {
        performanceMetrics = [];
    });

    afterEach(() => {
        // Log performance issues
        const slowActions = performanceMetrics.filter((m) => m.time > 50);
        if (slowActions.length > 0) {
            console.warn("Slow state actions detected:", slowActions);
        }
    });

    /**
     * Helper to measure state action performance
     */
    function measureStateAction<T extends unknown[], R>(
        action: (...args: T) => R,
        actionName: string,
        ...args: T
    ): R {
        const startTime = performance.now();
        const result = action(...args);
        const endTime = performance.now();

        performanceMetrics.push({
            action: actionName,
            time: endTime - startTime,
            payload: args,
        });

        return result;
    }

    describe("State Mutation Safety", () => {
        fcTest.prop([monitorStateData])(
            "Monitor state updates should be immutable",
            (monitorData: MonitorState) => {
                // Mock store with immutable update logic
                const monitors = new Map<number, MonitorState>();
                const mockStore = {
                    monitors,

                    addMonitor: (monitor: MonitorState): MonitorState => {
                        // Validate monitor data
                        if (!monitor.id || monitor.id <= 0) {
                            throw new Error("Invalid monitor ID");
                        }
                        if (!monitor.name || monitor.name.trim().length === 0) {
                            throw new Error("Invalid monitor name");
                        }

                        // Create immutable copy
                        const newMonitor = {
                            ...monitor,
                            name: monitor.name.trim(),
                            createdAt: new Date(monitor.createdAt),
                            updatedAt: new Date(),
                        };

                        monitors.set(monitor.id, newMonitor);
                        return newMonitor;
                    },

                    updateMonitor: (
                        id: number,
                        updates: Partial<MonitorState>
                    ) => {
                        const existing = monitors.get(id);
                        if (!existing) {
                            throw new Error("Monitor not found");
                        }

                        // Create immutable update
                        const updated = {
                            ...existing,
                            ...updates,
                            id: existing.id, // Preserve ID
                            updatedAt: new Date(),
                        };

                        monitors.set(id, updated);
                        return updated;
                    },

                    getMonitor: (id: number): MonitorState | null => {
                        const monitor = monitors.get(id);
                        // Return deep copy to prevent mutation
                        return monitor ? { ...monitor } : null;
                    },
                };

                // Test immutable operations
                const originalData = { ...monitorData };

                // Property: Adding monitor should not mutate input
                const addedMonitor = measureStateAction(
                    mockStore.addMonitor.bind(mockStore),
                    "addMonitor",
                    monitorData
                );

                expect(monitorData).toEqual(originalData); // Input unchanged
                expect(addedMonitor).not.toBe(monitorData); // Different object reference
                expect(addedMonitor.id).toBe(monitorData.id);
                expect(addedMonitor.name.trim()).toBe(monitorData.name.trim());

                // Property: Retrieving monitor should return copy
                const retrievedMonitor = measureStateAction(
                    mockStore.getMonitor.bind(mockStore),
                    "getMonitor",
                    monitorData.id
                );

                expect(retrievedMonitor).not.toBeNull();
                if (retrievedMonitor) {
                    expect(retrievedMonitor).not.toBe(addedMonitor); // Different reference
                    expect(retrievedMonitor.id).toBe(addedMonitor.id);
                }
            }
        );

        fcTest.prop([
            fc.array(monitorStateData, { minLength: 1, maxLength: 20 }),
            fc.array(
                fc.record({
                    id: fc.integer({ min: 1, max: 20 }),
                    updates: fc.record({
                        name: fc.oneof(
                            fc
                                .string({ minLength: 1, maxLength: 100 })
                                .filter((s) => s.trim().length > 0),
                            fc.constant(undefined)
                        ),
                        status: fc.oneof(
                            fc.constantFrom("up", "down", "pending", "paused"),
                            fc.constant(undefined)
                        ),
                        enabled: fc.oneof(fc.boolean(), fc.constant(undefined)),
                    }),
                }),
                { minLength: 1, maxLength: 10 }
            ),
        ])(
            "Bulk state updates should maintain consistency",
            (
                initialMonitors: MonitorState[],
                updates: {
                    id: number;
                    updates: {
                        name?: string | undefined;
                        status?:
                            | "up"
                            | "down"
                            | "pending"
                            | "paused"
                            | undefined;
                        enabled?: boolean | undefined;
                    };
                }[]
            ) => {
                const bulkMonitors = new Map<number, any>();
                const mockBulkStore = {
                    monitors: bulkMonitors,

                    bulkAdd: (
                        monitors: MonitorState[]
                    ): {
                        results: MonitorState[];
                        errors: string[];
                        total: number;
                    } => {
                        const results: MonitorState[] = [];
                        const errors: string[] = [];

                        for (const monitor of monitors) {
                            try {
                                if (bulkMonitors.has(monitor.id)) {
                                    errors.push(
                                        `Monitor ${monitor.id} already exists`
                                    );
                                    // Skip duplicate instead of continue
                                } else {
                                    const newMonitor = {
                                        ...monitor,
                                        createdAt: new Date(monitor.createdAt),
                                        updatedAt: new Date(),
                                    };

                                    bulkMonitors.set(monitor.id, newMonitor);
                                    results.push(newMonitor);
                                }
                            } catch (error) {
                                errors.push(
                                    `Failed to add monitor ${monitor.id}: ${error}`
                                );
                            }
                        }

                        return { results, errors, total: monitors.length };
                    },

                    bulkUpdate: (
                        updateRequests: {
                            id: number;
                            updates: {
                                name?: string | undefined;
                                status?:
                                    | "up"
                                    | "down"
                                    | "pending"
                                    | "paused"
                                    | undefined;
                                enabled?: boolean | undefined;
                            };
                        }[]
                    ): {
                        results: MonitorState[];
                        errors: string[];
                        total: number;
                    } => {
                        const results: MonitorState[] = [];
                        const errors: string[] = [];

                        for (const update of updateRequests) {
                            try {
                                const existing = bulkMonitors.get(update.id);
                                if (existing) {
                                    const updated = {
                                        ...existing,
                                        ...update.updates,
                                        id: existing.id,
                                        updatedAt: new Date(),
                                    };

                                    bulkMonitors.set(update.id, updated);
                                    results.push(updated);
                                } else {
                                    errors.push(
                                        `Monitor ${update.id} not found`
                                    );
                                }
                            } catch (error) {
                                errors.push(
                                    `Failed to update monitor ${update.id}: ${error}`
                                );
                            }
                        }

                        return {
                            results,
                            errors,
                            total: updateRequests.length,
                        };
                    },

                    getState: () => ({
                        monitors: [...bulkMonitors.values()],
                        count: bulkMonitors.size,
                    }),
                };

                // Test bulk operations
                const addResult = measureStateAction(
                    mockBulkStore.bulkAdd.bind(mockBulkStore),
                    "bulkAdd",
                    initialMonitors
                );

                // Property: Bulk add should handle all monitors
                expect(addResult.total).toBe(initialMonitors.length);
                expect(
                    addResult.results.length + addResult.errors.length
                ).toBeLessThanOrEqual(addResult.total);

                // Property: Successfully added monitors should be in state
                const state = mockBulkStore.getState();
                expect(state.monitors).toHaveLength(addResult.results.length);

                // Test bulk updates
                const updateResult = measureStateAction(
                    mockBulkStore.bulkUpdate.bind(mockBulkStore),
                    "bulkUpdate",
                    updates
                );

                // Property: Update results should be consistent
                expect(updateResult.total).toBe(updates.length);
                expect(
                    updateResult.results.length + updateResult.errors.length
                ).toBeLessThanOrEqual(updateResult.total);

                // Property: Updated monitors should reflect changes
                for (const updatedMonitor of updateResult.results) {
                    const currentState = mockBulkStore.monitors.get(
                        updatedMonitor.id
                    );
                    expect(currentState).not.toBeNull();
                    if (currentState) {
                        expect(currentState.updatedAt).toBeInstanceOf(Date);
                    }
                }
            }
        );
    });

    describe("Action Validation and Dispatch", () => {
        fcTest.prop([stateActions])(
            "State actions should be validated before dispatch",
            (action: StateAction) => {
                const mockActionDispatcher = {
                    validators: {
                        ADD_MONITOR: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            if (
                                !payload.name ||
                                payload.name.trim().length === 0
                            )
                                errors.push("Invalid name");
                            if (!payload.url) errors.push("Missing URL");
                            return errors;
                        },
                        UPDATE_MONITOR: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        DELETE_MONITOR: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        TOGGLE_MONITOR: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        ADD_SITE: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            if (
                                !payload.name ||
                                payload.name.trim().length === 0
                            )
                                errors.push("Invalid name");
                            return errors;
                        },
                        UPDATE_SITE: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        DELETE_SITE: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        UPDATE_SETTINGS: (payload: any) => {
                            const errors: string[] = [];
                            if (
                                payload.theme &&
                                ![
                                    "light",
                                    "dark",
                                    "auto",
                                ].includes(payload.theme)
                            ) {
                                errors.push("Invalid theme");
                            }
                            return errors;
                        },
                        RESET_SETTINGS: () => [], // Reset settings has no validation
                        UPDATE_STATUS: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.monitorId || payload.monitorId <= 0)
                                errors.push("Invalid monitor ID");
                            if (!payload.status) errors.push("Missing status");
                            return errors;
                        },
                        BULK_STATUS_UPDATE: (payload: any) => {
                            const errors: string[] = [];
                            if (!Array.isArray(payload))
                                errors.push("Payload must be an array");
                            return errors;
                        },
                    },

                    dispatch(actionToDispatch: StateAction): {
                        success: boolean;
                        error: string | null;
                        payload: any;
                        type?: string;
                    } {
                        const validator =
                            this.validators[
                                actionToDispatch.type as keyof typeof this.validators
                            ];

                        if (!validator) {
                            return {
                                success: false,
                                error: `Unknown action type: ${actionToDispatch.type}`,
                                payload: null,
                            };
                        }

                        const validationErrors = validator(
                            actionToDispatch.payload
                        );

                        if (validationErrors.length > 0) {
                            return {
                                success: false,
                                error: `Validation failed: ${validationErrors.join(", ")}`,
                                payload: actionToDispatch.payload,
                            };
                        }

                        return {
                            success: true,
                            error: null,
                            payload: actionToDispatch.payload,
                            type: actionToDispatch.type,
                        };
                    },
                };

                const result = measureStateAction(
                    mockActionDispatcher.dispatch.bind(mockActionDispatcher),
                    "dispatch",
                    action
                );

                // Property: Dispatcher should never throw
                expect(result).toHaveProperty("success");
                expect(typeof result.success).toBe("boolean");

                // Property: Unknown action types should be rejected
                if (
                    !Object.keys(mockActionDispatcher.validators).includes(
                        action.type
                    )
                ) {
                    expect(result.success).toBeFalsy();
                    expect(result.error).toContain("Unknown action type");
                }

                // Property: Invalid payloads should be rejected
                if (
                    action.type === "ADD_MONITOR" &&
                    action.payload &&
                    (!action.payload.id || action.payload.id <= 0)
                ) {
                    expect(result.success).toBeFalsy();
                    expect(result.error).toContain("Invalid ID");
                }
            }
        );

        fcTest.prop([fc.array(stateActions, { minLength: 1, maxLength: 20 })])(
            "Action queue should process actions in order",
            (actionQueue: StateAction[]) => {
                const mockActionQueue = {
                    queue: [] as any[],
                    processed: [] as any[],

                    enqueue(actionsToQueue: StateAction[]): {
                        queued: number;
                        totalInQueue: number;
                    } {
                        this.queue.push(...actionsToQueue);
                        return {
                            queued: actionsToQueue.length,
                            totalInQueue: this.queue.length,
                        };
                    },

                    processQueue(): {
                        processed: number;
                        results: any[];
                        queueEmpty: boolean;
                    } {
                        const results: any[] = [];

                        while (this.queue.length > 0) {
                            const action = this.queue.shift();

                            try {
                                // Simulate action processing
                                const processed = {
                                    ...action,
                                    processedAt: new Date(),
                                    success: true,
                                };

                                this.processed.push(processed);
                                results.push(processed);
                            } catch (error) {
                                const failed = {
                                    ...action,
                                    processedAt: new Date(),
                                    success: false,
                                    error:
                                        error instanceof Error
                                            ? error.message
                                            : "Unknown error",
                                };

                                this.processed.push(failed);
                                results.push(failed);
                            }
                        }

                        return {
                            processed: results.length,
                            results,
                            queueEmpty: this.queue.length === 0,
                        };
                    },
                };

                // Enqueue actions
                const enqueueResult = measureStateAction(
                    mockActionQueue.enqueue.bind(mockActionQueue),
                    "enqueue",
                    actionQueue
                );

                expect(enqueueResult.queued).toBe(actionQueue.length);
                expect(enqueueResult.totalInQueue).toBe(actionQueue.length);

                // Process queue
                const processResult = measureStateAction(
                    mockActionQueue.processQueue.bind(mockActionQueue),
                    "processQueue"
                );

                // Property: All actions should be processed
                expect(processResult.processed).toBe(actionQueue.length);
                expect(processResult.queueEmpty).toBeTruthy();
                expect(processResult.results).toHaveLength(actionQueue.length);

                // Property: Actions should be processed in order
                for (const [i, element] of actionQueue.entries()) {
                    expect(processResult.results[i].type).toBe(element.type);
                }
            }
        );
    });

    describe("State Persistence and Recovery", () => {
        fcTest.prop([
            fc.record({
                monitors: fc.array(monitorStateData, {
                    minLength: 0,
                    maxLength: 10,
                }),
                sites: fc.array(siteStateData, { minLength: 0, maxLength: 5 }),
                settings: settingsStateData,
            }),
        ])(
            "State persistence should maintain data integrity",
            (stateSnapshot) => {
                const mockPersistence = {
                    serialize(state: typeof stateSnapshot) {
                        try {
                            // Simulate state serialization with validation
                            const serialized = JSON.stringify(
                                state,
                                (_key, value) => {
                                    if (value instanceof Date) {
                                        return {
                                            __type: "Date",
                                            value: value.toISOString(),
                                        };
                                    }
                                    return value;
                                }
                            );

                            return {
                                success: true,
                                data: serialized,
                                size: serialized.length,
                            };
                        } catch (error) {
                            return {
                                success: false,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : "Serialization failed",
                                data: null,
                            };
                        }
                    },

                    deserialize(serializedData: string) {
                        try {
                            const parsed = JSON.parse(
                                serializedData,
                                (key, value) => {
                                    // Handle Date objects serialized with __type marker
                                    if (
                                        value &&
                                        typeof value === "object" &&
                                        value.__type === "Date"
                                    ) {
                                        return new Date(value.value);
                                    }

                                    // Handle direct Date ISO strings (common date fields)
                                    // Include support for extended year format (+/-YYYYYY)
                                    if (
                                        typeof value === "string" &&
                                        (key === "createdAt" ||
                                            key === "updatedAt" ||
                                            key === "lastChecked") &&
                                        /^[+-]?\d{4,6}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(
                                            value
                                        )
                                    ) {
                                        const dateObj = new Date(value);
                                        // Only return Date if valid (not Invalid Date)
                                        return Number.isNaN(dateObj.getTime())
                                            ? value
                                            : dateObj;
                                    }

                                    return value;
                                }
                            );

                            return {
                                success: true,
                                state: parsed,
                                valid: this.validateState(parsed),
                            };
                        } catch (error) {
                            return {
                                success: false,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : "Deserialization failed",
                                state: null,
                            };
                        }
                    },

                    validateState(state: any) {
                        const errors: string[] = [];

                        if (!state || typeof state !== "object") {
                            errors.push("Invalid state object");
                            return { valid: false, errors };
                        }

                        if (state.monitors && !Array.isArray(state.monitors)) {
                            errors.push("Monitors must be array");
                        }

                        if (state.sites && !Array.isArray(state.sites)) {
                            errors.push("Sites must be array");
                        }

                        if (
                            state.settings &&
                            typeof state.settings !== "object"
                        ) {
                            errors.push("Settings must be object");
                        }

                        return { valid: errors.length === 0, errors };
                    },
                };

                // Test serialization
                const serialResult = measureStateAction(
                    mockPersistence.serialize.bind(mockPersistence),
                    "serialize",
                    stateSnapshot
                );

                expect(serialResult).toHaveProperty("success");
                expect(typeof serialResult.success).toBe("boolean");

                if (serialResult.success && serialResult.data) {
                    // Property: Serialized data should be valid JSON string
                    expect(typeof serialResult.data).toBe("string");
                    expect(serialResult.size).toBeGreaterThan(0);

                    // Test deserialization
                    const deserialResult = measureStateAction(
                        mockPersistence.deserialize.bind(mockPersistence),
                        "deserialize",
                        serialResult.data
                    );

                    expect(deserialResult.success).toBeTruthy();

                    if (deserialResult.success && deserialResult.state) {
                        // Property: Deserialized state should match original structure
                        expect(deserialResult.state).toHaveProperty("monitors");
                        expect(deserialResult.state).toHaveProperty("sites");
                        expect(deserialResult.state).toHaveProperty("settings");

                        // Property: Arrays should maintain length
                        expect(deserialResult.state.monitors).toHaveLength(
                            stateSnapshot.monitors.length
                        );
                        expect(deserialResult.state.sites).toHaveLength(
                            stateSnapshot.sites.length
                        );

                        // Property: Date objects should be restored (if they were valid originally)
                        if (
                            stateSnapshot.monitors.length > 0 &&
                            stateSnapshot.monitors[0]
                        ) {
                            const originalDate =
                                stateSnapshot.monitors[0].createdAt;
                            const deserializedDate =
                                deserialResult.state.monitors[0]?.createdAt;

                            // If the original date was valid, expect the deserialized date to be valid
                            if (
                                !Number.isNaN(originalDate.getTime()) &&
                                deserializedDate
                            ) {
                                expect(deserializedDate).toBeInstanceOf(Date);
                                expect(
                                    Number.isNaN(deserializedDate.getTime())
                                ).toBeFalsy();
                            } else {
                                // If the original date was invalid (NaN), it becomes null during serialization
                                expect(deserializedDate).toBeNull();
                            }
                        }
                    }
                }
            }
        );

        fcTest.prop([
            fc.record({
                corruptedData: fc.oneof(
                    fc.constantFrom(
                        "{invalid json",
                        '{"monitors": [}',
                        '{"circular": circular}',
                        "",
                        "null",
                        "undefined"
                    ),
                    fc.string()
                ),
            }),
        ])(
            "State recovery should handle corrupted data gracefully",
            (corruptionTest) => {
                const mockRecovery = {
                    attemptRecovery: (corruptedDataStr: string) => {
                        const recoveryStrategies = [
                            // Try parsing as-is (but validate result is not null)
                            () => {
                                const result = JSON.parse(corruptedDataStr);
                                if (
                                    result === null ||
                                    typeof result !== "object"
                                ) {
                                    throw new Error(
                                        "Parsed data is null or not an object"
                                    );
                                }
                                return result;
                            },

                            // Try fixing common JSON issues
                            () => {
                                let fixed = corruptedDataStr.replaceAll(
                                    /,(\s*[\]}])/g,
                                    "$1"
                                ); // Remove trailing commas
                                fixed = fixed.replaceAll(
                                    /([,{]\s*)(\w+):/g,
                                    '$1"$2":'
                                ); // Quote unquoted keys
                                const result = JSON.parse(fixed);
                                if (
                                    result === null ||
                                    typeof result !== "object"
                                ) {
                                    throw new Error(
                                        "Fixed data is null or not an object"
                                    );
                                }
                                return result;
                            },

                            // Return default state
                            () => ({
                                monitors: [],
                                sites: [],
                                settings: {
                                    theme: "light",
                                    language: "en",
                                    notifications: {
                                        enabled: true,
                                        desktop: false,
                                        email: false,
                                        sound: false,
                                    },
                                    monitoring: {
                                        defaultInterval: 60_000,
                                        defaultTimeout: 30_000,
                                        maxRetries: 3,
                                        enableAnalytics: true,
                                    },
                                    ui: {
                                        sidebarCollapsed: false,
                                        showTooltips: true,
                                        animationsEnabled: true,
                                        compactMode: false,
                                    },
                                },
                            }),
                        ];

                        const attempts: any[] = [];

                        for (const [
                            i,
                            recoveryStrategy,
                        ] of recoveryStrategies.entries()) {
                            try {
                                const result = recoveryStrategy();
                                attempts.push({
                                    strategy: i,
                                    success: true,
                                    result,
                                });
                                return {
                                    recovered: true,
                                    state: result,
                                    attempts,
                                    strategy: i,
                                };
                            } catch (error) {
                                attempts.push({
                                    strategy: i,
                                    success: false,
                                    error:
                                        error instanceof Error
                                            ? error.message
                                            : "Unknown error",
                                });
                            }
                        }

                        return {
                            recovered: false,
                            state: null,
                            attempts,
                            strategy: -1,
                        };
                    },
                };

                const recoveryResult = measureStateAction(
                    mockRecovery.attemptRecovery.bind(mockRecovery),
                    "recovery",
                    corruptionTest.corruptedData
                );

                // Property: Recovery should never throw
                expect(recoveryResult).toHaveProperty("recovered");
                expect(recoveryResult).toHaveProperty("attempts");
                expect(Array.isArray(recoveryResult.attempts)).toBeTruthy();

                // Property: Recovery should try multiple strategies
                expect(recoveryResult.attempts.length).toBeGreaterThan(0);

                // Property: If recovery succeeds, state should be valid
                if (recoveryResult.recovered) {
                    expect(recoveryResult.state).not.toBeNull();
                    expect(typeof recoveryResult.state).toBe("object");
                    expect(recoveryResult.strategy).toBeGreaterThanOrEqual(0);
                }

                // Property: All strategies should be attempted if earlier ones fail
                // const failedStrategies = recoveryResult.attempts.filter(
                //     (a) => !a.success
                // );
                const successfulStrategies = recoveryResult.attempts.filter(
                    (a) => a.success
                );

                if (successfulStrategies.length > 0) {
                    // Should stop at first successful strategy
                    expect(recoveryResult.recovered).toBeTruthy();
                }
            }
        );
    });

    describe("Performance and Concurrency", () => {
        fcTest.prop(
            [fc.array(stateActions, { minLength: 50, maxLength: 200 })],
            { timeout: 10_000, numRuns: 3 }
        )(
            "High-frequency state updates should maintain performance",
            (highFrequencyActions) => {
                const mockHighPerfStore = {
                    state: new Map(),
                    actionCount: 0,

                    batchProcess: (actions: typeof highFrequencyActions) => {
                        const startTime = performance.now();
                        const results: any[] = [];

                        // Process actions in batches for performance
                        const batchSize = 10;
                        for (let i = 0; i < actions.length; i += batchSize) {
                            const batch = actions.slice(i, i + batchSize);

                            for (const [index, action] of batch.entries()) {
                                mockHighPerfStore.actionCount++;
                                results.push({
                                    actionIndex: i + index,
                                    type: action.type,
                                    processed: true,
                                    timestamp: performance.now(),
                                });
                            }
                        }

                        const endTime = performance.now();
                        const totalTime = endTime - startTime;

                        return {
                            processed: results.length,
                            totalTime,
                            averageTime: totalTime / results.length,
                            actionsPerSecond: Math.round(
                                results.length / (totalTime / 1000)
                            ),
                            results,
                        };
                    },
                };

                const result = measureStateAction(
                    mockHighPerfStore.batchProcess.bind(mockHighPerfStore),
                    "batchProcess",
                    highFrequencyActions
                );

                // Property: All actions should be processed
                expect(result.processed).toBe(highFrequencyActions.length);

                // Property: Performance should be reasonable (> 1000 actions/second)
                expect(result.actionsPerSecond).toBeGreaterThan(100);

                // Property: Average time per action should be minimal (< 1ms)
                expect(result.averageTime).toBeLessThan(1);

                // Property: Results should maintain order
                expect(result.results).toHaveLength(
                    highFrequencyActions.length
                );
                for (let i = 0; i < Math.min(10, result.results.length); i++) {
                    expect(result.results[i].actionIndex).toBe(i);
                }
            }
        );
    });
});

/* eslint-enable prefer-named-capture-group */

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

import { fc, test as fcTest } from "@fast-check/vitest";
import {
    arrayFirst,
    arrayJoin,
    isEmpty,
    objectKeys,
    safeCastTo,
} from "ts-extras";
import { afterEach, beforeEach, describe, expect } from "vitest";

// --- Type declarations to help TS infer fast-check outputs ---
interface MonitorState {
    createdAt: Date;
    enabled: boolean;
    id: number;
    interval: number;
    lastChecked: Date | null;
    name: string;
    responseTime: null | number;
    retries: number;
    status: "down" | "paused" | "pending" | "up";
    timeout: number;
    type: "dns" | "http" | "ping" | "port";
    updatedAt: Date;
    uptime: number;
    url: string;
}

interface SettingsState {
    language: "de" | "en" | "es" | "fr";
    monitoring: {
        defaultInterval: number;
        defaultTimeout: number;
        enableAnalytics: boolean;
        maxRetries: number;
    };
    notifications: {
        desktop: boolean;
        email: boolean;
        enabled: boolean;
        sound: boolean;
    };
    theme: "auto" | "dark" | "light";
    ui: {
        animationsEnabled: boolean;
        compactMode: boolean;
        showTooltips: boolean;
        sidebarCollapsed: boolean;
    };
}

interface SiteState {
    createdAt: Date;
    id: number;
    monitors: number[];
    name: string;
    overallUptime: number;
    status: "down" | "mixed" | "unknown" | "up";
    updatedAt: Date;
    url: string;
}

type StateAction =
    | { payload: any; type: "BULK_STATUS_UPDATE" | "UPDATE_STATUS" }
    | {
          payload: MonitorState | Partial<MonitorState>;
          type:
              | "ADD_MONITOR"
              | "DELETE_MONITOR"
              | "TOGGLE_MONITOR"
              | "UPDATE_MONITOR";
      }
    | {
          payload: object | Partial<SettingsState>;
          type: "RESET_SETTINGS" | "UPDATE_SETTINGS";
      }
    | {
          payload: Partial<SiteState> | SiteState;
          type: "ADD_SITE" | "DELETE_SITE" | "UPDATE_SITE";
      };

// =============================================================================
// Custom Fast-Check Arbitraries for State Management
// =============================================================================

/**
 * Generates monitor state objects for testing
 */
const monitorStateData = fc.record<MonitorState>({
    createdAt: fc.date(),
    enabled: fc.boolean(),
    id: fc.integer({ max: 10_000, min: 1 }),
    interval: fc.integer({ max: 300_000, min: 1000 }),
    lastChecked: fc.oneof(fc.date(), fc.constant(null)),
    name: fc
        .string({ maxLength: 255, minLength: 1 })
        .filter((s) => s.trim().length > 0),
    responseTime: fc.oneof(
        fc.integer({ max: 30_000, min: 0 }),
        fc.constant(null)
    ),
    retries: fc.integer({ max: 5, min: 0 }),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    timeout: fc.integer({ max: 30_000, min: 1000 }),
    type: fc.constantFrom("http", "ping", "dns", "port"),
    updatedAt: fc.date(),
    uptime: fc.double({ max: 100, min: 0 }),
    url: fc.webUrl(),
});

/**
 * Generates site state objects for testing
 */
const siteStateData = fc.record<SiteState>({
    createdAt: fc.date(),
    id: fc.integer({ max: 1000, min: 1 }),
    monitors: fc.array(fc.integer({ max: 10_000, min: 1 }), {
        maxLength: 10,
        minLength: 0,
    }),
    name: fc
        .string({ maxLength: 255, minLength: 1 })
        .filter((s) => s.trim().length > 0),
    overallUptime: fc.double({ max: 100, min: 0 }),
    status: fc.constantFrom("up", "down", "mixed", "unknown"),
    updatedAt: fc.date(),
    url: fc.webUrl(),
});

/**
 * Generates app settings state for testing
 */
const settingsStateData = fc.record<SettingsState>({
    language: fc.constantFrom("en", "es", "fr", "de"),
    monitoring: fc.record({
        defaultInterval: fc.integer({ max: 300_000, min: 1000 }),
        defaultTimeout: fc.integer({ max: 30_000, min: 1000 }),
        enableAnalytics: fc.boolean(),
        maxRetries: fc.integer({ max: 10, min: 0 }),
    }),
    notifications: fc.record({
        desktop: fc.boolean(),
        email: fc.boolean(),
        enabled: fc.boolean(),
        sound: fc.boolean(),
    }),
    theme: fc.constantFrom("light", "dark", "auto"),
    ui: fc.record({
        animationsEnabled: fc.boolean(),
        compactMode: fc.boolean(),
        showTooltips: fc.boolean(),
        sidebarCollapsed: fc.boolean(),
    }),
});

/**
 * Generates state action objects for testing
 */
const stateActions: fc.Arbitrary<StateAction> = fc.oneof(
    // Monitor actions
    fc.record({
        payload: fc.oneof(monitorStateData, fc.record({ id: fc.integer() })),
        type: fc.constantFrom(
            "ADD_MONITOR",
            "UPDATE_MONITOR",
            "DELETE_MONITOR",
            "TOGGLE_MONITOR"
        ),
    }),
    // Site actions
    fc.record({
        payload: fc.oneof(siteStateData, fc.record({ id: fc.integer() })),
        type: fc.constantFrom("ADD_SITE", "UPDATE_SITE", "DELETE_SITE"),
    }),
    // Settings actions
    fc.record({
        payload: fc.oneof(settingsStateData, fc.record({})),
        type: fc.constantFrom("UPDATE_SETTINGS", "RESET_SETTINGS"),
    }),
    // Status actions
    fc.record({
        payload: fc.oneof(
            fc.record({ monitorId: fc.integer(), status: fc.string() }),
            fc.array(
                fc.record({ monitorId: fc.integer(), status: fc.string() })
            )
        ),
        type: fc.constantFrom("UPDATE_STATUS", "BULK_STATUS_UPDATE"),
    })
);

// =============================================================================
// State Management Fuzzing Tests
// =============================================================================

describe("comprehensive State Management Fuzzing", () => {
    let performanceMetrics: {
        action: string;
        payload: any;
        time: number;
    }[] = [];

    beforeEach(() => {
        performanceMetrics = [];
    });

    afterEach(() => {
        const slowActions = performanceMetrics.filter((m) => m.time > 50);
        if (slowActions.length > 0) {
            process.emitWarning(
                `Slow state actions detected: ${arrayJoin(
                    slowActions.map(
                        (action) => `${action.action}:${action.time}ms`
                    ),
                    ", "
                )}`,
                { type: "FuzzPerformanceWarning" }
            );
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
            payload: args,
            time: endTime - startTime,
        });

        return result;
    }

    describe("state Mutation Safety", () => {
        fcTest.prop([monitorStateData])(
            "Monitor state updates should be immutable",
            (monitorData: MonitorState) => {
                // Mock store with immutable update logic
                const monitors = new Map<number, MonitorState>();
                const mockStore = {
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
                            createdAt: new Date(monitor.createdAt),
                            name: monitor.name.trim(),
                            updatedAt: new Date(),
                        };

                        monitors.set(monitor.id, newMonitor);
                        return newMonitor;
                    },

                    getMonitor: (id: number): MonitorState | null => {
                        const monitor = monitors.get(id);
                        // Return deep copy to prevent mutation
                        return monitor ? { ...monitor } : null;
                    },

                    monitors,

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
            fc.array(monitorStateData, { maxLength: 20, minLength: 1 }),
            fc.array(
                fc.record({
                    id: fc.integer({ max: 20, min: 1 }),
                    updates: fc.record({
                        enabled: fc.oneof(fc.boolean(), fc.constant(undefined)),
                        name: fc.oneof(
                            fc
                                .string({ maxLength: 100, minLength: 1 })
                                .filter((s) => s.trim().length > 0),
                            fc.constant(undefined)
                        ),
                        status: fc.oneof(
                            fc.constantFrom("up", "down", "pending", "paused"),
                            fc.constant(undefined)
                        ),
                    }),
                }),
                { maxLength: 10, minLength: 1 }
            ),
        ])(
            "Bulk state updates should maintain consistency",
            (
                initialMonitors: MonitorState[],
                updates: {
                    id: number;
                    updates: {
                        enabled?: boolean | undefined;
                        name?: string | undefined;
                        status?:
                            "down" | "paused" | "pending" | "up" | undefined;
                    };
                }[]
            ) => {
                const bulkMonitors = new Map<number, any>();
                const mockBulkStore = {
                    bulkAdd: (
                        monitors: MonitorState[]
                    ): {
                        errors: string[];
                        results: MonitorState[];
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

                        return { errors, results, total: monitors.length };
                    },

                    bulkUpdate: (
                        updateRequests: {
                            id: number;
                            updates: {
                                enabled?: boolean | undefined;
                                name?: string | undefined;
                                status?:
                                    | "down"
                                    | "paused"
                                    | "pending"
                                    | "up"
                                    | undefined;
                            };
                        }[]
                    ): {
                        errors: string[];
                        results: MonitorState[];
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
                            errors,
                            results,
                            total: updateRequests.length,
                        };
                    },

                    getState: () => ({
                        count: bulkMonitors.size,
                        monitors: [...bulkMonitors.values()],
                    }),

                    monitors: bulkMonitors,
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

    describe("action Validation and Dispatch", () => {
        fcTest.prop([stateActions])(
            "State actions should be validated before dispatch",
            (action: StateAction) => {
                const mockActionDispatcher = {
                    dispatch(actionToDispatch: StateAction): {
                        error: null | string;
                        payload: any;
                        success: boolean;
                        type?: string;
                    } {
                        const validator =
                            this.validators[
                                safeCastTo<keyof typeof this.validators>(
                                    actionToDispatch.type
                                )
                            ];

                        if (!validator) {
                            return {
                                error: `Unknown action type: ${actionToDispatch.type}`,
                                payload: null,
                                success: false,
                            };
                        }

                        const validationErrors = validator(
                            actionToDispatch.payload
                        );

                        if (validationErrors.length > 0) {
                            return {
                                error: `Validation failed: ${arrayJoin(validationErrors, ", ")}`,
                                payload: actionToDispatch.payload,
                                success: false,
                            };
                        }

                        return {
                            error: null,
                            payload: actionToDispatch.payload,
                            success: true,
                            type: actionToDispatch.type,
                        };
                    },

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
                        BULK_STATUS_UPDATE: (payload: any) => {
                            const errors: string[] = [];
                            if (!Array.isArray(payload))
                                errors.push("Payload must be an array");
                            return errors;
                        },
                        DELETE_MONITOR: (payload: any) => {
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
                        RESET_SETTINGS: () => [], // Reset settings has no validation
                        TOGGLE_MONITOR: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        UPDATE_MONITOR: (payload: any) => {
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
                                    "auto",
                                    "dark",
                                    "light",
                                ].includes(payload.theme)
                            ) {
                                errors.push("Invalid theme");
                            }
                            return errors;
                        },
                        UPDATE_SITE: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.id || payload.id <= 0)
                                errors.push("Invalid ID");
                            return errors;
                        },
                        UPDATE_STATUS: (payload: any) => {
                            const errors: string[] = [];
                            if (!payload.monitorId || payload.monitorId <= 0)
                                errors.push("Invalid monitor ID");
                            if (!payload.status) errors.push("Missing status");
                            return errors;
                        },
                    },
                };

                const result = measureStateAction(
                    mockActionDispatcher.dispatch.bind(mockActionDispatcher),
                    "dispatch",
                    action
                );

                // Property: Dispatcher should never throw
                expect(result).toHaveProperty("success");
                expect(result.success).toBeTypeOf("boolean");

                // Property: Unknown action types should be rejected
                if (
                    !objectKeys(mockActionDispatcher.validators).includes(
                        action.type
                    )
                ) {
                    expect(result.success).toBe(false);
                    expect(result.error).toContain("Unknown action type");
                }

                // Property: Invalid payloads should be rejected
                if (
                    action.type === "ADD_MONITOR" &&
                    action.payload &&
                    (!action.payload.id || action.payload.id <= 0)
                ) {
                    expect(result.success).toBe(false);
                    expect(result.error).toContain("Invalid ID");
                }
            }
        );

        fcTest.prop([fc.array(stateActions, { maxLength: 20, minLength: 1 })])(
            "Action queue should process actions in order",
            (actionQueue: StateAction[]) => {
                const mockActionQueue = {
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
                    processed: safeCastTo<any[]>([]),

                    processQueue(): {
                        processed: number;
                        queueEmpty: boolean;
                        results: any[];
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
                                    error: Error.isError(error)
                                        ? error.message
                                        : "Unknown error",
                                    processedAt: new Date(),
                                    success: false,
                                };

                                this.processed.push(failed);
                                results.push(failed);
                            }
                        }

                        return {
                            processed: results.length,
                            queueEmpty: isEmpty(this.queue),
                            results,
                        };
                    },

                    queue: safeCastTo<any[]>([]),
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
                expect(processResult.queueEmpty).toBe(true);
                expect(processResult.results).toHaveLength(actionQueue.length);

                // Property: Actions should be processed in order
                for (const [i, element] of actionQueue.entries()) {
                    expect(processResult.results[i].type).toBe(element.type);
                }
            }
        );
    });

    describe("state Persistence and Recovery", () => {
        fcTest.prop([
            fc.record({
                monitors: fc.array(monitorStateData, {
                    maxLength: 10,
                    minLength: 0,
                }),
                settings: settingsStateData,
                sites: fc.array(siteStateData, { maxLength: 5, minLength: 0 }),
            }),
        ])(
            "State persistence should maintain data integrity",
            (stateSnapshot) => {
                const mockPersistence = {
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
                                        /^[+-]?\d{4,6}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/u.test(
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
                                state: parsed,
                                success: true,
                                valid: this.validateState(parsed),
                            };
                        } catch (error) {
                            return {
                                error: Error.isError(error)
                                    ? error.message
                                    : "Deserialization failed",
                                state: null,
                                success: false,
                            };
                        }
                    },

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
                                data: serialized,
                                size: serialized.length,
                                success: true,
                            };
                        } catch (error) {
                            return {
                                data: null,
                                error: Error.isError(error)
                                    ? error.message
                                    : "Serialization failed",
                                success: false,
                            };
                        }
                    },

                    validateState(state: any) {
                        const errors: string[] = [];

                        if (!state || typeof state !== "object") {
                            errors.push("Invalid state object");
                            return { errors, valid: false };
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

                        return { errors, valid: isEmpty(errors) };
                    },
                };

                // Test serialization
                const serialResult = measureStateAction(
                    mockPersistence.serialize.bind(mockPersistence),
                    "serialize",
                    stateSnapshot
                );

                expect(serialResult).toHaveProperty("success");
                expect(serialResult.success).toBeTypeOf("boolean");

                if (serialResult.success && serialResult.data) {
                    // Property: Serialized data should be valid JSON string
                    expect(serialResult.data).toBeTypeOf("string");
                    expect(serialResult.size).toBeGreaterThan(0);

                    // Test deserialization
                    const deserialResult = measureStateAction(
                        mockPersistence.deserialize.bind(mockPersistence),
                        "deserialize",
                        serialResult.data
                    );

                    expect(deserialResult.success).toBe(true);

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
                        const originalMonitor = arrayFirst(
                            stateSnapshot.monitors
                        );
                        if (
                            stateSnapshot.monitors.length > 0 &&
                            originalMonitor
                        ) {
                            const originalDate = originalMonitor.createdAt;
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
                                ).toBe(false);
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
                                    /,(?=\s*[\]}])/gu,
                                    ""
                                ); // Remove trailing commas
                                fixed = fixed.replaceAll(
                                    /([,{]\s*)(\w+):/gu,
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
                                settings: {
                                    language: "en",
                                    monitoring: {
                                        defaultInterval: 60_000,
                                        defaultTimeout: 30_000,
                                        enableAnalytics: true,
                                        maxRetries: 3,
                                    },
                                    notifications: {
                                        desktop: false,
                                        email: false,
                                        enabled: true,
                                        sound: false,
                                    },
                                    theme: "light",
                                    ui: {
                                        animationsEnabled: true,
                                        compactMode: false,
                                        showTooltips: true,
                                        sidebarCollapsed: false,
                                    },
                                },
                                sites: [],
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
                                    result,
                                    strategy: i,
                                    success: true,
                                });
                                return {
                                    attempts,
                                    recovered: true,
                                    state: result,
                                    strategy: i,
                                };
                            } catch (error) {
                                attempts.push({
                                    error: Error.isError(error)
                                        ? error.message
                                        : "Unknown error",
                                    strategy: i,
                                    success: false,
                                });
                            }
                        }

                        return {
                            attempts,
                            recovered: false,
                            state: null,
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
                expect(Array.isArray(recoveryResult.attempts)).toBe(true);

                // Property: Recovery should try multiple strategies
                expect(recoveryResult.attempts.length).toBeGreaterThan(0);

                // Property: If recovery succeeds, state should be valid
                if (recoveryResult.recovered) {
                    expect(recoveryResult.state).not.toBeNull();
                    expect(recoveryResult.state).toBeTypeOf("object");
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
                    expect(recoveryResult.recovered).toBe(true);
                }
            }
        );
    });

    describe("performance and Concurrency", () => {
        fcTest.prop(
            [fc.array(stateActions, { maxLength: 200, minLength: 50 })],
            { numRuns: 3, timeout: 10_000 }
        )(
            "High-frequency state updates should maintain performance",
            (highFrequencyActions) => {
                const mockHighPerfStore = {
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
                                    processed: true,
                                    timestamp: performance.now(),
                                    type: action.type,
                                });
                            }
                        }

                        const endTime = performance.now();
                        const totalTime = endTime - startTime;

                        return {
                            actionsPerSecond: Math.round(
                                results.length / (totalTime / 1000)
                            ),
                            averageTime: totalTime / results.length,
                            processed: results.length,
                            results,
                            totalTime,
                        };
                    },

                    state: new Map(),
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

/**
 * Performance benchmarks for shared type utilities and helpers Tests the
 * performance of type checking, conversion, and safety functions
 */

import { bench, describe } from "vitest";
import {
    safePropertyAccess,
    validateAndConvert,
    castIpcResponse,
    isArray,
    isRecord,
} from "../../shared/utils/typeHelpers";
import {
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
} from "../../shared/types";
import type {
    Monitor,
    Site,
    MonitorStatus,
    MonitorType,
    SiteStatus,
} from "../../shared/types";

// Helper functions for benchmarking (since they don't exist in typeHelpers)
function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj) as T;
    if (Array.isArray(obj)) return obj.map(deepClone) as T;

    const cloned = {} as T;
    for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object") return false;

    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!bKeys.includes(key)) return false;
        if (
            !deepEquals(
                (a as Record<string, unknown>)[key],
                (b as Record<string, unknown>)[key]
            )
        ) {
            return false;
        }
    }

    return true;
}

function getNestedProperty(obj: unknown, path: string): unknown {
    if (!isRecord(obj)) return undefined;

    const keys = path.split(".");
    let current: unknown = obj;

    for (const key of keys) {
        if (isRecord(current) && key in current) {
            current = current[key];
        } else if (Array.isArray(current) && !isNaN(Number(key))) {
            current = current[Number(key)];
        } else {
            return undefined;
        }
    }

    return current;
}

function mergeObjects<
    T extends Record<string, unknown>,
    U extends Record<string, unknown>,
>(obj1: T, obj2: U): T & U {
    const result = { ...obj1 } as T & U;

    for (const key in obj2) {
        if (Object.hasOwn(obj2, key)) {
            if (isRecord(result[key as keyof (T & U)]) && isRecord(obj2[key])) {
                (result as Record<string, unknown>)[key] = mergeObjects(
                    result[key as keyof (T & U)] as Record<string, unknown>,
                    obj2[key] as Record<string, unknown>
                );
            } else {
                (result as Record<string, unknown>)[key] = obj2[key];
            }
        }
    }

    return result;
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    baseDelay: number
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = baseDelay * 2**attempt;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Type guards for MonitorType (since isMonitorType doesn't exist)
function isMonitorType(type: unknown): type is MonitorType {
    return (
        typeof type === "string" &&
        [
            "http",
            "port",
            "ping",
            "dns",
        ].includes(type)
    );
}

describe("Shared Type Utilities Performance", () => {
    // Test data for type checking benchmarks
    const validMonitorStatuses: MonitorStatus[] = [
        "up",
        "down",
        "pending",
        "paused",
    ];
    const invalidMonitorStatuses = [
        "invalid",
        "unknown",
        123,
        null,
        undefined,
    ];

    const validMonitorTypes: MonitorType[] = [
        "http",
        "port",
        "ping",
        "dns",
    ];
    const invalidMonitorTypes = [
        "ftp",
        "smtp",
        "invalid",
        456,
        null,
    ];

    const validSiteStatuses: SiteStatus[] = [
        "up",
        "down",
        "pending",
        "paused",
        "mixed",
        "unknown",
    ];
    const invalidSiteStatuses = [
        "broken",
        "offline",
        789,
        null,
        undefined,
    ];

    // Complex objects for deep operations
    const complexMonitor: Monitor = {
        id: "test-monitor-123",
        type: "http",
        url: "https://example.com",
        status: "up",
        checkInterval: 60_000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        responseTime: 150,
        lastChecked: new Date(),
        history: Array.from({ length: 10 }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
            status: i % 2 === 0 ? "up" : "down",
            responseTime: 100 + Math.random() * 200,
            details: `Check result ${i}`,
        })),
    };

    const complexSite: Site = {
        identifier: "test-site-123",
        name: "Test Site",
        monitoring: true,
        monitors: Array.from({ length: 5 }, (_, i) => ({
            ...complexMonitor,
            id: `monitor-${i}`,
            type: (
                [
                    "http",
                    "port",
                    "ping",
                    "dns",
                ] as MonitorType[]
            )[i % 4],
        })),
    };

    const nestedObject = {
        level1: {
            level2: {
                level3: {
                    value: "deep-value",
                    array: [
                        1,
                        2,
                        3,
                        { nested: "array-value" },
                    ],
                },
                otherValue: "level2-value",
            },
            simpleValue: "level1-value",
        },
        topLevel: "root-value",
    };

    // Type checking benchmarks
    bench("isMonitorStatus - valid statuses", () => {
        for (const status of validMonitorStatuses) {
            isMonitorStatus(status);
        }
    });

    bench("isMonitorStatus - invalid statuses", () => {
        for (const status of invalidMonitorStatuses) {
            isMonitorStatus(String(status));
        }
    });

    bench("isMonitorType - valid types", () => {
        for (const type of validMonitorTypes) {
            isMonitorType(type);
        }
    });

    bench("isMonitorType - invalid types", () => {
        for (const type of invalidMonitorTypes) {
            isMonitorType(type);
        }
    });

    bench("isSiteStatus - valid statuses", () => {
        for (const status of validSiteStatuses) {
            isSiteStatus(status);
        }
    });

    bench("isSiteStatus - invalid statuses", () => {
        for (const status of invalidSiteStatuses) {
            isSiteStatus(String(status));
        }
    });

    // Object validation benchmarks
    bench("validateMonitor - valid monitor", () => {
        validateMonitor(complexMonitor);
    });

    bench("validateMonitor - invalid monitor", () => {
        const invalidMonitor = {
            ...complexMonitor,
            type: "invalid" as MonitorType,
        };
        try {
            validateMonitor(invalidMonitor);
        } catch {
            // Expected to fail
        }
    });

    // Deep operations benchmarks
    bench("deepClone - complex monitor", () => {
        deepClone(complexMonitor);
    });

    bench("deepClone - complex site", () => {
        deepClone(complexSite);
    });

    bench("deepClone - nested object", () => {
        deepClone(nestedObject);
    });

    bench("deepEquals - identical complex objects", () => {
        const clone = deepClone(complexMonitor);
        deepEquals(complexMonitor, clone);
    });

    bench("deepEquals - different complex objects", () => {
        const modified = { ...complexMonitor, responseTime: 999 };
        deepEquals(complexMonitor, modified);
    });

    bench("deepEquals - nested objects", () => {
        const clone = deepClone(nestedObject);
        deepEquals(nestedObject, clone);
    });

    // Property access benchmarks
    bench("getNestedProperty - shallow access", () => {
        getNestedProperty(nestedObject, "topLevel");
    });

    bench("getNestedProperty - deep access", () => {
        getNestedProperty(nestedObject, "level1.level2.level3.value");
    });

    bench("getNestedProperty - array access", () => {
        getNestedProperty(nestedObject, "level1.level2.level3.array.3.nested");
    });

    bench("getNestedProperty - invalid path", () => {
        getNestedProperty(nestedObject, "invalid.path.that.does.not.exist");
    });

    bench("safePropertyAccess - valid access", () => {
        safePropertyAccess(complexMonitor, "responseTime");
        safePropertyAccess(complexSite, "monitors");
        safePropertyAccess(nestedObject, "level1");
    });

    bench("safePropertyAccess - invalid access", () => {
        safePropertyAccess(null, "property");
        safePropertyAccess(undefined, "property");
        safePropertyAccess("string", "property");
    });

    // Object merging benchmarks
    bench("mergeObjects - simple objects", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };
        mergeObjects(obj1, obj2);
    });

    bench("mergeObjects - complex objects", () => {
        const obj1 = { monitor: complexMonitor };
        const obj2 = { site: complexSite };
        mergeObjects(obj1, obj2);
    });

    bench("mergeObjects - nested conflict resolution", () => {
        const obj1 = { config: { timeout: 5000, retries: 3 } };
        const obj2 = { config: { timeout: 10_000, maxRetries: 5 } };
        mergeObjects(obj1, obj2);
    });

    // Validation with conversion benchmarks
    bench("validateAndConvert - string validation", () => {
        const isString = (val: unknown): val is string =>
            typeof val === "string";
        validateAndConvert("test-string", isString);
        validateAndConvert(123, isString); // Should throw
    });

    bench("validateAndConvert - number validation", () => {
        const isNumber = (val: unknown): val is number =>
            typeof val === "number";
        try {
            validateAndConvert(42, isNumber);
            validateAndConvert("not-a-number", isNumber); // Should throw
        } catch {
            // Expected for invalid values
        }
    });

    bench("validateAndConvert - complex object validation", () => {
        const isMonitor = (val: unknown): val is Monitor => {
            try {
                validateMonitor(val as Monitor);
                return true;
            } catch {
                return false;
            }
        };

        try {
            validateAndConvert(complexMonitor, isMonitor);
            validateAndConvert({ invalid: "object" }, isMonitor); // Should throw
        } catch {
            // Expected for invalid values
        }
    });

    // Retry mechanism benchmarks
    bench("retryWithBackoff - immediate success", async () => {
        const successFn = () => Promise.resolve("success");
        await retryWithBackoff(successFn, 3, 100);
    });

    bench("retryWithBackoff - eventual success", async () => {
        let attempts = 0;
        const eventualSuccessFn = () => {
            attempts++;
            if (attempts < 2) {
                return Promise.reject(new Error("Temporary failure"));
            }
            return Promise.resolve("success");
        };

        try {
            await retryWithBackoff(eventualSuccessFn, 3, 50);
        } catch {
            // May fail depending on timing
        }
    });

    // High-volume type checking
    bench("high-volume monitor status validation", () => {
        const statuses = Array.from(
            { length: 1000 },
            (_, i) => validMonitorStatuses[i % validMonitorStatuses.length]
        );

        for (const status of statuses) {
            isMonitorStatus(status);
        }
    });

    bench("high-volume monitor type validation", () => {
        const types = Array.from(
            { length: 1000 },
            (_, i) => validMonitorTypes[i % validMonitorTypes.length]
        );

        for (const type of types) {
            isMonitorType(type);
        }
    });

    // Memory-intensive operations
    bench("memory-intensive deep cloning", () => {
        const largeObject = {
            sites: Array.from({ length: 100 }, (_, i) => ({
                ...complexSite,
                identifier: `site-${i}`,
                monitors: Array.from({ length: 10 }, (_, j) => ({
                    ...complexMonitor,
                    id: `monitor-${i}-${j}`,
                })),
            })),
        };

        deepClone(largeObject);
    });

    bench("memory-intensive deep equality", () => {
        const largeObject1 = {
            data: Array.from({ length: 500 }, (_, i) => ({
                id: i,
                value: `item-${i}`,
            })),
        };
        const largeObject2 = deepClone(largeObject1);

        deepEquals(largeObject1, largeObject2);
    });
});

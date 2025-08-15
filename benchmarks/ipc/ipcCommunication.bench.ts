/**
 * IPC Communication Performance Benchmarks
 *
 * @file Performance benchmarks for IPC communication including serialization,
 *   deserialization, message passing, and validation operations.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Performance
 *
 * @benchmark IPC
 *
 * @tags ["performance", "ipc", "serialization", "communication"]
 */

import { bench, describe } from "vitest";

// Type definitions for benchmarking
interface Site {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: Monitor[];
}

interface Monitor {
    id: string;
    type: "http" | "ping" | "port";
    monitoring: boolean;
    checkInterval: number;
    timeout: number;
    retryAttempts: number;
    responseTime: number;
    status: "up" | "down" | "pending";
    history: StatusHistory[];
    url?: string;
    host?: string;
    port?: number;
}

interface StatusHistory {
    id: string;
    monitorId: string;
    status: "up" | "down";
    responseTime: number;
    timestamp: number;
}

// Mock data generators for benchmarking
function generateTestSites(count: number): Site[] {
    return Array.from({ length: count }, (_, i) => ({
        identifier: `site-${i}`,
        name: `Test Site ${i}`,
        monitoring: true,
        monitors: [],
    }));
}

function generateTestMonitors(count: number): Monitor[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `monitor-${i}`,
        type: "http" as const,
        monitoring: true,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: Math.random() * 1000,
        status: "up" as const,
        history: [],
        url: `https://example${i}.com`,
    }));
}

function generateTestHistory(count: number): StatusHistory[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `history-${i}`,
        monitorId: `monitor-${i % 500}`,
        status: Math.random() > 0.1 ? "up" : ("down" as const),
        responseTime: Math.random() * 1000,
        timestamp: Date.now() - i * 60_000,
    }));
}

// Benchmark utility functions
function serializeData(data: any): string {
    return JSON.stringify(data);
}

function deserializeData(jsonString: string): any {
    return JSON.parse(jsonString);
}

function validateSiteStructure(site: Site): boolean {
    return Boolean(
        site.identifier && site.name && Array.isArray(site.monitors)
    );
}

function validateMonitorData(monitor: Monitor): boolean {
    return Boolean(
        monitor.id &&
            monitor.type &&
            typeof monitor.checkInterval === "number" &&
            typeof monitor.timeout === "number"
    );
}

describe("IPC Communication Performance Benchmarks", () => {
    // Test data setup
    const smallSites = generateTestSites(10);
    const largeSites = generateTestSites(1000);
    const testMonitors = generateTestMonitors(500);
    const testHistory = generateTestHistory(10_000);

    // Pre-serialized data for deserialization benchmarks
    const serializedSmallSites = serializeData(smallSites);
    const serializedLargeSites = serializeData(largeSites);
    const serializedMonitors = serializeData(testMonitors);
    const serializedHistory = serializeData(testHistory);

    describe("Message Serialization Benchmarks", () => {
        bench(
            "serialize small site object",
            () => {
                serializeData(smallSites[0]);
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "serialize large sites array",
            () => {
                serializeData(largeSites);
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "serialize monitors with history",
            () => {
                const monitorsWithHistory = testMonitors
                    .slice(0, 50)
                    .map((monitor) => ({
                        ...monitor,
                        history: testHistory
                            .filter((h) => h.monitorId === monitor.id)
                            .slice(0, 100),
                    }));
                serializeData(monitorsWithHistory);
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "serialize status history bulk",
            () => {
                serializeData(testHistory);
            },
            {
                time: 3000,
                iterations: 50,
            }
        );
    });

    describe("Message Deserialization Benchmarks", () => {
        bench(
            "deserialize small sites array",
            () => {
                deserializeData(serializedSmallSites);
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "deserialize large sites array",
            () => {
                deserializeData(serializedLargeSites);
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "deserialize monitors array",
            () => {
                deserializeData(serializedMonitors);
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "deserialize history array",
            () => {
                deserializeData(serializedHistory);
            },
            {
                time: 3000,
                iterations: 50,
            }
        );
    });

    describe("Data Validation Performance", () => {
        bench(
            "validate site structure",
            () => {
                validateSiteStructure(smallSites[0]);
            },
            {
                time: 1000,
                iterations: 10000,
            }
        );

        bench(
            "validate bulk sites",
            () => {
                largeSites.every((site) => validateSiteStructure(site));
            },
            {
                time: 2000,
                iterations: 100,
            }
        );

        bench(
            "validate complex monitor data",
            () => {
                testMonitors.every((monitor) => validateMonitorData(monitor));
            },
            {
                time: 2000,
                iterations: 100,
            }
        );
    });

    describe("Error Handling Performance", () => {
        bench(
            "handle serialization errors gracefully",
            () => {
                const circularObj: any = {};
                circularObj.self = circularObj;

                try {
                    serializeData(circularObj);
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Unknown error";
                    Boolean(errorMessage);
                }
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );

        bench(
            "recover from malformed JSON",
            () => {
                const malformedData = '{"incomplete": json';
                try {
                    deserializeData(malformedData);
                } catch {
                    const fallback = { success: false, error: "Invalid JSON" };
                    serializeData(fallback);
                }
            },
            {
                time: 1000,
                iterations: 1000,
            }
        );
    });
});

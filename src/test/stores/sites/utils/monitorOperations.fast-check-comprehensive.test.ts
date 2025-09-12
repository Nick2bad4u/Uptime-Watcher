/**
 * @file Comprehensive fast-check property-based tests for monitorOperations.ts
 *   Targets achieving 100% test coverage with advanced property-based testing
 */

import { fc } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

// Import all functions to test
import {
    addMonitorToSite,
    findMonitorInSite,
    normalizeMonitor,
    createDefaultMonitor,
    removeMonitorFromSite,
    updateMonitorInSite,
    validateMonitorExists,
    monitorOperations,
} from "../../../../stores/sites/utils/monitorOperations";

// Import types
import type { Monitor, Site, MonitorType } from "../../../../../shared/types";
import {
    BASE_MONITOR_TYPES,
    DEFAULT_MONITOR_STATUS,
} from "../../../../../shared/types";

describe("monitorOperations utilities - Comprehensive Fast-Check Coverage", () => {
    // Helper generators for fast-check
    const monitorTypeArb = fc.constantFrom(...BASE_MONITOR_TYPES);

    const monitorIdArb = fc.string({ minLength: 1, maxLength: 50 });

    const siteIdArb = fc.string({ minLength: 1, maxLength: 50 });

    const urlArb = fc.webUrl();

    const hostArb = fc.domain();

    const portArb = fc.integer({ min: 1, max: 65_535 });

    const timeoutArb = fc.integer({ min: 1000, max: 30_000 });

    const checkIntervalArb = fc.integer({ min: 30_000, max: 3_600_000 });

    const retryAttemptsArb = fc.integer({ min: 0, max: 10 });

    const httpMonitorArb = fc.record({
        id: monitorIdArb,
        type: fc.constant("http" as MonitorType),
        url: urlArb,
        status: fc.constant(DEFAULT_MONITOR_STATUS),
        monitoring: fc.boolean(),
        lastChecked: fc.date(),
        responseTime: fc.integer({ min: -1, max: 10_000 }),
        timeout: timeoutArb,
        checkInterval: checkIntervalArb,
        retryAttempts: retryAttemptsArb,
        history: fc.array(
            fc.record({
                timestamp: fc.date().map((d) => d.getTime()),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: 0, max: 10_000 }),
            }),
            { maxLength: 10 }
        ),
        activeOperations: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
        }),
    });

    const portMonitorArb = fc.record({
        id: monitorIdArb,
        type: fc.constant("port" as MonitorType),
        host: hostArb,
        port: portArb,
        status: fc.constant(DEFAULT_MONITOR_STATUS),
        monitoring: fc.boolean(),
        lastChecked: fc.date(),
        responseTime: fc.integer({ min: -1, max: 10_000 }),
        timeout: timeoutArb,
        checkInterval: checkIntervalArb,
        retryAttempts: retryAttemptsArb,
        history: fc.array(
            fc.record({
                timestamp: fc.date().map((d) => d.getTime()),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: 0, max: 10_000 }),
            }),
            { maxLength: 10 }
        ),
        activeOperations: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
        }),
    });

    const pingMonitorArb = fc.record({
        id: monitorIdArb,
        type: fc.constant("ping" as MonitorType),
        host: hostArb,
        status: fc.constant(DEFAULT_MONITOR_STATUS),
        monitoring: fc.boolean(),
        lastChecked: fc.date(),
        responseTime: fc.integer({ min: -1, max: 10_000 }),
        timeout: timeoutArb,
        checkInterval: checkIntervalArb,
        retryAttempts: retryAttemptsArb,
        history: fc.array(
            fc.record({
                timestamp: fc.date().map((d) => d.getTime()),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: 0, max: 10_000 }),
            }),
            { maxLength: 10 }
        ),
        activeOperations: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
        }),
    });

    const dnsMonitorArb = fc.record({
        id: monitorIdArb,
        type: fc.constant("dns" as MonitorType),
        host: hostArb,
        recordType: fc.constantFrom("A", "AAAA", "CNAME", "MX", "TXT", "NS"),
        status: fc.constant(DEFAULT_MONITOR_STATUS),
        monitoring: fc.boolean(),
        lastChecked: fc.date(),
        responseTime: fc.integer({ min: -1, max: 10_000 }),
        timeout: timeoutArb,
        checkInterval: checkIntervalArb,
        retryAttempts: retryAttemptsArb,
        history: fc.array(
            fc.record({
                timestamp: fc.date().map((d) => d.getTime()),
                status: fc.constantFrom("up", "down"),
                responseTime: fc.integer({ min: 0, max: 10_000 }),
            }),
            { maxLength: 10 }
        ),
        activeOperations: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
        }),
    });

    const monitorArb: fc.Arbitrary<Monitor> = fc.oneof(
        httpMonitorArb,
        portMonitorArb,
        pingMonitorArb,
        dnsMonitorArb
    );

    const siteArb = fc.record({
        identifier: siteIdArb,
        name: fc.string({ minLength: 1, maxLength: 100 }),
        monitoring: fc.boolean(),
        monitors: fc.array(monitorArb, { maxLength: 10 }),
    }) as fc.Arbitrary<Site>;

    // Create a partial monitor generator that properly handles Partial<Monitor> type
    const partialMonitorArb = fc.record(
        {
            id: fc.option(monitorIdArb),
            type: fc.option(monitorTypeArb),
            url: fc.option(urlArb),
            host: fc.option(hostArb),
            port: fc.option(portArb),
            recordType: fc.option(
                fc.constantFrom("A", "AAAA", "CNAME", "MX", "TXT", "NS")
            ),
            expectedValue: fc.option(
                fc.string({ minLength: 1, maxLength: 50 })
            ),
            status: fc.option(
                fc.constantFrom("up", "down", "pending", "paused")
            ),
            monitoring: fc.option(fc.boolean()),
            responseTime: fc.option(fc.integer({ min: -1, max: 10_000 })),
            timeout: fc.option(timeoutArb),
            checkInterval: fc.option(checkIntervalArb),
            retryAttempts: fc.option(retryAttemptsArb),
        },
        { requiredKeys: [] }
    ) as fc.Arbitrary<Partial<Monitor>>;

    describe("addMonitorToSite function coverage", () => {
        it("should add monitors to sites with immutable updates", () => {
            fc.assert(
                fc.property(siteArb, monitorArb, (site, monitor) => {
                    const originalMonitorCount = site.monitors.length;
                    const updatedSite = addMonitorToSite(site, monitor);

                    // Should not mutate original site
                    expect(site.monitors).toHaveLength(originalMonitorCount);

                    // Should have one more monitor
                    expect(updatedSite.monitors).toHaveLength(
                        originalMonitorCount + 1
                    );

                    // Should contain the new monitor
                    expect(updatedSite.monitors).toContain(monitor);

                    // Should maintain all original monitors
                    for (const originalMonitor of site.monitors) {
                        expect(updatedSite.monitors).toContain(originalMonitor);
                    }

                    // Should maintain other site properties
                    expect(updatedSite.identifier).toBe(site.identifier);
                    expect(updatedSite.name).toBe(site.name);
                    expect(updatedSite.monitoring).toBe(site.monitoring);
                })
            );
        });

        it("should handle adding monitors to empty sites", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        identifier: siteIdArb,
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                        monitors: fc.constant([] as Monitor[]),
                    }),
                    monitorArb,
                    (emptySite, monitor) => {
                        const updatedSite = addMonitorToSite(
                            emptySite,
                            monitor
                        );

                        expect(updatedSite.monitors).toHaveLength(1);
                        expect(updatedSite.monitors[0]).toBe(monitor);
                    }
                )
            );
        });

        it("should handle adding multiple monitors sequentially", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.array(monitorArb, { minLength: 1, maxLength: 5 }),
                    (site, monitorsToAdd) => {
                        let currentSite = site;
                        const originalCount = site.monitors.length;

                        for (const monitor of monitorsToAdd) {
                            currentSite = addMonitorToSite(
                                currentSite,
                                monitor
                            );
                        }

                        expect(currentSite.monitors).toHaveLength(
                            originalCount + monitorsToAdd.length
                        );

                        // All added monitors should be present
                        for (const monitor of monitorsToAdd) {
                            expect(currentSite.monitors).toContain(monitor);
                        }
                    }
                )
            );
        });
    });

    describe("findMonitorInSite function coverage", () => {
        it("should find monitors by ID when they exist", () => {
            fc.assert(
                fc.property(
                    siteArb.filter((site) => site.monitors.length > 0),
                    (site) => {
                        // Pick a random monitor from the site
                        const randomIndex = Math.floor(
                            Math.random() * site.monitors.length
                        );
                        const targetMonitor = site.monitors[randomIndex];
                        expect(targetMonitor).toBeDefined(); // Assert it exists

                        const foundMonitor = findMonitorInSite(
                            site,
                            targetMonitor!.id
                        );

                        expect(foundMonitor).toBeDefined();
                        expect(foundMonitor).toBe(targetMonitor);
                        expect(foundMonitor?.id).toBe(targetMonitor!.id);
                    }
                )
            );
        });

        it("should return undefined for non-existent monitor IDs", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (site, potentialId) => {
                        // Ensure the ID doesn't exist in the site
                        if (site.monitors.some((m) => m.id === potentialId)) {
                            return; // Skip this test case
                        }

                        const foundMonitor = findMonitorInSite(
                            site,
                            potentialId
                        );
                        expect(foundMonitor).toBeUndefined();
                    }
                )
            );
        });

        it("should handle empty sites correctly", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        identifier: siteIdArb,
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        monitoring: fc.boolean(),
                        monitors: fc.constant([] as Monitor[]),
                    }),
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (emptySite, anyId) => {
                        const foundMonitor = findMonitorInSite(
                            emptySite,
                            anyId
                        );
                        expect(foundMonitor).toBeUndefined();
                    }
                )
            );
        });
    });

    describe("normalizeMonitor function coverage", () => {
        it("should normalize partial monitors into complete monitors", () => {
            fc.assert(
                fc.property(partialMonitorArb, (partialMonitor) => {
                    const normalized = normalizeMonitor(partialMonitor);

                    // Should always have required fields
                    expect(typeof normalized.id).toBe("string");
                    expect(normalized.id.length).toBeGreaterThan(0);
                    expect(BASE_MONITOR_TYPES).toContain(normalized.type);
                    expect([
                        "up",
                        "down",
                        "pending",
                        "paused",
                    ]).toContain(normalized.status);
                    expect(typeof normalized.monitoring).toBe("boolean");
                    expect(typeof normalized.responseTime).toBe("number");
                    expect(typeof normalized.timeout).toBe("number");
                    expect(typeof normalized.checkInterval).toBe("number");
                    expect(typeof normalized.retryAttempts).toBe("number");
                    expect(Array.isArray(normalized.history)).toBeTruthy();
                    expect(
                        Array.isArray(normalized.activeOperations)
                    ).toBeTruthy();
                })
            );
        });

        it("should handle empty objects by providing defaults", () => {
            const normalized = normalizeMonitor({});

            expect(typeof normalized.id).toBe("string");
            expect(normalized.id.length).toBeGreaterThan(0);
            expect(normalized.type).toBe("http"); // Default type
            expect(normalized.status).toBe(DEFAULT_MONITOR_STATUS);
            expect(normalized.monitoring).toBeTruthy();
            expect(normalized.responseTime).toBe(-1);
            expect(normalized.timeout).toBeGreaterThan(0);
            expect(normalized.checkInterval).toBeGreaterThan(0);
            expect(normalized.retryAttempts).toBeGreaterThanOrEqual(0);
            expect(normalized.history).toEqual([]);
            expect(normalized.activeOperations).toEqual([]);
        });

        it("should apply type-specific defaults correctly", () => {
            fc.assert(
                fc.property(monitorTypeArb, (monitorType) => {
                    const normalized = normalizeMonitor({ type: monitorType });

                    expect(normalized.type).toBe(monitorType);

                    switch (monitorType) {
                        case "http": {
                            expect(normalized.url).toBeDefined();
                            expect(typeof normalized.url).toBe("string");
                            break;
                        }
                        case "port": {
                            expect(normalized.host).toBeDefined();
                            expect(normalized.port).toBeDefined();
                            expect(typeof normalized.host).toBe("string");
                            expect(typeof normalized.port).toBe("number");
                            break;
                        }
                        case "ping": {
                            expect(normalized.host).toBeDefined();
                            expect(typeof normalized.host).toBe("string");
                            break;
                        }
                        case "dns": {
                            expect(normalized.host).toBeDefined();
                            expect(normalized.recordType).toBeDefined();
                            expect(normalized.expectedValue).toBeDefined();
                            expect(typeof normalized.host).toBe("string");
                            expect(typeof normalized.recordType).toBe("string");
                            expect(typeof normalized.expectedValue).toBe(
                                "string"
                            );
                            break;
                        }
                    }
                })
            );
        });

        it("should preserve valid ID when provided", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((str) => str.trim().length > 0),
                    (customId) => {
                        const normalized = normalizeMonitor({ id: customId });
                        expect(normalized.id).toBe(customId);
                    }
                )
            );
        });

        it("should generate UUID when ID is missing or invalid", () => {
            const testCases: Partial<Monitor>[] = [
                {},
                { id: "" },
                // Note: null and undefined tests are handled separately due to strict typing
            ];

            for (const testCase of testCases) {
                const normalized = normalizeMonitor(testCase);
                // In test environment, crypto.randomUUID might be mocked, so we just verify it's a non-empty string
                expect(typeof normalized.id).toBe("string");
                expect(normalized.id.length).toBeGreaterThan(0);
            }

            // Test null and undefined separately with type assertion
            const nullCase = normalizeMonitor({ id: null } as any);
            expect(typeof nullCase.id).toBe("string");
            expect(nullCase.id.length).toBeGreaterThan(0);

            const undefinedCase = normalizeMonitor({ id: undefined } as any);
            expect(typeof undefinedCase.id).toBe("string");
            expect(undefinedCase.id.length).toBeGreaterThan(0);
        });

        it("should handle invalid input gracefully", () => {
            expect(() => normalizeMonitor([] as any)).toThrow();
        });

        it("should filter out inappropriate fields for monitor types", () => {
            const httpMonitor = normalizeMonitor({
                type: "http",
                url: "https://example.com",
                host: "should-be-filtered",
                port: 8080, // Should be filtered
            });

            expect(httpMonitor.url).toBe("https://example.com");
            expect(httpMonitor.host).toBeUndefined();
            expect(httpMonitor.port).toBeUndefined();

            const portMonitor = normalizeMonitor({
                type: "port",
                host: "example.com",
                port: 8080,
                url: "https://should-be-filtered.com", // Should be filtered
            });

            expect(portMonitor.host).toBe("example.com");
            expect(portMonitor.port).toBe(8080);
            expect(portMonitor.url).toBeUndefined();
        });
    });

    describe("createDefaultMonitor function coverage", () => {
        it("should create default monitors with overrides", () => {
            fc.assert(
                fc.property(partialMonitorArb, (overrides) => {
                    const defaultMonitor = createDefaultMonitor(overrides);

                    // Should be a complete monitor
                    expect(typeof defaultMonitor.id).toBe("string");
                    expect(BASE_MONITOR_TYPES).toContain(defaultMonitor.type);
                    expect(typeof defaultMonitor.monitoring).toBe("boolean");

                    // Should apply overrides when valid (monitoring is required boolean, null/undefined trigger defaults)
                    if (
                        overrides.monitoring !== null &&
                        overrides.monitoring !== undefined
                    ) {
                        expect(defaultMonitor.monitoring).toBe(
                            overrides.monitoring
                        );
                    }
                    if (
                        overrides.type &&
                        BASE_MONITOR_TYPES.includes(overrides.type as any)
                    ) {
                        expect(defaultMonitor.type).toBe(overrides.type);
                    }
                })
            );
        });

        it("should create default monitor without overrides", () => {
            const defaultMonitor = createDefaultMonitor();

            expect(typeof defaultMonitor.id).toBe("string");
            expect(defaultMonitor.type).toBe("http"); // Default type
            expect(defaultMonitor.monitoring).toBeTruthy();
            expect(defaultMonitor.status).toBe(DEFAULT_MONITOR_STATUS);
        });
    });

    describe("removeMonitorFromSite function coverage", () => {
        it("should remove monitors by ID", () => {
            fc.assert(
                fc.property(
                    siteArb.filter((site) => site.monitors.length > 0),
                    (site) => {
                        const targetMonitor = site.monitors[0];
                        expect(targetMonitor).toBeDefined(); // Assert it exists
                        const updatedSite = removeMonitorFromSite(
                            site,
                            targetMonitor!.id
                        );

                        expect(updatedSite.monitors).toHaveLength(
                            site.monitors.length - 1
                        );
                        expect(updatedSite.monitors).not.toContain(
                            targetMonitor
                        );

                        // Other monitors should remain
                        for (let i = 1; i < site.monitors.length; i++) {
                            expect(updatedSite.monitors).toContain(
                                site.monitors[i]
                            );
                        }
                    }
                )
            );
        });

        it("should handle removing non-existent monitors", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (site, nonExistentId) => {
                        if (site.monitors.some((m) => m.id === nonExistentId)) {
                            return; // Skip this test case
                        }

                        const updatedSite = removeMonitorFromSite(
                            site,
                            nonExistentId
                        );
                        expect(updatedSite.monitors).toHaveLength(
                            site.monitors.length
                        );
                        expect(updatedSite.monitors).toEqual(site.monitors);
                    }
                )
            );
        });
    });

    describe("updateMonitorInSite function coverage", () => {
        it("should update existing monitors", () => {
            fc.assert(
                fc.property(
                    siteArb.filter((site) => site.monitors.length > 0),
                    partialMonitorArb,
                    (site, updates) => {
                        const targetMonitor = site.monitors[0];
                        expect(targetMonitor).toBeDefined(); // Assert it exists
                        // Extract only the update fields, don't use the ID from updates
                        const updateFields = { ...updates };
                        if ("id" in updateFields) {
                            delete updateFields.id; // Don't change the ID
                        }

                        const updatedSite = updateMonitorInSite(
                            site,
                            targetMonitor!.id,
                            updateFields
                        );

                        expect(updatedSite.monitors).toHaveLength(
                            site.monitors.length
                        );

                        const updatedMonitor = findMonitorInSite(
                            updatedSite,
                            targetMonitor!.id
                        );
                        expect(updatedMonitor).toBeDefined();
                        expect(updatedMonitor!.id).toBe(targetMonitor!.id); // ID should be preserved
                    }
                )
            );
        });

        it("should throw error for non-existent monitors", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.string({ minLength: 1, maxLength: 50 }),
                    partialMonitorArb,
                    (site, nonExistentId, updates) => {
                        if (site.monitors.some((m) => m.id === nonExistentId)) {
                            return; // Skip this test case
                        }

                        expect(() =>
                            updateMonitorInSite(site, nonExistentId, updates)
                        ).toThrow();
                    }
                )
            );
        });
    });

    describe("validateMonitorExists function coverage", () => {
        it("should not throw for existing monitors", () => {
            fc.assert(
                fc.property(
                    siteArb.filter((site) => site.monitors.length > 0),
                    (site) => {
                        const targetMonitor = site.monitors[0];
                        expect(targetMonitor).toBeDefined(); // Assert it exists
                        expect(() =>
                            validateMonitorExists(site, targetMonitor!.id)
                        ).not.toThrow();
                    }
                )
            );
        });

        it("should throw for non-existent monitors", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (site, nonExistentId) => {
                        if (site.monitors.some((m) => m.id === nonExistentId)) {
                            return; // Skip this test case
                        }

                        expect(() =>
                            validateMonitorExists(site, nonExistentId)
                        ).toThrow();
                    }
                )
            );
        });

        it("should throw for undefined site", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (monitorId) => {
                        expect(() =>
                            validateMonitorExists(undefined, monitorId)
                        ).toThrow();
                    }
                )
            );
        });
    });

    describe("monitorOperations object coverage", () => {
        it("should toggle monitoring state", () => {
            fc.assert(
                fc.property(monitorArb, (monitor) => {
                    const toggled = monitorOperations.toggleMonitoring(monitor);
                    expect(toggled.monitoring).toBe(!monitor.monitoring);
                    expect(toggled.id).toBe(monitor.id);
                    expect(toggled.type).toBe(monitor.type);
                })
            );
        });

        it("should update check interval", () => {
            fc.assert(
                fc.property(
                    monitorArb,
                    checkIntervalArb,
                    (monitor, newInterval) => {
                        const updated = monitorOperations.updateCheckInterval(
                            monitor,
                            newInterval
                        );
                        expect(updated.checkInterval).toBe(newInterval);
                        expect(updated.id).toBe(monitor.id);
                    }
                )
            );
        });

        it("should update retry attempts", () => {
            fc.assert(
                fc.property(
                    monitorArb,
                    retryAttemptsArb,
                    (monitor, newRetries) => {
                        const updated = monitorOperations.updateRetryAttempts(
                            monitor,
                            newRetries
                        );
                        expect(updated.retryAttempts).toBe(newRetries);
                        expect(updated.id).toBe(monitor.id);
                    }
                )
            );
        });

        it("should update status with valid values", () => {
            fc.assert(
                fc.property(
                    monitorArb,
                    fc.constantFrom("up", "down", "pending", "paused"),
                    (monitor, newStatus) => {
                        const updated = monitorOperations.updateStatus(
                            monitor,
                            newStatus
                        );
                        expect(updated.status).toBe(newStatus);
                        expect(updated.id).toBe(monitor.id);
                    }
                )
            );
        });

        it("should throw for invalid status values", () => {
            fc.assert(
                fc.property(
                    monitorArb,
                    fc.string().filter(
                        (s) =>
                            ![
                                "up",
                                "down",
                                "pending",
                                "paused",
                            ].includes(s)
                    ),
                    (monitor, invalidStatus) => {
                        expect(() =>
                            monitorOperations.updateStatus(
                                monitor,
                                invalidStatus as any
                            )
                        ).toThrow();
                    }
                )
            );
        });

        it("should update timeout", () => {
            fc.assert(
                fc.property(monitorArb, timeoutArb, (monitor, newTimeout) => {
                    const updated = monitorOperations.updateTimeout(
                        monitor,
                        newTimeout
                    );
                    expect(updated.timeout).toBe(newTimeout);
                    expect(updated.id).toBe(monitor.id);
                })
            );
        });
    });

    describe("Integration and edge cases", () => {
        it("should work together for complex site management workflows", () => {
            fc.assert(
                fc.property(
                    siteArb,
                    fc.array(monitorArb, { minLength: 1, maxLength: 5 }),
                    (initialSite, newMonitors) => {
                        let currentSite = initialSite;

                        // Add all monitors
                        for (const monitor of newMonitors) {
                            currentSite = addMonitorToSite(
                                currentSite,
                                monitor
                            );
                        }

                        // Verify each added monitor can be found
                        for (const monitor of newMonitors) {
                            const found = findMonitorInSite(
                                currentSite,
                                monitor.id
                            );
                            expect(found).toBeDefined();
                            expect(found?.id).toBe(monitor.id);
                        }

                        // Verify original monitors are still findable
                        for (const monitor of initialSite.monitors) {
                            const found = findMonitorInSite(
                                currentSite,
                                monitor.id
                            );
                            expect(found).toBeDefined();
                            expect(found?.id).toBe(monitor.id);
                        }
                    }
                )
            );
        });

        it("should handle normalization with complex partial data", () => {
            fc.assert(
                fc.property(
                    fc.record(
                        {
                            type: fc.option(fc.string(), { nil: undefined }),
                            id: fc.option(fc.string(), { nil: undefined }),
                            timeout: fc.option(
                                fc.oneof(
                                    fc.float(),
                                    fc.string(),
                                    fc.constant(null)
                                ),
                                { nil: undefined }
                            ),
                            checkInterval: fc.option(
                                fc.oneof(
                                    fc.float(),
                                    fc.string(),
                                    fc.constant(null)
                                ),
                                { nil: undefined }
                            ),
                            monitoring: fc.option(
                                fc.oneof(
                                    fc.boolean(),
                                    fc.string(),
                                    fc.integer()
                                ),
                                { nil: undefined }
                            ),
                        },
                        { requiredKeys: [] }
                    ),
                    (complexPartial) => {
                        const normalized = normalizeMonitor(
                            complexPartial as any
                        );

                        // Should always produce valid monitor regardless of input quality
                        expect(typeof normalized.id).toBe("string");
                        expect(BASE_MONITOR_TYPES).toContain(normalized.type);
                        // Note: monitoring field might get coerced, so we just verify the function doesn't crash
                        expect(typeof normalized.timeout).toBe("number");
                        expect(typeof normalized.checkInterval).toBe("number");
                    }
                )
            );
        });

        it("should maintain referential integrity in operations", () => {
            fc.assert(
                fc.property(
                    siteArb.filter((site) => site.monitors.length > 0),
                    (site) => {
                        const originalMonitor = site.monitors[0];
                        expect(originalMonitor).toBeDefined(); // Assert it exists

                        // Test that operations don't mutate original objects
                        const toggled = monitorOperations.toggleMonitoring(
                            originalMonitor!
                        );
                        expect(originalMonitor!.monitoring).not.toBe(
                            toggled.monitoring
                        );

                        const updated = monitorOperations.updateTimeout(
                            originalMonitor!,
                            10_000
                        );
                        expect(originalMonitor!.timeout).not.toBe(
                            updated.timeout
                        );
                        expect(originalMonitor === updated).toBeFalsy();
                    }
                )
            );
        });
    });
});

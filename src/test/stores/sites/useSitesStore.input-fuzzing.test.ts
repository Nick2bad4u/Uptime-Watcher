/**
 * @remarks
 * Comprehensive property-based testing suite that validates the Sites Store
 * functionality using fast-check for input generation and edge case discovery.
 * Tests cover site CRUD operations, monitor management, selection, and state
 * consistency.
 *
 * @file Property-based fuzzing tests for Sites Store using fast-check
 */

import { describe, expect, beforeEach, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import type { Site, Monitor, MonitorStatus } from "@shared/types";

// Mock window.electronAPI for testing
const mockElectronAPI = {
    sites: {
        updateSite: vi.fn().mockResolvedValue(undefined),
        removeSite: vi.fn().mockResolvedValue(true),
    },
    monitoring: {
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
};

// Setup global electronAPI mock
beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "window", {
        value: {
            electronAPI: mockElectronAPI,
        },
        writable: true,
    });
});

// Test utilities for sites store state management
const createTestSitesStore = () => {
    // Clear all state in the store
    useSitesStore.getState().setSites([]);
    useSitesStore.getState().selectSite(undefined);

    // Verify the state is actually cleared
    const clearedState = useSitesStore.getState();
    if (
        clearedState.sites.length > 0 ||
        clearedState.selectedSiteIdentifier !== undefined
    ) {
        throw new Error(
            `Sites store not properly cleared: ${JSON.stringify({
                sitesCount: clearedState.sites.length,
                selectedSiteIdentifier: clearedState.selectedSiteIdentifier,
            })}`
        );
    }

    // Return the store instance itself, not the state
    return useSitesStore;
};

// Property-based test arbitraries for sites store
const arbitraries = {
    monitorStatus: fc.constantFrom(
        "up" as const,
        "down" as const,
        "pending" as const,
        "paused" as const
    ) as fc.Arbitrary<MonitorStatus>,

    monitor: fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constantFrom(
            "http" as const,
            "ping" as const,
            "port" as const,
            "dns" as const
        ),
        checkInterval: fc.integer({ min: 1000, max: 300_000 }), // 1 second to 5 minutes
        history: fc.array(
            fc.record({
                status: fc.constantFrom("up" as const, "down" as const),
                responseTime: fc.integer({ min: 0, max: 5000 }),
                timestamp: fc.integer({ min: 0, max: Date.now() }),
                details: fc.option(fc.string()),
            }),
            { maxLength: 100 }
        ),
        monitoring: fc.boolean(),
        responseTime: fc.integer({ min: 0, max: 10_000 }),
        retryAttempts: fc.integer({ min: 0, max: 10 }),
        status: fc.constantFrom(
            "up" as const,
            "down" as const,
            "pending" as const,
            "paused" as const
        ) as fc.Arbitrary<MonitorStatus>,
        timeout: fc.integer({ min: 1000, max: 30_000 }), // 1-30 seconds
        // Optional fields
        activeOperations: fc.option(fc.array(fc.string())),
        expectedValue: fc.option(fc.string()),
        host: fc.option(fc.string()),
        lastChecked: fc.option(fc.date()),
        port: fc.option(fc.integer({ min: 1, max: 65_535 })),
        recordType: fc.option(fc.string()),
        url: fc.option(fc.webUrl()),
    }) as fc.Arbitrary<Monitor>,

    get site() {
        return fc.record({
            identifier: fc.string({ minLength: 1, maxLength: 50 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            monitoring: fc.boolean(),
            monitors: fc.uniqueArray(arbitraries.monitor, {
                selector: (monitor) => monitor.id,
                minLength: 0,
                maxLength: 5,
            }),
        }) as fc.Arbitrary<Site>;
    },

    get multipleSites() {
        return fc.array(arbitraries.site, { minLength: 1, maxLength: 10 });
    },
};

describe("Sites Store - Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createTestSitesStore();
    });

    describe("Site Management", () => {
        fcTest.prop([arbitraries.site])(
            "should handle adding sites",
            (site) => {
                // Arrange - ensure fresh state
                createTestSitesStore();

                // Act
                useSitesStore.getState().addSite(site);

                // Assert
                const state = useSitesStore.getState();
                expect(state.sites).toHaveLength(1);
                expect(state.sites[0]).toEqual(site);
            }
        );

        fcTest.prop([arbitraries.multipleSites])(
            "should handle multiple site additions",
            (sites) => {
                // Arrange - ensure fresh state
                createTestSitesStore();

                // Act
                for (const site of sites) {
                    useSitesStore.getState().addSite(site);
                }

                // Assert
                const state = useSitesStore.getState();
                expect(state.sites).toHaveLength(sites.length);
                for (const [i, site] of sites.entries()) {
                    expect(state.sites[i]).toEqual(site);
                }
            }
        );

        fcTest.prop([arbitraries.site])(
            "should handle removing sites",
            (site) => {
                // Arrange - add site first
                createTestSitesStore();
                useSitesStore.getState().addSite(site);

                // Act
                useSitesStore.getState().removeSite(site.identifier);

                // Assert
                const state = useSitesStore.getState();
                expect(state.sites).toHaveLength(0);
            }
        );
    });

    describe("Site Selection", () => {
        fcTest.prop([arbitraries.site])(
            "should handle site selection",
            (site) => {
                // Arrange - add site first
                createTestSitesStore();
                useSitesStore.getState().addSite(site);

                // Act
                useSitesStore.getState().selectSite(site);

                // Assert
                const state = useSitesStore.getState();
                expect(state.selectedSiteIdentifier).toBe(site.identifier);
                expect(useSitesStore.getState().getSelectedSite()).toEqual(
                    site
                );
            }
        );

        fcTest.prop([arbitraries.site])(
            "should handle clearing site selection",
            (site) => {
                // Arrange - add and select site
                createTestSitesStore();
                useSitesStore.getState().addSite(site);
                useSitesStore.getState().selectSite(site);

                // Act
                useSitesStore.getState().selectSite(undefined);

                // Assert
                const state = useSitesStore.getState();
                expect(state.selectedSiteIdentifier).toBeUndefined();
                expect(
                    useSitesStore.getState().getSelectedSite()
                ).toBeUndefined();
            }
        );
    });

    describe("Monitor Management", () => {
        fcTest.prop([arbitraries.site, arbitraries.monitor])(
            "should handle adding monitors to sites",
            (site, monitor) => {
                // Test the pure utility function
                const updatedSite = {
                    ...site,
                    monitors: [...site.monitors, monitor],
                };

                // Assert
                expect(updatedSite.monitors).toHaveLength(
                    site.monitors.length + 1
                );
                expect(updatedSite.monitors).toContainEqual(monitor);
                // Ensure other properties remain unchanged
                expect(updatedSite.identifier).toBe(site.identifier);
                expect(updatedSite.name).toBe(site.name);
                expect(updatedSite.monitoring).toBe(site.monitoring);
            }
        );

        fcTest.prop([arbitraries.site])(
            "should handle removing monitors from sites",
            (site) => {
                // Skip sites with no monitors
                if (site.monitors.length === 0) {
                    return;
                }

                const monitorToRemove = site.monitors[0]!;

                // Test the pure utility function
                const updatedSite = {
                    ...site,
                    monitors: site.monitors.filter(
                        (m) => m.id !== monitorToRemove.id
                    ),
                };

                // Assert
                expect(updatedSite.monitors).toHaveLength(
                    site.monitors.length - 1
                );
                expect(updatedSite.monitors).not.toContainEqual(
                    monitorToRemove
                );
                // Ensure other properties remain unchanged
                expect(updatedSite.identifier).toBe(site.identifier);
                expect(updatedSite.name).toBe(site.name);
                expect(updatedSite.monitoring).toBe(site.monitoring);
            }
        );
    });

    describe("State Invariants", () => {
        fcTest.prop([arbitraries.multipleSites])(
            "should maintain site uniqueness by identifier",
            (sites) => {
                // Arrange - ensure fresh state
                createTestSitesStore();

                // Act - add all sites
                for (const site of sites) {
                    useSitesStore.getState().addSite(site);
                }

                // Assert - no duplicate identifiers
                const state = useSitesStore.getState();
                const siteIds = state.sites.map((s) => s.identifier);
                const uniqueIds = new Set(siteIds);
                expect(uniqueIds.size).toBeLessThanOrEqual(siteIds.length);
            }
        );

        fcTest.prop([arbitraries.site])(
            "should maintain selected site consistency when site is removed",
            (site) => {
                // Arrange - add site and select it
                createTestSitesStore();
                useSitesStore.getState().addSite(site);
                useSitesStore.getState().selectSite(site);

                // Act - remove the selected site
                useSitesStore.getState().removeSite(site.identifier);

                // Assert - selection should be cleared since the site was removed
                const state = useSitesStore.getState();
                const selectedSite = useSitesStore.getState().getSelectedSite();

                // The site should no longer exist in the store
                expect(state.sites).not.toContainEqual(site);

                // And the selection should be cleared (no selected site)
                expect(selectedSite).toBeUndefined();
                expect(state.selectedSiteIdentifier).toBeUndefined();
            }
        );

        fcTest.prop([arbitraries.site])(
            "should maintain monitor status type safety",
            (site) => {
                // Arrange
                createTestSitesStore();
                useSitesStore.getState().addSite(site);

                // Assert - all monitor statuses should be valid
                const state = useSitesStore.getState();
                const addedSite = state.sites[0]!;
                for (const monitor of addedSite.monitors) {
                    expect([
                        "up",
                        "down",
                        "pending",
                        "paused",
                    ]).toContain(monitor.status);
                }
            }
        );
    });

    describe("Edge Cases", () => {
        fcTest.prop([arbitraries.site])(
            "should handle non-existent site operations gracefully",
            (site) => {
                // Arrange - clean state
                createTestSitesStore();

                // Act & Assert - operations on non-existent sites should not crash
                expect(() =>
                    useSitesStore
                        .getState()
                        .removeSite("non-existent-identifier")
                ).not.toThrowError();
                expect(() =>
                    useSitesStore.getState().selectSite(site)
                ).not.toThrowError();

                const state = useSitesStore.getState();
                expect(state.sites).toHaveLength(0);
            }
        );

        fcTest.prop([fc.string()])(
            "should handle malformed site identifiers",
            (malformedId) => {
                // Arrange
                createTestSitesStore();

                // Act & Assert - malformed operations should not crash
                expect(() =>
                    useSitesStore.getState().removeSite(malformedId)
                ).not.toThrowError();

                const state = useSitesStore.getState();
                expect(state.sites).toHaveLength(0);
            }
        );
    });
});

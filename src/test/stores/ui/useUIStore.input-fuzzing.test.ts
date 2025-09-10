/**
 * @remarks
 * Tests all UI store operations with property-based testing using fast-check to
 * discover edge cases in modal management, site selection, tab navigation, and
 * user preference handling. Validates state consistency, persistence, and UI
 * interaction patterns.
 *
 * Coverage areas:
 *
 * - Modal visibility management with arbitrary states
 * - Site selection and tracking
 * - Tab navigation and active state
 * - Chart time range selection
 * - Advanced metrics visibility
 * - External URL handling
 * - State persistence and recovery
 * - Concurrent UI operations
 *
 * @file Comprehensive property-based fuzzing tests for UI store state
 *   management
 *
 * @author AI Assistant
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import { useUIStore } from "../../../stores/ui/useUiStore";
import type { Site } from "../../../../shared/types";
import type { ChartTimeRange } from "../../../stores/types";

// Test utilities for UI store state management
const resetUIStore = () => {
    // Reset store to initial state
    useUIStore.getState().setShowSettings(false);
    useUIStore.getState().setShowSiteDetails(false);
    useUIStore.getState().setShowAddSiteModal(false);
    useUIStore.getState().setShowAdvancedMetrics(false);
    useUIStore.getState().setSelectedSite(undefined);
    useUIStore.getState().setActiveSiteDetailsTab("site-overview");
    useUIStore.getState().setSiteDetailsChartTimeRange("24h");
};

// Property-based test arbitraries for UI store
const arbitraries = {
    /** Generate boolean state */
    booleanState: fc.boolean(),

    /** Generate valid tab identifier */
    tabId: fc.constantFrom("site-overview", "analytics", "history", "settings"),

    /** Generate chart time range */
    chartTimeRange: fc.constantFrom(
        "1h" as ChartTimeRange,
        "24h" as ChartTimeRange,
        "7d" as ChartTimeRange,
        "30d" as ChartTimeRange
    ),

    /** Generate valid URL */
    url: fc.webUrl(),

    /** Generate site name for context */
    siteName: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),

    /** Generate site identifier */
    siteId: fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),

    /** Generate site configuration */
    site: fc.record({
        id: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0),
        name: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
        identifier: fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0),
        monitors: fc.array(
            fc.record({
                id: fc
                    .string({ minLength: 1, maxLength: 50 })
                    .filter((s) => s.trim().length > 0),
                url: fc.webUrl(),
                name: fc
                    .string({ minLength: 1, maxLength: 100 })
                    .filter((s) => s.trim().length > 0),
                checkInterval: fc.integer({ min: 30_000, max: 3_600_000 }),
                timeout: fc.integer({ min: 1000, max: 30_000 }),
                retryAttempts: fc.integer({ min: 0, max: 5 }),
                status: fc.constantFrom(
                    "checking",
                    "online",
                    "offline",
                    "error",
                    "unknown"
                ),
                lastChecked: fc.option(fc.date()),
                responseTime: fc.option(fc.integer({ min: 0, max: 10_000 })),
                uptime: fc.option(fc.float({ min: 0, max: 100, noNaN: true })),
                isActive: fc.boolean(),
                createdAt: fc.date(),
                updatedAt: fc.date(),
            }),
            { minLength: 0, maxLength: 10 }
        ),
        isActive: fc.boolean(),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
        }),
        createdAt: fc.date(),
        updatedAt: fc.date(),
    }),

    /** Generate modal state configuration */
    modalStates: fc.record({
        showSettings: fc.boolean(),
        showSiteDetails: fc.boolean(),
        showAddSiteModal: fc.boolean(),
        showAdvancedMetrics: fc.boolean(),
    }),

    /** Generate UI state configuration */
    uiState: fc.record({
        activeSiteDetailsTab: fc.constantFrom(
            "overview",
            "monitors",
            "analytics",
            "settings",
            "history",
            "logs"
        ),
        siteDetailsChartTimeRange: fc.constantFrom("1h", "24h", "7d", "30d"),
        showAdvancedMetrics: fc.boolean(),
    }),
};

describe("UI Store - Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset store to initial state
        resetUIStore();

        // Mock window.electronAPI if needed
        if (!(globalThis.window as any)?.electronAPI) {
            (globalThis.window as any) = {
                ...globalThis.window,
                electronAPI: {
                    system: {
                        openExternal: vi.fn().mockResolvedValue(undefined),
                    },
                },
            };
        }
    });

    describe("Modal Visibility Management", () => {
        fcTest.prop([arbitraries.booleanState])(
            "should handle settings modal visibility",
            (showSettings) => {
                // Act
                useUIStore.getState().setShowSettings(showSettings);

                // Assert
                expect(useUIStore.getState().showSettings).toBe(showSettings);
            }
        );

        fcTest.prop([arbitraries.booleanState])(
            "should handle site details modal visibility",
            (showSiteDetails) => {
                // Act
                useUIStore.getState().setShowSiteDetails(showSiteDetails);

                // Assert
                expect(useUIStore.getState().showSiteDetails).toBe(
                    showSiteDetails
                );
            }
        );

        fcTest.prop([arbitraries.booleanState])(
            "should handle add site modal visibility",
            (showAddSiteModal) => {
                // Act
                useUIStore.getState().setShowAddSiteModal(showAddSiteModal);

                // Assert
                expect(useUIStore.getState().showAddSiteModal).toBe(
                    showAddSiteModal
                );
            }
        );

        fcTest.prop([arbitraries.booleanState])(
            "should handle advanced metrics visibility",
            (showAdvancedMetrics) => {
                // Act
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(showAdvancedMetrics);

                // Assert
                expect(useUIStore.getState().showAdvancedMetrics).toBe(
                    showAdvancedMetrics
                );
            }
        );

        fcTest.prop([arbitraries.modalStates])(
            "should handle multiple modal states simultaneously",
            (modalStates) => {
                // Act
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(modalStates.showAdvancedMetrics);

                // Assert
                expect(useUIStore.getState().showSettings).toBe(
                    modalStates.showSettings
                );
                expect(useUIStore.getState().showSiteDetails).toBe(
                    modalStates.showSiteDetails
                );
                expect(useUIStore.getState().showAddSiteModal).toBe(
                    modalStates.showAddSiteModal
                );
                expect(useUIStore.getState().showAdvancedMetrics).toBe(
                    modalStates.showAdvancedMetrics
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.booleanState, { minLength: 5, maxLength: 20 }),
        ])("should handle rapid modal state changes", (states) => {
            // Act - rapidly toggle modal states
            for (const [index, state] of states.entries()) {
                switch (index % 4) {
                    case 0: {
                        useUIStore.getState().setShowSettings(state);
                        break;
                    }
                    case 1: {
                        useUIStore.getState().setShowSiteDetails(state);
                        break;
                    }
                    case 2: {
                        useUIStore.getState().setShowAddSiteModal(state);
                        break;
                    }
                    case 3: {
                        useUIStore.getState().setShowAdvancedMetrics(state);
                        break;
                    }
                }
            }

            // Assert - store should remain in consistent state
            expect(typeof useUIStore.getState().showSettings).toBe("boolean");
            expect(typeof useUIStore.getState().showSiteDetails).toBe(
                "boolean"
            );
            expect(typeof useUIStore.getState().showAddSiteModal).toBe(
                "boolean"
            );
            expect(typeof useUIStore.getState().showAdvancedMetrics).toBe(
                "boolean"
            );
        });
    });

    describe("Site Selection Management", () => {
        fcTest.prop([arbitraries.site])(
            "should handle site selection",
            (site) => {
                // Act
                useUIStore.getState().setSelectedSite(site);

                // Assert
                expect(useUIStore.getState().selectedSiteId).toBe(
                    site.identifier
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 1, maxLength: 10 }),
        ])("should handle selection across multiple sites", (sites) => {
            // Act & Assert - select each site in turn
            for (const site of sites) {
                useUIStore.getState().setSelectedSite(site);
                expect(useUIStore.getState().selectedSiteId).toBe(
                    site.identifier
                );
            }
        });

        fcTest.prop([arbitraries.site])(
            "should handle clearing site selection",
            (site) => {
                // Arrange
                useUIStore.getState().setSelectedSite(site);
                expect(useUIStore.getState().selectedSiteId).toBe(
                    site.identifier
                );

                // Act
                useUIStore.getState().setSelectedSite(undefined);

                // Assert
                expect(useUIStore.getState().selectedSiteId).toBeUndefined();
            }
        );

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 2, maxLength: 5 }),
        ])("should handle rapid site selection changes", (sites) => {
            // Act - rapidly change selections
            for (const site of sites) useUIStore.getState().setSelectedSite(site)
            ;

            // Assert - last selection should win
            const lastSite = sites.at(-1);
            expect(useUIStore.getState().selectedSiteId).toBe(
                lastSite.identifier
            );
        });
    });

    describe("Tab Navigation Management", () => {
        fcTest.prop([arbitraries.tabId])(
            "should handle active tab changes",
            (tabId) => {
                // Act
                useUIStore.getState().setActiveSiteDetailsTab(tabId);

                // Assert
                expect(useUIStore.getState().activeSiteDetailsTab).toBe(tabId);
            }
        );

        fcTest.prop([
            fc.array(arbitraries.tabId, { minLength: 1, maxLength: 20 }),
        ])("should handle rapid tab navigation", (tabIds) => {
            // Act - rapidly switch tabs
            for (const tabId of tabIds) useUIStore.getState().setActiveSiteDetailsTab(tabId)
            ;

            // Assert - last tab should be active
            const lastTabId = tabIds.at(-1);
            expect(useUIStore.getState().activeSiteDetailsTab).toBe(lastTabId);
        });

        fcTest.prop([arbitraries.tabId, arbitraries.booleanState])(
            "should handle tab changes with modal visibility",
            (tabId, showModal) => {
                // Act
                useUIStore.getState().setActiveSiteDetailsTab(tabId);
                useUIStore.getState().setShowSiteDetails(showModal);

                // Assert
                expect(useUIStore.getState().activeSiteDetailsTab).toBe(tabId);
                expect(useUIStore.getState().showSiteDetails).toBe(showModal);
            }
        );
    });

    describe("Chart Time Range Management", () => {
        fcTest.prop([arbitraries.chartTimeRange])(
            "should handle chart time range selection",
            (timeRange) => {
                // Act
                useUIStore.getState().setSiteDetailsChartTimeRange(timeRange);

                // Assert
                expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                    timeRange
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.chartTimeRange, {
                minLength: 1,
                maxLength: 10,
            }),
        ])("should handle rapid time range changes", (timeRanges) => {
            // Act - rapidly change time ranges
            for (const timeRange of timeRanges) useUIStore.getState().setSiteDetailsChartTimeRange(timeRange)
            ;

            // Assert - last time range should be selected
            const lastTimeRange = timeRanges.at(-1);
            expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                lastTimeRange
            );
        });

        fcTest.prop([arbitraries.chartTimeRange, arbitraries.tabId])(
            "should handle time range with tab navigation",
            (timeRange, tabId) => {
                // Act
                useUIStore.getState().setSiteDetailsChartTimeRange(timeRange);
                useUIStore.getState().setActiveSiteDetailsTab(tabId);

                // Assert
                expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                    timeRange
                );
                expect(useUIStore.getState().activeSiteDetailsTab).toBe(tabId);
            }
        );
    });

    describe("External URL Handling", () => {
        fcTest.prop([arbitraries.url])(
            "should handle external URL opening",
            (url) => {
                // Mock the shell API
                const mockOpenExternal = vi.fn().mockResolvedValue(undefined);
                vi.mocked(
                    (window as any).electronAPI.system.openExternal
                ).mockImplementation(mockOpenExternal);

                // Act
                useUIStore.getState().openExternal(url);

                // Assert
                expect(mockOpenExternal).toHaveBeenCalledWith(url);
            }
        );

        fcTest.prop([arbitraries.url, arbitraries.siteName])(
            "should handle external URL opening with context",
            (url, siteName) => {
                // Mock the shell API
                const mockOpenExternal = vi.fn().mockResolvedValue(undefined);
                vi.mocked(
                    (window as any).electronAPI.system.openExternal
                ).mockImplementation(mockOpenExternal);

                // Act
                useUIStore.getState().openExternal(url, { siteName });

                // Assert
                expect(mockOpenExternal).toHaveBeenCalledWith(url);

                // Verify URL is valid
                expect(url).toMatch(/^https?:\/\//);
            }
        );

        fcTest.prop([
            fc.array(arbitraries.url, { minLength: 1, maxLength: 5 }),
        ])("should handle multiple external URL operations", (urls) => {
            // Mock the shell API
            const mockOpenExternal = vi.fn().mockResolvedValue(undefined);
            vi.mocked(
                (window as any).electronAPI.system.openExternal
            ).mockImplementation(mockOpenExternal);

            // Act
            for (const url of urls) useUIStore.getState().openExternal(url);

            // Assert
            expect(mockOpenExternal).toHaveBeenCalledTimes(urls.length);
            for (const url of urls) {
                expect(mockOpenExternal).toHaveBeenCalledWith(url);
            }
        });
    });

    describe("Complex State Interactions", () => {
        fcTest.prop([
            arbitraries.site,
            arbitraries.modalStates,
            arbitraries.uiState,
        ])(
            "should handle complex state combinations",
            (site, modalStates, uiState) => {
                // Act - set complex state combination
                useUIStore.getState().setSelectedSite(site);
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(modalStates.showAdvancedMetrics);
                useUIStore
                    .getState()
                    .setActiveSiteDetailsTab(uiState.activeSiteDetailsTab);
                useUIStore
                    .getState()
                    .setSiteDetailsChartTimeRange(
                        uiState.siteDetailsChartTimeRange
                    );

                // Assert - all state should be consistent
                expect(useUIStore.getState().selectedSiteId).toBe(
                    site.identifier
                );
                expect(useUIStore.getState().showSettings).toBe(
                    modalStates.showSettings
                );
                expect(useUIStore.getState().showSiteDetails).toBe(
                    modalStates.showSiteDetails
                );
                expect(useUIStore.getState().showAddSiteModal).toBe(
                    modalStates.showAddSiteModal
                );
                expect(useUIStore.getState().showAdvancedMetrics).toBe(
                    modalStates.showAdvancedMetrics
                );
                expect(useUIStore.getState().activeSiteDetailsTab).toBe(
                    uiState.activeSiteDetailsTab
                );
                expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                    uiState.siteDetailsChartTimeRange
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 1, maxLength: 5 }),
            fc.array(arbitraries.tabId, { minLength: 1, maxLength: 5 }),
        ])(
            "should handle site selection with tab navigation",
            (sites, tabIds) => {
                // Act - alternate between site selection and tab navigation
                for (
                    let i = 0;
                    i < Math.max(sites.length, tabIds.length);
                    i++
                ) {
                    if (i < sites.length) {
                        useUIStore.getState().setSelectedSite(sites[i]);
                    }
                    if (i < tabIds.length) {
                        useUIStore
                            .getState()
                            .setActiveSiteDetailsTab(tabIds[i]);
                    }
                }

                // Assert - final state should be consistent
                const lastSite = sites.at(-1);
                const lastTabId = tabIds.at(-1);

                expect(useUIStore.getState().selectedSiteId).toBe(
                    lastSite.identifier
                );
                expect(useUIStore.getState().activeSiteDetailsTab).toBe(
                    lastTabId
                );
            }
        );
    });

    describe("State Transitions", () => {
        fcTest.prop([arbitraries.modalStates])(
            "should handle modal state transitions",
            (modalStates) => {
                // Arrange - start with opposite states
                useUIStore
                    .getState()
                    .setShowSettings(!modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(!modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(!modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(!modalStates.showAdvancedMetrics);

                // Act - transition to target states
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(modalStates.showAdvancedMetrics);

                // Assert - all states should have transitioned
                expect(useUIStore.getState().showSettings).toBe(
                    modalStates.showSettings
                );
                expect(useUIStore.getState().showSiteDetails).toBe(
                    modalStates.showSiteDetails
                );
                expect(useUIStore.getState().showAddSiteModal).toBe(
                    modalStates.showAddSiteModal
                );
                expect(useUIStore.getState().showAdvancedMetrics).toBe(
                    modalStates.showAdvancedMetrics
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.chartTimeRange, {
                minLength: 2,
                maxLength: 10,
            }),
        ])("should handle time range transitions", (timeRanges) => {
            // Act - transition through multiple time ranges
            for (const timeRange of timeRanges) {
                useUIStore.getState().setSiteDetailsChartTimeRange(timeRange);
                expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                    timeRange
                );
            }

            // Assert - final time range should be set
            const finalTimeRange = timeRanges.at(-1);
            expect(useUIStore.getState().siteDetailsChartTimeRange).toBe(
                finalTimeRange
            );
        });
    });

    describe("Concurrent Operations", () => {
        fcTest.prop([
            fc.array(arbitraries.modalStates, { minLength: 2, maxLength: 10 }),
        ])("should handle concurrent modal operations", (modalStatesList) => {
            // Act - apply all modal states rapidly
            for (const modalStates of modalStatesList) {
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(modalStates.showAdvancedMetrics);
            }

            // Assert - final state should be consistent
            const finalStates = modalStatesList.at(-1);
            expect(useUIStore.getState().showSettings).toBe(
                finalStates.showSettings
            );
            expect(useUIStore.getState().showSiteDetails).toBe(
                finalStates.showSiteDetails
            );
            expect(useUIStore.getState().showAddSiteModal).toBe(
                finalStates.showAddSiteModal
            );
            expect(useUIStore.getState().showAdvancedMetrics).toBe(
                finalStates.showAdvancedMetrics
            );
        });

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 2, maxLength: 5 }),
            fc.array(arbitraries.url, { minLength: 2, maxLength: 5 }),
        ])(
            "should handle concurrent site selection and URL operations",
            (sites, urls) => {
                // Mock the shell API
                const mockOpenExternal = vi.fn().mockResolvedValue(undefined);
                vi.mocked(
                    (window as any).electronAPI.system.openExternal
                ).mockImplementation(mockOpenExternal);

                // Act - interleave site selection and URL operations
                for (let i = 0; i < Math.max(sites.length, urls.length); i++) {
                    if (i < sites.length) {
                        useUIStore.getState().setSelectedSite(sites[i]);
                    }
                    if (i < urls.length) {
                        useUIStore.getState().openExternal(urls[i]);
                    }
                }

                // Assert - final site should be selected
                const finalSite = sites.at(-1);
                expect(useUIStore.getState().selectedSiteId).toBe(
                    finalSite.identifier
                );

                // All URLs should have been opened
                expect(mockOpenExternal).toHaveBeenCalledTimes(urls.length);
            }
        );
    });

    describe("Edge Cases and Error Scenarios", () => {
        test("should handle operations with undefined site", () => {
            // Arrange
            resetUIStore();

            // Act & Assert - setting undefined site should not crash
            expect(() =>
                useUIStore.getState().setSelectedSite(undefined)
            ).not.toThrow();
            expect(useUIStore.getState().selectedSiteId).toBeUndefined();
        });

        fcTest.prop([arbitraries.url])(
            "should handle external URL opening when electronAPI is unavailable",
            (url) => {
                // Arrange - temporarily remove electronAPI
                const originalAPI = (globalThis.window as any)?.electronAPI;
                if (globalThis.window) {
                    (globalThis.window as any).electronAPI = undefined;
                }

                try {
                    // Act & Assert - should not crash
                    expect(() =>
                        useUIStore.getState().openExternal(url)
                    ).not.toThrow();
                } finally {
                    // Restore electronAPI
                    if (globalThis.window && originalAPI) {
                        (globalThis.window as any).electronAPI = originalAPI;
                    }
                }
            }
        );

        fcTest.prop([
            fc.array(arbitraries.modalStates, { minLength: 1, maxLength: 20 }),
        ])("should handle rapid state oscillation", (modalStatesList) => {
            // Act - rapidly oscillate between states
            for (const modalStates of modalStatesList) {
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSettings(!modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowSiteDetails(!modalStates.showSiteDetails);
            }

            // Assert - store should remain in consistent state
            expect(typeof useUIStore.getState().showSettings).toBe("boolean");
            expect(typeof useUIStore.getState().showSiteDetails).toBe(
                "boolean"
            );
            expect(typeof useUIStore.getState().showAddSiteModal).toBe(
                "boolean"
            );
            expect(typeof useUIStore.getState().showAdvancedMetrics).toBe(
                "boolean"
            );
        });
    });

    describe("State Invariants", () => {
        fcTest.prop([arbitraries.modalStates, arbitraries.uiState])(
            "should maintain state type consistency",
            (modalStates, uiState) => {
                // Act
                useUIStore.getState().setShowSettings(modalStates.showSettings);
                useUIStore
                    .getState()
                    .setShowSiteDetails(modalStates.showSiteDetails);
                useUIStore
                    .getState()
                    .setShowAddSiteModal(modalStates.showAddSiteModal);
                useUIStore
                    .getState()
                    .setShowAdvancedMetrics(modalStates.showAdvancedMetrics);
                useUIStore
                    .getState()
                    .setActiveSiteDetailsTab(uiState.activeSiteDetailsTab);
                useUIStore
                    .getState()
                    .setSiteDetailsChartTimeRange(
                        uiState.siteDetailsChartTimeRange
                    );

                // Assert invariants
                expect(typeof useUIStore.getState().showSettings).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showSiteDetails).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showAddSiteModal).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showAdvancedMetrics).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().activeSiteDetailsTab).toBe(
                    "string"
                );
                expect(
                    typeof useUIStore.getState().siteDetailsChartTimeRange
                ).toBe("string");

                // Verify valid values
                expect([
                    "overview",
                    "monitors",
                    "analytics",
                    "settings",
                    "history",
                    "logs",
                ]).toContain(useUIStore.getState().activeSiteDetailsTab);
                expect([
                    "1h",
                    "24h",
                    "7d",
                    "30d",
                ]).toContain(useUIStore.getState().siteDetailsChartTimeRange);
            }
        );

        fcTest.prop([arbitraries.site])(
            "should maintain site selection consistency",
            (site) => {
                // Act
                useUIStore.getState().setSelectedSite(site);

                // Assert invariants
                expect(useUIStore.getState().selectedSiteId).toBe(
                    site.identifier
                );
                expect(typeof useUIStore.getState().selectedSiteId).toBe(
                    "string"
                );
                if (useUIStore.getState().selectedSiteId) {
                    expect(
                        useUIStore.getState().selectedSiteId.length
                    ).toBeGreaterThan(0);
                }
            }
        );

        fcTest.prop([arbitraries.modalStates])(
            "should maintain boolean state consistency",
            (modalStates) => {
                // Act
                for (const [key, value] of Object.entries(modalStates)) {
                    switch (key) {
                        case "showSettings": {
                            useUIStore.getState().setShowSettings(value);
                            break;
                        }
                        case "showSiteDetails": {
                            useUIStore.getState().setShowSiteDetails(value);
                            break;
                        }
                        case "showAddSiteModal": {
                            useUIStore.getState().setShowAddSiteModal(value);
                            break;
                        }
                        case "showAdvancedMetrics": {
                            useUIStore.getState().setShowAdvancedMetrics(value);
                            break;
                        }
                    }
                }

                // Assert invariants - all boolean states should remain boolean
                expect(typeof useUIStore.getState().showSettings).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showSiteDetails).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showAddSiteModal).toBe(
                    "boolean"
                );
                expect(typeof useUIStore.getState().showAdvancedMetrics).toBe(
                    "boolean"
                );
            }
        );
    });
});

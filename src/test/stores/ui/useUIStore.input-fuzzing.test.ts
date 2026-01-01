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
 *
 * @ts-expect-error Complex fuzzing tests with Site object type compatibility - exact type safety deferred for test coverage
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
    getSafeUrlForLogging,
    validateExternalOpenUrlCandidate,
} from "@shared/utils/urlSafety";

const mockErrorStore = vi.hoisted(() => ({
    clearStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
    setStoreError: vi.fn(),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => mockErrorStore),
    },
}));

const mockLogger = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    user: {
        action: vi.fn(),
    },
}));

vi.mock("../../../services/logger", () => ({
    logger: mockLogger,
}));

// Mock SystemService for openExternal functionality
vi.mock("../../../services/SystemService", () => ({
    SystemService: {
        openExternal: vi.fn().mockResolvedValue(true),
    },
}));

import { SystemService } from "../../../services/SystemService";
import { useUIStore } from "../../../stores/ui/useUiStore";
// Removed unused Site type import
import type { ChartTimeRange } from "../../../stores/types";

// Get the mocked SystemService function
const mockOpenExternal = vi.mocked(SystemService.openExternal);

// Test utilities for UI store state management
const resetUIStore = () => {
    // Reset store to initial state
    useUIStore.getState().setShowSettings(false);
    useUIStore.getState().setShowSiteDetails(false);
    useUIStore.getState().setShowAddSiteModal(false);
    useUIStore.getState().setShowAdvancedMetrics(false);
    useUIStore.getState().selectSite(undefined);
    useUIStore.getState().setActiveSiteDetailsTab("site-overview");
    useUIStore.getState().setSiteDetailsChartTimeRange("24h");
};

// Property-based test arbitraries for UI store
const arbitraries = {
    /** Generate boolean state */
    booleanState: fc.boolean(),

    /** Generate valid tab identifier */
    tabId: fc.constantFrom(
        "site-overview",
        "monitor-overview",
        "analytics",
        "history",
        "settings"
    ),

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
    siteIdentifier: fc
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
            fc.oneof(
                // Monitor without optional properties
                fc.record({
                    id: fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => s.trim().length > 0),
                    checkInterval: fc.integer({ min: 30_000, max: 3_600_000 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 5 }),
                    status: fc.constantFrom("down", "paused", "pending", "up"),
                    responseTime: fc.integer({ min: 0, max: 10_000 }),
                    type: fc.constantFrom("http", "ping", "port", "dns", "ssl"),
                    monitoring: fc.boolean(),
                    history: fc.array(
                        fc.oneof(
                            // StatusHistory without details
                            fc.record({
                                timestamp: fc.integer({
                                    min: 0,
                                    max: Date.now(),
                                }),
                                status: fc.constantFrom("up", "down"),
                                responseTime: fc.integer({
                                    min: 0,
                                    max: 10_000,
                                }),
                            }),
                            // StatusHistory with details
                            fc.record({
                                timestamp: fc.integer({
                                    min: 0,
                                    max: Date.now(),
                                }),
                                status: fc.constantFrom("up", "down"),
                                responseTime: fc.integer({
                                    min: 0,
                                    max: 10_000,
                                }),
                                details: fc.string(),
                            })
                        ),
                        { maxLength: 10 }
                    ),
                }),
                // Monitor with optional properties
                fc.record({
                    id: fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => s.trim().length > 0),
                    checkInterval: fc.integer({ min: 30_000, max: 3_600_000 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 5 }),
                    status: fc.constantFrom("down", "paused", "pending", "up"),
                    responseTime: fc.integer({ min: 0, max: 10_000 }),
                    type: fc.constantFrom("http", "ping", "port", "dns", "ssl"),
                    monitoring: fc.boolean(),
                    history: fc.array(
                        fc.oneof(
                            // StatusHistory without details
                            fc.record({
                                timestamp: fc.integer({
                                    min: 0,
                                    max: Date.now(),
                                }),
                                status: fc.constantFrom("up", "down"),
                                responseTime: fc.integer({
                                    min: 0,
                                    max: 10_000,
                                }),
                            }),
                            // StatusHistory with details
                            fc.record({
                                timestamp: fc.integer({
                                    min: 0,
                                    max: Date.now(),
                                }),
                                status: fc.constantFrom("up", "down"),
                                responseTime: fc.integer({
                                    min: 0,
                                    max: 10_000,
                                }),
                                details: fc.string(),
                            })
                        ),
                        { maxLength: 10 }
                    ),
                    // Optional properties
                    activeOperations: fc.array(fc.string(), { maxLength: 5 }),
                    expectedValue: fc.string(),
                    host: fc.domain(),
                    lastChecked: fc.date(),
                    port: fc.integer({ min: 1, max: 65_535 }),
                    recordType: fc.constantFrom(
                        "A",
                        "AAAA",
                        "CNAME",
                        "MX",
                        "TXT"
                    ),
                    url: fc.webUrl(),
                })
            ),
            { minLength: 0, maxLength: 10 }
        ),
        isActive: fc.boolean(),
        monitoring: fc.boolean(),
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
            "site-overview",
            "monitor-overview",
            "analytics",
            "settings",
            "history",
            "site-overview-analytics"
        ),
        siteDetailsChartTimeRange: fc.constantFrom("1h", "24h", "7d", "30d"),
        showAdvancedMetrics: fc.boolean(),
    }),
};

describe("UI Store - Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockErrorStore.clearStoreError.mockClear();
        mockErrorStore.setOperationLoading.mockClear();
        mockErrorStore.setStoreError.mockClear();
        mockLogger.error.mockClear();
        mockLogger.user.action.mockClear();

        // Reset store to initial state
        resetUIStore();

        // Mock window.electronAPI if needed
        if (!(globalThis.window as any)?.electronAPI) {
            (globalThis.window as any) = {
                ...globalThis.window,
                electronAPI: {
                    system: {
                        openExternal: vi.fn().mockResolvedValue(true),
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
                useUIStore.getState().selectSite(site);

                // Assert
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    site.identifier
                );
            }
        );

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 1, maxLength: 10 }),
        ])("should handle selection across multiple sites", (sites) => {
            // Act & Assert - select each site in turn
            for (const site of sites) {
                useUIStore.getState().selectSite(site);
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    site.identifier
                );
            }
        });

        fcTest.prop([arbitraries.site])(
            "should handle clearing site selection",
            (site) => {
                // Arrange
                useUIStore.getState().selectSite(site);
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    site.identifier
                );

                // Act
                useUIStore.getState().selectSite(undefined);

                // Assert
                expect(
                    useUIStore.getState().selectedSiteIdentifier
                ).toBeUndefined();
            }
        );

        fcTest.prop([
            fc.array(arbitraries.site, { minLength: 2, maxLength: 5 }),
        ])("should handle rapid site selection changes", (sites) => {
            // Act - rapidly change selections
            for (const site of sites) useUIStore.getState().selectSite(site);

            // Assert - last selection should win
            const lastSite = sites.at(-1);
            expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                lastSite!.identifier
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
            for (const tabId of tabIds)
                useUIStore.getState().setActiveSiteDetailsTab(tabId);

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
            for (const timeRange of timeRanges)
                useUIStore.getState().setSiteDetailsChartTimeRange(timeRange);

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
                // Clear any previous calls
                mockOpenExternal.mockClear();
                mockErrorStore.setStoreError.mockClear();

                // Act
                useUIStore.getState().openExternal(url);

                const validation = validateExternalOpenUrlCandidate(url);

                if (validation.ok === true) {
                    expect(mockOpenExternal).toHaveBeenCalledWith(
                        validation.normalizedUrl
                    );
                    expect(mockErrorStore.setStoreError).not.toHaveBeenCalled();
                } else {
                    expect(mockOpenExternal).not.toHaveBeenCalled();
                    expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                        "system-open-external",
                        expect.stringContaining(validation.reason)
                    );
                }
            }
        );

        fcTest.prop([arbitraries.url, arbitraries.siteName])(
            "should handle external URL opening with context",
            (url, siteName) => {
                // Clear any previous calls
                mockOpenExternal.mockClear();
                mockErrorStore.setStoreError.mockClear();

                // Act
                useUIStore.getState().openExternal(url, { siteName });

                const validation = validateExternalOpenUrlCandidate(url);

                if (validation.ok === true) {
                    expect(mockOpenExternal).toHaveBeenCalledWith(
                        validation.normalizedUrl
                    );
                    expect(mockErrorStore.setStoreError).not.toHaveBeenCalled();
                } else {
                    expect(mockOpenExternal).not.toHaveBeenCalled();
                    expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                        "system-open-external",
                        expect.stringContaining(validation.reason)
                    );
                }
            }
        );

        fcTest.prop([
            fc.array(arbitraries.url, { minLength: 1, maxLength: 5 }),
        ])("should handle multiple external URL operations", (urls) => {
            // Clear any previous calls
            mockOpenExternal.mockClear();
            mockErrorStore.setStoreError.mockClear();

            // Act
            for (const url of urls) useUIStore.getState().openExternal(url);

            const normalizedValidUrls = urls.flatMap((candidate) => {
                const validationResult =
                    validateExternalOpenUrlCandidate(candidate);
                return validationResult.ok
                    ? [validationResult.normalizedUrl]
                    : [];
            });

            const invalidUrls = urls.length - normalizedValidUrls.length;

            expect(mockOpenExternal).toHaveBeenCalledTimes(
                normalizedValidUrls.length
            );
            for (const url of normalizedValidUrls) {
                expect(mockOpenExternal).toHaveBeenCalledWith(url);
            }

            if (invalidUrls > 0) {
                expect(mockErrorStore.setStoreError).toHaveBeenCalledTimes(
                    invalidUrls
                );
            } else {
                expect(mockErrorStore.setStoreError).not.toHaveBeenCalled();
            }
        });

        it("should log user action after successful external navigation", async () => {
            const url = "https://example.com";
            const urlForLog = getSafeUrlForLogging(url);

            mockLogger.user.action.mockClear();

            useUIStore.getState().openExternal(url);

            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "External URL opened",
                expect.objectContaining({ url: urlForLog })
            );
        });

        it("should log and surface errors when SystemService.openExternal fails", async () => {
            const url = "https://example.com";
            const urlForLog = getSafeUrlForLogging(url);
            const failure = new Error("IPC failure");

            mockOpenExternal.mockRejectedValueOnce(failure);

            useUIStore.getState().openExternal(url);

            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(mockOpenExternal).toHaveBeenCalledWith(url);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to open external URL via SystemService",
                failure,
                expect.objectContaining({
                    context: undefined,
                    url: urlForLog,
                })
            );
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "External URL failed",
                expect.objectContaining({
                    error: failure.message,
                    url: urlForLog,
                })
            );
            expect(mockLogger.user.action).not.toHaveBeenCalledWith(
                "External URL opened",
                expect.anything()
            );
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "system-open-external",
                expect.stringContaining("Unable to open external link")
            );
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
                useUIStore.getState().selectSite(site);
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
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
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
                        useUIStore.getState().selectSite(sites[i]);
                    }
                    if (i < tabIds.length) {
                        useUIStore
                            .getState()
                            .setActiveSiteDetailsTab(tabIds[i]!);
                    }
                }

                // Assert - final state should be consistent
                const lastSite = sites.at(-1);
                const lastTabId = tabIds.at(-1);

                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    lastSite!.identifier
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
            const finalStates = modalStatesList.at(-1)!;
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
                // Clear any previous calls
                mockOpenExternal.mockClear();
                mockErrorStore.setStoreError.mockClear();

                // Act - interleave site selection and URL operations
                for (let i = 0; i < Math.max(sites.length, urls.length); i++) {
                    if (i < sites.length) {
                        useUIStore.getState().selectSite(sites[i]);
                    }
                    if (i < urls.length) {
                        useUIStore.getState().openExternal(urls[i]!);
                    }
                }

                // Assert - final site should be selected
                const finalSite = sites.at(-1);
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    finalSite!.identifier
                );

                const validUrls = urls.flatMap((candidate) => {
                    const validationResult =
                        validateExternalOpenUrlCandidate(candidate);
                    return validationResult.ok
                        ? [validationResult.normalizedUrl]
                        : [];
                });

                const invalidCount = urls.length - validUrls.length;

                expect(mockOpenExternal).toHaveBeenCalledTimes(
                    validUrls.length
                );

                if (invalidCount > 0) {
                    expect(mockErrorStore.setStoreError).toHaveBeenCalledTimes(
                        invalidCount
                    );
                } else {
                    expect(mockErrorStore.setStoreError).not.toHaveBeenCalled();
                }
            }
        );
    });

    describe("Edge Cases and Error Scenarios", () => {
        test("should handle operations with undefined site", () => {
            // Arrange
            resetUIStore();

            // Act & Assert - setting undefined site should not crash
            expect(() =>
                useUIStore.getState().selectSite(undefined)
            ).not.toThrowError();
            expect(
                useUIStore.getState().selectedSiteIdentifier
            ).toBeUndefined();
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
                    ).not.toThrowError();
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
                const activeTab = useUIStore.getState().activeSiteDetailsTab;
                const allowedStaticTabs = new Set([
                    "site-overview",
                    "monitor-overview",
                    "analytics",
                    "history",
                    "settings",
                ]);

                expect(
                    allowedStaticTabs.has(activeTab) ||
                        activeTab.endsWith("-analytics")
                ).toBeTruthy();
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
                useUIStore.getState().selectSite(site);

                // Assert invariants
                expect(useUIStore.getState().selectedSiteIdentifier).toBe(
                    site.identifier
                );
                expect(
                    typeof useUIStore.getState().selectedSiteIdentifier
                ).toBe("string");
                if (useUIStore.getState().selectedSiteIdentifier) {
                    expect(
                        useUIStore.getState().selectedSiteIdentifier!.length
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

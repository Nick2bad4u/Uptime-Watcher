/**
 * Tests for useSitesState module Tests core state management functionality
 */

import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { Site } from "@shared/types";
import { DuplicateSiteIdentifierError } from "@shared/validation/siteIntegrity";
import type { SiteSyncDelta } from "@shared/types/stateSync";

import {
    createSitesStateActions,
    initialSitesState,
    type SitesState,
} from "../../../stores/sites/useSitesState";
import { createMockFunction } from "../../utils/mockFactories";

// Mock logging
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

vi.mock("../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

import { logger } from "../../../services/logger";

describe("useSitesState", () => {
    let mockSet: Mock<
        (function_: (state: SitesState) => Partial<SitesState>) => void
    >;
    let mockGet: Mock<() => SitesState>;
    let stateActions: ReturnType<typeof createSitesStateActions>;
    let mockSite: Site;
    const cloneSite = (site: Site): Site => structuredClone(site);
    const createState = (overrides: Partial<SitesState> = {}): SitesState => ({
        lastSyncDelta: undefined,
        selectedMonitorIds: {},
        selectedSiteIdentifier: undefined,
        sites: [],
        statusSubscriptionSummary: undefined,
        ...overrides,
    });

    beforeEach(() => {
        mockSet = createMockFunction();
        mockGet = createMockFunction();

        mockSite = {
            identifier: "test-site",
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up" as const,
                    type: "http" as const,
                    responseTime: 0,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ],
            name: "Test Site",
            monitoring: false,
        };

        // Setup initial state
        mockGet.mockReturnValue(createState({ sites: [mockSite] }));

        stateActions = createSitesStateActions(mockSet, mockGet);
    });

    describe("initialSitesState", () => {
        it("should have correct initial state", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Initial State Validation",
                "test-type"
            );
            await annotate(
                "Operation: Initial State Structure Check",
                "operation"
            );
            await annotate(
                "Priority: Critical - State Initialization",
                "priority"
            );
            await annotate(
                "Complexity: Low - State Structure Validation",
                "complexity"
            );
            await annotate(
                "State: Initial sites store state definition",
                "state"
            );
            await annotate(
                "Purpose: Ensure sites store has correct initial state",
                "purpose"
            );

            expect(initialSitesState).toEqual({
                selectedMonitorIds: {},
                selectedSiteIdentifier: undefined,
                sites: [],
                statusSubscriptionSummary: undefined,
                lastSyncDelta: undefined,
            });
        });
    });

    describe("setSites", () => {
        it("should set sites correctly", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - State Mutation", "test-type");
            await annotate("Operation: Sites Array Update", "operation");
            await annotate(
                "Priority: Critical - Core State Management",
                "priority"
            );
            await annotate(
                "Complexity: Medium - State Update Logic",
                "complexity"
            );
            await annotate(
                "Zustand: State setter function validation",
                "zustand"
            );
            await annotate(
                "Purpose: Ensure sites array can be set correctly",
                "purpose"
            );

            const newSites = [mockSite];

            stateActions.setSites(newSites);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            // Test the function passed to set
            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result).toEqual({
                    selectedMonitorIds: {},
                    selectedSiteIdentifier: undefined,
                    sites: newSites,
                });
            }
        });

        it("should remove invalid selections when replacing sites", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Category: Selection Coherency", "category");
            await annotate("Type: Regression", "type");

            const newSites: Site[] = [
                {
                    identifier: "site-a",
                    monitors: [
                        {
                            checkInterval: 60,
                            history: [],
                            id: "mon-2",
                            monitoring: true,
                            responseTime: 0,
                            retryAttempts: 0,
                            status: "pending",
                            timeout: 30,
                            type: "http",
                        },
                    ],
                    monitoring: true,
                    name: "Site A",
                },
                {
                    identifier: "site-c",
                    monitors: [
                        {
                            checkInterval: 60,
                            history: [],
                            id: "mon-c1",
                            monitoring: true,
                            responseTime: 0,
                            retryAttempts: 0,
                            status: "pending",
                            timeout: 30,
                            type: "http",
                        },
                    ],
                    monitoring: true,
                    name: "Site C",
                },
            ];

            stateActions.setSites(newSites);

            const setFunction = mockSet.mock.calls.pop()?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {
                            "site-a": "mon-1",
                            "site-b": "mon-2",
                            "site-c": "mon-c1",
                        },
                        selectedSiteIdentifier: "site-b",
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );

                expect(result).toEqual({
                    selectedMonitorIds: { "site-c": "mon-c1" },
                    selectedSiteIdentifier: undefined,
                    sites: newSites,
                });
            }
        });

        it("should handle empty sites array", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate(
                "Operation: Empty Sites Array Handling",
                "operation"
            );
            await annotate(
                "Priority: Medium - Edge Case Validation",
                "priority"
            );
            await annotate(
                "Complexity: Low - Empty State Handling",
                "complexity"
            );
            await annotate(
                "Edge Case: Setting sites to empty array",
                "edge-case"
            );
            await annotate(
                "Purpose: Ensure empty sites array is handled properly",
                "purpose"
            );

            stateActions.setSites([]);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should throw and log when duplicate identifiers are supplied", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Regression", "test-type");
            await annotate("Category: Data Integrity", "category");

            const duplicateSites: Site[] = [
                {
                    identifier: "duplicate",
                    monitors: [],
                    monitoring: true,
                    name: "Duplicate A",
                },
                {
                    identifier: "duplicate",
                    monitors: [],
                    monitoring: false,
                    name: "Duplicate B",
                },
            ];

            expect(() => stateActions.setSites(duplicateSites)).toThrow(
                DuplicateSiteIdentifierError
            );
            expect(logger.error).toHaveBeenCalledWith(
                "Duplicate site identifiers detected while replacing sites state",
                expect.objectContaining({
                    duplicates: expect.arrayContaining([
                        expect.objectContaining({
                            identifier: "duplicate",
                            occurrences: 2,
                        }),
                    ]),
                    siteCount: duplicateSites.length,
                })
            );
            expect(mockSet).not.toHaveBeenCalled();
        });
    });

    describe("recordSiteSyncDelta", () => {
        it("should persist delta summaries", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Category: Diagnostics", "category");
            await annotate("Type: State Tracking", "type");

            const delta = {
                addedSites: [cloneSite(mockSite)],
                removedSiteIdentifiers: ["removed-site"],
                updatedSites: [
                    {
                        identifier: mockSite.identifier,
                        previous: cloneSite(mockSite),
                        next: {
                            ...cloneSite(mockSite),
                            name: "Updated",
                        },
                    },
                ],
            } satisfies SiteSyncDelta;

            stateActions.recordSiteSyncDelta(delta);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls.pop()?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({
                    lastSyncDelta: undefined,
                    selectedMonitorIds: {},
                    selectedSiteIdentifier: undefined,
                    sites: [],
                    statusSubscriptionSummary: undefined,
                });

                expect(result).toEqual({ lastSyncDelta: delta });
            }
        });

        it("should allow clearing delta summaries", async () => {
            mockSet.mockClear();

            stateActions.recordSiteSyncDelta(undefined);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    describe("addSite", () => {
        it("should add site to existing sites", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - State Mutation", "test-type");
            await annotate("Operation: Site Addition to State", "operation");
            await annotate("Priority: Critical - Site Management", "priority");
            await annotate(
                "Complexity: Medium - Array State Mutation",
                "complexity"
            );
            await annotate(
                "State Operation: Append new site to existing sites",
                "state-operation"
            );
            await annotate(
                "Purpose: Ensure new sites can be added to existing collection",
                "purpose"
            );

            const newSite: Site = {
                identifier: "new-site",
                monitors: [],
                name: "New Site",
                monitoring: false,
            };

            stateActions.addSite(newSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            // Test the function passed to set
            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [mockSite],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result.sites).toHaveLength(2);
                expect(result.sites).toContain(mockSite);
                expect(result.sites).toContain(newSite);
            }
        });

        it("should add site to empty sites array", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate("Operation: First Site Addition", "operation");
            await annotate(
                "Priority: High - Initial Site Creation",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Empty to Populated State",
                "complexity"
            );
            await annotate(
                "Edge Case: Adding site to empty collection",
                "edge-case"
            );
            await annotate(
                "Purpose: Ensure first site can be added to empty state",
                "purpose"
            );

            mockGet.mockReturnValue(createState({ sites: [] }));

            stateActions.addSite(mockSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result.sites).toEqual([mockSite]);
            }
        });
    });

    describe("removeSite", () => {
        it("should clear selectedSiteIdentifier if removed site was selected", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - State Cleanup", "test-type");
            await annotate(
                "Operation: Site Removal with Selection Cleanup",
                "operation"
            );
            await annotate("Priority: Critical - Data Consistency", "priority");
            await annotate(
                "Complexity: High - Complex State Cleanup",
                "complexity"
            );
            await annotate(
                "State Consistency: Clear selection when selected site is removed",
                "state-consistency"
            );
            await annotate(
                "Purpose: Ensure selectedSiteIdentifier is cleared when that site is removed",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedMonitorIds: {},
                    selectedSiteIdentifier: "test-site",
                    sites: [mockSite],
                    statusSubscriptionSummary: undefined,
                })
            );

            stateActions.removeSite("test-site");

            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: "test-site",
                        sites: [mockSite],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result.selectedSiteIdentifier).toBeUndefined();
            }
        });
    });

    describe("selectSite", () => {
        it("should set selected site", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Selection Management",
                "test-type"
            );
            await annotate(
                "Operation: Site Selection State Update",
                "operation"
            );
            await annotate("Priority: High - UI State Management", "priority");
            await annotate(
                "Complexity: Medium - Selection State Update",
                "complexity"
            );
            await annotate(
                "UI State: Track currently selected site",
                "ui-state"
            );
            await annotate(
                "Purpose: Ensure site selection state is properly maintained",
                "purpose"
            );

            stateActions.selectSite(mockSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result).toEqual({ selectedSiteIdentifier: "test-site" });
            }
        });

        it("should clear selected site", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Selection Management",
                "test-type"
            );
            await annotate("Operation: Site Selection Clearing", "operation");
            await annotate("Priority: Medium - UI State Reset", "priority");
            await annotate(
                "Complexity: Low - Selection Clear Operation",
                "complexity"
            );
            await annotate(
                "UI State: Clear currently selected site",
                "ui-state"
            );
            await annotate(
                "Purpose: Ensure site selection can be cleared",
                "purpose"
            );

            stateActions.selectSite(undefined);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result).toEqual({ selectedSiteIdentifier: undefined });
            }
        });
    });

    describe("getSelectedSite", () => {
        it("should return selected site when found", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Data Retrieval", "test-type");
            await annotate("Operation: Selected Site Lookup", "operation");
            await annotate("Priority: High - UI Data Access", "priority");
            await annotate(
                "Complexity: Medium - State Lookup Logic",
                "complexity"
            );
            await annotate(
                "Data Access: Find selected site from state",
                "data-access"
            );
            await annotate(
                "Purpose: Ensure selected site can be retrieved correctly",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedSiteIdentifier: "test-site",
                    sites: [mockSite],
                })
            );

            const result = stateActions.getSelectedSite();

            expect(result).toEqual(mockSite);
        });

        it("should return undefined when no site selected", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate(
                "Operation: No Selection State Handling",
                "operation"
            );
            await annotate(
                "Priority: Medium - Default State Behavior",
                "priority"
            );
            await annotate(
                "Complexity: Low - Null State Handling",
                "complexity"
            );
            await annotate(
                "Edge Case: No site is currently selected",
                "edge-case"
            );
            await annotate(
                "Purpose: Ensure proper behavior when no site is selected",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedSiteIdentifier: undefined,
                    sites: [mockSite],
                })
            );

            const result = stateActions.getSelectedSite();

            expect(result).toBeUndefined();
        });

        it("should return undefined when selected site not found", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Error Handling", "test-type");
            await annotate(
                "Operation: Invalid Selection Handling",
                "operation"
            );
            await annotate("Priority: High - Data Consistency", "priority");
            await annotate(
                "Complexity: Medium - Missing Data Handling",
                "complexity"
            );
            await annotate(
                "Error Case: Selected site ID doesn't exist in sites array",
                "error-case"
            );
            await annotate(
                "Purpose: Ensure graceful handling of invalid site selections",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedMonitorIds: {},
                    selectedSiteIdentifier: "non-existent",
                    sites: [mockSite],
                    statusSubscriptionSummary: undefined,
                })
            );

            const result = stateActions.getSelectedSite();

            expect(result).toBeUndefined();
        });
    });

    describe("setSelectedMonitorId", () => {
        it("should set selected monitor ID for site", async ({ annotate }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Monitor Selection", "test-type");
            await annotate(
                "Operation: Monitor ID Assignment for Site",
                "operation"
            );
            await annotate("Priority: High - Monitor UI State", "priority");
            await annotate(
                "Complexity: Medium - Nested State Update",
                "complexity"
            );
            await annotate(
                "UI State: Track selected monitor per site",
                "ui-state"
            );
            await annotate(
                "Purpose: Ensure monitor selection state is maintained per site",
                "purpose"
            );

            stateActions.setSelectedMonitorId("test-site", "monitor-1");

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result.selectedMonitorIds?.["test-site"]).toBe(
                    "monitor-1"
                );
            }
        });

        it("should update existing selected monitor ID", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Monitor Selection Update",
                "test-type"
            );
            await annotate("Operation: Monitor Selection Change", "operation");
            await annotate("Priority: Medium - UI State Update", "priority");
            await annotate(
                "Complexity: Medium - State Override Operation",
                "complexity"
            );
            await annotate(
                "State Update: Change existing monitor selection",
                "state-update"
            );
            await annotate(
                "Purpose: Ensure monitor selection can be changed for existing site",
                "purpose"
            );

            stateActions.setSelectedMonitorId("test-site", "monitor-2");

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction(
                    createState({
                        selectedMonitorIds: { "test-site": "monitor-1" },
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );
                expect(result.selectedMonitorIds?.["test-site"]).toBe(
                    "monitor-2"
                );
            }
        });
    });

    describe("getSelectedMonitorId", () => {
        it("should return selected monitor ID for site", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Data Retrieval", "test-type");
            await annotate("Operation: Monitor ID Lookup", "operation");
            await annotate("Priority: High - UI Data Access", "priority");
            await annotate(
                "Complexity: Low - Simple State Lookup",
                "complexity"
            );
            await annotate(
                "Data Access: Retrieve selected monitor for site",
                "data-access"
            );
            await annotate(
                "Purpose: Ensure selected monitor ID can be retrieved for a site",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedMonitorIds: { "test-site": "monitor-1" },
                })
            );

            const result = stateActions.getSelectedMonitorId("test-site");

            expect(result).toBe("monitor-1");
        });

        it("should return undefined when no monitor selected for site", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate("Test Type: Unit - Edge Case Handling", "test-type");
            await annotate(
                "Operation: No Monitor Selection State",
                "operation"
            );
            await annotate(
                "Priority: Medium - Default State Behavior",
                "priority"
            );
            await annotate(
                "Complexity: Low - Missing Data Handling",
                "complexity"
            );
            await annotate(
                "Edge Case: No monitor selected for site",
                "edge-case"
            );
            await annotate(
                "Purpose: Ensure proper behavior when no monitor is selected",
                "purpose"
            );

            mockGet.mockReturnValue(
                createState({
                    selectedMonitorIds: {},
                    selectedSiteIdentifier: undefined,
                    sites: [],
                    statusSubscriptionSummary: undefined,
                })
            );

            const result = stateActions.getSelectedMonitorId("test-site");

            expect(result).toBeUndefined();
        });
    });

    describe("state immutability", () => {
        it("should not mutate original state in addSite", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Immutability Validation",
                "test-type"
            );
            await annotate("Operation: State Immutability Check", "operation");
            await annotate("Priority: Critical - State Integrity", "priority");
            await annotate(
                "Complexity: High - Immutability Pattern Validation",
                "complexity"
            );
            await annotate(
                "Immutability: Ensure original state is not mutated",
                "immutability"
            );
            await annotate(
                "Purpose: Validate that addSite doesn't mutate original state",
                "purpose"
            );

            const originalSites = [mockSite];
            const newSite: Site = {
                identifier: "new-site",
                monitors: [],
                name: "New Site",
                monitoring: false,
            };

            stateActions.addSite(newSite);

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                setFunction(
                    createState({
                        selectedMonitorIds: {},
                        selectedSiteIdentifier: undefined,
                        sites: originalSites,
                        statusSubscriptionSummary: undefined,
                    })
                );

                // Original array should be unchanged
                expect(originalSites).toHaveLength(1);
                expect(originalSites[0]).toBe(mockSite);
            }
        });

        it("should not mutate original selectedMonitorIds in setSelectedMonitorId", async ({
            annotate,
        }) => {
            await annotate("Component: useSitesState", "component");
            await annotate(
                "Test Type: Unit - Immutability Validation",
                "test-type"
            );
            await annotate(
                "Operation: Monitor IDs Immutability Check",
                "operation"
            );
            await annotate("Priority: Critical - State Integrity", "priority");
            await annotate(
                "Complexity: High - Object Immutability Validation",
                "complexity"
            );
            await annotate(
                "Immutability: Ensure original selectedMonitorIds is not mutated",
                "immutability"
            );
            await annotate(
                "Purpose: Validate monitor ID selection doesn't mutate original state",
                "purpose"
            );

            const originalIds = { "existing-site": "existing-monitor" };

            stateActions.setSelectedMonitorId("test-site", "monitor-1");

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                setFunction(
                    createState({
                        selectedMonitorIds: originalIds,
                        selectedSiteIdentifier: undefined,
                        sites: [],
                        statusSubscriptionSummary: undefined,
                    })
                );

                // Original object should be unchanged
                expect(originalIds).toEqual({
                    "existing-site": "existing-monitor",
                });
                expect(originalIds).not.toHaveProperty("test-site");
            }
        });
    });
});

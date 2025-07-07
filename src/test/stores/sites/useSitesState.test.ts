/**
 * Tests for useSitesState module
 * Tests core state management functionality
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../types";

import { createSitesStateActions, initialSitesState } from "../../../stores/sites/useSitesState";

// Mock logging
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useSitesState", () => {
    let mockSet: ReturnType<typeof vi.fn>;
    let mockGet: ReturnType<typeof vi.fn>;
    let stateActions: ReturnType<typeof createSitesStateActions>;
    let mockSite: Site;

    beforeEach(() => {
        mockSet = vi.fn();
        mockGet = vi.fn();

        mockSite = {
            identifier: "test-site",
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    status: "up" as const,
                    type: "http" as const,
                },
            ],
            name: "Test Site",
        };

        // Setup initial state
        mockGet.mockReturnValue({
            selectedMonitorIds: {},
            selectedSiteId: undefined,
            sites: [mockSite],
        });

        stateActions = createSitesStateActions(mockSet, mockGet);
    });

    describe("initialSitesState", () => {
        it("should have correct initial state", () => {
            expect(initialSitesState).toEqual({
                selectedMonitorIds: {},
                selectedSiteId: undefined,
                sites: [],
            });
        });
    });

    describe("setSites", () => {
        it("should set sites correctly", () => {
            const newSites = [mockSite];

            stateActions.setSites(newSites);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            // Test the function passed to set
            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({ selectedMonitorIds: {}, selectedSiteId: undefined, sites: [] });
                expect(result).toEqual({ sites: newSites });
            }
        });

        it("should handle empty sites array", () => {
            stateActions.setSites([]);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should handle undefined sites safely", () => {
            // @ts-expect-error - Testing edge case with undefined
            stateActions.setSites(undefined);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({ selectedMonitorIds: {}, selectedSiteId: undefined, sites: [] });
                expect(result).toEqual({ sites: [] });
            }
        });
    });

    describe("addSite", () => {
        it("should add site to existing sites", () => {
            const newSite: Site = {
                identifier: "new-site",
                monitors: [],
                name: "New Site",
            };

            stateActions.addSite(newSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            // Test the function passed to set
            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({ sites: [mockSite] });
                expect(result.sites).toHaveLength(2);
                expect(result.sites).toContain(mockSite);
                expect(result.sites).toContain(newSite);
            }
        });

        it("should add site to empty sites array", () => {
            mockGet.mockReturnValue({ sites: [] });

            stateActions.addSite(mockSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({ sites: [] });
                expect(result.sites).toEqual([mockSite]);
            }
        });
    });

    describe("removeSite", () => {
        it("should remove site by identifier", () => {
            stateActions.removeSite("test-site");

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({
                    selectedSiteId: undefined,
                    sites: [mockSite],
                });
                expect(result.sites).toHaveLength(0);
            }
        });

        it("should handle non-existent site removal", () => {
            stateActions.removeSite("non-existent");

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({ sites: [mockSite] });
                expect(result.sites).toEqual([mockSite]);
            }
        });

        it("should clear selectedSiteId if removed site was selected", () => {
            mockGet.mockReturnValue({
                selectedMonitorIds: {},
                selectedSiteId: "test-site",
                sites: [mockSite],
            });

            stateActions.removeSite("test-site");

            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({
                    selectedMonitorIds: {},
                    selectedSiteId: "test-site",
                    sites: [mockSite],
                });
                expect(result.selectedSiteId).toBeUndefined();
            }
        });
    });

    describe("setSelectedSite", () => {
        it("should set selected site", () => {
            stateActions.setSelectedSite(mockSite);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({});
                expect(result).toEqual({ selectedSiteId: "test-site" });
            }
        });

        it("should clear selected site", () => {
            stateActions.setSelectedSite(undefined);

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({});
                expect(result).toEqual({ selectedSiteId: undefined });
            }
        });
    });

    describe("getSelectedSite", () => {
        it("should return selected site when found", () => {
            mockGet.mockReturnValue({
                selectedSiteId: "test-site",
                sites: [mockSite],
            });

            const result = stateActions.getSelectedSite();

            expect(result).toEqual(mockSite);
        });

        it("should return undefined when no site selected", () => {
            mockGet.mockReturnValue({
                selectedSiteId: undefined,
                sites: [mockSite],
            });

            const result = stateActions.getSelectedSite();

            expect(result).toBeUndefined();
        });

        it("should return undefined when selected site not found", () => {
            mockGet.mockReturnValue({
                selectedSiteId: "non-existent",
                sites: [mockSite],
            });

            const result = stateActions.getSelectedSite();

            expect(result).toBeUndefined();
        });
    });

    describe("setSelectedMonitorId", () => {
        it("should set selected monitor ID for site", () => {
            stateActions.setSelectedMonitorId("test-site", "monitor-1");

            expect(mockSet).toHaveBeenCalledWith(expect.any(Function));

            const setFunction = mockSet.mock.calls[0]?.[0];
            expect(setFunction).toBeDefined();

            if (setFunction) {
                const result = setFunction({ selectedMonitorIds: {} });
                expect(result.selectedMonitorIds?.["test-site"]).toBe("monitor-1");
            }
        });

        it("should update existing selected monitor ID", () => {
            stateActions.setSelectedMonitorId("test-site", "monitor-2");

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                const result = setFunction({
                    selectedMonitorIds: { "test-site": "monitor-1" },
                });
                expect(result.selectedMonitorIds?.["test-site"]).toBe("monitor-2");
            }
        });
    });

    describe("getSelectedMonitorId", () => {
        it("should return selected monitor ID for site", () => {
            mockGet.mockReturnValue({
                selectedMonitorIds: { "test-site": "monitor-1" },
            });

            const result = stateActions.getSelectedMonitorId("test-site");

            expect(result).toBe("monitor-1");
        });

        it("should return undefined when no monitor selected for site", () => {
            mockGet.mockReturnValue({
                selectedMonitorIds: {},
            });

            const result = stateActions.getSelectedMonitorId("test-site");

            expect(result).toBeUndefined();
        });
    });

    describe("state immutability", () => {
        it("should not mutate original state in addSite", () => {
            const originalSites = [mockSite];
            const newSite: Site = {
                identifier: "new-site",
                monitors: [],
                name: "New Site",
            };

            stateActions.addSite(newSite);

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                setFunction({ sites: originalSites });

                // Original array should be unchanged
                expect(originalSites).toHaveLength(1);
                expect(originalSites[0]).toBe(mockSite);
            }
        });

        it("should not mutate original selectedMonitorIds in setSelectedMonitorId", () => {
            const originalIds = { "existing-site": "existing-monitor" };

            stateActions.setSelectedMonitorId("test-site", "monitor-1");

            const setFunction = mockSet.mock.calls[0]?.[0];
            if (setFunction) {
                setFunction({ selectedMonitorIds: originalIds });

                // Original object should be unchanged
                expect(originalIds).toEqual({ "existing-site": "existing-monitor" });
                expect(originalIds).not.toHaveProperty("test-site");
            }
        });
    });
});

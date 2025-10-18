/**
 * @file Tests for useSelectedSite hook Tests the hook that manages selected
 *   site state across store boundaries
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSelectedSite } from "../../hooks/useSelectedSite";
import type { Site } from "@shared/types";

// Mock the store hooks
vi.mock("../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(),
}));

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

import { useUIStore } from "../../stores/ui/useUiStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";

describe(useSelectedSite, () => {
    const mockUseUIStore = useUIStore as any;
    const mockUseSitesStore = useSitesStore as any;

    const mockSites: Site[] = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            monitors: [],
            monitoring: false,
        },
        {
            identifier: "site-2",
            name: "Test Site 2",
            monitors: [],
            monitoring: true,
        },
        {
            identifier: "site-3",
            name: "Test Site 3",
            monitors: [],
            monitoring: false,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic functionality", () => {
        it("should return undefined when no site is selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue(null);
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });

        it("should return undefined when selectedSiteIdentifier is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue(undefined);
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });

        it("should return undefined when selectedSiteIdentifier is empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });

        it("should return the correct site when a valid site is selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-2");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(mockSites[1]);
            expect(result.current?.identifier).toBe("site-2");
            expect(result.current?.name).toBe("Test Site 2");
        });

        it("should return undefined when selected site ID does not exist in sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("non-existent-site");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });
    });

    describe("Store selector behavior", () => {
        it("should call useUIStore with correct selector", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockImplementation((selector: any) =>
                selector({ selectedSiteIdentifier: "site-1" })
            );
            mockUseSitesStore.mockReturnValue(mockSites);

            renderHook(() => useSelectedSite());

            expect(mockUseUIStore).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should call useSitesStore with correct selector", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockImplementation((selector: any) =>
                selector({ sites: mockSites })
            );

            renderHook(() => useSelectedSite());

            expect(mockUseSitesStore).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });
    });

    describe("Different site scenarios", () => {
        it("should handle selecting the first site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(mockSites[0]);
        });

        it("should handle selecting the last site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-3");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(mockSites[2]);
        });

        it("should work with single site in array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const singleSite = [mockSites[0]];
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(singleSite);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(singleSite[0]);
        });

        it("should return undefined with empty sites array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue([]);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toBeUndefined();
        });
    });

    describe("Edge cases", () => {
        it("should handle sites with similar identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const sitesWithSimilarIds: Site[] = [
                {
                    identifier: "site",
                    name: "Test Site 1",
                    monitors: [],
                    monitoring: true,
                },
                {
                    identifier: "site-1",
                    name: "Test Site 2",
                    monitors: [],
                    monitoring: true,
                },
                {
                    identifier: "site-10",
                    name: "Test Site 3",
                    monitors: [],
                    monitoring: false,
                },
            ];

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(sitesWithSimilarIds);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current?.identifier).toBe("site-1");
            expect(result.current).toEqual(sitesWithSimilarIds[1]);
        });

        it("should handle duplicate site identifiers (returns first match)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const sitesWithDuplicates: Site[] = [
                {
                    identifier: "duplicate",
                    name: "First Duplicate",
                    monitors: [],
                    monitoring: true,
                },
                {
                    identifier: "duplicate",
                    name: "Second Duplicate",
                    monitors: [],
                    monitoring: false,
                },
            ];

            mockUseUIStore.mockReturnValue("duplicate");
            mockUseSitesStore.mockReturnValue(sitesWithDuplicates);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current?.name).toBe("First Duplicate");
        });

        it("should handle sites with special characters in identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const siteWithSpecialChars: Site = {
                identifier: "site-with-@special#chars$",
                name: "Test Site 1",
                monitors: [],
                monitoring: true,
            };

            mockUseUIStore.mockReturnValue("site-with-@special#chars$");
            mockUseSitesStore.mockReturnValue([siteWithSpecialChars]);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(siteWithSpecialChars);
        });

        it("should handle very long site identifiers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const longIdentifier = "a".repeat(1000);
            const siteWithLongId: Site = {
                identifier: longIdentifier,
                name: "Test Site 1",
                monitors: [],
                monitoring: false,
            };

            mockUseUIStore.mockReturnValue(longIdentifier);
            mockUseSitesStore.mockReturnValue([siteWithLongId]);

            const { result } = renderHook(() => useSelectedSite());

            expect(result.current).toEqual(siteWithLongId);
        });
    });

    describe("State updates and reactivity", () => {
        it("should update when selectedSiteIdentifier changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            mockUseSitesStore.mockReturnValue(mockSites);

            // Start with site-1 selected
            mockUseUIStore.mockReturnValue("site-1");
            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current?.identifier).toBe("site-1");

            // Change to site-2
            mockUseUIStore.mockReturnValue("site-2");
            rerender();
            expect(result.current?.identifier).toBe("site-2");
        });

        it("should update when sites array changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            mockUseUIStore.mockReturnValue("site-1");

            // Start with original sites
            mockUseSitesStore.mockReturnValue(mockSites);
            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current?.name).toBe("Test Site 1");

            // Update sites array with modified site
            const updatedSites = mockSites.map((site) =>
                site.identifier === "site-1"
                    ? { ...site, name: "Updated Test Site 1" }
                    : site
            );
            mockUseSitesStore.mockReturnValue(updatedSites);
            rerender();
            expect(result.current?.name).toBe("Updated Test Site 1");
        });

        it("should handle transition from selected to no selection", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue(mockSites);

            // Start with site selected
            mockUseUIStore.mockReturnValue("site-1");
            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current).toBeDefined();

            // Change to no selection
            mockUseUIStore.mockReturnValue(null);
            rerender();
            expect(result.current).toBeUndefined();
        });

        it("should handle transition from no selection to selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue(mockSites);

            // Start with no selection
            mockUseUIStore.mockReturnValue(null);
            const { result, rerender } = renderHook(() => useSelectedSite());
            expect(result.current).toBeUndefined();

            // Change to site selected
            mockUseUIStore.mockReturnValue("site-2");
            rerender();
            expect(result.current?.identifier).toBe("site-2");
        });
    });

    describe("Memoization behavior", () => {
        it("should return the same object reference when inputs don't change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            const { result, rerender } = renderHook(() => useSelectedSite());
            const firstResult = result.current;

            rerender();
            const secondResult = result.current;

            expect(firstResult).toBe(secondResult);
        });

        it("should return new reference when selectedSiteIdentifier changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue(mockSites);

            mockUseUIStore.mockReturnValue("site-1");
            const { result, rerender } = renderHook(() => useSelectedSite());
            const firstResult = result.current;

            mockUseUIStore.mockReturnValue("site-2");
            rerender();
            const secondResult = result.current;

            expect(firstResult).not.toBe(secondResult);
        });

        it("should return new reference when sites array changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSelectedSite", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue("site-1");

            mockUseSitesStore.mockReturnValue(mockSites);
            const { result, rerender } = renderHook(() => useSelectedSite());
            const firstResult = result.current;

            // Create a new array with new objects but same content to force memoization to recalculate
            const newSites = mockSites.map((site) => ({ ...site }));
            mockUseSitesStore.mockReturnValue(newSites);
            rerender();
            const secondResult = result.current;

            // The site objects are different even though the content is the same
            expect(firstResult).not.toBe(secondResult);
        });
    });
});

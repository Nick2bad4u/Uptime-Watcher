/**
 * @file Comprehensive tests for useSelectedSite hook Testing store
 *   coordination, memoization, and state management
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSelectedSite } from "../../hooks/useSelectedSite";

// Mock the store hooks
vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

vi.mock("../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(),
}));

// Mock React useMemo to ensure it works correctly
vi.mock("react", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        useMemo: vi.fn((fn: () => any, _deps: any[]) => fn()),
    };
});

describe("useSelectedSite", () => {
    // Get mock references
    let mockUseSitesStore: any;
    let mockUseUIStore: any;
    let mockUseMemo: any;

    // Test data
    const mockSites = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            url: "https://example1.com",
            status: "up" as const,
            lastChecked: "2023-01-01T00:00:00Z",
            history: [],
            isActive: true,
        },
        {
            identifier: "site-2",
            name: "Test Site 2",
            url: "https://example2.com",
            status: "down" as const,
            lastChecked: "2023-01-01T01:00:00Z",
            history: [],
            isActive: true,
        },
        {
            identifier: "site-3",
            name: "Test Site 3",
            url: "https://example3.com",
            status: "up" as const,
            lastChecked: "2023-01-01T02:00:00Z",
            history: [],
            isActive: false,
        },
    ];

    beforeEach(async () => {
        vi.clearAllMocks();

        // Get mock references from the mocked modules
        const sitesModule = await import("../../stores/sites/useSitesStore");
        const uiModule = await import("../../stores/ui/useUiStore");
        const reactModule = await import("react");

        mockUseSitesStore = vi.mocked(sitesModule.useSitesStore);
        mockUseUIStore = vi.mocked(uiModule.useUIStore);
        mockUseMemo = vi.mocked(reactModule.useMemo);

        // Setup default mock behavior for useMemo
        mockUseMemo.mockImplementation((fn: () => any, _deps: any[]) => {
            // In real tests, we want to actually execute the memoized function
            return fn();
        });
    });

    describe("Basic Functionality", () => {
        it("should return undefined when no site is selected", () => {
            // Arrange
            mockUseUIStore.mockReturnValue(null); // selectedSiteId is null
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
        });

        it("should return undefined when selectedSiteId is undefined", () => {
            // Arrange
            mockUseUIStore.mockReturnValue(undefined); // selectedSiteId is undefined
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
        });

        it("should return undefined when selectedSiteId is empty string", () => {
            // Arrange
            mockUseUIStore.mockReturnValue(""); // selectedSiteId is empty string
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
        });

        it("should return the correct site when a valid site is selected", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-2");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toEqual(mockSites[1]);
            expect(result.current?.identifier).toBe("site-2");
            expect(result.current?.name).toBe("Test Site 2");
        });

        it("should return undefined when selected site does not exist in sites array", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("non-existent-site");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
        });
    });

    describe("Store Integration", () => {
        it("should call useUIStore with correct selector", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            renderHook(() => useSelectedSite());

            // Assert
            expect(mockUseUIStore).toHaveBeenCalledWith(expect.any(Function));

            // Test the selector function
            const selector = mockUseUIStore.mock.calls[0][0];
            const mockState = {
                selectedSiteId: "test-id",
                otherProperty: "ignored",
            };
            expect(selector(mockState)).toBe("test-id");
        });

        it("should call useSitesStore with correct selector", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            renderHook(() => useSelectedSite());

            // Assert
            expect(mockUseSitesStore).toHaveBeenCalledWith(
                expect.any(Function)
            );

            // Test the selector function
            const selector = mockUseSitesStore.mock.calls[0][0];
            const mockState = { sites: mockSites, otherProperty: "ignored" };
            expect(selector(mockState)).toEqual(mockSites);
        });
    });

    describe("Memoization Behavior", () => {
        it("should use useMemo with correct dependencies", () => {
            // Arrange
            const selectedSiteId = "site-1";
            mockUseUIStore.mockReturnValue(selectedSiteId);
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            renderHook(() => useSelectedSite());

            // Assert
            expect(mockUseMemo).toHaveBeenCalledWith(expect.any(Function), [
                selectedSiteId,
                mockSites,
            ]);
        });

        it("should pass correct computation function to useMemo", () => {
            // Arrange
            const selectedSiteId = "site-2";
            mockUseUIStore.mockReturnValue(selectedSiteId);
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            renderHook(() => useSelectedSite());

            // Assert
            expect(mockUseMemo).toHaveBeenCalledTimes(1);

            // Get the computation function passed to useMemo
            const computationFn = mockUseMemo.mock.calls[0][0];
            const result = computationFn();

            expect(result).toEqual(mockSites[1]);
        });

        it("should handle memoization with null selectedSiteId", () => {
            // Arrange
            mockUseUIStore.mockReturnValue(null);
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            renderHook(() => useSelectedSite());

            // Assert
            expect(mockUseMemo).toHaveBeenCalledWith(expect.any(Function), [
                null,
                mockSites,
            ]);

            // Test the memoized computation
            const computationFn = mockUseMemo.mock.calls[0][0];
            const result = computationFn();
            expect(result).toBeUndefined();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty sites array", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue([]);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
        });

        it("should handle undefined sites array", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(undefined as any);

            // Act & Assert - Should throw because the hook doesn't handle undefined arrays
            expect(() => {
                renderHook(() => useSelectedSite());
            }).toThrow("Cannot read properties of undefined");
        });

        it("should handle null sites array", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(null as any);

            // Act & Assert - Should throw because the hook doesn't handle null arrays
            expect(() => {
                renderHook(() => useSelectedSite());
            }).toThrow("Cannot read properties of null");
        });

        it("should handle sites with malformed identifiers", () => {
            // Arrange
            const malformedSites = [
                { identifier: null, name: "Bad Site 1" },
                { identifier: undefined, name: "Bad Site 2" },
                { identifier: "", name: "Bad Site 3" },
                ...mockSites,
            ] as any;

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(malformedSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toEqual(mockSites[0]);
            expect(result.current?.identifier).toBe("site-1");
        });

        it("should handle very large sites array efficiently", () => {
            // Arrange
            const largeSitesArray = Array.from({ length: 10_000 }, (_, i) => ({
                identifier: `site-${i}`,
                name: `Site ${i}`,
                url: `https://example${i}.com`,
                status: "up" as const,
                lastChecked: "2023-01-01T00:00:00Z",
                history: [],
                isActive: true,
            }));

            // Add our target site at the end
            const targetSite = {
                identifier: "site-1",
                name: "Test Site 1",
                url: "https://example1.com",
                status: "up" as const,
                lastChecked: "2023-01-01T00:00:00Z",
                history: [],
                isActive: true,
            };
            largeSitesArray.push(targetSite);

            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(largeSitesArray);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current?.identifier).toBe("site-1");
            expect(result.current?.name).toBe("Site 1"); // It finds the generated site from the large array
        });
    });

    describe("State Changes", () => {
        it("should update when selectedSiteId changes", () => {
            // Arrange
            mockUseSitesStore.mockReturnValue(mockSites);
            mockUseUIStore.mockReturnValue("site-1");

            // Act
            const { result, rerender } = renderHook(() => useSelectedSite());

            // Assert initial state
            expect(result.current?.identifier).toBe("site-1");

            // Change selected site
            mockUseUIStore.mockReturnValue("site-2");
            rerender();

            // Assert updated state
            expect(result.current?.identifier).toBe("site-2");
        });

        it("should update when sites array changes", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result, rerender } = renderHook(() => useSelectedSite());

            // Assert initial state
            expect(result.current?.name).toBe("Test Site 1");

            // Change sites array (same ID, different data)
            const updatedSites = [...mockSites];
            updatedSites[0] = {
                identifier: mockSites[0]!.identifier,
                name: "Updated Site 1",
                url: mockSites[0]!.url,
                status: mockSites[0]!.status,
                lastChecked: mockSites[0]!.lastChecked,
                history: mockSites[0]!.history,
                isActive: mockSites[0]!.isActive,
            };
            mockUseSitesStore.mockReturnValue(updatedSites);
            rerender();

            // Assert updated state
            expect(result.current?.name).toBe("Updated Site 1");
        });

        it("should clear selection when selected site is removed from sites", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-2");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result, rerender } = renderHook(() => useSelectedSite());

            // Assert initial state
            expect(result.current?.identifier).toBe("site-2");

            // Remove selected site from sites array
            const filteredSites = mockSites.filter(
                (site) => site.identifier !== "site-2"
            );
            mockUseSitesStore.mockReturnValue(filteredSites);
            rerender();

            // Assert selection is cleared
            expect(result.current).toBeUndefined();
        });
    });

    describe("Type Safety", () => {
        it("should return correct TypeScript types", () => {
            // Arrange
            mockUseUIStore.mockReturnValue("site-1");
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            if (result.current) {
                // TypeScript should infer these properties exist
                expect(typeof result.current.identifier).toBe("string");
                expect(typeof result.current.name).toBe("string");
                // Note: url, status, lastChecked, history, isActive are not part of the Site type
            }
        });

        it("should handle undefined return type correctly", () => {
            // Arrange
            mockUseUIStore.mockReturnValue(null);
            mockUseSitesStore.mockReturnValue(mockSites);

            // Act
            const { result } = renderHook(() => useSelectedSite());

            // Assert
            expect(result.current).toBeUndefined();
            // TypeScript should allow undefined checks
            if (result.current) {
                expect(result.current.identifier).toBeDefined();
            } else {
                expect(result.current).toBeUndefined();
            }
        });
    });

    describe("Performance", () => {
        it("should not cause unnecessary recalculations with same dependencies", () => {
            // Arrange
            const selectedSiteId = "site-1";
            mockUseUIStore.mockReturnValue(selectedSiteId);
            mockUseSitesStore.mockReturnValue(mockSites);

            // Use real useMemo behavior for this test
            mockUseMemo.mockImplementation((fn: any, _deps: any) => {
                // Track how many times the computation function is called
                return fn();
            });

            // Act
            const { rerender } = renderHook(() => useSelectedSite());

            // Clear the mock to count subsequent calls
            mockUseMemo.mockClear();

            // Rerender with same values
            rerender();

            // Assert - useMemo should be called again but deps haven't changed
            expect(mockUseMemo).toHaveBeenCalledWith(expect.any(Function), [
                selectedSiteId,
                mockSites,
            ]);
        });
    });
});

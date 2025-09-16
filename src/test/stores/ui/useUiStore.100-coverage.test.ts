/**
 * @file Tests to reach 100% coverage for useUiStore.ts lines 130-131 Targeting
 *   the selectSite function when site is undefined
 */

import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUIStore } from "../../../stores/ui/useUiStore";

// Mock the logger
vi.mock("@/stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useUIStore - 100% Coverage Tests", () => {
    beforeEach(() => {
        // Clear store state before each test
        useUIStore.persist.clearStorage();
    });

    afterEach(() => {
        // Reset after each test
        useUIStore.persist.clearStorage();
    });

    describe("Targeting Lines 130-131 (selectSite with undefined)", () => {
        test("should handle selectSite with undefined site", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Wait for hydration
            if (!useUIStore.persist.hasHydrated()) {
                await useUIStore.persist.rehydrate();
            }

            // Set a site first
            const mockSite = {
                identifier: "test-site-1",
                name: "Test Site",
                monitoring: true,
                monitors: [],
            };

            await act(async () => {
                result.current.selectSite(mockSite);
            });

            expect(result.current.selectedSiteId).toBe("test-site-1");

            // Now set it to undefined - this targets line 130-131
            await act(async () => {
                result.current.selectSite(undefined);
            });

            expect(result.current.selectedSiteId).toBeUndefined();
        });

        test("should handle selectSite with valid site", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Wait for hydration
            if (!useUIStore.persist.hasHydrated()) {
                await useUIStore.persist.rehydrate();
            }

            const mockSite = {
                identifier: "test-site-2",
                name: "Test Site 2",
                monitoring: true,
                monitors: [],
            };

            // This should set the identifier
            await act(async () => {
                result.current.selectSite(mockSite);
            });

            expect(result.current.selectedSiteId).toBe("test-site-2");
        });

        test("should handle all UI store actions for coverage", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: useUiStore.100-coverage", "component");
            annotate("Category: Store", "category");
            annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useUIStore());

            // Wait for hydration
            if (!useUIStore.persist.hasHydrated()) {
                await useUIStore.persist.rehydrate();
            }

            // Test all the UI store actions to ensure coverage
            await act(async () => {
                result.current.setShowAddSiteModal(true);
            });
            expect(result.current.showAddSiteModal).toBeTruthy();

            await act(async () => {
                result.current.setShowAddSiteModal(false);
            });
            expect(result.current.showAddSiteModal).toBeFalsy();

            await act(async () => {
                result.current.setShowAdvancedMetrics(true);
            });
            expect(result.current.showAdvancedMetrics).toBeTruthy();

            await act(async () => {
                result.current.setShowAdvancedMetrics(false);
            });
            expect(result.current.showAdvancedMetrics).toBeFalsy();

            await act(async () => {
                result.current.setShowSettings(true);
            });
            expect(result.current.showSettings).toBeTruthy();

            await act(async () => {
                result.current.setShowSettings(false);
            });
            expect(result.current.showSettings).toBeFalsy();
        });
    });
});

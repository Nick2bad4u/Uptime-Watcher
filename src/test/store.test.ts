/**
 * Store Tests - Testing New Store Structure
 * Tests for the new focused stores (sites, settings, ui, error, updates, stats)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all stores
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

vi.mock("../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(),
}));

vi.mock("../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(),
}));

vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

vi.mock("../stores/updates/useUpdatesStore", () => ({
    useUpdatesStore: vi.fn(),
}));

vi.mock("../stores/stats/useStatsStore", () => ({
    useStatsStore: vi.fn(),
}));

describe("New Store Structure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should import all stores successfully", async () => {
        const stores = await import("../stores");
        
        expect(stores.useSitesStore).toBeDefined();
        expect(stores.useSettingsStore).toBeDefined();
        expect(stores.useUIStore).toBeDefined();
        expect(stores.useErrorStore).toBeDefined();
        expect(stores.useUpdatesStore).toBeDefined();
        expect(stores.useStatsStore).toBeDefined();
    });

    it("should export store types", async () => {
        const stores = await import("../stores");
        
        // Just check that types are available in TypeScript
        expect(typeof stores.useSitesStore).toBe("function");
        expect(typeof stores.useSettingsStore).toBe("function");
        expect(typeof stores.useUIStore).toBe("function");
        expect(typeof stores.useErrorStore).toBe("function");
        expect(typeof stores.useUpdatesStore).toBe("function");
        expect(typeof stores.useStatsStore).toBe("function");
    });
});
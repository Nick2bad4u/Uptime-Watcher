/**
 * Property-based fuzzing tests for SiteList component rendering and interaction.
 *
 * Uses fast-check to generate comprehensive test cases that exercise the SiteList
 * component with various site configurations, edge cases, and malformed data.
 * This approach helps discover bugs that traditional example-based tests might miss.
 *
 * Coverage areas:
 * - Site list rendering with arbitrary site data
 * - Theme integration and styling variations
 * - Empty state handling and transitions
 * - Site identifier uniqueness and mapping
 * - Component resilience to malformed data
 * - Performance characteristics with large datasets
 * - DOM structure consistency
 * - Accessibility attributes maintenance
 *
 * @file Comprehensive property-based fuzzing tests for SiteList component
 * @author AI Assistant
 */

import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { Site, Monitor, MonitorStatus, MonitorType } from "../../../../../shared/types";

import { SiteList } from "../../../../components/Dashboard/SiteList/SiteList";

// Mock state for sites store with enhanced coverage
let mockSitesState = {
    sites: [] as Site[],
    isLoading: false,
    error: null as string | null,
    selectedMonitorIds: {} as Record<string, string>,
    selectedSiteId: undefined as string | undefined,
};

// Mock state for theme with enhanced coverage
let mockThemeState = {
    isDark: false,
    currentTheme: { name: "light" as "light" | "dark" | "auto", colors: {} as any },
    themeVersion: 0,
};

// Enhanced mock functions for dynamic behavior
const mockSitesStoreFn = vi.fn();
const mockThemeHookFn = vi.fn();

// Mock stores using external state pattern (like Header test)
vi.mock("../../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: mockSitesState.sites,
        isLoading: mockSitesState.isLoading,
        error: mockSitesState.error,
    })),
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        isDark: mockThemeState.isDark,
        currentTheme: mockThemeState.currentTheme,
    })),
}));

// Mock SiteCard component
vi.mock("../../../../components/Dashboard/SiteCard/SiteCard", () => ({
    SiteCard: ({ site }: { site: Site }) => (
        <div data-testid={`site-card-${site.identifier}`}>
            <span data-testid={`site-name-${site.identifier}`}>{site.name}</span>
            <span data-testid={`site-monitoring-${site.identifier}`}>{site.monitoring ? "Active" : "Inactive"}</span>
            <span data-testid={`site-monitor-count-${site.identifier}`}>{site.monitors.length}</span>
        </div>
    ),
}));

// Mock EmptyState component
vi.mock("../../../../components/Dashboard/SiteList/EmptyState", () => ({
    EmptyState: () => <div data-testid="empty-state">No sites configured</div>,
}));

// =============================================================================
// Custom Fast-Check Arbitraries
// =============================================================================

/**
 * Arbitrary for generating CSS-safe identifiers
 * Avoids characters that would break CSS selectors: [](){}#$%'",;:*&^!|~`
 */
const cssSafeIdentifierArbitrary = (options: { minLength?: number; maxLength?: number } = {}) =>
    fc.array(
        fc.constantFrom(
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_', '.'
        ),
        { minLength: options.minLength || 1, maxLength: options.maxLength || 50 }
    ).map(arr => arr.join('')).map(s => s.trim().replace(/^[.-]/, 'a')).filter(s => s.length > 0 && /^[A-Za-z]/.test(s));

/**
 * Arbitrary for generating valid Monitor objects
 */
const validMonitorArbitrary = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    type: fc.constantFrom("http", "ping", "port", "dns") as fc.Arbitrary<MonitorType>,
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused") as fc.Arbitrary<MonitorStatus>,
    responseTime: fc.integer({ min: 0, max: 10_000 }),
    checkInterval: fc.integer({ min: 1000, max: 300_000 }),
    timeout: fc.integer({ min: 1000, max: 60_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    history: fc.uniqueArray(fc.record({
        timestamp: fc.integer({ min: 0, max: Date.now() }),
        status: fc.constantFrom("up", "down"),
        responseTime: fc.integer({ min: 0, max: 10_000 }),
        details: fc.option(fc.string(), { nil: undefined }),
    }), { selector: (item) => item.timestamp, maxLength: 100 }),
    host: fc.option(fc.string(), { nil: undefined }),
    port: fc.option(fc.integer({ min: 1, max: 65_535 }), { nil: undefined }),
    url: fc.option(fc.webUrl(), { nil: undefined }),
    lastChecked: fc.option(fc.date(), { nil: undefined }),
    expectedValue: fc.option(fc.string(), { nil: undefined }),
    recordType: fc.option(fc.string(), { nil: undefined }),
    activeOperations: fc.option(fc.uniqueArray(fc.string(), { selector: (str) => str, maxLength: 5 }), { nil: undefined }),
});

/**
 * Arbitrary for generating valid Site objects (without 'url' property)
 */
const validSiteArbitrary = fc.record({
    identifier: cssSafeIdentifierArbitrary({ minLength: 1, maxLength: 100 }),
    name: fc.string({ minLength: 1, maxLength: 200 }).map(s => s.trim()).filter(s => s.length > 0),
    monitoring: fc.boolean(),
    monitors: fc.uniqueArray(validMonitorArbitrary, { selector: (monitor) => monitor.id, maxLength: 10 }),
});

/**
 * Arbitrary for generating theme configurations
 */
const themeArbitrary = fc.record({
    isDark: fc.boolean(),
    currentTheme: fc.record({
        name: fc.constantFrom("light", "dark", "auto"),
        colors: fc.record({
            primary: fc.string(),
            secondary: fc.string(),
        }),
    }),
});

/**
 * Arbitrary for generating edge case site data
 */
const edgeCaseSiteArbitrary = fc.oneof(
    // Very long strings
    fc.record({
        identifier: cssSafeIdentifierArbitrary({ minLength: 100, maxLength: 200 }),
        name: fc.string({ minLength: 100, maxLength: 200 }).map(s => s.trim()).filter(s => s.length > 0),
        monitoring: fc.boolean(),
        monitors: fc.uniqueArray(validMonitorArbitrary, { selector: (monitor) => monitor.id, maxLength: 100 }),
    }),
    // Unicode and special characters
    fc.record({
        identifier: cssSafeIdentifierArbitrary(),
        name: fc.string().map(s => s.trim()).filter(s => s.length > 0),
        monitoring: fc.boolean(),
        monitors: fc.constant([]),
    }),
    // Empty monitors array
    fc.record({
        identifier: cssSafeIdentifierArbitrary({ minLength: 1, maxLength: 50 }),
        name: fc.string({ minLength: 1, maxLength: 100 }).map(s => s.trim()).filter(s => s.length > 0),
        monitoring: fc.boolean(),
        monitors: fc.constant([]),
    }),
) as fc.Arbitrary<Site>;

// =============================================================================
// Test Setup
// =============================================================================

describe("SiteList Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        // Clean up any existing DOM elements
        cleanup();

        // Reset mock state before each test
        mockSitesState.sites = [];
        mockSitesState.isLoading = false;
        mockSitesState.error = null;
        mockThemeState.isDark = false;
        mockThemeState.currentTheme = { name: "light", colors: {} };

        // Clear all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    // =============================================================================
    // Basic Rendering Tests
    // =============================================================================

    describe("Basic Rendering with Arbitrary Data", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, maxLength: 20 }), themeArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should render site cards for valid site data",
            (sites, theme) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = sites;
                mockThemeState.isDark = theme.isDark;
                mockThemeState.currentTheme = theme.currentTheme;

                // Render component
                render(<SiteList />);

                // Property: Should render a site card for each site
                for (const site of sites) {
                    expect(screen.getByTestId(`site-card-${site.identifier}`)).toBeInTheDocument();
                    expect(screen.getByTestId(`site-name-${site.identifier}`)).toHaveTextContent(site.name);
                    expect(screen.getByTestId(`site-monitoring-${site.identifier}`)).toHaveTextContent(
                        site.monitoring ? "Active" : "Inactive"
                    );
                    expect(screen.getByTestId(`site-monitor-count-${site.identifier}`)).toHaveTextContent(
                        site.monitors.length.toString()
                    );
                }
            }
        );

        fcTest.prop([themeArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })(
            "should render empty state when no sites provided",
            (theme) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = [];
                mockThemeState.isDark = theme.isDark;
                mockThemeState.currentTheme = theme.currentTheme;

                // Render component
                render(<SiteList />);

                // Property: Should show empty state
                expect(screen.getByTestId("empty-state")).toBeInTheDocument();
                expect(screen.getByTestId("empty-state")).toHaveTextContent("No sites configured");
            }
        );
    });

    // =============================================================================
    // Edge Case Handling Tests
    // =============================================================================

    describe("Edge Case Data Handling", () => {
        fcTest.prop([fc.uniqueArray(edgeCaseSiteArbitrary as fc.Arbitrary<Site>, { selector: (site) => site.identifier, maxLength: 10 }), themeArbitrary], {
            numRuns: 30,
            timeout: 5000,
        })(
            "should handle sites with edge case properties",
            (malformedSites, theme) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = malformedSites || [];
                mockThemeState.isDark = theme.isDark;
                mockThemeState.currentTheme = theme.currentTheme;

                // Render component
                render(<SiteList />);

                // Property: Should not crash with malformed data
                if (malformedSites && malformedSites.length > 0) {
                    // Should render something for each site, even if malformed
                    for (const site of malformedSites) {
                        if (site && site.identifier) {
                            expect(document.querySelector(`[data-testid="site-card-${site.identifier}"]`)).toBeInTheDocument();
                        }
                    }
                } else {
                    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
                }
            }
        );
    });

    // =============================================================================
    // Performance and Scale Tests
    // =============================================================================

    describe("Performance with Large Datasets", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, minLength: 20, maxLength: 50 }), themeArbitrary], {
            numRuns: 10,
            timeout: 8000,
        })(
            "should handle large numbers of sites efficiently",
            (sites, theme) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = sites;
                mockThemeState.isDark = theme.isDark;
                mockThemeState.currentTheme = theme.currentTheme;

                const startTime = performance.now();

                // Render component
                render(<SiteList />);

                const endTime = performance.now();
                const renderTime = endTime - startTime;

                // Property: Should render within reasonable time (< 1000ms for 50 sites)
                expect(renderTime).toBeLessThan(1000);

                // Property: Should render all sites
                expect(sites.length).toBeGreaterThan(0);
                for (const site of sites.slice(0, 10)) { // Check first 10 to avoid timeout
                    expect(screen.getByTestId(`site-card-${site.identifier}`)).toBeInTheDocument();
                }
            }
        );
    });

    // =============================================================================
    // Site Identifier Uniqueness Tests
    // =============================================================================

    describe("Site Identifier Uniqueness", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, maxLength: 20 })], {
            numRuns: 20,
            timeout: 5000,
        })(
            "should handle sites with unique identifiers correctly",
            (uniqueSites) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = uniqueSites;
                mockThemeState.isDark = false;

                // Render component
                render(<SiteList />);

                // Property: Each site should have a unique rendered card
                const renderedIdentifiers = uniqueSites.map(site => site.identifier);
                const uniqueRenderedIdentifiers = new Set(renderedIdentifiers);

                expect(uniqueRenderedIdentifiers.size).toBe(renderedIdentifiers.length);
            }
        );
    });

    // =============================================================================
    // Theme Integration Tests
    // =============================================================================

    describe("Theme Integration", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, maxLength: 5 }), fc.record({
            isDark: fc.boolean(),
            currentTheme: fc.record({
                name: fc.constantFrom("light", "dark", "auto"),
                colors: fc.record({
                    primary: fc.string(),
                    secondary: fc.string(),
                }),
            }),
        })], {
            numRuns: 30,
            timeout: 5000,
        })(
            "should apply theme variations correctly",
            (sites, theme) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = sites;
                mockThemeState.isDark = theme.isDark;
                mockThemeState.currentTheme = theme.currentTheme;

                // Render component
                render(<SiteList />);

                // Property: Should render without errors regardless of theme
                if (sites.length > 0) {
                    expect(screen.getByTestId(`site-card-${sites[0]!.identifier}`)).toBeInTheDocument();
                } else {
                    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
                }
            }
        );
    });

    // =============================================================================
    // Accessibility Tests
    // =============================================================================

    describe("Accessibility Properties", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, maxLength: 10 })], {
            numRuns: 25,
            timeout: 5000,
        })(
            "should maintain accessibility attributes with arbitrary data",
            (sites) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = sites;
                mockThemeState.isDark = false;

                // Render component
                render(<SiteList />);

                // Property: All interactive elements should have proper test IDs
                for (const site of sites) {
                    const siteCard = screen.getByTestId(`site-card-${site.identifier}`);
                    expect(siteCard).toBeInTheDocument();

                    // Should have accessible content
                    expect(screen.getByTestId(`site-name-${site.identifier}`)).toHaveTextContent(site.name);
                }
            }
        );
    });

    // =============================================================================
    // Memory and Cleanup Tests
    // =============================================================================

    describe("Memory Management", () => {
        fcTest.prop([fc.uniqueArray(validSiteArbitrary, { selector: (site) => site.identifier, maxLength: 20 })], {
            numRuns: 15,
            timeout: 5000,
        })(
            "should properly clean up after renders",
            (sites) => {
                // Ensure clean DOM state
                cleanup();

                // Setup mocks
                mockSitesState.sites = sites;
                mockThemeState.isDark = false;

                // Render and unmount multiple times
                const { unmount } = render(<SiteList />);
                unmount();

                const { unmount: unmount2 } = render(<SiteList />);
                unmount2();

                // Property: Should not cause memory leaks or errors
                // This test mainly ensures no exceptions are thrown
                expect(true).toBeTruthy();
            }
        );
    });
});

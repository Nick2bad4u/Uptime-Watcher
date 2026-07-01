/**
 * Property-based fuzzing tests for SiteCard component rendering and
 * interaction.
 *
 * Uses fast-check to generate comprehensive test cases that exercise the
 * SiteCard component with various site configurations, edge cases, and
 * malformed data. This approach helps discover bugs that traditional
 * example-based tests might miss.
 *
 * Coverage areas:
 *
 * - SiteCard rendering with arbitrary site data
 * - Theme integration and styling variations
 * - Sub-component interaction and prop passing
 * - Site identifier uniqueness and mapping
 * - Component resilience to edge cases and malformed data
 * - Performance characteristics with large datasets
 * - DOM structure consistency
 * - Accessibility attributes maintenance
 *
 * @file Comprehensive property-based fuzzing tests for SiteCard component
 *
 * @author AI Assistant
 */

import type { Monitor, MonitorStatus, MonitorType, Site } from "@shared/types";
import type { ReactNode } from "react";

import { fc, test as fcTest } from "@fast-check/vitest";
import "@testing-library/jest-dom";
import { secureRandomFloat } from "@shared/test/testHelpers";
import { render, screen } from "@testing-library/react";
import { arrayFirst, arrayJoin  } from "ts-extras";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";

import { SiteCard } from "../../../../components/Dashboard/SiteCard/SiteCard";
import { getMonitorTypeDisplayLabel } from "../../../../utils/fallbacks";

// Mock state for testing
let mockSiteData: null | Site = null;

const normalizeStatusTestIdSegment = (segment: string): string =>
    segment.replaceAll(/[^\da-z]/gi, "_").toLowerCase();

// Mock all SiteCard sub-components with testid patterns
vi.mock(import('../../../../components/Dashboard/SiteCard/SiteCardHeader'), () => ({
    SiteCardHeader: ({ site }: { site: { site: Site } }) => (
        <div data-testid={`site-card-header-${site.site.identifier}`}>
            Header: {site.site.name}{" "}
            <div data-testid={`site-card-footer-${site.site.identifier}`}>
                Click to view details
            </div>
        </div>
    ),
}));

vi.mock(import('../../../../components/Dashboard/SiteCard/SiteCardStatus'), () => ({
    SiteCardStatus: ({
        monitorLabel,
        status,
    }: {
        monitorLabel: string;
        status: MonitorStatus;
    }) => (
        <div
            data-testid={`site-card-status-${normalizeStatusTestIdSegment(monitorLabel)}`}
        >
            Status: {status}
        </div>
    ),
}));

vi.mock(import('../../../../components/Dashboard/SiteCard/SiteCardMetrics'), () => ({
    SiteCardMetrics: ({
        metrics,
    }: {
        metrics: readonly {
            readonly key: string;
            readonly label: string;
            readonly value: number | string;
        }[];
    }) => {
        const siteIdentifier = mockSiteData?.identifier || "default";
        const statusMetric = metrics.find((metric) => metric.key === "status");
        const statusValue = String(
            statusMetric?.value ?? "unknown"
        ).toLowerCase();
        const summary = arrayJoin(metrics
            .map((metric) => `${metric.label}: ${metric.value}`), " | ");

        return (
            <div
                data-site-identifier={siteIdentifier}
                data-status={statusValue}
                data-testid="site-card-metrics-content"
            >
                Metrics: {summary}
            </div>
        );
    },
}));

vi.mock(import('../../../../components/Dashboard/SiteCard/SiteCardHistory'), () => ({
    SiteCardHistory: ({
        filteredHistory,
        monitor,
    }: {
        filteredHistory: any[];
        monitor: Monitor | undefined;
    }) => (
        <div data-testid={`site-card-history-${monitor?.id || "no-monitor"}`}>
            History: {filteredHistory.length} entries
        </div>
    ),
}));

// Mock the useSite hook with comprehensive return data
vi.mock(import('../../../../hooks/site/useSite'), () => ({
    useSite: vi.fn((site: Site) => ({
        checkCount: 100,
        filteredHistory: [],
        handleCardClick: vi.fn(),
        handleCheckNow: vi.fn(),
        handleMonitorIdChange: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStartSiteMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        handleStopSiteMonitoring: vi.fn(),
        isLoading: false,
        isMonitoring: true,
        latestSite: site,
        monitor: arrayFirst(site.monitors),
        responseTime: 150,
        selectedMonitorId: arrayFirst(site.monitors)?.id || "default",
        status: "up",
        uptime: 99.5,
    })),
}));

// Mock ThemedBox
vi.mock(import('../../../../theme/components/ThemedBox'), () => ({
    ThemedBox: ({
        children,
        className,
        onClick,
        "aria-label": ariaLabel,
    }: {
        "aria-label"?: string;
        children: ReactNode;
        className?: string;
        onClick?: () => void;
    }) => {
        // Get unique site identifier from mock data
        const siteIdentifier = mockSiteData?.identifier || "default";
        // Extract site name from aria-label to create unique test ID
        // Handle the case where aria-label is "View details for " (empty name)
        const siteNameMatch = ariaLabel?.match(
            /View details for (?<siteName>.*)/
        );
        const siteName = siteNameMatch?.groups?.["siteName"] ?? "unknown";
        const testId = `themed-box-${siteIdentifier}-${siteName.replaceAll(/[^\da-z]/gi, "_")}`;

        return (
            <div
                aria-label={ariaLabel}
                className={className}
                data-testid={testId}
                onClick={onClick}
            >
                {children}
            </div>
        );
    },
}));

/**
 * Arbitrary for generating CSS-safe identifiers Avoids characters that would
 * break CSS selectors: [](){}#$%'",;:*&^!|~`
 */
const cssSafeIdentifierArbitrary = (
    options: { maxLength?: number; minLength?: number; } = {}
) =>
    fc
        .array(
            fc.constantFrom(
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "-",
                "_",
                "."
            ),
            {
                minLength: options.minLength || 1,
                maxLength: options.maxLength || 50,
            }
        )
        .map((arr) => arrayJoin(arr, ""))
        .map((s) => s.trim().replace(/^[-.]/u, "a"))
        .filter((s) => s.length > 0 && /^[A-Za-z]/v.test(s));

/**
 * Arbitrary for generating valid Monitor objects with history
 */
const validMonitorArbitrary = fc.record({
    id: cssSafeIdentifierArbitrary({ minLength: 5, maxLength: 15 }),
    type: fc.constantFrom(
        "http",
        "ping",
        "port",
        "dns"
    ),
    monitoring: fc.boolean(),
    status: fc.constantFrom(
        "up",
        "down",
        "pending",
        "paused"
    ),
    responseTime: fc.integer({ min: 0, max: 10_000 }),
    checkInterval: fc.integer({ min: 1000, max: 300_000 }),
    timeout: fc.integer({ min: 1000, max: 60_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    history: fc.uniqueArray(
        fc.record({
            timestamp: fc.integer({ min: 0, max: Date.now() }),
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 10_000 }),
            details: fc.option(fc.string(), { nil: undefined }),
        }),
        { selector: (item) => item.timestamp, maxLength: 100 }
    ),
    host: fc.option(fc.string(), { nil: undefined }),
    port: fc.option(fc.integer({ min: 1, max: 65_535 }), { nil: undefined }),
    url: fc.option(fc.webUrl(), { nil: undefined }),
    lastChecked: fc.option(fc.date(), { nil: undefined }),
    expectedValue: fc.option(fc.string(), { nil: undefined }),
    recordType: fc.option(fc.string(), { nil: undefined }),
    activeOperations: fc.option(
        fc.uniqueArray(
            cssSafeIdentifierArbitrary({ minLength: 3, maxLength: 10 }),
            { selector: (str) => str, maxLength: 5 }
        ),
        { nil: undefined }
    ),
});

/**
 * Arbitrary for generating valid Site objects with CSS-safe identifiers
 */
const validSiteArbitrary = fc.record({
    identifier: cssSafeIdentifierArbitrary({ minLength: 5, maxLength: 20 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    url: fc.webUrl(),
    monitoring: fc.boolean(),
    created: fc.integer({ min: 0, max: Date.now() }),
    lastCheck: fc.option(fc.integer({ min: 0, max: Date.now() }), {
        nil: undefined,
    }),
    activeOperations: fc.uniqueArray(
        cssSafeIdentifierArbitrary({ minLength: 3, maxLength: 10 }),
        { selector: (op) => op, maxLength: 10 }
    ),
    monitors: fc.uniqueArray(validMonitorArbitrary, {
        selector: (monitor) => monitor.id,
        minLength: 1,
        maxLength: 5,
    }),
});

/**
 * Edge case site generator for testing boundary conditions
 */
const edgeCaseSiteArbitrary = fc.record({
    identifier: cssSafeIdentifierArbitrary({ minLength: 1, maxLength: 5 }),
    name: fc.oneof(
        fc.constant(""),
        fc.string({ minLength: 1, maxLength: 1 }),
        fc.string({ minLength: 200, maxLength: 500 }),
        fc.constant("测试网站 🚀 Тест サイト"),
        fc.constant("Site with Special!@#$%^&*()Chars")
    ),
    url: fc.oneof(
        fc.webUrl(),
        fc.constant("http://localhost"),
        fc.constant("ftp://example.com")
    ),
    monitoring: fc.boolean(),
    created: fc.oneof(
        fc.constant(0),
        fc.constant(Date.now()),
        fc.integer({ min: -1000, max: Date.now() + 1000 })
    ),
    lastCheck: fc.option(fc.integer({ min: 0, max: Date.now() }), {
        nil: undefined,
    }),
    activeOperations: fc.uniqueArray(
        cssSafeIdentifierArbitrary({ minLength: 1, maxLength: 5 }),
        { selector: (op) => op, maxLength: 3 }
    ),
    monitors: fc.uniqueArray(validMonitorArbitrary, {
        selector: (monitor) => monitor.id,
        minLength: 0,
        maxLength: 2,
    }),
});

/**
 * Helper function to render SiteCard component with mocks in a unique container
 */
const renderSiteCard = (site: any) => {
    mockSiteData = site;
    // Create a unique container for each test to avoid conflicts
    const uniqueId = `sitecard-test-${Date.now()}-${secureRandomFloat().toString(36).slice(2, 11)}`;
    const container = document.createElement("div");
    container.id = uniqueId;
    document.body.append(container);

    const view = render(<SiteCard site={site} />, { container });

    return {
        ...view,
        unmount: () => {
            view.unmount();
            // Clean up the unique container
            container.remove();
        },
    };
};

/**
 * Verify basic SiteCard structure is rendered correctly
 */
const verifySiteCardStructure = (site: any) => {
    // Use consistent testId pattern matching the mocked ThemedBox implementation
    const testId = `themed-box-${site.identifier}-${site.name.replaceAll(/[^\da-z]/gi, "_")}`;
    const themedBox = screen.getByTestId(testId);
    expect(themedBox).toBeInTheDocument();
    expect(themedBox).toHaveAttribute(
        "aria-label",
        `View details for ${site.name}`
    );

    // Verify sub-components are rendered
    expect(
        screen.getByTestId(`site-card-header-${site.identifier}`)
    ).toBeInTheDocument();
    if (site.monitors.length > 0) {
        const expectedMonitorLabel = getMonitorTypeDisplayLabel(
            site.monitors[0]!.type
        );
        expect(
            screen.getByTestId(
                `site-card-status-${normalizeStatusTestIdSegment(expectedMonitorLabel)}`
            )
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`site-card-history-${site.monitors[0]!.id}`)
        ).toBeInTheDocument();
    } else {
        // Handle sites with no monitors
        expect(
            screen.getByTestId("site-card-status-monitor")
        ).toBeInTheDocument();
        expect(
            screen.getByTestId("site-card-history-no-monitor")
        ).toBeInTheDocument();
    }
    expect(
        screen.getByTestId(`site-card-metrics-${site.identifier}-up`)
    ).toBeInTheDocument();
    expect(
        screen.getByTestId(`site-card-footer-${site.identifier}`)
    ).toBeInTheDocument();
};

describe("SiteCard Component - Property-Based Fuzzing Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSiteData = null;
        // Clean up any leftover containers from previous tests
        const containers = document.querySelectorAll('[id^="sitecard-test-"]');
        for (const container of containers) {
            container.remove();
        }
    });

    afterEach(() => {
        mockSiteData = null;
        // Clean up any leftover containers after each test
        const containers = document.querySelectorAll('[id^="sitecard-test-"]');
        for (const container of containers) {
            container.remove();
        }
    });

    describe("Basic Rendering with Arbitrary Data", () => {
        fcTest.prop([validSiteArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })("should render SiteCard with valid site data", (site) => {
            const { unmount } = renderSiteCard(site);

            try {
                verifySiteCardStructure(site);

                // Verify site data is passed correctly using unique selectors
                expect(
                    screen.getByTestId(`site-card-header-${site.identifier}`)
                ).toBeInTheDocument();

                // Normalize whitespace for comparison - HTML normalizes consecutive spaces
                // Split and join to normalize whitespace instead of using regex replace
                const normalizeWhitespace = (text: string) =>
                    text.replaceAll(/\s+/gv, ' ').trim();
                const expectedHeaderText = normalizeWhitespace(
                    `Header: ${site.name} Click to view details`
                );
                const headerElement = screen.getByTestId(
                    `site-card-header-${site.identifier}`
                );
                const actualHeaderText = normalizeWhitespace(
                    headerElement.textContent || ""
                );
                expect(actualHeaderText).toBe(expectedHeaderText);

                // Use more specific selectors to avoid conflicts between multiple cards
                if (site.monitors.length > 0) {
                    const expectedMonitorLabel = getMonitorTypeDisplayLabel(
                        arrayFirst(site.monitors)!.type
                    );
                    expect(
                        screen.getByTestId(
                            `site-card-status-${normalizeStatusTestIdSegment(expectedMonitorLabel)}`
                        )
                    ).toHaveTextContent("Status: up");
                    expect(
                        screen.getByTestId(
                            `site-card-history-${arrayFirst(site.monitors)!.id}`
                        )
                    ).toHaveTextContent("History: 0 entries");
                } else {
                    expect(
                        screen.getByTestId("site-card-status-monitor")
                    ).toHaveTextContent("Status: up");
                    expect(
                        screen.getByTestId("site-card-history-no-monitor")
                    ).toHaveTextContent("History: 0 entries");
                }

                const metricsContainer = screen.getByTestId(
                    `site-card-metrics-${site.identifier}-up`
                );
                expect(metricsContainer).toBeInTheDocument();

                const metricsSummary = screen.getByTestId(
                    `site-card-metrics-summary-${site.identifier}`
                );
                expect(metricsSummary).toHaveTextContent(/Uptime: 99\.5%/v);

                const metricsContent = screen.getByTestId(
                    "site-card-metrics-content"
                );
                expect(metricsContent).toHaveTextContent(/Metrics:/v);
                expect(
                    screen.getByTestId(`site-card-footer-${site.identifier}`)
                ).toHaveTextContent("Click to view details");
            } finally {
                unmount();
            }
        });
    });

    describe("Theme Integration and Styling", () => {
        fcTest.prop([validSiteArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })("should apply correct CSS classes and theme styling", (site) => {
            const { unmount } = renderSiteCard(site);

            try {
                const testId = `themed-box-${site.identifier}-${site.name.replaceAll(/[^\da-z]/gi, "_")}`;
                const themedBox = screen.getByTestId(testId);
                expect(themedBox).toHaveClass(
                    "group",
                    "site-card",
                    "site-card--modern",
                    "flex",
                    "w-full",
                    "cursor-pointer",
                    "flex-col",
                    "text-left"
                );
                expect(themedBox).toHaveClass("gap-4");
                expect(themedBox).toHaveAttribute(
                    "aria-label",
                    `View details for ${site.name}`
                );
            } finally {
                unmount();
            }
        });
    });

    describe("Edge Cases and Boundary Conditions", () => {
        fcTest.prop([edgeCaseSiteArbitrary], {
            numRuns: 30,
            timeout: 5000,
        })("should handle edge case site configurations", (site) => {
            const { unmount } = renderSiteCard(site);

            try {
                // Should render without crashing - use consistent testId pattern
                const testId = `themed-box-${site.identifier}-${site.name.replaceAll(/[^\da-z]/gi, "_")}`;
                const themedBox = screen.getByTestId(testId);
                expect(themedBox).toBeInTheDocument();

                // Should still render header
                expect(
                    screen.getByTestId(`site-card-header-${site.identifier}`)
                ).toBeInTheDocument();
            } finally {
                unmount();
            }
        });
    });

    describe("Performance with Large Datasets", () => {
        fcTest.prop(
            [
                validSiteArbitrary.map((site) => ({
                    ...site,
                    monitors: arrayFirst(fc.sample(
                        fc.uniqueArray(validMonitorArbitrary, {
                            selector: (monitor) => monitor.id,
                            minLength: 3,
                            maxLength: 10,
                        }),
                        1
                    )),
                })),
            ],
            {
                numRuns: 10,
                timeout: 10_000,
            }
        )("should handle sites with many monitors efficiently", (site) => {
            const startTime = performance.now();
            const { unmount } = renderSiteCard(site);
            const endTime = performance.now();

            try {
                // Performance assertion - should render within reasonable time
                expect(endTime - startTime).toBeLessThan(100);

                verifySiteCardStructure(site);
            } finally {
                unmount();
            }
        });
    });

    describe("Component Resilience", () => {
        fcTest.prop([validSiteArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })("should handle sites with no monitors gracefully", (site) => {
            const siteWithNoMonitors = {
                ...site,
                monitors: [],
            };

            const { unmount } = renderSiteCard(siteWithNoMonitors);

            try {
                // Should render basic structure - use consistent testId pattern
                const testId = `themed-box-${siteWithNoMonitors.identifier}-${siteWithNoMonitors.name.replaceAll(/[^\da-z]/gi, "_")}`;
                const themedBox = screen.getByTestId(testId);
                expect(themedBox).toBeInTheDocument();
                expect(
                    screen.getByTestId(
                        `site-card-header-${siteWithNoMonitors.identifier}`
                    )
                ).toBeInTheDocument();
            } finally {
                unmount();
            }
        });

        fcTest.prop([validSiteArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })("should handle extremely long site names", (site) => {
            const siteWithLongName = {
                ...site,
                name: "A".repeat(200),
            };

            const { unmount } = renderSiteCard(siteWithLongName);

            try {
                verifySiteCardStructure(siteWithLongName);
            } finally {
                unmount();
            }
        });
    });

    describe("Accessibility and User Experience", () => {
        fcTest.prop([validSiteArbitrary], {
            numRuns: 20,
            timeout: 3000,
        })(
            "should provide proper ARIA labels and accessibility attributes",
            (site) => {
                const { unmount } = renderSiteCard(site);

                try {
                    // Use consistent testId pattern
                    const testId = `themed-box-${site.identifier}-${site.name.replaceAll(/[^\da-z]/gi, "_")}`;
                    const themedBox = screen.getByTestId(testId);
                    expect(themedBox).toHaveAttribute(
                        "aria-label",
                        `View details for ${site.name}`
                    );
                } finally {
                    unmount();
                }
            }
        );
    });

    describe("Memory Management", () => {
        fcTest.prop([validSiteArbitrary], {
            numRuns: 10,
            timeout: 5000,
        })("should properly cleanup on unmount", (site) => {
            const { unmount } = renderSiteCard(site);

            // Verify structure before unmounting
            verifySiteCardStructure(site);
            const testId = `themed-box-${site.identifier}-${site.name.replaceAll(/[^\da-z]/gi, "_")}`;

            // Unmount and verify cleanup
            unmount();

            // Verify cleanup was successful - the specific testId should not exist
            expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
        });
    });
});

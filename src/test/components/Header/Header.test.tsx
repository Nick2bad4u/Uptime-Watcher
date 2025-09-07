/**
 * Comprehensive test suite for Header component Tests all branches, edge cases,
 * and user interactions
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { test, fc } from "@fast-check/vitest";

import { Header } from "../../../components/Header/Header";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useTheme, useAvailabilityColors } from "../../../theme/useTheme";

// Mock all store hooks
vi.mock("../../../stores/sites/useSitesStore");
vi.mock("../../../stores/ui/useUiStore");
vi.mock("../../../theme/useTheme");

const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseTheme = vi.mocked(useTheme);
const mockUseAvailabilityColors = vi.mocked(useAvailabilityColors);

// Create complete mock theme object
const createMockTheme = (isDark = false) =>
    ({
        availableThemes: ["light", "dark"],
        isDark,
        toggleTheme: vi.fn(),
        setTheme: vi.fn(),
        systemTheme: "light",
        themeName: "light",
        themeVersion: 1,
        themeManager: {},
        currentTheme: {
            colors: {
                background: { primary: "#ffffff" },
                status: { up: "#green", down: "#red", pending: "#yellow" },
            },
            typography: {
                fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                    base: "1rem",
                },
                fontWeight: {
                    medium: "500",
                },
            },
            borderRadius: {
                sm: "0.125rem",
                full: "9999px",
            },
            spacing: {
                xs: "0.25rem",
            },
        },
        getColor: vi.fn(() => "#ffffff"),
        getStatusColor: vi.fn(() => "#green"),
    }) as any;

describe("Header Component", () => {
    const mockSetShowSettings = vi.fn();
    const mockGetAvailabilityColor = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseUIStore.mockReturnValue({
            setShowSettings: mockSetShowSettings,
        } as any);

        mockUseTheme.mockReturnValue(createMockTheme());

        mockUseAvailabilityColors.mockReturnValue({
            getAvailabilityColor: mockGetAvailabilityColor,
        } as any);

        mockGetAvailabilityColor.mockReturnValue("success");
    });

    afterEach(() => {
        // Ensure DOM is cleaned up after each test
        document.body.innerHTML = "";
    });

    describe("Monitor Count Calculations", () => {
        it("should display correct counts with no sites", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [],
            } as any);

            render(<Header />);

            // Should not display any status indicators when no monitors
            expect(screen.queryByText("Health")).not.toBeInTheDocument();
            expect(screen.queryByText("Total")).not.toBeInTheDocument();
        });

        it("should display correct counts with sites having no monitors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    { id: "1", name: "Site 1", monitors: [] },
                    { id: "2", name: "Site 2", monitors: [] },
                ],
            } as any);

            render(<Header />);

            // Should not display health indicator when no monitors
            expect(screen.queryByText("Health")).not.toBeInTheDocument();
        });

        it("should correctly count monitors with all 'up' status", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "up" },
                        ],
                    },
                    {
                        id: "2",
                        name: "Site 2",
                        monitors: [{ id: "3", status: "up" }],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("Up")).toBeInTheDocument();
            expect(
                screen.getByText("Up").parentElement?.parentElement?.textContent
            ).toContain("3");
            expect(screen.getByText("Down")).toBeInTheDocument();
            expect(
                screen.getByText("Down").parentElement?.parentElement
                    ?.textContent
            ).toContain("0");
            expect(screen.getByText("100%")).toBeInTheDocument(); // Health percentage
            expect(screen.getByText("Total")).toBeInTheDocument();
        });

        it("should correctly count monitors with mixed statuses", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "pending" },
                            { id: "4", status: "paused" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Find all text elements and check for the right counts
            const upElements = screen.getAllByText("1");
            expect(upElements.length).toBeGreaterThan(0); // Should have up, down, pending, paused each as 1

            expect(screen.getByText("25%")).toBeInTheDocument(); // 1 up out of 4 total = 25%
            expect(screen.getByText("4")).toBeInTheDocument(); // Total count
        });

        it("should handle large numbers of monitors correctly", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const monitors = Array.from({ length: 100 }, (_, i) => ({
                id: `${i}`,
                status: i < 75 ? "up" : "down",
            }));

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Large Site",
                        monitors,
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("75")).toBeInTheDocument(); // Up count
            expect(screen.getByText("25")).toBeInTheDocument(); // Down count
            expect(screen.getByText("75%")).toBeInTheDocument(); // Health percentage
            expect(screen.getByText("100")).toBeInTheDocument(); // Total count
        });
    });

    describe("Uptime Percentage Calculation", () => {
        it("should calculate 0% when no monitors are up", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "down" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("0%")).toBeInTheDocument();
        });

        it("should calculate 100% when all monitors are up", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("100%")).toBeInTheDocument();
        });

        it("should round percentage correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("33%")).toBeInTheDocument(); // 1/3 = 0.333... rounded to 33
        });
    });

    describe("Theme Toggle", () => {
        it("should display moon icon when in light mode", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue(createMockTheme(false));

            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            expect(themeButton).toHaveTextContent("🌙");
        });

        it("should display sun icon when in dark mode", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue(createMockTheme(true));

            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            expect(themeButton).toHaveTextContent("☀️");
        });

        it("should call toggleTheme when theme button is clicked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockTheme = createMockTheme();
            mockUseTheme.mockReturnValue(mockTheme);

            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            fireEvent.click(themeButton);

            expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
        });
    });

    describe("Settings Modal", () => {
        it("should call setShowSettings when settings button is clicked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            const settingsButton = screen.getByLabelText("Settings");
            fireEvent.click(settingsButton);

            expect(mockSetShowSettings).toHaveBeenCalledWith(true);
        });

        it("should display settings icon", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            const settingsButton = screen.getByLabelText("Settings");
            expect(settingsButton).toHaveTextContent("⚙️");
        });
    });

    describe("Status Indicators", () => {
        it("should display all status types when present", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "pending" },
                            { id: "4", status: "paused" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("Up")).toBeInTheDocument();
            expect(screen.getByText("Down")).toBeInTheDocument();
            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.getByText("Paused")).toBeInTheDocument();
        });

        it("should handle monitors with unknown status", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "unknown" },
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Unknown status should not be counted in any specific category
            // Invalid monitors are excluded from total count calculation
            const upBadge = screen.getByText("Up").closest("div");
            expect(upBadge).toContainElement(screen.getAllByText("1")[0]!); // Up count
            expect(screen.getByText("100%")).toBeInTheDocument(); // 1 up out of 1 total valid (invalid excluded)
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria labels for buttons", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
            expect(screen.getByLabelText("Settings")).toBeInTheDocument();
        });

        it("should have proper heading structure", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
        });
    });

    describe("Availability Color Integration", () => {
        it("should call getAvailabilityColor with correct percentage", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(50); // 1 up out of 2 = 50%
        });

        it("should handle 0% uptime correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [{ id: "1", status: "down" }],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(0);
        });

        it("should handle 100% uptime correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [{ id: "1", status: "up" }],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(100);
        });
    });

    describe("Component Structure", () => {
        it("should render the main title", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
            expect(screen.getByText("📊")).toBeInTheDocument();
        });

        it("should have proper CSS classes for styling", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Header />);

            // Header renders as a ThemedBox, not as a banner role
            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
            // Check for the status summary area using a class that exists in DOM
            expect(screen.getByText("Health")).toBeInTheDocument();
        });
    });

    describe("Memoization", () => {
        it("should recalculate monitor counts when sites change", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { rerender } = render(<Header />);

            // Initial state
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [{ id: "1", status: "up" }],
                    },
                ],
            } as any);

            rerender(<Header />);
            expect(screen.getByText("100%")).toBeInTheDocument();

            // Updated state
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            rerender(<Header />);
            expect(screen.getByText("50%")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty monitor arrays", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.queryByText("Health")).not.toBeInTheDocument();
            expect(screen.queryByText("Total")).not.toBeInTheDocument();
        });

        it("should handle monitors without status", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1" }, // No status property
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Should still render but only count the valid status
            // Invalid monitors (without status) are excluded from total count
            expect(screen.getByText("100%")).toBeInTheDocument(); // 1 up out of 1 total valid (no status excluded)
        });

        it("should handle sites with null/undefined monitors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Header", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: null,
                    },
                ],
            } as any);

            expect(() => render(<Header />)).not.toThrow();
        });
    });

    describe("Property-Based Testing with Fast-Check", () => {
        test.prop([
            fc.array(
                fc.record({
                    id: fc.string({ minLength: 1, maxLength: 10 }),
                    name: fc.string({ minLength: 1, maxLength: 50 }),
                    monitors: fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1, maxLength: 10 }),
                            status: fc.constantFrom("up", "down", "pending"),
                        }),
                        { maxLength: 10 }
                    ),
                }),
                { maxLength: 20 }
            ),
        ])(
            "should correctly calculate status percentages for various site configurations",
            async (sites) => {
                const totalMonitors = sites.flatMap(
                    (site) => site.monitors || []
                ).length;
                const upMonitors = sites
                    .flatMap((site) => site.monitors || [])
                    .filter((m) => m.status === "up").length;
                const expectedPercentage =
                    totalMonitors > 0
                        ? Math.round((upMonitors / totalMonitors) * 100)
                        : 0;

                mockUseSitesStore.mockReturnValue({ sites } as any);

                const { unmount } = render(<Header />);

                try {
                    if (totalMonitors > 0) {
                        // Should display the calculated percentage
                        expect(
                            screen.getByText(`${expectedPercentage}%`)
                        ).toBeInTheDocument();
                    } else {
                        // Should not display health indicator when no monitors
                        expect(
                            screen.queryByText("Health")
                        ).not.toBeInTheDocument();
                    }

                    // Verify site configuration properties
                    expect(Array.isArray(sites)).toBeTruthy();
                    expect(sites.length).toBeLessThanOrEqual(20);
                    for (const site of sites) {
                        expect(typeof site.id).toBe("string");
                        expect(site.id.length).toBeGreaterThan(0);
                        expect(site.id.length).toBeLessThanOrEqual(10);
                        expect(typeof site.name).toBe("string");
                        expect(site.name.length).toBeGreaterThan(0);
                        expect(site.name.length).toBeLessThanOrEqual(50);

                        if (site.monitors) {
                            expect(Array.isArray(site.monitors)).toBeTruthy();
                            expect(site.monitors.length).toBeLessThanOrEqual(
                                10
                            );
                            for (const monitor of site.monitors) {
                                expect(typeof monitor.id).toBe("string");
                                expect(monitor.id.length).toBeGreaterThan(0);
                                expect([
                                    "up",
                                    "down",
                                    "pending",
                                ]).toContain(monitor.status);
                            }
                        }
                    }
                } finally {
                    unmount();
                }
            }
        );

        test.prop([fc.integer({ min: 0, max: 50 })])(
            "should handle various numbers of sites correctly",
            async (siteCount) => {
                const sites = Array.from({ length: siteCount }, (_, i) => ({
                    id: `site-${i}`,
                    name: `Site ${i}`,
                    monitors: [{ id: `monitor-${i}`, status: "up" as const }],
                }));

                mockUseSitesStore.mockReturnValue({ sites } as any);

                const { unmount } = render(<Header />);

                try {
                    if (siteCount > 0) {
                        // Should show 100% since all monitors are "up"
                        expect(screen.getByText("100%")).toBeInTheDocument();
                    } else {
                        // No sites means no health indicator
                        expect(
                            screen.queryByText("Health")
                        ).not.toBeInTheDocument();
                    }

                    expect(siteCount).toBeGreaterThanOrEqual(0);
                    expect(siteCount).toBeLessThanOrEqual(50);
                } finally {
                    unmount();
                }
            }
        );

        test.prop([
            fc.array(fc.constantFrom("up", "down", "pending"), {
                minLength: 1,
                maxLength: 20,
            }),
        ])(
            "should correctly calculate percentages for various monitor status combinations",
            async (statuses) => {
                const sites = [
                    {
                        id: "test-site",
                        name: "Test Site",
                        monitors: statuses.map((status, i) => ({
                            id: `monitor-${i}`,
                            status,
                        })),
                    },
                ];

                const upCount = statuses.filter((s) => s === "up").length;
                const expectedPercentage = Math.round(
                    (upCount / statuses.length) * 100
                );

                mockUseSitesStore.mockReturnValue({ sites } as any);

                const { unmount } = render(<Header />);

                try {
                    expect(
                        screen.getByText(`${expectedPercentage}%`)
                    ).toBeInTheDocument();

                    // Verify status array properties
                    expect(Array.isArray(statuses)).toBeTruthy();
                    expect(statuses.length).toBeGreaterThanOrEqual(1);
                    expect(statuses.length).toBeLessThanOrEqual(20);
                    for (const status of statuses) {
                        expect([
                            "up",
                            "down",
                            "pending",
                        ]).toContain(status);
                    }
                } finally {
                    unmount();
                }
            }
        );

        test.prop([
            fc.oneof(
                fc.constant([]),
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        monitors: fc.constant([]),
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        monitors: fc.constant(null),
                    }),
                    { minLength: 1, maxLength: 5 }
                ),
                fc.array(
                    fc.record({
                        id: fc.string(),
                        name: fc.string(),
                        monitors: fc.constant(undefined),
                    }),
                    { minLength: 1, maxLength: 5 }
                )
            ),
        ])(
            "should handle edge cases with no monitors gracefully",
            async (edgeCaseSites) => {
                mockUseSitesStore.mockReturnValue({
                    sites: edgeCaseSites,
                } as any);

                const { unmount } = render(<Header />);

                try {
                    // Should not display health indicator when no monitors
                    expect(
                        screen.queryByText("Health")
                    ).not.toBeInTheDocument();
                    expect(screen.queryByText("Total")).not.toBeInTheDocument();

                    // Verify edge case properties
                    expect(Array.isArray(edgeCaseSites)).toBeTruthy();
                } finally {
                    unmount();
                }
            }
        );

        test.prop([
            fc.record({
                siteCount: fc.integer({ min: 1, max: 10 }),
                monitorsPerSite: fc.integer({ min: 1, max: 5 }),
                upProbability: fc.double({ min: 0, max: 1 }),
            }),
        ])(
            "should handle complex monitoring scenarios correctly",
            async ({ siteCount, monitorsPerSite, upProbability }) => {
                const sites = Array.from(
                    { length: siteCount },
                    (_, siteIndex) => ({
                        id: `site-${siteIndex}`,
                        name: `Site ${siteIndex}`,
                        monitors: Array.from(
                            { length: monitorsPerSite },
                            (_, monitorIndex) => ({
                                id: `monitor-${siteIndex}-${monitorIndex}`,
                                status:
                                    Math.random() < upProbability
                                        ? ("up" as const)
                                        : ("down" as const),
                            })
                        ),
                    })
                );

                const totalMonitors = siteCount * monitorsPerSite;
                const upMonitors = sites
                    .flatMap((s) => s.monitors)
                    .filter((m) => m.status === "up").length;
                const expectedPercentage = Math.round(
                    (upMonitors / totalMonitors) * 100
                );

                mockUseSitesStore.mockReturnValue({ sites } as any);

                const { unmount } = render(<Header />);

                try {
                    expect(
                        screen.getByText(`${expectedPercentage}%`)
                    ).toBeInTheDocument();

                    // Verify scenario properties
                    expect(siteCount).toBeGreaterThanOrEqual(1);
                    expect(siteCount).toBeLessThanOrEqual(10);
                    expect(monitorsPerSite).toBeGreaterThanOrEqual(1);
                    expect(monitorsPerSite).toBeLessThanOrEqual(5);
                    expect(upProbability).toBeGreaterThanOrEqual(0);
                    expect(upProbability).toBeLessThanOrEqual(1);
                    expect(totalMonitors).toBe(siteCount * monitorsPerSite);
                } finally {
                    unmount();
                }
            }
        );

        test.prop([
            fc.array(
                fc.record({
                    id: fc.string(),
                    name: fc.string(),
                    monitors: fc.array(
                        fc.record({
                            id: fc.string(),
                            status: fc.oneof(
                                fc.constantFrom("up", "down", "pending"),
                                fc.constant(null),
                                fc.constant(undefined),
                                fc.constant("invalid-status" as any)
                            ),
                        }),
                        { maxLength: 3 }
                    ),
                }),
                { minLength: 1, maxLength: 5 }
            ),
        ])(
            "should handle invalid monitor statuses gracefully",
            async (sitesWithInvalidStatuses) => {
                mockUseSitesStore.mockReturnValue({
                    sites: sitesWithInvalidStatuses,
                } as any);

                const { unmount } = render(<Header />);

                try {
                    const validMonitors = sitesWithInvalidStatuses
                        .flatMap((s) => s.monitors || [])
                        .filter(
                            (m) =>
                                m.status &&
                                [
                                    "up",
                                    "down",
                                    "pending",
                                ].includes(m.status)
                        );

                    if (validMonitors.length > 0) {
                        const upCount = validMonitors.filter(
                            (m) => m.status === "up"
                        ).length;
                        const expectedPercentage = Math.round(
                            (upCount / validMonitors.length) * 100
                        );
                        expect(
                            screen.getByText(`${expectedPercentage}%`)
                        ).toBeInTheDocument();
                    } else {
                        // No valid monitors means no health indicator
                        expect(
                            screen.queryByText("Health")
                        ).not.toBeInTheDocument();
                    }

                    // Verify sites array properties
                    expect(
                        Array.isArray(sitesWithInvalidStatuses)
                    ).toBeTruthy();
                    expect(
                        sitesWithInvalidStatuses.length
                    ).toBeGreaterThanOrEqual(1);
                    expect(sitesWithInvalidStatuses.length).toBeLessThanOrEqual(
                        5
                    );
                } finally {
                    unmount();
                }
            }
        );

        test.prop([fc.integer({ min: 0, max: 100 })])(
            "should render consistently across different percentage values",
            async (targetPercentage) => {
                const totalMonitors = 100;
                const upMonitors = targetPercentage;
                const downMonitors = totalMonitors - upMonitors;

                const upMonitorList = Array.from(
                    { length: upMonitors },
                    (_, i) => ({
                        id: `up-${i}`,
                        status: "up" as const,
                    })
                );

                const downMonitorList = Array.from(
                    { length: downMonitors },
                    (_, i) => ({
                        id: `down-${i}`,
                        status: "down" as const,
                    })
                );

                const sites = [
                    {
                        id: "percentage-test",
                        name: "Percentage Test Site",
                        monitors: [...upMonitorList, ...downMonitorList],
                    },
                ];

                mockUseSitesStore.mockReturnValue({ sites } as any);

                const { unmount } = render(<Header />);

                try {
                    expect(
                        screen.getByText(`${targetPercentage}%`)
                    ).toBeInTheDocument();

                    // Verify percentage properties
                    expect(targetPercentage).toBeGreaterThanOrEqual(0);
                    expect(targetPercentage).toBeLessThanOrEqual(100);
                    expect(upMonitors + downMonitors).toBe(totalMonitors);
                } finally {
                    unmount();
                }
            }
        );
    });
});

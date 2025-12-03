/**
 * @file Comprehensive tests for SiteList component Testing all code paths,
 *   hooks usage, and theme integration
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteList } from "../../../../components/Dashboard/SiteList/SiteList";
import type { Site } from "@shared/types";
import type { ThemeName } from "../../../../theme/types";
import { createMockSite } from "../../../utils/mockFactories";
import { createSelectorHookMock } from "../../../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../../utils/createSitesStoreMock";

// Mock the stores and theme
// Standard creation bridged through global to avoid hoist-time import errors
const sitesStoreState = createSitesStoreMock({
    sites: [],
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

(globalThis as any).__useSitesStoreMock_siteList__ = useSitesStoreMock;

vi.mock("../../../../stores/sites/useSitesStore", () => ({
    useSitesStore: (selector?: any, equality?: any) =>
        (globalThis as any).__useSitesStoreMock_siteList__?.(
            selector,
            equality
        ),
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(),
}));

// Mock the components
vi.mock("../../../../components/Dashboard/SiteCard/SiteCard", () => ({
    SiteCard: vi.fn(({ site }) => (
        <div data-testid={`site-card-${site.identifier}`}>
            Site Card for {site.identifier}
        </div>
    )),
}));

vi.mock("../../../../components/Dashboard/SiteList/EmptyState", () => ({
    EmptyState: vi.fn(() => (
        <div data-testid="empty-state">No sites configured</div>
    )),
}));

const mockUseSitesStore = useSitesStoreMock;
const mockUseTheme = vi.mocked(
    await import("../../../../theme/useTheme")
).useTheme;

const resetSitesStoreState = (): void => {
    updateSitesStoreMock(sitesStoreState, { sites: [] });
};

const setSitesSnapshot = (sites: Site[] | undefined): void => {
    updateSitesStoreMock(sitesStoreState, {
        sites: (sites ?? []) as Site[],
    });
    if (sites === undefined) {
        (sitesStoreState as Record<string, unknown>)["sites"] =
            undefined as unknown as Site[];
    }
};

// Helper to create mock theme return
const createMockTheme = (isDark = false) => ({
    isDark,
    availableThemes: ["light", "dark"] as ThemeName[],
    currentTheme: { colors: {}, spacing: {} } as any,
    getColor: vi.fn(),
    getStatusColor: vi.fn(),
    setTheme: vi.fn(),
    systemTheme: "light" as const,
    themeManager: {} as any,
    themeName: (isDark ? "dark" : "light") as ThemeName,
    themeVersion: 1,
    toggleTheme: vi.fn(),
});

describe(SiteList, () => {
    const mockSites: Site[] = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-1",
                    url: "https://example1.com",
                    type: "http" as any,
                    status: "up" as any,
                    monitoring: true,
                    checkInterval: 60_000,
                    timeout: 30_000,
                    retryAttempts: 3,
                    responseTime: 200,
                    history: [],
                },
            ],
        },
        {
            identifier: "site-2",
            name: "Test Site 2",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-2",
                    url: "https://example2.com",
                    type: "http" as any,
                    status: "down" as any,
                    monitoring: true,
                    checkInterval: 60_000,
                    timeout: 30_000,
                    retryAttempts: 3,
                    responseTime: 0,
                    history: [],
                },
            ],
        },
        {
            identifier: "site-3",
            name: "Test Site 3",
            monitoring: false,
            monitors: [
                {
                    id: "monitor-3",
                    url: "https://example3.com",
                    type: "http" as any,
                    status: "unknown" as any,
                    monitoring: false,
                    checkInterval: 60_000,
                    timeout: 30_000,
                    retryAttempts: 3,
                    responseTime: 0,
                    history: [],
                },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useSitesStoreMock.mockClear();
        resetSitesStoreState();
    });

    describe("Empty State Rendering", () => {
        it("should render EmptyState when no sites are available", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("empty-state")).toBeInTheDocument();
            expect(screen.queryByTestId(/site-card-/)).not.toBeInTheDocument();
        });

        it("should render EmptyState when sites array is empty - dark theme", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(true));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("empty-state")).toBeInTheDocument();
            expect(screen.queryByTestId(/site-card-/)).not.toBeInTheDocument();
        });
    });

    describe("Site List Rendering", () => {
        it("should render SiteCard components for each site", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-2")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-3")).toBeInTheDocument();
            expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
        });

        it("should render with correct container className in light theme", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            const { container } = render(<SiteList />);

            // Assert
            const containerDiv = container.firstChild as HTMLElement;
            expect(containerDiv).toHaveClass("site-list");
            expect(containerDiv).not.toHaveClass("dark");
            const firstCard = screen.getByTestId("site-card-site-1");
            expect(firstCard.parentElement).not.toHaveClass("site-grid--dark");
        });

        it("should render with correct container className in dark theme", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(true));

            // Act
            const { container } = render(<SiteList />);

            // Assert
            const containerDiv = container.firstChild as HTMLElement;
            expect(containerDiv).toHaveClass("site-list");
            const firstCard = screen.getByTestId("site-card-site-1");
            expect(firstCard.parentElement).toHaveClass("site-grid");
            expect(firstCard.parentElement).toHaveClass("site-grid--dark");
        });

        it("should render single site correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const singleSite: Site[] = [mockSites[0]!];
            setSitesSnapshot(singleSite);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
            expect(
                screen.queryByTestId("site-card-site-2")
            ).not.toBeInTheDocument();
            expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
        });
    });

    describe("Hook Integration", () => {
        it("should call useSitesStore hook", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(mockUseSitesStore).toHaveBeenCalledTimes(1);
        });

        it("should call useTheme hook", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(mockUseTheme).toHaveBeenCalledTimes(1);
        });

        it("should properly destructure sites from useSitesStore", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const mockStore = {
                sites: Array.from(mockSites),
                otherProperty: "test",
            };
            setSitesSnapshot(mockStore.sites);
            (sitesStoreState as Record<string, unknown>)["otherProperty"] =
                mockStore.otherProperty;
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        });

        it("should properly destructure isDark from useTheme", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const mockTheme = {
                ...createMockTheme(true),
                otherProperty: "test",
            };
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(mockTheme);

            // Act
            render(<SiteList />);

            // Assert
            const firstCard = screen.getByTestId("site-card-site-1");
            expect(firstCard.parentElement).toHaveClass("site-grid--dark");
        });
    });

    describe("Key Prop Handling", () => {
        it("should use site.identifier as key for each SiteCard", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert - Each site card should be rendered with its identifier
            for (const site of mockSites) {
                expect(
                    screen.getByTestId(`site-card-${site.identifier}`)
                ).toBeInTheDocument();
            }
        });

        it("should handle sites with special characters in identifiers", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const specialSites: Site[] = [
                createMockSite({
                    identifier: "site-with-special-chars_123",
                    name: mockSites[0]!.name,
                    monitoring: mockSites[0]!.monitoring,
                }),
                createMockSite({
                    identifier: "site.with.dots",
                    name: mockSites[1]!.name,
                    monitoring: mockSites[1]!.monitoring,
                }),
            ];
            setSitesSnapshot(specialSites);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(
                screen.getByTestId("site-card-site-with-special-chars_123")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-card-site.with.dots")
            ).toBeInTheDocument();
        });
    });

    describe("Conditional Logic Coverage", () => {
        it("should handle isDark: false condition", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            const { container } = render(<SiteList />);

            // Assert
            const containerDiv = container.firstChild as HTMLElement;
            expect(containerDiv.className).toBe("site-list");
            const firstCard = screen.getByTestId("site-card-site-1");
            expect(firstCard.parentElement).not.toHaveClass("site-grid--dark");
        });

        it("should handle isDark: true condition", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(true));

            // Act
            const { container } = render(<SiteList />);

            // Assert
            const containerDiv = container.firstChild as HTMLElement;
            expect(containerDiv.className).toBe("site-list");
            const firstCard = screen.getByTestId("site-card-site-1");
            expect(firstCard.parentElement).toHaveClass("site-grid--dark");
        });

        it("should handle sites.length === 0 condition", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        });

        it("should handle sites.length > 0 condition", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined sites gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(undefined);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act & Assert
            expect(() => render(<SiteList />)).toThrowError();
        });

        it("should handle malformed site objects", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const malformedSites = [
                { identifier: "site-1" }, // Missing required properties
            ] as Site[];
            setSitesSnapshot(malformedSites);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        });

        it("should handle very large number of sites", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const manySites = Array.from({ length: 100 }, (_, i) => ({
                ...mockSites[0],
                identifier: `site-${i}`,
                name: `Site ${i}`,
            })) as Site[];
            setSitesSnapshot(manySites);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("site-card-site-0")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-99")).toBeInTheDocument();
        });
    });

    describe("Component Integration", () => {
        it("should call SiteCard component for each site", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            setSitesSnapshot(Array.from(mockSites));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            // Verify each site gets rendered
            expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-2")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-site-3")).toBeInTheDocument();
        });

        it("should call EmptyState component when no sites", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteList", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Arrange
            const { EmptyState: mockEmptyState } = await import(
                "../../../../components/Dashboard/SiteList/EmptyState"
            );
            const mockEmptyStateMocked = vi.mocked(mockEmptyState);
            setSitesSnapshot([] as Site[]);
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(mockEmptyStateMocked).toHaveBeenCalledTimes(1);
        });
    });
});

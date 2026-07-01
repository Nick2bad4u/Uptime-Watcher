/**
 * @file Comprehensive tests for SiteList component Testing all code paths,
 *   hooks usage, and theme integration
 */

import type { Site } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import { render, screen } from "@testing-library/react";
import { arrayFirst, safeCastTo  } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeName } from "../../../../theme/types";

import { SiteList } from "../../../../components/Dashboard/SiteList/SiteList";
import { createSelectorHookMock } from "../../../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../../utils/createSitesStoreMock";
import { createMockSite } from "../../../utils/mockFactories";

// Mock the stores and theme
// Standard creation bridged through global to avoid hoist-time import errors
const sitesStoreState = createSitesStoreMock({
    sites: [],
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

(globalThis as any).__useSitesStoreMock_siteList__ = useSitesStoreMock;

vi.mock(import('../../../../stores/sites/useSitesStore'), () => ({
    useSitesStore: (selector?: any, equality?: any) =>
        (globalThis as any).__useSitesStoreMock_siteList__?.(
            selector,
            equality
        ),
}));

vi.mock(import('../../../../theme/useTheme'), () => ({
    useTheme: vi.fn(),
}));

// Mock the components
vi.mock(import('../../../../components/Dashboard/SiteCard/SiteCard'), () => ({
    SiteCard: vi.fn(({ site }) => (
        <div data-testid={`site-card-${site.identifier}`}>
            Site Card for {site.identifier}
        </div>
    )),
}));

vi.mock(import('../../../../components/Dashboard/SiteList/EmptyState'), () => ({
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
        sites: (sites ?? []),
    });
    if (sites === undefined) {
        (safeCastTo<UnknownRecord>(sitesStoreState))["sites"] =
            undefined;
    }
};

// Helper to create mock theme return
const createMockTheme = (isDark = false) => ({
    isDark,
    availableThemes: safeCastTo<ThemeName[]>(["dark", "light"]),
    currentTheme: { colors: {}, spacing: {} } as any,
    getColor: vi.fn(),
    getStatusColor: vi.fn(),
    setTheme: vi.fn(),
    systemTheme: "light" as const,
    themeManager: {} as any,
    themeName: safeCastTo<ThemeName>(isDark ? "dark" : "light"),
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
                    type: "http",
                    status: "up",
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
                    type: "http",
                    status: "down",
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
                    type: "http",
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
            setSitesSnapshot(safeCastTo<Site[]>([]));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("empty-state")).toBeInTheDocument();
            expect(screen.queryByTestId(/site-card-/v)).not.toBeInTheDocument();
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
            setSitesSnapshot(safeCastTo<Site[]>([]));
            mockUseTheme.mockReturnValue(createMockTheme(true));

            // Act
            render(<SiteList />);

            // Assert
            expect(screen.getByTestId("empty-state")).toBeInTheDocument();
            expect(screen.queryByTestId(/site-card-/v)).not.toBeInTheDocument();
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
            setSitesSnapshot([...mockSites]);
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
            setSitesSnapshot([...mockSites]);
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
            setSitesSnapshot([...mockSites]);
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
            const singleSite: Site[] = [arrayFirst(mockSites)!];
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
            setSitesSnapshot(safeCastTo<Site[]>([]));
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
            setSitesSnapshot(safeCastTo<Site[]>([]));
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
                sites: [...mockSites],
                otherProperty: "test",
            };
            setSitesSnapshot(mockStore.sites);
            (safeCastTo<UnknownRecord>(sitesStoreState))["otherProperty"] =
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
            setSitesSnapshot([...mockSites]);
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
            setSitesSnapshot([...mockSites]);
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
                    name: arrayFirst(mockSites)!.name,
                    monitoring: arrayFirst(mockSites)!.monitoring,
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
            setSitesSnapshot([...mockSites]);
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
            setSitesSnapshot([...mockSites]);
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
            setSitesSnapshot(safeCastTo<Site[]>([]));
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
            setSitesSnapshot([...mockSites]);
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
            expect(() => render(<SiteList />)).toThrow();
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
                ...arrayFirst(mockSites),
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
            setSitesSnapshot([...mockSites]);
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
            const { EmptyState: mockEmptyState } =
                await import("../../../../components/Dashboard/SiteList/EmptyState");
            const mockEmptyStateMocked = vi.mocked(mockEmptyState);
            setSitesSnapshot(safeCastTo<Site[]>([]));
            mockUseTheme.mockReturnValue(createMockTheme(false));

            // Act
            render(<SiteList />);

            // Assert
            expect(mockEmptyStateMocked).toHaveBeenCalledTimes(1);
        });
    });
});

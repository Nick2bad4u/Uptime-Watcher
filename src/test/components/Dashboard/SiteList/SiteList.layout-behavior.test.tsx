/**
 * Behavioral coverage for layout and presentation branches in `SiteList`.
 */

import type { Site } from "@shared/types";
import type { ReactNode } from "react";
import type { UnknownRecord } from "type-fest";

import { render, screen } from "@testing-library/react";
import { arrayFirst } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    InterfaceDensity,
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../../../stores/ui/types";

import { SiteList } from "../../../../components/Dashboard/SiteList/SiteList";
import { createSelectorHookMock } from "../../../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../../utils/createSitesStoreMock";

interface UiStoreState {
    setSiteCardPresentation: ReturnType<typeof vi.fn>;
    setSiteListLayout: ReturnType<typeof vi.fn>;
    setSurfaceDensity: ReturnType<typeof vi.fn>;
    siteCardPresentation: SiteCardPresentation;
    siteListLayout: SiteListLayoutMode;
    surfaceDensity: InterfaceDensity;
}

interface Invocation<TProps extends UnknownRecord> {
    readonly props: TProps;
}

const {
    themeState,
    uiStoreState,
    tableViewInvocations,
    compactCardInvocations,
    cardInvocations,
    selectorInvocations,
    iconInvocations,
} = vi.hoisted(() => ({
    themeState: { isDark: false },
    uiStoreState: {
        siteListLayout: "card-large",
        setSiteListLayout: vi.fn(),
        siteCardPresentation: "grid",
        setSiteCardPresentation: vi.fn(),
        surfaceDensity: "comfortable",
        setSurfaceDensity: vi.fn(),
    } as UiStoreState,
    tableViewInvocations: [] as Invocation<{
        density: InterfaceDensity;
        sites: Site[];
    }>[],
    compactCardInvocations: [] as Invocation<{ site: Site }>[],
    cardInvocations: [] as Invocation<{
        presentation: SiteCardPresentation;
        site: Site;
    }>[],
    selectorInvocations: [] as Invocation<{
        cardPresentation: SiteCardPresentation;
        layout: SiteListLayoutMode;
        listDensity: InterfaceDensity;
        onLayoutChange: (mode: SiteListLayoutMode) => void;
        onListDensityChange: (density: InterfaceDensity) => void;
        onPresentationChange: (presentation: SiteCardPresentation) => void;
    }>[],
    iconInvocations: [] as Invocation<UnknownRecord>[],
}));

// Create sites store state outside hoisted block to avoid import timing issues
const sitesStoreState = createSitesStoreMock({ sites: [] });

const useUIStoreMock = vi.hoisted(() => {
    const mockedHook = ((selector: (state: UiStoreState) => unknown) =>
        selector(
            uiStoreState
        )) as unknown as typeof import("../../../../stores/ui/useUiStore").useUIStore;

    Object.assign(mockedHook, {
        getState: () => uiStoreState,
    });

    return mockedHook;
});

vi.mock("../../../../stores/ui/useUiStore", () => ({
    useUIStore: useUIStoreMock,
}));

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

(globalThis as any).__useSitesStoreMock_siteListLayout__ = useSitesStoreMock;

vi.mock("../../../../stores/sites/useSitesStore", () => ({
    useSitesStore: (selector?: any, equality?: any) =>
        (globalThis as any).__useSitesStoreMock_siteListLayout__?.(
            selector,
            equality
        ),
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: () => themeState,
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { readonly children: ReactNode }) => (
        <span>{children}</span>
    ),
}));

vi.mock("../../../../utils/icons", () => ({
    AppIcons: {
        metrics: {
            monitor: (props: UnknownRecord) => {
                iconInvocations.push({ props });
                return <svg data-testid="sites-icon" {...props} />;
            },
        },
    },
}));

vi.mock("../../../../components/Dashboard/SiteList/EmptyState", () => ({
    EmptyState: () => <div data-testid="site-list-empty-state" />,
}));

vi.mock(
    "../../../../components/Dashboard/SiteList/SiteListLayoutSelector",
    () => ({
        SiteListLayoutSelector: (props: {
            readonly cardPresentation: SiteCardPresentation;
            readonly layout: SiteListLayoutMode;
            readonly listDensity: InterfaceDensity;
            readonly onLayoutChange: (mode: SiteListLayoutMode) => void;
            readonly onListDensityChange: (density: InterfaceDensity) => void;
            readonly onPresentationChange: (
                presentation: SiteCardPresentation
            ) => void;
        }) => {
            selectorInvocations.push({ props });
            return <div data-testid="layout-selector">selector</div>;
        },
    })
);

vi.mock("../../../../components/Dashboard/SiteList/SiteTableView", () => ({
    SiteTableView: ({
        density,
        sites,
    }: {
        readonly density: InterfaceDensity;
        readonly sites: Site[];
    }) => {
        tableViewInvocations.push({ props: { density, sites } });
        return <div data-testid="site-table-view" />;
    },
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCompactCard", () => ({
    SiteCompactCard: ({ site }: { readonly site: Site }) => {
        compactCardInvocations.push({ props: { site } });
        return <div data-testid={`compact-card-${site.identifier}`} />;
    },
}));

vi.mock("../../../../components/Dashboard/SiteCard/SiteCard", () => ({
    SiteCard: ({
        site,
        presentation,
    }: {
        readonly presentation: SiteCardPresentation;
        readonly site: Site;
    }) => {
        cardInvocations.push({ props: { site, presentation } });
        return <div data-testid={`large-card-${site.identifier}`} />;
    },
}));

const createSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [
        {
            history: [],
            id: `${identifier}-monitor`,
            monitoring: true,
            responseTime: 180,
            retryAttempts: 3,
            status: "up",
            timeout: 30_000,
            type: "http",
            url: `https://example.com/${identifier}`,
            checkInterval: 60_000,
        },
    ],
    name: `${identifier} name`,
});

beforeEach(() => {
    themeState.isDark = false;
    uiStoreState.siteListLayout = "card-large";
    uiStoreState.siteCardPresentation = "grid";
    uiStoreState.setSiteListLayout.mockReset();
    uiStoreState.setSiteCardPresentation.mockReset();
    uiStoreState.setSurfaceDensity.mockReset();
    updateSitesStoreMock(sitesStoreState, { sites: [] });
    useSitesStoreMock.mockClear();
    tableViewInvocations.length = 0;
    compactCardInvocations.length = 0;
    cardInvocations.length = 0;
    selectorInvocations.length = 0;
    iconInvocations.length = 0;
});

describe("SiteList layout behavior", () => {
    it("returns the empty state when no sites are present", () => {
        render(<SiteList />);
        expect(screen.getByTestId("site-list-empty-state")).toBeInTheDocument();
        expect(selectorInvocations).toHaveLength(0);
    });

    it("renders the table view and wires layout callbacks", () => {
        const sampleSites = [createSite("alpha"), createSite("beta")];
        updateSitesStoreMock(sitesStoreState, { sites: sampleSites });
        uiStoreState.siteListLayout = "list";

        render(<SiteList />);

        expect(screen.getByTestId("site-table-view")).toBeInTheDocument();
        expect(arrayFirst(tableViewInvocations)?.props.sites).toEqual(
            sampleSites
        );
        expect(arrayFirst(tableViewInvocations)?.props.density).toBe(
            uiStoreState.surfaceDensity
        );
        expect(arrayFirst(selectorInvocations)?.props.layout).toBe("list");
        expect(arrayFirst(selectorInvocations)?.props.listDensity).toBe(
            uiStoreState.surfaceDensity
        );

        arrayFirst(selectorInvocations)?.props.onLayoutChange("card-compact");
        expect(uiStoreState.setSiteListLayout).toHaveBeenCalledWith(
            "card-compact"
        );

        arrayFirst(selectorInvocations)?.props.onListDensityChange("compact");
        expect(uiStoreState.setSurfaceDensity).toHaveBeenCalledWith("compact");
    });

    it("renders stacked and grid presentations with dark mode styling", () => {
        const sampleSites = [createSite("gamma"), createSite("delta")];
        updateSitesStoreMock(sitesStoreState, { sites: sampleSites });
        uiStoreState.siteListLayout = "card-large";
        uiStoreState.siteCardPresentation = "stacked";
        themeState.isDark = true;

        const view = render(<SiteList />);

        const grid = screen
            .getByTestId("site-list")
            .querySelector(".site-grid");
        expect(grid).not.toBeNull();
        expect(grid).toHaveClass(
            "site-grid",
            "site-grid--stacked",
            "site-grid--dark"
        );
        expect(cardInvocations).toHaveLength(sampleSites.length);
        expect(compactCardInvocations).toHaveLength(0);
        expect(iconInvocations).toHaveLength(1);

        arrayFirst(selectorInvocations)?.props.onPresentationChange("grid");
        expect(uiStoreState.setSiteCardPresentation).toHaveBeenCalledWith(
            "grid"
        );

        uiStoreState.siteCardPresentation = "grid";
        view.rerender(<SiteList />);
        const updatedGrid = screen
            .getByTestId("site-list")
            .querySelector(".site-grid");
        expect(updatedGrid).not.toBeNull();
        expect(updatedGrid).toHaveClass("site-grid--balanced");
    });

    it("renders compact cards when compact layout is chosen", () => {
        const sampleSites = [createSite("epsilon")];
        updateSitesStoreMock(sitesStoreState, { sites: sampleSites });
        uiStoreState.siteListLayout = "card-compact";

        render(<SiteList />);

        expect(compactCardInvocations).toHaveLength(1);
        expect(arrayFirst(compactCardInvocations)?.props.site).toEqual(
            arrayFirst(sampleSites)
        );
        expect(cardInvocations).toHaveLength(0);
    });
});

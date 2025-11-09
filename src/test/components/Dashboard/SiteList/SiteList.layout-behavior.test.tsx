/**
 * Behavioral coverage for layout and presentation branches in `SiteList`.
 */

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { SiteList } from "../../../../components/Dashboard/SiteList/SiteList";
import type { Site } from "@shared/types";
import type {
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../../../stores/ui/types";
import { createSelectorHookMock } from "../../../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../../utils/createSitesStoreMock";

interface UiStoreState {
    siteListLayout: SiteListLayoutMode;
    setSiteListLayout: ReturnType<typeof vi.fn>;
    siteCardPresentation: SiteCardPresentation;
    setSiteCardPresentation: ReturnType<typeof vi.fn>;
}

interface Invocation<TProps extends Record<string, unknown>> {
    readonly props: TProps;
}

const {
    themeState,
    uiStoreState,
    sitesStoreState,
    tableViewInvocations,
    compactCardInvocations,
    cardInvocations,
    selectorInvocations,
    iconInvocations,
} = vi.hoisted(() => ({
    themeState: { isDark: false },
    uiStoreState: {
        siteListLayout: "card-large" as SiteListLayoutMode,
        setSiteListLayout: vi.fn(),
        siteCardPresentation: "grid" as SiteCardPresentation,
        setSiteCardPresentation: vi.fn(),
    } as UiStoreState,
    sitesStoreState: createSitesStoreMock({ sites: [] }),
    tableViewInvocations: [] as Invocation<{ sites: Site[] }>[],
    compactCardInvocations: [] as Invocation<{ site: Site }>[],
    cardInvocations: [] as Invocation<{
        site: Site;
        presentation: SiteCardPresentation;
    }>[],
    selectorInvocations: [] as Invocation<{
        cardPresentation: SiteCardPresentation;
        layout: SiteListLayoutMode;
        onLayoutChange: (mode: SiteListLayoutMode) => void;
        onPresentationChange: (presentation: SiteCardPresentation) => void;
    }>[],
    iconInvocations: [] as Invocation<Record<string, unknown>>[],
}));

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

vi.mock("../../../../stores/sites/useSitesStore", () => ({
    useSitesStore: useSitesStoreMock,
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
            monitor: (props: Record<string, unknown>) => {
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
            readonly onLayoutChange: (mode: SiteListLayoutMode) => void;
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
    SiteTableView: ({ sites }: { readonly sites: Site[] }) => {
        tableViewInvocations.push({ props: { sites } });
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
        readonly site: Site;
        readonly presentation: SiteCardPresentation;
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
        expect(tableViewInvocations[0]?.props.sites).toEqual(sampleSites);
        expect(selectorInvocations[0]?.props.layout).toBe("list");

        selectorInvocations[0]?.props.onLayoutChange("card-compact");
        expect(uiStoreState.setSiteListLayout).toHaveBeenCalledWith(
            "card-compact"
        );
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

        selectorInvocations[0]?.props.onPresentationChange("grid");
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
        expect(compactCardInvocations[0]?.props.site).toEqual(sampleSites[0]);
        expect(cardInvocations).toHaveLength(0);
    });
});

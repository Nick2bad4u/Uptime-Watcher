/**
 * Tests for App component - Basic rendering tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock all the stores and services first
vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
    })),
}));

vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: [],
        initializeSites: vi.fn().mockResolvedValue(undefined),
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
    })),
}));

vi.mock("../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(() => ({
        initializeSettings: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(() => ({
        setShowSettings: vi.fn(),
        setShowSiteDetails: vi.fn(),
        showSettings: false,
        showSiteDetails: false,
    })),
}));

vi.mock("../stores/updates/useUpdatesStore", () => ({
    useUpdatesStore: vi.fn(() => ({
        applyUpdate: vi.fn(),
        setUpdateError: vi.fn(),
        setUpdateStatus: vi.fn(),
        updateError: null,
        updateStatus: null,
    })),
}));

vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        isDark: false,
    })),
}));

vi.mock("../hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("../hooks/useSelectedSite", () => ({
    useSelectedSite: vi.fn(() => null),
}));

vi.mock("../services/logger", () => ({
    default: {
        app: {
            started: vi.fn(),
        },
        debug: vi.fn(),
    },
}));

vi.mock("../utils/cacheSync", () => ({
    setupCacheSync: vi.fn(() => vi.fn()),
}));

// Mock environment utils
vi.mock("../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => false),
    isProduction: vi.fn(() => true),
}));

// Mock constants
vi.mock("../constants", () => ({
    UI_DELAYS: {
        LOADING_OVERLAY: 100,
    },
}));

// Mock all theme components
vi.mock("../theme/components", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
    ThemedBox: ({ children, ...props }: any) => <div data-testid="themed-box" {...props}>{children}</div>,
    ThemedButton: ({ children, ...props }: any) => <button data-testid="themed-button" {...props}>{children}</button>,
    ThemedText: ({ children, ...props }: any) => <span data-testid="themed-text" {...props}>{children}</span>,
}));

// Mock ErrorBoundary
vi.mock("../stores/error/ErrorBoundary", () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock the child components to avoid complex rendering
vi.mock("../components/Header/Header", () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("../components/Dashboard/SiteList", () => ({
    SiteList: () => <div data-testid="site-list">SiteList</div>,
}));

vi.mock("../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: () => <div data-testid="add-site-form">AddSiteForm</div>,
}));

vi.mock("../components/Settings/Settings", () => ({
    Settings: () => <div data-testid="settings">Settings</div>,
}));

vi.mock("../components/SiteDetails/SiteDetails", () => ({
    SiteDetails: () => <div data-testid="site-details">SiteDetails</div>,
}));

import App from "../App";

describe.skip("App Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render without crashing", () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });

    it("should render with proper structure", () => {
        render(<App />);
        
        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
        expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    });

    it("should render header component", () => {
        render(<App />);
        expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("should render site list component", () => {
        render(<App />);
        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should render add site form component", () => {
        render(<App />);
        expect(screen.getByTestId("add-site-form")).toBeInTheDocument();
    });

    it("should have correct app container class", () => {
        const { container } = render(<App />);
        const appContainer = container.querySelector(".app-container");
        expect(appContainer).toBeInTheDocument();
    });
});

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
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="theme-provider">{children}</div>
    ),
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
    ThemedButton: ({ children, ...props }: any) => (
        <button data-testid="themed-button" {...props}>
            {children}
        </button>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
}));

// Mock ErrorBoundary
vi.mock("../stores/error/ErrorBoundary", () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="error-boundary">{children}</div>
    ),
}));

// Mock the child components to avoid complex rendering
vi.mock("../components/Header/Header", () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("../components/Dashboard/SiteList/SiteList", () => ({
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

    it("should render without crashing", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - Component Rendering", "test-type");
        await annotate("Operation: Basic App Render", "operation");
        await annotate("Priority: Critical - Core Component", "priority");
        await annotate("Complexity: High - Full App Integration", "complexity");
        await annotate("Scope: Main application container component", "scope");
        await annotate("Purpose: Ensure main app component renders without errors", "purpose");

        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });

    it("should render with proper structure", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - Structure Validation", "test-type");
        await annotate("Operation: App Structure Verification", "operation");
        await annotate("Priority: Critical - Component Architecture", "priority");
        await annotate("Complexity: Medium - Structure Validation", "complexity");
        await annotate("Dependencies: ErrorBoundary, ThemeProvider", "dependencies");
        await annotate("Purpose: Validate essential wrapper components are present", "purpose");

        render(<App />);

        expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
        expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    });

    it("should render header component", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - Child Component", "test-type");
        await annotate("Operation: Header Component Render", "operation");
        await annotate("Priority: High - UI Navigation", "priority");
        await annotate("Complexity: Low - Child Component Check", "complexity");
        await annotate("UI Element: Main application header", "ui-element");
        await annotate("Purpose: Ensure header component is rendered", "purpose");

        render(<App />);
        expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("should render site list component", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - Child Component", "test-type");
        await annotate("Operation: Site List Component Render", "operation");
        await annotate("Priority: Critical - Core Functionality", "priority");
        await annotate("Complexity: Low - Child Component Check", "complexity");
        await annotate("UI Element: Site monitoring dashboard", "ui-element");
        await annotate("Purpose: Ensure site list dashboard is rendered", "purpose");

        render(<App />);
        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should render add site form component", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - Child Component", "test-type");
        await annotate("Operation: Add Site Form Render", "operation");
        await annotate("Priority: High - Site Management", "priority");
        await annotate("Complexity: Low - Child Component Check", "complexity");
        await annotate("UI Element: Site creation form", "ui-element");
        await annotate("Purpose: Ensure site creation form is rendered", "purpose");

        render(<App />);
        expect(screen.getByTestId("add-site-form")).toBeInTheDocument();
    });

    it("should have correct app container class", async ({ annotate }) => {
        await annotate("Component: App", "component");
        await annotate("Test Type: Integration - CSS Class Validation", "test-type");
        await annotate("Operation: App Container CSS Verification", "operation");
        await annotate("Priority: Medium - UI Styling", "priority");
        await annotate("Complexity: Low - CSS Class Check", "complexity");
        await annotate("CSS Class: app-container", "css-class");
        await annotate("Purpose: Ensure proper CSS classes are applied", "purpose");

        const { container } = render(<App />);
        const appContainer = container.querySelector(".app-container");
        expect(appContainer).toBeInTheDocument();
    });
});

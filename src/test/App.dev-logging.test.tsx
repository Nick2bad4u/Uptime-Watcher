/**
 * Test for App.tsx development logging coverage Targets specific uncovered
 * lines 201-218 in App.tsx
 */

import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import { App } from "../App";
import { logger } from "../services/logger";
import { useErrorStore } from "../stores/error/useErrorStore";
import { defaultSettings } from "../stores/settings/state";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import { useTheme } from "../theme/useTheme";

// Mock environment functions
vi.mock("@shared/utils/environment");
vi.mock("../services/logger", () => {
    const mockLogger = {
        app: {
            started: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };

    return {
        Logger: mockLogger,
        logger: mockLogger,
    };
});

// Mock hooks and utilities
vi.mock("../hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("../hooks/useSelectedSite", () => ({
    useSelectedSite: vi.fn().mockReturnValue(null),
}));

vi.mock("../hooks/useMount", () => ({
    useMount: vi.fn((initCallback) => {
        setTimeout(() => {
            initCallback();
        }, 10);
    }),
}));

vi.mock("../utils/cacheSync", () => ({
    setupCacheSync: vi.fn(() => vi.fn()),
}));

// Mock components
vi.mock("../components/Header/Header", () => ({
    Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("../components/Dashboard/SiteList/SiteList", () => ({
    SiteList: () => <div data-testid="site-list">Site List</div>,
}));

vi.mock("../components/AddSiteForm/AddSiteModal", () => ({
    AddSiteModal: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="add-site-modal" onClick={onClose}>
            Add Site Modal
        </div>
    ),
}));

vi.mock("../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: () => <div data-testid="error-alert">Error Alert</div>,
}));

vi.mock("../services/NotificationPreferenceService", () => ({
    NotificationPreferenceService: {
        initialize: vi.fn().mockResolvedValue(undefined),
        updatePreferences: vi.fn().mockResolvedValue(undefined),
    },
}));

// Mock stores
vi.mock("../stores/error/useErrorStore");
vi.mock("../stores/settings/useSettingsStore");
vi.mock("../stores/sites/useSitesStore");
vi.mock("../stores/ui/useUiStore");
vi.mock("../stores/updates/useUpdatesStore");
vi.mock("../theme/useTheme");

const originalMatchMedia = globalThis.matchMedia;

describe("App Development Logging Coverage", () => {
    let mockSettingsStoreState: {
        initializeSettings: ReturnType<typeof vi.fn>;
        resetSettings: ReturnType<typeof vi.fn>;
        settings: typeof defaultSettings;
        updateSetting: ReturnType<typeof vi.fn>;
        updateSettings: ReturnType<typeof vi.fn>;
    };
    let mockSitesStoreState: {
        initializeSites: ReturnType<typeof vi.fn>;
        subscribeToStatusUpdates: ReturnType<typeof vi.fn>;
        unsubscribeFromStatusUpdates: ReturnType<typeof vi.fn>;
        sites: never[];
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock environment functions
        vi.mocked(isDevelopment).mockReturnValue(true);
        vi.mocked(isProduction).mockReturnValue(false);

        // Mock logger
        vi.mocked(logger).debug = vi.fn();

        // Setup store mocks
        vi.mocked(useErrorStore).mockReturnValue({
            clearError: vi.fn(),
            isLoading: false,
            lastError: null,
        });

        vi.mocked(useUIStore).mockReturnValue({
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            showSettings: false,
            showSiteDetails: false,
        });

        vi.mocked(useUpdatesStore).mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            applyUpdateStatus: vi.fn(),
            subscribeToUpdateStatusEvents: vi.fn(() => vi.fn()),
            updateError: null,
            updateStatus: "idle",
        });

        vi.mocked(useTheme).mockReturnValue({
            isDark: false,
            availableThemes: ["light", "dark"],
            currentTheme: {
                name: "light",
                colors: {},
                spacing: {},
                typography: {},
                borderRadius: {},
                shadows: {},
            } as any,
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            setTheme: vi.fn(),
            toggleTheme: vi.fn(),
            systemTheme: "light",
            themeManager: {} as any,
            themeName: "light",
            themeVersion: 1,
        });

        mockSettingsStoreState = {
            initializeSettings: vi.fn().mockResolvedValue(undefined),
            resetSettings: vi.fn(),
            settings: { ...defaultSettings },
            updateSetting: vi.fn(),
            updateSettings: vi.fn(),
        };

        vi.mocked(useSettingsStore).mockImplementation(((
            selector?: (state: typeof mockSettingsStoreState) => unknown
        ) =>
            selector
                ? selector(mockSettingsStoreState)
                : mockSettingsStoreState) as any);
        vi.mocked(useSettingsStore).getState = vi
            .fn()
            .mockReturnValue(mockSettingsStoreState as any);

        mockSitesStoreState = {
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
            sites: [],
        };

        vi.mocked(useSitesStore).mockImplementation(((
            selector?: (state: typeof mockSitesStoreState) => unknown
        ) =>
            selector
                ? selector(mockSitesStoreState)
                : mockSitesStoreState) as any);
        vi.mocked(useSitesStore).getState = vi
            .fn()
            .mockReturnValue(mockSitesStoreState as any);

        globalThis.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            media: "(max-width: 1280px)",
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }) as typeof globalThis.matchMedia;
    });

    afterEach(() => {
        globalThis.matchMedia = originalMatchMedia;
    });

    it("should execute development logging in status updates callback", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: App.dev-logging", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Data Update", "type");

        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: App.dev-logging", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Data Update", "type");

        const subscribeToStatusUpdatesMock = vi.fn();

        // Update sites store mock to capture callback
        mockSitesStoreState.subscribeToStatusUpdates =
            subscribeToStatusUpdatesMock;
        mockSitesStoreState.initializeSites = vi
            .fn()
            .mockResolvedValue(undefined);
        vi.mocked(useSitesStore).getState = vi
            .fn()
            .mockReturnValue(mockSitesStoreState as any);

        render(<App />);

        // Wait for initialization to complete
        await waitFor(
            () => {
                expect(subscribeToStatusUpdatesMock).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        // Get the callback function passed to subscribeToStatusUpdates
        const statusUpdateCallback =
            subscribeToStatusUpdatesMock.mock.calls[0]?.[0];

        if (statusUpdateCallback) {
            // Create a mock status update
            const mockUpdate = {
                site: { identifier: "test-site-id" },
                siteIdentifier: "fallback-site-id",
            };

            // Call the callback to trigger development logging
            statusUpdateCallback(mockUpdate);
        }

        // Verify that logger.debug was called
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\d{1,2}:\d{2}:\d{2} [AP]M] Status update received for site: test-site-id/
            )
        );
    });

    it("should use fallback siteIdentifier when site.identifier is undefined", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: App.dev-logging", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: App.dev-logging", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const subscribeToStatusUpdatesMock = vi.fn();

        // Update sites store mock to capture callback
        vi.mocked(useSitesStore).getState = vi.fn().mockReturnValue({
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: subscribeToStatusUpdatesMock,
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        render(<App />);

        // Wait for initialization to complete
        await waitFor(
            () => {
                expect(subscribeToStatusUpdatesMock).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        // Get the callback function passed to subscribeToStatusUpdates
        const statusUpdateCallback =
            subscribeToStatusUpdatesMock.mock.calls[0]?.[0];

        if (statusUpdateCallback) {
            // Create a mock status update with undefined site.identifier
            const mockUpdate = {
                site: { identifier: undefined },
                siteIdentifier: "fallback-site-id",
            };

            // Call the callback to trigger development logging with fallback
            statusUpdateCallback(mockUpdate);
        }

        // Verify that logger.debug was called with fallback identifier
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\d{1,2}:\d{2}:\d{2} [AP]M] Status update received for site: fallback-site-id/
            )
        );
    });
});

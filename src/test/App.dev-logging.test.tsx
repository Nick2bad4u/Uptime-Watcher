/**
 * Test for App.tsx development logging coverage Targets specific uncovered
 * lines 201-218 in App.tsx
 */

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import App from "../App";
import logger from "../services/logger";
import { useErrorStore } from "../stores/error/useErrorStore";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import { useTheme } from "../theme/useTheme";

// Mock environment functions
vi.mock("@shared/utils/environment");
vi.mock("../services/logger");

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
    AddSiteModal: () => <div data-testid="add-site-modal">Add Site Modal</div>,
}));

vi.mock("../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: () => <div data-testid="error-alert">Error Alert</div>,
}));

// Mock stores
vi.mock("../stores/error/useErrorStore");
vi.mock("../stores/settings/useSettingsStore");
vi.mock("../stores/sites/useSitesStore");
vi.mock("../stores/ui/useUiStore");
vi.mock("../stores/updates/useUpdatesStore");
vi.mock("../theme/useTheme");

describe("App Development Logging Coverage", () => {
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
            setUpdateStatus: vi.fn(),
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

        // Mock sites store with statusUpdates subscription
        const subscribeToStatusUpdatesMock = vi.fn();
        vi.mocked(useSitesStore).mockReturnValue({
            sites: [],
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: subscribeToStatusUpdatesMock,
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        // Mock settings store
        vi.mocked(useSettingsStore).mockReturnValue({
            initializeSettings: vi.fn().mockResolvedValue(undefined),
        });

        // Mock store getState methods for initialization
        vi.mocked(useSitesStore).getState = vi.fn().mockReturnValue({
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: subscribeToStatusUpdatesMock,
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        vi.mocked(useSettingsStore).getState = vi.fn().mockReturnValue({
            initializeSettings: vi.fn().mockResolvedValue(undefined),
        });
    });

    it("should execute development logging in status updates callback", async () => {
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
            subscribeToStatusUpdatesMock.mock.calls[0][0];

        // Create a mock status update
        const mockUpdate = {
            site: { identifier: "test-site-id" },
            siteIdentifier: "fallback-site-id",
        };

        // Call the callback to trigger development logging
        statusUpdateCallback(mockUpdate);

        // Verify that logger.debug was called
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\d{1,2}:\d{2}:\d{2} [AP]M] Status update received for site: test-site-id/
            )
        );
    });

    it("should use fallback siteIdentifier when site.identifier is undefined", async () => {
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
            subscribeToStatusUpdatesMock.mock.calls[0][0];

        // Create a mock status update with undefined site.identifier
        const mockUpdate = {
            site: { identifier: undefined },
            siteIdentifier: "fallback-site-id",
        };

        // Call the callback to trigger development logging with fallback
        statusUpdateCallback(mockUpdate);

        // Verify that logger.debug was called with fallback identifier
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringMatching(
                /\[\d{1,2}:\d{2}:\d{2} [AP]M] Status update received for site: fallback-site-id/
            )
        );
    });
});

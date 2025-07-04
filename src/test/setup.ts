/**
 * Test setup file for Vitest.
 * Configures testing environment for React components.
 */

import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Global test configuration and mocks
const mockElectronAPI = {
    events: {
        onStatusUpdate: vi.fn((callback) => {
            // Mock implementation - just store the callback but don't call it
            // In real usage, this would be called by the backend
            return callback;
        }),
        onSiteAdded: vi.fn(),
        onSiteUpdated: vi.fn(),
        onSiteRemoved: vi.fn(),
        onError: vi.fn(),
        removeAllListeners: vi.fn(), // Add missing method
    },
    sites: {
        addSite: vi.fn(),
        updateSite: vi.fn(),
        removeSite: vi.fn(),
        getSites: vi.fn().mockResolvedValue([]),
        checkSiteNow: vi.fn(),
        updateCheckInterval: vi.fn(),
    },
    monitors: {
        addMonitor: vi.fn(),
        updateMonitor: vi.fn(),
        removeMonitor: vi.fn(),
        getMonitors: vi.fn().mockResolvedValue([]),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
        updateTimeout: vi.fn(),
        updateRetryAttempts: vi.fn(),
    },
    settings: {
        getSettings: vi.fn().mockResolvedValue({
            notifications: true,
            autoStart: false,
            minimizeToTray: false,
            theme: "system",
            soundAlerts: false,
            historyLimit: 1000,
        }),
        getHistoryLimit: vi.fn().mockResolvedValue(1000), // Add missing method
        updateSettings: vi.fn(),
        resetSettings: vi.fn(),
    },
    update: {
        checkForUpdates: vi.fn(),
        installUpdate: vi.fn(),
        onUpdateAvailable: vi.fn(),
        onUpdateDownloaded: vi.fn(),
        onUpdateError: vi.fn(),
    },
    app: {
        getVersion: vi.fn().mockResolvedValue("1.0.0"),
        quit: vi.fn(),
        minimize: vi.fn(),
        close: vi.fn(),
    },
};

// Mock window.electronAPI globally
Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Export mock for use in individual tests
export { mockElectronAPI };

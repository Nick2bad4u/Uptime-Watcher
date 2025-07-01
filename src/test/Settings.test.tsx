/**
 * Tests for Settings component.
 * Basic tests to start with.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { Settings } from "../components/Settings/Settings";
import { ThemeName } from "../theme/types";

// Mock the store
const mockUseStore = {
    clearError: vi.fn(),
    downloadSQLiteBackup: vi.fn().mockResolvedValue(undefined),
    fullSyncFromBackend: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    lastError: null as string | null,
    resetSettings: vi.fn(),
    setError: vi.fn(),
    settings: {
        notifications: true,
        autoStart: false,
        minimizeToTray: true,
        theme: "dark" as ThemeName,
        soundAlerts: false,
        historyLimit: 100,
    },
    updateHistoryLimitValue: vi.fn(),
    updateSettings: vi.fn(),
};

// Mock the theme hook
const mockUseTheme = {
    availableThemes: ["light", "dark", "system"] as ThemeName[],
    currentTheme: {
        isDark: true,
        colors: {
            primary: "#000",
            secondary: "#fff",
        },
    },
    getColor: vi.fn(),
    getStatusColor: vi.fn(),
    isDark: true,
    setTheme: vi.fn(),
    systemTheme: "dark" as const,
    themeManager: {},
    themeName: "dark" as ThemeName,
    themeVersion: 0,
    toggleTheme: vi.fn(),
};

// Mock window.confirm
global.confirm = vi.fn();

vi.mock("../store", () => ({
    useStore: () => mockUseStore,
}));

vi.mock("../theme/useTheme", () => ({
    useTheme: () => mockUseTheme,
}));

vi.mock("../services/logger", () => ({
    default: {
        user: {
            settingsChange: vi.fn(),
            action: vi.fn(),
        },
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("div", props, children),
    ThemedText: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("span", props, children),
    ThemedButton: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("button", props, children),
    StatusIndicator: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("div", props, children),
    ThemedSelect: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("select", props, children),
    ThemedCheckbox: (props: { [key: string]: unknown }) => 
        React.createElement("input", { type: "checkbox", ...props }),
}));

describe("Settings", () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseStore.isLoading = false;
        mockUseStore.lastError = null;
        global.confirm = vi.fn();
    });

    describe("Basic Rendering", () => {
        it("should render settings modal with header", () => {
            render(<Settings onClose={mockOnClose} />);

            // Header
            expect(screen.getByText("⚙️ Settings")).toBeInTheDocument();
        });
    });
});

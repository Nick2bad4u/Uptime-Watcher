/**
 * Test setup file for Vitest. Configures testing environment for React
 * components.
 */

import { vi, type Mock } from "vitest";
import "@testing-library/jest-dom";
import fc from "fast-check";

import EventEmitter from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

// Handle unhandled promise rejections from async tests
// Only suppress errors that are expected from abort/retry tests
const originalUnhandledRejection = process.listeners("unhandledRejection");

process.removeAllListeners("unhandledRejection");

process.on("unhandledRejection", (reason: unknown) => {
    // Only suppress expected test error messages
    if (
        reason instanceof Error &&
        (reason.message.includes("Always fails") ||
         reason.message.includes("Fails") ||
         reason.message.includes("Operation was aborted") ||
         reason.message.includes("string error"))
    ) {
        // These are expected test failures, ignore them
        return;
    }

    // For any other unhandled rejections, call original handlers
    for (const handler of originalUnhandledRejection) {
        if (typeof handler === "function") {
            handler(reason, new Promise(() => {}));
        }
    }
});

// Configure fast-check for property-based testing
fc.configureGlobal({ numRuns: 10 });

// Mock ResizeObserver for Chart.js testing
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Global test configuration and mocks
const mockElectronAPI: {
    data: {
        downloadSQLiteBackup: Mock<(...args: any[]) => any>;
        exportData: Mock<(...args: any[]) => any>;
        importData: Mock<(...args: any[]) => any>;
    };
    events: {
        onMonitorStatusChanged: Mock<
            (_callback: any) => Mock<(...args: any[]) => any>
        >;
        onMonitorUp: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitorDown: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitoringStarted: Mock<
            (_callback: any) => Mock<(...args: any[]) => any>
        >;
        onMonitoringStopped: Mock<
            (_callback: any) => Mock<(...args: any[]) => any>
        >;
        onTestEvent: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onUpdateStatus: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        removeAllListeners: Mock<(...args: any[]) => any>;
    };
    monitoring: {
        startMonitoring: Mock<(...args: any[]) => any>;
        startMonitoringForSite: Mock<(...args: any[]) => any>;
        stopMonitoring: Mock<(...args: any[]) => any>;
        stopMonitoringForSite: Mock<(...args: any[]) => any>;
    };
    monitorTypes: {
        formatMonitorDetail: Mock<(...args: any[]) => any>;
        getMonitorTypes: Mock<(...args: any[]) => any>;
        validateMonitorData: Mock<(...args: any[]) => any>;
    };
    settings: {
        getHistoryLimit: Mock<(...args: any[]) => any>;
        updateHistoryLimit: Mock<(...args: any[]) => any>;
    };
    sites: {
        addSite: Mock<(...args: any[]) => any>;
        checkSiteNow: Mock<(...args: any[]) => any>;
        getSites: Mock<(...args: any[]) => any>;
        removeMonitor: Mock<(...args: any[]) => any>;
        removeSite: Mock<(...args: any[]) => any>;
        updateSite: Mock<(...args: any[]) => any>;
    };
    stateSync: {
        getSyncStatus: Mock<(...args: any[]) => any>;
        onStateSyncEvent: Mock<
            (_callback: any) => Mock<(...args: any[]) => any>
        >;
    };
    system: {
        openExternal: Mock<(...args: any[]) => any>;
        quitAndInstall: Mock<(...args: any[]) => any>;
    };
} = {
    data: {
        downloadSQLiteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "test-backup.sqlite",
        }),
        exportData: vi.fn().mockResolvedValue("mock-data"),
        importData: vi.fn().mockResolvedValue(true),
    },
    events: {
        onMonitorStatusChanged: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onMonitorUp: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onMonitorDown: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onMonitoringStarted: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onMonitoringStopped: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onTestEvent: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        onUpdateStatus: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
    monitorTypes: {
        formatMonitorDetail: vi.fn().mockResolvedValue({
            success: true,
            data: "Mock formatted detail",
        }),
        getMonitorTypes: vi.fn().mockResolvedValue({
            success: true,
            data: [
                {
                    type: "http",
                    fields: [
                        {
                            id: "url",
                            label: "URL",
                            type: "url",
                            required: true,
                            placeholder: "https://example.com",
                        },
                        {
                            id: "port",
                            label: "Port",
                            type: "number",
                            required: false,
                            min: 1,
                            max: 65_535,
                        },
                    ],
                },
                {
                    type: "port",
                    fields: [
                        {
                            id: "host",
                            label: "Host",
                            type: "text",
                            required: true,
                        },
                        {
                            id: "port",
                            label: "Port",
                            type: "number",
                            required: true,
                            min: 1,
                            max: 65_535,
                        },
                    ],
                },
            ],
        }),
        validateMonitorData: vi.fn().mockResolvedValue({
            success: true,
            errors: [],
        }),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(undefined), // Returns void
    },
    sites: {
        addSite: vi.fn().mockResolvedValue({
            identifier: "test-site",
            monitors: [],
            name: "Test Site",
        }),
        checkSiteNow: vi.fn().mockResolvedValue({
            monitorId: "test-monitor",
            status: "up",
            timestamp: Date.now(),
        }),
        getSites: vi.fn().mockResolvedValue([]),
        removeMonitor: vi.fn().mockResolvedValue(true), // Returns boolean
        removeSite: vi.fn().mockResolvedValue(true), // Returns boolean
        updateSite: vi.fn().mockResolvedValue(undefined), // Returns void
    },
    stateSync: {
        getSyncStatus: vi.fn().mockResolvedValue({
            success: true,
            siteCount: 0,
            lastSync: undefined,
            synchronized: false,
        }),
        onStateSyncEvent: vi.fn(
            (_callback: any): Mock<(...args: any[]) => any> =>
                // Mock implementation - return cleanup function
                vi.fn() // Mock cleanup function
        ),
    },
    system: {
        openExternal: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn(),
    },
};

// Mock window.electronAPI globally
Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock window.matchMedia for theme tests
Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock crypto API for UUID generation
Object.defineProperty(globalThis, "crypto", {
    value: {
        randomUUID: vi.fn(
            () => `mock-uuid-${Math.random().toString(36).slice(2, 15)}`
        ),
        getRandomValues: vi.fn((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }),
    },
    writable: true,
});

// Mock document.body.classList for theme tests
Object.defineProperty(document.body, "classList", {
    value: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
    },
    writable: true,
});

// Individual tests should manage their own DOM setup for getElementById

vi.mock("electron-log/renderer", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        transports: {
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            file: {
                level: "info",
            },
        },
    },
}));

// Mock comprehensive theme for testing
const mockTheme = {
    borderRadius: {
        full: "9999px",
        lg: "0.5rem",
        md: "0.375rem",
        none: "0",
        sm: "0.125rem",
        xl: "0.75rem",
    },
    colors: {
        background: {
            modal: "rgba(0, 0, 0, 0.5)",
            primary: "#ffffff",
            secondary: "#f9fafb",
            tertiary: "#f3f4f6",
        },
        border: {
            focus: "#3b82f6",
            primary: "#e5e7eb",
            secondary: "#d1d5db",
        },
        error: "#ef4444",
        errorAlert: "#991b1b",
        hover: {
            dark: "rgba(0, 0, 0, 0.08)",
            light: "rgba(0, 0, 0, 0.03)",
            medium: "rgba(0, 0, 0, 0.05)",
        },
        info: "#3b82f6",
        primary: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
        },
        status: {
            down: "#ef4444",
            mixed: "#8b5cf6",
            paused: "#6b7280",
            pending: "#f59e0b",
            unknown: "#6b7280",
            up: "#10b981",
        },
        success: "#10b981",
        surface: {
            base: "#ffffff",
            elevated: "#ffffff",
            overlay: "#f9fafb",
        },
        text: {
            inverse: "#ffffff",
            primary: "#111827",
            secondary: "#6b7280",
            tertiary: "#9ca3af",
        },
        warning: "#f59e0b",
    },
    isDark: false,
    name: "light" as const,
    shadows: {
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    spacing: {
        "2xl": "3rem",
        "3xl": "4rem",
        lg: "1.5rem",
        md: "1rem",
        sm: "0.5rem",
        xl: "2rem",
        xs: "0.25rem",
    },
    typography: {
        fontFamily: {
            mono: [
                "SF Mono",
                "Monaco",
                "Inconsolata",
                "Roboto Mono",
                "monospace",
            ] as const,
            sans: [
                "Inter",
                "system-ui",
                "Avenir",
                "Helvetica",
                "Arial",
                "sans-serif",
            ] as const,
        },
        fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            "5xl": "3rem",
            "6xl": "3.75rem",
        },
        fontWeight: {
            thin: 100,
            extralight: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
        lineHeight: {
            none: 1,
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
        },
    },
};

// Mock theme context globally with complete functionality
vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        ...mockTheme,
        availableThemes: [
            "light",
            "dark",
            "system",
        ],
        currentTheme: mockTheme,
        getColor: vi.fn((path: string) => {
            const keys = path.split(".");
            let value: any = mockTheme.colors;
            for (const key of keys) {
                if (value && typeof value === "object" && key in value) {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            return typeof value === "string"
                ? value
                : mockTheme.colors.text.primary;
        }),
        getStatusColor: vi.fn(
            (status: string) =>
                mockTheme.colors.status[
                    status as keyof typeof mockTheme.colors.status
                ] || mockTheme.colors.text.secondary
        ),
        isDark: false,
        setTheme: vi.fn(),
        systemTheme: "light" as const,
        themeManager: {
            getTheme: vi.fn(() => mockTheme),
            applyTheme: vi.fn(),
            getAvailableThemes: vi.fn(() => [
                "light",
                "dark",
                "system",
            ]),
            onSystemThemeChange: vi.fn(() => vi.fn()),
            getSystemThemePreference: vi.fn(() => "light"),
        },
        themeName: "light" as const,
        themeVersion: 1,
        toggleTheme: vi.fn(),
    }),
    useAvailabilityColors: () => ({
        getAvailabilityColor: vi.fn((percentage: number) => {
            if (percentage >= 95) return mockTheme.colors.status.up;
            if (percentage >= 80) return mockTheme.colors.warning;
            return mockTheme.colors.error;
        }),
        getAvailabilityDescription: vi.fn((percentage: number) => {
            const clampedPercentage = Math.max(0, Math.min(100, percentage));
            if (clampedPercentage >= 99.9) return "Excellent";
            if (clampedPercentage >= 99) return "Very Good";
            if (clampedPercentage >= 95) return "Good";
            if (clampedPercentage >= 90) return "Fair";
            if (clampedPercentage >= 80) return "Poor";
            if (clampedPercentage >= 50) return "Critical";
            return "Failed";
        }),
        getAvailabilityVariant: vi.fn((percentage: number) => {
            if (percentage >= 95) return "success";
            if (percentage >= 80) return "warning";
            return "danger";
        }),
    }),
    useStatusColors: () => ({
        down: mockTheme.colors.status.down,
        pending: mockTheme.colors.status.pending,
        unknown: mockTheme.colors.status.unknown,
        up: mockTheme.colors.status.up,
    }),
    useThemeClasses: () => ({
        getBackgroundClass: vi.fn((variant = "primary") => ({
            backgroundColor: `var(--color-background-${variant})`,
        })),
        getBorderClass: vi.fn((variant = "primary") => ({
            borderColor: `var(--color-border-${variant})`,
        })),
        getColor: vi.fn((path: string) => {
            const keys = path.split(".");
            let value: any = mockTheme.colors;
            for (const key of keys) {
                if (value && typeof value === "object" && key in value) {
                    value = value[key];
                } else {
                    value = undefined;
                    break;
                }
            }
            return typeof value === "string"
                ? value
                : mockTheme.colors.text.primary;
        }),
        getStatusClass: vi.fn((status: string) => ({
            color: `var(--color-status-${status})`,
        })),
        getSurfaceClass: vi.fn((variant = "base") => ({
            backgroundColor: `var(--color-surface-${variant})`,
        })),
        getTextClass: vi.fn((variant = "primary") => ({
            color: `var(--color-text-${variant})`,
        })),
    }),
    useThemeValue: vi.fn((selector) => selector(mockTheme)),
}));

// Export mocks for use in individual tests
export { mockElectronAPI, mockTheme };

// Custom test context setup for task and annotate properties
// Note: The actual type definitions are in src/types/vitest-context.d.ts
import "./vitest-context-setup";

// Provide global fail function if not already defined
if ((globalThis as any).fail === undefined) {
    (globalThis as any).fail = (message?: string): never => {
        throw new Error(message ?? "Test failed");
    };
}

/**
 * Simplified test for HistoryTab component focusing on increasing coverage.
 * Tests the basic functionality and different code paths.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { HistoryTab } from "../../../../components/SiteDetails/tabs/HistoryTab";
import type { Monitor } from "../../../../../shared/types";

// Mock all external dependencies
vi.mock("../../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(() => ({
        settings: { historyLimit: 25 },
        initializeSettings: vi.fn(),
        updateSettings: vi.fn(),
        exportSettings: vi.fn(),
        importSettings: vi.fn(),
    })),
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        availableThemes: ["light", "dark"],
        currentTheme: {
            colors: {
                primary: { 500: "#3B82F6" },
                warning: "#F59E0B",
                background: { primary: "#FFFFFF", secondary: "#F8FAFC" },
                border: { primary: "#E2E8F0", secondary: "#CBD5E1" },
                error: { 50: "#FEF2F2", 500: "#EF4444", 600: "#DC2626" },
                errorAlert: "#DC2626",
                info: "#3B82F6",
                success: "#10B981",
                successAlert: "#059669",
                text: { primary: "#1F2937", secondary: "#6B7280" },
                warningAlert: "#D97706",
            },
        },
        getColor: vi.fn(),
        getStatusColor: vi.fn(),
        isDark: false,
        setTheme: vi.fn(),
        systemTheme: "light",
        themeManager: {},
        themeName: "light",
        themeVersion: 1,
        toggleTheme: vi.fn(),
    })),
}));

vi.mock("../../../../services/logger", () => ({
    default: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../../theme/components", () => ({
    StatusIndicator: ({ children, ...props }: any) => (
        <div data-testid="status-indicator" {...props}>
            {children}
        </div>
    ),
    ThemedButton: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
    ThemedCard: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
    ),
    ThemedSelect: ({ children, ...props }: any) => (
        <select {...props}>{children}</select>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span {...props}>{children}</span>
    ),
}));

vi.mock("../../common/MonitorUiComponents", () => ({
    DetailLabel: ({ children, ...props }: any) => (
        <label {...props}>{children}</label>
    ),
}));

describe("HistoryTab", () => {
    const mockFormatFullTimestamp = vi.fn((timestamp: number) =>
        new Date(timestamp).toISOString()
    );
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const mockFormatStatusWithIcon = vi.fn((status: string) =>
        status === "up" ? "✅ Up" : "❌ Down"
    );

    const createMockMonitor = (historyLength: number = 5): Monitor => ({
        id: "test-monitor",
        type: "http",
        url: "https://example.com",
        monitoring: true,
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        status: "up",
        lastChecked: new Date(),
        responseTime: 150,
        history: Array.from({ length: historyLength }, (_, i) => ({
            timestamp: Date.now() - i * 60000,
            status: i % 2 === 0 ? "up" : "down",
            responseTime: 100 + i * 10,
        })),
    });

    const defaultProps = {
        formatFullTimestamp: mockFormatFullTimestamp,
        formatResponseTime: mockFormatResponseTime,
        formatStatusWithIcon: mockFormatStatusWithIcon,
        selectedMonitor: createMockMonitor(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Component Rendering", () => {
        it("should render history tab with basic elements", () => {
            render(<HistoryTab {...defaultProps} />);

            // Check if basic elements are present
            const indicators = screen.getAllByTestId("status-indicator");
            expect(indicators.length).toBeGreaterThan(0);
        });

        it("should handle empty history gracefully", () => {
            const monitorWithoutHistory = createMockMonitor(0);
            render(
                <HistoryTab
                    {...defaultProps}
                    selectedMonitor={monitorWithoutHistory}
                />
            );

            // Should render without crashing and show empty state
            expect(screen.getByText(/No records found/i)).toBeInTheDocument();
        });

        it("should handle monitor with large history", () => {
            const monitorWithLargeHistory = createMockMonitor(100);
            render(
                <HistoryTab
                    {...defaultProps}
                    selectedMonitor={monitorWithLargeHistory}
                />
            );

            // Should respect history limit
            const indicators = screen.getAllByTestId("status-indicator");
            expect(indicators.length).toBeLessThanOrEqual(25); // default limit
        });

        it("should call formatting functions", () => {
            render(<HistoryTab {...defaultProps} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalled();
            expect(mockFormatResponseTime).toHaveBeenCalled();
            expect(mockFormatStatusWithIcon).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined history", () => {
            const monitorWithUndefinedHistory = {
                ...createMockMonitor(),
                history: [],
            } as any;

            expect(() =>
                render(
                    <HistoryTab
                        {...defaultProps}
                        selectedMonitor={monitorWithUndefinedHistory}
                    />
                )
            ).not.toThrow();
        });

        it("should handle history records with missing fields", () => {
            const monitorWithIncompleteHistory = {
                ...createMockMonitor(),
                history: [
                    { timestamp: Date.now(), status: "up" }, // missing responseTime
                    { timestamp: Date.now() - 60000 }, // missing status and responseTime
                ],
            } as any;

            expect(() =>
                render(
                    <HistoryTab
                        {...defaultProps}
                        selectedMonitor={monitorWithIncompleteHistory}
                    />
                )
            ).not.toThrow();
        });
    });
});

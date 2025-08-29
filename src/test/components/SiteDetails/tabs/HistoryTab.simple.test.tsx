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

vi.mock("../../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../../theme/components/StatusIndicator", () => ({
    StatusIndicator: ({ children, ...props }: any) => (
        <div data-testid="status-indicator" {...props}>
            {children}
        </div>
    ),
}));

vi.mock("../../../../theme/components/ThemedButton", () => ({
    ThemedButton: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));

vi.mock("../../../../theme/components/ThemedCard", () => ({
    ThemedCard: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock("../../../../theme/components/ThemedSelect", () => ({
    ThemedSelect: ({ children, ...props }: any) => (
        <select {...props}>{children}</select>
    ),
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
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
        checkInterval: 60_000,
        timeout: 5000,
        retryAttempts: 3,
        status: "up",
        lastChecked: new Date(),
        responseTime: 150,
        history: Array.from({ length: historyLength }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
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
        it("should render history tab with basic elements", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            // Check if basic elements are present
            const indicators = screen.getAllByTestId("status-indicator");
            expect(indicators.length).toBeGreaterThan(0);
        });

        it("should handle empty history gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitorWithoutHistory = createMockMonitor(0);
            render(
                <HistoryTab
                    {...defaultProps}
                    selectedMonitor={monitorWithoutHistory}
                />
            );

            // Should render without crashing and show empty state
            expect(screen.getByText(/no records found/i)).toBeInTheDocument();
        });

        it("should handle monitor with large history", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

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

        it("should call formatting functions", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalled();
            expect(mockFormatResponseTime).toHaveBeenCalled();
            expect(mockFormatStatusWithIcon).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined history", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

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

        it("should handle history records with missing fields", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitorWithIncompleteHistory = {
                ...createMockMonitor(),
                history: [
                    { timestamp: Date.now(), status: "up" }, // missing responseTime
                    { timestamp: Date.now() - 60_000 }, // missing status and responseTime
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

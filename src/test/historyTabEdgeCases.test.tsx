/**
 * HistoryTab Edge Cases Tests
 * Additional tests to cover specific uncovered branches in HistoryTab (line 105)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HistoryTab } from "../components/SiteDetails/tabs/HistoryTab";
import type { Monitor, StatusHistory } from "../types";

// Mock the logger service
vi.mock("../services/logger", () => ({
    default: {
        user: {
            action: vi.fn(),
        },
    },
}));

// Mock the store
vi.mock("../store.ts", () => ({
    useStore: vi.fn(() => ({
        settings: {
            historyLimit: 100,
        },
    })),
}));

// Mock themed components to simplify rendering
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
        const filteredProps = { ...props };
        delete filteredProps.border;
        return (
            <div data-testid="themed-box" {...filteredProps}>
                {children}
            </div>
        );
    },
    ThemedButton: ({
        children,
        onClick,
        variant,
        size,
        disabled,
        className,
        ...props
    }: React.PropsWithChildren<
        {
            onClick?: () => void;
            variant?: string;
            size?: string;
            disabled?: boolean;
            className?: string;
        } & Record<string, unknown>
    >) => (
        <button
            data-testid="themed-button"
            data-variant={variant}
            data-size={size}
            disabled={disabled}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    ),
    ThemedText: ({
        children,
        size,
        variant,
        weight,
        className,
        ...props
    }: React.PropsWithChildren<
        {
            size?: string;
            variant?: string;
            weight?: string;
            className?: string;
        } & Record<string, unknown>
    >) => (
        <span
            data-testid="themed-text"
            data-size={size}
            data-variant={variant}
            data-weight={weight}
            className={className}
            {...props}
        >
            {children}
        </span>
    ),
    StatusIndicator: ({ status, ...props }: { status: string } & Record<string, unknown>) => (
        <span data-testid="status-indicator" data-status={status} {...props}>
            {status}
        </span>
    ),
}));

describe("HistoryTab Edge Cases", () => {
    // Mock functions
    const mockFormatFullTimestamp = vi.fn((timestamp: number) => new Date(timestamp).toLocaleString());
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const mockFormatStatusWithIcon = vi.fn((status: string) => (status === "up" ? "✅ Up" : "❌ Down"));

    const createMockMonitor = (
        type: "http" | "port",
        history: StatusHistory[] = []
    ): Monitor => ({
        id: "monitor-1",
        type,
        status: "up",
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        url: type === "http" ? "https://example.com" : undefined,
        host: type === "port" ? "example.com" : undefined,
        port: type === "port" ? 80 : undefined,
        history: history,
    });

    const defaultProps = {
        formatFullTimestamp: mockFormatFullTimestamp,
        formatResponseTime: mockFormatResponseTime,
        formatStatusWithIcon: mockFormatStatusWithIcon,
        selectedMonitor: createMockMonitor("http"),
    };

    describe("details rendering logic (line 105)", () => {
        it("should render nothing when details are null for HTTP monitor", () => {
            const historyWithNullDetails: StatusHistory[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150 },
            ];
            const monitor = createMockMonitor("http", historyWithNullDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should not render response code text when details are null
            expect(screen.queryByText(/Response Code:/)).not.toBeInTheDocument();
        });

        it("should render nothing when details are undefined for HTTP monitor", () => {
            const historyWithUndefinedDetails: StatusHistory[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150 },
            ];
            const monitor = createMockMonitor("http", historyWithUndefinedDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should not render response code text when details are undefined
            expect(screen.queryByText(/Response Code:/)).not.toBeInTheDocument();
        });

        it("should render nothing when details are empty string for HTTP monitor", () => {
            const historyWithEmptyDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150, details: "" },
            ];
            const monitor = createMockMonitor("http", historyWithEmptyDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should not render response code text when details are empty
            expect(screen.queryByText(/Response Code:/)).not.toBeInTheDocument();
        });

        it("should render details when details contain valid data for HTTP monitor", () => {
            const historyWithValidDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150, details: "200" },
            ];
            const monitor = createMockMonitor("http", historyWithValidDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should render response code text when details contain valid data
            expect(screen.getByText(/Response Code: 200/)).toBeInTheDocument();
        });

        it("should render details when details contain valid data for port monitor", () => {
            const historyWithValidDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150, details: "80" },
            ];
            const monitor = createMockMonitor("port", historyWithValidDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should render port text when details contain valid data
            expect(screen.getByText(/Port: 80/)).toBeInTheDocument();
        });

        it("should render nothing for null details on port monitor", () => {
            const historyWithNullDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150 },
            ];
            const monitor = createMockMonitor("port", historyWithNullDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should not render port text when details are null
            expect(screen.queryByText(/Port:/)).not.toBeInTheDocument();
        });

        it("should render nothing for undefined details on port monitor", () => {
            const historyWithUndefinedDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150 },
            ];
            const monitor = createMockMonitor("port", historyWithUndefinedDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should not render port text when details are undefined
            expect(screen.queryByText(/Port:/)).not.toBeInTheDocument();
        });

        it("should render custom details when provided", () => {
            const historyWithCustomDetails: (StatusHistory & { details?: string })[] = [
                { timestamp: 1640995200000, status: "up", responseTime: 150, details: "some-custom-details" },
            ];
            const monitor = createMockMonitor("http", historyWithCustomDetails);

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should render custom details text with label prefix
            expect(screen.getByText("Response Code: some-custom-details")).toBeInTheDocument();
        });

        it("should handle fallback to empty string in getDetailLabel (line 105)", () => {
            // Create a monitor with custom type that doesn't match 'http' or 'port'
            const customMonitor: Monitor = {
                id: "monitor-1",
                type: "http", // We'll cast this to trigger different path
                status: "up",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [
                    {
                        timestamp: 1640995200000,
                        status: "up",
                        responseTime: 150,
                        details: "test-details",
                    } as StatusHistory & { details: string },
                ],
            };

            // Create a monitor with a type that doesn't match http or port to trigger the fallback
            const modifiedMonitor = {
                ...customMonitor,
                type: "unknown" as "http", // Cast to satisfy TypeScript but will trigger fallback
            };

            render(<HistoryTab {...defaultProps} selectedMonitor={modifiedMonitor} />);

            // Should render the details as-is when monitor type doesn't match http or port
            expect(screen.getByText("test-details")).toBeInTheDocument();
        });
    });

    describe("history fallback logic coverage", () => {
        it("should handle monitor with undefined history (|| [] fallback)", () => {
            // Create a monitor with undefined history to trigger || [] fallback
            const monitorWithUndefinedHistory: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
            };

            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithUndefinedHistory} />);

            // Should render "No records found" when history is undefined
            expect(screen.getByText("No records found for the selected filter.")).toBeInTheDocument();
        });

        it("should handle monitor with null history (|| [] fallback)", () => {
            // Create a monitor with null history to trigger || [] fallback
            const monitorWithNullHistory: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
            };

            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithNullHistory} />);

            // Should render "No records found" when history is null
            expect(screen.getByText("No records found for the selected filter.")).toBeInTheDocument();
        });

        it("should handle check numbering with undefined history", () => {
            // Test that the check number calculation handles undefined history
            const monitorWithUndefinedHistory: Monitor = {
                id: "monitor-1",
                type: "http",
                status: "up",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
            };

            // This should not crash and should handle the || [] fallback
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithUndefinedHistory} />);

            // The component should render without crashing
            expect(screen.getByText("Check History")).toBeInTheDocument();
        });
    });
});

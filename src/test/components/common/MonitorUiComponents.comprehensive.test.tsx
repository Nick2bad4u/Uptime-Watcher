/**
 * Comprehensive tests for MonitorUiComponents These components were previously
 * untested (0% coverage)
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import type { MonitorType } from "@shared/types";
import {
    ConditionalResponseTime,
    DetailLabel,
} from "../../../components/common/MonitorUiComponents";

// Mock the dependencies
vi.mock("../../../services/logger");
vi.mock("../../../utils/monitorUiHelpers", () => ({
    supportsResponseTime: vi.fn(),
    formatMonitorDetail: vi.fn(),
}));

import { logger } from "../../../services/logger";
import {
    supportsResponseTime,
    formatMonitorDetail,
} from "../../../utils/monitorUiHelpers";

describe("MonitorUiComponents", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe(ConditionalResponseTime, () => {
        const defaultProps = {
            monitorType: "http" as MonitorType,
            children: <div data-testid="children">Response time content</div>,
            fallback: <div data-testid="fallback">No response time</div>,
        };

        it("should show fallback during loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            // Mock a promise that never resolves to simulate loading
            vi.mocked(supportsResponseTime).mockReturnValue(
                new Promise(() => {})
            );

            render(<ConditionalResponseTime {...defaultProps} />);

            expect(screen.getByTestId("fallback")).toBeInTheDocument();
            expect(screen.queryByTestId("children")).not.toBeInTheDocument();
        });

        it("should show children when response time is supported", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(true);

            render(<ConditionalResponseTime {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByTestId("children")).toBeInTheDocument();
            });

            expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
        });

        it("should show fallback when response time is not supported", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(false);

            render(<ConditionalResponseTime {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByTestId("fallback")).toBeInTheDocument();
            });

            expect(screen.queryByTestId("children")).not.toBeInTheDocument();
        });

        it("should show fallback when supportsResponseTime throws error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockError = new Error("Failed to check support");
            vi.mocked(supportsResponseTime).mockRejectedValue(mockError);

            render(<ConditionalResponseTime {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByTestId("fallback")).toBeInTheDocument();
            });

            expect(screen.queryByTestId("children")).not.toBeInTheDocument();
            expect(logger.warn).toHaveBeenCalledWith(
                "Failed to check response time support",
                mockError
            );
        });

        it("should handle different monitor types", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(true);

            const { rerender } = render(
                <ConditionalResponseTime {...defaultProps} monitorType="http" />
            );

            await waitFor(() => {
                expect(screen.getByTestId("children")).toBeInTheDocument();
            });

            // Change monitor type
            rerender(
                <ConditionalResponseTime {...defaultProps} monitorType="port" />
            );

            expect(supportsResponseTime).toHaveBeenCalledWith("port");
        });

        it("should handle component unmounting during async operation", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            let resolvePromise: (value: boolean) => void;
            const promise = new Promise<boolean>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(supportsResponseTime).mockReturnValue(promise);

            const { unmount } = render(
                <ConditionalResponseTime {...defaultProps} />
            );

            // Unmount before promise resolves
            unmount();

            // Now resolve the promise
            resolvePromise!(true);

            // Should not cause any errors or state updates
            await promise;

            // Verify that the component was properly unmounted without errors
            expect(supportsResponseTime).toHaveBeenCalled();
        });

        it("should handle fallback prop being undefined", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(false);

            render(
                <ConditionalResponseTime
                    monitorType="http"
                    children={<div data-testid="children">Content</div>}
                />
            );

            await waitFor(() => {
                expect(
                    screen.queryByTestId("children")
                ).not.toBeInTheDocument();
            });

            // Should render nothing when no fallback and not supported
        });

        it("should work with port monitor type", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(false);

            render(
                <ConditionalResponseTime {...defaultProps} monitorType="port" />
            );

            await waitFor(() => {
                expect(supportsResponseTime).toHaveBeenCalledWith("port");
            });
        });

        it("should work with ping monitor type", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            vi.mocked(supportsResponseTime).mockResolvedValue(false);

            render(
                <ConditionalResponseTime {...defaultProps} monitorType="ping" />
            );

            await waitFor(() => {
                expect(supportsResponseTime).toHaveBeenCalledWith("ping");
            });
        });
    });

    describe(DetailLabel, () => {
        const defaultProps = {
            monitorType: "http" as MonitorType,
            details: "example.com",
            fallback: "Unknown host",
        };

        it("should display fallback initially then formatted label", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Initialization", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Initialization", "type");

            vi.mocked(formatMonitorDetail).mockResolvedValue(
                "https://example.com"
            );

            render(<DetailLabel {...defaultProps} />);

            // Should show fallback initially
            expect(screen.getByText("Unknown host")).toBeInTheDocument();

            // Should show formatted label after async operation
            await waitFor(() => {
                expect(
                    screen.getByText("https://example.com")
                ).toBeInTheDocument();
            });

            expect(screen.queryByText("Unknown host")).not.toBeInTheDocument();
        });

        it("should use details as fallback when no fallback prop provided", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(formatMonitorDetail).mockResolvedValue(
                "formatted result"
            );

            render(<DetailLabel monitorType="http" details="example.com" />);

            // Should show details as initial fallback
            expect(screen.getByText("example.com")).toBeInTheDocument();

            // Should show formatted result after async operation
            await waitFor(() => {
                expect(
                    screen.getByText("formatted result")
                ).toBeInTheDocument();
            });
        });

        it("should show fallback when formatMonitorDetail throws error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockError = new Error("Failed to format");
            vi.mocked(formatMonitorDetail).mockRejectedValue(mockError);

            render(<DetailLabel {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText("Unknown host")).toBeInTheDocument();
            });

            expect(logger.warn).toHaveBeenCalledWith(
                "Failed to format detail label",
                mockError
            );
        });

        it("should handle different monitor types", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            vi.mocked(formatMonitorDetail).mockResolvedValue("port:80");

            render(<DetailLabel {...defaultProps} monitorType="port" />);

            await waitFor(() => {
                expect(formatMonitorDetail).toHaveBeenCalledWith(
                    "port",
                    "example.com"
                );
            });
        });

        it("should handle component unmounting during async operation", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            let resolvePromise: (value: string) => void;
            const promise = new Promise<string>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(formatMonitorDetail).mockReturnValue(promise);

            const { unmount } = render(<DetailLabel {...defaultProps} />);

            // Unmount before promise resolves
            unmount();

            // Now resolve the promise
            resolvePromise!("formatted result");

            // Should not cause any errors or state updates
            await promise;

            // Verify that the component was properly unmounted without errors
            expect(formatMonitorDetail).toHaveBeenCalled();
        });

        it("should handle prop changes", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(formatMonitorDetail)
                .mockResolvedValueOnce("first result")
                .mockResolvedValueOnce("second result");

            const { rerender } = render(<DetailLabel {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText("first result")).toBeInTheDocument();
            });

            // Change props
            rerender(<DetailLabel {...defaultProps} details="different.com" />);

            await waitFor(() => {
                expect(formatMonitorDetail).toHaveBeenCalledWith(
                    "http",
                    "different.com"
                );
            });
        });

        it("should handle empty details", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            vi.mocked(formatMonitorDetail).mockResolvedValue("");

            render(
                <DetailLabel monitorType="http" details="" fallback="Empty" />
            );

            await waitFor(() => {
                expect(formatMonitorDetail).toHaveBeenCalledWith("http", "");
            });
        });

        it("should update when monitorType changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            vi.mocked(formatMonitorDetail)
                .mockResolvedValueOnce("http formatted")
                .mockResolvedValueOnce("port formatted");

            const { rerender } = render(<DetailLabel {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText("http formatted")).toBeInTheDocument();
            });

            // Change monitor type
            rerender(<DetailLabel {...defaultProps} monitorType="port" />);

            await waitFor(() => {
                expect(formatMonitorDetail).toHaveBeenCalledWith(
                    "port",
                    "example.com"
                );
            });

            await waitFor(() => {
                expect(screen.getByText("port formatted")).toBeInTheDocument();
            });
        });

        it("should handle very long details string", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorUiComponents", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const longDetails = "a".repeat(1000);
            vi.mocked(formatMonitorDetail).mockResolvedValue(
                "formatted long string"
            );

            render(
                <DetailLabel
                    monitorType="http"
                    details={longDetails}
                    fallback="Loading..."
                />
            );

            await waitFor(() => {
                expect(formatMonitorDetail).toHaveBeenCalledWith(
                    "http",
                    longDetails
                );
            });

            await waitFor(() => {
                expect(
                    screen.getByText("formatted long string")
                ).toBeInTheDocument();
            });
        });
    });
});

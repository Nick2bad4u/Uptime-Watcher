/**
 * Tests for DynamicMonitorFields component. Tests dynamic form field generation
 * based on monitor type configuration.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import DynamicMonitorFields from "../../../components/AddSiteForm/DynamicMonitorFields";
import logger from "../../../services/logger";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";

// Mock the monitor types store
vi.mock("../../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: vi.fn(),
}));

// Mock logger
vi.mock("../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("DynamicMonitorFields", () => {
    const defaultProps = {
        monitorType: "http",
        values: { url: "https://example.com", timeout: 5000 },
        onChange: {
            url: vi.fn(),
            timeout: vi.fn(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation
        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            label: "URL",
                            type: "text",
                            required: true,
                            placeholder: "https://example.com",
                        },
                        {
                            name: "timeout",
                            label: "Timeout",
                            type: "number",
                            required: false,
                            defaultValue: 5000,
                        },
                    ],
                },
            ],
            isLoaded: true,
            lastError: null,
            loadMonitorTypes: vi.fn(),
            // Add other required properties
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });
    });

    it("should render dynamic fields based on monitor type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

        render(<DynamicMonitorFields {...defaultProps} />);

        expect(screen.getByLabelText("URL (required)")).toBeInTheDocument();
        expect(screen.getByLabelText("Timeout")).toBeInTheDocument();
    });

    it("should handle loading state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [],
            isLoaded: false,
            lastError: null,
            loadMonitorTypes: vi.fn(),
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        expect(
            screen.getByText("Loading monitor fields...")
        ).toBeInTheDocument();
    });

    it("should handle error state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [],
            isLoaded: true,
            lastError: "Failed to load configuration",
            loadMonitorTypes: vi.fn(),
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        expect(
            screen.getByText(
                "Error loading monitor fields: Failed to load configuration"
            )
        ).toBeInTheDocument();
    });

    it("should handle unknown monitor type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [
                {
                    type: "port",
                    fields: [],
                },
            ],
            isLoaded: true,
            lastError: null,
            loadMonitorTypes: vi.fn(),
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        expect(
            screen.getByText("Unknown monitor type: http")
        ).toBeInTheDocument();
    });

    it("should call loadMonitorTypes when not loaded and no error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        const loadMonitorTypesMock = vi.fn();

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [],
            isLoaded: false,
            lastError: null,
            loadMonitorTypes: loadMonitorTypesMock,
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        expect(loadMonitorTypesMock).toHaveBeenCalledTimes(1);
    });

    it("should handle missing onChange handler and log error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Use props without onChange handler for one field
        const propsWithMissingHandler = {
            monitorType: "http",
            values: { url: "https://example.com", timeout: 5000 },
            onChange: {
                // Missing timeout handler intentionally
                url: vi.fn(),
            },
        };

        render(<DynamicMonitorFields {...propsWithMissingHandler} />);

        // Verify that the error logger was called for missing handler
        expect(logger.error).toHaveBeenCalledWith(
            "Missing onChange handler for field: timeout"
        );
    });

    it("should use default values for fields with no values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        const propsWithMissingValues = {
            monitorType: "http",
            values: {}, // No values provided
            onChange: {
                url: vi.fn(),
                timeout: vi.fn(),
            },
        };

        render(<DynamicMonitorFields {...propsWithMissingValues} />);

        // Check that fields are rendered with default values
        const urlField = screen.getByDisplayValue("");
        const timeoutField = screen.getByDisplayValue("0");

        expect(urlField).toBeInTheDocument();
        expect(timeoutField).toBeInTheDocument();
    });

    it("should use defaultOnChange when no onChange handler provided", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        // Props with no onChange handlers
        const propsWithNoHandlers = {
            monitorType: "http",
            values: { url: "https://example.com", timeout: 5000 },
            onChange: {}, // No onChange handlers
        };

        render(<DynamicMonitorFields {...propsWithNoHandlers} />);

        // Both fields should use defaultOnChange which logs errors
        expect(logger.error).toHaveBeenCalledWith(
            "Missing onChange handler for field: url"
        );
        expect(logger.error).toHaveBeenCalledWith(
            "Missing onChange handler for field: timeout"
        );
    });

    it("should render fields with isLoading disabled state", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

        const propsWithLoading = {
            ...defaultProps,
            isLoading: true,
        };

        render(<DynamicMonitorFields {...propsWithLoading} />);

        // Check that fields are disabled when loading
        const urlField = screen.getByLabelText("URL (required)");
        const timeoutField = screen.getByLabelText("Timeout");

        expect(urlField).toBeDisabled();
        expect(timeoutField).toBeDisabled();
    });

    it("should not call loadMonitorTypes when already loaded", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

        const loadMonitorTypesMock = vi.fn();

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [
                {
                    type: "http",
                    fields: [
                        {
                            name: "url",
                            label: "URL",
                            type: "text",
                            required: true,
                            placeholder: "https://example.com",
                        },
                    ],
                },
            ],
            isLoaded: true, // Already loaded
            lastError: null,
            loadMonitorTypes: loadMonitorTypesMock,
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        // Should not call loadMonitorTypes when already loaded
        expect(loadMonitorTypesMock).not.toHaveBeenCalled();
    });

    it("should not call loadMonitorTypes when there is an error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicMonitorFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        const loadMonitorTypesMock = vi.fn();

        vi.mocked(useMonitorTypesStore).mockReturnValue({
            monitorTypes: [],
            isLoaded: false,
            lastError: "Some error", // Has error
            loadMonitorTypes: loadMonitorTypesMock,
            getMonitorTypeConfig: vi.fn(),
            validateMonitorData: vi.fn(),
            validateMonitorField: vi.fn(),
            formatMonitorDetail: vi.fn(),
            getTitleSuffix: vi.fn(),
            clearError: vi.fn(),
        });

        render(<DynamicMonitorFields {...defaultProps} />);

        // Should not call loadMonitorTypes when there is an error
        expect(loadMonitorTypesMock).not.toHaveBeenCalled();
    });
});

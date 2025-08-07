/**
 * Tests for DynamicMonitorFields component.
 * Tests dynamic form field generation based on monitor type configuration.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { DynamicMonitorFields } from "../../../components/AddSiteForm/DynamicMonitorFields";
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
                            key: "url",
                            label: "URL",
                            type: "text",
                            required: true,
                            placeholder: "https://example.com",
                        },
                        {
                            key: "timeout",
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

    it("should render dynamic fields based on monitor type", () => {
        render(<DynamicMonitorFields {...defaultProps} />);

        expect(screen.getByLabelText("URL (required)")).toBeInTheDocument();
        expect(screen.getByLabelText("Timeout")).toBeInTheDocument();
    });

    it("should handle loading state", () => {
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

        expect(screen.getByText("Loading monitor fields...")).toBeInTheDocument();
    });

    it("should handle error state", () => {
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

        expect(screen.getByText("Error loading monitor fields: Failed to load configuration")).toBeInTheDocument();
    });

    it("should handle unknown monitor type", () => {
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

        expect(screen.getByText("Unknown monitor type: http")).toBeInTheDocument();
    });
});

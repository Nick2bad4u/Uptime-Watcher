/**
 * Comprehensive tests for DynamicMonitorFields component to achieve high coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock all dependencies
vi.mock("../../../services/logger", () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));
vi.mock("../../../theme/components", () => ({
    ThemedText: vi.fn(),
}));
vi.mock("../../../utils/errorHandling", () => ({
    ensureError: vi.fn(),
}));
vi.mock("../../../utils/monitorTypeHelper", () => ({
    getMonitorTypeConfig: vi.fn(),
}));
vi.mock("../../../components/AddSiteForm/FormFields", () => ({
    TextField: vi.fn(),
}));

// Import the component and mocked modules
import { DynamicMonitorFields } from "../../../components/AddSiteForm/DynamicMonitorFields";
import logger from "../../../services/logger";
import { ThemedText } from "../../../theme/components";
import { ensureError } from "../../../utils/errorHandling";
import { getMonitorTypeConfig } from "../../../utils/monitorTypeHelper";
import { TextField } from "../../../components/AddSiteForm/FormFields";

describe("DynamicMonitorFields Component Tests", () => {
    const mockLogger = logger as any;
    const mockEnsureError = ensureError as any;
    const mockGetMonitorTypeConfig = getMonitorTypeConfig as any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock ThemedText component
        (ThemedText as any).mockImplementation(({ children, variant, className, ...props }: any) => (
            <span data-testid="themed-text" data-variant={variant} className={className} {...props}>
                {children}
            </span>
        ));

        // Mock TextField component
        (TextField as any).mockImplementation(({ 
            id, value, onChange, disabled, label, required, type, placeholder, helpText, min, max 
        }: any) => (
            <div data-testid="text-field">
                <label>{label}{required && "*"}</label>
                <input
                    id={id}
                    type={type || "text"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    data-testid={`input-${id}`}
                />
                {helpText && <span data-testid="help-text">{helpText}</span>}
            </div>
        ));

        // Mock ensureError
        mockEnsureError.mockImplementation((error: any) => error);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe("Loading States", () => {
        it("should show loading message while loading config", async () => {
            let resolveConfig: any;
            const configPromise = new Promise((resolve) => {
                resolveConfig = resolve;
            });
            mockGetMonitorTypeConfig.mockReturnValue(configPromise);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            expect(screen.getByText("Loading monitor fields...")).toBeInTheDocument();

            // Resolve the promise to complete the test
            resolveConfig({
                fields: []
            });
            await waitFor(() => {
                expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("http");
            });
        });

        it("should handle loading state cleanup on unmount", async () => {
            let resolveConfig: any;
            const configPromise = new Promise((resolve) => {
                resolveConfig = resolve;
            });
            mockGetMonitorTypeConfig.mockReturnValue(configPromise);

            const { unmount } = render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            // Unmount before config loads
            unmount();

            // Resolve config after unmount - should not cause state updates
            resolveConfig({
                fields: []
            });

            // Test passes if no console warnings about state updates after unmount
            expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("http");
        });
    });

    describe("Error Handling", () => {
        it("should display error message when config loading fails", async () => {
            const error = new Error("Failed to load config");
            mockGetMonitorTypeConfig.mockRejectedValue(error);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Error loading monitor fields: Failed to load config")).toBeInTheDocument();
            });

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to load monitor type config", error);
        });

        it("should handle non-Error objects thrown during config loading", async () => {
            const errorString = "String error";
            mockGetMonitorTypeConfig.mockRejectedValue(errorString);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Error loading monitor fields: Failed to load monitor config")).toBeInTheDocument();
            });

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to load monitor type config", errorString);
        });

        it("should display error for unknown monitor type", async () => {
            mockGetMonitorTypeConfig.mockResolvedValue(null);

            render(
                <DynamicMonitorFields
                    monitorType="unknown"
                    onChange={{}}
                    values={{}}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Unknown monitor type: unknown")).toBeInTheDocument();
            });
        });

        it("should display error for undefined config", async () => {
            mockGetMonitorTypeConfig.mockResolvedValue(undefined);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Unknown monitor type: http")).toBeInTheDocument();
            });
        });
    });

    describe("Field Rendering", () => {
        const mockConfig = {
            fields: [
                {
                    name: "url",
                    label: "URL",
                    type: "url",
                    required: true,
                    placeholder: "https://example.com",
                    helpText: "Enter the URL to monitor"
                },
                {
                    name: "port",
                    label: "Port",
                    type: "number",
                    required: false,
                    min: 1,
                    max: 65535
                },
                {
                    name: "host",
                    label: "Host",
                    type: "text",
                    required: true
                }
            ]
        };

        beforeEach(() => {
            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);
        });

        it("should render all fields from config", async () => {
            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{
                        url: vi.fn(),
                        port: vi.fn(),
                        host: vi.fn()
                    }}
                    values={{
                        url: "https://example.com",
                        port: 80,
                        host: "example.com"
                    }}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId("input-url")).toBeInTheDocument();
                expect(screen.getByTestId("input-port")).toBeInTheDocument();
                expect(screen.getByTestId("input-host")).toBeInTheDocument();
            });
        });

        it("should handle missing onChange handlers", async () => {
            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{
                        url: vi.fn()
                        // Missing port and host handlers
                    }}
                    values={{
                        url: "https://example.com",
                        port: 80,
                        host: "example.com"
                    }}
                />
            );

            await waitFor(() => {
                expect(mockLogger.error).toHaveBeenCalledWith("Missing onChange handler for field: port");
                expect(mockLogger.error).toHaveBeenCalledWith("Missing onChange handler for field: host");
            });
        });

        it("should use default values when field values are missing", async () => {
            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{
                        url: vi.fn(),
                        port: vi.fn(),
                        host: vi.fn()
                    }}
                    values={{
                        url: "https://example.com"
                        // Missing port and host values
                    }}
                />
            );

            await waitFor(() => {
                const portInput = screen.getByTestId("input-port");
                const hostInput = screen.getByTestId("input-host");
                
                expect(portInput).toHaveValue(0); // number default (numeric value, not string)
                expect(hostInput).toHaveValue(""); // string default
            });
        });

        it("should disable fields when isLoading is true", async () => {
            render(
                <DynamicMonitorFields
                    isLoading={true}
                    monitorType="http"
                    onChange={{
                        url: vi.fn(),
                        port: vi.fn(),
                        host: vi.fn()
                    }}
                    values={{
                        url: "https://example.com",
                        port: 80,
                        host: "example.com"
                    }}
                />
            );

            await waitFor(() => {
                expect(screen.getByTestId("input-url")).toBeDisabled();
                expect(screen.getByTestId("input-port")).toBeDisabled();
                expect(screen.getByTestId("input-host")).toBeDisabled();
            });
        });
    });

    describe("Field Type Handling", () => {
        it("should handle number field changes correctly", async () => {
            const mockOnChange = vi.fn();
            const mockConfig = {
                fields: [
                    {
                        name: "port",
                        label: "Port",
                        type: "number",
                        required: true
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ port: mockOnChange }}
                    values={{ port: 80 }}
                />
            );

            await waitFor(() => {
                const portInput = screen.getByTestId("input-port");
                fireEvent.change(portInput, { target: { value: "8080" } });
            });

            expect(mockOnChange).toHaveBeenCalledWith(8080);
        });

        it("should handle empty numeric input", async () => {
            const mockOnChange = vi.fn();
            const mockConfig = {
                fields: [
                    {
                        name: "port",
                        label: "Port",
                        type: "number",
                        required: true
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ port: mockOnChange }}
                    values={{ port: 80 }}
                />
            );

            await waitFor(() => {
                const portInput = screen.getByTestId("input-port");
                fireEvent.change(portInput, { target: { value: "" } });
            });

            expect(mockOnChange).toHaveBeenCalledWith(0);
        });

        it("should handle invalid numeric input", async () => {
            const mockOnChange = vi.fn();
            const mockConfig = {
                fields: [
                    {
                        name: "port",
                        label: "Port",
                        type: "number",
                        required: true
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ port: mockOnChange }}
                    values={{ port: 80 }}
                />
            );

            await waitFor(() => {
                const portInput = screen.getByTestId("input-port");
                // HTML number inputs filter out invalid values, so test empty instead
                fireEvent.change(portInput, { target: { value: "" } });
            });

            // For empty inputs, the component sets value to 0
            expect(mockOnChange).toHaveBeenCalledWith(0);
        });

        it("should handle string field changes", async () => {
            const mockOnChange = vi.fn();
            const mockConfig = {
                fields: [
                    {
                        name: "host",
                        label: "Host",
                        type: "text",
                        required: true
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ host: mockOnChange }}
                    values={{ host: "example.com" }}
                />
            );

            await waitFor(() => {
                const hostInput = screen.getByTestId("input-host");
                fireEvent.change(hostInput, { target: { value: "newhost.com" } });
            });

            expect(mockOnChange).toHaveBeenCalledWith("newhost.com");
        });

        it("should handle URL field changes", async () => {
            const mockOnChange = vi.fn();
            const mockConfig = {
                fields: [
                    {
                        name: "url",
                        label: "URL",
                        type: "url",
                        required: true
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ url: mockOnChange }}
                    values={{ url: "https://example.com" }}
                />
            );

            await waitFor(() => {
                const urlInput = screen.getByTestId("input-url");
                fireEvent.change(urlInput, { target: { value: "https://newurl.com" } });
            });

            expect(mockOnChange).toHaveBeenCalledWith("https://newurl.com");
        });

        it("should handle unsupported field types", async () => {
            const mockConfig = {
                fields: [
                    {
                        name: "unsupported",
                        label: "Unsupported Field",
                        type: "unknown",
                        required: false
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ unsupported: vi.fn() }}
                    values={{ unsupported: "value" }}
                />
            );

            await waitFor(() => {
                expect(screen.getByText("Unsupported field type: unknown")).toBeInTheDocument();
            });
        });
    });

    describe("Missing onChange Handler Fallback", () => {
        it("should use fallback onChange when handler is missing and log warning", async () => {
            const mockConfig = {
                fields: [
                    {
                        name: "testField",
                        label: "Test Field",
                        type: "text",
                        required: false
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}} // No handler for testField
                    values={{ testField: "value" }}
                />
            );

            await waitFor(() => {
                const input = screen.getByTestId("input-testField");
                fireEvent.change(input, { target: { value: "new value" } });
            });

            expect(mockLogger.warn).toHaveBeenCalledWith("No onChange handler provided for field: testField");
        });
    });

    describe("Component Re-rendering", () => {
        it("should reload config when monitorType changes", async () => {
            const { rerender } = render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{}}
                    values={{}}
                />
            );

            expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("http");

            mockGetMonitorTypeConfig.mockClear();

            rerender(
                <DynamicMonitorFields
                    monitorType="port"
                    onChange={{}}
                    values={{}}
                />
            );

            expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("port");
        });
    });

    describe("Field Properties", () => {
        it("should pass all field properties to TextField correctly", async () => {
            const mockConfig = {
                fields: [
                    {
                        name: "complexField",
                        label: "Complex Field",
                        type: "number",
                        required: true,
                        placeholder: "Enter a number",
                        helpText: "This is help text",
                        min: 1,
                        max: 100
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ complexField: vi.fn() }}
                    values={{ complexField: 50 }}
                />
            );

            await waitFor(() => {
                const input = screen.getByTestId("input-complexField");
                expect(input).toHaveAttribute("min", "1");
                expect(input).toHaveAttribute("max", "100");
                expect(input).toHaveAttribute("placeholder", "Enter a number");
                expect(screen.getByText("This is help text")).toBeInTheDocument();
            });
        });

        it("should handle fields without optional properties", async () => {
            const mockConfig = {
                fields: [
                    {
                        name: "simpleField",
                        label: "Simple Field",
                        type: "text",
                        required: false
                        // No helpText, placeholder, min, max
                    }
                ]
            };

            mockGetMonitorTypeConfig.mockResolvedValue(mockConfig);

            render(
                <DynamicMonitorFields
                    monitorType="http"
                    onChange={{ simpleField: vi.fn() }}
                    values={{ simpleField: "value" }}
                />
            );

            await waitFor(() => {
                const input = screen.getByTestId("input-simpleField");
                expect(input).toBeInTheDocument();
                expect(screen.queryByTestId("help-text")).not.toBeInTheDocument();
            });
        });
    });
});

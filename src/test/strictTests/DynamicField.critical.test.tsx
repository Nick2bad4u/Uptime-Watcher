/**
 * Comprehensive coverage tests for DynamicField component to reach 95%+
 * coverage.
 *
 * This test file specifically targets uncovered lines and edge cases:
 *
 * - Line 136-137: Unsupported field type error handling
 * - Line 175-190: Various field type branches and conditional rendering
 * - Numeric field edge cases with invalid input
 * - Select field option handling
 * - Conditional prop spreading (helpText, placeholder, min, max)
 * - URL field type handling
 * - Disabled state handling across all field types
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";

import type { MonitorFieldDefinition } from "../../../shared/types";

import { logger } from "../../services/logger";
import { ThemeProvider } from "../../theme/components/ThemeProvider";
import { DynamicField } from "../../components/AddSiteForm/DynamicField";

// Mock the logger
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

const mockLogger = vi.mocked(logger);

describe("DynamicField - Comprehensive Coverage", () => {
    const renderWithTheme = (component: React.ReactElement) =>
        render(<ThemeProvider>{component}</ThemeProvider>);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Number Field Type Coverage", () => {
        it("should render number field with all conditional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port Number",
                type: "number",
                required: true,
                helpText: "Enter a valid port number",
                placeholder: "e.g. 8080",
                min: 1,
                max: 65_535,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={8080}
                    disabled={false}
                />
            );

            const input = screen.getByLabelText("Port Number (required)");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "number");
            expect(input).toHaveAttribute("min", "1");
            expect(input).toHaveAttribute("max", "65535");
            expect(input).toHaveAttribute("placeholder", "e.g. 8080");
            expect(input).toHaveValue(8080);
        });

        it("should handle number field without optional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "timeout",
                label: "Timeout",
                type: "number",
                required: false,
                // No helpText, placeholder, min, max
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={5000}
                />
            );

            const input = screen.getByLabelText("Timeout");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "number");
            expect(input).not.toHaveAttribute("min");
            expect(input).not.toHaveAttribute("max");
            expect(input).not.toHaveAttribute("placeholder");
        });

        it("should handle invalid numeric input and log error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port",
                type: "number",
                required: true,
            };

            const mockOnChange = vi.fn();

            // Mock logger.error to verify it gets called
            const loggerErrorSpy = vi.fn();
            mockLogger.error.mockImplementation(loggerErrorSpy);

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={0}
                />
            );

            const input = screen.getByLabelText(
                "Port (required)"
            ) as HTMLInputElement;

            // Directly test the onChange handler by dispatching an event with invalid value
            // This simulates what would happen if invalid text somehow reached the handler
            Object.defineProperty(input, "value", {
                value: "123abc",
                writable: true,
                configurable: true,
            });

            const changeEvent = new Event("change", { bubbles: true });
            input.dispatchEvent(changeEvent);

            // Verify that the logger was called for invalid input
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                "Invalid numeric input: 123abc"
            );
        });

        it("should handle empty string input for number field", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Input Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port",
                type: "number",
                required: true,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={8080}
                />
            );

            const input = screen.getByLabelText("Port (required)");
            const user = userEvent.setup();

            // Clear input (empty string case)
            await user.clear(input);

            // Should call onChange with 0 for empty string
            expect(mockOnChange).toHaveBeenCalledWith(0);
        });
    });

    describe("Select Field Type Coverage", () => {
        it("should render select field with options", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "method",
                label: "HTTP Method",
                type: "select",
                required: true,
                helpText: "Choose HTTP method",
                placeholder: "Select method",
                options: [
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                    { value: "PUT", label: "PUT" },
                ],
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="GET"
                />
            );

            const select = screen.getByLabelText("HTTP Method (required)");
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue("GET");
        });

        it("should handle select field without optional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "status",
                label: "Status",
                type: "select",
                required: false,
                options: [
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                ],
                // No helpText, placeholder
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="active"
                />
            );

            const select = screen.getByLabelText("Status");
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue("active");
        });

        it("should handle select field with empty options array", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Edge Cases", "type");

            const mockField: MonitorFieldDefinition = {
                name: "empty",
                label: "Empty Options",
                type: "select",
                required: false,
                options: [], // Empty options
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            const select = screen.getByLabelText("Empty Options");
            expect(select).toBeInTheDocument();
        });

        it("should handle select field with undefined options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Edge Cases", "type");

            const mockField: MonitorFieldDefinition = {
                name: "undefined_options",
                label: "Undefined Options",
                type: "select",
                required: false,
                // options is undefined
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            const select = screen.getByLabelText("Undefined Options");
            expect(select).toBeInTheDocument();
        });
    });

    describe("Text Field Type Coverage", () => {
        it("should render text field with all conditional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "hostname",
                label: "Hostname",
                type: "text",
                required: true,
                helpText: "Enter hostname or IP address",
                placeholder: "example.com",
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="localhost"
                />
            );

            const input = screen.getByLabelText("Hostname (required)");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "text");
            expect(input).toHaveAttribute("placeholder", "example.com");
            expect(input).toHaveValue("localhost");
        });

        it("should render text field without optional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "name",
                label: "Name",
                type: "text",
                required: false,
                // No helpText, placeholder
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            const input = screen.getByLabelText("Name");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "text");
            expect(input).not.toHaveAttribute("placeholder");
        });
    });

    describe("URL Field Type Coverage", () => {
        it("should render URL field with all conditional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "endpoint",
                label: "Endpoint URL",
                type: "url",
                required: true,
                helpText: "Enter the full URL",
                placeholder: "https://example.com/api",
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="https://api.example.com"
                />
            );

            const input = screen.getByLabelText("Endpoint URL (required)");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "url");
            expect(input).toHaveAttribute(
                "placeholder",
                "https://example.com/api"
            );
            expect(input).toHaveValue("https://api.example.com");
        });

        it("should render URL field without optional props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Field Rendering", "type");

            const mockField: MonitorFieldDefinition = {
                name: "webhook",
                label: "Webhook URL",
                type: "url",
                required: false,
                // No helpText, placeholder
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            const input = screen.getByLabelText("Webhook URL");
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute("type", "url");
            expect(input).not.toHaveAttribute("placeholder");
        });
    });

    describe("Unsupported Field Type Coverage", () => {
        it("should display error message for unsupported field type", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "invalid",
                label: "Invalid Field",
                type: "checkbox" as any, // Unsupported type
                required: false,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            // Should render error message for unsupported type
            expect(
                screen.getByText("Unsupported field type: checkbox")
            ).toBeInTheDocument();

            // Should not call onChange
            expect(mockOnChange).not.toHaveBeenCalled();
        });

        it("should handle completely invalid field type", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "invalid",
                label: "Invalid Field",
                type: "some-random-type" as any, // Completely invalid type
                required: false,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            // Should render error message
            expect(
                screen.getByText("Unsupported field type: some-random-type")
            ).toBeInTheDocument();
        });
    });

    describe("Disabled State Coverage", () => {
        it("should handle disabled number field", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Disabled State", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port",
                type: "number",
                required: true,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={8080}
                    disabled={true}
                />
            );

            const input = screen.getByLabelText("Port (required)");
            expect(input).toBeDisabled();
        });

        it("should handle disabled select field", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Disabled State", "type");

            const mockField: MonitorFieldDefinition = {
                name: "method",
                label: "Method",
                type: "select",
                required: true,
                options: [
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                ],
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="GET"
                    disabled={true}
                />
            );

            const select = screen.getByLabelText("Method (required)");
            expect(select).toBeDisabled();
        });

        it("should handle disabled text field", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Disabled State", "type");

            const mockField: MonitorFieldDefinition = {
                name: "hostname",
                label: "Hostname",
                type: "text",
                required: true,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="example.com"
                    disabled={true}
                />
            );

            const input = screen.getByLabelText("Hostname (required)");
            expect(input).toBeDisabled();
        });

        it("should handle disabled URL field", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Disabled State", "type");

            const mockField: MonitorFieldDefinition = {
                name: "endpoint",
                label: "Endpoint",
                type: "url",
                required: true,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="https://example.com"
                    disabled={true}
                />
            );

            const input = screen.getByLabelText("Endpoint (required)");
            expect(input).toBeDisabled();
        });
    });

    describe("Callback and Event Handling Coverage", () => {
        it("should trigger onChange for text field input", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "hostname",
                label: "Hostname",
                type: "text",
                required: false,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value=""
                />
            );

            const input = screen.getByLabelText("Hostname");
            const user = userEvent.setup();

            await user.type(input, "test");

            // Should call onChange for each character - verify multiple calls were made
            expect(mockOnChange).toHaveBeenCalled();
            expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);

            // Check that calls contain individual characters as expected from userEvent.type()
            const calls = mockOnChange.mock.calls;
            expect(calls.some((call) => call[0] === "t")).toBeTruthy(); // Contains 't'
            expect(calls.some((call) => call[0] === "e")).toBeTruthy(); // Contains 'e'
            expect(calls.some((call) => call[0] === "s")).toBeTruthy(); // Contains 's'
        });

        it("should trigger onChange for select field change", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "method",
                label: "Method",
                type: "select",
                required: false,
                options: [
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                ],
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="GET"
                />
            );

            const select = screen.getByLabelText("Method");
            const user = userEvent.setup();

            await user.selectOptions(select, "POST");

            // Should call onChange with new selection
            expect(mockOnChange).toHaveBeenCalledWith("POST");
        });

        it("should trigger onChange for number field with valid input", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Handling", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port",
                type: "number",
                required: false,
            };

            const mockOnChange = vi.fn();

            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value={0}
                />
            );

            const input = screen.getByLabelText("Port");
            const user = userEvent.setup();

            await user.clear(input);
            await user.type(input, "8080");

            // Should call onChange - verify it was called and with numeric values
            expect(mockOnChange).toHaveBeenCalled();
            expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);

            // Verify that calls contain numeric values and eventually the complete number
            const calls = mockOnChange.mock.calls;
            expect(
                calls.some((call) => typeof call[0] === "number")
            ).toBeTruthy(); // Contains numeric values
            expect(
                calls.some(
                    (call) =>
                        call[0] === 8080 ||
                        call[0] === 808 ||
                        call[0] === 80 ||
                        call[0] === 8
                )
            ).toBeTruthy(); // Contains progression
        });
    });

    describe("Edge Cases and Boundary Conditions", () => {
        it("should handle numeric field with value type conversion", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Type Conversion", "type");

            const mockField: MonitorFieldDefinition = {
                name: "port",
                label: "Port",
                type: "number",
                required: false,
            };

            const mockOnChange = vi.fn();

            // Test with string value that should be converted
            renderWithTheme(
                <DynamicField
                    field={mockField}
                    onChange={mockOnChange}
                    value="8080" // String value
                />
            );

            const input = screen.getByLabelText("Port");
            expect(input).toHaveValue(8080); // Should display as number
        });

        it("should handle all field types with default disabled=false", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DynamicField.comprehensive", "component");
            annotate("Category: Component", "category");
            annotate("Type: Default Props", "type");

            const fields = [
                { type: "number" as const, value: 123 },
                { type: "text" as const, value: "test" },
                { type: "url" as const, value: "https://example.com" },
                {
                    type: "select" as const,
                    value: "option1",
                    options: [{ value: "option1", label: "Option 1" }],
                },
            ];

            for (const [index, fieldData] of fields.entries()) {
                const mockField: MonitorFieldDefinition = {
                    name: `field${index}`,
                    label: `Field ${index}`,
                    type: fieldData.type,
                    required: false,
                    ...("options" in fieldData
                        ? { options: fieldData.options }
                        : {}),
                };

                const mockOnChange = vi.fn();

                // Don't pass disabled prop (should default to false)
                const { unmount } = renderWithTheme(
                    <DynamicField
                        field={mockField}
                        onChange={mockOnChange}
                        value={fieldData.value}
                    />
                );

                const input = screen.getByLabelText(`Field ${index}`);
                expect(input).not.toBeDisabled();

                unmount();
            }
        });
    });
});

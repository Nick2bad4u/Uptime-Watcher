/**
 * Tests for FormFields components.
 * Validates form field wrappers, text fields, select fields, and radio groups.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormField, TextField, SelectField, RadioGroup } from "../components/AddSiteForm/FormFields";

// Mock theme components
vi.mock("../theme/components", () => ({
    ThemedInput: ({ className, ...props }: any) => <input className={className} {...props} />,
    ThemedSelect: ({ children, className, ...props }: any) => (
        <select className={className} {...props}>
            {children}
        </select>
    ),
    ThemedText: ({ children, className, size, variant, weight, ...props }: any) => (
        <span className={`${className} ${size} ${variant} ${weight}`} {...props}>
            {children}
        </span>
    ),
}));

describe("FormFields", () => {
    describe("FormField", () => {
        it("should render with label and children", () => {
            render(
                <FormField id="test-field-1" label="Test Label">
                    <input type="text" id="test-field-1" title="Test Label" />
                </FormField>
            );

            expect(screen.getByText("Test Label")).toBeInTheDocument();
            expect(screen.getByRole("textbox")).toBeInTheDocument();
        });

        it("should show required indicator when required", () => {
            render(
                <FormField id="test-field-2" label="Test Label" required>
                    <input type="text" id="test-field-2" title="Test Label (required)" />
                </FormField>
            );

            expect(screen.getByText("Test Label *")).toBeInTheDocument();
        });

        it("should display error message", () => {
            render(
                <FormField id="test-field-3" label="Test Label" error="This field is required">
                    <input type="text" id="test-field-3" title="Test Label" />
                </FormField>
            );

            expect(screen.getByText("This field is required")).toBeInTheDocument();
            expect(screen.getByText("This field is required")).toHaveClass("error");
        });

        it("should display help text when no error", () => {
            render(
                <FormField id="test-field-4" label="Test Label" helpText="This is help text">
                    <input type="text" id="test-field-4" title="Test Label" />
                </FormField>
            );

            expect(screen.getByText("This is help text")).toBeInTheDocument();
            expect(screen.getByText("This is help text")).toHaveClass("tertiary");
        });

        it("should prioritize error over help text", () => {
            render(
                <FormField 
                    id="test-field-5" 
                    label="Test Label" 
                    error="Error message"
                    helpText="Help text"
                >
                    <input type="text" id="test-field-5" title="Test Label" />
                </FormField>
            );

            expect(screen.getByText("Error message")).toBeInTheDocument();
            expect(screen.queryByText("Help text")).not.toBeInTheDocument();
        });

        it("should have proper label association", () => {
            render(
                <FormField id="test-field-6" label="Test Label">
                    <input type="text" id="test-field-6" title="Test Label" />
                </FormField>
            );

            const label = screen.getByText(/Test Label/).closest("label");
            expect(label).toHaveAttribute("for", "test-field-6");
        });
    });

    describe("TextField", () => {
        const mockOnChange = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should render with basic props", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    value=""
                />
            );

            expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
            expect(screen.getByRole("textbox")).toBeInTheDocument();
        });

        it("should handle text input", async () => {
            const user = userEvent.setup();
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    value=""
                />
            );

            const input = screen.getByRole("textbox");
            await user.type(input, "test value");

            // Should be called for each character typed
            expect(mockOnChange).toHaveBeenCalledTimes(10);
            expect(mockOnChange).toHaveBeenLastCalledWith("e"); // last character
        });

        it("should show placeholder", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    placeholder="Enter text here"
                    value=""
                />
            );

            expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
        });

        it("should be disabled when specified", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    disabled
                    value=""
                />
            );

            expect(screen.getByRole("textbox")).toBeDisabled();
        });

        it("should handle number type", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    type="number"
                    min={1}
                    max={100}
                    value=""
                />
            );

            const input = screen.getByRole("spinbutton");
            expect(input).toHaveAttribute("type", "number");
            expect(input).toHaveAttribute("min", "1");
            expect(input).toHaveAttribute("max", "100");
        });

        it("should show error state", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    error="Invalid input"
                    value=""
                />
            );

            expect(screen.getByText("Invalid input")).toBeInTheDocument();
        });

        it("should have proper aria attributes for required field", () => {
            render(
                <TextField
                    id="test-input"
                    label="Test Input"
                    onChange={mockOnChange}
                    required
                    value=""
                />
            );

            const input = screen.getByRole("textbox");
            expect(input).toHaveAttribute("aria-label", "Test Input (required)");
            expect(input).toHaveAttribute("required");
        });
    });

    describe("SelectField", () => {
        const mockOnChange = vi.fn();
        const options = [
            { label: "Option 1", value: "option1" },
            { label: "Option 2", value: "option2" },
            { label: "Option 3", value: "option3" },
        ];

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should render with options", () => {
            render(
                <SelectField
                    id="test-select"
                    label="Test Select"
                    onChange={mockOnChange}
                    options={options}
                    value=""
                />
            );

            expect(screen.getByLabelText("Test Select")).toBeInTheDocument();
            expect(screen.getByText("Option 1")).toBeInTheDocument();
            expect(screen.getByText("Option 2")).toBeInTheDocument();
            expect(screen.getByText("Option 3")).toBeInTheDocument();
        });

        it("should handle selection change", async () => {
            const user = userEvent.setup();
            render(
                <SelectField
                    id="test-select"
                    label="Test Select"
                    onChange={mockOnChange}
                    options={options}
                    value="option1"
                />
            );

            const select = screen.getByRole("combobox");
            await user.selectOptions(select, "option2");

            expect(mockOnChange).toHaveBeenCalledWith("option2");
        });

        it("should show placeholder option", () => {
            render(
                <SelectField
                    id="test-select"
                    label="Test Select"
                    onChange={mockOnChange}
                    options={options}
                    placeholder="-- Select an option --"
                    value=""
                />
            );

            expect(screen.getByText("-- Select an option --")).toBeInTheDocument();
        });

        it("should be disabled when specified", () => {
            render(
                <SelectField
                    id="test-select"
                    label="Test Select"
                    onChange={mockOnChange}
                    options={options}
                    disabled
                    value=""
                />
            );

            expect(screen.getByRole("combobox")).toBeDisabled();
        });

        it("should be required when specified", () => {
            render(
                <SelectField
                    id="test-select"
                    label="Test Select"
                    onChange={mockOnChange}
                    options={options}
                    required
                    value=""
                />
            );

            expect(screen.getByRole("combobox")).toHaveAttribute("required");
        });
    });

    describe("RadioGroup", () => {
        const mockOnChange = vi.fn();
        const options = [
            { label: "Option A", value: "a" },
            { label: "Option B", value: "b" },
            { label: "Option C", value: "c" },
        ];

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should render with radio options", () => {
            render(
                <RadioGroup
                    id="test-radio"
                    label="Test Radio"
                    name="test-radio-group"
                    onChange={mockOnChange}
                    options={options}
                    value="a"
                />
            );

            expect(screen.getByText("Test Radio")).toBeInTheDocument();
            expect(screen.getByDisplayValue("a")).toBeChecked();
            expect(screen.getByDisplayValue("b")).not.toBeChecked();
            expect(screen.getByDisplayValue("c")).not.toBeChecked();
        });

        it("should handle radio selection", async () => {
            const user = userEvent.setup();
            render(
                <RadioGroup
                    id="test-radio"
                    label="Test Radio"
                    name="test-radio-group"
                    onChange={mockOnChange}
                    options={options}
                    value="a"
                />
            );

            const optionB = screen.getByDisplayValue("b");
            await user.click(optionB);

            expect(mockOnChange).toHaveBeenCalledWith("b");
        });

        it("should be disabled when specified", () => {
            render(
                <RadioGroup
                    id="test-radio"
                    label="Test Radio"
                    name="test-radio-group"
                    onChange={mockOnChange}
                    options={options}
                    disabled
                    value="a"
                />
            );

            options.forEach((option) => {
                expect(screen.getByDisplayValue(option.value)).toBeDisabled();
            });
        });

        it("should have proper radiogroup role", () => {
            render(
                <RadioGroup
                    id="test-radio"
                    label="Test Radio"
                    name="test-radio-group"
                    onChange={mockOnChange}
                    options={options}
                    value="a"
                />
            );

            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        });

        it("should have all radios with same name", () => {
            render(
                <RadioGroup
                    id="test-radio"
                    label="Test Radio"
                    name="test-radio-group"
                    onChange={mockOnChange}
                    options={options}
                    value="a"
                />
            );

            options.forEach((option) => {
                expect(screen.getByDisplayValue(option.value)).toHaveAttribute("name", "test-radio-group");
            });
        });
    });
});

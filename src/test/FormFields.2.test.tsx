/**
 * Test suite for FormFields components.
 * Comprehensive tests for form field components.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import type { SelectFieldProperties, RadioGroupProperties } from "../components/AddSiteForm/FormFields";

import { SelectField, RadioGroup } from "../components/AddSiteForm/FormFields";

// Mock the theme components
vi.mock("../../theme/components", () => ({
    ThemedInput: ({ children, ...props }: React.ComponentProps<"input">) => <input {...props}>{children}</input>,
    ThemedSelect: ({ children, ...props }: React.ComponentProps<"select">) => <select {...props}>{children}</select>,
    ThemedText: ({ children, ...props }: React.ComponentProps<"span">) => <span {...props}>{children}</span>,
}));

describe("FormFields", () => {
    describe("SelectField", () => {
        const defaultProps: SelectFieldProperties = {
            id: "test-select",
            label: "Test Select",
            onChange: vi.fn(),
            options: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
            ],
            value: "",
        };

        it("should render select field with basic props", () => {
            render(<SelectField {...defaultProps} />);

            expect(screen.getByLabelText("Test Select")).toBeInTheDocument();
            expect(screen.getByRole("combobox")).toBeInTheDocument();
        });

        it("should render placeholder when provided", () => {
            render(<SelectField {...defaultProps} placeholder="Select an option" />);

            expect(screen.getByText("Select an option")).toBeInTheDocument();
        });

        it("should render options correctly", () => {
            render(<SelectField {...defaultProps} />);

            expect(screen.getByText("Option 1")).toBeInTheDocument();
            expect(screen.getByText("Option 2")).toBeInTheDocument();
        });

        it("should call onChange when option is selected", async () => {
            const mockOnChange = vi.fn();
            render(<SelectField {...defaultProps} onChange={mockOnChange} />);

            const select = screen.getByRole("combobox");
            await userEvent.selectOptions(select, "option1");

            expect(mockOnChange).toHaveBeenCalledWith("option1");
        });

        it("should render with error", () => {
            render(<SelectField {...defaultProps} error="This field is required" />);

            expect(screen.getByText("This field is required")).toBeInTheDocument();
        });

        it("should render with help text", () => {
            render(<SelectField {...defaultProps} helpText="Choose your preferred option" />);

            expect(screen.getByText("Choose your preferred option")).toBeInTheDocument();
        });

        it("should render as disabled", () => {
            render(<SelectField {...defaultProps} disabled />);

            const select = screen.getByRole("combobox");
            expect(select).toBeDisabled();
        });

        it("should render as required", () => {
            render(<SelectField {...defaultProps} required />);

            const select = screen.getByRole("combobox");
            expect(select).toBeRequired();
        });

        it("should have proper aria attributes when error is present", () => {
            render(<SelectField {...defaultProps} error="Error message" />);

            const select = screen.getByRole("combobox");
            expect(select).toHaveAttribute("aria-describedby");
        });

        it("should have proper aria attributes when help text is present", () => {
            render(<SelectField {...defaultProps} helpText="Help text" />);

            const select = screen.getByRole("combobox");
            expect(select).toHaveAttribute("aria-describedby");
        });

        it("should not have aria-describedby when no error or help text", () => {
            render(<SelectField {...defaultProps} />);

            const select = screen.getByRole("combobox");
            expect(select).not.toHaveAttribute("aria-describedby");
        });

        it("should have proper aria-label", () => {
            render(<SelectField {...defaultProps} required />);

            const select = screen.getByRole("combobox");
            expect(select).toHaveAttribute("aria-label", "Test Select (required)");
        });

        it("should have proper aria-label when not required", () => {
            render(<SelectField {...defaultProps} />);

            const select = screen.getByRole("combobox");
            expect(select).toHaveAttribute("aria-label", "Test Select");
        });
    });

    describe("RadioGroup", () => {
        const defaultProps: RadioGroupProperties = {
            id: "test-radio",
            label: "Test Radio",
            name: "test-radio-group",
            onChange: vi.fn(),
            options: [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
            ],
            value: "",
        };

        it("should render radio group with basic props", () => {
            render(<RadioGroup {...defaultProps} />);

            expect(screen.getByText("Test Radio")).toBeInTheDocument();
            expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        });

        it("should render all radio options", () => {
            render(<RadioGroup {...defaultProps} />);

            expect(screen.getByText("Option 1")).toBeInTheDocument();
            expect(screen.getByText("Option 2")).toBeInTheDocument();
            expect(screen.getAllByRole("radio")).toHaveLength(2);
        });

        it("should call onChange when option is selected", async () => {
            const mockOnChange = vi.fn();
            render(<RadioGroup {...defaultProps} onChange={mockOnChange} />);

            const radio = screen.getByDisplayValue("option1");
            await userEvent.click(radio);

            expect(mockOnChange).toHaveBeenCalledWith("option1");
        });

        it("should render with selected value", () => {
            render(<RadioGroup {...defaultProps} value="option1" />);

            const radio = screen.getByDisplayValue("option1");
            expect(radio).toBeChecked();
        });

        it("should render with error", () => {
            render(<RadioGroup {...defaultProps} error="This field is required" />);

            expect(screen.getByText("This field is required")).toBeInTheDocument();
        });

        it("should render with help text", () => {
            render(<RadioGroup {...defaultProps} helpText="Choose your preferred option" />);

            expect(screen.getByText("Choose your preferred option")).toBeInTheDocument();
        });

        it("should render as disabled", () => {
            render(<RadioGroup {...defaultProps} disabled />);

            const radios = screen.getAllByRole("radio");
            for (const radio of radios) {
                expect(radio).toBeDisabled();
            }
        });

        it("should render as required", () => {
            render(<RadioGroup {...defaultProps} required />);

            const radios = screen.getAllByRole("radio");
            for (const radio of radios) {
                expect(radio).toBeRequired();
            }
        });

        it("should have proper name attribute", () => {
            render(<RadioGroup {...defaultProps} />);

            const radios = screen.getAllByRole("radio");
            for (const radio of radios) {
                expect(radio).toHaveAttribute("name", "test-radio-group");
            }
        });

        it("should handle multiple radio groups independently", () => {
            const mockOnChange1 = vi.fn();
            const mockOnChange2 = vi.fn();

            render(
                <div>
                    <RadioGroup {...defaultProps} name="group1" onChange={mockOnChange1} value="option1" />
                    <RadioGroup {...defaultProps} name="group2" onChange={mockOnChange2} value="option2" />
                </div>
            );

            const group1Radios = screen
                .getAllByRole("radio")
                .filter((radio) => radio.getAttribute("name") === "group1");
            const group2Radios = screen
                .getAllByRole("radio")
                .filter((radio) => radio.getAttribute("name") === "group2");

            expect(group1Radios[0]).toBeChecked();
            expect(group2Radios[1]).toBeChecked();
        });

        it("should handle onChange for different options", async () => {
            const mockOnChange = vi.fn();
            render(<RadioGroup {...defaultProps} onChange={mockOnChange} />);

            const radio1 = screen.getByDisplayValue("option1");
            const radio2 = screen.getByDisplayValue("option2");

            await userEvent.click(radio1);
            expect(mockOnChange).toHaveBeenCalledWith("option1");

            await userEvent.click(radio2);
            expect(mockOnChange).toHaveBeenCalledWith("option2");
        });
    });
});

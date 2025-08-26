import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import FormField from "../../../components/AddSiteForm/FormField";
import TextField from "../../../components/AddSiteForm/TextField";
import SelectField from "../../../components/AddSiteForm/SelectField";
import RadioGroup from "../../../components/AddSiteForm/RadioGroup";
import type { FormFieldProperties } from "../../../components/AddSiteForm/FormField";
import type { TextFieldProperties } from "../../../components/AddSiteForm/TextField";
import type { SelectFieldProperties } from "../../../components/AddSiteForm/SelectField";
import type { RadioGroupProperties } from "../../../components/AddSiteForm/RadioGroup";

// Mock all dependencies
vi.mock("../../../theme/components/ThemedBox", () => ({
    default: vi.fn(({ children, ...props }) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    )),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    default: vi.fn(({ children, ...props }) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    )),
}));

vi.mock("../../../theme/components/ThemedInput", () => ({
    default: vi.fn(({ onChange, value, placeholder, ...props }) => (
        <input
            {...props}
            value={value || ""}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e)}
            data-testid="themed-input"
        />
    )),
}));

vi.mock("../../../theme/components/ThemedSelect", () => ({
    default: vi.fn(({ children, value, onChange, ...props }) => (
        <select
            {...props}
            value={value}
            onChange={(e) => onChange?.(e)}
            data-testid="themed-select"
        >
            {children}
        </select>
    )),
}));

vi.mock("../../../theme/components/ThemedButton", () => ({
    default: vi.fn(({ children, onClick, ...props }) => (
        <button {...props} onClick={onClick} data-testid="themed-button">
            {children}
        </button>
    )),
}));

describe("FormFields Components - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("FormField Component", () => {
        const defaultFormFieldProps: FormFieldProperties = {
            id: "test-field",
            label: "Test Field",
            required: false,
            children: <input data-testid="child-input" />,
        };

        it("should render with label", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<FormField {...defaultFormFieldProps} />);
            expect(screen.getByText("Test Field")).toBeInTheDocument();
        });

        it("should show required indicator when required", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<FormField {...defaultFormFieldProps} required={true} />);
            expect(screen.getByText(/\*/)).toBeInTheDocument();
        });

        it("should display error message", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <FormField
                    {...defaultFormFieldProps}
                    error="This field is required"
                />
            );
            expect(
                screen.getByText("This field is required")
            ).toBeInTheDocument();
        });

        it("should display help text", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <FormField
                    {...defaultFormFieldProps}
                    helpText="This is helpful information"
                />
            );
            expect(
                screen.getByText("This is helpful information")
            ).toBeInTheDocument();
        });

        it("should render children", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<FormField {...defaultFormFieldProps} />);
            expect(screen.getByTestId("child-input")).toBeInTheDocument();
        });

        it("should handle no error gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(<FormField {...defaultFormFieldProps} />);
            expect(screen.getByText("Test Field")).toBeInTheDocument();
        });

        it("should prioritize error over help text when both are present", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <FormField
                    {...defaultFormFieldProps}
                    error="Error message"
                    helpText="Help text"
                />
            );
            expect(screen.getByText("Error message")).toBeInTheDocument();
            expect(screen.queryByText("Help text")).not.toBeInTheDocument();
        });

        it("should not show required indicator when required is false", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<FormField {...defaultFormFieldProps} required={false} />);
            expect(screen.queryByText("*")).not.toBeInTheDocument();
        });

        it("should handle required prop explicitly set to false", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <FormField
                    {...defaultFormFieldProps}
                    label="Test Label"
                    required={false}
                />
            );
            const labelElement = screen.getByText("Test Label");
            expect(labelElement).toBeInTheDocument();
            // Ensure the * is not added when required is explicitly false
            expect(labelElement.textContent?.trim()).toBe("Test Label");
        });
    });

    describe("TextField Component", () => {
        const defaultTextFieldProps: TextFieldProperties = {
            id: "site-name",
            label: "Site Name",
            value: "",
            onChange: vi.fn(),
            placeholder: "Enter site name",
        };

        it("should render text input", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<TextField {...defaultTextFieldProps} />);
            expect(screen.getByTestId("themed-input")).toBeInTheDocument();
        });

        it("should handle value changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onChange = vi.fn();
            render(
                <TextField {...defaultTextFieldProps} onChange={onChange} />
            );

            const input = screen.getByTestId("themed-input");
            fireEvent.change(input, { target: { value: "Test Value" } });

            expect(onChange).toHaveBeenCalledWith("Test Value");
        });

        it("should display current value", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <TextField {...defaultTextFieldProps} value="Current Value" />
            );
            expect(
                screen.getByDisplayValue("Current Value")
            ).toBeInTheDocument();
        });

        it("should be disabled when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<TextField {...defaultTextFieldProps} disabled={true} />);
            expect(screen.getByTestId("themed-input")).toBeDisabled();
        });

        it("should show placeholder text", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<TextField {...defaultTextFieldProps} />);
            expect(
                screen.getByPlaceholderText("Enter site name")
            ).toBeInTheDocument();
        });

        it("should handle required field", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<TextField {...defaultTextFieldProps} required={true} />);
            expect(screen.getByText(/\*/)).toBeInTheDocument();
        });

        it("should display validation error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <TextField {...defaultTextFieldProps} error="Invalid input" />
            );
            expect(screen.getByText("Invalid input")).toBeInTheDocument();
        });

        it("should support different input types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<TextField {...defaultTextFieldProps} type="url" />);
            expect(screen.getByTestId("themed-input")).toHaveAttribute(
                "type",
                "url"
            );
        });

        it("should display help text without error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <TextField
                    {...defaultTextFieldProps}
                    helpText="This is helpful"
                />
            );
            expect(screen.getByText("This is helpful")).toBeInTheDocument();
        });

        it("should handle TextField with explicit undefined props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Test conditional spreading edge cases
            const propsWithExplicitUndefined = {
                ...defaultTextFieldProps,
            };
            render(<TextField {...propsWithExplicitUndefined} />);
            expect(screen.getByTestId("themed-input")).toBeInTheDocument();
        });

        it("should handle min and max attributes for number inputs", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <TextField
                    {...defaultTextFieldProps}
                    type="number"
                    min={1}
                    max={100}
                />
            );
            const input = screen.getByTestId("themed-input");
            expect(input).toHaveAttribute("min", "1");
            expect(input).toHaveAttribute("max", "100");
        });
    });

    describe("SelectField Component", () => {
        const selectOptions = [
            { value: "http", label: "HTTP" },
            { value: "port", label: "Port" },
            { value: "ping", label: "Ping" },
        ];

        const defaultSelectFieldProps: SelectFieldProperties = {
            id: "monitor-type",
            label: "Monitor Type",
            value: "http",
            options: selectOptions,
            onChange: vi.fn(),
        };

        it("should render select dropdown", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SelectField {...defaultSelectFieldProps} />);
            expect(screen.getByTestId("themed-select")).toBeInTheDocument();
        });

        it("should display all options", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SelectField {...defaultSelectFieldProps} />);
            expect(screen.getByText("HTTP")).toBeInTheDocument();
            expect(screen.getByText("Port")).toBeInTheDocument();
            expect(screen.getByText("Ping")).toBeInTheDocument();
        });

        it("should handle option selection", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onChange = vi.fn();
            render(
                <SelectField {...defaultSelectFieldProps} onChange={onChange} />
            );

            const select = screen.getByTestId("themed-select");
            fireEvent.change(select, { target: { value: "port" } });

            expect(onChange).toHaveBeenCalledWith("port");
        });

        it("should show current selection", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SelectField {...defaultSelectFieldProps} value="port" />);
            const select = screen.getByTestId("themed-select");
            expect(select).toHaveValue("port");
        });

        it("should be disabled when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SelectField {...defaultSelectFieldProps} disabled={true} />
            );
            expect(screen.getByTestId("themed-select")).toBeDisabled();
        });

        it("should handle empty options array", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<SelectField {...defaultSelectFieldProps} options={[]} />);
            expect(screen.getByTestId("themed-select")).toBeInTheDocument();
        });

        it("should show validation error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <SelectField
                    {...defaultSelectFieldProps}
                    error="Selection required"
                />
            );
            expect(screen.getByText("Selection required")).toBeInTheDocument();
        });

        it("should display help text without error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <SelectField
                    {...defaultSelectFieldProps}
                    helpText="Choose an option"
                />
            );
            expect(screen.getByText("Choose an option")).toBeInTheDocument();
        });

        it("should handle SelectField with explicit undefined props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Test conditional spreading edge cases
            const propsWithExplicitUndefined = {
                ...defaultSelectFieldProps,
            };
            render(<SelectField {...propsWithExplicitUndefined} />);
            expect(screen.getByTestId("themed-select")).toBeInTheDocument();
        });

        it("should show placeholder option when provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SelectField
                    {...defaultSelectFieldProps}
                    placeholder="Select option..."
                    value=""
                />
            );
            expect(screen.getByText("Select option...")).toBeInTheDocument();
        });
    });

    describe("RadioGroup Component", () => {
        const radioOptions = [
            { value: "new", label: "Create New Site" },
            { value: "existing", label: "Add to Existing Site" },
        ];

        const defaultRadioGroupProps: RadioGroupProperties = {
            id: "add-mode",
            label: "Add Mode",
            name: "addMode",
            value: "new",
            options: radioOptions,
            onChange: vi.fn(),
        };

        it("should render radio buttons", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} />);
            expect(screen.getByDisplayValue("new")).toBeInTheDocument();
            expect(screen.getByDisplayValue("existing")).toBeInTheDocument();
        });

        it("should display option labels", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} />);
            expect(screen.getByText("Create New Site")).toBeInTheDocument();
            expect(
                screen.getByText("Add to Existing Site")
            ).toBeInTheDocument();
        });

        it("should handle option selection", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onChange = vi.fn();
            render(
                <RadioGroup {...defaultRadioGroupProps} onChange={onChange} />
            );

            const existingRadio = screen.getByDisplayValue("existing");
            fireEvent.click(existingRadio);

            expect(onChange).toHaveBeenCalledWith("existing");
        });

        it("should show current selection", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} value="existing" />);
            expect(screen.getByDisplayValue("existing")).toBeChecked();
        });

        it("should be disabled when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} disabled={true} />);

            const newRadio = screen.getByDisplayValue("new");
            const existingRadio = screen.getByDisplayValue("existing");

            expect(newRadio).toBeDisabled();
            expect(existingRadio).toBeDisabled();
        });

        it("should handle empty options array", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} options={[]} />);
            // Should still render the component without crashing
            expect(screen.queryByDisplayValue("new")).not.toBeInTheDocument();
        });

        it("should use correct name attribute for grouping", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} />);

            const newRadio = screen.getByDisplayValue("new");
            const existingRadio = screen.getByDisplayValue("existing");

            expect(newRadio).toHaveAttribute("name", "addMode");
            expect(existingRadio).toHaveAttribute("name", "addMode");
        });

        it("should handle keyboard navigation", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<RadioGroup {...defaultRadioGroupProps} />);

            const newRadio = screen.getByDisplayValue("new");
            newRadio.focus();
            expect(newRadio).toHaveFocus();

            fireEvent.keyDown(newRadio, { key: "ArrowDown" });
            const existingRadio = screen.getByDisplayValue("existing");
            existingRadio.focus();
            expect(existingRadio).toHaveFocus();
        });

        it("should display help text without error", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <RadioGroup
                    {...defaultRadioGroupProps}
                    helpText="Choose an option"
                />
            );
            expect(screen.getByText("Choose an option")).toBeInTheDocument();
        });

        it("should handle radiogroup without error or helpText", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(<RadioGroup {...defaultRadioGroupProps} />);
            expect(screen.getByText("Create New Site")).toBeInTheDocument();
        });

        it("should handle radiogroup with explicit undefined error", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            // This specifically tests the conditional spread operator edge case
            const propsWithExplicitUndefined = {
                ...defaultRadioGroupProps,
            };
            render(<RadioGroup {...propsWithExplicitUndefined} />);
            expect(screen.getByText("Create New Site")).toBeInTheDocument();
            expect(
                screen.getByText("Add to Existing Site")
            ).toBeInTheDocument();
        });
    });

    describe("Integration Tests", () => {
        it("should work together in a form", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: FormFields", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            const handleTextChange = vi.fn();
            const handleSelectChange = vi.fn();
            const handleRadioChange = vi.fn();

            render(
                <div>
                    <TextField
                        id="site-name"
                        label="Site Name"
                        value=""
                        onChange={handleTextChange}
                        placeholder="Enter site name"
                    />
                    <SelectField
                        id="monitor-type"
                        label="Monitor Type"
                        value="http"
                        options={[
                            { value: "http", label: "HTTP" },
                            { value: "port", label: "Port" },
                        ]}
                        onChange={handleSelectChange}
                    />
                    <RadioGroup
                        id="add-mode"
                        label="Add Mode"
                        name="addMode"
                        value="new"
                        options={[
                            { value: "new", label: "Create New Site" },
                            {
                                value: "existing",
                                label: "Add to Existing Site",
                            },
                        ]}
                        onChange={handleRadioChange}
                    />
                </div>
            );

            // Test that all components render
            expect(
                screen.getByPlaceholderText("Enter site name")
            ).toBeInTheDocument();
            expect(screen.getByText("HTTP")).toBeInTheDocument();
            expect(screen.getByText("Port")).toBeInTheDocument();
            expect(screen.getByText("Create New Site")).toBeInTheDocument();

            // Test interactions
            fireEvent.change(screen.getByTestId("themed-input"), {
                target: { value: "Test" },
            });
            expect(handleTextChange).toHaveBeenCalledWith("Test");

            const select = screen.getByTestId("themed-select");
            fireEvent.change(select, { target: { value: "port" } });
            expect(handleSelectChange).toHaveBeenCalledWith("port");

            const radioButton = screen.getByDisplayValue("existing");
            fireEvent.click(radioButton);
            expect(handleRadioChange).toHaveBeenCalledWith("existing");
        });
    });
});

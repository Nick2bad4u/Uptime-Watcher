/**
 * Additional test coverage for BaseFormField component.
 *
 * @remarks
 * This test file targets specific uncovered lines to improve coverage:
 *
 * - Lines 92-98: Conditional spread operators for error and helpText props
 * - Testing all combinations of error and helpText prop scenarios
 * - Verifying proper ARIA attribute generation and FormField prop spreading
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BaseFormField from "../../../components/AddSiteForm/BaseFormField";
import type { AriaProperties } from "../../../components/AddSiteForm/BaseFormField";

describe("BaseFormField - Additional Coverage", () => {
    it("should handle undefined error and undefined helpText (lines 97-98 false branches)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Testing the scenario where both error and helpText are undefined
        // This tests the false branches of both conditional spread operators
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={false}
                // error is undefined (not passed)
                // helpText is undefined (not passed)
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Verify ARIA properties
        expect(input).toHaveAttribute("aria-label", "Test Label");
        expect(input).not.toHaveAttribute("aria-describedby");
    });

    it("should handle defined error with undefined helpText (line 97 true, line 98 false)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Testing error !== undefined (true) && helpText === undefined (false)
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={true}
                error="This is an error"
                // helpText is undefined (not passed)
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Verify ARIA properties
        expect(input).toHaveAttribute("aria-label", "Test Label (required)");
        expect(input).toHaveAttribute("aria-describedby", "test-field-error");
    });

    it("should handle undefined error with defined helpText (line 97 false, line 98 true)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Testing error === undefined (false) && helpText !== undefined (true)
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={false}
                // error is undefined (not passed)
                helpText="This is help text"
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Verify ARIA properties
        expect(input).toHaveAttribute("aria-label", "Test Label");
        expect(input).toHaveAttribute("aria-describedby", "test-field-help");
    });

    it("should handle defined error with defined helpText (both lines 97-98 true)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Testing error !== undefined (true) && helpText !== undefined (true)
        // Error should take precedence for aria-describedby
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={true}
                error="This is an error"
                helpText="This is help text"
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Verify ARIA properties - error takes precedence
        expect(input).toHaveAttribute("aria-label", "Test Label (required)");
        expect(input).toHaveAttribute("aria-describedby", "test-field-error");
    });

    it("should handle empty string error (line 97 true branch with falsy error)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

        // Testing when error is an empty string (truthy for !== undefined but falsy for getAriaDescribedBy)
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={false}
                error=""
                helpText="This is help text"
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Empty string error means helpText should be used for aria-describedby
        expect(input).toHaveAttribute("aria-label", "Test Label");
        expect(input).toHaveAttribute("aria-describedby", "test-field-help");
    });

    it("should handle empty string helpText (line 98 true branch with falsy helpText)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        // Testing when helpText is an empty string (truthy for !== undefined but falsy for getAriaDescribedBy)
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                aria-describedby={ariaProps["aria-describedby"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={false}
                // error is undefined
                helpText=""
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");

        // Empty string helpText means no aria-describedby should be set
        expect(input).toHaveAttribute("aria-label", "Test Label");
        expect(input).not.toHaveAttribute("aria-describedby");
    });

    it("should properly spread conditional props to FormField", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        // Testing that the conditional spread operators work correctly for FormField props
        const childrenSpy = (ariaProps: AriaProperties) => (
            <div
                data-testid="test-child"
                data-aria-props={JSON.stringify(ariaProps)}
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Test Label"
                required={true}
                error="Test error message"
                helpText="Test help text"
            >
                {childrenSpy}
            </BaseFormField>
        );

        // Check that FormField receives the correct props by looking at the DOM structure
        const formField = screen.getByTestId("test-child").parentElement;
        expect(formField).toBeInTheDocument();

        // Verify the child receives correct ARIA props
        const childElement = screen.getByTestId("test-child");
        const ariaPropsData = childElement.dataset["ariaProps"];
        const ariaProps = JSON.parse(ariaPropsData || "{}");

        expect(ariaProps["aria-label"]).toBe("Test Label (required)");
        expect(ariaProps["aria-describedby"]).toBe("test-field-error");
    });

    it("should handle complex label text with special characters", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: BaseFormField.additional-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

        // Testing edge case with complex label text
        const childrenSpy = (ariaProps: AriaProperties) => (
            <input
                data-testid="test-input"
                aria-label={ariaProps["aria-label"]}
                type="text"
            />
        );

        render(
            <BaseFormField
                id="test-field"
                label="Complex Label: With Symbols & Numbers (123)"
                required={true}
            >
                {childrenSpy}
            </BaseFormField>
        );

        const input = screen.getByTestId("test-input");
        expect(input).toHaveAttribute(
            "aria-label",
            "Complex Label: With Symbols & Numbers (123) (required)"
        );
    });
});

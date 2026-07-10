/* @vitest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AriaProperties } from "../../../components/AddSiteForm/BaseFormField";

import { BaseFormField } from "../../../components/AddSiteForm/BaseFormField";

type BaseFormFieldTestProperties = Partial<Parameters<typeof BaseFormField>[0]>;

const renderBaseFormField = (props: BaseFormFieldTestProperties = {}) =>
    render(
        <BaseFormField id="test-field" label="Test Label" {...props}>
            {(ariaProps: AriaProperties) => (
                <input
                    aria-describedby={ariaProps["aria-describedby"]}
                    aria-label={ariaProps["aria-label"]}
                    data-testid="test-input"
                    type="text"
                />
            )}
        </BaseFormField>
    );

describe("BaseFormField", () => {
    it("labels optional and required fields for assistive technology", () => {
        const { rerender } = render(
            <BaseFormField id="name" label="Name">
                {(ariaProps) => (
                    <input
                        aria-label={ariaProps["aria-label"]}
                        data-testid="name-input"
                        type="text"
                    />
                )}
            </BaseFormField>
        );

        expect(screen.getByTestId("name-input")).toHaveAttribute(
            "aria-label",
            "Name"
        );

        rerender(
            <BaseFormField id="name" label="Name" required={true}>
                {(ariaProps) => (
                    <input
                        aria-label={ariaProps["aria-label"]}
                        data-testid="name-input"
                        type="text"
                    />
                )}
            </BaseFormField>
        );

        expect(screen.getByTestId("name-input")).toHaveAttribute(
            "aria-label",
            "Name (required)"
        );
    });

    it.each([
        {
            describedBy: undefined,
            error: undefined,
            helpText: undefined,
            name: "plain field",
            visibleText: undefined,
        },
        {
            describedBy: "test-field-help",
            error: undefined,
            helpText: "Helpful context",
            name: "help text",
            visibleText: "Helpful context",
        },
        {
            describedBy: "test-field-error",
            error: "Required value",
            helpText: undefined,
            name: "error text",
            visibleText: "Required value",
        },
        {
            describedBy: "test-field-error",
            error: "Required value",
            helpText: "Helpful context",
            name: "error text before help text",
            visibleText: "Required value",
        },
        {
            describedBy: "test-field-help",
            error: "",
            helpText: "Helpful context",
            name: "empty error with help text",
            visibleText: "Helpful context",
        },
        {
            describedBy: undefined,
            error: undefined,
            helpText: "",
            name: "empty help text",
            visibleText: undefined,
        },
    ])(
        "sets aria-describedby from $name",
        ({ describedBy, error, helpText, visibleText }) => {
            const fieldProps = {
                ...(error !== undefined && { error }),
                ...(helpText !== undefined && { helpText }),
            } satisfies BaseFormFieldTestProperties;

            renderBaseFormField(fieldProps);

            const input = screen.getByTestId("test-input");

            if (describedBy) {
                expect(input).toHaveAttribute("aria-describedby", describedBy);
            } else {
                expect(input).not.toHaveAttribute("aria-describedby");
            }

            if (visibleText) {
                expect(screen.getByText(visibleText)).toBeInTheDocument();
            }
        }
    );

    it("preserves caller labels with symbols while adding required context", () => {
        renderBaseFormField({
            label: "Complex Label: With Symbols & Numbers (123)",
            required: true,
        });

        expect(screen.getByTestId("test-input")).toHaveAttribute(
            "aria-label",
            "Complex Label: With Symbols & Numbers (123) (required)"
        );
    });
});

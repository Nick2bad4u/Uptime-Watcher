/**
 * @file Coverage-focused tests for the `DynamicField` component.
 */

import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: loggerErrorMock,
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

interface TextFieldMockProps {
    helpText?: string;
    id: string;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: string) => void;
    placeholder?: string;
    required: boolean;
    type: string;
    value: string;
}

interface SelectFieldMockProps {
    helpText?: string;
    id: string;
    label: string;
    onChange: (value: string) => void;
    options?: { label: string; value: string }[];
    placeholder?: string;
    required: boolean;
    value: string;
}

const textFieldProps = vi.hoisted(() => [] as TextFieldMockProps[]);
const selectFieldProps = vi.hoisted(() => [] as SelectFieldMockProps[]);

vi.mock("../../components/AddSiteForm/TextField", () => ({
    TextField: (props: TextFieldMockProps) => {
        textFieldProps.push(props);
        return (
            <input
                data-testid={`text-field-${props.id}`}
                onChange={(event) => props.onChange(event.currentTarget.value)}
                type={props.type}
                value={props.value}
            />
        );
    },
}));

vi.mock("../../components/AddSiteForm/SelectField", () => ({
    SelectField: (props: SelectFieldMockProps) => {
        selectFieldProps.push(props);
        return (
            <select
                data-testid={`select-field-${props.id}`}
                onChange={(event) => props.onChange(event.currentTarget.value)}
                value={props.value}
            >
                {(props.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    },
}));

const themedTextMock = vi.hoisted(() => ({
    component: ({ children }: { children?: ReactNode }) => (
        <span data-testid="dynamic-field-error">{children}</span>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: themedTextMock.component,
}));

import { DynamicField } from "../../components/AddSiteForm/DynamicField";

describe("DynamicField coverage", () => {
    beforeEach(() => {
        textFieldProps.length = 0;
        selectFieldProps.length = 0;
        loggerErrorMock.mockClear();
    });

    it("renders numeric field and validates input", async () => {
        const onChange = vi.fn();
        render(
            <DynamicField
                field={{
                    label: "Port",
                    max: 8081,
                    min: 1,
                    name: "port",
                    required: true,
                    type: "number",
                }}
                onChange={onChange}
                value={8080}
            />
        );

        expect(textFieldProps[0]).toBeDefined();
        const numericProps = textFieldProps[0]!;
        expect(numericProps).toMatchObject({
            max: 8081,
            min: 1,
            required: true,
            type: "number",
        });
        numericProps.onChange("9090");
        expect(onChange).toHaveBeenLastCalledWith(9090);

        numericProps.onChange("");
        expect(onChange).toHaveBeenLastCalledWith(0);

        numericProps.onChange("invalid");
        expect(loggerErrorMock).toHaveBeenCalledWith(
            "Invalid numeric input: invalid"
        );
    });

    it("renders select field with options", async () => {
        const onChange = vi.fn();
        render(
            <DynamicField
                field={{
                    helpText: "Choose environment",
                    label: "Environment",
                    name: "environment",
                    options: [
                        { label: "Production", value: "prod" },
                        { label: "Staging", value: "stage" },
                    ],
                    required: true,
                    type: "select",
                }}
                onChange={onChange}
                value="prod"
            />
        );

        expect(selectFieldProps[0]).toBeDefined();
        const selectProps = selectFieldProps[0]!;
        selectProps.onChange("stage");
        expect(onChange).toHaveBeenCalledWith("stage");
        expect(selectProps).toMatchObject({
            required: true,
        });
    });

    it("falls back to empty options when none are provided", () => {
        const onChange = vi.fn();
        render(
            <DynamicField
                field={{
                    label: "Region",
                    name: "region",
                    required: false,
                    type: "select",
                }}
                onChange={onChange}
                value=""
            />
        );

        const selectProps = selectFieldProps.at(-1);
        expect(selectProps?.options).toEqual([]);
        selectProps?.onChange("us-east");
        expect(onChange).toHaveBeenCalledWith("us-east");
    });

    it("renders string-based fields for text and url", async () => {
        const textChange = vi.fn();
        render(
            <DynamicField
                field={{
                    helpText: "Enter hostname",
                    label: "Hostname",
                    name: "hostname",
                    required: false,
                    type: "text",
                }}
                onChange={textChange}
                value="example.com"
            />
        );

        expect(textFieldProps[0]).toBeDefined();
        const textProps = textFieldProps[0]!;
        textProps.onChange("prod.example.com");
        expect(textChange).toHaveBeenLastCalledWith("prod.example.com");

        const urlChange = vi.fn();
        render(
            <DynamicField
                field={{
                    label: "Endpoint",
                    name: "endpoint",
                    required: false,
                    type: "url",
                }}
                onChange={urlChange}
                value="https://api.example.com"
            />
        );

        expect(textFieldProps[1]).toBeDefined();
        const urlProps = textFieldProps[1]!;
        urlProps.onChange("https://api.internal");
        expect(urlChange).toHaveBeenLastCalledWith("https://api.internal");
    });

    it("passes through optional flags like disabled and placeholder", () => {
        render(
            <DynamicField
                disabled
                field={{
                    helpText: "Provide a friendly display name",
                    label: "Display Name",
                    name: "displayName",
                    placeholder: "Uptime watcher",
                    required: true,
                    type: "text",
                }}
                onChange={vi.fn()}
                value=""
            />
        );

        const textProps = textFieldProps.at(-1);
        expect(textProps).toMatchObject({
            disabled: true,
            helpText: "Provide a friendly display name",
            placeholder: "Uptime watcher",
            required: true,
            type: "text",
        });
    });

    it("renders error message for unsupported field types", () => {
        render(
            <DynamicField
                field={{
                    label: "Unsupported",
                    name: "unsupported",
                    required: false,
                    // @ts-expect-error - intentional invalid type for coverage
                    type: "json",
                }}
                onChange={vi.fn()}
                value="{}"
            />
        );

        expect(screen.getByTestId("dynamic-field-error")).toHaveTextContent(
            "Unsupported field type: json"
        );
    });
});

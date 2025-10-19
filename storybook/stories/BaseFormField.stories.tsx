/**
 * Stories covering the BaseFormField accessibility wrapper.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
    type AriaProperties,
    BaseFormField,
    type BaseFormFieldProperties,
} from "@app/components/AddSiteForm/BaseFormField";

const baseChildren: BaseFormFieldProperties["children"] = (
    ariaProps: AriaProperties
) => (
    <input
        {...ariaProps}
        className="w-64 rounded-xs border border-slate-400 px-3 py-2"
        defaultValue=""
        placeholder="Enter a descriptive name"
        type="text"
    />
);

const meta: Meta<BaseFormFieldProperties> = {
    args: {
        children: baseChildren,
        id: "site-name",
        label: "Site Name",
        required: true,
    },
    component: BaseFormField,
    parameters: {
        docs: {
            description: {
                component:
                    "BaseFormField wraps inputs with shared label/help/error affordances while emitting ARIA attributes for the trigger element.",
            },
        },
        layout: "centered",
    },
    argTypes: {
        children: {
            control: false,
        },
    },
    tags: ["autodocs"],
} satisfies Meta<BaseFormFieldProperties>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Required: Story = {
    args: {
        children: baseChildren,
    },
    parameters: {
        docs: {
            description: {
                story: "Demonstrates the default required presentation; the generated aria-label marks the field as mandatory without duplicating the visual asterisk.",
            },
        },
    },
};

export const WithHelpText: Story = {
    args: {
        children: baseChildren,
        helpText: "This name appears in dashboards and alerts.",
    },
    parameters: {
        docs: {
            description: {
                story: "Shows the optional help hint bound through aria-describedby, ensuring screen readers announce usage guidance after the label.",
            },
        },
    },
};

export const WithError: Story = {
    args: {
        children: baseChildren,
        error: "Provide a unique site name.",
    },
    parameters: {
        docs: {
            description: {
                story: "Error messaging remains inside the labelled container and is connected to the input via aria-describedby for assistive feedback.",
            },
        },
    },
};

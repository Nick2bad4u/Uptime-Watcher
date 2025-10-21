/**
 * Storybook stories for the AddSiteForm component to exercise both new site
 * creation and existing site augmentation flows.
 */

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import {
    AddSiteForm,
    type AddSiteFormProperties,
} from "@app/components/AddSiteForm/AddSiteForm";
import { useAddSiteForm } from "@app/components/SiteDetails/useAddSiteForm";
import { useMount } from "@app/hooks/useMount";
import { type JSX, useEffect } from "react";
import { action } from "storybook/actions";

import {
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";
import {
    prepareMonitorTypeMocks,
    SAMPLE_MONITOR_TYPES,
} from "./setup/monitorTypeMocks";

const sampleSites = [
    createMockSite({ identifier: "form-alpha", name: "Alpha Gateway" }),
    createMockSite({ identifier: "form-beta", name: "Beta API" }),
] as const;

const withMonitorTypes: Decorator = (StoryComponent) => {
    useMount(() => {
        prepareMonitorTypeMocks(SAMPLE_MONITOR_TYPES);
    });
    return <StoryComponent />;
};

const meta: Meta<typeof AddSiteForm> = {
    args: {
        onSuccess: action("add-site-form/success"),
    },
    component: AddSiteForm,
    decorators: [withMonitorTypes, createSiteDecorator(() => sampleSites)],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof AddSiteForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CreateNewSite: Story = {};

export const AddMonitorToExistingSite: Story = {
    render: (args: AddSiteFormProperties): JSX.Element => {
        const ExistingSiteForm = (): JSX.Element => {
            const { resetForm, setAddMode, setSelectedExistingSite } =
                useAddSiteForm();

            useEffect(
                function initializeExistingSiteFormEffect(): () => void {
                    setAddMode("existing");
                    setSelectedExistingSite(sampleSites[0]?.identifier ?? "");

                    return function cleanupExistingSiteFormEffect(): void {
                        resetForm();
                    };
                },
                [
                    resetForm,
                    setAddMode,
                    setSelectedExistingSite,
                ]
            );

            return <AddSiteForm {...args} />;
        };

        return <ExistingSiteForm />;
    },
};

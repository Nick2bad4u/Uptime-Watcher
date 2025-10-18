/**
 * Storybook stories for the AddSiteModal and embedded AddSiteForm.
 */

import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { AddSiteModal } from "@app/components/AddSiteForm/AddSiteModal";
import { useMount } from "@app/hooks/useMount";
import { useUIStore } from "@app/stores/ui/useUiStore";
import { action } from "storybook/actions";

import {
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";
import {
    prepareMonitorTypeMocks,
    SAMPLE_MONITOR_TYPES,
} from "./setup/monitorTypeMocks";

type Story = StoryObj<typeof meta>;

const sampleSites = [
    createMockSite({
        identifier: "storybook-aurora",
        name: "Aurora CDN",
    }),
    createMockSite({
        identifier: "storybook-orion",
        name: "Orion API",
    }),
] as const;

const withAddSiteEnvironment: Decorator = (StoryComponent) => {
    useMount(
        () => {
            prepareMonitorTypeMocks(SAMPLE_MONITOR_TYPES);
            useUIStore.setState({
                showAddSiteModal: true,
            });
        },
        () => {
            useUIStore.setState({ showAddSiteModal: false });
        }
    );

    return <StoryComponent />;
};

const meta: Meta<typeof AddSiteModal> = {
    args: {
        onClose: action("add-site-modal/close"),
    },
    component: AddSiteModal,
    decorators: [
        withAddSiteEnvironment,
        createSiteDecorator(() => sampleSites),
    ],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof AddSiteModal>;

export default meta;

export const Default: Story = {};

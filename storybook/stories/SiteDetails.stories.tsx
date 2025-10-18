/**
 * Storybook coverage for the SiteDetails modal shell to validate modern UI
 * semantics and interactions outside of end-to-end tests.
 */

import type { Site } from "@shared/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { SiteDetails } from "@app/components/SiteDetails/SiteDetails";
import { useUIStore } from "@app/stores/ui/useUiStore";
import {
    createMockMonitor,
    createMockSite,
    createSiteDecorator,
} from "../helpers/siteStoryHelpers";
import { useEffect } from "react";
import { action } from "storybook/actions";

const baseSite = createMockSite({
    identifier: "site-storyboard",
    monitors: [
        createMockMonitor({
            id: "storyboard-http",
            responseTime: 220,
            status: "up",
            type: "http",
            url: "https://status.storyboard.dev",
        }),
        createMockMonitor({
            id: "storyboard-heartbeat",
            monitoring: true,
            status: "degraded",
            type: "server-heartbeat",
        }),
    ],
    name: "Storyboard Primary",
});

const pausedSite = createMockSite({
    identifier: "site-maintenance",
    monitors: [
        createMockMonitor({
            id: "maintenance-port",
            monitoring: false,
            status: "paused",
            type: "port",
        }),
    ],
    monitoring: false,
    name: "Maintenance Window",
});

interface SiteDetailsStoryArgs {
    onClose: () => void;
    site: Site;
}

const withSiteDetailsState: Decorator = (StoryComponent, context) => {
    const { site } = context.args as unknown as SiteDetailsStoryArgs;

    useEffect(
        function syncSiteDetailsState(): () => void {
            const previous = {
                selectedSiteIdentifier:
                    useUIStore.getState().selectedSiteIdentifier,
                showSiteDetails: useUIStore.getState().showSiteDetails,
            } as const;

            useUIStore.setState({
                selectedSiteIdentifier: site.identifier,
                showSiteDetails: true,
            });

            return function restoreSiteDetailsState(): void {
                useUIStore.setState({
                    selectedSiteIdentifier: previous.selectedSiteIdentifier,
                    showSiteDetails: previous.showSiteDetails,
                });
            };
        },
        [site.identifier]
    );

    return <StoryComponent />;
};

const meta: Meta<typeof SiteDetails> = {
    args: {
        onClose: action("site-details/close"),
        site: baseSite,
    },
    argTypes: {
        onClose: {
            control: false,
            description: "Callback invoked when the modal requests closure",
        },
        site: {
            control: false,
            description: "Site entity rendered within the details shell",
        },
    },
    component: SiteDetails,
    decorators: [
        createSiteDecorator((context) => [
            (context.args as unknown as SiteDetailsStoryArgs | undefined)
                ?.site ?? baseSite,
        ]),
        withSiteDetailsState,
    ],
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteDetails>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MaintenancePaused: Story = {
    args: {
        site: pausedSite,
    },
};

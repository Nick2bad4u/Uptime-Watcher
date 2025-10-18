/**
 * Storybook coverage for SiteDetailsHeader to validate the always-expanded
 * layout and status presentation across different monitor contexts.
 */

import type { Monitor, Site } from "@shared/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, JSX } from "react";

import { SiteDetailsHeader } from "@app/components/SiteDetails/SiteDetailsHeader";
import { useUIStore } from "@app/stores/ui/useUiStore";
import { createMockMonitor, createMockSite } from "../helpers/siteStoryHelpers";
import { useEffect } from "react";
import { action } from "storybook/actions";

const meta: Meta<typeof SiteDetailsHeader> = {
    args: {
        onClose: action("close-site-details"),
    },
    component: SiteDetailsHeader,
    parameters: {
        controls: {
            exclude: ["selectedMonitor", "site"],
        },
        layout: "fullscreen",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof SiteDetailsHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

interface SiteDetailsHeaderScenario {
    readonly httpMonitor: Monitor;
    readonly pingMonitor: Monitor;
    readonly site: Site;
}

/**
 * Builds a canonical story scenario with representative monitors.
 *
 * @returns Tuple containing the HTTP monitor, ping monitor, and parent site.
 */
const createSiteScenario = (): SiteDetailsHeaderScenario => {
    const httpMonitor = createMockMonitor({
        id: "storybook-http",
        responseTime: 180,
        status: "up",
        type: "http",
        url: "https://status.storybook.dev",
    });
    const pingMonitor = createMockMonitor({
        id: "storybook-ping",
        monitoring: false,
        status: "paused",
        type: "ping",
    });

    const site = createMockSite({
        identifier: "storybook-site-details-header",
        monitors: [httpMonitor, pingMonitor],
        name: "Storybook Observability",
    });

    return { httpMonitor, pingMonitor, site } as const;
};

const CollapsedHeaderStory = (
    props: Readonly<ComponentProps<typeof SiteDetailsHeader>>
): JSX.Element => {
    const { site } = props;

    useEffect(
        function syncCollapsedHeaderState(): () => void {
            const store = useUIStore.getState();
            store.setSiteDetailsHeaderCollapsed(site.identifier, true);

            return function resetCollapsedHeaderState(): void {
                const resetStore = useUIStore.getState();
                resetStore.setSiteDetailsHeaderCollapsed(
                    site.identifier,
                    false
                );
            };
        },
        [site.identifier]
    );

    return <SiteDetailsHeader {...props} />;
};

export const Default: Story = {
    render: (args) => {
        const { httpMonitor, site } = createSiteScenario();

        return (
            <SiteDetailsHeader
                {...args}
                selectedMonitor={httpMonitor}
                site={site}
            />
        );
    },
};

export const NonHttpMonitorSelected: Story = {
    render: (args) => {
        const { pingMonitor, site } = createSiteScenario();

        return (
            <SiteDetailsHeader
                {...args}
                selectedMonitor={pingMonitor}
                site={site}
            />
        );
    },
};

export const NoMonitorSelected: Story = {
    render: (args) => {
        const { site } = createSiteScenario();

        return <SiteDetailsHeader {...args} site={site} />;
    },
};

export const Collapsed: Story = {
    render: (args) => {
        const { httpMonitor, site } = createSiteScenario();

        return (
            <CollapsedHeaderStory
                {...args}
                selectedMonitor={httpMonitor}
                site={site}
            />
        );
    },
};

export const InvalidMonitorUrl: Story = {
    render: (args) => {
        const { httpMonitor, pingMonitor, site } = createSiteScenario();
        const invalidMonitor = {
            ...httpMonitor,
            url: "not-a-valid-url",
        } satisfies Monitor;

        return (
            <SiteDetailsHeader
                {...args}
                selectedMonitor={invalidMonitor}
                site={{
                    ...site,
                    monitors: [invalidMonitor, pingMonitor],
                }}
            />
        );
    },
};

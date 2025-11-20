import { render, screen } from "@testing-library/react";
import type { Monitor, Site } from "@shared/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteTableView } from "../../../../components/Dashboard/SiteList/SiteTableView";
import type { SiteTableRowProperties } from "../../../../components/Dashboard/SiteList/SiteTableRow";

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 60_000,
    history: [],
    id: overrides.id ?? `monitor-${Math.random().toString(36).slice(2)}`,
    monitoring: overrides.monitoring ?? true,
    responseTime: overrides.responseTime ?? 120,
    retryAttempts: overrides.retryAttempts ?? 0,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 30_000,
    type: overrides.type ?? "http",
    url: overrides.url ?? "https://example.com",
    ...overrides,
});

const createSite = (identifier: string, name: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [createMonitor({ id: `${identifier}-monitor` })],
    name,
});

const siteTableRowMock = vi.fn<(props: SiteTableRowProperties) => void>();

vi.mock("../../../../components/Dashboard/SiteList/SiteTableRow", () => ({
    SiteTableRow: (props: SiteTableRowProperties) => {
        siteTableRowMock(props);
        return null;
    },
}));

describe(SiteTableView, () => {
    beforeEach(() => {
        siteTableRowMock.mockClear();
    });

    it("renders a row for each site and alternates row variants", () => {
        const sites = [
            createSite("alpha", "Alpha"),
            createSite("beta", "Beta"),
            createSite("gamma", "Gamma"),
        ];

        render(<SiteTableView density="comfortable" sites={sites} />);

        expect(siteTableRowMock).toHaveBeenCalledTimes(sites.length);
        expect(siteTableRowMock.mock.calls[0]?.[0].rowVariant).toBe("even");
        expect(siteTableRowMock.mock.calls[1]?.[0].rowVariant).toBe("odd");
        expect(siteTableRowMock.mock.calls[2]?.[0].rowVariant).toBe("even");
    });

    it("applies the correct density class names", () => {
        render(
            <SiteTableView
                density="compact"
                sites={[createSite("alpha", "Alpha")]}
            />
        );

        const table = screen.getByRole("table");
        expect(table).toHaveClass("density--compact");
        expect(table).toHaveClass("site-table--compact");
    });
});

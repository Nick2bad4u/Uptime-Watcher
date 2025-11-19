/**
 * Tabular representation of monitored sites for the list layout mode.
 */

import type { Site } from "@shared/types";

import { memo, type NamedExoticComponent } from "react";

import type { SiteTableDensity } from "../../../stores/ui/types";

import { ThemedBox } from "../../../theme/components/ThemedBox";
import { SiteTableRow } from "./SiteTableRow";
import "./SiteTableView.css";

interface ColumnDefinition {
    readonly align?: "end" | "start";
    readonly className?: string;
    readonly key: string;
    readonly label: string;
}

const COLUMN_DEFINITIONS: readonly ColumnDefinition[] = [
    { className: "site-table__col-site", key: "site", label: "Site" },
    { className: "site-table__col-monitor", key: "monitor", label: "Monitor" },
    { className: "site-table__col-status", key: "status", label: "Status" },
    { className: "site-table__col-uptime", key: "uptime", label: "Uptime" },
    {
        className: "site-table__col-response",
        key: "response",
        label: "Response",
    },
    { className: "site-table__col-running", key: "running", label: "Running" },
    {
        align: "end",
        className: "site-table__col-controls",
        key: "controls",
        label: "Controls",
    },
] as const;

const DENSITY_CLASS_MAP: Record<SiteTableDensity, string | undefined> = {
    comfortable: "site-table--comfortable",
    compact: "site-table--compact",
    cozy: "site-table--cozy",
};

/**
 * Properties for {@link SiteTableView}.
 */
export interface SiteTableViewProperties {
    /** Density setting controlling row spacing and compactness. */
    readonly density: SiteTableDensity;
    /** Collection of sites to display. */
    readonly sites: readonly Site[];
}

/**
 * Renders sites in a compact table layout with fixed column widths.
 */
export const SiteTableView: NamedExoticComponent<SiteTableViewProperties> =
    memo(function SiteTableView({ density, sites }: SiteTableViewProperties) {
        const densityClassName =
            DENSITY_CLASS_MAP[density] ?? DENSITY_CLASS_MAP.comfortable ?? "";
        const tableClassName = densityClassName
            ? `site-table ${densityClassName}`
            : "site-table";

        return (
            <ThemedBox
                className={tableClassName}
                padding="sm"
                rounded="lg"
                shadow="sm"
                surface="elevated"
            >
                <div
                    aria-label="Monitored Sites"
                    className="site-table__container"
                    role="table"
                >
                    <div
                        className="site-table__header site-table__grid-layout"
                        role="row"
                    >
                        {COLUMN_DEFINITIONS.map((column) => {
                            const headingClass =
                                column.align === "end"
                                    ? "site-table__heading site-table__heading--end"
                                    : "site-table__heading";

                            return (
                                <div
                                    className={headingClass}
                                    key={column.key}
                                    role="columnheader"
                                    title={column.label}
                                >
                                    <span>{column.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="site-table__body" role="rowgroup">
                        {sites.map((siteEntry) => (
                            <SiteTableRow
                                key={siteEntry.identifier}
                                site={siteEntry}
                            />
                        ))}
                    </div>
                </div>
            </ThemedBox>
        );
    });

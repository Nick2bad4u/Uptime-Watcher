/**
 * Tabular representation of monitored sites for the list layout mode.
 */

import type { Site } from "@shared/types";

import { memo, type NamedExoticComponent } from "react";

import type { InterfaceDensity } from "../../../stores/ui/types";

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

const DENSITY_CLASS_MAP: Record<InterfaceDensity, string> = {
    comfortable: "site-table--comfortable density--comfortable",
    compact: "site-table--compact density--compact",
    cozy: "site-table--cozy density--cozy",
};

/**
 * Properties for {@link SiteTableView}.
 */
export interface SiteTableViewProperties {
    /** Density setting controlling row spacing and compactness. */
    readonly density: InterfaceDensity;
    /** Collection of sites to display. */
    readonly sites: readonly Site[];
}

/**
 * Renders sites in a compact table layout with fixed column widths.
 */
export const SiteTableView: NamedExoticComponent<SiteTableViewProperties> =
    memo(function SiteTableViewComponent({
        density,
        sites,
    }: SiteTableViewProperties) {
        const densityClassName = DENSITY_CLASS_MAP[density];
        const tableClassName = `site-table ${densityClassName}`;

        return (
            <ThemedBox
                className={tableClassName}
                padding="sm"
                rounded="lg"
                shadow="sm"
                surface="elevated"
            >
                <div className="site-table__container">
                    <table
                        aria-label="Monitored Sites"
                        className={densityClassName}
                    >
                        <thead className="site-table__header">
                            <tr className="site-table__grid-layout">
                                {COLUMN_DEFINITIONS.map((column) => {
                                    const headingBaseClass =
                                        column.align === "end"
                                            ? "site-table__heading site-table__heading--end"
                                            : "site-table__heading";
                                    const headingClass = column.className
                                        ? `${headingBaseClass} ${column.className}`
                                        : headingBaseClass;

                                    return (
                                        <th
                                            className={headingClass}
                                            key={column.key}
                                            scope="col"
                                            title={column.label}
                                        >
                                            <span>{column.label}</span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="site-table__body">
                            {sites.map((siteEntry, index) => (
                                <SiteTableRow
                                    key={siteEntry.identifier}
                                    rowOrder={index}
                                    rowVariant={
                                        index % 2 === 0 ? "even" : "odd"
                                    }
                                    site={siteEntry}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </ThemedBox>
        );
    });

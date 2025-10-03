/**
 * Tabular representation of monitored sites for the list layout mode.
 */

import type { Site } from "@shared/types";

import { memo, type NamedExoticComponent } from "react";

import { ThemedBox } from "../../../theme/components/ThemedBox";
import { SiteTableRow } from "./SiteTableRow";

/**
 * Properties for {@link SiteTableView}.
 */
export interface SiteTableViewProperties {
    /** Collection of sites to display. */
    readonly sites: readonly Site[];
}

/**
 * Renders sites in a compact table layout.
 */
export const SiteTableView: NamedExoticComponent<SiteTableViewProperties> =
    memo(function SiteTableView({ sites }: SiteTableViewProperties) {
        return (
            <ThemedBox
                className="site-table"
                padding="sm"
                rounded="lg"
                shadow="sm"
                surface="elevated"
            >
                <table className="site-table__table">
                    <thead>
                        <tr>
                            <th scope="col">Site</th>
                            <th scope="col">Monitor</th>
                            <th scope="col">Status</th>
                            <th scope="col">Uptime</th>
                            <th scope="col">Response</th>
                            <th scope="col">Running</th>
                            <th
                                className="site-table__actions-heading"
                                scope="col"
                            >
                                Controls
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map((siteEntry) => (
                            <SiteTableRow
                                key={siteEntry.identifier}
                                site={siteEntry}
                            />
                        ))}
                    </tbody>
                </table>
            </ThemedBox>
        );
    });

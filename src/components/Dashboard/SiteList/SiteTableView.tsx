/**
 * Tabular representation of monitored sites for the list layout mode with
 * user-resizable columns.
 */

import type { Site } from "@shared/types";

import {
    memo,
    type NamedExoticComponent,
    useCallback,
    useRef,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
} from "react";

import type { SiteTableColumnKey } from "../../../stores/ui/types";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { SiteTableRow } from "./SiteTableRow";

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectColumnWidths = (state: UiStoreState) => state.siteTableColumnWidths;
const selectSetColumnWidths = (state: UiStoreState) =>
    state.setSiteTableColumnWidths;

interface ColumnDefinition {
    align?: "start" | "end";
    readonly key: SiteTableColumnKey;
    readonly label: string;
}

const COLUMN_DEFINITIONS: readonly ColumnDefinition[] = [
    { key: "site", label: "Site" },
    { key: "monitor", label: "Monitor" },
    { key: "status", label: "Status" },
    { key: "uptime", label: "Uptime" },
    { key: "response", label: "Response" },
    { key: "running", label: "Running" },
    { key: "controls", label: "Controls", align: "end" },
] as const;

const MIN_COLUMN_WIDTH = 8;
const MAX_COLUMN_WIDTH = 48;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

interface ResizableColumnHeaderProperties {
    align: "start" | "end";
    adjacentColumnKey: SiteTableColumnKey;
    columnKey: SiteTableColumnKey;
    columnWidths: Record<SiteTableColumnKey, number>;
    isLast: boolean;
    label: string;
    resizable: boolean;
    setColumnWidths: (
        widths: Partial<Record<SiteTableColumnKey, number>>
    ) => void;
    tableRef: RefObject<HTMLTableElement | null>;
}

const ResizableColumnHeader = ({
    align,
    adjacentColumnKey,
    columnKey,
    columnWidths,
    isLast,
    label,
    resizable,
    setColumnWidths,
    tableRef,
}: ResizableColumnHeaderProperties) => {
    const handlePointerDown = useCallback(
        (event: ReactPointerEvent<HTMLButtonElement>) => {
            if (!resizable) {
                return;
            }

            const tableElement = tableRef.current;
            if (!tableElement) {
                return;
            }

            const tableRect = tableElement.getBoundingClientRect();
            if (tableRect.width <= 0) {
                return;
            }

            const startingWidth = columnWidths[columnKey];
            const adjacentStartingWidth = columnWidths[adjacentColumnKey];

            if (
                startingWidth === undefined ||
                adjacentStartingWidth === undefined
            ) {
                return;
            }

            const totalPairPercent = startingWidth + adjacentStartingWidth;
            const effectiveMin = Math.max(
                MIN_COLUMN_WIDTH,
                totalPairPercent - MAX_COLUMN_WIDTH
            );
            const effectiveMax = Math.min(
                MAX_COLUMN_WIDTH,
                totalPairPercent - MIN_COLUMN_WIDTH
            );

            if (effectiveMin > effectiveMax) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const pointerId = event.pointerId;
            const startX = event.clientX;

            event.currentTarget.setPointerCapture(pointerId);

            const originalCursor = document.body.style.cursor;
            const originalUserSelect = document.body.style.userSelect;

            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";

            const handlePointerMove = (moveEvent: PointerEvent): void => {
                const deltaPx = moveEvent.clientX - startX;
                const deltaPercent = (deltaPx / tableRect.width) * 100;
                let desiredWidth = startingWidth + deltaPercent;
                desiredWidth = clamp(desiredWidth, effectiveMin, effectiveMax);
                const adjustedAdjacent = totalPairPercent - desiredWidth;

                if (
                    Math.abs(desiredWidth - startingWidth) < 0.01 &&
                    Math.abs(adjustedAdjacent - adjacentStartingWidth) < 0.01
                ) {
                    return;
                }

                setColumnWidths({
                    [columnKey]: Number(desiredWidth.toFixed(2)),
                    [adjacentColumnKey]: Number(adjustedAdjacent.toFixed(2)),
                });
            };

            const handlePointerEnd = (): void => {
                event.currentTarget.releasePointerCapture(pointerId);
                document.removeEventListener("pointermove", handlePointerMove);
                document.removeEventListener("pointerup", handlePointerEnd);
                document.removeEventListener("pointercancel", handlePointerEnd);
                document.body.style.cursor = originalCursor;
                document.body.style.userSelect = originalUserSelect;
            };

            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerEnd);
            document.addEventListener("pointercancel", handlePointerEnd);
        },
        [
            adjacentColumnKey,
            columnKey,
            columnWidths,
            resizable,
            setColumnWidths,
            tableRef,
        ]
    );

    const headingClass =
        align === "end"
            ? "site-table__heading site-table__heading--end"
            : "site-table__heading";

    return (
        <th className={headingClass} scope="col">
            <div className="site-table__heading-content">
                <span>{label}</span>
                {resizable ? (
                    <button
                        aria-label={`Resize ${label} column`}
                        className={
                            isLast
                                ? "site-table__resize-handle site-table__resize-handle--last"
                                : "site-table__resize-handle"
                        }
                        onPointerDown={handlePointerDown}
                        type="button"
                    />
                ) : null}
            </div>
        </th>
    );
};

/**
 * Properties for {@link SiteTableView}.
 */
export interface SiteTableViewProperties {
    /** Collection of sites to display. */
    readonly sites: readonly Site[];
}

/**
 * Renders sites in a compact table layout with adjustable column widths.
 */
export const SiteTableView: NamedExoticComponent<SiteTableViewProperties> =
    memo(function SiteTableView({ sites }: SiteTableViewProperties) {
        const tableRef = useRef<HTMLTableElement | null>(null);
        const columnWidths = useUIStore(selectColumnWidths);
        const setColumnWidths = useUIStore(selectSetColumnWidths);

        return (
            <ThemedBox
                className="site-table"
                padding="sm"
                rounded="lg"
                shadow="sm"
                surface="elevated"
            >
                <table className="site-table__table" ref={tableRef}>
                    <colgroup>
                        {COLUMN_DEFINITIONS.map(({ key }) => (
                            <col
                                key={key}
                                style={{ width: `${columnWidths[key]}%` }}
                            />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            {COLUMN_DEFINITIONS.map((column, index) => {
                                const next = COLUMN_DEFINITIONS[index + 1];
                                const previous = COLUMN_DEFINITIONS[index - 1];
                                const adjacent = next ?? previous;
                                const resizable = Boolean(adjacent);

                                return (
                                    <ResizableColumnHeader
                                        key={column.key}
                                        adjacentColumnKey={
                                            adjacent?.key ?? column.key
                                        }
                                        align={column.align ?? "start"}
                                        columnKey={column.key}
                                        columnWidths={columnWidths}
                                        isLast={
                                            index ===
                                            COLUMN_DEFINITIONS.length - 1
                                        }
                                        label={column.label}
                                        resizable={resizable}
                                        setColumnWidths={setColumnWidths}
                                        tableRef={tableRef}
                                    />
                                );
                            })}
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

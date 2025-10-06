/**
 * Tabular representation of monitored sites for the list layout mode with
 * user-resizable columns.
 */

import type { Site } from "@shared/types";

import {
    type CSSProperties,
    memo,
    type NamedExoticComponent,
    type PointerEvent as ReactPointerEvent,
    type RefObject,
    useMemo,
    useRef,
} from "react";

import type { SiteTableColumnKey } from "../../../stores/ui/types";

import { useUIStore } from "../../../stores/ui/useUiStore";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { SiteTableRow } from "./SiteTableRow";
import "./SiteTableView.css";

type UiStoreState = ReturnType<typeof useUIStore.getState>;

const selectColumnWidths = (
    state: UiStoreState
): UiStoreState["siteTableColumnWidths"] => state.siteTableColumnWidths;
const selectSetColumnWidths = (
    state: UiStoreState
): UiStoreState["setSiteTableColumnWidths"] => state.setSiteTableColumnWidths;

interface ColumnDefinition {
    readonly align?: "end" | "start";
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
    { align: "end", key: "controls", label: "Controls" },
] as const;

const MIN_COLUMN_WIDTH = 8;
const MAX_COLUMN_WIDTH = 48;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

interface ColumnResizeContext {
    readonly adjacentColumnKey: SiteTableColumnKey;
    readonly columnKey: SiteTableColumnKey;
    readonly columnWidths: Record<SiteTableColumnKey, number>;
    readonly resizable: boolean;
    readonly setColumnWidths: (
        widths: Partial<Record<SiteTableColumnKey, number>>
    ) => void;
    readonly tableRef: RefObject<HTMLTableElement | null>;
}

const noopPointerDown = (): void => {};

/**
 * Creates a pointer handler that manages interactive column resizing.
 *
 * @param context - Runtime context needed to compute width adjustments.
 *
 * @returns Pointer handler bound to the supplied column configuration.
 */
function createPointerDownHandler({
    adjacentColumnKey,
    columnKey,
    columnWidths,
    resizable,
    setColumnWidths,
    tableRef,
}: ColumnResizeContext): (event: ReactPointerEvent<HTMLButtonElement>) => void {
    if (!resizable) {
        return noopPointerDown;
    }

    return (event: ReactPointerEvent<HTMLButtonElement>): void => {
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

        const resizeHandle = event.currentTarget;
        const { clientX: startX, pointerId } = event;

        resizeHandle.setPointerCapture(pointerId);

        const originalCursor = document.body.style.cursor;
        const originalUserSelect = document.body.style.userSelect;

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const handlePointerMove = (moveEvent: PointerEvent): void => {
            const deltaPx = moveEvent.clientX - startX;
            const deltaPercent = (deltaPx / tableRect.width) * 100;
            const desiredWidth = clamp(
                startingWidth + deltaPercent,
                effectiveMin,
                effectiveMax
            );
            const adjustedAdjacent = totalPairPercent - desiredWidth;

            if (
                Math.abs(desiredWidth - startingWidth) < 0.01 &&
                Math.abs(adjustedAdjacent - adjacentStartingWidth) < 0.01
            ) {
                return;
            }

            setColumnWidths({
                [adjacentColumnKey]: Number(adjustedAdjacent.toFixed(2)),
                [columnKey]: Number(desiredWidth.toFixed(2)),
            });
        };

        const handlePointerEnd = (): void => {
            if (resizeHandle.hasPointerCapture(pointerId)) {
                resizeHandle.releasePointerCapture(pointerId);
            }

            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerEnd);
            document.removeEventListener("pointercancel", handlePointerEnd);
            document.body.style.cursor = originalCursor;
            document.body.style.userSelect = originalUserSelect;
        };

        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerEnd);
        document.addEventListener("pointercancel", handlePointerEnd);
    };
}

/**
 * Builds a memoizable style map for the current column widths.
 *
 * @param columnWidths - Width percentages keyed by column identifier.
 *
 * @returns Mapping of column keys to inline style objects.
 */
function computeColumnStyles(
    columnWidths: Record<SiteTableColumnKey, number>
): Record<SiteTableColumnKey, CSSProperties> {
    return {
        controls: { width: `${columnWidths.controls}%` },
        monitor: { width: `${columnWidths.monitor}%` },
        response: { width: `${columnWidths.response}%` },
        running: { width: `${columnWidths.running}%` },
        site: { width: `${columnWidths.site}%` },
        status: { width: `${columnWidths.status}%` },
        uptime: { width: `${columnWidths.uptime}%` },
    } satisfies Record<SiteTableColumnKey, CSSProperties>;
}

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
        const columnStyles = useMemo(
            () => computeColumnStyles(columnWidths),
            [columnWidths]
        );

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
                            <col key={key} style={columnStyles[key]} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr>
                            {COLUMN_DEFINITIONS.map((column, index) => {
                                const next = COLUMN_DEFINITIONS[index + 1];
                                const previous = COLUMN_DEFINITIONS[index - 1];
                                const adjacent = next ?? previous;
                                const resizable = adjacent !== undefined;
                                const adjacentColumnKey =
                                    adjacent?.key ?? column.key;
                                const headingClass =
                                    column.align === "end"
                                        ? "site-table__heading site-table__heading--end"
                                        : "site-table__heading";
                                const isLastColumn =
                                    index === COLUMN_DEFINITIONS.length - 1;
                                const pointerDownHandler =
                                    createPointerDownHandler({
                                        adjacentColumnKey,
                                        columnKey: column.key,
                                        columnWidths,
                                        resizable,
                                        setColumnWidths,
                                        tableRef,
                                    });
                                const resizeHandleClass = isLastColumn
                                    ? "site-table__resize-handle site-table__resize-handle--last"
                                    : "site-table__resize-handle";

                                return (
                                    <th
                                        className={headingClass}
                                        key={column.key}
                                        scope="col"
                                    >
                                        <div className="site-table__heading-content">
                                            <span>{column.label}</span>
                                            {resizable ? (
                                                <button
                                                    aria-label={`Resize ${column.label} column`}
                                                    className={
                                                        resizeHandleClass
                                                    }
                                                    onPointerDown={
                                                        pointerDownHandler
                                                    }
                                                    type="button"
                                                />
                                            ) : null}
                                        </div>
                                    </th>
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

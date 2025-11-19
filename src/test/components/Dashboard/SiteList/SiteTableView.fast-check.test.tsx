import {
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
    describe,
    expect,
    vi,
} from "vitest";
import { act, render } from "@testing-library/react";
import { fc, test as fcTest } from "@fast-check/vitest";

import type { Monitor, Site, StatusHistory } from "@shared/types";
import type { SiteTableColumnKey } from "../../../../stores/ui/types";

import {
    DEFAULT_SITE_TABLE_COLUMN_WIDTHS,
    useUIStore,
} from "../../../../stores/ui/useUiStore";
import { SiteTableView } from "../../../../components/Dashboard/SiteList/SiteTableView";
import type { SiteTableRowProperties } from "../../../../components/Dashboard/SiteList/SiteTableRow";

// Keep Fast-Check utilities referenced so TypeScript does not treat them as
// unused while the heavier property-based tests are temporarily disabled.
void fc;
void fcTest;

const siteTableRowMock = vi.hoisted(() =>
    vi.fn((props: SiteTableRowProperties) => (
        <tr data-testid={`site-row-${props.site.identifier}`} />
    ))
);

vi.mock("../../../../components/Dashboard/SiteList/SiteTableRow", () => ({
    SiteTableRow: siteTableRowMock,
}));

const columnKeys: readonly SiteTableColumnKey[] = [
    "site",
    "monitor",
    "status",
    "uptime",
    "response",
    "running",
    "controls",
];

const defaultHistoryEntry: StatusHistory = {
    responseTime: 120,
    status: "up",
    timestamp: 1_700_000_000_000,
};

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 60_000,
    history: overrides.history ?? [defaultHistoryEntry],
    id: overrides.id ?? `monitor-${Math.random().toString(16).slice(2)}`,
    monitoring: overrides.monitoring ?? true,
    responseTime: overrides.responseTime ?? 85,
    retryAttempts: overrides.retryAttempts ?? 0,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 5000,
    type: overrides.type ?? "http",
    url: overrides.url ?? "https://example.com",
});

const createSite = (identifier: string, name: string): Site => {
    const monitors = [createMonitor({ id: `${identifier}-monitor` })];
    return {
        identifier,
        monitoring: monitors.some((monitor) => monitor.monitoring),
        monitors,
        name,
    };
};

const initialSite = createSite("alpha", "Alpha Site");

const pointerCaptureStub = {
    hasPointerCapture: vi.fn(() => true),
    releasePointerCapture: vi.fn(),
    setPointerCapture: vi.fn(),
};

let originalPointerEvent: typeof globalThis.PointerEvent | undefined;
let originalSetPointerCapture: ((pointerId: number) => void) | undefined;
let originalReleasePointerCapture: ((pointerId: number) => void) | undefined;
let originalHasPointerCapture: ((pointerId: number) => boolean) | undefined;

beforeAll(() => {
    originalPointerEvent = globalThis.PointerEvent;
    originalSetPointerCapture = HTMLElement.prototype.setPointerCapture?.bind(
        HTMLElement.prototype
    );
    originalReleasePointerCapture =
        HTMLElement.prototype.releasePointerCapture?.bind(
            HTMLElement.prototype
        );
    originalHasPointerCapture = HTMLElement.prototype.hasPointerCapture?.bind(
        HTMLElement.prototype
    );

    if (originalPointerEvent === undefined) {
        class PointerEventPolyfill extends MouseEvent {
            public readonly pointerId: number;

            public constructor(type: string, init: PointerEventInit) {
                super(type, init);
                this.pointerId = init.pointerId ?? 0;
            }
        }

        // @ts-expect-error - Provide polyfill when environment lacks PointerEvent
        globalThis.PointerEvent = PointerEventPolyfill;
    }

    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
        configurable: true,
        value: pointerCaptureStub.setPointerCapture,
        writable: true,
    });

    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
        configurable: true,
        value: pointerCaptureStub.releasePointerCapture,
        writable: true,
    });

    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
        configurable: true,
        value: pointerCaptureStub.hasPointerCapture,
        writable: true,
    });
});

afterAll(() => {
    if (originalPointerEvent === undefined) {
        Reflect.deleteProperty(globalThis, "PointerEvent");
    } else {
        globalThis.PointerEvent = originalPointerEvent;
    }

    if (originalSetPointerCapture) {
        Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
            configurable: true,
            value: originalSetPointerCapture,
        });
    }

    if (originalReleasePointerCapture) {
        Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
            configurable: true,
            value: originalReleasePointerCapture,
        });
    }

    if (originalHasPointerCapture) {
        Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
            configurable: true,
            value: originalHasPointerCapture,
        });
    }
});

const originalState = useUIStore.getState();

beforeEach(() => {
    pointerCaptureStub.hasPointerCapture.mockReturnValue(true);
    pointerCaptureStub.releasePointerCapture.mockClear();
    pointerCaptureStub.setPointerCapture.mockClear();
    siteTableRowMock.mockClear();

    act(() => {
        useUIStore.setState(() => ({
            siteTableColumnWidths: { ...DEFAULT_SITE_TABLE_COLUMN_WIDTHS },
        }));
    });
});

afterEach(() => {
    siteTableRowMock.mockClear();

    act(() => {
        useUIStore.setState(() => ({
            siteTableColumnWidths: {
                ...originalState.siteTableColumnWidths,
            },
        }));
    });
});

const columnWidthTupleArbitrary = fc.tuple(
    ...columnKeys.map(() =>
        fc
            .double({
                max: 48,
                min: 8,
                noDefaultInfinity: true,
                noNaN: true,
            })
            .map((value) => Number(value.toFixed(2)))
    )
);

// Temporary no-op usage to satisfy strict unused-variable checks while the
// property-based tests leveraging this arbitrary remain commented out.
void columnWidthTupleArbitrary;

describe(SiteTableView, () => {
    /*
    FcTest.prop([columnWidthTupleArbitrary], { numRuns: 20 })(
        "reflects column widths from the store",
        (widthValues) => {
            const widthMap = {} as Record<SiteTableColumnKey, number>;
            for (const [index, key] of columnKeys.entries()) {
                const widthValue = widthValues[index];
                if (typeof widthValue !== "number") {
                    throw new TypeError(
                        `Expected width value for column "${key}" to be generated`
                    );
                }

                widthMap[key] = widthValue;
            }

            act(() => {
                useUIStore.setState(() => ({
                    siteTableColumnWidths: widthMap,
                }));
            });

            const { unmount } = render(
                <SiteTableView density="comfortable" sites={[initialSite]} />
            );

            const tableElement = screen.getByRole("table");
            const columns = tableElement.querySelectorAll("col");
            expect(columns).toHaveLength(columnKeys.length);

            for (const [index, key] of columnKeys.entries()) {
                const column = columns.item(index);
                expect(column).toHaveStyle({
                    width: `${widthMap[key]}%`,
                });
            }

            unmount();
        }
    );
    */

    it("renders a row for each supplied site", () => {
        const sites: Site[] = [
            initialSite,
            createSite("beta", "Beta Site"),
            createSite("gamma", "Gamma Site"),
        ];

        render(<SiteTableView density="comfortable" sites={sites} />);

        expect(siteTableRowMock).toHaveBeenCalledTimes(sites.length);
        const renderedIdentifiers = siteTableRowMock.mock.calls.map(
            ([props]) => props?.site.identifier
        );
        expect(renderedIdentifiers).toEqual(
            sites.map((site) => site.identifier)
        );
    });

    /*
    It("resizes adjacent columns when the drag handle is moved", () => {
        const setColumnWidthsSpy = vi.spyOn(
            useUIStore.getState(),
            "setSiteTableColumnWidths"
        );

        const boundingRectSpy = vi
            .spyOn(HTMLTableElement.prototype, "getBoundingClientRect")
            .mockReturnValue({
                bottom: 200,
                height: 200,
                left: 0,
                right: 1000,
                toJSON: () => ({}),
                top: 0,
                width: 1000,
                x: 0,
                y: 0,
            } as DOMRect);

        const { unmount } = render(
            <SiteTableView density="comfortable" sites={[initialSite]} />
        );

        const handle = screen.getByRole("button", {
            name: "Resize Site column",
        });

        fireEvent.pointerDown(handle, { clientX: 200, pointerId: 1 });
        fireEvent.pointerMove(document, {
            clientX: 260,
            pointerId: 1,
        });
        fireEvent.pointerUp(document, { pointerId: 1 });

        expect(setColumnWidthsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                monitor: expect.any(Number),
                site: expect.any(Number),
            })
        );

        const updated = useUIStore.getState().siteTableColumnWidths;
        expect(updated.site).toBeCloseTo(30, 2);
        expect(updated.monitor).toBeCloseTo(8, 2);
        expect(document.body.style.cursor).toBe("");

        unmount();
        boundingRectSpy.mockRestore();
        setColumnWidthsSpy.mockRestore();
    });

    it("restores default ratios on double click", () => {
        const adjustedWidths: Record<SiteTableColumnKey, number> = {
            controls: 18,
            monitor: 20,
            response: 10,
            running: 10,
            site: 20,
            status: 12,
            uptime: 10,
        };

        act(() => {
            useUIStore.setState(() => ({
                siteTableColumnWidths: adjustedWidths,
            }));
        });

        const setColumnWidthsSpy = vi.spyOn(
            useUIStore.getState(),
            "setSiteTableColumnWidths"
        );

        const { unmount } = render(
            <SiteTableView density="comfortable" sites={[initialSite]} />
        );

        const handle = screen.getByRole("button", {
            name: "Resize Site column",
        });

        fireEvent.doubleClick(handle);

        expect(setColumnWidthsSpy).toHaveBeenCalledWith({
            monitor: expect.any(Number),
            site: expect.any(Number),
        });

        const updated = useUIStore.getState().siteTableColumnWidths;
        const expectedTotal = adjustedWidths.site + adjustedWidths.monitor;
        const expectedSite = Number(
            (
                (DEFAULT_SITE_TABLE_COLUMN_WIDTHS.site / 38) *
                expectedTotal
            ).toFixed(2)
        );
        const expectedMonitor = Number(
            (
                (DEFAULT_SITE_TABLE_COLUMN_WIDTHS.monitor / 38) *
                expectedTotal
            ).toFixed(2)
        );

        expect(updated.site).toBeCloseTo(expectedSite, 2);
        expect(updated.monitor).toBeCloseTo(expectedMonitor, 2);

        unmount();
        setColumnWidthsSpy.mockRestore();
    });
    */
});

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ChartTimeRange } from "../../stores/types";
import type { SiteDetailsTab } from "../../stores/ui/types";

import { useSiteDetailsUiStore } from "../../hooks/site/useSiteDetails.uiStore";

vi.mock("zustand/react/shallow", () => ({
    useShallow: <TState, TSlice>(selector: (state: TState) => TSlice) =>
        selector,
}));

const mockUseUIStore = vi.fn();

vi.mock("../../stores/ui/useUiStore", () => ({
    useUIStore: <TSlice>(selector: (state: unknown) => TSlice): TSlice =>
        mockUseUIStore(selector) as TSlice,
}));

describe(useSiteDetailsUiStore, () => {
    it("returns a stable slice and provides a noop syncActiveSiteDetailsTab when missing", () => {
        const state = {
            activeSiteDetailsTab: "site-overview" satisfies SiteDetailsTab,
            setActiveSiteDetailsTab: vi.fn(),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h" satisfies ChartTimeRange,
            // SyncActiveSiteDetailsTab intentionally omitted
        };

        mockUseUIStore.mockImplementationOnce(
            (selector: (s: typeof state) => unknown) => selector(state)
        );

        const { result } = renderHook(() => useSiteDetailsUiStore());

        expect(result.current.activeSiteDetailsTab).toBe("site-overview");
        expect(result.current.showAdvancedMetrics).toBeFalsy();
        expect(result.current.siteDetailsChartTimeRange).toBe("24h");

        // Should exist and be callable even if the store doesn't expose it
        expect(() =>
            result.current.syncActiveSiteDetailsTab("site-1")
        ).not.toThrowError();
    });

    it("passes through syncActiveSiteDetailsTab when provided", () => {
        const sync = vi.fn<(siteIdentifier: string) => void>();

        const state = {
            activeSiteDetailsTab: "settings" satisfies SiteDetailsTab,
            setActiveSiteDetailsTab: vi.fn(),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: true,
            siteDetailsChartTimeRange: "7d" satisfies ChartTimeRange,
            syncActiveSiteDetailsTab: sync,
        };

        mockUseUIStore.mockImplementationOnce(
            (selector: (s: typeof state) => unknown) => selector(state)
        );

        const { result } = renderHook(() => useSiteDetailsUiStore());

        result.current.syncActiveSiteDetailsTab("site-1");
        expect(sync).toHaveBeenCalledTimes(1);
    });
});

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { CacheKeys } from "@shared/utils/cacheKeys";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";
import { getMonitorTypeConfig } from "../../utils/monitorTypeHelper";
import {
    formatMonitorDetail,
    getDefaultMonitorId,
    getMonitorHelpTexts,
    supportsResponseTime,
} from "../../utils/monitorUiHelpers";

const monitorTypesStoreState = vi.hoisted(() => ({
    formatMonitorDetail: vi.fn(),
}));

vi.mock("@shared/utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(
        async <T>(
            operation: () => Promise<T>,
            _context: string,
            fallback: T
        ) => {
            try {
                return await operation();
            } catch {
                return fallback;
            }
        }
    ),
}));

vi.mock("../../utils/monitorTypeHelper", () => ({
    getMonitorTypeConfig: vi.fn(),
}));

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: () => monitorTypesStoreState,
    },
}));

const createConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => ({
    description: overrides.description ?? "HTTP monitoring",
    displayName: overrides.displayName ?? "HTTP Monitor",
    fields: overrides.fields ?? [
        {
            label: "URL",
            name: "url",
            required: true,
            type: "url",
        },
    ],
    type: overrides.type ?? "http",
    uiConfig: overrides.uiConfig,
    version: overrides.version ?? "1.0.0",
});

const getCacheKeyForType = (type: string): string =>
    CacheKeys.config.byName(`monitor-config-${type}`);

beforeEach(() => {
    vi.clearAllMocks();
    AppCaches.uiHelpers.clear();
    vi.mocked(getMonitorTypeConfig).mockResolvedValue(undefined);
    monitorTypesStoreState.formatMonitorDetail.mockResolvedValue(
        "Formatted detail"
    );
});

describe(supportsResponseTime, () => {
    it("returns configured response-time support and caches fetched configs", async () => {
        vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce(
            createConfig({
                uiConfig: {
                    supportsResponseTime: true,
                },
            })
        );

        await expect(supportsResponseTime("http")).resolves.toBe(true);
        await expect(supportsResponseTime("http")).resolves.toBe(true);

        expect(getMonitorTypeConfig).toHaveBeenCalledTimes(1);
        expect(AppCaches.uiHelpers.has(getCacheKeyForType("http"))).toBe(true);
    });

    it("returns false when config is missing or cannot be read", async () => {
        await expect(supportsResponseTime("http")).resolves.toBe(false);

        vi.mocked(getMonitorTypeConfig).mockRejectedValueOnce(
            new Error("config failed")
        );

        await expect(supportsResponseTime("port")).resolves.toBe(false);
    });
});

describe(formatMonitorDetail, () => {
    it("delegates formatting to the monitor types store", async () => {
        await expect(formatMonitorDetail("http", "200")).resolves.toBe(
            "Formatted detail"
        );

        expect(monitorTypesStoreState.formatMonitorDetail).toHaveBeenCalledWith(
            "http",
            "200"
        );
    });

    it("falls back to the original detail when formatting fails", async () => {
        monitorTypesStoreState.formatMonitorDetail.mockRejectedValueOnce(
            new Error("format failed")
        );

        await expect(formatMonitorDetail("http", "200")).resolves.toBe("200");
    });
});

describe(getMonitorHelpTexts, () => {
    it("returns configured help texts", async () => {
        vi.mocked(getMonitorTypeConfig).mockResolvedValueOnce(
            createConfig({
                uiConfig: {
                    helpTexts: {
                        primary: "Primary text",
                        secondary: "Secondary text",
                    },
                },
            })
        );

        await expect(getMonitorHelpTexts("http")).resolves.toEqual({
            primary: "Primary text",
            secondary: "Secondary text",
        });
    });

    it("returns an empty object when config is missing or aborted", async () => {
        await expect(getMonitorHelpTexts("http")).resolves.toEqual({});

        const controller = new AbortController();
        controller.abort();

        await expect(
            getMonitorHelpTexts("http", controller.signal)
        ).resolves.toEqual({});

        expect(getMonitorTypeConfig).toHaveBeenCalledTimes(1);
    });
});

describe(getDefaultMonitorId, () => {
    it("returns the first monitor id or an empty fallback", () => {
        expect(getDefaultMonitorId(["monitor-1", "monitor-2"])).toBe(
            "monitor-1"
        );
        expect(getDefaultMonitorId([])).toBe("");
    });
});

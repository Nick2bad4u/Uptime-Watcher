import { beforeEach, describe, expect, it, vi } from "vitest";

const modulePath = "../../../utils/database/siteDeletion";
const errorUtilsModulePath = "../../../../shared/utils/errorHandling";

interface MonitorAdapterStub {
    deleteBySiteIdentifier: ReturnType<typeof vi.fn>;
    findBySiteIdentifier: ReturnType<typeof vi.fn>;
}

interface SiteAdapterStub {
    delete: ReturnType<typeof vi.fn>;
}

interface AdapterFactoryOptions {
    deleteBySiteIdentifier?: MonitorAdapterStub["deleteBySiteIdentifier"];
    findBySiteIdentifier?: MonitorAdapterStub["findBySiteIdentifier"];
}

function createMonitorAdapter(overrides: AdapterFactoryOptions = {}) {
    const monitorMocks: MonitorAdapterStub = {
        deleteBySiteIdentifier: vi.fn(),
        findBySiteIdentifier: vi.fn(() => []),
        ...overrides,
    };

    return {
        adapter: monitorMocks as unknown,
        mocks: monitorMocks,
    };
}

function createSiteAdapter(overrides: Partial<SiteAdapterStub> = {}): {
    adapter: unknown;
    mocks: SiteAdapterStub;
} {
    const siteMocks: SiteAdapterStub = {
        delete: vi.fn(() => true),
        ...overrides,
    };

    return {
        adapter: siteMocks as unknown,
        mocks: siteMocks,
    };
}

describe("deleteSiteWithAdapters runtime coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reuses preloaded monitors to avoid duplicate lookups", async () => {
        const preloadedMonitors = [{ id: "pre-1" }, { id: "pre-2" }];
        const { adapter: monitorAdapter, mocks: monitorMocks } =
            createMonitorAdapter();
        const { adapter: siteAdapter, mocks: siteMocks } = createSiteAdapter();
        const { deleteSiteWithAdapters } = await import(modulePath);

        const result = deleteSiteWithAdapters({
            identifier: "site-preloaded",
            monitorAdapter: monitorAdapter,
            preloadedMonitors: preloadedMonitors as never,
            siteAdapter: siteAdapter,
        });

        expect(result).toStrictEqual({
            monitorCount: preloadedMonitors.length,
            siteDeleted: true,
        });
        expect(monitorMocks.findBySiteIdentifier).not.toHaveBeenCalled();
        expect(monitorMocks.deleteBySiteIdentifier).toHaveBeenCalledWith(
            "site-preloaded"
        );
        expect(siteMocks.delete).toHaveBeenCalledWith("site-preloaded");
    });

    it("falls back to fetching monitors when preload data is absent", async () => {
        const fetchedMonitors = [
            { id: "a" },
            { id: "b" },
            { id: "c" },
        ];
        const { adapter: monitorAdapter, mocks: monitorMocks } =
            createMonitorAdapter({
                findBySiteIdentifier: vi.fn(() => fetchedMonitors),
            });
        const { adapter: siteAdapter } = createSiteAdapter({
            delete: vi.fn(() => false),
        });
        const { deleteSiteWithAdapters } = await import(modulePath);

        const result = deleteSiteWithAdapters({
            identifier: "site-fetch",
            monitorAdapter: monitorAdapter,
            siteAdapter: siteAdapter,
        });

        expect(monitorMocks.findBySiteIdentifier).toHaveBeenCalledWith(
            "site-fetch"
        );
        expect(result).toStrictEqual({
            monitorCount: fetchedMonitors.length,
            siteDeleted: false,
        });
    });

    it("normalizes thrown values before raising SiteDeletionError", async () => {
        const failure = "boom";
        const normalized = new Error("normalized boom");
        const errorModule = await import(errorUtilsModulePath);
        const ensureErrorSpy = vi
            .spyOn(errorModule, "ensureError")
            .mockReturnValue(normalized);
        const { adapter: monitorAdapter } = createMonitorAdapter({
            deleteBySiteIdentifier: vi.fn(() => {
                throw failure;
            }),
        });
        const { adapter: siteAdapter } = createSiteAdapter();
        const { deleteSiteWithAdapters, SiteDeletionError } = await import(
            modulePath
        );

        await expect(() =>
            deleteSiteWithAdapters({
                identifier: "site-failure",
                monitorAdapter: monitorAdapter,
                preloadedMonitors: [] as never,
                siteAdapter: siteAdapter,
            })
        ).toThrow(SiteDeletionError);

        const thrown = vi.mocked(ensureErrorSpy).mock.calls[0]?.[0];
        expect(thrown).toBe(failure);
        expect(ensureErrorSpy).toHaveBeenCalledTimes(1);
    });
});

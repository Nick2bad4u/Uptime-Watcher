import { beforeEach, describe, expect, it, vi } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

const modulePath = "../../../../../../electron/utils/database/siteDeletion";
const errorUtilsPath = "../../../../../../shared/utils/errorHandling";

/** Arbitrary for generating valid site identifiers */
const siteIdentifierArbitrary = fc
    .uuid()
    .map((uuid) => `site-${uuid.slice(0, 8)}`);

/** Arbitrary for generating monitors array */
const monitorsArbitrary = fc
    .array(
        fc.uuid().map((uuid) => ({ id: uuid.slice(0, 8) })),
        { minLength: 0, maxLength: 10 }
    )
    .filter((arr) => arr.length === new Set(arr.map((m) => m.id)).size);

interface MonitorAdapterMocks {
    deleteBySiteIdentifier: ReturnType<typeof vi.fn>;
    findBySiteIdentifier: ReturnType<typeof vi.fn>;
}

interface SiteAdapterMocks {
    delete: ReturnType<typeof vi.fn>;
}

type SiteMonitorsStub = { id: string }[];

function createMonitorAdapter(overrides: Partial<MonitorAdapterMocks> = {}) {
    const monitorMocks: MonitorAdapterMocks = {
        deleteBySiteIdentifier: vi.fn(),
        findBySiteIdentifier: vi.fn(() => [] as SiteMonitorsStub),
        ...overrides,
    };

    return {
        adapter: monitorMocks as unknown,
        mocks: monitorMocks,
    };
}

function createSiteAdapter(overrides: Partial<SiteAdapterMocks> = {}) {
    const siteMocks: SiteAdapterMocks = {
        delete: vi.fn(() => true),
        ...overrides,
    };

    return {
        adapter: siteMocks as unknown,
        mocks: siteMocks,
    };
}

describe("deleteSiteWithAdapters", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("returns metadata while reusing preloaded monitors", async () => {
        const { adapter: monitorAdapter, mocks: monitorMocks } =
            createMonitorAdapter();
        const { adapter: siteAdapter, mocks: siteMocks } = createSiteAdapter();
        const { deleteSiteWithAdapters } = await import(modulePath);
        const preloadedMonitors = [
            { id: "m-1" },
            { id: "m-2" },
        ] as SiteMonitorsStub;

        const result = deleteSiteWithAdapters({
            identifier: "site-123",
            monitorAdapter: monitorAdapter as unknown,
            preloadedMonitors: preloadedMonitors as unknown,
            siteAdapter: siteAdapter as unknown,
        });

        expect(result).toStrictEqual({
            monitorCount: preloadedMonitors.length,
            siteDeleted: true,
        });
        expect(
            monitorMocks.deleteBySiteIdentifier
        ).toHaveBeenCalledExactlyOnceWith("site-123");
        expect(monitorMocks.findBySiteIdentifier).not.toHaveBeenCalled();
        expect(siteMocks.delete).toHaveBeenCalledWith("site-123");
    });

    it("fetches monitors when none are preloaded", async () => {
        const monitors = [
            { id: "a" },
            { id: "b" },
            { id: "c" },
        ] as SiteMonitorsStub;
        const { adapter: monitorAdapter, mocks: monitorMocks } =
            createMonitorAdapter({
                findBySiteIdentifier: vi.fn(() => monitors),
            });
        const { adapter: siteAdapter } = createSiteAdapter({
            delete: vi.fn(() => false),
        });
        const { deleteSiteWithAdapters } = await import(modulePath);

        const result = deleteSiteWithAdapters({
            identifier: "site-789",
            monitorAdapter: monitorAdapter as unknown,
            siteAdapter: siteAdapter as unknown,
        });

        expect(
            monitorMocks.findBySiteIdentifier
        ).toHaveBeenCalledExactlyOnceWith("site-789");
        expect(result).toStrictEqual({
            monitorCount: monitors.length,
            siteDeleted: false,
        });
    });

    it("wraps monitor deletion failures in SiteDeletionError", async () => {
        const failure = new Error("database offline");
        const { adapter: monitorAdapter, mocks: monitorMocks } =
            createMonitorAdapter({
                deleteBySiteIdentifier: vi.fn(() => {
                    throw failure;
                }),
            });
        const { adapter: siteAdapter, mocks: siteMocks } = createSiteAdapter();
        const { deleteSiteWithAdapters, SiteDeletionError } = await import(
            modulePath
        );

        let capturedError: InstanceType<typeof SiteDeletionError> | null = null;
        try {
            deleteSiteWithAdapters({
                identifier: "site-err",
                monitorAdapter: monitorAdapter as unknown,
                preloadedMonitors: [] as unknown,
                siteAdapter: siteAdapter as unknown,
            });
        } catch (error) {
            const deletionError = error as InstanceType<
                typeof SiteDeletionError
            >;

            expect(deletionError.stage).toBe("monitors");
            expect(deletionError.cause).toBe(failure);
            expect(deletionError.message).toBe(
                "Failed to delete monitors for site site-err: database offline"
            );

            capturedError = deletionError;
        }

        expect(capturedError).toBeInstanceOf(SiteDeletionError);
        expect(monitorMocks.deleteBySiteIdentifier).toHaveBeenCalledTimes(1);

        expect(siteMocks.delete).not.toHaveBeenCalled();
        expect(monitorMocks.findBySiteIdentifier).not.toHaveBeenCalled();
    });

    it("normalises non-error throwables before wrapping", async () => {
        const errorModule = await import(errorUtilsPath);
        const ensureErrorSpy = vi.spyOn(errorModule, "ensureError");
        const normalized = new Error("normalized cause");
        ensureErrorSpy.mockImplementation(() => normalized);
        const { adapter: monitorAdapter } = createMonitorAdapter({
            deleteBySiteIdentifier: vi.fn(() => {
                throw "boom";
            }),
        });
        const { adapter: siteAdapter } = createSiteAdapter();
        const { deleteSiteWithAdapters, SiteDeletionError } = await import(
            modulePath
        );

        let capturedError: InstanceType<typeof SiteDeletionError> | null = null;
        try {
            deleteSiteWithAdapters({
                identifier: "site-non-error",
                monitorAdapter: monitorAdapter as unknown,
                preloadedMonitors: [] as unknown,
                siteAdapter: siteAdapter as unknown,
            });

            expect.fail(
                "Expected site deletion to throw when monitor removal fails"
            );
        } catch (error) {
            const deletionError = error as InstanceType<
                typeof SiteDeletionError
            >;

            expect(deletionError.stage).toBe("monitors");
            expect(deletionError.cause).toBe(normalized);
            expect(deletionError.message).toBe(
                "Failed to delete monitors for site site-non-error: normalized cause"
            );

            capturedError = deletionError;
        }

        expect(capturedError).toBeInstanceOf(SiteDeletionError);
        expect(ensureErrorSpy).toHaveBeenCalledWith("boom");
        expect(ensureErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("provides stage-aware messaging for site-level failures", async () => {
        const { SiteDeletionError } = await import(modulePath);

        const deletionError = new SiteDeletionError("site", "site-42");

        expect(deletionError.stage).toBe("site");
        expect(deletionError.message).toBe("Failed to delete site site-42");
        expect(deletionError.cause).toBeUndefined();
    });

    describe("Property-based Tests", () => {
        test.prop([siteIdentifierArbitrary, monitorsArbitrary])(
            "should correctly count preloaded monitors for any valid identifier and monitors",
            async (siteId, monitors) => {
                vi.resetModules();
                const { adapter: monitorAdapter, mocks: monitorMocks } =
                    createMonitorAdapter();
                const { adapter: siteAdapter, mocks: siteMocks } =
                    createSiteAdapter();
                const { deleteSiteWithAdapters } = await import(modulePath);

                const result = deleteSiteWithAdapters({
                    identifier: siteId,
                    monitorAdapter: monitorAdapter as unknown,
                    preloadedMonitors: monitors as unknown,
                    siteAdapter: siteAdapter as unknown,
                });

                expect(result.monitorCount).toBe(monitors.length);
                expect(result.siteDeleted).toBeTruthy();
                expect(
                    monitorMocks.deleteBySiteIdentifier
                ).toHaveBeenCalledWith(siteId);
                expect(siteMocks.delete).toHaveBeenCalledWith(siteId);
            }
        );

        test.prop([
            siteIdentifierArbitrary,
            monitorsArbitrary,
            fc.boolean(),
        ])(
            "should correctly report site deletion status for any identifier",
            async (siteId, monitors, deletionSuccess) => {
                vi.resetModules();
                const { adapter: monitorAdapter, mocks: monitorMocks } =
                    createMonitorAdapter({
                        findBySiteIdentifier: vi.fn(() => monitors),
                    });
                const { adapter: siteAdapter } = createSiteAdapter({
                    delete: vi.fn(() => deletionSuccess),
                });
                const { deleteSiteWithAdapters } = await import(modulePath);

                const result = deleteSiteWithAdapters({
                    identifier: siteId,
                    monitorAdapter: monitorAdapter as unknown,
                    siteAdapter: siteAdapter as unknown,
                });

                expect(result.siteDeleted).toBe(deletionSuccess);
                expect(result.monitorCount).toBe(monitors.length);
                expect(monitorMocks.findBySiteIdentifier).toHaveBeenCalledWith(
                    siteId
                );
            }
        );

        test.prop([siteIdentifierArbitrary])(
            "should create correct error message for any site identifier",
            async (siteId) => {
                vi.resetModules();
                const { SiteDeletionError } = await import(modulePath);

                const siteError = new SiteDeletionError("site", siteId);
                expect(siteError.stage).toBe("site");
                expect(siteError.message).toBe(
                    `Failed to delete site ${siteId}`
                );

                const monitorError = new SiteDeletionError("monitors", siteId);
                expect(monitorError.stage).toBe("monitors");
            }
        );
    });
});

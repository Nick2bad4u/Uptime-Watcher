import { describe, expect, it, vi } from "vitest";

interface Site {
    identifier: string;
    [key: string]: unknown;
}

const mockSites: Site[] = [];

describe("useSitesStore (module coverage)", () => {
    it("should load and expose a zustand store", async () => {
        // Avoid impacting unrelated tests: only mock these service modules for
        // the duration of this test's dynamic import.
        vi.doMock("../../../services/SiteService", () => ({
            SiteService: {
                addSite: vi.fn(async (site: Site) => site),
                getSites: vi.fn(async () => mockSites),
                removeMonitor: vi.fn(async () => {
                    throw new Error("Not implemented in this test");
                }),
                removeSite: vi.fn(async () => true),
                updateSite: vi.fn(
                    async (_identifier: string, updates: Partial<Site>) =>
                        ({
                            // Minimal shape for this test; callers in these tests do
                            // not depend on fields beyond identifier.
                            identifier: updates.identifier ?? "mock-site",
                        }) as unknown as Site
                ),
            },
        }));

        vi.doMock("../../../services/MonitoringService", () => ({
            MonitoringService: {
                startMonitoring: vi.fn(async () => ({
                    attempted: 0,
                    succeeded: 0,
                    failed: 0,
                    skipped: 0,
                    partialFailures: false,
                    alreadyActive: false,
                    isMonitoring: true,
                    siteCount: 0,
                })),
                stopMonitoring: vi.fn(async () => ({
                    attempted: 0,
                    succeeded: 0,
                    failed: 0,
                    skipped: 0,
                    partialFailures: false,
                    alreadyInactive: false,
                    isMonitoring: false,
                    siteCount: 0,
                })),
            },
        }));

        vi.doMock("../../../services/DataService", () => ({
            DataService: {
                downloadSqliteBackup: vi.fn(async () => ({
                    success: true,
                    data: { blobBase64: "", fileName: "backup.sqlite" },
                    metadata: {
                        createdAt: new Date(0).toISOString(),
                        sizeBytes: 0,
                    },
                })),
                restoreSqliteBackup: vi.fn(async () => ({ success: true })),
                saveSqliteBackup: vi.fn(async () => ({ success: true })),
            },
        }));

        const { useSitesStore } = await import(
            // Webpack chunk name magic comment (kept separate to satisfy lint).
            /* webpackChunkName: "use-sites-store" */ "../../../stores/sites/useSitesStore"
        );

        const state = useSitesStore.getState();
        expect(state).toHaveProperty("sites");
        expect(Array.isArray(state.sites)).toBeTruthy();

        // Smoke-check a few key actions exist.
        expect(typeof state.initializeSites).toBe("function");
        expect(typeof state.setSites).toBe("function");
        expect(typeof state.recordSiteSyncDelta).toBe("function");
    });
});

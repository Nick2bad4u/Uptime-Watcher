/**
 * Integration-style tests ensuring site deletion flows share the same
 * transactional surface without triggering nested transactions.
 */

import { describe, expect, it, vi, afterEach } from "vitest";

import type { Site } from "@shared/types";

import type { DatabaseService } from "../../services/database/DatabaseService";
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "../../services/database/MonitorRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "../../services/database/SiteRepository";
import type { HistoryRepository } from "../../services/database/HistoryRepository";
import type { SettingsRepository } from "../../services/database/SettingsRepository";
import { StandardizedCache } from "../../utils/cache/StandardizedCache";
import { SiteWriterService } from "../../services/database/SiteWriterService";

class FakeDatabaseService {
    public nestedTransactions = 0;

    private readonly dbContext: { inTransaction: boolean } = {
        inTransaction: false,
    };

    public async executeTransaction<T>(
        operation: (db: unknown) => Promise<T> | T
    ): Promise<T> {
        if (this.dbContext.inTransaction) {
            this.nestedTransactions += 1;
            return await Promise.resolve(operation(this.dbContext));
        }

        this.dbContext.inTransaction = true;
        try {
            return await Promise.resolve(operation(this.dbContext));
        } finally {
            this.dbContext.inTransaction = false;
        }
    }
}

interface RepositoryBundle {
    historyRepository: HistoryRepository;
    monitorRepository: MonitorRepository;
    monitorAdapters: MonitorRepositoryTransactionAdapter[];
    settingsRepository: SettingsRepository;
    siteRepository: SiteRepository;
    siteAdapters: SiteRepositoryTransactionAdapter[];
}

const createRepositoryBundle = (
    monitorsBySite: Map<string, Site["monitors"]>,
    sites: Map<string, Site>
): RepositoryBundle => {
    const monitorAdapters: MonitorRepositoryTransactionAdapter[] = [];
    const monitorRepository = {
        createTransactionAdapter: vi.fn((_db: unknown) => {
            const adapter: MonitorRepositoryTransactionAdapter = {
                clearActiveOperations: vi.fn(),
                create: vi.fn(),
                deleteAll: vi.fn(),
                deleteById: vi.fn(),
                deleteBySiteIdentifier: vi.fn((identifier: string) => {
                    monitorsBySite.set(identifier, []);
                }),
                findBySiteIdentifier: vi.fn(
                    (identifier: string) => monitorsBySite.get(identifier) ?? []
                ),
                update: vi.fn(),
            } satisfies MonitorRepositoryTransactionAdapter;
            monitorAdapters.push(adapter);
            return adapter;
        }),
        findBySiteIdentifier: vi.fn(
            async (identifier: string) => monitorsBySite.get(identifier) ?? []
        ),
    } as unknown as MonitorRepository;

    const siteAdapters: SiteRepositoryTransactionAdapter[] = [];
    const siteRepository = {
        createTransactionAdapter: vi.fn((_db: unknown) => {
            const adapter: SiteRepositoryTransactionAdapter = {
                bulkInsert: vi.fn(),
                delete: vi.fn((identifier: string) => sites.delete(identifier)),
                deleteAll: vi.fn(() => {
                    sites.clear();
                }),
                upsert: vi.fn(),
            } satisfies SiteRepositoryTransactionAdapter;
            siteAdapters.push(adapter);
            return adapter;
        }),
        findAll: vi.fn(async () =>
            Array.from(sites.values(), (site) => ({
                identifier: site.identifier,
                monitoring: site.monitoring,
                name: site.name,
            }))
        ),
        findByIdentifier: vi.fn(async (identifier: string) => {
            const site = sites.get(identifier);
            if (!site) {
                return undefined;
            }
            return {
                identifier: site.identifier,
                monitoring: site.monitoring,
                name: site.name,
            };
        }),
    } as unknown as SiteRepository;

    const historyRepository = {
        findByMonitorId: vi.fn(async () => []),
    } as unknown as HistoryRepository;

    const settingsRepository = {
        get: vi.fn(async () => undefined),
    } as unknown as SettingsRepository;

    return {
        historyRepository,
        monitorAdapters,
        monitorRepository,
        settingsRepository,
        siteAdapters,
        siteRepository,
    };
};

const createSampleSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [
        {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 5000,
            type: "http",
            url: "https://example.com",
        },
    ],
    name: "Test Site",
});

afterEach(() => {
    vi.clearAllMocks();
});

describe("Site deletion orchestration", () => {
    it("uses a single transactional surface via SiteWriterService", async () => {
        const siteIdentifier = "site-writer";
        const sampleSite = createSampleSite(siteIdentifier);

        const monitorsBySite = new Map<string, Site["monitors"]>([
            [siteIdentifier, Array.from(sampleSite.monitors)],
        ]);

        const sites = new Map<string, Site>([
            [siteIdentifier, { ...sampleSite }],
        ]);

        const sitesCache = new StandardizedCache<Site>({
            name: "integration-sites",
        });
        sitesCache.set(siteIdentifier, { ...sampleSite });

        const fakeDatabaseService = new FakeDatabaseService();
        const repositories = createRepositoryBundle(monitorsBySite, sites);
        const logger = {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
        };

        const writer = new SiteWriterService({
            databaseService: fakeDatabaseService as unknown as DatabaseService,
            logger,
            repositories: {
                monitor: repositories.monitorRepository,
                site: repositories.siteRepository,
            },
        });

        const result = await writer.deleteSite(sitesCache, siteIdentifier);

        expect(result).toBeTruthy();
        expect(fakeDatabaseService.nestedTransactions).toBe(0);
        expect(sitesCache.has(siteIdentifier)).toBeFalsy();
        expect(sites.has(siteIdentifier)).toBeFalsy();
        expect(monitorsBySite.get(siteIdentifier)).toEqual([]);
        expect(
            repositories.monitorAdapters.at(0)?.deleteBySiteIdentifier
        ).toHaveBeenCalledWith(siteIdentifier);
        expect(repositories.siteAdapters.at(0)?.delete).toHaveBeenCalledWith(
            siteIdentifier
        );
    });
});

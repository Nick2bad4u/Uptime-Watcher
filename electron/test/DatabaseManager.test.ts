import { describe, it, expect, beforeEach, vi } from "vitest";
import { DatabaseManager } from "../managers/DatabaseManager";

// Use vi.hoisted to ensure these are available when mocks are hoisted
const {
    mockEmitTyped,
    mockInitDatabase,
    mockCreateSiteCache,
    mockCreateSiteLoadingOrchestrator,
    mockSiteLoadingOrchestrator,
    mockCreateDataImportExportOrchestrator,
    mockCreateDataBackupOrchestrator,
    mockSetHistoryLimitUtil,
    mockGetHistoryLimitUtil
} = vi.hoisted(() => {
    const mockEmitTyped = vi.fn(() => Promise.resolve());
    const mockInitDatabase = vi.fn(async (db, callback, eventEmitter) => {
        // Call the callback to simulate normal database initialization
        if (callback) {
            await callback();
        }
    });
    const mockCreateSiteCache = vi.fn(() => new Map());
    
    // Create the orchestrator instance once so we can track calls
    const mockSiteLoadingOrchestrator = {
        loadSitesFromDatabase: vi.fn(async (cache, config) => {
            // Simulate loading sites and adding them to cache
            const mockSite1 = { identifier: "site1", name: "Site 1", monitors: [] };
            const mockSite2 = { identifier: "site2", name: "Site 2", monitors: [] };
            cache.set("site1", mockSite1);
            cache.set("site2", mockSite2);
            
            return {
                success: true,
                message: "",
                sitesLoaded: 2,
            };
        }),
    };
    
    const mockCreateSiteLoadingOrchestrator = vi.fn(() => mockSiteLoadingOrchestrator);
    const mockCreateDataImportExportOrchestrator = vi.fn(() => ({
        exportData: vi.fn(async () => '{"mock":"data"}'),
        importData: vi.fn(async (_data, _cache, _cb) => ({ success: true })),
    }));
    const mockCreateDataBackupOrchestrator = vi.fn(() => ({
        downloadBackup: vi.fn(async () => ({ buffer: Buffer.from("backup"), fileName: "uptime-watcher-backup.sqlite" })),
        refreshSitesFromCache: vi.fn(async (_cache) => [
            { identifier: "site1", name: "Site 1" },
            { identifier: "site2", name: "Site 2" },
        ]),
    }));
    const mockSetHistoryLimitUtil = vi.fn(async (opts) => {
        opts.setHistoryLimit(opts.limit);
    });
    const mockGetHistoryLimitUtil = vi.fn((getter) => getter());

    return {
        mockEmitTyped,
        mockInitDatabase,
        mockCreateSiteCache,
        mockCreateSiteLoadingOrchestrator,
        mockSiteLoadingOrchestrator,
        mockCreateDataImportExportOrchestrator,
        mockCreateDataBackupOrchestrator,
        mockSetHistoryLimitUtil,
        mockGetHistoryLimitUtil
    };
});

// Use vi.hoisted to ensure mocks are set up before module imports
vi.mock("../utils", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        initDatabase: mockInitDatabase,
        createSiteCache: mockCreateSiteCache,
        createSiteLoadingOrchestrator: mockCreateSiteLoadingOrchestrator,
        createDataImportExportOrchestrator: mockCreateDataImportExportOrchestrator,
        createDataBackupOrchestrator: mockCreateDataBackupOrchestrator,
        setHistoryLimit: mockSetHistoryLimitUtil,
        getHistoryLimit: mockGetHistoryLimitUtil,
        monitorLogger: { info: vi.fn(), error: vi.fn() },
        logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() },
    };
});

// Mock the services
vi.mock("../services", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => ({
            initialize: vi.fn(() => Promise.resolve()),
            isInitialized: vi.fn(() => true),
            getDatabasePath: vi.fn(() => "/mock/path/database.db"),
        })),
    },
    SiteRepository: vi.fn(() => ({
        findAll: vi.fn(() => Promise.resolve([])),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
    })),
    MonitorRepository: vi.fn(() => ({
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    })),
    HistoryRepository: vi.fn(() => ({
        findByMonitorId: vi.fn(() => Promise.resolve([])),
        addEntry: vi.fn(),
        pruneHistory: vi.fn(),
    })),
    SettingsRepository: vi.fn(() => ({
        get: vi.fn((key) => {
            if (key === 'historyLimit') return Promise.resolve({ value: '500' });
            return Promise.resolve(null);
        }),
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

const createManager = () => {
    const mockDatabaseService = {
        initialize: vi.fn(() => Promise.resolve()),
        isInitialized: vi.fn(() => true),
        getDatabasePath: vi.fn(() => "/mock/path/database.db"),
    };

    const mockSiteRepository = {
        findAll: vi.fn(() => Promise.resolve([])),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
    };

    const mockMonitorRepository = {
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const mockHistoryRepository = {
        findByMonitorId: vi.fn(() => Promise.resolve([])),
        addEntry: vi.fn(),
        pruneHistory: vi.fn(),
    };

    const mockSettingsRepository = {
        get: vi.fn((key) => {
            if (key === 'historyLimit') return Promise.resolve({ value: '500' });
            return Promise.resolve(null);
        }),
        set: vi.fn(),
        delete: vi.fn(),
    };

    return new DatabaseManager({
        eventEmitter: { emitTyped: mockEmitTyped } as any,
        repositories: {
            database: mockDatabaseService as any,
            site: mockSiteRepository as any,
            monitor: mockMonitorRepository as any,
            history: mockHistoryRepository as any,
            settings: mockSettingsRepository as any,
        },
    });
};

describe("DatabaseManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calls initDatabase and emits transaction-completed on initialize", async () => {
        const manager = createManager();
        await manager.initialize();
        expect(mockInitDatabase).toHaveBeenCalled();
        expect(mockEmitTyped).toHaveBeenCalledWith("database:transaction-completed", expect.objectContaining({
            operation: "database:initialize",
            success: true,
        }));
    });

    it("loads sites and emits update-sites-cache-requested", async () => {
        const manager = createManager();
        await manager["loadSites"]();
        expect(mockSiteLoadingOrchestrator.loadSitesFromDatabase).toHaveBeenCalled();
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:update-sites-cache-requested", expect.objectContaining({
            operation: "update-sites-cache-requested",
        }));
    });

    it("exports data and emits data-exported", async () => {
        const manager = createManager();
        const result = await manager.exportData();
        expect(result).toBe('{"mock":"data"}');
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:data-exported", expect.objectContaining({
            operation: "data-exported",
            success: true,
        }));
    });

    it("imports data and emits data-imported", async () => {
        const manager = createManager();
        const result = await manager.importData('{"mock":"data"}');
        expect(result).toBe(true);
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:data-imported", expect.objectContaining({
            operation: "data-imported",
            success: true,
        }));
    });

    it("downloads backup and emits backup-downloaded", async () => {
        const manager = createManager();
        const result = await manager.downloadBackup();
        expect(result.fileName).toBe("uptime-watcher-backup.sqlite");
        expect(result.buffer).toBeInstanceOf(Buffer);
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:backup-downloaded", expect.objectContaining({
            operation: "backup-downloaded",
            success: true,
        }));
    });

    it("refreshes sites and emits sites-refreshed", async () => {
        const manager = createManager();
        const result = await manager.refreshSites();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0]).toMatchObject({ identifier: "site1" });
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:sites-refreshed", expect.objectContaining({
            operation: "sites-refreshed",
            siteCount: 2,
        }));
    });

    it("sets history limit and emits history-limit-updated", async () => {
        const manager = createManager();
        await manager.setHistoryLimit(123);
        expect(mockSetHistoryLimitUtil).toHaveBeenCalled();
        expect(mockEmitTyped).toHaveBeenCalledWith("internal:database:history-limit-updated", expect.objectContaining({
            limit: 123,
            operation: "history-limit-updated",
        }));
    });

    it("gets current history limit", () => {
        const manager = createManager();
        // forcibly set private field for test
        (manager as any).historyLimit = 77;
        const limit = manager.getHistoryLimit();
        expect(limit).toBe(77);
        expect(mockGetHistoryLimitUtil).toHaveBeenCalled();
    });
});

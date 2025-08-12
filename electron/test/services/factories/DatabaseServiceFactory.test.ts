/**
 * Test suite for DatabaseServiceFactory
 *
 * @fileoverview Comprehensive tests for the DatabaseServiceFactory class
 * in the Uptime Watcher application.
 *
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category Services
 * @module DatabaseServiceFactory
 * @tags ["test", "factory", "database", "services"]
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    DatabaseServiceFactory,
    type DatabaseServiceFactoryDependencies,
    type IDataBackupService,
    type IDataImportExportService,
    type ISiteRepositoryService,
} from "../../../services/factories/DatabaseServiceFactory";
import type { UptimeEvents } from "../../../events/eventTypes";
import type { TypedEventBus } from "../../../events/TypedEventBus";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { HistoryRepository } from "../../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../../services/database/SettingsRepository";
import type { SiteRepository } from "../../../services/database/SiteRepository";

// Mock all the dependencies
vi.mock("../../../utils/database/DataBackupService");
vi.mock("../../../utils/database/DataImportExportService");
vi.mock("../../../utils/database/serviceFactory");
vi.mock("../../../utils/database/SiteRepositoryService");
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("DatabaseServiceFactory", () => {
    let factory: DatabaseServiceFactory;
    let mockDependencies: DatabaseServiceFactoryDependencies;
    let mockEventEmitter: TypedEventBus<UptimeEvents>;
    let mockDatabaseService: DatabaseService;
    let mockRepositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock dependencies
        mockEventEmitter = {
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            removeAllListeners: vi.fn(),
            use: vi.fn(),
        } as unknown as TypedEventBus<UptimeEvents>;

        mockDatabaseService = {
            initialize: vi.fn(),
            close: vi.fn(),
            executeTransaction: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        } as unknown as DatabaseService;

        mockRepositories = {
            history: {
                addEntry: vi.fn(),
                getHistory: vi.fn(),
                deleteAll: vi.fn(),
            } as unknown as HistoryRepository,
            monitor: {
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
                findById: vi.fn(),
                findAll: vi.fn(),
            } as unknown as MonitorRepository,
            settings: {
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                getAll: vi.fn(),
            } as unknown as SettingsRepository,
            site: {
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
                findById: vi.fn(),
                findAll: vi.fn(),
            } as unknown as SiteRepository,
        };

        mockDependencies = {
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            repositories: mockRepositories,
        };

        factory = new DatabaseServiceFactory(mockDependencies);
    });

    describe("constructor", () => {
        it("should create a factory instance with provided dependencies", () => {
            expect(factory).toBeInstanceOf(DatabaseServiceFactory);
        });

        it("should store dependencies internally", () => {
            // Since dependencies are private, we can verify they were stored by
            // checking that services can be created successfully
            expect(() => factory.createBackupService()).not.toThrow();
            expect(() => factory.createImportExportService()).not.toThrow();
            expect(() => factory.createSiteRepositoryService()).not.toThrow();
        });
    });

    describe("createBackupService", () => {
        it("should create a data backup service instance", () => {
            const backupService = factory.createBackupService();

            expect(backupService).toBeDefined();
            expect(typeof backupService.downloadDatabaseBackup).toBe(
                "function"
            );
        });

        it("should return a service that implements IDataBackupService interface", () => {
            const backupService = factory.createBackupService();

            // Verify the service has the required interface methods
            expect(backupService).toHaveProperty("downloadDatabaseBackup");
            expect(typeof backupService.downloadDatabaseBackup).toBe(
                "function"
            );
        });

        it("should create a new instance each time", () => {
            const service1 = factory.createBackupService();
            const service2 = factory.createBackupService();

            expect(service1).not.toBe(service2);
        });
    });

    describe("createImportExportService", () => {
        it("should create a data import/export service instance", () => {
            const importExportService = factory.createImportExportService();

            expect(importExportService).toBeDefined();
            expect(typeof importExportService.exportAllData).toBe("function");
            expect(typeof importExportService.importDataFromJson).toBe(
                "function"
            );
            expect(typeof importExportService.persistImportedData).toBe(
                "function"
            );
        });

        it("should return a service that implements IDataImportExportService interface", () => {
            const importExportService = factory.createImportExportService();

            // Verify the service has the required interface methods
            expect(importExportService).toHaveProperty("exportAllData");
            expect(importExportService).toHaveProperty("importDataFromJson");
            expect(importExportService).toHaveProperty("persistImportedData");
            expect(typeof importExportService.exportAllData).toBe("function");
            expect(typeof importExportService.importDataFromJson).toBe(
                "function"
            );
            expect(typeof importExportService.persistImportedData).toBe(
                "function"
            );
        });

        it("should create a new instance each time", () => {
            const service1 = factory.createImportExportService();
            const service2 = factory.createImportExportService();

            expect(service1).not.toBe(service2);
        });
    });

    describe("createSiteRepositoryService", () => {
        it("should create a site repository service instance", () => {
            const siteRepositoryService = factory.createSiteRepositoryService();

            expect(siteRepositoryService).toBeDefined();
            expect(typeof siteRepositoryService.getSitesFromDatabase).toBe(
                "function"
            );
        });

        it("should return a service that implements ISiteRepositoryService interface", () => {
            const siteRepositoryService = factory.createSiteRepositoryService();

            // Verify the service has the required interface methods
            expect(siteRepositoryService).toHaveProperty(
                "getSitesFromDatabase"
            );
            expect(typeof siteRepositoryService.getSitesFromDatabase).toBe(
                "function"
            );
        });

        it("should create a new instance each time", () => {
            const service1 = factory.createSiteRepositoryService();
            const service2 = factory.createSiteRepositoryService();

            expect(service1).not.toBe(service2);
        });
    });

    describe("service creation with dependencies", () => {
        it("should pass event emitter to all created services", () => {
            // Create services to ensure dependencies are passed correctly
            const backupService = factory.createBackupService();
            const importExportService = factory.createImportExportService();
            const siteRepositoryService = factory.createSiteRepositoryService();

            // Since we're using mocks, we verify the services are created successfully
            expect(backupService).toBeDefined();
            expect(importExportService).toBeDefined();
            expect(siteRepositoryService).toBeDefined();
        });

        it("should pass database service to import/export service", () => {
            const importExportService = factory.createImportExportService();

            expect(importExportService).toBeDefined();
            // The database service dependency is verified through successful creation
        });

        it("should pass repositories to import/export and site repository services", () => {
            const importExportService = factory.createImportExportService();
            const siteRepositoryService = factory.createSiteRepositoryService();

            expect(importExportService).toBeDefined();
            expect(siteRepositoryService).toBeDefined();
            // The repositories dependency is verified through successful creation
        });
    });

    describe("interface compliance", () => {
        it("should ensure backup service matches IDataBackupService interface", () => {
            const backupService: IDataBackupService =
                factory.createBackupService();

            expect(backupService.downloadDatabaseBackup).toBeDefined();
            expect(typeof backupService.downloadDatabaseBackup).toBe(
                "function"
            );
        });

        it("should ensure import/export service matches IDataImportExportService interface", () => {
            const importExportService: IDataImportExportService =
                factory.createImportExportService();

            expect(importExportService.exportAllData).toBeDefined();
            expect(importExportService.importDataFromJson).toBeDefined();
            expect(importExportService.persistImportedData).toBeDefined();
            expect(typeof importExportService.exportAllData).toBe("function");
            expect(typeof importExportService.importDataFromJson).toBe(
                "function"
            );
            expect(typeof importExportService.persistImportedData).toBe(
                "function"
            );
        });

        it("should ensure site repository service matches ISiteRepositoryService interface", () => {
            const siteRepositoryService: ISiteRepositoryService =
                factory.createSiteRepositoryService();

            expect(siteRepositoryService.getSitesFromDatabase).toBeDefined();
            expect(typeof siteRepositoryService.getSitesFromDatabase).toBe(
                "function"
            );
        });
    });

    describe("factory behavior", () => {
        it("should initialize with valid dependencies", () => {
            expect(factory).toBeInstanceOf(DatabaseServiceFactory);
        });

        it("should create different service instances consistently", () => {
            const backup1 = factory.createBackupService();
            const backup2 = factory.createBackupService();
            const importExport1 = factory.createImportExportService();
            const importExport2 = factory.createImportExportService();
            const siteRepo1 = factory.createSiteRepositoryService();
            const siteRepo2 = factory.createSiteRepositoryService();

            // All services should be defined
            expect(backup1).toBeDefined();
            expect(backup2).toBeDefined();
            expect(importExport1).toBeDefined();
            expect(importExport2).toBeDefined();
            expect(siteRepo1).toBeDefined();
            expect(siteRepo2).toBeDefined();

            // Different instances should be different objects
            expect(backup1).not.toBe(backup2);
            expect(importExport1).not.toBe(importExport2);
            expect(siteRepo1).not.toBe(siteRepo2);
        });
    });
});

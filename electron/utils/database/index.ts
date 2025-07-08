/**
 * Database utilities index file.
 * Exports all database utility functions for easy importing.
 */

// Database initialization
export * from "./databaseInitializer";

// History limit management
export * from "./historyLimitManager";

// New service-based architecture
export * from "./interfaces";
export * from "./repositoryAdapters";
export * from "./SiteRepositoryService";
export * from "./SiteWriterService";
export {
    createSiteRepositoryService,
    createSiteWriterService,
    createSiteLoadingOrchestrator,
    createSiteWritingOrchestrator,
    createSiteCache,
} from "./serviceFactory";

// Import/Export services
export { DataImportExportService, DataImportExportOrchestrator } from "./DataImportExportService";
export type { DataImportExportConfig } from "./DataImportExportService";
export { DataBackupService, DataBackupOrchestrator } from "./DataBackupService";
export type { DataBackupConfig } from "./DataBackupService";
export {
    createDataImportExportService,
    createDataBackupService,
    createDataImportExportOrchestrator,
    createDataBackupOrchestrator,
} from "./serviceFactory";

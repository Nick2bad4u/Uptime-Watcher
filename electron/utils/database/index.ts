/**
 * Database utilities index file.
 * Exports all database utility functions for easy importing.
 */

// Database backup utilities
export * from "./dataBackup";

// Database initialization
export * from "./databaseInitializer";

// Data import/export
export * from "./dataImportExport";

// History limit management
export * from "./historyLimitManager";

// Site management utilities - legacy functions for specialized operations (import/export/backup)
// TODO: Migrate these to use the new service-based architecture
export * from "./siteRepository";

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

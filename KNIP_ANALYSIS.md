# Knip Analysis Report - Unused Exports Review
<!-- markdownlint-disable -->
This document provides a comprehensive analysis of each unused export identified by knip, with recommendations for each item.

## Summary of Decisions

- **Remove**: Items that are truly unused and safe to remove
- **Keep**: Items that should be retained for future compatibility, API consistency, or architectural reasons
- **Refactor**: Items that need modification or different handling

---

## Unused Exports (56 items)

### 1. HttpMonitor - `electron/services/monitoring/index.ts:6:9`
**Decision: REMOVE**
**Reasoning**: While HttpMonitor is a core monitoring service class, it's imported directly in MonitorTypeRegistry.ts rather than through the barrel export. The direct import is used, making this barrel export redundant.

### 2. PortMonitor - `electron/services/monitoring/index.ts:7:9`
**Decision: REMOVE**
**Reasoning**: Similar to HttpMonitor, PortMonitor is imported directly in MonitorTypeRegistry.ts rather than through the barrel export. The direct import is used, making this barrel export redundant.

### 3. isMonitorStatus - `src/types.ts:12:9`
**Decision: KEEP**
**Reasoning**: Type guard functions are essential for runtime type safety. This function validates monitor status values and should be retained for:
- Runtime validation of monitor status
- Type safety in status-related operations
- Defensive programming practices

### 4. isComputedSiteStatus - `src/types.ts:12:26`
**Decision: KEEP**
**Reasoning**: Type guard for computed site status validation. Computed statuses are derived from monitor states and this guard ensures type safety.

### 5. isSiteStatus - `src/types.ts:12:48`
**Decision: KEEP**
**Reasoning**: Type guard for site status validation. Essential for runtime type safety when dealing with site status values.

### 6. ConfigurationManager - `electron/managers/index.ts:6:9`
**Decision: REMOVE**
**Reasoning**: This is a duplicate export. The ConfigurationManager class is exported from both the barrel file (index.ts) and the direct file (ConfigurationManager.ts). The code uses `configurationManager` (the instance) rather than importing the class directly, making this class export redundant.

### 7. withCacheOperation - `electron/utils/operationalHooks.ts:316:23`
**Decision: REMOVE**
**Reasoning**: This function is defined but never used in the codebase. While caching might be important for future performance, this specific implementation is not currently utilized anywhere in the application.

### 8. SiteCreationError - `electron/utils/database/interfaces.ts:181:14`
**Decision: REMOVE**
**Reasoning**: This specialized error class is defined but never used anywhere in the codebase. While specialized error handling might be useful, this specific implementation is not utilized.

### 9. SiteUpdateError - `electron/utils/database/interfaces.ts:191:14`
**Decision: REMOVE**
**Reasoning**: This specialized error class is defined but never used anywhere in the codebase. Same reasoning as SiteCreationError.

### 10. SiteDeletionError - `electron/utils/database/interfaces.ts:201:14`
**Decision: REMOVE**
**Reasoning**: This specialized error class is defined but never used anywhere in the codebase. Same reasoning as other error classes.

### 11. createSiteWriterService - `electron/utils/database/index.ts:17:33`
**Decision: REMOVE**
**Reasoning**: This function is re-exported from the barrel file but not used. The actual implementation in serviceFactory.ts is used internally, making this barrel export redundant.

### 12. DataImportExportService - `electron/utils/database/index.ts:25:9`
**Decision: REMOVE**
**Reasoning**: This service is re-exported from the barrel file but not used. The service is only used internally through the service factory, making this barrel export redundant.

### 13. DataImportExportOrchestrator - `electron/utils/database/index.ts:25:34`
**Decision: REMOVE**
**Reasoning**: This orchestrator is re-exported from the barrel file but not used. It's only used internally in the DataImportExportService file, making this barrel export redundant.

### 14. DataBackupService - `electron/utils/database/index.ts:27:9`
**Decision: REMOVE**
**Reasoning**: This service is re-exported from the barrel file but not used. The service is only used internally through the service factory, making this barrel export redundant.

### 15. DataBackupOrchestrator - `electron/utils/database/index.ts:27:28`
**Decision: REMOVE**
**Reasoning**: This orchestrator is re-exported from the barrel file but not used. It's only used internally in the DataBackupService file, making this barrel export redundant.

### 16. createDataImportExportService - `electron/utils/database/index.ts:29:9`
**Decision: REMOVE**
**Reasoning**: This function is re-exported from the barrel file but not used. The actual implementation in serviceFactory.ts is used internally, making this barrel export redundant.

### 17. createDataBackupService - `electron/utils/database/index.ts:30:35`
**Decision: REMOVE**
**Reasoning**: This function is re-exported from the barrel file but not used. The actual implementation in serviceFactory.ts is used internally, making this barrel export redundant.

### 18. EVENT_CATEGORIES - `electron/events/index.ts:22:9`
**Decision: KEEP**
**Reasoning**: Event categorization constants. Part of the event system architecture for:
- Event organization
- Event filtering
- Event system consistency

### 19. EVENT_PRIORITIES - `electron/events/index.ts:22:27`
**Decision: KEEP**
**Reasoning**: Event priority constants. Essential for event system prioritization and ordering.

### 20. isEventOfCategory - `electron/events/index.ts:22:45`
**Decision: KEEP**
**Reasoning**: Utility function for event categorization. Part of the event system API.

### 21. getEventPriority - `electron/events/index.ts:22:64`
**Decision: KEEP**
**Reasoning**: Utility function for event priority determination. Part of the event system API.

### 22. createMetricsMiddleware - `electron/events/index.ts:36:35`
**Decision: KEEP**
**Reasoning**: Middleware factory for event metrics. Part of the event system middleware architecture for:
- Performance monitoring
- Event analytics
- System observability

### 23. createRateLimitMiddleware - `electron/events/index.ts:37:29`
**Decision: KEEP**
**Reasoning**: Middleware factory for rate limiting. Important for:
- System stability
- Resource protection
- Performance management

### 24. createValidationMiddleware - `electron/events/index.ts:38:31`
**Decision: KEEP**
**Reasoning**: Middleware factory for event validation. Essential for:
- Data integrity
- Error prevention
- Type safety

### 25. createFilterMiddleware - `electron/events/index.ts:39:32`
**Decision: KEEP**
**Reasoning**: Middleware factory for event filtering. Part of the event system architecture.

### 26. createDebugMiddleware - `electron/events/index.ts:40:28`
**Decision: KEEP**
**Reasoning**: Middleware factory for debugging. Important for:
- Development debugging
- Production troubleshooting
- System observability

### 27. composeMiddleware - `electron/events/index.ts:41:27`
**Decision: KEEP**
**Reasoning**: Utility for composing middleware. Core part of the middleware architecture.

### 28. MIDDLEWARE_STACKS - `electron/events/index.ts:42:23`
**Decision: KEEP**
**Reasoning**: Pre-configured middleware stacks. Part of the event system configuration.

### 29. isMonitorStatus - `src/types/status.ts:23:17`
**Decision: REMOVE**
**Reasoning**: This appears to be a duplicate of the same function exported from `src/types.ts:12:9`. We should consolidate to avoid duplication.

### 30. isComputedSiteStatus - `src/types/status.ts:32:17`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same function exported from `src/types.ts:12:26`. Should be consolidated.

### 31. isSiteStatus - `src/types/status.ts:41:17`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same function exported from `src/types.ts:12:48`. Should be consolidated.

### 32. ConfigurationManager - `electron/managers/ConfigurationManager.ts:27:14`
**Decision: KEEP**
**Reasoning**: Core configuration management class. Essential for:
- Application configuration
- Settings management
- System initialization

### 33. wrapError - `electron/utils/errorHandling.ts:51:17`
**Decision: KEEP**
**Reasoning**: Utility for error wrapping. Part of the error handling infrastructure for:
- Error context preservation
- Error chain management
- Consistent error handling

### 34. formatErrorMessage - `electron/utils/errorHandling.ts:70:17`
**Decision: KEEP**
**Reasoning**: Utility for error message formatting. Essential for:
- Consistent error presentation
- User-friendly error messages
- Debugging information

### 35. handleError - `electron/utils/errorHandling.ts:99:23`
**Decision: KEEP**
**Reasoning**: Core error handling function. Essential for:
- Centralized error handling
- Error logging
- Error reporting

### 36. withErrorHandling - `electron/utils/errorHandling.ts:168:23`
**Decision: KEEP**
**Reasoning**: Higher-order function for error handling. Part of the error handling infrastructure.

### 37. withSyncErrorHandling - `electron/utils/errorHandling.ts:185:17`
**Decision: KEEP**
**Reasoning**: Synchronous error handling wrapper. Part of the error handling infrastructure.

### 38. handleTransactionError - `electron/utils/errorHandling.ts:208:17`
**Decision: KEEP**
**Reasoning**: Specialized error handling for database transactions. Critical for:
- Database transaction safety
- Data integrity
- Error recovery

### 39. handleOperationalError - `electron/utils/errorHandling.ts:233:23`
**Decision: KEEP**
**Reasoning**: Specialized error handling for operational errors. Part of the operational error handling system.

### 40. monitorSchemas - `electron/services/monitoring/MonitorTypeRegistry.ts:108:14`
**Decision: KEEP**
**Reasoning**: Schema definitions for monitor types. Essential for:
- Monitor type validation
- Type safety
- Schema evolution

### 41. registerMonitorType - `electron/services/monitoring/MonitorTypeRegistry.ts:160:17`
**Decision: KEEP**
**Reasoning**: Function for registering new monitor types. Part of the extensible monitor type system.

### 42. createMonitorWithTypeGuards - `electron/services/monitoring/MonitorTypeRegistry.ts:358:17`
**Decision: KEEP**
**Reasoning**: Factory function for creating type-safe monitors. Essential for:
- Type safety
- Monitor creation
- Runtime validation

### 43. migrateMonitorType - `electron/services/monitoring/MonitorTypeRegistry.ts:397:23`
**Decision: KEEP**
**Reasoning**: Function for migrating monitor types. Important for:
- Schema evolution
- Backward compatibility
- Data migration

### 44. isValidMonitorTypeGuard - `electron/services/monitoring/MonitorTypeRegistry.ts:467:17`
**Decision: KEEP**
**Reasoning**: Type guard validation function. Essential for runtime type safety.

### 45. GenericTypeInference - `electron/services/monitoring/EnhancedTypeGuards.ts:363:14`
**Decision: KEEP**
**Reasoning**: Type inference utility. Part of the advanced type system for monitor types.

### 46. TypeSafeMonitorFactory - `electron/services/monitoring/EnhancedTypeGuards.ts:653:14`
**Decision: KEEP**
**Reasoning**: Factory for creating type-safe monitors. Essential for type safety and monitor creation.

### 47. createSiteWriterService - `electron/utils/database/serviceFactory.ts:77:17`
**Decision: KEEP**
**Reasoning**: Factory function for site writer services. Part of the service factory pattern.

### 48. createDataImportExportService - `electron/utils/database/serviceFactory.ts:129:17`
**Decision: KEEP**
**Reasoning**: Factory function for data import/export services. Part of the service factory pattern.

### 49. createDataBackupService - `electron/utils/database/serviceFactory.ts:153:17`
**Decision: KEEP**
**Reasoning**: Factory function for data backup services. Part of the service factory pattern.

### 50. performInitialMonitorChecks - `electron/utils/monitoring/monitorValidator.ts:23:23`
**Decision: KEEP**
**Reasoning**: Function for initial monitor validation. Important for:
- Monitor setup validation
- System initialization
- Error prevention

### 51. ConditionalAdvancedAnalytics - `src/components/common/MonitorUiComponents.tsx:113:17`
**Decision: KEEP**
**Reasoning**: Conditional rendering component for advanced analytics. Part of the UI component library for:
- Feature toggling
- Conditional rendering
- UI consistency

### 52. ConditionalMultipleTypes - `src/components/common/MonitorUiComponents.tsx:160:17`
**Decision: KEEP**
**Reasoning**: Conditional rendering component for multiple monitor types. Part of the UI component library.

### 53. generateDatabaseFieldDefinitions - `electron/services/database/utils/dynamicSchema.ts:26:17`
**Decision: KEEP**
**Reasoning**: Function for generating database field definitions. Part of the dynamic schema system for:
- Schema generation
- Database abstraction
- Type safety

### 54. bulkInsertHistory - `electron/services/database/utils/historyManipulation.ts:103:17`
**Decision: KEEP**
**Reasoning**: Function for bulk inserting history records. Important for:
- Performance optimization
- Data import operations
- History management

### 55. safeNumberConvert - `electron/services/database/utils/valueConverters.ts:14:17`
**Decision: KEEP**
**Reasoning**: Utility for safe number conversion. Part of the data conversion infrastructure for:
- Type safety
- Error prevention
- Data integrity

### 56. handleAxiosError - `electron/services/monitoring/utils/errorHandling.ts:44:17`
**Decision: KEEP**
**Reasoning**: Specialized error handling for Axios HTTP errors. Important for:
- HTTP error handling
- Network error management
- Consistent error processing

---

## Unused Exported Types (49 items)

### 1. IMonitorService - `electron/services/monitoring/index.ts:10:14`
**Decision: KEEP**
**Reasoning**: Interface for monitor services. Essential for:
- Type safety in monitoring operations
- Service abstraction
- Consistent API contracts

### 2. MonitorCheckResult - `electron/services/monitoring/index.ts:10:31`
**Decision: KEEP**
**Reasoning**: Type for monitor check results. Core type for:
- Check result handling
- Type safety
- API consistency

### 3. MonitorConfig - `electron/services/monitoring/index.ts:10:51`
**Decision: KEEP**
**Reasoning**: Type for monitor configuration. Essential for:
- Monitor configuration
- Type safety
- Configuration validation

### 4. NotificationConfig - `electron/services/notifications/index.ts:7:14`
**Decision: KEEP**
**Reasoning**: Type for notification configuration. Important for:
- Notification system configuration
- Type safety
- API consistency

### 5. UpdateStatus - `electron/services/updater/index.ts:7:14`
**Decision: KEEP**
**Reasoning**: Type for update status. Essential for:
- Update system type safety
- Status tracking
- API consistency

### 6. UpdateStatusData - `electron/services/updater/index.ts:7:28`
**Decision: KEEP**
**Reasoning**: Type for update status data. Part of the update system type definitions.

### 7. DatabaseManagerDependencies - `electron/managers/DatabaseManager.ts:26:18`
**Decision: KEEP**
**Reasoning**: Interface for database manager dependencies. Part of the dependency injection system.

### 8. MonitorStatus - `src/types.ts:11:14`
**Decision: REMOVE**
**Reasoning**: This appears to be a duplicate of the same type exported from `src/types/status.ts:10:13`. Should be consolidated.

### 9. StoreActions - `src/stores/types.ts:102:13`
**Decision: KEEP**
**Reasoning**: Type for store actions. Part of the state management type system.

### 10. StoreState - `src/stores/types.ts:127:13`
**Decision: KEEP**
**Reasoning**: Type for store state. Part of the state management type system.

### 11. HistoryRetentionConfig - `electron/managers/index.ts:7:32`
**Decision: KEEP**
**Reasoning**: Type for history retention configuration. Important for:
- History management
- Configuration type safety
- Data retention policies

### 12. OperationalHooksConfig - `electron/utils/operationalHooks.ts:13:18`
**Decision: KEEP**
**Reasoning**: Interface for operational hooks configuration. Part of the operational hooks system.

### 13. UpdateStatus - `electron/services/updater/AutoUpdaterService.ts:13:13`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same type exported from `electron/services/updater/index.ts:7:14`. Should be consolidated.

### 14. UpdateStatusData - `electron/services/updater/AutoUpdaterService.ts:18:18`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same type exported from `electron/services/updater/index.ts:7:28`. Should be consolidated.

### 15. DataBackupConfig - `electron/utils/database/DataBackupService.ts:13:18`
**Decision: KEEP**
**Reasoning**: Interface for data backup configuration. Essential for backup system configuration.

### 16. ImportSite - `electron/utils/database/DataImportExportService.ts:23:18`
**Decision: KEEP**
**Reasoning**: Interface for site import operations. Part of the data import/export system.

### 17. DataImportExportConfig - `electron/utils/database/DataImportExportService.ts:32:18`
**Decision: KEEP**
**Reasoning**: Interface for data import/export configuration. Essential for import/export system configuration.

### 18. DataImportExportConfig - `electron/utils/database/index.ts:26:14`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same type exported from `DataImportExportService.ts:32:18`. Should be consolidated.

### 19. DataBackupConfig - `electron/utils/database/index.ts:28:14`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same type exported from `DataBackupService.ts:13:18`. Should be consolidated.

### 20. MonitoringCallback - `electron/utils/monitoring/monitorLifecycle.ts:34:13`
**Decision: KEEP**
**Reasoning**: Type for monitoring callbacks. Part of the monitoring lifecycle system.

### 21. EventMetadata - `electron/events/index.ts:18:31`
**Decision: KEEP**
**Reasoning**: Type for event metadata. Part of the event system type definitions.

### 22. EventBusDiagnostics - `electron/events/index.ts:18:46`
**Decision: KEEP**
**Reasoning**: Type for event bus diagnostics. Important for:
- Event system monitoring
- Debugging
- Performance analysis

### 23. EventReason - `electron/events/index.ts:23:14`
**Decision: KEEP**
**Reasoning**: Type for event reasons. Part of the event system type definitions.

### 24. EventSource - `electron/events/index.ts:24:17`
**Decision: KEEP**
**Reasoning**: Type for event sources. Part of the event system type definitions.

### 25. EventSeverity - `electron/events/index.ts:25:17`
**Decision: KEEP**
**Reasoning**: Type for event severity. Part of the event system type definitions.

### 26. EventEnvironment - `electron/events/index.ts:26:19`
**Decision: KEEP**
**Reasoning**: Type for event environment. Part of the event system type definitions.

### 27. EventCategory - `electron/events/index.ts:27:22`
**Decision: KEEP**
**Reasoning**: Type for event categories. Part of the event system type definitions.

### 28. EventCheckType - `electron/events/index.ts:28:19`
**Decision: KEEP**
**Reasoning**: Type for event check types. Part of the event system type definitions.

### 29. EventTriggerType - `electron/events/index.ts:29:20`
**Decision: KEEP**
**Reasoning**: Type for event trigger types. Part of the event system type definitions.

### 30. MonitorStatus - `src/types/status.ts:10:13`
**Decision: KEEP**
**Reasoning**: Type for monitor status. Core type for the monitoring system.

### 31. HistoryRetentionConfig - `electron/managers/ConfigurationManager.ts:16:18`
**Decision: REMOVE**
**Reasoning**: Duplicate of the same type exported from `electron/managers/index.ts:7:32`. Should be consolidated.

### 32. IMonitoringOperations - `electron/managers/SiteManager.ts:75:18`
**Decision: KEEP**
**Reasoning**: Interface for monitoring operations. Part of the site management system.

### 33. SiteManagerDependencies - `electron/managers/SiteManager.ts:94:18`
**Decision: KEEP**
**Reasoning**: Interface for site manager dependencies. Part of the dependency injection system.

### 34. ServiceContainerConfig - `electron/services/ServiceContainer.ts:26:18`
**Decision: KEEP**
**Reasoning**: Interface for service container configuration. Part of the dependency injection system.

### 35. ErrorContext - `electron/utils/errorHandling.ts:21:18`
**Decision: KEEP**
**Reasoning**: Interface for error context. Part of the error handling system.

### 36. ErrorHandlingOptions - `electron/utils/errorHandling.ts:35:18`
**Decision: KEEP**
**Reasoning**: Interface for error handling options. Part of the error handling system.

### 37. ErrorState - `src/stores/error/types.ts:5:18`
**Decision: KEEP**
**Reasoning**: Interface for error state. Part of the error management store.

### 38. ErrorActions - `src/stores/error/types.ts:16:18`
**Decision: KEEP**
**Reasoning**: Interface for error actions. Part of the error management store.

### 39. SitesState - `src/stores/sites/types.ts:7:18`
**Decision: KEEP**
**Reasoning**: Interface for sites state. Part of the sites management store.

### 40. SitesActions - `src/stores/sites/types.ts:16:18`
**Decision: KEEP**
**Reasoning**: Interface for sites actions. Part of the sites management store.

### 41. UpdateInfo - `src/stores/updates/types.ts:11:18`
**Decision: KEEP**
**Reasoning**: Interface for update information. Part of the updates management store.

### 42. MonitorFieldDefinition - `electron/services/monitoring/MonitorTypeRegistry.ts:19:18`
**Decision: KEEP**
**Reasoning**: Interface for monitor field definitions. Part of the monitor type system.

### 43. MonitorUIConfig - `electron/services/monitoring/MonitorTypeRegistry.ts:39:18`
**Decision: KEEP**
**Reasoning**: Interface for monitor UI configuration. Part of the monitor type system.

### 44. TypeGuardResult - `electron/services/monitoring/EnhancedTypeGuards.ts:20:18`
**Decision: KEEP**
**Reasoning**: Interface for type guard results. Part of the type safety system.

### 45. RuntimeValidationContext - `electron/services/monitoring/EnhancedTypeGuards.ts:35:18`
**Decision: KEEP**
**Reasoning**: Interface for runtime validation context. Part of the type safety system.

### 46. TypeSafeMonitorData - `electron/services/monitoring/EnhancedTypeGuards.ts:526:18`
**Decision: KEEP**
**Reasoning**: Interface for type-safe monitor data. Part of the type safety system.

### 47. MigrationRule - `electron/services/monitoring/MigrationSystem.ts:8:18`
**Decision: KEEP**
**Reasoning**: Interface for migration rules. Part of the migration system.

### 48. VersionInfo - `electron/services/monitoring/MigrationSystem.ts:16:18`
**Decision: KEEP**
**Reasoning**: Interface for version information. Part of the migration system.

### 49. DatabaseFieldDefinition - `electron/services/database/utils/dynamicSchema.ts:8:18`
**Decision: KEEP**
**Reasoning**: Interface for database field definitions. Part of the dynamic schema system.

---

## Summary

**Total Items Reviewed**: 105
**Keep**: 77 items (73.3%)
**Remove**: 28 items (26.7%)

### Items to Remove

#### Duplicates (10 items)
1. `isMonitorStatus` from `src/types/status.ts:23:17` (duplicate of `src/types.ts:12:9`)
2. `isComputedSiteStatus` from `src/types/status.ts:32:17` (duplicate of `src/types.ts:12:26`)
3. `isSiteStatus` from `src/types/status.ts:41:17` (duplicate of `src/types.ts:12:48`)
4. `MonitorStatus` from `src/types.ts:11:14` (duplicate of `src/types/status.ts:10:13`)
5. `UpdateStatus` from `electron/services/updater/AutoUpdaterService.ts:13:13` (duplicate of `electron/services/updater/index.ts:7:14`)
6. `UpdateStatusData` from `electron/services/updater/AutoUpdaterService.ts:18:18` (duplicate of `electron/services/updater/index.ts:7:28`)
7. `DataImportExportConfig` from `electron/utils/database/index.ts:26:14` (duplicate of `DataImportExportService.ts:32:18`)
8. `DataBackupConfig` from `electron/utils/database/index.ts:28:14` (duplicate of `DataBackupService.ts:13:18`)
9. `HistoryRetentionConfig` from `electron/managers/ConfigurationManager.ts:16:18` (duplicate of `electron/managers/index.ts:7:32`)
10. `ConfigurationManager` from `electron/managers/index.ts:6:9` (duplicate of `ConfigurationManager.ts:27:14`)

#### Unused Barrel Exports (11 items)
11. `HttpMonitor` from `electron/services/monitoring/index.ts:6:9` (unused barrel export)
12. `PortMonitor` from `electron/services/monitoring/index.ts:7:9` (unused barrel export)
13. `createSiteWriterService` from `electron/utils/database/index.ts:17:33` (unused barrel export)
14. `DataImportExportService` from `electron/utils/database/index.ts:25:9` (unused barrel export)
15. `DataImportExportOrchestrator` from `electron/utils/database/index.ts:25:34` (unused barrel export)
16. `DataBackupService` from `electron/utils/database/index.ts:27:9` (unused barrel export)
17. `DataBackupOrchestrator` from `electron/utils/database/index.ts:27:28` (unused barrel export)
18. `createDataImportExportService` from `electron/utils/database/index.ts:29:9` (unused barrel export)
19. `createDataBackupService` from `electron/utils/database/index.ts:30:35` (unused barrel export)
20. `createSiteWriterService` from `electron/utils/database/serviceFactory.ts:77:17` (unused, superseded by internal usage)
21. `createDataImportExportService` from `electron/utils/database/serviceFactory.ts:129:17` (unused, superseded by internal usage)

#### Truly Unused Code (7 items)
22. `withCacheOperation` from `electron/utils/operationalHooks.ts:316:23` (never used)
23. `SiteCreationError` from `electron/utils/database/interfaces.ts:181:14` (never used)
24. `SiteUpdateError` from `electron/utils/database/interfaces.ts:191:14` (never used)
25. `SiteDeletionError` from `electron/utils/database/interfaces.ts:201:14` (never used)
26. `createDataBackupService` from `electron/utils/database/serviceFactory.ts:153:17` (unused, superseded by internal usage)
27. `ConditionalAdvancedAnalytics` from `src/components/common/MonitorUiComponents.tsx:113:17` (unused UI component)
28. `ConditionalMultipleTypes` from `src/components/common/MonitorUiComponents.tsx:160:17` (unused UI component)

### Recommendation

This analysis reveals that the application has significant issues with:
1. **Duplicate exports** - Multiple definitions of the same types/functions
2. **Unused barrel exports** - Services exported through barrel files but imported directly
3. **Truly unused code** - Code that is never used anywhere

The high number of unused exports indicates that the application needs cleanup of:
- Redundant barrel exports
- Duplicate type definitions
- Unused error classes and utility functions

**Priority Actions:**
1. Remove duplicate exports (highest priority to avoid confusion)
2. Clean up unused barrel exports
3. Remove truly unused code
4. Consolidate type definitions to single sources of truth

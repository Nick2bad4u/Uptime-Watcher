/\*\*

- Integration guide for ERROR_CATALOG with errorStore and comprehensive message management.
-
- @remarks
- This document explains the strategic approach to error and log message management
- across the Uptime Watcher application, addressing concerns about catalog size
- while maintaining consistency and type safety.
-
- @packageDocumentation
  \*/

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { useErrorStore } from "@/stores/error/useErrorStore";

/\*\*

- ## Strategic Message Management Architecture
-
- We implement a three-tier approach to message management:
-
- ### 1. ERROR_CATALOG - User-Facing Errors ✅
- **Purpose**: Standardized error messages for business logic and user-facing operations
- **Usage**: Errors that bubble up to UI, IPC responses, validation failures
- **Examples**:
- - Site/Monitor CRUD operations
- - Validation errors
- - Business logic failures
- - IPC communication errors
-
- ### 2. LOG_TEMPLATES - Standardized Log Messages ✅
- **Purpose**: Consistent logging with interpolation support
- **Usage**: Repeated log patterns across the codebase
- **Examples**:
- - Service initialization messages
- - Debug information with context
- - Warning patterns
-
- ### 3. Dynamic Contextual Logs - As-Is ✅
- **Purpose**: Context-specific debug and performance information
- **Usage**: Unique debug scenarios, performance logs, development info
- **Examples**:
- - `logger.debug(\`Processing site \${siteId} with \${monitorCount} monitors\`)`
- - One-off debugging statements
- - Performance metrics with dynamic data
    \*/

/\*\*

- ## ERROR_CATALOG Integration with errorStore
-
- The errorStore works seamlessly with ERROR_CATALOG for centralized error management:
  \*/

// Example: Site operations with centralized error handling
export class ExampleSiteOperations {
private errorStore = useErrorStore();

    async addSite(site: Site): Promise<void> {
        try {
            this.errorStore.setLoading("sites", "add", true);

            const result = await window.electronAPI.addSite(site);

            if (!result.success) {
                // ERROR_CATALOG provides standardized error messages
                this.errorStore.setError("sites", ERROR_CATALOG.sites.FAILED_TO_ADD);
                return;
            }

            this.errorStore.clearError("sites");
        } catch (error) {
            // Handle validation errors with ERROR_CATALOG
            if (error instanceof Error && error.message.includes("validation")) {
                this.errorStore.setError("sites", ERROR_CATALOG.validation.VALIDATION_FAILED);
            } else {
                this.errorStore.setError("sites", ERROR_CATALOG.system.INTERNAL_ERROR);
            }
        } finally {
            this.errorStore.setLoading("sites", "add", false);
        }
    }

    async loadSites(): Promise<Site[]> {
        try {
            this.errorStore.setLoading("sites", "load", true);

            const sites = await window.electronAPI.getAllSites();
            this.errorStore.clearError("sites");
            return sites;

        } catch (error) {
            // ERROR_CATALOG ensures consistent error messaging
            this.errorStore.setError("sites", ERROR_CATALOG.database.QUERY_FAILED);
            return [];
        } finally {
            this.errorStore.setLoading("sites", "load", false);
        }
    }

}

/\*\*

- ## LOG_TEMPLATES Integration with Backend Services
-
- Backend services use LOG_TEMPLATES for consistent operational logging:
  \*/

// Example: Service with template-based logging
export class ExampleMonitorService {
private logger = createTemplateLogger(baseLogger);

    async startMonitoring(monitorId: string, siteIdentifier: string): Promise<void> {
        try {
            // Use LOG_TEMPLATES for standardized service messages
            this.logger.info(LOG_TEMPLATES.services.MONITOR_STARTED, {
                monitorId,
                siteIdentifier
            });

            // Dynamic context-specific logging remains as-is
            this.logger.debug(`Starting monitoring with config: ${JSON.stringify(config)}`);

            await this.scheduleMonitorCheck(monitorId);

        } catch (error) {
            // ERROR_CATALOG for standardized error responses
            this.logger.error(ERROR_CATALOG.monitors.FAILED_TO_ADD, {
                monitorId,
                error: error.message
            });
            throw new Error(ERROR_CATALOG.monitors.FAILED_TO_ADD);
        }
    }

}

/\*\*

- ## Migration Guidelines
-
- ### ✅ Migrate to ERROR_CATALOG:
- - throw new Error() statements that reach users
- - IPC error responses
- - Validation error messages
- - Business logic errors
- - Store error states
-
- ### ✅ Migrate to LOG_TEMPLATES:
- - Repeated log message patterns
- - Service initialization/cleanup messages
- - Standard debug/warning patterns
- - Messages that appear multiple times across files
-
- ### ❌ Keep as Dynamic Strings:
- - Test error messages
- - Unique debug scenarios
- - Performance logs with dynamic data
- - Development-only debugging
- - Context-specific operational logs
-
- ### 🔍 Examples:
-
- ```typescript

  ```

- // ✅ GOOD: User-facing error
- throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
-
- // ✅ GOOD: Standardized log message
- logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED, { count: sites.length });
-
- // ✅ GOOD: Dynamic contextual log
- logger.debug(`Processing site ${siteId} with ${monitorCount} monitors and ${historyEntries} history entries`);
-
- // ❌ AVOID: Hardcoded user-facing error
- throw new Error("Site not found");
-
- // ❌ AVOID: Repeated log pattern without template
- logger.info(`[SiteManager] Initialized with ${count} sites in cache`);
- ```
  */
  ```

/\*\*

- ## Benefits of This Approach
-
- ### 🎯 **Targeted Standardization**
- - ERROR_CATALOG focuses on user-facing errors (~50-100 messages)
- - LOG_TEMPLATES handles repeated patterns (~30-50 templates)
- - Dynamic logs remain flexible for development needs
-
- ### 🔒 **Type Safety**
- - All user-facing errors are type-checked
- - Template interpolation is type-safe
- - errorStore integration is strongly typed
-
- ### 🔧 **Maintainability**
- - Centralized error message management
- - Consistent error handling patterns
- - Easy to update messages across the app
-
- ### ⚡ **Performance**
- - No impact on development debugging
- - Efficient template interpolation
- - Minimal overhead for contextual logs
-
- ### 🌐 **Internationalization Ready**
- - ERROR_CATALOG can be easily localized
- - LOG_TEMPLATES support multi-language
- - Dynamic logs can remain in English for debugging
    \*/

export const ERROR_MESSAGE_INTEGRATION = {
ERROR_CATALOG,
LOG_TEMPLATES,
useErrorStore,
} as const;

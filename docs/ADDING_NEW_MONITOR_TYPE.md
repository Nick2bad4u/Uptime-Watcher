# Adding New Monitor Types Guide
<!-- markdownlint-disable -->
## Overview

The Uptime Watcher uses a dynamic monitor type system that allows you to add new monitor types with minimal code changes. The system is **95% automatic** with only 2 required files.

## Required Changes

### Required Files (2 files)

1. **Create monitor service implementation** (`electron/services/monitoring/YourMonitor.ts`)
2. **Register the monitor type** (add to `electron/services/monitoring/MonitorTypeRegistry.ts`)

### Optional Updates (2 files)

3. **Update hardcoded fallbacks** (`src/components/`) - for better user experience during errors
4. **Update documentation** - update any hardcoded references in comments

## What's Automatic vs Manual

### ✅ **Fully Automatic (No Code Changes Needed)**

- **Database schema generation** (dynamic fields) ✅
- **Frontend form generation** (dynamic fields) ✅
- **Validation schemas** ✅
- **UI components and formatters** ✅
- **Service factory registration** ✅
- **IPC communication** ✅
- **Display formatting** ✅
- **Type system** (MonitorType union is auto-generated) ✅

### ⚠️ **Optional Manual Updates**

- **Hardcoded fallback display logic** in UI components (used only during errors)
- **Documentation updates** (comments that mention specific monitor types)

## Step 1: Create Monitor Service Implementation

Create a new file: `electron/services/monitoring/YourMonitor.ts`

```typescript
/**
 * Your Monitor Type - description of what it monitors
 */

import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { logger } from "../../utils/logger";
import { handleCheckError } from "./utils";

/**
 * Your Monitor service implementation
 */
export class YourMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = {
            timeout: config.timeout || 30000,
            retryAttempts: config.retryAttempts || 3,
        };
    }

    /**
     * Perform the actual check for your monitor type
     * @param monitor - Monitor configuration from database
     * @returns Promise<MonitorCheckResult>
     */
    async check(monitor: any): Promise<MonitorCheckResult> {
        const startTime = performance.now();
        
        try {
            // Extract your monitor-specific fields
            const { customField1, customField2 } = monitor;
            
            // Perform your monitoring logic here
            // Example: ping a server, check a database, validate a certificate, etc.
            
            const responseTime = performance.now() - startTime;
            
            return {
                status: "up", // or "down" based on your logic
                responseTime: Math.round(responseTime),
                details: `Your custom status message`, // Optional
            };
            
        } catch (error) {
            // Use the built-in error handler
            return handleCheckError(error, `YourMonitor check failed`);
        }
    }

    /**
     * Cleanup resources (optional)
     */
    async destroy(): Promise<void> {
        // Cleanup any resources (connections, timers, etc.)
    }
}
```

## Step 2: Register Monitor Type

Add your monitor type to `electron/services/monitoring/MonitorTypeRegistry.ts`:

```typescript
// Import your monitor service
import { YourMonitor } from "./YourMonitor";

// Add validation schema
export const monitorSchemas = {
    // ... existing schemas
    yourtype: z.object({
        customField1: z.string().min(1, "Custom field 1 is required"),
        customField2: z.number().min(1).max(65535, "Must be between 1 and 65535"),
        type: z.literal("yourtype"),
    }),
};

// Register your monitor type
registerMonitorType({
    type: "yourtype",
    displayName: "Your Monitor Type",
    description: "Description of what your monitor checks",
    version: "1.0.0",
    validationSchema: monitorSchemas.yourtype,
    serviceFactory: () => new YourMonitor(),
    fields: [
        {
            name: "customField1",
            label: "Custom Field 1",
            type: "text", // "text", "number", or "url"
            required: true,
            placeholder: "Enter value...",
            helpText: "Help text for this field",
        },
        {
            name: "customField2", 
            label: "Custom Field 2",
            type: "number",
            required: true,
            placeholder: "1234",
            helpText: "Enter a number",
            min: 1,
            max: 65535,
        },
    ],
    uiConfig: {
        formatDetail: (details: string) => `Custom: ${details}`,
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const field1 = monitor.customField1 as string;
            return field1 ? ` (${field1})` : "";
        },
        supportsResponseTime: true,
        supportsAdvancedAnalytics: true,
        helpTexts: {
            primary: "Help text for the primary field",
            secondary: "Help text for the secondary field",
        },
        display: {
            showUrl: false, // Set to true if your monitor uses URLs
            showAdvancedMetrics: true,
        },
        detailFormats: {
            historyDetail: (details: string) => `Custom: ${details}`,
            analyticsLabel: "Custom Response Time",
        },
    },
});
```

## Step 3: Update Type System ✅ **AUTOMATIC**

The MonitorType union is **automatically generated** from the registry! No manual updates needed.

```typescript
// This is auto-generated from registered monitor types
export type MonitorType = ReturnType<typeof getRegisteredMonitorTypes>[number];
```

## Step 4: Update Hardcoded Fallbacks (Optional)

Some UI components have hardcoded fallbacks that should be updated for better user experience:

### Update `src/components/SiteDetails/tabs/SettingsTab.tsx`

```typescript
// In getIdentifierLabel function
if (selectedMonitor.type === "http") {
    return "Website URL";
}
if (selectedMonitor.type === "port") {
    return "Host & Port";
}
// Add your monitor type:
if (selectedMonitor.type === "yourtype") {
    return "Your Custom Label";
}

// In getDisplayIdentifier function  
if (selectedMonitor.type === "http" && selectedMonitor.url) {
    return selectedMonitor.url;
}
if (selectedMonitor.type === "port" && selectedMonitor.host && selectedMonitor.port) {
    return `${selectedMonitor.host}:${selectedMonitor.port}`;
}
// Add your monitor type:
if (selectedMonitor.type === "yourtype" && selectedMonitor.customField1) {
    return `Custom: ${selectedMonitor.customField1}`;
}
```

### Update `src/components/AddSiteForm/Submit.tsx`

```typescript
// In the fallback mapping section
if (monitorType === "http") {
    monitorData.url = formData.url.trim();
}
if (monitorType === "port") {
    monitorData.host = formData.host.trim();
    monitorData.port = Number(formData.port);
}
// Add your monitor type:
if (monitorType === "yourtype") {
    monitorData.customField1 = formData.customField1.trim();
    monitorData.customField2 = Number(formData.customField2);
}
```

## That's It! 🎉

Your new monitor type is now fully integrated with only 2 file changes:

- ✅ **Database**: Fields are automatically added to the `monitors` table
- ✅ **Frontend**: Form fields are automatically generated  
- ✅ **Validation**: Zod schemas validate both frontend and backend
- ✅ **UI**: Display formatters work automatically via IPC
- ✅ **Types**: TypeScript types are auto-generated from registry
- ✅ **Migration**: Version support is built-in

The system is **95% automatic** - you only need to create the monitor service and register it!

## Advanced Features

### Custom Field Types

Currently supported field types:
- `"text"` - Text input
- `"number"` - Number input with min/max validation
- `"url"` - URL input with validation

### Response Time Support

Set `supportsResponseTime: true` to enable response time charts and analytics.

### Advanced Analytics

Set `supportsAdvancedAnalytics: true` to enable advanced metrics and visualizations.

### Migration Support

To add migrations for future versions:

```typescript
// In MonitorTypeRegistry.ts
migrationRegistry.registerMigration("yourtype", {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    migrate: async (data: any) => {
        // Transform data from old version to new version
        return {
            ...data,
            newField: "defaultValue",
        };
    },
});
```

### Error Handling

Use the built-in `handleCheckError` utility for consistent error handling:

```typescript
import { handleCheckError } from "./utils";

// In your check method
catch (error) {
    return handleCheckError(error, "Your custom error context");
}
```

## Common Monitor Type Examples

### Database Monitor
```typescript
export class DatabaseMonitor implements IMonitorService {
    async check(monitor: any): Promise<MonitorCheckResult> {
        const { connectionString, queryTimeout } = monitor;
        // Connect to database and test query
    }
}
```

### API Monitor
```typescript
export class ApiMonitor implements IMonitorService {
    async check(monitor: any): Promise<MonitorCheckResult> {
        const { endpoint, apiKey, expectedStatus } = monitor;
        // Make API call and validate response
    }
}
```

### Certificate Monitor
```typescript
export class CertificateMonitor implements IMonitorService {
    async check(monitor: any): Promise<MonitorCheckResult> {
        const { domain, warningDays } = monitor;
        // Check SSL certificate expiration
    }
}
```

## Testing Your Monitor Type

1. **Build the application**: `npm run build`
2. **Start the app**: `npm run electron`
3. **Add a new site** with your monitor type
4. **Verify** the form fields appear correctly
5. **Test monitoring** works as expected

## Best Practices

1. **Always validate input** using Zod schemas
2. **Use performance.now()** for accurate timing
3. **Handle errors gracefully** with the built-in error handler
4. **Provide helpful error messages** in the `details` field
5. **Clean up resources** in the `destroy()` method
6. **Keep field names consistent** with your validation schema
7. **Test edge cases** like timeouts and network errors

## Troubleshooting

### Fields not appearing in UI
- Check that field names match exactly between schema and field definitions
- Ensure the monitor type is properly registered

### Database errors
- Verify field names use `camelCase` (they're automatically converted to `snake_case` in the database)
- Check that validation schema matches field definitions

### Type errors
- Add your monitor type to the `MonitorType` union in `electron/types.ts`
- Ensure validation schema has `type: z.literal("yourtype")`

The system is designed to be as simple as possible while maintaining type safety and extensibility. Most monitor types can be implemented in under 100 lines of code!

# Adding New Monitor Types - Complete Guide

<!-- markdownlint-disable MD022 MD026 MD032 MD031 -->

## Overview

The Uptime Watcher uses a **registry-driven architecture** that makes adding new monitor types extremely simple. The system is designed to be **95% automatic** with minimal code changes required.

## 🎯 The Goal: Add Only 2 Files

### What You Need to Do

1. **Create monitor service** (`electron/services/monitoring/YourMonitor.ts`) - New file
2. **Register the monitor type** - Add to existing registry file

### What's Automatic

- ✅ **Database schema** - Dynamic field storage
- ✅ **Frontend forms** - Auto-generated from field definitions
- ✅ **Validation** - Zod schemas handle all validation
- ✅ **UI formatting** - Dynamic display logic
- ✅ **IPC communication** - Automatic service discovery
- ✅ **Type system** - MonitorType union auto-generated from registry

---

## 📋 Step-by-Step Guide

### Step 1: Create Your Monitor Service

Create: `electron/services/monitoring/YourMonitor.ts`

```typescript
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { handleCheckError } from "./utils";

/**
 * Your Custom Monitor - monitors whatever you want
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
  * Perform the actual monitoring check
  */
 async check(monitor: any): Promise<MonitorCheckResult> {
  const startTime = performance.now();

  try {
   // Extract your monitor-specific fields
   const { customField1, customField2 } = monitor;

   // TODO: Implement your monitoring logic here
   // Examples:
   // - Check database connection
   // - Ping DNS server
   // - Validate SSL certificate
   // - Check API endpoint with authentication
   // - Monitor file system
   // - Check service availability

   // For example:
   // const result = await yourCustomCheck(customField1, customField2);
   // if (!result.success) {
   //     throw new Error(`Check failed: ${result.error}`);
   // }

   const responseTime = performance.now() - startTime;

   return {
    status: "up", // or "down" based on your logic
    responseTime: Math.round(responseTime),
    details: `Your custom status message`, // Optional
   };
  } catch (error) {
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

### Step 2: Register Your Monitor Type

Edit: `electron/services/monitoring/MonitorTypeRegistry.ts`

Add this at the top with other imports:

```typescript
import { YourMonitor } from "./YourMonitor";
```

Add validation schema to the `monitorSchemas` object:

```typescript
export const monitorSchemas = {
 // ... existing schemas (http, port)
 yourtype: z.object({
  customField1: z.string().min(1, "Custom field 1 is required"),
  customField2: z.number().min(1).max(65535, "Must be between 1 and 65535"),
  type: z.literal("yourtype"),
 }),
};
```

Add registration call (after existing `registerMonitorType` calls):

```typescript
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

### Step 3: Test Your Monitor

That's it! Your monitor is now fully integrated:

1. **Restart the app** - Your monitor type will appear in the dropdown
2. **Add a site** - The form will automatically generate fields for your monitor
3. **Monitor will run** - Your check logic will execute on the monitoring interval

---

## 🔧 Configuration Options

### Field Types

- `"text"` - Text input field
- `"number"` - Number input with min/max validation
- `"url"` - URL input with validation

### UI Configuration

- `formatDetail` - How to display details in status
- `formatTitleSuffix` - How to display monitor in title
- `supportsResponseTime` - Whether to show response time charts
- `supportsAdvancedAnalytics` - Whether to show advanced metrics
- `helpTexts` - Help text for form fields
- `display.showUrl` - Whether to show URL in monitor display
- `display.showAdvancedMetrics` - Whether to show advanced metrics
- `detailFormats` - How to format details in different contexts

### Validation Schema

Use Zod for powerful validation:

```typescript
yourtype: z.object({
    field1: z.string().min(1, "Required"),
    field2: z.number().min(1).max(65535),
    field3: z.string().url("Must be valid URL"),
    field4: z.enum(["option1", "option2"]),
    field5: z.boolean().optional(),
    type: z.literal("yourtype"),
}),
```

---

## 🎨 Optional: Frontend Fallbacks

For better error recovery, you can optionally update hardcoded fallbacks in:

### `src/components/SiteDetails/tabs/SettingsTab.tsx`

```typescript
// In getIdentifierLabel function
if (selectedMonitor.type === "yourtype") {
 return "Your Custom Label";
}

// In getDisplayIdentifier function
if (selectedMonitor.type === "yourtype" && selectedMonitor.customField1) {
 return `Custom: ${selectedMonitor.customField1}`;
}
```

### `src/components/AddSiteForm/Submit.tsx`

```typescript
// In the fallback mapping section
if (monitorType === "yourtype") {
 monitorData.customField1 = formData.customField1.trim();
 monitorData.customField2 = Number(formData.customField2);
}
```

**Note**: These fallbacks are only used if the registry fails to load. The app works perfectly without them.

---

## 🚀 Examples

### DNS Monitor

```typescript
// electron/services/monitoring/DnsMonitor.ts
export class DnsMonitor implements IMonitorService {
 async check(monitor: any): Promise<MonitorCheckResult> {
  const { hostname, recordType } = monitor;
  const startTime = performance.now();

  try {
   const result = await dns.resolve(hostname, recordType);
   const responseTime = performance.now() - startTime;

   return {
    status: result.length > 0 ? "up" : "down",
    responseTime: Math.round(responseTime),
    details: `${result.length} records found`,
   };
  } catch (error) {
   return handleCheckError(error, `DNS lookup failed`);
  }
 }
}

// Registration:
registerMonitorType({
 type: "dns",
 displayName: "DNS Lookup",
 description: "Monitors DNS resolution for domains",
 version: "1.0.0",
 validationSchema: z.object({
  hostname: z.string().min(1, "Hostname is required"),
  recordType: z.enum(["A", "AAAA", "CNAME", "MX", "TXT"]),
  type: z.literal("dns"),
 }),
 serviceFactory: () => new DnsMonitor(),
 fields: [
  {
   name: "hostname",
   label: "Hostname",
   type: "text",
   required: true,
   placeholder: "example.com",
   helpText: "Domain name to resolve",
  },
  {
   name: "recordType",
   label: "Record Type",
   type: "text",
   required: true,
   placeholder: "A",
   helpText: "DNS record type (A, AAAA, CNAME, MX, TXT)",
  },
 ],
 uiConfig: {
  formatDetail: (details: string) => `DNS: ${details}`,
  formatTitleSuffix: (monitor: Record<string, unknown>) => {
   const hostname = monitor.hostname as string;
   const recordType = monitor.recordType as string;
   return hostname ? ` (${hostname}/${recordType})` : "";
  },
  supportsResponseTime: true,
  supportsAdvancedAnalytics: true,
 },
});
```

### Database Monitor

```typescript
// electron/services/monitoring/DatabaseMonitor.ts
export class DatabaseMonitor implements IMonitorService {
 async check(monitor: any): Promise<MonitorCheckResult> {
  const { connectionString, query } = monitor;
  const startTime = performance.now();

  try {
   const db = await connectToDatabase(connectionString);
   const result = await db.query(query);
   await db.close();

   const responseTime = performance.now() - startTime;

   return {
    status: "up",
    responseTime: Math.round(responseTime),
    details: `Query returned ${result.rowCount} rows`,
   };
  } catch (error) {
   return handleCheckError(error, `Database check failed`);
  }
 }
}
```

---

## 📈 What Happens When You Add a Monitor

1. **Type System Updates** - MonitorType union automatically includes your new type
2. **Database Schema** - Dynamic fields are stored in the monitor table
3. **Frontend Forms** - Form fields are auto-generated from your field definitions
4. **Validation** - Zod schemas handle all client and server validation
5. **UI Display** - Your formatters are used throughout the UI
6. **IPC Communication** - Service factory automatically registers your monitor
7. **Monitoring Engine** - Your check method is called on the monitoring interval

## 🎉 You're Done!

Your new monitor type is fully integrated with:

- ✅ Database storage
- ✅ Frontend forms
- ✅ Validation
- ✅ UI display
- ✅ Monitoring engine
- ✅ Type safety

All with just 2 files! The registry-driven architecture handles everything else automatically.

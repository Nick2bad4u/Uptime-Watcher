# Monitor Type Implementation Guide (Updated)

<!-- markdownlint-disable -->

**Simplified guide for implementing new monitor types in Uptime Watcher**

---

## 📋 **Overview**

This document provides a streamlined guide for implementing new monitor types in Uptime Watcher following the refactored registry-driven architecture. The updated system has greatly simplified the process, reducing it from modifying 23+ files to just **2 files**.

**Current Monitor Types**: `http`, `port`
**Example New Type**: `dns` (used throughout this guide)

---

## 🏗️ **Architecture Overview**

The refactored monitor type system follows these key patterns:

### **Core Components**:

1. **Monitor Service** - Implements `IMonitorService` interface
2. **Type Registry** - Central registration with validation schemas
3. **Dynamic UI** - Auto-generated form fields based on registry definitions

### **Data Flow**:

```text
┌──────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Registry Entry   │────▶│ Monitor Service │────▶│ Dynamic UI     │
│ - Type metadata  │     │ - Check logic   │     │ - Form fields  │
│ - Field defs     │     │ - Error handling│     │ - Validation   │
│ - Validation     │     │ - Response      │     │ - Display      │
└──────────────────┘     └────────────────┘     └────────────────┘
```

---

## 🚀 **Adding a New Monitor Type**

### **Step 1: Create Monitor Service**

Create a new file: `electron/services/monitoring/DnsMonitor.ts`

```typescript
import { Site } from "../../types";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { promises as dns } from "dns";

/**
 * DNS resolution monitoring service.
 *
 * Checks DNS resolution for specified hostname and record type.
 */
export class DnsMonitor implements IMonitorService {
 private config: MonitorConfig;

 constructor(config: MonitorConfig = {}) {
  this.config = {
   timeout: DEFAULT_REQUEST_TIMEOUT,
   ...config,
  };
 }

 public getType(): Site["monitors"][0]["type"] {
  return "dns";
 }

 public updateConfig(config: Partial<MonitorConfig>): void {
  this.config = {
   ...this.config,
   ...config,
  };
 }

 public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
  const startTime = Date.now();

  // Type assertion for DNS-specific fields
  const hostname = monitor.hostname as string;
  const recordType = monitor.recordType as string;

  if (!hostname || !recordType) {
   return {
    status: "error",
    responseTime: 0,
    details: "Missing hostname or record type",
    timestamp: Date.now(),
   };
  }

  try {
   // Use appropriate DNS lookup method based on record type
   switch (recordType) {
    case "A":
     await dns.resolve4(hostname, { ttl: true });
     break;
    case "AAAA":
     await dns.resolve6(hostname, { ttl: true });
     break;
    case "MX":
     await dns.resolveMx(hostname);
     break;
    case "TXT":
     await dns.resolveTxt(hostname);
     break;
    case "CNAME":
     await dns.resolveCname(hostname);
     break;
    default:
     return {
      status: "error",
      responseTime: 0,
      details: `Unsupported record type: ${recordType}`,
      timestamp: Date.now(),
     };
   }

   const responseTime = Date.now() - startTime;

   return {
    status: "up",
    responseTime,
    details: recordType,
    timestamp: Date.now(),
   };
  } catch (error) {
   const responseTime = Date.now() - startTime;
   const details = error instanceof Error ? error.message : "DNS resolution failed";

   return {
    status: "down",
    responseTime,
    details,
    timestamp: Date.now(),
   };
  }
 }
}
```

### **Step 2: Register in Monitor Type Registry**

Edit: `electron/services/monitoring/MonitorTypeRegistry.ts`

Add the following registration to the end of the file:

```typescript
import { DnsMonitor } from "./DnsMonitor";

// Register DNS monitor type
registerMonitorType({
 type: "dns",
 displayName: "DNS Lookup",
 description: "Monitors DNS resolution for specific record types",
 version: "1.0.0",
 validationSchema: z.object({
  hostname: z.string().min(1, "Hostname is required"),
  recordType: z.enum(["A", "AAAA", "MX", "CNAME", "TXT"], {
   errorMap: () => ({ message: "Invalid record type" }),
  }),
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
   helpText: "Enter the hostname to check",
  },
  {
   name: "recordType",
   label: "Record Type",
   type: "text", // Should be "select" when frontend adds support
   required: true,
   placeholder: "A",
   helpText: "Enter a valid DNS record type (A, AAAA, MX, CNAME, TXT)",
  },
 ],
 uiConfig: {
  formatDetail: (details: string) => `Record: ${details}`,
  formatTitleSuffix: (monitor: Record<string, unknown>) => {
   const hostname = monitor.hostname as string;
   const recordType = monitor.recordType as string;
   return hostname && recordType ? ` (${hostname}/${recordType})` : "";
  },
  supportsResponseTime: true,
  supportsAdvancedAnalytics: false,
  helpTexts: {
   primary: "Enter the hostname to resolve",
   secondary: "Select the DNS record type to check",
  },
  display: {
   showUrl: false,
   showAdvancedMetrics: false,
  },
  detailFormats: {
   historyDetail: (details: string) => `Record: ${details}`,
   analyticsLabel: "DNS Resolution Time",
  },
 },
});
```

---

## ✅ **That's it!**

The frontend will automatically:

- Show the new monitor type in dropdown menus
- Generate appropriate form fields
- Validate input using the defined Zod schema
- Display the monitor with the correct formatting
- Handle all CRUD operations

There's no need to modify any other files - the registry-driven architecture takes care of everything else.

---

## 🧪 **Testing Your Monitor Type**

To verify your new monitor type works correctly:

1. **Build the application**:

   ```bash
   npm run build
   npm run electron-dev
   ```

2. **Check the monitor type list**:

   - Your new monitor type should appear in the dropdown when adding a monitor

3. **Add a monitor with the new type**:

   - Fill in the required fields and submit
   - Verify that validation works correctly

4. **Start monitoring**:
   - Check that the monitor runs correctly
   - Verify that status updates appear as expected

---

## 🔧 **Advanced Options**

### **Adding Migration Support**

If you need to provide migration support for version updates of your monitor type:

```typescript
// In MonitorTypeRegistry.ts after registration
migrationRegistry.registerMigration("dns", {
 sourceVersion: "1.0.0",
 targetVersion: "1.1.0",
 migrate: (monitor) => {
  // Transform monitor data for version upgrade
  return {
   ...monitor,
   additionalField: "default value",
  };
 },
});
```

### **Custom Field Types**

For advanced field types, you can extend the field definition to support:

```typescript
// Example of a select field (when frontend support is added)
{
    name: "recordType",
    label: "Record Type",
    type: "select",
    required: true,
    options: [
        { label: "A Record (IPv4)", value: "A" },
        { label: "AAAA Record (IPv6)", value: "AAAA" },
        { label: "MX Record (Mail)", value: "MX" },
        { label: "CNAME Record (Alias)", value: "CNAME" },
        { label: "TXT Record (Text)", value: "TXT" },
    ],
    helpText: "Select the type of DNS record to check",
}
```

---

## 📚 **Additional Resources**

- **Monitor Service Interface**: `electron/services/monitoring/types.ts`
- **Type Registry**: `electron/services/monitoring/MonitorTypeRegistry.ts`
- **Example Implementations**: `electron/services/monitoring/HttpMonitor.ts` and `electron/services/monitoring/PortMonitor.ts`

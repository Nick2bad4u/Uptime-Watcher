# 🚀 New Monitor Type Implementation Guide

## 📋 Overview

This document provides a **comprehensive, step-by-step guide** for adding a new monitor type to the Uptime Watcher application. The system supports an extensible architecture where new monitor types can be added with minimal changes to existing code.

## 🔍 Current Monitor Types

The system currently supports:

- **HTTP**: Website/API monitoring (`http`)
- **Port**: TCP port connectivity monitoring (`port`)
- **Ping**: Network connectivity monitoring (`ping`)

## 🚀 Enhanced Monitoring System Integration

**NEW REQUIREMENT**: All monitor types must integrate with the enhanced monitoring system that provides operation correlation and race condition prevention.

### **🔹 MonitorCheckResult Interface Requirements**

Your monitor service **MUST** return a result matching the `MonitorCheckResult` interface from `electron/services/monitoring/types.ts`:

```typescript
export interface MonitorCheckResult {
 /** Optional human-readable details about the check result */
 details?: string;
 /** Optional technical error message for debugging */
 error?: string;
 /** Response time in milliseconds (REQUIRED) */
 responseTime: number;
 /** Check result status (REQUIRED) */
 status: "up" | "down";
}
```

### **🔹 Critical Details Field Requirement**

**⚠️ IMPORTANT**: The `details` field should be populated for proper history tracking:

- **HTTP monitors**: Must include status codes (e.g., "HTTP 200 OK", "HTTP 404 Not Found")
- **Port monitors**: Must include connection details (e.g., "Connection successful", "Connection refused")
- **Ping monitors**: Must include response details (e.g., "Ping successful (25ms)", "Request timeout")

**Example implementation:**

```typescript
// ✅ CORRECT - Provides meaningful details
return {
 status: "up",
 responseTime: 150,
 details: "HTTP 200 OK - Response received successfully",
};

// ❌ WRONG - Missing details will show "NULL" in history
return {
 status: "up",
 responseTime: 150,
};
```

### **🔹 Enhanced Monitoring System**

The system uses the **unified enhanced monitoring architecture**:

- **Enhanced Monitoring**: Comprehensive monitoring with operation correlation and race condition prevention
- **Used for**: All scheduled and manual health checks
- **Location**: `electron/services/monitoring/` directory

**Your monitor service integrates seamlessly with the enhanced monitoring infrastructure.**

## ⚡ Critical Requirements for ALL Monitor Types

**Core required fields for every monitor type:**

| Field           | Type     | Range/Validation  | Description                    |
| --------------- | -------- | ----------------- | ------------------------------ |
| `checkInterval` | `number` | 5000ms - 30 days  | Check frequency                |
| `retryAttempts` | `number` | 0 - 10 attempts   | Retry attempts on failure      |
| `timeout`       | `number` | 1000ms - 300000ms | Request timeout                |
| `details`       | `string` | Non-empty string  | Result details for history     |

These fields are enforced by validation schemas and used by the monitoring scheduler.

## �️ Validation Best Practices

**NEW: Use Validator Package for Consistent Validation**

When implementing validation for new monitor types, use the centralized validation utilities:

```typescript
import {
 isNonEmptyString,
 isValidUrl,
 isValidFQDN,
 isValidInteger,
 safeInteger,
} from "electron/utils/validation/validatorUtils";

// Example validation for a web monitor
function validateWebMonitor(monitor: WebMonitor): boolean {
 return isValidUrl(monitor.url) && safeInteger(monitor.timeout, 5000, 1000, 300_000) > 0;
}
```

**Benefits:**

- ✅ **Consistent validation** across all monitor types
- ✅ **Well-tested** validation using the validator.js package
- ✅ **Type-safe** validation with proper TypeScript types
- ✅ **Security-focused** validation patterns
- ✅ **Enhanced monitoring compatibility** for operation correlation

**Critical Validation Requirements:**

1. **Details Field Validation**:
   - Must validate that `details` field will be populated in results
   - Should provide meaningful, non-empty strings
   - Must be human-readable for history display

2. **Interface Compliance**:
   - Must implement `IMonitorService` interface correctly
   - Must return proper `MonitorCheckResult` with details field
   - Must handle all error cases with appropriate details

3. **Enhanced Monitoring Compatibility**:
   - Results must work with both enhanced and traditional systems
   - No interface violations or mixed logic
   - Proper error handling and details propagation

## �📋 Implementation Order

Follow this **exact order** to avoid dependency issues:

1. **Add type definition** (`shared/types.ts`)
2. **Create validation schema** (`shared/validation/schemas.ts`) - **Use validator utilities**
3. **Create monitor service class** (`electron/services/monitoring/`) - **Use validator type guards**
4. **Register monitor type** (`MonitorTypeRegistry.ts`)
5. **Export monitor class** (`index.ts`)
6. **Create comprehensive tests** - **Test validation edge cases**

## 🎯 Required Changes for New Monitor Type

Based on analysis of the existing monitor implementations, here are **ALL** the places you need to make changes:

---

## 📁 **1. Core Type Definitions**

### **🔹 Required Files to Modify:**

#### `shared/types.ts`

- **Location**: Line 18 (BASE_MONITOR_TYPES constant)
- **Change**: Add new type to the const array
- **Example**:

```typescript
export const BASE_MONITOR_TYPES = ["http", "port", "ping", "dns"] as const; // Add 'dns'
```

**⚠️ Important**: This must be done FIRST as other files depend on this type definition.

#### `shared/types/monitorTypes.ts`

- **Purpose**: Add UI configuration interfaces if needed
- **Optional**: Only if new monitor type needs unique UI properties

---

## 📊 **2. Database Layer**

### **🔹 Required Files to Modify:**

#### `electron/services/database/MonitorRepository.ts`

- **No changes required** - Uses dynamic schema that adapts automatically

#### `electron/services/database/utils/dynamicSchema.ts`

- **No changes required** - Generates schema from monitor type registry

#### `shared/validation/schemas.ts`

- **Purpose**: Create Zod validation schema with REQUIRED core fields
- **Location**: Add to `monitorSchemas` object
- **Example**:

```typescript
export const monitorSchemas = {
    http: z.object({...}),
    port: z.object({...}),
    ping: z.object({...}),
    dns: baseMonitorSchema.extend({
        type: z.literal("dns"),
        hostname: z.string().min(1, "Hostname is required"),
        recordType: z.enum(['A', 'AAAA', 'MX', 'CNAME']),
        expectedValue: z.string().optional(),
        // Core fields (checkInterval, retryAttempts, timeout) inherited from baseMonitorSchema
    }),
};
```

**⚠️ Critical**: Your schema MUST extend `baseMonitorSchema` which includes the required core fields (checkInterval, retryAttempts, timeout). Never create a schema from scratch.

---

## 🔧 **3. Backend Services**

### **🔹 Required Files to Create:**

#### `electron/services/monitoring/DnsMonitor.ts` (Example)

- **Purpose**: Implement the `IMonitorService` interface
- **Required Methods**:
  - `check(monitor: Monitor): Promise<MonitorCheckResult>`
  - `updateConfig(config: MonitorConfig): void`
  - `getType(): MonitorType`

**Template Structure**:

```typescript
import { DEFAULT_RETRY_ATTEMPTS } from "./constants";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { getMonitorRetryAttempts, getMonitorTimeout } from "./utils/monitorTypeGuards";

export class DnsMonitor implements IMonitorService {
 private config: MonitorConfig;

 constructor(config: MonitorConfig = {}) {
  this.config = {
   timeout: DEFAULT_REQUEST_TIMEOUT, // Use consistent defaults
   ...config,
  };
 }

 async check(monitor: Monitor): Promise<MonitorCheckResult> {
  // CRITICAL: Validate monitor type first
  if (monitor.type !== "dns") {
   throw new Error(`DnsMonitor cannot handle monitor type: ${monitor.type}`);
  }

  // CRITICAL: Use utility functions for timeout and retries
  const timeout = getMonitorTimeout(monitor, this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT);
  const retryAttempts = getMonitorRetryAttempts(monitor, DEFAULT_RETRY_ATTEMPTS);

  // Implement DNS-specific checking logic here
  // Return MonitorCheckResult with status, responseTime, details
 }

 updateConfig(config: MonitorConfig): void {
  this.config = { ...this.config, ...config };
 }

 getType(): MonitorType {
  return "dns";
 }
}
```

**⚠️ Must Use**: Always use `getMonitorTimeout()` and `getMonitorRetryAttempts()` utilities to safely extract values with fallbacks.

### **🔹 Required Files to Modify:**

#### `electron/services/monitoring/MonitorTypeRegistry.ts`

- **Location**: Add registration call at bottom of file (around line 400+)
- **Change**: Register the new monitor type with complete configuration
- **Template**:

```typescript
registerMonitorType({
 type: "dns",
 displayName: "DNS (Domain Resolution)",
 description: "Monitors DNS resolution for domains",
 version: "1.0.0",
 serviceFactory: () => new DnsMonitor(),
 validationSchema: monitorSchemas.dns,
 fields: [
  {
   name: "hostname",
   label: "Hostname",
   type: "text",
   required: true,
   placeholder: "example.com",
   helpText: "Enter the domain name to resolve",
  },
  {
   name: "recordType",
   label: "Record Type",
   type: "select",
   required: true,
   options: [
    { value: "A", label: "A Record" },
    { value: "AAAA", label: "AAAA Record" },
    { value: "MX", label: "MX Record" },
    { value: "CNAME", label: "CNAME Record" },
   ],
  },
  // Note: checkInterval, retryAttempts, timeout fields are auto-generated
 ],
 uiConfig: {
  supportsAdvancedAnalytics: true,
  supportsResponseTime: true,
  display: {
   showAdvancedMetrics: true,
   showUrl: false, // Set based on monitor type
  },
  formatDetail: (details: string) => `Record: ${details}`,
  formatTitleSuffix: (monitor: Record<string, unknown>) => {
   const hostname = monitor.hostname as string;
   const recordType = monitor.recordType as string;
   return hostname ? ` (${hostname} ${recordType})` : "";
  },
  helpTexts: {
   primary: "Enter the domain name to resolve",
   secondary: "The monitor will check DNS resolution according to your monitoring interval",
  },
 },
});
```

**UI Configuration Explained**:

- `formatDetail`: How to display details in history/status
- `formatTitleSuffix`: Suffix for charts and displays
- `helpTexts`: User guidance in forms
- `display.showUrl`: Whether to show URL field (false for non-HTTP monitors)

#### `electron/services/monitoring/index.ts`

- **Location**: Add export for new monitor class
- **Change**: Export the new monitor service
- **Example**:

```typescript
export { DnsMonitor } from "./DnsMonitor";
```

---

## 🎨 **4. Frontend Components**

### **🔹 Files that Auto-Update (No Changes Required):**

The following components automatically support new monitor types through the registry system:

- ✅ `src/components/common/SiteForm/MonitorTypeSelector.tsx`
- ✅ `src/components/common/SiteForm/MonitorFields.tsx`
- ✅ `src/hooks/useMonitorTypes.ts`
- ✅ `src/utils/validation/monitorFieldValidation.ts`

### **🔹 Optional Customizations:**

#### `src/utils/monitorTitleFormatters.ts`

- **Purpose**: Add custom title formatting (optional)
- **Note**: Default formatting uses registry configuration

#### `src/components/Dashboard/SiteCard/SiteCardHistory.tsx`

- **Purpose**: Add custom history display logic (optional)
- **Note**: Default behavior uses registry configuration

---

## 🧪 **5. Testing**

### **🔹 Required Test Files:**

#### `electron/test/services/monitoring/DnsMonitor.test.ts` (Example)

- **Purpose**: Unit tests for the new monitor service
- **Required Test Cases**:
  - Constructor and config management
  - Successful DNS resolution with proper details
  - Failed DNS resolution with error details
  - Timeout handling with timeout details
  - Error handling with meaningful error messages
  - Response time measurement accuracy
  - **NEW**: Details field validation and content
  - **NEW**: Enhanced monitoring system compatibility
  - **NEW**: Interface compliance verification

**Critical Details Testing:**

```typescript
describe("DNS Monitor Details", () => {
 it("should provide meaningful details for successful checks", async () => {
  const result = await dnsMonitor.check(monitor);
  expect(result.details).toBeDefined();
  expect(result.details).toContain("DNS resolution successful");
  expect(result.details).not.toBe("");
 });

 it("should provide error details for failed checks", async () => {
  // Mock DNS failure
  const result = await dnsMonitor.check(invalidMonitor);
  expect(result.details).toBeDefined();
  expect(result.details).toContain("DNS resolution failed");
 });
});
```

#### `electron/test/services/monitoring/types.test.ts`

- **Location**: Add test case for new monitor type
- **Change**: Verify interface compliance and details requirements

#### `shared/test/validation/schemas.test.ts`

- **Purpose**: Test validation schema for new monitor type

---

## 🔄 **6. IPC Communication**

### **🔹 Files that Auto-Update (No Changes Required):**

The IPC layer automatically supports new monitor types:

- ✅ `electron/services/ipc/IpcService.ts` - Uses dynamic registry
- ✅ `electron/services/ipc/validators.ts` - Uses shared validation schemas
- ✅ `electron/preload.ts` - Type-agnostic API

---

## ⚙️ **7. Configuration & Constants**

### **🔹 Optional Configurations:**

#### `electron/constants.ts`

- **Purpose**: Add monitor-specific constants if needed
- **Example**:

```typescript
export const DNS_TIMEOUT = 5000;
export const DNS_RESOLVERS = ["8.8.8.8", "1.1.1.1"];
```

---

## 📋 **8. Implementation Checklist**

### **🎯 Phase 1: Core Implementation (Required Order)**

- [ ] **Step 1**: Add type to `BASE_MONITOR_TYPES` in `shared/types.ts`
- [ ] **Step 2**: Create validation schema extending `baseMonitorSchema` in `shared/validation/schemas.ts`
- [ ] **Step 3**: Create monitor service class implementing `IMonitorService`
- [ ] **Step 4**: Register monitor type in `MonitorTypeRegistry.ts` with complete configuration
- [ ] **Step 5**: Export monitor class in `electron/services/monitoring/index.ts`

### **🧪 Phase 2: Testing (Critical)**

- [ ] Create comprehensive unit tests for monitor service class
- [ ] Test all required methods: `check()`, `updateConfig()`, `getType()`
- [ ] Test timeout and retry behavior using monitor-specific values
- [ ] Test error handling for invalid monitor configurations
- [ ] Verify registry registration works correctly
- [ ] Test validation schema with valid and invalid data

### **✨ Phase 3: UI Verification (Integration)**

- [ ] Verify new monitor type appears in form dropdown
- [ ] Test form field generation from registry configuration
- [ ] Verify validation works in UI (required fields, format validation)
- [ ] Test monitor creation, editing, and deletion through UI
- [ ] Verify title formatting and detail formatting work correctly

### **📊 Phase 4: End-to-End Testing (Final)**

- [ ] Run full test suite (`npm run test`)
- [ ] Test in development environment with real data
- [ ] Verify database schema adapts correctly for new monitor type
- [ ] Test actual monitoring works (checks run and report results)
- [ ] Verify monitoring scheduler handles new type correctly

---

## 🔍 **Monitor Type Field Types**

### **Available Field Types:**

- `text` - Text input
- `url` - URL input with validation
- `number` - Numeric input with min/max
- `select` - Dropdown with options
- `checkbox` - Boolean checkbox
- `textarea` - Multi-line text

### **Field Definition Properties:**

```typescript
interface MonitorFieldDefinition {
 name: string; // Field identifier
 label: string; // Display label
 type: FieldType; // Input type
 required: boolean; // Whether field is required
 placeholder?: string; // Placeholder text
 helpText?: string; // Help/description text
 min?: number; // Min value (for numbers)
 max?: number; // Max value (for numbers)
 options?: Array<{
  // Options for select fields
  value: string;
  label: string;
 }>;
}
```

---

## 🎯 **Dynamic vs Static Configurations**

### **✅ Dynamic (Handled Automatically):**

- Form field generation
- Validation schema application
- Database schema adaptation
- IPC message handling
- Monitor type selection UI

### **🔧 Manual Configuration Required:**

- Monitor service implementation (`check()` method)
- Validation schema definition
- Monitor type registration
- Custom UI formatters (optional)
- Monitor-specific constants (optional)

---

## 📁 **Key Architecture Files**

### **Registry System:**

- `electron/services/monitoring/MonitorTypeRegistry.ts` - Central registry
- `electron/services/monitoring/MonitorFactory.ts` - Service creation

### **Shared Contracts:**

- `electron/services/monitoring/types.ts` - `IMonitorService` interface
- `shared/types.ts` - Core type definitions
- `shared/validation/schemas.ts` - Validation schemas

### **UI Integration:**

- `src/hooks/useMonitorTypes.ts` - Frontend hook for monitor types
- `src/components/common/SiteForm/` - Dynamic form components

---

## 🚀 **Example: Adding a "DNS" Monitor Type**

Here's a complete example following the **exact implementation order**:

### **Step 1: Update Types**

```typescript
// shared/types.ts - MUST BE FIRST
export const BASE_MONITOR_TYPES = ["http", "port", "ping", "dns"] as const;
```

### **Step 2: Add Validation Schema**

```typescript
// shared/validation/schemas.ts - MUST extend baseMonitorSchema
export const monitorSchemas = {
 // ... existing schemas
 dns: baseMonitorSchema.extend({
  type: z.literal("dns"),
  hostname: z.string().min(1, "Hostname is required"),
  recordType: z.enum(["A", "AAAA", "MX", "CNAME"]),
  expectedValue: z.string().optional(),
  // checkInterval, retryAttempts, timeout are inherited from baseMonitorSchema
 }),
};
```

### **Step 3: Create Monitor Service**

```typescript
// electron/services/monitoring/DnsMonitor.ts
import { lookup } from "dns/promises";
import { DEFAULT_RETRY_ATTEMPTS, DEFAULT_REQUEST_TIMEOUT } from "./constants";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { getMonitorRetryAttempts, getMonitorTimeout } from "./utils/monitorTypeGuards";

export class DnsMonitor implements IMonitorService {
 private config: MonitorConfig;

 constructor(config: MonitorConfig = {}) {
  this.config = {
   timeout: DEFAULT_REQUEST_TIMEOUT,
   ...config,
  };
 }

 async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
  if (monitor.type !== "dns") {
   throw new Error(`DnsMonitor cannot handle monitor type: ${monitor.type}`);
  }

  const startTime = performance.now();
  const timeout = getMonitorTimeout(monitor, this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT);
  const retryAttempts = getMonitorRetryAttempts(monitor, DEFAULT_RETRY_ATTEMPTS);

  try {
   const result = await lookup(monitor.hostname || "");
   const responseTime = Math.round(performance.now() - startTime);

   return {
    status: "up",
    responseTime,
    details: result.address,
    timestamp: Date.now(),
   };
  } catch (error) {
   const responseTime = Math.round(performance.now() - startTime);
   return {
    status: "down",
    responseTime,
    details: error.message,
    timestamp: Date.now(),
   };
  }
 }

 updateConfig(config: Partial<MonitorConfig>): void {
  this.config = { ...this.config, ...config };
 }

 getType(): MonitorType {
  return "dns";
 }
}
```

### **Step 4: Register Monitor Type**

```typescript
// In MonitorTypeRegistry.ts - ADD AT THE BOTTOM
registerMonitorType({
 type: "dns",
 displayName: "DNS (Domain Resolution)",
 description: "Monitors DNS resolution for domains",
 version: "1.0.0",
 serviceFactory: () => new DnsMonitor(),
 validationSchema: monitorSchemas.dns,
 fields: [
  {
   name: "hostname",
   label: "Hostname",
   type: "text",
   required: true,
   placeholder: "example.com",
  },
  {
   name: "recordType",
   label: "Record Type",
   type: "select",
   required: true,
   options: [
    { value: "A", label: "A Record" },
    { value: "AAAA", label: "AAAA Record" },
   ],
  },
 ],
 uiConfig: {
  formatDetail: (details) => `Record: ${details}`,
  formatTitleSuffix: (monitor) => {
   const hostname = monitor.hostname as string;
   return hostname ? ` (${hostname})` : "";
  },
 },
});
```

### **Step 5: Export Monitor Class**

```typescript
// electron/services/monitoring/index.ts
export { DnsMonitor } from "./DnsMonitor";
```

---

## 📝 **Summary**

Adding a new monitor type requires:

1. **5 file modifications** in exact order (types → schema → service → registry → export)
2. **1 new monitor service class** implementing `IMonitorService`
3. **Comprehensive testing** covering all scenarios
4. **Proper field validation** extending `baseMonitorSchema`

**⚠️ Critical Requirements:**

- **ALL monitors MUST support**: `checkInterval`, `retryAttempts`, `timeout`
- **MUST use utility functions**: `getMonitorTimeout()`, `getMonitorRetryAttempts()`
- **MUST extend `baseMonitorSchema`** for validation
- **MUST follow implementation order** to avoid dependency issues

The system is designed to be extensible with minimal code changes thanks to:

- ✅ **Dynamic form generation** from registry configuration
- ✅ **Registry-based type system** with complete UI integration
- ✅ **Automatic database schema adaptation** for new fields
- ✅ **Type-safe validation pipeline** with shared schemas
- ✅ **Pluggable monitor services** with consistent interface

This architecture allows you to focus on implementing the core monitoring logic while the framework handles the integration automatically.

**📌 Remember**: The three required fields (checkInterval, retryAttempts, timeout) are not suggestions - they are enforced by the scheduler and must be supported by every monitor type.

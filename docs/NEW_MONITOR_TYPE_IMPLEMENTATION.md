# 🚀 New Monitor Type Implementation Guide

## 📋 Overview

This document provides a **comprehensive, step-by-step guide** for adding a new monitor type to the Uptime Watcher application. The system supports an extensible architecture where new monitor types can be added with minimal changes to existing code.

## 🔍 Current Monitor Types

The system currently supports:
- **HTTP**: Website/API monitoring (`http`)
- **Port**: TCP port connectivity monitoring (`port`)

## 🎯 Required Changes for New Monitor Type

Based on analysis of the existing `http` and `port` monitor implementations, here are **ALL** the places you need to make changes:

---

## 📁 **1. Core Type Definitions**

### **🔹 Required Files to Modify:**

#### `shared/types.ts`
- **Location**: Line 18
- **Change**: Add new type to `BASE_MONITOR_TYPES` constant
- **Example**:
```typescript
export const BASE_MONITOR_TYPES = ["http", "port", "dns"] as const; // Add 'dns'
```

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
- **Location**: Create new validation schema
- **Change**: Add Zod schema for new monitor type
- **Example**:
```typescript
export const monitorSchemas = {
    http: z.object({...}),
    port: z.object({...}),
    dns: z.object({
        hostname: z.string().min(1),
        recordType: z.enum(['A', 'AAAA', 'MX', 'CNAME']),
        expectedValue: z.string().optional(),
    }),
};
```

---

## 🔧 **3. Backend Services**

### **🔹 Required Files to Create:**

#### `electron/services/monitoring/DnsMonitor.ts` (Example)
- **Purpose**: Implement the `IMonitorService` interface
- **Required Methods**:
  - `check(monitor: Monitor): Promise<MonitorCheckResult>`
  - `updateConfig(config: MonitorConfig): void`
  - `getType(): MonitorType`
- **Example Structure**:
```typescript
export class DnsMonitor implements IMonitorService {
    private config: MonitorConfig;

    constructor(config: MonitorConfig = {}) {
        this.config = { ...config };
    }

    async check(monitor: Monitor): Promise<MonitorCheckResult> {
        // Implementation specific to DNS monitoring
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

### **🔹 Required Files to Modify:**

#### `electron/services/monitoring/MonitorTypeRegistry.ts`
- **Location**: Add registration call at bottom of file (around line 290)
- **Change**: Register the new monitor type
- **Example**:
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
            helpText: "Enter the domain name to resolve"
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
                { value: "CNAME", label: "CNAME Record" }
            ]
        }
    ],
    uiConfig: {
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
        display: {
            showAdvancedMetrics: true,
            showUrl: false
        },
        formatDetail: (details: string) => `Record: ${details}`,
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const hostname = monitor.hostname as string;
            const recordType = monitor.recordType as string;
            return hostname ? ` (${hostname} ${recordType})` : "";
        },
        helpTexts: {
            primary: "Enter the domain name to resolve",
            secondary: "The monitor will check DNS resolution according to your monitoring interval"
        }
    }
});
```

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
  - Successful DNS resolution
  - Failed DNS resolution
  - Timeout handling
  - Error handling
  - Response time measurement

#### `electron/test/services/monitoring/types.test.ts`
- **Location**: Add test case for new monitor type
- **Change**: Verify interface compliance

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
export const DNS_RESOLVERS = ['8.8.8.8', '1.1.1.1'];
```

---

## 📋 **8. Implementation Checklist**

### **🎯 Phase 1: Core Implementation**
- [ ] Add type to `BASE_MONITOR_TYPES` in `shared/types.ts`
- [ ] Create validation schema in `shared/validation/schemas.ts`
- [ ] Create monitor service class (e.g., `DnsMonitor.ts`)
- [ ] Register monitor type in `MonitorTypeRegistry.ts`
- [ ] Export monitor class in `electron/services/monitoring/index.ts`

### **🧪 Phase 2: Testing**
- [ ] Create comprehensive unit tests for monitor service
- [ ] Add integration tests for new monitor type
- [ ] Test validation schema edge cases
- [ ] Verify registry registration works correctly

### **✨ Phase 3: UI Polish (Optional)**
- [ ] Add custom title formatters if needed
- [ ] Add custom detail formatters if needed
- [ ] Add monitor-specific help text and guidance
- [ ] Test form validation and user experience

### **📊 Phase 4: Quality Assurance**
- [ ] Run full test suite (`npm run test`)
- [ ] Test in development environment
- [ ] Verify database migrations work correctly
- [ ] Test monitor creation, editing, and deletion
- [ ] Verify monitoring actually works end-to-end

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
    name: string;           // Field identifier
    label: string;          // Display label
    type: FieldType;        // Input type
    required: boolean;      // Whether field is required
    placeholder?: string;   // Placeholder text
    helpText?: string;      // Help/description text
    min?: number;          // Min value (for numbers)
    max?: number;          // Max value (for numbers)
    options?: Array<{      // Options for select fields
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

Here's a complete example of adding DNS monitoring:

### 1. **Update Types**
```typescript
// shared/types.ts
export const BASE_MONITOR_TYPES = ["http", "port", "dns"] as const;
```

### 2. **Add Validation Schema**
```typescript
// shared/validation/schemas.ts
dns: z.object({
    hostname: z.string().min(1, "Hostname is required"),
    recordType: z.enum(['A', 'AAAA', 'MX', 'CNAME']),
    expectedValue: z.string().optional(),
    timeout: z.number().min(1000).optional(),
})
```

### 3. **Create Monitor Service**
```typescript
// electron/services/monitoring/DnsMonitor.ts
import { lookup } from 'dns/promises';

export class DnsMonitor implements IMonitorService {
    async check(monitor: Monitor): Promise<MonitorCheckResult> {
        const startTime = performance.now();
        
        try {
            const result = await lookup(monitor.hostname || '');
            const responseTime = Math.round(performance.now() - startTime);
            
            return {
                status: "up",
                responseTime,
                details: result.address,
                timestamp: Date.now()
            };
        } catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            return {
                status: "down",
                responseTime,
                details: error.message,
                timestamp: Date.now()
            };
        }
    }

    getType(): MonitorType {
        return "dns";
    }
}
```

### 4. **Register Monitor Type**
```typescript
// In MonitorTypeRegistry.ts
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
            placeholder: "example.com"
        },
        {
            name: "recordType", 
            label: "Record Type",
            type: "select",
            required: true,
            options: [
                { value: "A", label: "A Record" },
                { value: "AAAA", label: "AAAA Record" }
            ]
        }
    ]
});
```

---

## 📝 **Summary**

Adding a new monitor type requires:

1. **3-5 file modifications** (types, schema, registry, export, tests)
2. **1 new monitor service class** 
3. **Comprehensive testing**
4. **Optional UI customizations**

The system is designed to be extensible with minimal code changes thanks to:
- ✅ Dynamic form generation
- ✅ Registry-based type system  
- ✅ Automatic database schema adaptation
- ✅ Type-safe validation pipeline
- ✅ Pluggable monitor services

This architecture allows you to focus on implementing the core monitoring logic while the framework handles the integration automatically.

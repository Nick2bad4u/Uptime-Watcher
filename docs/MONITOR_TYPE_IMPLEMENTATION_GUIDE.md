# Monitor Type Implementation Guide

<!-- markdownlint-disable -->

**Comprehensive guide for implementing new monitor types in Uptime Watcher**

---

## 📋 **Overview**

This document provides a complete, step-by-step guide for implementing new monitor types in the Uptime Watcher application. It covers all files that need to be modified, patterns to follow, and architectural considerations.

**Current Monitor Types**: `http`, `port`
**Example New Type**: `dns` (used throughout this guide)

---

## 🏗️ **Architecture Overview**

The monitor type system follows these key patterns:

### **Core Components**:

1. **Monitor Service** (`IMonitorService` implementation)
2. **Type Registry** (Plugin-based system)
3. **Factory Pattern** (MonitorFactory routing)
4. **Type Definitions** (TypeScript interfaces)
5. **Validation** (Form and business logic)
6. **UI Components** (Forms, selectors, displays)
7. **Testing** (Comprehensive test coverage)

### **Data Flow**:

```na
UI Form → Validation → Monitor Creation → Factory → Service → Check Result → UI Update
```

---

## 📁 **File-by-File Implementation Guide**

### **1. ELECTRON BACKEND**

#### **1.1 Core Type Definition**

**File**: `electron/types.ts`

```typescript
// Current MonitorType (line 20)
export type MonitorType = string; // Already extensible!

// Monitor interface extensions needed (lines 140-180)
export interface Monitor {
 // ... existing fields ...

 // Add new monitor-specific fields
 hostname?: string; // For DNS monitors
 recordType?: string; // For DNS monitors (A, AAAA, MX, etc.)
 expectedValue?: string; // For DNS monitors
}
```

**Action Required**: Add new optional fields to the Monitor interface for the new monitor type.

#### **1.2 Monitor Service Implementation**

**File**: `electron/services/monitoring/DnsMonitor.ts` (NEW)

```typescript
/**
 * DNS monitoring service for DNS resolution health checks.
 */

import { Site } from "../../types";
import { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { performDnsCheckWithRetry } from "./utils/index";

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

 public async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
  if (monitor.type !== "dns") {
   throw new Error(`DnsMonitor cannot handle monitor type: ${monitor.type}`);
  }

  // Validate required fields
  if (!monitor.hostname || !monitor.recordType) {
   return {
    details: "0",
    error: "DNS monitor missing hostname or record type",
    responseTime: 0,
    status: "down",
   };
  }

  const timeout = monitor.timeout;
  const retryAttempts = monitor.retryAttempts;

  return performDnsCheckWithRetry(monitor.hostname, monitor.recordType, monitor.expectedValue, timeout, retryAttempts);
 }

 public updateConfig(config: Partial<MonitorConfig>): void {
  this.config = { ...this.config, ...config };
 }

 public getConfig(): MonitorConfig {
  return { ...this.config };
 }
}
```

**Action Required**: Create a new monitor service implementing the `IMonitorService` interface.

#### **1.3 Monitor Factory Registration**

**File**: `electron/services/monitoring/MonitorFactory.ts`

```typescript
// Add import (line 5)
import { DnsMonitor } from "./DnsMonitor";

// Add static property (line 16)
export class MonitorFactory {
    private static httpMonitor: HttpMonitor;
    private static portMonitor: PortMonitor;
    private static dnsMonitor: DnsMonitor;  // ADD THIS

    // Add case in getMonitor method (line 45)
    switch (type) {
        // ... existing cases ...

        case "dns": {
            if (!this.dnsMonitor) {
                this.dnsMonitor = new DnsMonitor(config);
            }
            return this.dnsMonitor;
        }
    }

    // Add to updateConfig method (line 65)
    public static updateConfig(config: MonitorConfig): void {
        // ... existing updates ...

        if (this.dnsMonitor !== undefined) {
            this.dnsMonitor.updateConfig(config);
        }
    }
}
```

**Action Required**: Register the new monitor service in the factory.

#### **1.4 Monitor Type Registry**

**File**: `electron/services/monitoring/MonitorTypeRegistry.ts`

```typescript
// Add registration (line 65)
registerMonitorType({
 type: "dns",
 displayName: "DNS Monitor",
 description: "Monitors DNS resolution and record validation",
 version: "1.0.0",
});
```

**Action Required**: Register the new monitor type in the registry.

#### **1.5 Validation Logic**

**File**: `electron/managers/validators/MonitorValidator.ts`

```typescript
// Add validation method (line 70)
private validateDnsMonitor(monitor: Site["monitors"][0]): string[] {
    const errors: string[] = [];

    if (!monitor.hostname) {
        errors.push("DNS monitors must have a hostname");
    }

    if (!monitor.recordType) {
        errors.push("DNS monitors must have a record type");
    } else if (!["A", "AAAA", "MX", "CNAME", "TXT"].includes(monitor.recordType)) {
        errors.push("DNS monitors must have a valid record type");
    }

    return errors;
}

// Add to validateMonitorType method (line 45)
public validateMonitorType(monitor: Site["monitors"][0]): string[] {
    switch (monitor.type) {
        // ... existing cases ...
        case "dns":
            return this.validateDnsMonitor(monitor);
        default:
            return [`Unknown monitor type: ${monitor.type}`];
    }
}
```

**Action Required**: Add validation logic for the new monitor type.

#### **1.6 Database Schema Updates**

**File**: `electron/services/database/utils/databaseSchema.ts`

```sql
-- Add new columns to monitors table
ALTER TABLE monitors ADD COLUMN hostname TEXT;
ALTER TABLE monitors ADD COLUMN record_type TEXT;
ALTER TABLE monitors ADD COLUMN expected_value TEXT;
```

**Action Required**: Add database migration for new monitor-specific fields.

#### **1.7 Database Mappers**

**File**: `electron/services/database/utils/monitorMapper.ts`

```typescript
// Update rowToMonitor function (line 30)
export function rowToMonitor(row: Record<string, unknown>): Monitor {
 return {
  // ... existing mappings ...

  // Add new monitor type fields
  ...(row.hostname !== undefined &&
   row.hostname !== null && {
    hostname: typeof row.hostname === "string" ? row.hostname : String(row.hostname),
   }),
  ...(row.record_type !== undefined &&
   row.record_type !== null && {
    recordType: typeof row.record_type === "string" ? row.record_type : String(row.record_type),
   }),
  ...(row.expected_value !== undefined &&
   row.expected_value !== null && {
    expectedValue: typeof row.expected_value === "string" ? row.expected_value : String(row.expected_value),
   }),
 };
}

// Update monitorToRow function (line 60)
export function monitorToRow(monitor: Monitor): Record<string, unknown> {
 return {
  // ... existing mappings ...

  // Add new monitor type fields
  hostname: monitor.hostname ?? null,
  record_type: monitor.recordType ?? null,
  expected_value: monitor.expectedValue ?? null,
 };
}
```

**Action Required**: Add database mapping for new monitor fields.

#### **1.8 Repository Updates**

**File**: `electron/services/database/MonitorRepository.ts`

```typescript
// Update buildMonitorParameters function (line 400)
export function buildMonitorParameters(siteIdentifier: string, monitor: Site["monitors"][0]): unknown[] {
 return [
  // ... existing parameters ...
  monitor.hostname ?? null,
  monitor.recordType ?? null,
  monitor.expectedValue ?? null,
 ];
}

// Update SQL statements to include new columns
const createSql = `INSERT INTO monitors (
    // ... existing columns ...,
    hostname, record_type, expected_value
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
```

**Action Required**: Update repository SQL queries to handle new fields.

#### **1.9 Monitor Utilities**

**File**: `electron/services/monitoring/utils/dnsChecker.ts` (NEW)

```typescript
import dns from "dns/promises";
import { MonitorCheckResult } from "../types";

export async function performSingleDnsCheck(
 hostname: string,
 recordType: string,
 expectedValue?: string,
 timeout: number = 5000
): Promise<MonitorCheckResult> {
 const startTime = performance.now();

 try {
  // Implement DNS resolution logic
  const records = await dns.resolve(hostname, recordType.toLowerCase() as any);
  const responseTime = Math.round(performance.now() - startTime);

  // Validate against expected value if provided
  const isValid = expectedValue
   ? records.some((record) => record.toString().includes(expectedValue))
   : records.length > 0;

  return {
   details: records.join(", "),
   responseTime,
   status: isValid ? "up" : "down",
  };
 } catch (error) {
  const responseTime = Math.round(performance.now() - startTime);
  return {
   details: hostname,
   error: error instanceof Error ? error.message : "DNS resolution failed",
   responseTime,
   status: "down",
  };
 }
}
```

**Action Required**: Create utility functions for the new monitor type.

#### **1.10 Comprehensive Test Coverage**

**Files**: `electron/test/services/monitoring/DnsMonitor.test.ts` (NEW)

```typescript
describe("DnsMonitor", () => {
 describe("constructor", () => {
  /* ... */
 });
 describe("getType", () => {
  /* ... */
 });
 describe("check", () => {
  /* ... */
 });
 describe("updateConfig", () => {
  /* ... */
 });
 describe("getConfig", () => {
  /* ... */
 });
});
```

**Action Required**: Create comprehensive test files for all new components.

---

### **2. FRONTEND IMPLEMENTATION**

#### **2.1 Type Definitions**

**File**: `src/types.ts`

```typescript
// Monitor interface extension (line 63)
export interface Monitor {
 // ... existing fields ...

 // DNS monitor specific fields
 hostname?: string;
 recordType?: string;
 expectedValue?: string;
}
```

**Action Required**: Add frontend type definitions for new monitor fields.

#### **2.2 Form State Management**

**File**: `src/components/AddSiteForm/useAddSiteForm.ts`

```typescript
// Add form state (line 25)
export interface AddSiteFormState {
 // ... existing fields ...

 // DNS monitor fields
 hostname: string;
 recordType: string;
 expectedValue: string;
}

// Add state management (line 95)
export function useAddSiteForm(): AddSiteFormState & AddSiteFormActions {
 // ... existing state ...

 const [hostname, setHostname] = useState("");
 const [recordType, setRecordType] = useState("A");
 const [expectedValue, setExpectedValue] = useState("");

 // Add to useEffect for monitor type changes (line 120)
 useEffect(() => {
  setFormError(undefined);

  if (monitorType === "dns") {
   setUrl("");
   setHost("");
   setPort("");
  } else if (monitorType === "http") {
   setHostname("");
   setRecordType("");
   setExpectedValue("");
  }
  // ... existing logic ...
 }, [monitorType]);

 return {
  // ... existing returns ...
  hostname,
  recordType,
  expectedValue,
  setHostname,
  setRecordType,
  setExpectedValue,
 };
}
```

**Action Required**: Add form state management for new monitor fields.

#### **2.3 Form UI Components**

**File**: `src/components/AddSiteForm/AddSiteForm.tsx`

```tsx
// Add DNS monitor form section (line 220)
{
 /* DNS Monitor Fields */
}
{
 monitorType === "dns" && (
  <div className="flex flex-col gap-2">
   <TextField
    disabled={isLoading}
    helpText="Enter the hostname to resolve"
    id="hostname"
    label="Hostname"
    onChange={setHostname}
    placeholder="example.com"
    required
    type="text"
    value={hostname}
   />
   <SelectField
    disabled={isLoading}
    id="recordType"
    label="DNS Record Type"
    onChange={setRecordType}
    options={[
     { label: "A Record (IPv4)", value: "A" },
     { label: "AAAA Record (IPv6)", value: "AAAA" },
     { label: "MX Record (Mail)", value: "MX" },
     { label: "CNAME Record", value: "CNAME" },
     { label: "TXT Record", value: "TXT" },
    ]}
    value={recordType}
   />
   <TextField
    disabled={isLoading}
    helpText="Optional expected value in DNS response"
    id="expectedValue"
    label="Expected Value"
    onChange={setExpectedValue}
    placeholder="192.168.1.1"
    type="text"
    value={expectedValue}
   />
  </div>
 );
}

// Update monitor type selector (line 170)
<SelectField
 disabled={isLoading}
 id="monitorType"
 label="Monitor Type"
 onChange={(value) => setMonitorType(value as MonitorType)}
 options={[
  { label: "HTTP (Website/API)", value: "http" },
  { label: "Port (Host/Port)", value: "port" },
  { label: "DNS (Domain Resolution)", value: "dns" }, // ADD THIS
 ]}
 value={monitorType}
/>;
```

**Action Required**: Add UI components for new monitor type in the form.

#### **2.4 Form Validation**

**File**: `src/components/AddSiteForm/Submit.tsx`

```typescript
// Add validation function (line 140)
function validateDnsMonitor(hostname: string, recordType: string): string[] {
 const errors: string[] = [];

 if (!hostname.trim()) {
  errors.push("Hostname is required for DNS monitor");
 } else if (!validator.isFQDN(hostname.trim())) {
  errors.push("Hostname must be a valid domain name");
 }

 if (!recordType.trim()) {
  errors.push("DNS record type is required");
 }

 return errors;
}

// Update validateMonitorType function (line 160)
function validateMonitorType(
 monitorType: string,
 url: string,
 host: string,
 port: string,
 hostname: string, // ADD THIS
 recordType: string // ADD THIS
): string[] {
 if (monitorType === "http") {
  return validateHttpMonitor(url);
 }

 if (monitorType === "port") {
  return validatePortMonitor(host, port);
 }

 if (monitorType === "dns") {
  // ADD THIS
  return validateDnsMonitor(hostname, recordType);
 }

 return [];
}

// Update createMonitor function (line 200)
function createMonitor(properties: FormSubmitProperties): Monitor {
 const {
  checkInterval,
  generateUuid,
  host,
  monitorType,
  port,
  url,
  hostname, // ADD THIS
  recordType, // ADD THIS
  expectedValue, // ADD THIS
 } = properties;

 const monitor: Monitor = {
  // ... existing fields ...
 };

 if (monitorType === "http") {
  monitor.url = url.trim();
 } else if (monitorType === "port") {
  monitor.host = host.trim();
  monitor.port = Number(port);
 } else if (monitorType === "dns") {
  // ADD THIS
  monitor.hostname = hostname.trim();
  monitor.recordType = recordType;
  if (expectedValue.trim()) {
   monitor.expectedValue = expectedValue.trim();
  }
 }

 return monitor;
}
```

**Action Required**: Add frontend validation for new monitor type.

#### **2.5 Monitor Display Components**

**File**: `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`

```typescript
// Update formatMonitorOption function (line 65)
const formatMonitorOption = useCallback((monitor: Monitor) => {
 const monitorLabel = monitor.type.toUpperCase();
 const getDetail = () => {
  if (monitor.port) {
   return `:${monitor.port}`;
  }
  if (monitor.url) {
   return `: ${monitor.url}`;
  }
  if (monitor.hostname) {
   // ADD THIS
   return `: ${monitor.hostname} (${monitor.recordType})`;
  }
  return "";
 };
 return `${monitorLabel}${getDetail()}`;
}, []);
```

**Action Required**: Update monitor display logic for new type.

#### **2.6 Form Interface Updates**

**File**: `src/components/AddSiteForm/Submit.tsx` (Interface)

```typescript
// Update FormSubmitProperties interface (line 20)
interface FormSubmitProperties extends
    Pick<AddSiteFormState,
        "addMode" | "checkInterval" | "host" | "monitorType" | "name" | "port" | "selectedExistingSite" | "siteId" | "url" |
        "hostname" | "recordType" | "expectedValue"  // ADD THESE
    >,
    Pick<AddSiteFormActions, "setFormError"> &
    StoreActions & {
        generateUuid: () => string;
        logger: Logger;
        onSuccess?: () => void;
    };
```

**Action Required**: Update interfaces to include new monitor fields.

#### **2.7 Help Text and Instructions**

**File**: `src/components/AddSiteForm/AddSiteForm.tsx`

```tsx
// Update help text section (line 275)
{
 monitorType === "dns" && (
  <>
   <ThemedText size="xs" variant="tertiary">
    • Enter a valid hostname/domain name
   </ThemedText>
   <ThemedText size="xs" variant="tertiary">
    • Select the DNS record type to query
   </ThemedText>
   <ThemedText size="xs" variant="tertiary">
    • Optional: specify expected value in DNS response
   </ThemedText>
  </>
 );
}
```

**Action Required**: Add help text for new monitor type.

---

### **3. TESTING REQUIREMENTS**

#### **3.1 Backend Tests**

**Files to Create**:

- `electron/test/services/monitoring/DnsMonitor.test.ts`
- `electron/test/services/monitoring/utils/dnsChecker.test.ts`
- `electron/test/managers/validators/MonitorValidator.dns.test.ts`

#### **3.2 Frontend Tests**

**Files to Update**:

- `src/test/AddSiteForm.test.tsx`
- `src/test/useAddSiteForm.test.ts`
- `src/test/components/MonitorSelector.test.tsx`
- `src/test/remaining-uncovered-lines.test.tsx`

#### **3.3 Integration Tests**

**Files to Update**:

- `electron/test/utils/monitoring/monitorStatusChecker.test.ts`
- `electron/test/services/monitoring/MonitorFactory.test.ts`

---

## 🚨 **Current Architecture Issues & Improvements**

### **Issue 1: Hard-coded Monitor Type Lists**

**Problem**: Monitor types are hard-coded in multiple places:

- Frontend form options (line 170 in AddSiteForm.tsx)
- Validation switch statements
- Factory switch statements

**Improvement Needed**:

```typescript
// Create a centralized monitor type configuration
export const MONITOR_TYPE_CONFIGS = {
 http: {
  label: "HTTP (Website/API)",
  description: "Monitors HTTP/HTTPS endpoints",
  fields: ["url"],
  validation: validateHttpMonitor,
 },
 port: {
  label: "Port (Host/Port)",
  description: "Monitors TCP port connectivity",
  fields: ["host", "port"],
  validation: validatePortMonitor,
 },
 dns: {
  label: "DNS (Domain Resolution)",
  description: "Monitors DNS resolution",
  fields: ["hostname", "recordType", "expectedValue?"],
  validation: validateDnsMonitor,
 },
} as const;

// Auto-generate form options
const monitorTypeOptions = Object.entries(MONITOR_TYPE_CONFIGS).map(([value, config]) => ({
 label: config.label,
 value,
}));
```

### **Issue 2: Scattered Validation Logic**

**Problem**: Validation logic is duplicated between frontend and backend.

**Improvement Needed**:

```typescript
// Create shared validation schemas
import { z } from "zod";

export const monitorSchemas = {
 http: z.object({
  url: z.string().url(),
 }),
 port: z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
 }),
 dns: z.object({
  hostname: z.string().min(1),
  recordType: z.enum(["A", "AAAA", "MX", "CNAME", "TXT"]),
  expectedValue: z.string().optional(),
 }),
};
```

### **Issue 3: Manual Database Schema Management**

**Problem**: No automatic migration system for new monitor fields.

**Improvement Needed**:

```typescript
// Create a migration system
export const migrations = [
 {
  version: "1.1.0",
  up: `ALTER TABLE monitors ADD COLUMN hostname TEXT;`,
  down: `ALTER TABLE monitors DROP COLUMN hostname;`,
 },
 {
  version: "1.2.0",
  up: `ALTER TABLE monitors ADD COLUMN record_type TEXT;`,
  down: `ALTER TABLE monitors DROP COLUMN record_type;`,
 },
];
```

### **Issue 4: Type Safety Issues**

**Problem**: MonitorType is just `string`, no compile-time type safety.

**Improvement Needed**:

```typescript
// Create a union type from registry
export type MonitorType = "http" | "port" | "dns";

// Or make it extensible
export type MonitorType = keyof typeof MONITOR_TYPE_CONFIGS;
```

### **Issue 5: Factory Pattern Scalability**

**Problem**: MonitorFactory requires manual updates for each new type.

**Improvement Needed**:

```typescript
// Create an auto-registering factory
export class MonitorFactory {
 private static monitors = new Map<string, () => IMonitorService>();

 public static register<T extends IMonitorService>(type: string, factory: () => T): void {
  this.monitors.set(type, factory);
 }

 public static getMonitor(type: string): IMonitorService {
  const factory = this.monitors.get(type);
  if (!factory) {
   throw new Error(`Unknown monitor type: ${type}`);
  }
  return factory();
 }
}

// Auto-register monitor types
MonitorFactory.register("dns", () => new DnsMonitor());
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Backend Core**

- [ ] Add monitor fields to types
- [ ] Create monitor service class
- [ ] Add utility functions
- [ ] Update factory registration
- [ ] Add type registry entry
- [ ] Update validation logic
- [ ] Add database schema migration
- [ ] Update database mappers
- [ ] Update repository queries

### **Phase 2: Frontend Integration**

- [ ] Add frontend type definitions
- [ ] Update form state management
- [ ] Add UI components
- [ ] Update form validation
- [ ] Update monitor display
- [ ] Add help text and instructions

### **Phase 3: Testing**

- [ ] Create backend unit tests
- [ ] Create frontend unit tests
- [ ] Update integration tests
- [ ] Add end-to-end tests

### **Phase 4: Documentation**

- [ ] Update API documentation
- [ ] Update user guide
- [ ] Add migration notes
- [ ] Update README.md

---

## 🔄 **Migration Strategy**

### **Database Migration**

1. Add new columns as nullable
2. Populate existing data with defaults
3. Update application code
4. Make columns non-nullable if required

### **Code Migration**

1. Implement backend changes first
2. Add comprehensive tests
3. Implement frontend changes
4. Update documentation
5. Deploy with feature flags

---

## 🎯 **Priority Improvements for Easier Implementation**

### **High Priority**

1. **Centralized Monitor Type Configuration** - Eliminates manual updates in multiple files
2. **Shared Validation Schemas** - Reduces duplication and ensures consistency
3. **Auto-registering Factory** - Makes adding new types trivial

### **Medium Priority**

1. **Database Migration System** - Automates schema changes
2. **Type Safety Improvements** - Catches errors at compile time
3. **Plugin Architecture** - Allows external monitor types

### **Low Priority**

1. **Configuration UI** - Visual editor for monitor types
2. **Hot-reloading** - Dynamic monitor type registration
3. **Monitor Type Marketplace** - Community-contributed types

---

## 📚 **References**

- **Current HTTP Monitor**: `electron/services/monitoring/HttpMonitor.ts`
- **Current Port Monitor**: `electron/services/monitoring/PortMonitor.ts`
- **Factory Pattern**: `electron/services/monitoring/MonitorFactory.ts`
- **Type Registry**: `electron/services/monitoring/MonitorTypeRegistry.ts`
- **Form Implementation**: `src/components/AddSiteForm/AddSiteForm.tsx`
- **Validation Logic**: `src/components/AddSiteForm/Submit.tsx`

---

**This guide provides a complete roadmap for implementing new monitor types. Each section includes specific file locations, code examples, and actionable requirements.**

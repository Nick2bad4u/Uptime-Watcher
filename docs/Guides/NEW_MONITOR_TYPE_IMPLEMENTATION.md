# 🚀 New Monitor Type Implementation Guide

## 📋 Overview

This document provides a **comprehensive, step-by-step guide** for adding a new monitor type to the Uptime Watcher application. The system supports an extensible, production-ready architecture where new monitor types can be added with minimal changes to existing code while maintaining enterprise-grade quality.

## 🔍 Current Monitor Types

The system currently supports:

- **HTTP**: Website/API monitoring (`http`)
- **Port**: TCP port connectivity monitoring (`port`)
- **Ping**: Network connectivity monitoring (`ping`)

## 🏗️ Architecture Integration

All new monitor types must integrate with the **production-grade unified architecture** based on our established ADRs:

### **📋 Architectural Requirements (ADR Compliance)**

✅ **Repository Pattern (ADR-001)**: Database operations use dual-method pattern with transaction safety  
✅ **Event-Driven Architecture (ADR-002)**: TypedEventBus integration with correlation tracking  
✅ **Error Handling Strategy (ADR-003)**: Comprehensive error handling with operation correlation  
✅ **Frontend State Management (ADR-004)**: Zustand stores with proper cleanup  
✅ **IPC Communication Protocol (ADR-005)**: Standardized IPC with type safety

### **✨ Enhanced Monitoring System Integration**

**PRODUCTION REQUIREMENT**: All monitor types must integrate with the enhanced monitoring system that provides:

- **Operation Correlation**: Race condition prevention with unique operation IDs
- **Memory Management**: Automatic resource cleanup and leak prevention
- **Transaction Safety**: Synchronous database operations eliminate race conditions
- **Comprehensive Monitoring**: Event emission, metrics collection, and observability
- **Error Resilience**: Production-grade error handling with recovery patterns

### **🔹 MonitorCheckResult Interface Requirements**

Your monitor service **MUST** return a result matching the `MonitorCheckResult` interface from `electron/services/monitoring/types.ts`:

```typescript
/**
 * Standardized result interface for all monitor check operations.
 *
 * @remarks
 * This interface ensures consistency across all monitor types and provides
 * the necessary data for history tracking, status updates, and user feedback.
 * All fields are designed to support production monitoring and debugging.
 *
 * @public
 */
export interface MonitorCheckResult {
 /**
  * Optional human-readable details about the check result.
  *
  * @remarks
  * Should provide meaningful context for history display and debugging.
  * Examples: "HTTP 200 OK", "Connection timeout", "DNS resolution successful"
  */
 details?: string;

 /**
  * Optional error message if the check failed.
  *
  * @remarks
  * Should contain technical error information for debugging.
  * Examples: "ECONNREFUSED", "DNS_PROBE_FINISHED_NXDOMAIN"
  */
 error?: string;

 /**
  * Response time in milliseconds.
  *
  * @remarks
  * REQUIRED field representing actual response time for successful checks
  * or timeout value for failed checks. Used for performance analytics.
  */
 responseTime: number;

 /**
  * Status outcome of the check.
  *
  * @remarks
  * REQUIRED field indicating whether the monitored resource is accessible.
  * Used for uptime calculations and alerting.
  */
 status: "up" | "down";
}
```

### **🔹 Critical Implementation Requirements**

**⚠️ PRODUCTION REQUIREMENTS - All Fields:**

- **`responseTime: number`** - **REQUIRED** field representing response time in milliseconds
- **`status: "up" | "down"`** - **REQUIRED** status outcome for uptime calculations
- **`details?: string`** - **HIGHLY RECOMMENDED** for comprehensive history tracking and user feedback
- **`error?: string`** - **RECOMMENDED** for technical error information and debugging

**Production-Grade Implementation Examples:**

```typescript
// ✅ EXCELLENT - Complete production implementation
return {
 status: "up",
 responseTime: 150, // Actual measured response time
 details: "HTTP 200 OK - Response received successfully", // User-friendly description
 error: undefined, // No technical errors
};

// ✅ GOOD - Error case with comprehensive info
return {
 status: "down",
 responseTime: 5000, // Timeout value when failed
 details: "Connection timeout after 5 seconds", // User-friendly description
 error: "ECONNREFUSED - Connection refused by target", // Technical details
};

// ✅ ACCEPTABLE - Minimal valid implementation
return {
 status: "down",
 responseTime: 5000,
 details: "Connection timeout",
};

// ❌ INVALID - Missing required responseTime
return {
 status: "up",
 details: "HTTP 200 OK",
 // Missing responseTime - TypeScript compilation error
};

// ❌ POOR - No details for history tracking
return {
 status: "up",
 responseTime: 150,
 // Missing details - poor user experience
};
```

### **🔹 Production-Grade Enhanced Monitoring System**

The system uses the **unified enhanced monitoring architecture** with the following production features:

- **Operation Correlation**: Race condition prevention with UUID-based operation tracking
- **Memory Management**: Automatic cleanup of resources, timeouts, and event listeners
- **Transaction Safety**: Synchronous database operations eliminate race conditions
- **Error Resilience**: Comprehensive error handling with withErrorHandling utilities
- **Event-Driven Updates**: TypedEventBus with middleware for logging and monitoring
- **Resource Cleanup**: Proper disposal of network connections and scheduled operations

**Architecture Benefits:**

- **Zero Legacy Systems**: Only enhanced monitoring exists - no fallback complexity
- **Production Monitoring**: Full observability with correlation IDs and event tracking
- **Memory Safety**: Automatic cleanup prevents leaks in long-running operations
- **Race Condition Immunity**: Operation correlation prevents state corruption

## ⚡ Production Requirements for ALL Monitor Types

### **🔹 Core Required Fields**

Every monitor type must support these standardized fields:

| Field           | Type     | Range/Validation  | Purpose                            | ADR Reference |
| --------------- | -------- | ----------------- | ---------------------------------- | ------------- |
| `checkInterval` | `number` | 5000ms - 30 days  | Monitoring frequency scheduling    | ADR-001       |
| `retryAttempts` | `number` | 0 - 10 attempts   | Failure retry logic                | ADR-003       |
| `timeout`       | `number` | 1000ms - 300000ms | Request timeout for reliability    | ADR-003       |
| `details`       | `string` | Non-empty string  | History tracking and user feedback | ADR-002       |

### **🔹 Production Quality Standards**

- **Error Handling**: Must use `withErrorHandling` utilities (ADR-003)
- **Memory Management**: Proper resource cleanup and timeout management
- **Transaction Safety**: Database operations through repository pattern (ADR-001)
- **Event Integration**: TypedEventBus integration for monitoring events (ADR-002)
- **Type Safety**: Complete TypeScript interfaces with TSDoc documentation

### **🔹 Repository Pattern Integration**

All monitor data operations must use the Repository Pattern with transaction safety:

````typescript
/**
 * Monitor service implementing production-grade monitoring patterns.
 *
 * @remarks
 * Integrates with the repository pattern for database operations, enhanced
 * monitoring system for operation correlation, and comprehensive error handling
 * for production reliability.
 *
 * @example
 * ```typescript
 * const monitor = new CustomMonitor();
 * const result = await monitor.check(config);
 * // Result automatically integrates with database through repository pattern
 * ```
 */
export class CustomMonitor implements IMonitorService {
 /**
  * Performs a monitoring check with comprehensive error handling.
  *
  * @param monitor - Monitor configuration with validated fields
  * @returns Promise resolving to standardized check result
  * @throws Error with correlation ID for debugging
  */
 async check(monitor: CustomMonitorConfig): Promise<MonitorCheckResult> {
  return await withErrorHandling(
   async () => {
    // Implementation with proper cleanup
    const startTime = performance.now();
    try {
     // Actual monitoring logic
     const result = await performActualCheck(monitor);

     return {
      status: "up",
      responseTime: performance.now() - startTime,
      details: `Check successful: ${result.message}`,
     };
    } catch (error) {
     return {
      status: "down",
      responseTime: performance.now() - startTime,
      details: "Check failed",
      error: error instanceof Error ? error.message : String(error),
     };
    }
   },
   {
    logger,
    operationName: "CustomMonitor.check",
    correlationId: generateCorrelationId(),
   }
  );
 }
}
````

## 🛡️ Production-Grade Validation Standards

### **🔹 Centralized Validation System**

**PRODUCTION REQUIREMENT**: Use the centralized validation utilities for consistent, secure validation:

```typescript
import {
 isNonEmptyString,
 isValidUrl,
 isValidFQDN,
 isValidInteger,
 safeInteger,
 isValidPort,
} from "shared/utils/validation";

import { withErrorHandling } from "shared/utils/errorHandling";

/**
 * Production-grade validation for custom monitor configuration.
 *
 * @remarks
 * Implements comprehensive validation using centralized utilities,
 * ensuring consistency with other monitor types and security best practices.
 *
 * @param monitor - Monitor configuration to validate
 * @returns true if valid, throws descriptive error if invalid
 * @throws Error with specific validation failure details
 */
function validateCustomMonitor(monitor: CustomMonitor): boolean {
 return withErrorHandling(
  () => {
   // Core field validation using centralized utilities
   if (!isValidUrl(monitor.url)) {
    throw new Error("Invalid URL format");
   }

   if (!isValidInteger(monitor.timeout, 1000, 300_000)) {
    throw new Error("Timeout must be between 1000ms and 300000ms");
   }

   if (!isNonEmptyString(monitor.name)) {
    throw new Error("Monitor name cannot be empty");
   }

   // Custom validation logic
   if (monitor.customField && !isValidCustomField(monitor.customField)) {
    throw new Error("Custom field validation failed");
   }

   return true;
  },
  { logger, operationName: "CustomMonitor.validation" }
 );
}
```

### **🔹 Validation Benefits**

- ✅ **Security-Focused**: Uses validator.js package for proven security patterns
- ✅ **Consistent**: Same validation patterns across all monitor types
- ✅ **Type-Safe**: Complete TypeScript integration with proper error types
- ✅ **Production-Ready**: Comprehensive error handling with correlation IDs
- ✅ **Enhanced Monitoring Compatible**: Integrates with operation correlation system

### **🔹 Critical Validation Requirements**

1. **Details Field Validation**:

   ```typescript
   // Must ensure details will be populated in results
   if (!isNonEmptyString(result.details)) {
    logger.warn("Monitor result missing details field");
   }
   ```

2. **Interface Compliance**:

   ```typescript
   // Must implement IMonitorService with proper error handling
   class CustomMonitor implements IMonitorService {
    async check(monitor: MonitorConfig): Promise<MonitorCheckResult> {
     // Implementation must handle all error cases
    }
   }
   ```

3. **Enhanced Monitoring Compatibility**:
   ```typescript
   // Results must work with operation correlation
   const result: MonitorCheckResult = {
    status: determineStatus(),
    responseTime: measureResponseTime(),
    details: generateUserFriendlyDetails(),
    error: captureErrorDetails(),
   };
   ```

### **🔹 Memory Management in Validation**

```typescript
/**
 * Memory-safe validation with proper cleanup.
 */
function validateWithCleanup(monitor: MonitorConfig): boolean {
 const validationResources = new Set<() => void>();

 try {
  // Validation logic with resource tracking
  const cleanup1 = setupValidationResource();
  validationResources.add(cleanup1);

  return performValidation(monitor);
 } finally {
  // Always cleanup resources
  for (const cleanup of validationResources) {
   try {
    cleanup();
   } catch (error) {
    logger.warn("Validation cleanup failed", error);
   }
  }
 }
}
```

## 📋 Production-Grade Implementation Order

Follow this **exact order** to ensure proper dependency resolution and maintain architectural compliance:

### **� Phase 1: Foundation (ADR Compliance)**

1. **Add type definition** (`shared/types.ts`) - **CRITICAL FIRST STEP**
2. **Create validation schema** (`shared/validation/schemas.ts`) - **Use centralized validator utilities**
3. **Add TSDoc documentation** - **Follow current documentation standards**

### **🔹 Phase 2: Core Implementation**

4. **Create monitor service class** (`electron/services/monitoring/`) - **Implement IMonitorService with error handling**
5. **Add repository integration** - **Follow dual-method pattern from ADR-001**
6. **Implement memory management** - **Proper resource cleanup and timeout handling**

### **🔹 Phase 3: System Integration**

7. **Register monitor type** (`MonitorTypeRegistry.ts`) - **Complete UI configuration**
8. **Export monitor class** (`index.ts`) - **Module exports**
9. **Add IPC handlers** - **Follow ADR-005 standardized protocol**

### **🔹 Phase 4: Quality Assurance**

10. **Create comprehensive tests** - **Cover all validation edge cases and error scenarios**
11. **Add integration tests** - **Test with actual monitoring system**
12. **Performance testing** - **Verify memory usage and cleanup**

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

- **Purpose**: Create production-grade Zod validation schema with comprehensive error handling
- **Location**: Add to `monitorSchemas` object using centralized validation utilities
- **Example**:

```typescript
import { z } from "zod";
import { isValidFQDN, isValidUrl } from "../utils/validation";

/**
 * Validation schema for DNS monitor configuration.
 *
 * @remarks
 * Extends baseMonitorSchema to inherit core monitoring fields (checkInterval,
 * retryAttempts, timeout) and adds DNS-specific validation using centralized
 * validation utilities for consistency and security.
 */
export const monitorSchemas = {
 // ... existing schemas
 dns: baseMonitorSchema.extend({
  type: z.literal("dns"),
  hostname: z
   .string()
   .min(1, "Hostname is required")
   .refine(isValidFQDN, "Must be a valid domain name"),
  recordType: z.enum(["A", "AAAA", "MX", "CNAME"], {
   errorMap: () => ({ message: "Must select a valid DNS record type" }),
  }),
  expectedValue: z.string().optional(),
  // Core fields (checkInterval, retryAttempts, timeout) automatically inherited
 }),
};
```

**⚠️ CRITICAL REQUIREMENTS**:

- **MUST extend `baseMonitorSchema`** which includes required monitoring fields
- **MUST use centralized validation utilities** for security and consistency
- **MUST include comprehensive error messages** for user experience
- **NEVER create schemas from scratch** - always extend the base schema

---

## 🔧 **3. Production-Grade Backend Services**

### **🔹 Required Files to Create:**

#### `electron/services/monitoring/DnsMonitor.ts` (Example)

- **Purpose**: Implement production-ready `IMonitorService` interface with comprehensive error handling
- **Required Methods**:
  - `check(monitor: Monitor): Promise<MonitorCheckResult>` - **With operation correlation**
  - `updateConfig(config: MonitorConfig): void` - **With validation**
  - `getType(): MonitorType` - **Type identification**

**Production Template Structure**:

````typescript
/**
 * DNS monitoring service with production-grade reliability and error handling.
 *
 * @remarks
 * Implements the IMonitorService interface with comprehensive error handling,
 * operation correlation for race condition prevention, and proper resource
 * management following ADR-003 error handling strategy.
 *
 * Features:
 * - Operation correlation prevents race conditions
 * - Memory-safe resource management
 * - Comprehensive error handling with correlation IDs
 * - Production-grade validation and logging
 *
 * @example
 * ```typescript
 * const monitor = new DnsMonitor();
 * const result = await monitor.check(dnsConfig);
 * // Automatically integrates with enhanced monitoring system
 * ```
 *
 * @public
 */

import type { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";
import { DEFAULT_RETRY_ATTEMPTS, DEFAULT_TIMEOUT } from "./constants";
import {
 getMonitorRetryAttempts,
 getMonitorTimeout,
} from "./utils/monitorTypeGuards";
import { withErrorHandling } from "../../utils/errorHandling";
import { generateCorrelationId } from "../../utils/correlation";
import { logger } from "../../utils/logger";

export class DnsMonitor implements IMonitorService {
 private config: MonitorConfig;
 private activeOperations = new Set<string>();

 constructor(config: MonitorConfig = {}) {
  this.config = {
   timeout: DEFAULT_TIMEOUT, // Use consistent defaults
   retryAttempts: DEFAULT_RETRY_ATTEMPTS,
   ...config,
  };
 }

 /**
  * Performs DNS monitoring check with comprehensive error handling and operation correlation.
  *
  * @param monitor - DNS monitor configuration with validated fields
  * @returns Promise resolving to standardized MonitorCheckResult
  * @throws Error with correlation ID for debugging and operation tracking
  */
 async check(monitor: Monitor): Promise<MonitorCheckResult> {
  const correlationId = generateCorrelationId();

  return await withErrorHandling(
   async () => {
    // Type validation
    if (monitor.type !== "dns") {
     throw new Error(`DnsMonitor cannot handle monitor type: ${monitor.type}`);
    }

    // Operation correlation for race condition prevention
    this.activeOperations.add(correlationId);

    try {
     // Extract configuration using utility functions for consistency
     const timeout = getMonitorTimeout(monitor, this.config.timeout);
     const retryAttempts = getMonitorRetryAttempts(monitor, this.config.retryAttempts);

     // Performance tracking
     const startTime = performance.now();

     // DNS resolution logic with timeout and retry
     const result = await this.performDnsCheck(monitor, timeout, retryAttempts);

     const responseTime = performance.now() - startTime;

     return {
      status: result.success ? "up" : "down",
      responseTime: Math.round(responseTime),
      details: result.details || `DNS check ${result.success ? "successful" : "failed"}`,
      error: result.error,
     };
    } finally {
     // Always cleanup operation tracking
     this.activeOperations.delete(correlationId);
    }
   },
   {
    logger,
    operationName: "DnsMonitor.check",
    correlationId
   }
  );
 }

 /**
  * Updates monitor configuration with validation.
  *
  * @param config - New configuration to apply
  */
 updateConfig(config: MonitorConfig): void {
  // Validate configuration before applying
  this.config = {
   ...this.config,
   ...config,
  };

  logger.debug("DNS monitor configuration updated", {
   config: this.config
  });
 }

 /**
  * Returns the monitor type identifier.
  *
  * @returns The monitor type for DNS monitoring
  */
 getType(): MonitorType {
  return "dns";
 }

 /**
  * Performs the actual DNS check with proper error handling and resource cleanup.
  *
  * @private
  */
 private async performDnsCheck(
  monitor: Monitor,
  timeout: number,
  retryAttempts: number
 ): Promise<{ success: boolean; details?: string; error?: string }> {
  // DNS implementation with proper cleanup
  const cleanup = new Set<() => void>();

  try {
   // Implementation specific to DNS monitoring
   // ... DNS resolution logic

   return {
    success: true,
    details: "DNS resolution successful",
   };
  } catch (error) {
   return {
    success: false,
    details: "DNS resolution failed",
    error: error instanceof Error ? error.message : String(error),
   };
  } finally {
   // Cleanup resources
   for (const cleanupFn of cleanup) {
    try {
     cleanupFn();
    } catch (cleanupError) {
     logger.warn("DNS monitor cleanup failed", cleanupError);
    }
   }
  }
 }

 /**
  * Cleanup method for graceful shutdown.
  *
  * @remarks
  * Called during application shutdown to ensure proper resource cleanup
  * and prevent memory leaks.
  */
 async shutdown(): Promise<void> {
  // Cancel any active operations
  this.activeOperations.clear();

  logger.debug("DNS monitor shutdown completed");
 }

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
````

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
   secondary:
    "The monitor will check DNS resolution according to your monitoring interval",
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

## 🧪 **5. Production-Grade Testing Requirements**

### **🔹 Required Test Files:**

#### `electron/test/services/monitoring/DnsMonitor.test.ts` (Example)

- **Purpose**: Comprehensive unit tests for the new monitor service with production coverage
- **Required Test Cases**:

```typescript
/**
 * Comprehensive test suite for DNS monitor service.
 *
 * @remarks
 * Tests all aspects of the monitor service including error handling,
 * memory management, operation correlation, and edge cases following
 * current testing patterns and ADR requirements.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DnsMonitor } from "../../../src/services/monitoring/DnsMonitor";
import type { Monitor } from "../../../shared/types";

describe("DnsMonitor", () => {
 let monitor: DnsMonitor;
 let mockConfig: Monitor;

 beforeEach(() => {
  // Setup with proper cleanup tracking
  monitor = new DnsMonitor();
  mockConfig = {
   identifier: "test-dns",
   name: "Test DNS Monitor",
   type: "dns",
   hostname: "example.com",
   recordType: "A",
   checkInterval: 30000,
   retryAttempts: 3,
   timeout: 5000,
   enabled: true,
  };
 });

 afterEach(async () => {
  // Ensure proper cleanup after each test
  await monitor.shutdown();
 });

 describe("Constructor and Configuration", () => {
  it("should initialize with default configuration", () => {
   const newMonitor = new DnsMonitor();
   expect(newMonitor.getType()).toBe("dns");
  });

  it("should update configuration properly", () => {
   const newConfig = { timeout: 10000 };
   monitor.updateConfig(newConfig);
   // Configuration should be updated (test through behavior)
  });
 });

 describe("DNS Resolution Checks", () => {
  it("should return success result for valid DNS resolution", async () => {
   const result = await monitor.check(mockConfig);

   expect(result).toMatchObject({
    status: expect.stringMatching(/^(up|down)$/),
    responseTime: expect.any(Number),
    details: expect.any(String),
   });

   expect(result.responseTime).toBeGreaterThan(0);
   expect(result.details).toBeTruthy();
  });

  it("should handle DNS resolution failures with proper error details", async () => {
   const invalidConfig = {
    ...mockConfig,
    hostname: "nonexistent-domain-12345.invalid",
   };

   const result = await monitor.check(invalidConfig);

   expect(result.status).toBe("down");
   expect(result.details).toContain("failed");
   expect(result.error).toBeDefined();
  });

  it("should handle timeout scenarios with proper response time", async () => {
   const timeoutConfig = {
    ...mockConfig,
    timeout: 1, // Very short timeout
   };

   const result = await monitor.check(timeoutConfig);

   expect(result.responseTime).toBeGreaterThan(0);
   expect(result.details).toBeTruthy();
  });
 });

 describe("Error Handling and Edge Cases", () => {
  it("should reject invalid monitor types", async () => {
   const invalidConfig = {
    ...mockConfig,
    type: "http" as any,
   };

   await expect(monitor.check(invalidConfig)).rejects.toThrow(
    "DnsMonitor cannot handle monitor type: http"
   );
  });

  it("should handle network connectivity issues gracefully", async () => {
   // Test offline/network error scenarios
   const result = await monitor.check(mockConfig);

   // Should return a valid result even if network fails
   expect(result).toHaveProperty("status");
   expect(result).toHaveProperty("responseTime");
  });

  it("should properly clean up resources", async () => {
   // Start multiple operations
   const promises = [
    monitor.check(mockConfig),
    monitor.check(mockConfig),
    monitor.check(mockConfig),
   ];

   // Shutdown during operations
   await monitor.shutdown();

   // All operations should complete or be cancelled gracefully
   const results = await Promise.allSettled(promises);
   expect(results).toHaveLength(3);
  });
 });

 describe("Memory Management", () => {
  it("should track and cleanup active operations", async () => {
   // Test that operations are properly tracked and cleaned up
   const promise1 = monitor.check(mockConfig);
   const promise2 = monitor.check(mockConfig);

   await Promise.all([promise1, promise2]);

   // No memory leaks after operations complete
   expect(() => monitor.shutdown()).not.toThrow();
  });

  it("should handle concurrent operations without race conditions", async () => {
   // Test operation correlation prevents race conditions
   const promises = Array.from({ length: 10 }, () => monitor.check(mockConfig));

   const results = await Promise.all(promises);

   // All results should be valid and consistent
   results.forEach((result) => {
    expect(result).toHaveProperty("status");
    expect(result.responseTime).toBeGreaterThan(0);
   });
  });
 });

 describe("Integration with Enhanced Monitoring", () => {
  it("should integrate with error handling utilities", async () => {
   // Test that withErrorHandling is used correctly
   const result = await monitor.check(mockConfig);

   // Should work seamlessly with enhanced monitoring system
   expect(result).toBeDefined();
  });

  it("should support operation correlation", async () => {
   // Test that correlation IDs are generated and used
   const result = await monitor.check(mockConfig);

   // Operation should complete successfully with correlation
   expect(result.status).toMatch(/^(up|down)$/);
  });
 });

 describe("Validation and Type Safety", () => {
  it("should validate required fields", async () => {
   const incompleteConfig = {
    ...mockConfig,
    hostname: "", // Invalid empty hostname
   };

   const result = await monitor.check(incompleteConfig);

   // Should handle validation gracefully
   expect(result.status).toBe("down");
   expect(result.error).toBeDefined();
  });

  it("should enforce proper TypeScript types", () => {
   // Type checking tests (compile-time validation)
   expect(monitor.getType()).toBe("dns");
   expect(typeof monitor.check).toBe("function");
   expect(typeof monitor.updateConfig).toBe("function");
  });
 });
});
```

### **🔹 Integration Tests**

#### `electron/test/integration/DnsMonitorIntegration.test.ts`

```typescript
/**
 * Integration tests for DNS monitor with actual monitoring system.
 */

describe("DNS Monitor Integration", () => {
 it("should integrate with MonitorScheduler", async () => {
  // Test integration with the monitoring scheduler
 });

 it("should integrate with database repository", async () => {
  // Test that results are properly stored via repository pattern
 });

 it("should emit proper events via TypedEventBus", async () => {
  // Test event emission for monitoring events
 });
});
```

### **🔹 Performance and Memory Tests**

#### `electron/test/performance/DnsMonitorPerformance.test.ts`

```typescript
/**
 * Performance and memory tests for DNS monitor.
 */

describe("DNS Monitor Performance", () => {
 it("should handle high-frequency checks without memory leaks", async () => {
  // Test rapid successive checks for memory leaks
 });

 it("should cleanup resources properly under load", async () => {
  // Test resource cleanup under stress conditions
 });
});
```

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

## 📋 **8. Production Implementation Checklist**

### **🎯 Phase 1: Foundation and Architecture Compliance**

- [ ] **Step 1**: Add type to `BASE_MONITOR_TYPES` in `shared/types.ts` (CRITICAL FIRST STEP)
- [ ] **Step 2**: Create validation schema extending `baseMonitorSchema` in `shared/validation/schemas.ts` using centralized validation utilities
- [ ] **Step 3**: Add comprehensive TSDoc documentation following current standards
- [ ] **Step 4**: Verify ADR compliance (Repository Pattern, Event-Driven Architecture, Error Handling)

### **🔧 Phase 2: Production-Grade Implementation**

- [ ] **Step 5**: Create monitor service class implementing `IMonitorService` with comprehensive error handling
- [ ] **Step 6**: Implement operation correlation and race condition prevention
- [ ] **Step 7**: Add proper memory management and resource cleanup
- [ ] **Step 8**: Integrate with `withErrorHandling` utilities and correlation IDs
- [ ] **Step 9**: Register monitor type in `MonitorTypeRegistry.ts` with complete production configuration
- [ ] **Step 10**: Export monitor class in `electron/services/monitoring/index.ts`

### **🧪 Phase 3: Comprehensive Testing (Production Requirements)**

- [ ] Create comprehensive unit tests covering all scenarios and edge cases
- [ ] Test error handling, memory management, and operation correlation
- [ ] Add integration tests with monitoring system and database
- [ ] Implement performance tests for memory leaks and resource cleanup
- [ ] Test concurrent operations and race condition prevention
- [ ] Verify timeout and retry behavior using monitor-specific configuration
- [ ] Test validation schema with comprehensive edge cases
- [ ] Verify TypeScript type safety and compilation

### **✨ Phase 4: UI Integration Verification**

- [ ] Verify new monitor type appears in form dropdown with proper configuration
- [ ] Test dynamic form field generation from registry configuration
- [ ] Verify frontend validation works with proper error messages
- [ ] Test monitor CRUD operations through UI with error handling
- [ ] Verify title formatting, detail formatting, and help texts work correctly
- [ ] Test persistence and state management integration

### **📊 Phase 5: End-to-End Production Validation**

- [ ] Run complete test suite with full coverage (`npm run test:all`)
- [ ] Test type checking and compilation (`npm run type-check:all`)
- [ ] Run linting and code quality checks (`npm run lint:all:check`)
- [ ] Test in development environment with real network conditions
- [ ] Verify database schema adaptation and transaction safety
- [ ] Test actual monitoring with scheduler integration and event emission
- [ ] Verify monitoring handles error scenarios and recovery
- [ ] Test memory usage and resource cleanup under load
- [ ] Validate integration with enhanced monitoring system

### **🔍 Phase 6: Production Readiness**

- [ ] Code review with focus on ADR compliance and architectural patterns
- [ ] Performance testing with realistic load scenarios
- [ ] Security review of validation and error handling
- [ ] Documentation review and completeness check
- [ ] Integration testing with existing monitor types
- [ ] Production deployment readiness verification

---

## 🎯 **Production Quality Standards Summary**

### **📋 Critical Requirements Met:**

✅ **Repository Pattern (ADR-001)**: Database operations use dual-method pattern with transaction safety  
✅ **Event-Driven Architecture (ADR-002)**: TypedEventBus integration with correlation and cleanup  
✅ **Error Handling Strategy (ADR-003)**: Comprehensive error handling with operation correlation  
✅ **Memory Management**: Automatic cleanup, timeout management, and leak prevention  
✅ **Race Condition Prevention**: Operation correlation with unique IDs  
✅ **Type Safety**: Complete TypeScript interfaces with TSDoc documentation  
✅ **Testing Coverage**: Unit, integration, and performance tests  
✅ **Production Monitoring**: Full observability with logging and metrics

### **🏗️ Architecture Benefits Realized:**

- **Zero Legacy Dependencies**: Clean integration with enhanced monitoring only
- **Production Reliability**: Comprehensive error handling and recovery patterns
- **Memory Safety**: Automatic resource cleanup prevents leaks
- **Race Condition Immunity**: Operation correlation prevents state corruption
- **Developer Experience**: Type-safe APIs with comprehensive documentation
- **Maintainability**: Consistent patterns across all monitor types

---

## 🔍 **Monitor Type Field Configuration Reference**

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
import {
 getMonitorRetryAttempts,
 getMonitorTimeout,
} from "./utils/monitorTypeGuards";

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
  const timeout = getMonitorTimeout(
   monitor,
   this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
  );
  const retryAttempts = getMonitorRetryAttempts(
   monitor,
   DEFAULT_RETRY_ATTEMPTS
  );

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

## 📝 **Production-Ready Implementation Summary**

Adding a new monitor type to the Uptime Watcher application requires following our **enterprise-grade development process** with comprehensive quality assurance:

### **🏗️ Implementation Requirements:**

1. **6 phases of implementation** following ADR compliance and architectural patterns
2. **Production-grade monitor service class** implementing `IMonitorService` with operation correlation
3. **Comprehensive testing suite** covering unit, integration, and performance scenarios
4. **Memory-safe validation** extending `baseMonitorSchema` with centralized utilities
5. **Complete documentation** following current TSDoc standards

### **⚠️ Production-Critical Requirements:**

- **ADR Compliance**: Must follow Repository Pattern, Event-Driven Architecture, and Error Handling Strategy
- **Memory Management**: Automatic resource cleanup, timeout management, and leak prevention
- **Race Condition Prevention**: Operation correlation with unique IDs for monitoring state integrity
- **Type Safety**: Complete TypeScript interfaces with comprehensive error handling
- **Production Monitoring**: Integration with enhanced monitoring system and event emission

### **🎯 Quality Assurance Standards:**

The enhanced monitoring system architecture provides:

- ✅ **Production Reliability**: Comprehensive error handling with correlation tracking
- ✅ **Memory Safety**: Automatic cleanup prevents resource leaks in long-running operations
- ✅ **Race Condition Immunity**: Operation correlation prevents monitoring state corruption
- ✅ **Enterprise Integration**: TypedEventBus, repository pattern, and standardized IPC
- ✅ **Developer Experience**: Type-safe APIs with extensive documentation and testing
- ✅ **Maintainability**: Consistent patterns across all monitor types with automatic integration

### **🚀 Framework Benefits:**

This production-ready architecture allows you to focus on implementing core monitoring logic while the framework automatically handles:

- **Dynamic form generation** from registry configuration with validation
- **Database integration** through repository pattern with transaction safety
- **UI integration** with automatic field generation and validation
- **Event system integration** with correlation tracking and middleware
- **Error handling** with comprehensive recovery and logging patterns
- **Memory management** with automatic resource cleanup and leak prevention

### **📌 Enterprise Standards:**

All monitor types must support the standardized monitoring fields (`checkInterval`, `retryAttempts`, `timeout`) which are enforced by the scheduler and validated through our centralized validation system. This ensures consistency, reliability, and maintainability across the entire monitoring ecosystem.

**The result is a production-ready monitoring system with enterprise-grade quality, comprehensive testing, and architectural excellence that scales reliably under load while maintaining code quality and developer productivity.**

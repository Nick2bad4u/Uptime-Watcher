<!-- markdownlint-disable -->
/** eslint-disable markdown/no-missing-link-fragments */
# **🚀 Moni## Table of Contents

1. [Quick Start Example](#1-quick-start-example)
2. [Architecture Overview](#2-architecture-overview)
3. [Step-by-Step Implementation](#3-step-by-step-implementation)
4. [Complete Working Example](#4-complete-working-example)
5. [Advanced Configuration](#5-advanced-configuration)
6. [Testing Your Implementation](#6-testing-your-implementation)
7. [Troubleshooting](#7-troubleshooting)Implementation Guide**

## **Complete Guide: Adding New Monitor Types to Uptime Watcher**

This guide demonstrates how to add a new monitor type to the Uptime Watcher application. Thanks to the dynamic monitor type system, adding a new type requires only:

- **1 New File**: The monitor service implementation
- **1 Edit**: Registering the new type in the registry

---

## **📚 Table of Contents**

1. [Quick Start Example](#quick-start-example)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Complete Working Example](#complete-working-example)
5. [Advanced Configuration](#advanced-configuration)
6. [Testing Your Implementation](#testing-your-implementation)
7. [Troubleshooting](#troubleshooting)

---

## **🎯 Quick Start Example**

Let's add a **DNS Monitor** that checks domain resolution:

### **Step 1: Create the Monitor Service**

Create: `electron/services/monitoring/DnsMonitor.ts`

```typescript
/**
 * DNS Monitor - Checks domain name resolution
 */

import * as dns from "dns";
import { promisify } from "util";

import type { IMonitorService, MonitorResult } from "./types";

const dnsResolve = promisify(dns.resolve);

export class DnsMonitor implements IMonitorService {
    /**
     * Check DNS resolution for a domain
     */
    async check(config: { domain: string; type: "dns" }): Promise<MonitorResult> {
        const startTime = Date.now();

        try {
            // Resolve the domain to IP addresses
            const addresses = await dnsResolve(config.domain);
            const responseTime = Date.now() - startTime;

            return {
                status: "up",
                responseTime,
                details: `Resolved to ${addresses.length} address(es)`,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Unknown DNS error";

            return {
                status: "down",
                responseTime,
                details: errorMessage,
                timestamp: new Date().toISOString(),
            };
        }
    }
}
```

### **Step 2: Register the Monitor Type**

Edit: `electron/services/monitoring/MonitorTypeRegistry.ts`

Add this registration at the bottom of the file:

```typescript
// Register DNS monitor type
registerMonitorType({
    type: "dns",
    displayName: "DNS (Domain Resolution)",
    description: "Monitors domain name resolution to ensure DNS is working",
    version: "1.0.0",
    validationSchema: z.object({
        domain: z.string().min(1, "Domain is required").regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be a valid domain"),
        type: z.literal("dns"),
    }),
    serviceFactory: () => new DnsMonitor(),
    fields: [
        {
            name: "domain",
            label: "Domain Name",
            type: "text",
            required: true,
            placeholder: "example.com",
            helpText: "Enter the domain name to monitor (without http://)",
        },
    ],
    uiConfig: {
        formatDetail: (details: string) => `DNS: ${details}`,
        supportsResponseTime: true,
        supportsAdvancedAnalytics: true,
        helpTexts: {
            primary: "Enter the domain name to monitor (without http://)",
            secondary: "The monitor will check if the domain resolves to IP addresses",
        },
        display: {
            showUrl: false,
            showAdvancedMetrics: true,
        },
        detailFormats: {
            historyDetail: (details: string) => `DNS: ${details}`,
            analyticsLabel: "DNS Response Time",
        },
    },
});
```

Don't forget to add the import at the top:

```typescript
import { DnsMonitor } from "./DnsMonitor";
```

**That's it!** 🎉 Your new DNS monitor type is now fully integrated.

---

## **🏗️ Architecture Overview**

The dynamic monitor type system consists of several key components:

### **Backend Components**

- **Monitor Services** (`electron/services/monitoring/*Monitor.ts`): Implement the actual monitoring logic
- **Monitor Registry** (`MonitorTypeRegistry.ts`): Central registry for all monitor types
- **Monitor Factory** (`MonitorFactory.ts`): Creates monitor instances dynamically
- **Dynamic Schema** (`dynamicSchema.ts`): Generates database schemas automatically
- **Monitor Mapper** (`monitorMapper.ts`): Maps monitor data to/from database format

### **Frontend Components**

- **Dynamic Fields** (`DynamicMonitorFields.tsx`): Auto-generates form fields
- **Dynamic UI** (`dynamic-monitor-ui.ts`): Provides conditional rendering utilities
- **Type Helper** (`monitorTypeHelper.ts`): Frontend access to monitor configurations

### **Data Flow**

1. **Registration**: Monitor types are registered in the registry with their configuration
2. **Schema Generation**: Database schema is generated automatically from registered types
3. **Form Generation**: Frontend forms are generated dynamically from field definitions
4. **Validation**: Both frontend and backend use the same Zod schemas
5. **Factory Creation**: Monitor instances are created dynamically when needed
6. **Data Mapping**: Monitor data is mapped to/from database automatically

---

## **📋 Step-by-Step Implementation**

### **Step 1: Design Your Monitor**

Before implementation, answer these questions:

1. **What will it monitor?** (e.g., DNS resolution, database connectivity, API endpoints)
2. **What input fields are needed?** (e.g., domain, host, port, API key)
3. **What does "up" vs "down" mean?** (e.g., successful resolution vs failure)
4. **What details should be logged?** (e.g., IP addresses, response data, error messages)

### **Step 2: Create the Monitor Service**

Create a new file: `electron/services/monitoring/YourMonitor.ts`

**Template:**

```typescript
/**
 * [Monitor Name] - [Brief description]
 */

import type { IMonitorService, MonitorResult } from "./types";

export class YourMonitor implements IMonitorService {
    /**
     * Check [what you're monitoring]
     */
    async check(config: { 
        // Define your input fields here
        field1: string; 
        field2?: number; 
        type: "your-type" 
    }): Promise<MonitorResult> {
        const startTime = Date.now();

        try {
            // Your monitoring logic here
            // Example: Connect to service, make request, etc.
            const result = await yourMonitoringLogic(config);
            const responseTime = Date.now() - startTime;

            return {
                status: "up",
                responseTime,
                details: "Success message or data",
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            return {
                status: "down",
                responseTime,
                details: errorMessage,
                timestamp: new Date().toISOString(),
            };
        }
    }

    // Helper methods can go here
    private async yourMonitoringLogic(config: any): Promise<any> {
        // Implementation details
    }
}
```

**Key Requirements:**

- ✅ Must implement `IMonitorService` interface
- ✅ Must have an async `check()` method
- ✅ Must return `MonitorResult` with status, responseTime, details, timestamp
- ✅ Must handle errors gracefully
- ✅ Should measure responseTime accurately

### **Step 3: Design Your Form Fields**

Plan the form fields users will fill out:

```typescript
const fields = [
    {
        name: "fieldName",          // Must match your config interface
        label: "Display Label",     // What users see
        type: "text" | "number" | "url",  // Input type
        required: true | false,     // Is field required?
        placeholder: "example",     // Placeholder text
        helpText: "Help message",   // Additional guidance
        min: 1,                     // For number fields
        max: 100,                   // For number fields
    },
];
```

### **Step 4: Create Validation Schema**

Use Zod to define validation:

```typescript
const validationSchema = z.object({
    fieldName: z.string().min(1, "Field is required"),
    optionalField: z.number().min(1).max(100).optional(),
    type: z.literal("your-type"),
});
```

**Common Validation Patterns:**

```typescript
// Required text field
field: z.string().min(1, "Field is required"),

// Domain validation
domain: z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be a valid domain"),

// URL validation  
url: z.string().url("Must be a valid URL"),

// Port number validation
port: z.number().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535"),

// Host validation (IP or domain)
host: z.string().min(1, "Host is required"),

// Optional field with default
timeout: z.number().min(1000).max(60000).default(10000),
```

### **Step 5: Configure UI Behavior**

Define how your monitor appears in the UI:

```typescript
const uiConfig = {
    // Format detail labels in history/analytics
    formatDetail: (details: string) => `Your Type: ${details}`,
    
    // Enable/disable analytics features
    supportsResponseTime: true,
    supportsAdvancedAnalytics: true,
    
    // Help text for form
    helpTexts: {
        primary: "Main instruction for users",
        secondary: "Additional guidance",
    },
    
    // Display preferences
    display: {
        showUrl: false,                 // Show URL field in displays?
        showAdvancedMetrics: true,      // Show advanced analytics?
    },
    
    // Format labels for different contexts
    detailFormats: {
        historyDetail: (details: string) => `Format for history: ${details}`,
        analyticsLabel: "Label for analytics charts",
    },
};
```

### **Step 6: Register Your Monitor Type**

Add the registration to `MonitorTypeRegistry.ts`:

```typescript
// Import your monitor
import { YourMonitor } from "./YourMonitor";

// Register it
registerMonitorType({
    type: "your-type",                    // Unique identifier
    displayName: "Your Monitor Type",     // Display name
    description: "What it monitors",      // Description
    version: "1.0.0",                     // Version
    validationSchema: yourSchema,         // Zod schema
    serviceFactory: () => new YourMonitor(),  // Factory function
    fields: yourFields,                   // Form fields
    uiConfig: yourUiConfig,              // UI configuration
});
```

---

## **🎨 Complete Working Example: ICMP Ping Monitor**

Let's implement a complete ICMP ping monitor:

### **File 1: `electron/services/monitoring/PingMonitor.ts`**

```typescript
/**
 * ICMP Ping Monitor - Tests network connectivity using ping
 */

import { exec } from "child_process";
import { promisify } from "util";

import type { IMonitorService, MonitorResult } from "./types";

const execAsync = promisify(exec);

export class PingMonitor implements IMonitorService {
    /**
     * Ping a host to test network connectivity
     */
    async check(config: { 
        host: string; 
        count?: number; 
        timeout?: number; 
        type: "ping" 
    }): Promise<MonitorResult> {
        const startTime = Date.now();
        const count = config.count || 4;
        const timeout = config.timeout || 5000;

        try {
            // Build ping command (Windows/Linux compatible)
            const isWindows = process.platform === "win32";
            const command = isWindows
                ? `ping -n ${count} -w ${timeout} ${config.host}`
                : `ping -c ${count} -W ${Math.ceil(timeout / 1000)} ${config.host}`;

            const { stdout, stderr } = await execAsync(command);
            const responseTime = Date.now() - startTime;

            // Parse ping results
            const stats = this.parsePingOutput(stdout, isWindows);
            
            if (stats.packetsReceived > 0) {
                return {
                    status: "up",
                    responseTime: stats.avgTime || responseTime,
                    details: `${stats.packetsReceived}/${stats.packetsSent} packets received, avg: ${stats.avgTime}ms`,
                    timestamp: new Date().toISOString(),
                };
            } else {
                return {
                    status: "down",
                    responseTime,
                    details: "All packets lost",
                    timestamp: new Date().toISOString(),
                };
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : "Ping failed";

            return {
                status: "down",
                responseTime,
                details: errorMessage,
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Parse ping command output to extract statistics
     */
    private parsePingOutput(output: string, isWindows: boolean): {
        packetsSent: number;
        packetsReceived: number;
        avgTime?: number;
    } {
        try {
            if (isWindows) {
                // Windows ping output parsing
                const sentMatch = output.match(/Packets: Sent = (\d+)/);
                const receivedMatch = output.match(/Received = (\d+)/);
                const timeMatch = output.match(/Average = (\d+)ms/);

                return {
                    packetsSent: sentMatch ? parseInt(sentMatch[1], 10) : 0,
                    packetsReceived: receivedMatch ? parseInt(receivedMatch[1], 10) : 0,
                    avgTime: timeMatch ? parseInt(timeMatch[1], 10) : undefined,
                };
            } else {
                // Linux/Unix ping output parsing
                const statsMatch = output.match(/(\d+) packets transmitted, (\d+) received/);
                const timeMatch = output.match(/= ([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+) ms/);

                return {
                    packetsSent: statsMatch ? parseInt(statsMatch[1], 10) : 0,
                    packetsReceived: statsMatch ? parseInt(statsMatch[2], 10) : 0,
                    avgTime: timeMatch ? parseFloat(timeMatch[2]) : undefined,
                };
            }
        } catch (error) {
            return {
                packetsSent: 0,
                packetsReceived: 0,
            };
        }
    }
}
```

### **File 2: Registration in `MonitorTypeRegistry.ts`**

Add the import:

```typescript
import { PingMonitor } from "./PingMonitor";
```

Add the registration:

```typescript
// Register ICMP Ping monitor type
registerMonitorType({
    type: "ping",
    displayName: "ICMP Ping",
    description: "Tests network connectivity using ICMP ping packets",
    version: "1.0.0",
    validationSchema: z.object({
        host: z.string().min(1, "Host is required"),
        count: z.number().min(1).max(10).default(4).optional(),
        timeout: z.number().min(1000).max(30000).default(5000).optional(),
        type: z.literal("ping"),
    }),
    serviceFactory: () => new PingMonitor(),
    fields: [
        {
            name: "host",
            label: "Host",
            type: "text",
            required: true,
            placeholder: "example.com or 192.168.1.1",
            helpText: "Enter hostname or IP address to ping",
        },
        {
            name: "count",
            label: "Packet Count",
            type: "number",
            required: false,
            placeholder: "4",
            helpText: "Number of ping packets to send (1-10)",
            min: 1,
            max: 10,
        },
        {
            name: "timeout",
            label: "Timeout (ms)",
            type: "number",
            required: false,
            placeholder: "5000",
            helpText: "Timeout for each ping packet in milliseconds",
            min: 1000,
            max: 30000,
        },
    ],
    uiConfig: {
        formatDetail: (details: string) => `Ping: ${details}`,
        supportsResponseTime: true,
        supportsAdvancedAnalytics: true,
        helpTexts: {
            primary: "Enter hostname or IP address to ping",
            secondary: "Network connectivity will be tested using ICMP ping packets",
        },
        display: {
            showUrl: false,
            showAdvancedMetrics: true,
        },
        detailFormats: {
            historyDetail: (details: string) => `Ping: ${details}`,
            analyticsLabel: "Ping Response Time",
        },
    },
});
```

**That's it!** 🎉 Your new ping monitor type is now fully integrated.

---

## **⚙️ Advanced Configuration**

### **Custom Data Types**

For complex monitor data, you can use custom types:

```typescript
interface DatabaseConnectionConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    connectionTimeout: number;
    type: "database";
}

// In your monitor
async check(config: DatabaseConnectionConfig): Promise<MonitorResult> {
    // Implementation
}
```

### **Environment-Specific Configuration**

```typescript
export class ApiMonitor implements IMonitorService {
    async check(config: { 
        endpoint: string; 
        apiKey?: string; 
        environment?: "production" | "staging" | "development";
        type: "api" 
    }): Promise<MonitorResult> {
        // Use different behavior based on environment
        const headers: Record<string, string> = {};
        
        if (config.apiKey) {
            headers.Authorization = `Bearer ${config.apiKey}`;
        }

        if (config.environment === "development") {
            // Skip SSL verification in development
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        // Implementation continues...
    }
}
```

### **Complex Field Types**

```typescript
// Example: Fields with conditional visibility
fields: [
    {
        name: "authType",
        label: "Authentication Type", 
        type: "select",
        required: true,
        options: [
            { value: "none", label: "No Authentication" },
            { value: "basic", label: "Basic Auth" },
            { value: "bearer", label: "Bearer Token" },
        ],
    },
    {
        name: "username",
        label: "Username",
        type: "text",
        required: true,
        showWhen: { authType: "basic" },  // Conditional field
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        showWhen: { authType: "basic" },
    },
    {
        name: "token",
        label: "Bearer Token",
        type: "text",
        required: true,
        showWhen: { authType: "bearer" },
    },
],
```

### **Custom Validation**

```typescript
// Advanced validation with custom rules
validationSchema: z.object({
    endpoint: z.string().url("Must be a valid URL"),
    method: z.enum(["GET", "POST", "PUT", "DELETE"]),
    expectedStatus: z.number().min(100).max(599).default(200),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    type: z.literal("api"),
}).refine((data) => {
    // Custom validation: If method is POST/PUT, body should be provided
    if (["POST", "PUT"].includes(data.method) && !data.body) {
        return false;
    }
    return true;
}, {
    message: "POST and PUT requests should have a body",
    path: ["body"],
}),
```

---

## **🧪 Testing Your Implementation**

### **Step 1: Unit Tests**

Create: `electron/test/services/monitoring/YourMonitor.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { YourMonitor } from "../../../services/monitoring/YourMonitor";

describe("YourMonitor", () => {
    let monitor: YourMonitor;

    beforeEach(() => {
        monitor = new YourMonitor();
    });

    describe("check", () => {
        it("should return up status for successful check", async () => {
            const config = {
                field1: "test-value",
                type: "your-type" as const,
            };

            const result = await monitor.check(config);

            expect(result.status).toBe("up");
            expect(result.responseTime).toBeGreaterThan(0);
            expect(result.details).toBeDefined();
            expect(result.timestamp).toBeDefined();
        });

        it("should return down status for failed check", async () => {
            const config = {
                field1: "invalid-value",
                type: "your-type" as const,
            };

            const result = await monitor.check(config);

            expect(result.status).toBe("down");
            expect(result.responseTime).toBeGreaterThan(0);
            expect(result.details).toContain("error");
        });

        it("should handle errors gracefully", async () => {
            // Mock a function to throw an error
            vi.spyOn(someModule, "someFunction").mockRejectedValue(new Error("Test error"));

            const config = {
                field1: "test-value",
                type: "your-type" as const,
            };

            const result = await monitor.check(config);

            expect(result.status).toBe("down");
            expect(result.details).toContain("Test error");
        });
    });
});
```

### **Step 2: Integration Tests**

```typescript
describe("YourMonitor Integration", () => {
    it("should be registered in monitor registry", () => {
        const config = getMonitorTypeConfig("your-type");
        expect(config).toBeDefined();
        expect(config.displayName).toBe("Your Monitor Type");
    });

    it("should create monitor instance via factory", () => {
        const factory = getMonitorServiceFactory("your-type");
        expect(factory).toBeDefined();
        
        const monitor = factory();
        expect(monitor).toBeInstanceOf(YourMonitor);
    });

    it("should validate configuration correctly", () => {
        const validConfig = {
            field1: "valid-value",
            type: "your-type",
        };

        const result = validateMonitorData("your-type", validConfig);
        expect(result.success).toBe(true);
    });
});
```

### **Step 3: End-to-End Testing**

1. **Build the application**: `npm run build`
2. **Start the application**: `npm run electron`
3. **Test the UI**:
   - Go to "Add Site" form
   - Select your new monitor type
   - Verify form fields appear correctly
   - Test form validation
   - Create a site with your monitor
   - Verify monitoring works

### **Step 4: Manual Testing Checklist**

- ✅ Monitor type appears in dropdown
- ✅ Form fields render correctly
- ✅ Validation works (required fields, format validation)
- ✅ Help text displays properly
- ✅ Monitor can be created successfully
- ✅ Monitoring starts automatically
- ✅ Status updates appear in real-time
- ✅ History records are saved
- ✅ Analytics work (if enabled)
- ✅ Settings tab shows correct information
- ✅ Monitor can be edited/deleted

---

## **🔧 Troubleshooting**

### **Common Issues & Solutions**

#### **Issue: Monitor type doesn't appear in dropdown**

**Causes:**
- Monitor not registered in `MonitorTypeRegistry.ts`
- Import statement missing
- Registration has syntax errors

**Solution:**
```typescript
// Check import
import { YourMonitor } from "./YourMonitor";

// Check registration
registerMonitorType({
    type: "your-type",  // Make sure this is unique
    // ... rest of config
});
```

#### **Issue: Form fields don't appear**

**Causes:**
- Field definitions incorrect
- Field names don't match validation schema
- Type errors in field configuration

**Solution:**
```typescript
// Ensure fields match validation schema
validationSchema: z.object({
    fieldName: z.string(),  // Must match field.name
}),
fields: [
    {
        name: "fieldName",  // Must match schema property
        label: "Field Label",
        type: "text",       // Must be valid type
        required: true,
    },
],
```

#### **Issue: Validation errors**

**Causes:**
- Zod schema validation fails
- Field types don't match schema
- Required fields missing

**Solution:**
```typescript
// Debug validation
const result = validateMonitorData("your-type", yourData);
if (!result.success) {
    console.log("Validation errors:", result.errors);
}

// Common fixes:
// 1. Ensure all required fields are present
// 2. Check data types (string vs number)
// 3. Verify field names match exactly
```

#### **Issue: Monitor check fails**

**Causes:**
- Network issues
- Invalid configuration
- Missing dependencies
- Async/await errors

**Solution:**
```typescript
// Add proper error handling
async check(config: YourConfig): Promise<MonitorResult> {
    try {
        // Your logic here
        return { status: "up", /* ... */ };
    } catch (error) {
        console.error("Monitor check failed:", error);
        return {
            status: "down",
            responseTime: Date.now() - startTime,
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        };
    }
}
```

---

## **🎉 Conclusion**

You now have everything needed to add new monitor types to Uptime Watcher! The dynamic system means:

- **Fast Development**: Only 1-2 files to touch
- **Automatic Integration**: Forms, validation, analytics all work automatically  
- **Type Safety**: Full TypeScript support throughout
- **Extensible**: Easy to add complex monitors with custom UI behavior

### **Next Steps**

1. Try the DNS example above
2. Create your own monitor type
3. Explore advanced configuration options
4. Add comprehensive tests
5. Share your monitor types with the community!

### **Resources**

- **Monitor Interface**: `electron/services/monitoring/types.ts`
- **Existing Examples**: `HttpMonitor.ts`, `PortMonitor.ts`
- **Registry Documentation**: `MonitorTypeRegistry.ts`
- **UI Components**: `src/components/dynamic-monitor-ui.tsx`

Happy monitoring! 🚀

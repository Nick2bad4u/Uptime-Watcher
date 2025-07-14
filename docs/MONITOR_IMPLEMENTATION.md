# Monitor Type Implementation Guide

This guide shows how to implement a new monitor type in the Uptime Watcher application.

## Overview

To add a new monitor type, you need to:

1. Create a monitor service class in `electron/services/monitoring/`
2. Register it in `electron/services/monitoring/MonitorTypeRegistry.ts`
3. Define form fields in `src/utils/dynamic-monitor-ui/config/`

## Example: DNS Monitor

### Step 1: Create Monitor Service

Create `electron/services/monitoring/DnsMonitor.ts`:

```typescript
import { DNS_TIMEOUT } from "../../constants";
import { logger } from "../../utils";
import type { IMonitorService, MonitorCheckResult, MonitorConfig } from "./types";

export class DnsMonitor implements IMonitorService {
    async check(config: MonitorConfig): Promise<MonitorCheckResult> {
        const { target, timeout = DNS_TIMEOUT } = config;
        const startTime = Date.now();
        
        try {
            if (!target) {
                throw new Error("DNS target is required");
            }

            const dns = await import("dns/promises");
            await Promise.race([
                dns.resolve(target),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("DNS timeout")), timeout)
                )
            ]);
            
            return {
                success: true,
                responseTime: Date.now() - startTime,
                details: `DNS resolution successful for ${target}`
            };
        } catch (error) {
            return {
                success: false,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : "DNS resolution failed"
            };
        }
    }
}
```

### Step 2: Register Monitor

Add to `electron/services/monitoring/MonitorTypeRegistry.ts`:

```typescript
import { DnsMonitor } from "./DnsMonitor";

export const MONITOR_REGISTRY = {
    http: new HttpMonitor(),
    port: new PortMonitor(),
    dns: new DnsMonitor(), // Add this line
} as const;
```

### Step 3: Define Form Fields

Create `src/utils/dynamic-monitor-ui/config/dnsFields.ts`:

```typescript
import { z } from "zod";
import type { MonitorFieldConfig } from "../types";

export const dnsFieldsConfig: MonitorFieldConfig[] = [
    {
        name: "target",
        type: "text",
        label: "DNS Target",
        placeholder: "example.com",
        required: true,
        validation: z.string().min(1, "DNS target is required"),
    },
];
```

Register in `src/utils/dynamic-monitor-ui/config/index.ts`:

```typescript
import { dnsFieldsConfig } from "./dnsFields";

export const MONITOR_FIELD_CONFIGS = {
    http: httpFieldsConfig,
    port: portFieldsConfig,
    dns: dnsFieldsConfig, // Add this line
} as const;
```

## Summary

Your new monitor type is now fully integrated and will appear in the UI automatically.

# Uptime Monitoring System — Implementation Guide

## 2025-09 Update — SSL Certificate Monitor Implementation

The guide now reflects the latest end-to-end monitor that was added to the platform: the **SSL Certificate monitor (`ssl`)**. This implementation provides a production-ready example of wiring a new monitor type through every layer of the stack.

### Scope Covered by the SSL Implementation

- **Shared layer**
  - `shared/types.ts` — Added `"ssl"` to `BASE_MONITOR_TYPES` and introduced the `certificateWarningDays` field on the `Monitor` type.
  - `shared/types/monitorConfig.ts` — Created `SslMonitorConfig`, updated monitor config defaults, and supplied a new type guard.
  - `shared/types/schemaTypes.ts` & `shared/validation/schemas.ts` — Added `sslMonitorSchema` with strict Zod validation for host, port, and warning thresholds, and extended the discriminated unions.
  - `shared/utils/validation.ts` — Introduced SSL-specific field validation with precise error messaging.

- **Electron/backend layer**
  - `electron/services/monitoring/SslMonitor.ts` — New monitor service that performs a TLS handshake, evaluates certificate validity/expiry, applies retry policies, and returns rich status details.
  - `electron/services/monitoring/MonitorTypeRegistry.ts` — Registered the `ssl` monitor with form metadata, UI helpers, and version tracking.
  - `electron/services/monitoring/EnhancedMonitorChecker.ts` — Routed `ssl` monitors to the new service.
  - Tests: `electron/test/services/monitoring/SslMonitor.test.ts` exercises success, degradation, expiry, handshake failure, and authorization error paths.

- **Frontend layer**
  - `src/components/SiteDetails/useAddSiteForm.ts` and `src/components/AddSiteForm/AddSiteForm.tsx` — Added state management, defaults, and form wiring for `certificateWarningDays`.
  - `src/types/monitorFormData.ts` & `src/types/monitor-forms.ts` — Extended form data unions and defaults for SSL monitors.
  - `src/utils/monitorValidation.ts` & `src/stores/sites/utils/monitorOperations.ts` — Added normalization and validation logic for the new field.
  - UI polish: `MonitorSelector` and fallback helpers now surface SSL-friendly labels.
  - Tests: `src/test/hooks/useAddSiteForm.comprehensive.test.ts` covers the new form state, ensuring the warning threshold participates in resets and validation.

- **Documentation & developer ergonomics**
  - This guide now references the SSL implementation as the canonical example for future monitor types.

### Key Implementation Notes

1. **Certificate evaluation**: The backend clamps `certificateWarningDays` to 1–365 and classifies results as `up`, `degraded`, or `down` based on expiry proximity.
2. **Retry & timeout integration**: `SslMonitor` participates in the enhanced monitoring retry system, respecting global defaults and per-monitor overrides.
3. **Dynamic UI**: Because the registry metadata includes the new field, the renderer dynamically renders inputs without bespoke React components.
4. **Testing strategy**: Unit tests mock TLS sockets to simulate authorization failures, expiry, and handshake errors without needing real certificates.
5. **Existing guidance alignment**: The original six-phase process (foundation → core implementation → system integration → QA → UI → production validation) still holds. The SSL work follows each phase with concrete artifacts listed above.

> **Tip:** Use the SSL monitor changeset as the definitive reference when introducing additional monitor types. It demonstrates how to propagate new configuration fields, validation rules, backend services, UI wiring, and automated tests in a consistent, type-safe manner.

---

## Table of Contents

- [Uptime Monitoring System — Implementation Guide](#uptime-monitoring-system--implementation-guide)
  - [2025-09 Update — SSL Certificate Monitor Implementation](#2025-09-update--ssl-certificate-monitor-implementation)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [System Architecture Overview](#system-architecture-overview)
  - [Package Structure](#package-structure)
  - [Key Concepts](#key-concepts)
  - [Type Definitions](#type-definitions)
  - [Monitor Type Registry](#monitor-type-registry)
  - [Service Implementation](#service-implementation)
  - [Configuration Management](#configuration-management)
  - [Data Persistence](#data-persistence)
  - [Monitoring and Logging](#monitoring-and-logging)
  - [Testing Strategy](#testing-strategy)
  - [Deployment Checklist](#deployment-checklist)
  - [References](#references)

---

## Introduction

This document provides a comprehensive guide for implementing new monitor types in the Uptime Monitoring System. It covers the entire process from defining types and validation schemas to implementing backend services and frontend integration.

The guide is structured around the recent addition of the SSL Certificate monitor, which serves as a detailed example of a complete monitor implementation.

---

<a id="system-architecture-overview"></a>

## System Architecture Overview

The Uptime Monitoring System is built on a modular architecture that separates concerns across different layers:

- **Shared Layer**: Contains common types, validation schemas, and utility functions used across the application.
- **Electron/Backend Layer**: Implements the monitoring services, handles data persistence, and manages application logic.
- **Frontend Layer**: Provides the user interface components and hooks for interacting with the monitoring system.

---

<a id="package-structure"></a>

## Package Structure

The project is organized into several packages, each responsible for a specific part of the system:

- `shared`: Contains shared types, validation schemas, and utility functions.
- `electron`: Implements the backend services, including monitoring services and data persistence.
- `src`: Contains the frontend application code, including components, hooks, and types.

---

<a id="key-concepts"></a>

## Key Concepts

- **Monitor Types**: Different types of monitors (e.g., HTTP, TCP, DNS, SSL) that check the availability and performance of resources.
- **Validation Schemas**: Zod schemas that define the structure and constraints of monitor configurations.
- **Service Implementation**: Classes that implement the monitoring logic for each monitor type.
- **Configuration Management**: Mechanism to manage and validate monitor configuration settings.
- **Data Persistence**: Storage and retrieval of monitor data, including status history and configuration.
- **Monitoring and Logging**: Tools and practices for monitoring application performance and logging events.
- **Testing Strategy**: Approach to testing the implementation, including unit tests, integration tests, and end-to-end tests.

---

<a id="type-definitions"></a>

## Type Definitions

Type definitions are located in the `shared/types.ts` file. They define the structure of monitor objects and other related data types.

### Monitor Type

The `Monitor` type represents a single monitor configuration:

```typescript
export type Monitor = {
 id: string;
 type: MonitorType;
 checkInterval: number;
 retryAttempts: number;
 timeout: number;
 monitoring: boolean;
 status: MonitorStatus;
 responseTime: number;
 history: StatusHistory[];
 lastChecked?: Date;
 activeOperations?: string[];
 [key: string]: any; // Allow additional fields for specific monitor types
};
```

### Monitor Type Registry Definition

The monitor type registry maps monitor type strings to their corresponding service implementations and validation schemas.

```typescript
export type MonitorTypeRegistryEntry = {
 type: MonitorType;
 serviceFactory: () => IMonitorService;
 validationSchema: z.ZodSchema;
};
```

---

<a id="monitor-type-registry"></a>

## Monitor Type Registry

The monitor type registry maps monitor type strings to their corresponding service implementations and validation schemas. It allows the system to dynamically resolve and instantiate the correct service for each monitor type.

### Registering a New Monitor Type

To register a new monitor type, call the `registerMonitorType` function with a configuration object:

```typescript
registerMonitorType({
 type: "ssl",
 serviceFactory: () => new SslMonitor(),
 validationSchema: sslMonitorSchema,
});
```

### Monitor Type Configuration

The configuration object for each monitor type should include:

- `type`: The monitor type string (e.g., `"ssl"`).
- `serviceFactory`: A factory function that creates an instance of the monitor service.
- `validationSchema`: The Zod schema used to validate the monitor configuration.

---

<a id="service-implementation"></a>

## Service Implementation

Monitor services implement the `IMonitorService` interface and contain the logic for performing the actual monitoring checks.

### Implementing a New Monitor Service

To implement a new monitor service, create a class that implements the `IMonitorService` interface:

```typescript
export class SslMonitor implements IMonitorService {
 async check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult> {
  // Implement SSL monitoring logic
 }
}
```

### Service Methods

The service class must implement the following methods:

- `check(monitor: Site["monitors"][0]): Promise<MonitorCheckResult>`: Performs the monitoring check and returns the result.
- `updateConfig(config: Partial<MonitorConfig>): void`: Updates the service configuration.
- `getType(): Site["monitors"][0]["type"]`: Returns the monitor type.

---

## Configuration Management

Configuration management handles the validation and normalization of monitor configuration settings.

### Monitor Configuration Schema

Each monitor type should have a corresponding configuration schema that extends the base monitor schema:

```typescript
export const sslMonitorSchema = baseMonitorSchema.extend({
 type: z.literal("ssl"),
 hostname: hostValidationSchema,
 port: z.number().min(1).max(65535),
 certificateWarningDays: z.number().min(1).max(365),
});
```

### Normalizing Configuration

Configuration normalization ensures that configuration values are converted to their expected types and formats:

```typescript
export function normalizeMonitorConfig(config: any): MonitorConfig {
 return {
  ...config,
  timeout: Number(config.timeout) || DEFAULT_TIMEOUT,
  retryAttempts: Number(config.retryAttempts) || DEFAULT_RETRY_ATTEMPTS,
 };
}
```

---

## Data Persistence

Data persistence is handled by the database layer, which stores and retrieves monitor data using a repository pattern.

### Monitor Repository

The monitor repository provides methods for saving, updating, and querying monitor data:

```typescript
export class MonitorRepository {
 async save(monitor: Monitor): Promise<void> {
  // Save monitor to database
 }

 async findById(id: string): Promise<Monitor | null> {
  // Find monitor by ID
 }
}
```

### Dynamic Schema Generation

The database layer uses dynamic schema generation to adapt to new monitor types automatically. When a new monitor type is registered, its schema is added to the database configuration, and the necessary tables and fields are created.

---

## Monitoring and Logging

The system uses monitoring and logging tools to track application performance and log important events.

### Application Monitoring

Application monitoring tracks the health and performance of the application. It can include metrics such as response times, error rates, and resource utilization.

### Logging

Logging records important events and errors in the application. Logs should include sufficient context to diagnose issues and understand system behavior.

---

## Testing Strategy

The testing strategy includes unit tests, integration tests, and end-to-end tests to ensure the correctness and reliability of the implementation.

### Unit Tests

Unit tests verify the behavior of individual functions and methods in isolation. They should cover all critical paths and edge cases.

### Integration Tests

Integration tests verify the interaction between different components and layers of the system. They ensure that the system works as a whole and that data flows correctly between components.

### End-to-End Tests

End-to-end tests verify the complete functionality of the system from the user's perspective. They simulate real user scenarios and ensure that the system behaves as expected.

---

## Deployment Checklist

Before deploying a new monitor type to production, ensure that the following steps are completed:

- [ ] Implement the monitor service class and validation schema.
- [ ] Register the monitor type in the monitor type registry.
- [ ] Implement unit tests, integration tests, and end-to-end tests.
- [ ] Update the documentation and guides.
- [ ] Verify that all tests pass and that the implementation meets the quality standards.

---

## References

- [Zod Documentation](https://zod.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Electron Documentation](https://www.electronjs.org/docs/latest)

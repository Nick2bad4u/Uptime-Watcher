# Uptime Watcher Consistency Guide

This document outlines the architectural patterns, conventions, and standards for maintaining consistency across the Uptime Watcher codebase.

## Table of Contents

- [Error Handling Standards](#error-handling-standards)
- [Logging Patterns](#logging-patterns)
- [Dependency Injection](#dependency-injection)
- [Code Documentation](#code-documentation)
- [Architectural Patterns](#architectural-patterns)
- [TypeScript Standards](#typescript-standards)
- [Testing Conventions](#testing-conventions)

## Error Handling Standards

### 1. Use withErrorHandling for All Service Operations

**Pattern**: All service methods that can fail should use the standardized `withErrorHandling()` utility.

```typescript
// ✅ Correct - Using withErrorHandling
import { withErrorHandling } from "@shared/utils/errorHandling";

public async migrateData(): Promise<void> {
    return withErrorHandling(async () => {
        // Implementation logic here
        await this.performMigration();
    }, "Failed to migrate data");
}

// ❌ Incorrect - Raw try-catch
public async migrateData(): Promise<void> {
    try {
        await this.performMigration();
    } catch (error) {
        // Manual error handling
    }
}
```

**Files Using This Pattern**:

- `electron/services/monitoring/MigrationSystem.ts`
- `electron/services/window/WindowService.ts`
- All service classes in `electron/services/`

### 2. Error Context and Correlation

Always provide meaningful error context and use correlation IDs for tracking:

```typescript
import { generateCorrelationId } from "@electron/utils/correlation";

const correlationId = generateCorrelationId();
return withErrorHandling(async () => {
 // Operations with correlation tracking
}, `Operation failed [${correlationId}]`);
```

## Logging Patterns

### 1. Use logger Instead of console

**Pattern**: Always use the structured logger from `@electron/utils/logger`.

```typescript
// ✅ Correct - Using logger
import { logger } from "@electron/utils/logger";

logger.info("Service started successfully");
logger.error("Failed to connect to database", { error: err.message });
logger.debug("Debug information", { data: someData });

// ❌ Incorrect - Using console
console.log("Service started");
console.error("Failed to connect");
```

### 2. Structured Logging

Use structured logging with context objects:

```typescript
// ✅ Structured logging with context
logger.info("Monitor check completed", {
 monitorId: monitor.id,
 status: result.status,
 responseTime: result.responseTime,
 timestamp: new Date().toISOString(),
});

// ❌ String concatenation
logger.info(`Monitor ${monitor.id} status: ${result.status}`);
```

### 3. Log Templates

Use log templates from `@shared/utils/logTemplates` for consistency:

```typescript
import {
 interpolateLogTemplate,
 LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

logger.debug(
 interpolateLogTemplate(LOG_TEMPLATES.debug.MONITOR_RESPONSE_TIME, {
  responseTime: result.responseTime,
  status: result.status,
  url: monitor.url,
 })
);
```

## Dependency Injection

### 1. Standardized Dependency Interfaces

**Pattern**: Services should use standardized dependency injection with clear interfaces.

```typescript
// ✅ Correct - Dependency interface pattern
interface NotificationServiceDependencies {
 config?: NotificationConfig;
 logger?: Logger;
}

export class NotificationService {
 private config: NotificationConfig;
 private logger: Logger;

 constructor(dependencies: NotificationServiceDependencies = {}) {
  this.config = dependencies.config ?? DEFAULT_NOTIFICATION_CONFIG;
  this.logger = dependencies.logger ?? logger;
 }
}

// ❌ Incorrect - Direct optional parameters
export class NotificationService {
 constructor(config?: NotificationConfig, logger?: Logger) {
  // Less clear dependency management
 }
}
```

### 2. Service Container Integration

Services should be properly integrated with the ServiceContainer:

```typescript
// In ServiceContainer.ts
public getNotificationService(): NotificationService {
    if (!this.notificationService) {
        this.notificationService = new NotificationService({
            config: this.getConfig().notifications,
            logger: this.getLogger()
        });
    }
    return this.notificationService;
}
```

### 3. Configuration Patterns

Monitor services should use config defaults appropriately:

```typescript
// ✅ Correct - Config with defaults
export class HttpMonitor implements IMonitorService {
 private config: MonitorConfig;

 constructor(config: MonitorConfig = {}) {
  this.config = {
   timeout: DEFAULT_REQUEST_TIMEOUT,
   userAgent: USER_AGENT,
   ...config,
  };
 }
}
```

## Code Documentation

### 1. JSDoc Standards

Use comprehensive TSDoc comments following the project standards:

````typescript
/**
 * Performs HTTP health check for monitoring endpoints.
 *
 * @remarks
 * Uses Axios with custom interceptors for timing and retry logic. All requests
 * support cancellation via AbortSignal.
 *
 * @example
 *
 * ```typescript
 * const result = await httpMonitor.check(monitor);
 * logger.info(`Check result: ${result.status}`);
 * ```
 *
 * @param monitor - Monitor configuration
 * @param signal - Optional cancellation signal
 *
 * @returns Promise resolving to check result
 *
 * @throws Error if monitor type is invalid
 */
````

### 2. Logger in Examples

**Always use logger in JSDoc examples**, never console:

````typescript
// ✅ Correct - JSDoc with logger
/**
 * @example
 *
 * ```typescript
 * const result = await service.performOperation();
 * logger.info(`Operation completed: ${result.status}`);
 * ```
 */

// ❌ Incorrect - JSDoc with console
/**
 * @example
 *
 * ```typescript
 * const result = await service.performOperation();
 * console.log(`Operation completed: ${result.status}`);
 * ```
 */
````

## Architectural Patterns

### 1. Repository Pattern

Database access should use the repository pattern:

```typescript
// ✅ Repository pattern
export class SiteRepository {
 async findById(id: string): Promise<Site | null> {
  return executeTransaction(async (db) => {
   // Database operations
  });
 }
}

// Service layer
export class SiteManager {
 constructor(private repository: SiteRepository) {}

 async getSite(id: string): Promise<Site> {
  return withErrorHandling(async () => {
   return await this.repository.findById(id);
  }, "Failed to get site");
 }
}
```

### 2. Event System

Use the TypedEventBus for inter-service communication:

```typescript
import { eventBus } from "@electron/events/EventBus";

// Publishing events
eventBus.publish("site:created", {
 siteIdentifier: site.id,
 timestamp: new Date().toISOString(),
});

// Subscribing to events
eventBus.subscribe("monitor:status-changed", (event) => {
 logger.info("Monitor status changed", { event });
});
```

### 3. Service Layer Separation

Maintain clear separation between services:

- **Data Layer**: Repositories and database utilities
- **Service Layer**: Business logic and orchestration
- **API Layer**: IPC handlers and external interfaces
- **UI Layer**: React components and state management

## TypeScript Standards

### 1. Strict Type Safety

- Never use `any` or `unknown` without explicit justification
- Use proper type guards and assertions
- Leverage TypeScript's strict configuration

```typescript
// ✅ Type-safe approach
function isValidMonitor(monitor: unknown): monitor is Site["monitors"][0] {
 return typeof monitor === "object" && monitor !== null && "type" in monitor;
}

// ❌ Type assertion without validation
const monitor = data as Site["monitors"][0];
```

### 2. Interface Design

Design interfaces for extensibility and clarity:

```typescript
// ✅ Clear, extensible interface
interface MonitorServiceDependencies {
    config?: MonitorConfig;
    logger?: Logger;
    httpClient?: AxiosInstance;
}

// ❌ Unclear parameter list
constructor(config?: MonitorConfig, logger?: Logger, client?: AxiosInstance)
```

### 3. Shared Contract Interfaces

- Canonical DTOs live in the `shared` package. Do **not** redeclare interfaces such as `MonitorTypeOption`; import them from `@shared/types/monitorTypes`.
- Favor re-exporting shared contracts from feature modules (e.g. `src/constants.ts`) instead of introducing renderer-only clones.
- When introducing a new shared interface, add it to `shared/types/*` and extend the ESLint guard (`config/linting/rules/shared-contract-interfaces.mjs`) so duplicates are caught automatically.
- Use the `@app` path alias whenever referencing renderer code from outside `src` (Storybook, benchmarks, tests, scripts). Relative deep imports such as `../../src/components/...` are disallowed by ESLint and should be rewritten to `@app/components/...`.

## Testing Conventions

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe("HttpMonitor", () => {
 it("should return success for valid HTTP response", async () => {
  // Arrange
  const monitor = createTestMonitor();
  const httpMonitor = new HttpMonitor();

  // Act
  const result = await httpMonitor.check(monitor);

  // Assert
  expect(result.status).toBe("up");
  expect(result.responseTime).toBeGreaterThan(0);
 });
});
```

### 2. Mock Consistency

Use consistent mocking patterns:

```typescript
// ✅ Consistent mocking
const mockLogger = {
 info: vi.fn(),
 error: vi.fn(),
 debug: vi.fn(),
 warn: vi.fn(),
};

// ❌ Inconsistent mocking
const mockLogger = vi.fn();
```

## Implementation Checklist

When implementing new features or modifying existing code, ensure:

- [ ] **Error Handling**: Uses `withErrorHandling()` for all operations that can fail
- [ ] **Logging**: Uses structured logger instead of console statements
- [ ] **Dependencies**: Follows dependency injection patterns with clear interfaces
- [ ] **Documentation**: Includes comprehensive TSDoc with logger examples
- [ ] **Type Safety**: Uses strict TypeScript without `any` or unsafe assertions
- [ ] **Testing**: Includes proper test coverage with consistent mocking
- [ ] **Architecture**: Follows established patterns (repository, service layer, etc.)
- [ ] **Events**: Uses TypedEventBus for inter-service communication
- [ ] **Configuration**: Properly handles config merging and defaults

## Validation Commands

Use these commands to validate consistency:

```bash
# Lint and type checking
npm run lint
npm run type-check

# Run tests
npm run test

# Build verification
npm run build
```

## Contributing

When contributing to the project:

1. Review this guide before making changes
2. Run validation commands before submitting PRs
3. Update this guide if introducing new patterns
4. Ensure all examples use logger instead of console
5. Follow the established architectural patterns

For questions about consistency standards, refer to the project maintainers or create an issue for clarification.

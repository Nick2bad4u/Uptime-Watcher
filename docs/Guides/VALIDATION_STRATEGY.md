---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Validation Strategy"
summary: "Layered validation strategy for Uptime Watcher, from UI through IPC, managers, repositories, and background services."
created: "2025-10-21"
last_reviewed: "2026-01-31"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "validation"
  - "ipc"
  - "managers"
  - "repositories"
---
# Validation Strategy

The application enforces data quality through a layered validation pipeline. Each layer owns a well-defined set of responsibilities so that validation code stays maintainable, testable, and consistent across domains.

## Layer Overview

| Layer                         | Entry Points                                              | Responsibilities                                                                                                                                         | Tooling                                                                |
| ----------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| UI / Renderer                 | React components, form hooks                              | Basic UX guards (required fields, formatting hints). Never trusts its own input—server-side validation still runs.                                       | React Hook Form, client-side helpers                                   |
| Preload Bridge & IPC Schema   | `electron/preload` APIs, `registerStandardizedIpcHandler` | Type- and shape-level validation for incoming IPC payloads before they reach the main process. Rejects malformed or unexpected input early.              | Zod schemas in `@shared/validation`, custom validators in `IpcService` |
| Managers (Domain Logic)       | `SiteManager`, `MonitorManager`, `DatabaseManager`        | Business rule validation: cross-entity invariants, referential checks, domain-specific constraints. Must assume shape-level validation already happened. | Dedicated domain validators, helper utilities (e.g., `validateSite`)   |
| Repositories & Database Layer | `electron/services/database`                              | Enforce persistence invariants: unique constraints, transactional safety, data normalization. Never trust upstream layers to have done the right thing.  | sqlite constraints, repository helpers, transactions                   |
| Background Services           | Monitoring scheduler, notification pipelines              | Runtime guardrails (e.g., dropping invalid schedules, retry logic). Should surface issues to managers via structured errors.                             | Domain services, telemetry hooks                                       |

## Principles

1. **Single Responsibility Per Layer**: Do not duplicate validation logic across layers. Shape validation lives in preload/IPC, business rules in managers, persistence guarantees in repositories.
2. **Fail Fast**: Reject invalid data as early as possible with actionable error messages. IPC handlers should never pass an invalid payload to managers.
3. **Structured Errors**: Use `ApplicationError` (or a more specific subclass) when propagating validation failures up the stack. Include metadata that helps renderer code present meaningful feedback.
4. **Immutable Inputs**: Treat incoming data as immutable. Create sanitized copies rather than mutating caller arguments.
5. **Tests at the Source**: Each validation rule must have unit tests in the layer that owns it. Avoid “integration-only” validation coverage unless the rule spans multiple layers.

## Implementing New Validation Rules

1. **Define the Contract**
   - Add or update the relevant Zod schema in `shared/validation` for IPC payloads.
   - Extend typed validators in `IpcService` (e.g., `SiteHandlerValidators`, `MonitoringHandlerValidators`).

2. **Enforce Business Rules**
   - Implement domain checks inside the appropriate manager (often before calling repositories).
   - Throw an `ApplicationError` with `code`, `operation`, and `details` describing the violated rule.

3. **Persist Safely**
   - Ensure repository methods use transactions and SQL constraints to guarantee data integrity.
   - Normalize data (e.g., trimming strings, coercing booleans) right before persistence.

4. **Test Thoroughly**
   - Add schema tests (fast-check or unit) for IPC validators.
   - Add manager-level tests covering business rule branches.
   - Add repository tests for constraint enforcement when practical.

## Cross-Layer Example

When adding a new monitor type:

1. **IPC Schema**: Update the monitor configuration Zod schema so preload rejects malformed input.

   ```typescript
   // shared/validation/monitorSchemas.ts
   import { z } from "zod";
   import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

   export const MonitorConfigSchema = z.object({
    id: z.string().min(1, "Monitor ID is required"),
    url: z.string().url(),
    // Align interval bounds with the shared monitoring constants
    interval: z
     .number()
     .min(
      MIN_MONITOR_CHECK_INTERVAL_MS,
      "Check interval must be at least 5 seconds"
     )
     .max(2_592_000_000, "Check interval cannot exceed 30 days"),
    // In practice the real implementation uses a richer union of
    // monitor types; this example focuses on the layered validation
    // pattern rather than enumerating every supported variant.
    type: z.enum([
     "http",
     "port",
     "ping",
     "dns",
    ]),
    enabled: z.boolean().default(true),
   });
   ```

2. **Manager Rule**: Extend `MonitorManager` to verify business requirements (e.g., mutually exclusive options, interval bounds) and throw an `ApplicationError` if invalid.

   ```typescript
   // electron/managers/MonitorManager.ts
   import { ApplicationError } from "@shared/errors";

   class MonitorManager {
    async createMonitor(config: MonitorConfig): Promise<Monitor> {
     // Business rule validation
     if (config.type === "tcp" && config.interval < 10000) {
      throw new ApplicationError({
       code: "INVALID_MONITOR_CONFIG",
       message: "TCP monitors require minimum 10-second interval",
       operation: "MonitorManager.createMonitor",
       details: { interval: config.interval, minimumInterval: 10000 },
      });
     }

     return await this.repository.create(config);
    }
   }
   ```

3. **Repository Guard**: Ensure monitor persistence paths normalize identifiers and wrap writes in `DatabaseService.executeTransaction`.

   ```typescript
   // electron/services/database/MonitorRepository.ts
   class MonitorRepository {
    async create(config: MonitorConfig): Promise<Monitor> {
     return await this.db.executeTransaction(async (tx) => {
      // Normalize data before persistence
      const normalized = {
       ...config,
       url: config.url.trim().toLowerCase(),
       createdAt: Date.now(),
      };

      return await tx.run(
       `INSERT INTO monitors (id, url, interval, type, enabled, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?)`,
       [
        normalized.id,
        normalized.url,
        normalized.interval,
        normalized.type,
        normalized.enabled ? 1 : 0,
        normalized.createdAt,
       ]
      );
     });
    }
   }
   ```

4. **Testing**: Cover each validation stage with targeted tests to prevent regressions.

   ```typescript
   // tests/MonitorValidation.test.ts
   describe("Monitor Validation", () => {
    describe("IPC Schema Validation", () => {
     it("should reject invalid interval", () => {
      const invalid = { interval: 1000 }; // Too short
      expect(() => MonitorConfigSchema.parse(invalid)).toThrow();
     });
    });

    describe("Manager Business Rules", () => {
     it("should enforce TCP minimum interval", async () => {
      const config = { type: "tcp", interval: 5000 };
      await expect(monitorManager.createMonitor(config)).rejects.toThrow(
       ApplicationError
      );
     });
    });

    describe("Repository Persistence", () => {
     it("should normalize URLs before saving", async () => {
      const config = { url: " HTTPS://EXAMPLE.COM " };
      const saved = await repository.create(config);
      expect(saved.url).toBe("https://example.com");
     });
    });
   });
   ```

## Checklist for Reviews

- [ ] IPC handler rejects invalid payloads before reaching managers.
- [ ] Managers throw structured errors with remediation-friendly messages.
- [ ] Repositories never assume the data is valid—transactions or constraints enforce integrity.
- [ ] Tests exist for new validation logic at each layer.
- [ ] Documentation (schemas, guides) reflects the new rule.

Following this strategy keeps validation consistent, discoverable, and verifiable as the codebase grows.

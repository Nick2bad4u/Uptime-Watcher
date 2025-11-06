# Validation Strategy

The application enforces data quality through a layered validation pipeline. Each layer owns a clearly defined set of responsibilities so that validation code stays maintainable, testable, and consistent across domains.

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
2. **Manager Rule**: Extend `MonitorManager` to verify business requirements (e.g., mutually exclusive options, interval bounds) and throw an `ApplicationError` if invalid.
3. **Repository Guard**: Ensure monitor persistence paths normalize identifiers and wrap writes in `DatabaseService.executeTransaction`.
4. **Testing**: Cover each validation stage with targeted tests to prevent regressions.

## Checklist for Reviews

- [ ] IPC handler rejects invalid payloads before reaching managers.
- [ ] Managers throw structured errors with remediation-friendly messages.
- [ ] Repositories never assume the data is valid—transactions or constraints enforce integrity.
- [ ] Tests exist for new validation logic at each layer.
- [ ] Documentation (schemas, guides) reflects the new rule.

Following this strategy keeps validation consistent, discoverable, and verifiable as the codebase grows.

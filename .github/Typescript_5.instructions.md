---
name: "Typescript-File-Instructions"
description: "Guidelines for TypeScript Development targeting TypeScript 5.9+ and ES2024/Latest output"
applyTo: "**/*.ts, **/*.tsx"
---

# TypeScript Development Information

> We are using TypeScript 5.9+ and targeting ES2024/Latest output.

- Prefer native features over polyfills and external helpers.
- Use pure ES modules; never emit `require`, `module.exports`, or CommonJS helpers.
- Prefer modern core APIs (e.g., `Array.prototype.at`, `Object.hasOwn`, `Promise.allSettled`) when supported by the runtime target.

---

## TypeScript 5.9+ Best Practices

### Language & Compiler Features

- Prefer `using` and `Disposable` patterns (when available in your runtime) for deterministic resource cleanup instead of manual `try/finally` when appropriate.
- Use `satisfies` to enforce constraints on configuration objects while preserving literal types:

  ```ts
  const routes = {
    home: "/",
    profile: "/profile",
  } as const satisfies Record<string, `/${string}`>;
  ```

- Use `noUncheckedIndexedAccess`-friendly patterns:
  - When indexing arrays/records, handle `undefined` explicitly:

    ```ts
    const value = arr[index];
    if (value === undefined) {
      // handle out-of-bounds
    }
    ```

- Prefer `const` assertions (`as const`) to preserve literal types for configuration objects and discriminated unions.

### Modules, Imports, and Organization

- Use **ESM imports/exports** exclusively:
  - `import` / `export` only; no `require`, `module.exports`, or dynamic `import()` without strong reason.
- Prefer **named exports** over default exports for better refactoring and discoverability.
- Ensure internal import paths are stable and non-circular; no barrel files at all.
---

## Type System Expectations – Extreme Strict Mode

- Avoid `any` (implicit or explicit); prefer:
  - `unknown` + type narrowing, or
  - Precise generics and constrained types.
- All code must compile under strictest `tsconfig` options (e.g., `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.).

### Safer Alternatives to `any`

- Use `unknown` for untrusted data (e.g., JSON, external APIs):

  ```ts
  function parsePayload(payload: unknown): Payload {
    if (!isPayload(payload)) throw new Error("Invalid payload");
    return payload;
  }
  ```

- Use generics with constraints for reusable utilities:

  ```ts
  function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    // ...
  }
  ```

### Discriminated Unions & State Machines

- Model variants with discriminated unions:

  ```ts
  type ConnectionState =
    | { status: "idle" }
    | { status: "connecting" }
    | { status: "connected"; userId: string }
    | { status: "error"; error: Error };
  ```

- Always exhaustively narrow unions using `switch` + `never`:

  ```ts
  function handleConnection(state: ConnectionState) {
    switch (state.status) {
      case "idle":
        return;
      case "connecting":
        return;
      case "connected":
        return;
      case "error":
        return;
      default: {
        const _exhaustive: never = state;
        return _exhaustive;
      }
    }
  }
  ```

### Shared Contracts & Domain Types

- Centralize shared contracts (API DTOs, domain models, event payloads) in well-named modules instead of duplicating shapes.
- Prefer **type aliases** or **interfaces** with clear names describing domain concepts.
- Model invariants in types where possible (e.g., branded types for IDs, non-empty strings).

---

## Utility Types, Type-Level Helpers, and Type-Fest

- Use built-in utility types to express intent:
  - `Readonly<T>`, `Required<T>`, `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, `NonNullable<T>`, `ReturnType<F>`, `Parameters<F>`, etc.
- The **Type-Fest** library is installed; prefer its utilities when they better express intent than built-ins.

### Type-Fest Usage Guidelines

- Import Type-Fest helpers from `"type-fest"` and keep imports **narrow and explicit**:

  ```ts
  import type { JsonValue, SetRequired, Simplify } from "type-fest";
  ```

- Use Type-Fest for:
  - **JSON-safe types**: `JsonObject`, `JsonValue`, `Jsonify<T>` when modeling data that must be serializable.

    ```ts
    import type { JsonValue } from "type-fest";

    type ApiPayload = JsonValue;
    ```

  - **Branded and opaque types**: `Opaque<Type, Token>` to distinguish IDs and other primitives that share a representation but differ semantically.

    ```ts
    import type { Opaque } from "type-fest";

    type UserId = Opaque<string, "UserId">;
    type OrderId = Opaque<string, "OrderId">;
    ```

  - **Object refinement**:
    - `SetRequired<T, K>` / `SetOptional<T, K>` for partial/required subsets.
    - `Merge<T, U>` for producing a single flattened type from overlapping sources.
    - `Simplify<T>` to clean up deeply composed types for better tooling display.

    ```ts
    import type { SetRequired, Simplify } from "type-fest";

    type User = {
      id?: string;
      name: string;
      email?: string;
    };

    type PersistedUser = Simplify<SetRequired<User, "id" | "email">>;
    ```

  - **String manipulation**:
    - `CamelCase`, `KebabCase`, etc., when type-level string formats matter (e.g., mapping API keys to internal names).

- Keep Type-Fest usage:
  - **Local to domain-focused modules** (e.g., `ids.ts`, `api-types.ts`) instead of scattering across the codebase.
  - **Documented** at the type alias site when you use more advanced utilities, so future maintainers understand the intent.

---

## Error Handling and Async Patterns

- Use `async/await` with `Promise`-based APIs; avoid callback-style code.
- Model error-returning functions as discriminated unions rather than throwing where appropriate:

  ```ts
  type Result<T> =
    | { ok: true; value: T }
    | { ok: false; error: Error };
  ```

- When throwing is needed, throw `Error` instances with useful messages and context.

---

## Coding Style & Patterns

- Prefer small, pure functions for business logic; keep side effects at the edges.
- Use `readonly` for fields and arrays that should not be mutated.
- Avoid mutation of shared objects; prefer immutable updates (spread, `structuredClone`, etc.) where performance allows.
- Use **narrow, explicit interfaces** for dependencies instead of large “god” types.

---

## Testing & Tooling

- Use strong types in tests as well:
  - Type your helpers, mocks, and fixtures.
  - Avoid `as any`; prefer helpers that create correctly typed objects.
- Ensure test code compiles under the same strict settings as production code.
- For test fixtures that must match JSON structures, prefer `JsonValue`/`JsonObject` from Type-Fest to document the constraint.

---

## Interop and Migration

- When interacting with untyped or loosely-typed libraries:
  - Isolate unsafe boundaries in small, well-typed wrappers.
  - Use `unknown` + runtime validation instead of `any`.
- If an `any` is absolutely unavoidable:
  - Contain it in the smallest possible scope.
  - Document why it’s needed and consider using `@ts-expect-error` for deliberate suppression with explanation.

---

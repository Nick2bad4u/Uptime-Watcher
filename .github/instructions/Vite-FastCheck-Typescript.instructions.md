---
name: "TypeScript-Vitest-FastCheck-Testing-Guidelines"
description: "TypeScript testing best practices using Vitest and fast-check for property-based testing"
applyTo: "**/*.test.ts, **/*.spec.ts, **/*.test.tsx, **/*.spec.tsx"
---

# TypeScript Testing Guidelines (Vitest + fast-check)

This guide provides TypeScript-specific instructions for creating automated tests using [Vitest](https://vitest.dev/) for unit/integration tests and [fast-check](https://github.com/dubzzz/fast-check) for property-based testing.

Follow your project’s general TypeScript guidelines (e.g., `./Typescript_5.instructions.md`) for coding style and architecture.

---

## 1. File Naming and Structure

-   **File naming:**
    -   Prefer `*.test.ts` / `*.test.tsx` for unit tests.
    -   Prefer `*.spec.ts` / `*.spec.tsx` for behavior/specification tests.
-   **Placement:**
    -   Co-locate tests next to implementation (e.g., `src/foo.ts` → `src/foo.test.ts`) **or**
    -   Use a dedicated `tests/` directory mirroring `src/` structure (be consistent per repo).
-   **Imports:**
    -   Use named imports from `vitest`:
        ```ts
        import { describe, it, expect, beforeEach, vi } from "vitest";
        ```
    -   For property-based tests, import from `fast-check`:
        ```ts
        import fc from "fast-check";
        ```
-   **No runtime side effects in test modules:**
    -   Keep top-level code limited to test definitions (`describe`, `it`, hooks) and constant data.
    -   Avoid executing production logic at module load (do it inside `it`/`test` or hooks).

---

## 2. Test Structure Hierarchy

Use Vitest’s `describe`/`it` hierarchy and hooks:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("feature or module name", () => {
    let sut: ReturnType<typeof createSomething>;

    beforeEach(() => {
        sut = createSomething();
    });

    afterEach(() => {
        // optional cleanup
    });

    describe("when some precondition holds", () => {
        it("does the expected behavior", () => {
            // Arrange
            const input = "value";

            // Act
            const result = sut.doThing(input);

            // Assert
            expect(result).toBe("expected");
        });
    });
});
```

**Guidelines:**

-   `describe`: group related tests by module, function, or behavior.
-   Nested `describe`: use for scenarios (`"when X"`, `"with invalid input"`).
-   `it` / `test`: single, clearly described behavior per test.
-   Use **AAA pattern** (Arrange–Act–Assert) within each test.

---

## 3. Core Vitest APIs

### 3.1 Test and Suite Definitions

-   `describe(name, fn)`: group tests.
-   `it(name, fn)` / `test(name, fn)`: define a test case.
-   Use descriptive, behavior-focused names:

    ```ts
    it("returns null when user does not exist", () => {
        // ...
    });
    ```

-   Prefer present-tense and behavior wording over implementation details.

### 3.2 Hooks

-   `beforeAll(fn)`: runs once before all tests in the suite.
-   `afterAll(fn)`: runs once after all tests in the suite.
-   `beforeEach(fn)`: runs before each test.
-   `afterEach(fn)`: runs after each test.

**Best practices:**

-   Use `beforeEach` to create fresh SUT (system under test) instances.
-   Avoid sharing mutable state across tests; re-initialize in `beforeEach`.
-   Use `afterEach` for cleanup (e.g., restore mocks, clear timers).

```ts
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

describe("UserService", () => {
    let service: UserService;
    const repo = { findById: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        service = new UserService(repo as any);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns user by id", async () => {
        repo.findById.mockResolvedValue({ id: "42" });
        const user = await service.get("42");
        expect(user?.id).toBe("42");
        expect(repo.findById).toHaveBeenCalledWith("42");
    });
});
```

---

## 4. Assertions with `expect`

Use Vitest’s Jest-compatible `expect` matchers.

### 4.1 Basic Matchers

-   Equality:
    -   `toBe` (strict equality for primitives and references)
    -   `toEqual` / `toStrictEqual` (deep equality)
-   Truthiness:
    -   `toBeTruthy`, `toBeFalsy`
    -   `toBeNull`, `toBeUndefined`, `toBeDefined`
-   Numbers:
    -   `toBeGreaterThan`, `toBeGreaterThanOrEqual`
    -   `toBeLessThan`, `toBeLessThanOrEqual`
    -   `toBeCloseTo` for floating point.

### 4.2 Collections & Objects

-   Arrays:
    -   `toHaveLength`
    -   `toContain`
    -   `toContainEqual`
-   Objects:
    -   `toMatchObject`
    -   `toHaveProperty`

### 4.3 Strings

-   `toContain`, `toMatch` (RegExp), `toHaveLength`.

### 4.4 Errors and Promises

-   Synchronous error:

    ```ts
    expect(() => fn(badInput)).toThrow("specific message");
    expect(() => fn(badInput)).toThrowErrorMatchingInlineSnapshot();
    ```

-   Async error:

    ```ts
    await expect(asyncFn(badInput)).rejects.toThrow("message");
    await expect(asyncFn(ok)).resolves.toEqual(expected);
    ```

**Guidelines:**

-   Prefer **one main expectation** per test; additional `expect` calls may be used to verify related aspects of the same behavior.
-   Assert **observable behavior**, not implementation details (e.g., avoid asserting private fields or internal calls unless it’s an interaction test).

---

## 5. Mocking, Spies, and Fakes (Vitest `vi`)

### 5.1 Creating Mocks and Spies

-   `vi.fn()` – generic mock function.
-   `vi.spyOn(obj, "method")` – spy on an existing method.
-   `vi.mock("module")` – module-level mocking (for external dependencies).

```ts
import { vi } from "vitest";

const callback = vi.fn();
callback("arg");
expect(callback).toHaveBeenCalledWith("arg");
```

**Best practices:**

-   Mock only external boundaries (HTTP clients, DB access, external APIs, time).
-   Avoid over-mocking internal dependencies; prefer testing behavior end-to-end within module boundaries.

### 5.2 Timers and Dates

-   Use fake timers when testing timeouts/intervals:

    ```ts
    vi.useFakeTimers();

    it("waits 1 second", () => {
        const fn = vi.fn();
        doSomethingWithTimeout(fn);
        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalled();
    });

    afterEach(() => {
        vi.useRealTimers();
    });
    ```

---

## 6. Property-Based Testing with fast-check

Use fast-check to validate invariants across many automatically generated inputs.

### 6.1 Basic Pattern

```ts
import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("toUpperCase", () => {
    it("preserves length for any string", () => {
        fc.assert(
            fc.property(fc.string(), (s) => {
                expect(s.toUpperCase().length).toBe(s.length);
            })
        );
    });
});
```

**Key concepts:**

-   **Arbitraries** (`fc.string()`, `fc.integer()`, etc.) generate random values.
-   **Property**: a function that must hold for all generated inputs.

### 6.2 Common Arbitraries

Use fast-check arbitraries for representative input spaces:

-   Scalars:
    -   `fc.integer()`, `fc.float()`, `fc.double()`, `fc.bigInt()`
    -   `fc.boolean()`, `fc.string()`, `fc.unicodeString()`
-   Collections:
    -   `fc.array(arb, { minLength, maxLength })`
    -   `fc.set(arb)` for unique elements.
-   Structured data:
    -   `fc.tuple(a, b, c)`
    -   `fc.record({ id: fc.string(), age: fc.integer({ min: 0 }) })`
-   Optionals:
    -   `fc.option(arb, { nil: null })` to generate `arb | null`.

### 6.3 Invariants to Test

Focus on **behavioral properties** such as:

-   **Idempotence**: `f(f(x)) === f(x)`
-   **Reversibility**: `decode(encode(x)) === x` (within constraints)
-   **Monotonicity**: if `x <= y` then `f(x) <= f(y)`
-   **Preservation**: length, sum, sortedness, etc.

Example – encode/decode invariant:

```ts
it("decode(encode(x)) returns x for valid ids", () => {
    fc.assert(
        fc.property(fc.integer({ min: 0, max: 1_000_000 }), (id) => {
            const token = encodeId(id);
            const decoded = decodeId(token);
            expect(decoded).toBe(id);
        })
    );
});
```

### 6.4 Configuring fast-check

-   Control number of runs and verbosity:

    ```ts
    fc.assert(
        fc.property(fc.string(), (s) => {
            // property
        }),
        { numRuns: 200, verbose: true }
    );
    ```

-   Use **constraints** to avoid invalid test spaces instead of throwing inside the property when possible.

### 6.5 Integrating TypeScript Types

-   Use `as const` and `fc.oneof`/`fc.constantFrom` to model discriminated unions:

    ```ts
    type Status = "pending" | "done" | "failed";

    const statusArb = fc.constantFrom<Status>("pending", "done", "failed");
    ```

-   Reflect TypeScript domain types in arbitraries; tests should sample all supported shapes of a type.

---

## 7. Data-Driven / Parameterized Tests

For simple data-driven tests, use tables and loops:

```ts
const cases = [
    { input: "abc", expected: "ABC" },
    { input: "", expected: "" },
    { input: "Mixed", expected: "MIXED" },
] as const;

describe("toUpper", () => {
    it.each(cases)(
        "uppercases '$input' to '$expected'",
        ({ input, expected }) => {
            expect(toUpper(input)).toBe(expected);
        }
    );
});
```

If `it.each` is not available in your Vitest version, use `forEach`:

```ts
cases.forEach(({ input, expected }) => {
    it(`uppercases '${input}' to '${expected}'`, () => {
        expect(toUpper(input)).toBe(expected);
    });
});
```

**When to use what:**

-   **Table-driven tests** (finite sets): test specific edge cases and known examples.
-   **fast-check**: explore broad input spaces and discover unexpected edge cases.

---

## 8. Skipping and Focusing Tests

-   `it.skip`, `describe.skip`: temporarily skip tests/suites.
-   `it.only`, `describe.only`: focus on a single test/suite during development.

```ts
it.skip("TODO: integration test", () => {
    // to be implemented
});
```

**Best practices:**

-   Never commit `*.only` tests.
-   Use `skip` sparingly and add a comment or TODO explaining why.

---

## 9. Error Handling and Async Tests

### 9.1 Async Tests

-   Mark tests as `async` and use `await`:

    ```ts
    it("resolves with data", async () => {
        const result = await fetchData();
        expect(result).toEqual(expected);
    });
    ```

-   Avoid mixing `done` callbacks with async/await; prefer `async`/`await`.

### 9.2 Testing Errors and Rejections

-   Synchronous:

    ```ts
    it("throws on invalid input", () => {
        expect(() => parseNumber("abc")).toThrow(/invalid/i);
    });
    ```

-   Async:

    ```ts
    it("rejects on invalid id", async () => {
        await expect(fetchUser("bad")).rejects.toThrow("not found");
    });
    ```

---

## 10. Best Practices

-   **Descriptive names:** test descriptions should clearly state the behavior and conditions.
    -   Prefer: `"returns null when user is not found"`
    -   Avoid: `"test1"` or `"works"`.
-   **Single responsibility tests:**
    -   Each test should validate **one behavior**.
-   **Isolated tests:**
    -   No test should rely on state modified by another; use fresh instances and fixtures.
-   **Avoid brittle tests:**
    -   Do not assert on incidental details (e.g., exact log messages, internal function calls) unless necessary.
-   **Use types to drive tests:**
    -   Derive test data shapes from domain types (interfaces, unions) so tests evolve with the type system.

---

## 11. Example: Combined Vitest + fast-check Test

```ts
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { normalizeEmail } from "../src/normalizeEmail";

describe("normalizeEmail", () => {
    const examples = [
        { input: "USER@Example.com", expected: "user@example.com" },
        { input: " user@example.com ", expected: "user@example.com" },
    ] as const;

    it.each(examples)(
        "normalizes '$input' to '$expected'",
        ({ input, expected }) => {
            expect(normalizeEmail(input)).toBe(expected);
        }
    );

    it("is idempotent for any string", () => {
        fc.assert(
            fc.property(fc.string(), (raw) => {
                const once = normalizeEmail(raw);
                const twice = normalizeEmail(once);
                expect(twice).toBe(once);
            }),
            { numRuns: 200 }
        );
    });
});
```

---

## 12. Configuration and Execution

-   Prefer project-level Vitest configuration via `vitest.config.ts` rather than per-test configuration.
-   Typical configuration:
    -   set `testEnvironment`, `coverage`, `globals`, `include`/`exclude` patterns.
-   Run tests:
    -   `vitest` – run all tests
    -   `vitest run` – CI mode
    -   `vitest --runInBand` – helpful for tests with shared external resources.

**Key settings to consider:**

-   Coverage thresholds (per file and global).
-   Test-timeout (`testTimeout`) for async/integration tests.
-   `maxWorkers` for parallel execution (relevant for resource-heavy suites).

---

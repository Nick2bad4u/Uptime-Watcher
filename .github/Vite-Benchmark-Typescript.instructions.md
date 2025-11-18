---
name: "TypeScript-Vite-Benchmark-Guidelines"
description: "High-quality guidelines for writing reliable, comparable benchmarks in Vite-based TypeScript projects"
applyTo: "**/*.bench.ts, **/*.bench.tsx, **/*.benchmark.ts, **/*.benchmark.tsx"
---

# Vite Benchmark Authoring Guidelines (TypeScript)

These guidelines describe how to write **high-quality benchmarks** for Vite-based TypeScript projects in `*.bench.ts` / `*.benchmark.ts` files. They focus on:

-   Producing **meaningful, comparable metrics**
-   Avoiding **misleading micro-benchmarks**
-   Ensuring benchmarks are **repeatable, deterministic, and easy to run**

Assumptions:

-   You are using a Vite-compatible benchmark runner such as:
    -   `vitest` with `benchmark` API **or**
    -   `tinybench` or similar tool integrated in a Vite environment.
-   Benchmarks are written in TypeScript and run via a Vite-powered tooling pipeline.

Adapt names and imports to your specific setup, but follow the structural and quality guidelines below.

---

## 1. File Naming, Location, and Scope

### 1.1 File Naming

-   Use `*.bench.ts` (preferred) or `*.benchmark.ts` for benchmark files:

    -   `string-utils.bench.ts`
    -   `parser.bench.ts`
    -   `sorting.benchmark.ts`

-   One benchmark file per **logical area**:
    -   A module, feature, or algorithm family (e.g., “string operations”, “date parsing”).

### 1.2 Placement

-   Co-locate benchmarks with the code they measure when possible:

    ```
    src/utils/string.ts
    src/utils/string.bench.ts
    ```

-   For larger codebases, you may centralize in `benchmarks/` but mirror the `src/` structure:

    ```
    src/utils/string.ts
    benchmarks/utils/string.bench.ts
    ```

Be consistent within the repository.

### 1.3 Scope and Intent

Benchmarks should:

-   Measure **hot paths or critical operations** (e.g., parsing, rendering, serialization).
-   Focus on **one responsibility per benchmark group**:
    -   e.g., “formatDate baselines” vs “date parsing baselines”.

Avoid:

-   Benchmarking trivial getters/setters.
-   Benchmarking code where I/O or network latency dominates (use load tests instead).

---

## 2. Benchmark Structure and APIs

The exact API depends on your runner. A common pattern with `vitest`’s benchmark API or `tinybench` is:

```ts
import { bench, describe } from "vitest";
// or from your benchmark runner

import { fastFormatDate, legacyFormatDate } from "../src/date";

describe("date formatting", () => {
    bench("fastFormatDate", () => {
        fastFormatDate("2024-01-01T00:00:00.000Z");
    });

    bench("legacyFormatDate", () => {
        legacyFormatDate("2024-01-01T00:00:00.000Z");
    });
});
```

### 2.1 Top-Level Organization

-   Group related benchmarks with `describe` (or equivalent) per concern:

    ```ts
    describe("string trimming", () => {
        /* trim benchmarks */
    });
    describe("slug generation", () => {
        /* slug benchmarks */
    });
    ```

-   Each `bench` call should:
    -   Have a **short, descriptive name**.
    -   Measure one well-defined variant or algorithm.

### 2.2 Benchmark Naming

Use names that reflect **algorithm or variant**, not implementation details:

-   `trimUsingRegex`
-   `trimUsingNative`
-   `slugifySimple`
-   `slugifyWithTransliteration`

Avoid:

-   `test1`, `implA`, `implB`, `newVersion` (these age poorly).

---

## 3. Benchmark Quality Principles

High-quality benchmarks aim to be:

1. **Deterministic**
    - Avoid randomness or time-sensitive data in the benchmarked function.
2. **Isolated**
    - Measure a small, well-defined piece of code without unrelated work.
3. **Representative**
    - Use realistic inputs that reflect actual production usage.
4. **Warm and Stable**
    - Allow for warm-up; ignore initial JIT warm-up noise.
5. **Comparable**
    - Benchmarks comparing variants must treat them symmetrically (same inputs, same environment).

---

## 4. Inputs and Data Design

### 4.1 Use Realistic and Fixed Fixtures

Prefer fixed, realistic fixtures over synthetic or random inputs:

```ts
const sampleDates = [
    "2024-01-01T00:00:00.000Z",
    "1999-12-31T23:59:59.999Z",
    "2020-02-29T12:34:56.789Z",
] as const;
```

-   Keep test data **stable** to ensure comparability across runs.
-   Avoid generating random data inside the benchmark function (it becomes part of the cost).

### 4.2 Pre-compute Inputs Outside the Benchmark Loop

**Good:**

```ts
const inputs = Array.from({ length: 1000 }, (_, i) => `item-${i}`);

bench("process list", () => {
    for (const input of inputs) {
        processItem(input);
    }
});
```

**Avoid:**

```ts
bench("process list (bad)", () => {
    const inputs = Array.from({ length: 1000 }, (_, i) => `item-${i}`); // allocation inside benchmark
    for (const input of inputs) {
        processItem(input);
    }
});
```

Move setup out of the measured code path unless that setup is exactly what you want to measure.

---

## 5. Avoiding Common Benchmark Pitfalls

### 5.1 Minimizing Overhead

-   Keep the function body of `bench` as small and direct as possible.
-   Do not log, format strings, or allocate large objects within loops unless that is the subject of the benchmark.

### 5.2 Preventing Dead-Code Elimination

If a function returns a value, ensure it isn’t optimized away.

Pattern: accumulate results in a scope-captured variable:

```ts
let sink = 0;

bench("sum", () => {
    const result = sum(1, 2, 3, 4);
    sink ^= result;
});

// Optionally export sink to avoid tree-shaking if needed:
export { sink };
```

Avoid:

-   `bench("sum", () => { sum(1, 2, 3, 4); });`
    Some engines may inline or remove the call if the result is unused (depending on runner).

### 5.3 Warmup and Run Counts

Configure or rely on your benchmark runner’s defaults for:

-   **Warmup iterations:** allow JIT to optimize code.
-   **Number of measured iterations:** enough to reduce noise.

If your runner exposes options (example):

```ts
bench("parse JSON", { time: 1_000, warmupTime: 500 }, () => {
    JSON.parse(payload);
});
```

Use a **consistent configuration across comparable benchmarks**.

---

## 6. Running Benchmarks in a Vite Context

### 6.1 Vite-Friendly Imports

-   Use **module-relative imports** from `src/` or aliases defined in `vite.config.ts`:

```ts
import { heavyComputation } from "@/utils/heavy-computation";
// or relative
import { heavyComputation } from "../src/utils/heavy-computation";
```

-   Avoid Node-specific APIs unless your benchmark runner uses Node and you don’t plan to run in the browser.

### 6.2 CI and Local Commands

-   Standardize scripts in `package.json`:

```json
{
    "scripts": {
        "bench": "vitest bench",
        "bench:watch": "vitest bench --watch"
    }
}
```

-   When using other runners (tinybench, custom scripts), wrap them in `vite-node` or a similar runner compatible with your build.

---

## 7. Benchmark Organization: Suites and Cases

Design each `.bench.ts` file with a clear structure:

```ts
import { bench, describe } from "vitest";
import { fastHash, legacyHash } from "../src/hash";

const smallInputs = Array.from({ length: 100 }, (_, i) => `item-${i}`);
const largeInputs = Array.from({ length: 10_000 }, (_, i) => `item-${i}`);

describe("hash - small inputs", () => {
    bench("fastHash", () => {
        for (const input of smallInputs) fastHash(input);
    });

    bench("legacyHash", () => {
        for (const input of smallInputs) legacyHash(input);
    });
});

describe("hash - large inputs", () => {
    bench("fastHash", () => {
        for (const input of largeInputs) fastHash(input);
    });

    bench("legacyHash", () => {
        for (const input of largeInputs) legacyHash(input);
    });
});
```

**Guidelines:**

-   Use `describe` to separate:
    -   Different input sizes (small/medium/large).
    -   Different shapes (simple/complex).
    -   Different modes (sync/async).
-   Keep each `describe` focused; avoid mixing unrelated concerns.

---

## 8. Asynchronous Benchmarks

If your benchmark tool supports async, you can benchmark async functions:

```ts
import { bench, describe } from "vitest";
import { fetchDataCached } from "../src/data";

describe("fetchDataCached", () => {
    bench("fetch from cache", async () => {
        await fetchDataCached("id-123");
    });
});
```

**Best Practices:**

-   Avoid real network calls:
    -   Use mocks, in-memory stores, or local file-based data.
-   Ensure the async path is deterministic:
    -   No random delays.
    -   No dependence on external services.

Example with a mock:

```ts
const mockData = { id: "id-123", value: "test" };

async function fetchDataMock(id: string) {
    return mockData;
}

bench("mocked fetch", async () => {
    await fetchDataMock("id-123");
});
```

---

## 9. Measuring Realistic Usage Patterns

### 9.1 Micro vs. Macro Benchmarks

-   **Micro-benchmarks:** small functions (e.g., string operations)
    -   Good for verifying algorithmic improvements.
    -   Sensitive to noise and JIT optimizations.
-   **Macro-benchmarks:** higher-level operations (e.g., parsing a whole document)
    -   Better for overall user-perceived performance.

Prefer:

-   A small set of meaningful **macro-benchmarks** for user flows.
-   Selective **micro-benchmarks** for hotspots where you are comparing concrete alternatives.

### 9.2 Example: Parsing Benchmarks

```ts
import { bench, describe } from "vitest";
import { parseConfigFast, parseConfigLegacy } from "../src/config";

const smallConfig = `{"feature": true, "threshold": 10}`;
const largeConfig = JSON.stringify({
    feature: true,
    items: Array.from({ length: 5000 }, (_, i) => ({
        id: i,
        value: `item-${i}`,
    })),
});

describe("parseConfig - small config", () => {
    bench("fast", () => {
        parseConfigFast(smallConfig);
    });

    bench("legacy", () => {
        parseConfigLegacy(smallConfig);
    });
});

describe("parseConfig - large config", () => {
    bench("fast", () => {
        parseConfigFast(largeConfig);
    });

    bench("legacy", () => {
        parseConfigLegacy(largeConfig);
    });
});
```

---

## 10. Reporting, Interpretation, and Regression Detection

### 10.1 Consistent Benchmark Environments

-   Run benchmarks on:
    -   A consistent Node version.
    -   Similar hardware or container configuration (especially in CI).
-   Document any relevant environment assumptions:
    -   CPU, Node version, OS, etc. (preferably in project docs, not each file).

### 10.2 Comparing Variants

When comparing two implementations:

-   Ensure both benchmarks:
    -   Use the **same inputs**, repeated in the same pattern.
    -   Run under the same configuration (warmup, iterations, etc).
-   Interpret results in terms of **relative difference** (e.g., “fastHash is ~2x faster than legacyHash”), not absolute numbers, which may vary between machines.

### 10.3 Performance Regressions

-   Use CI to run benchmarks periodically or on key branches.
-   If your tool supports it, store baseline results and detect regressions beyond a threshold.
-   If results are noisy, consider:
    -   Running more iterations.
    -   Isolating the CI runner.
    -   Reducing external noise (e.g., CPU contention).

---

## 11. Example: Comprehensive Vite Benchmark File

```ts
import { bench, describe } from "vitest";
import { newSlugify, legacySlugify } from "../src/slugify";

// Input fixtures
const shortTitles = ["Hello World", "Quick brown fox", "Vite Benchmarking"];

const longTitles = Array.from(
    { length: 500 },
    (_, i) =>
        `Post number ${i} – A very long title that includes various characters & symbols!`
);

// Avoid recomputing inside the benchmark:
const shortSamples = shortTitles.map((title) => title.repeat(1));
const longSamples = longTitles.map((title) => title.repeat(2));

let sink = 0;

describe("slugify - short titles", () => {
    bench("newSlugify", () => {
        for (const title of shortSamples) {
            sink ^= newSlugify(title).length;
        }
    });

    bench("legacySlugify", () => {
        for (const title of shortSamples) {
            sink ^= legacySlugify(title).length;
        }
    });
});

describe("slugify - long titles", () => {
    bench("newSlugify", () => {
        for (const title of longSamples) {
            sink ^= newSlugify(title).length;
        }
    });

    bench("legacySlugify", () => {
        for (const title of longSamples) {
            sink ^= legacySlugify(title).length;
        }
    });
});

export { sink }; // optional: prevent tree-shaking
```

This example shows:

-   Clear grouping (`short titles`, `long titles`).
-   Fixed, realistic input data.
-   Prevention of dead-code elimination (`sink`).
-   Comparable benchmarks for old vs new implementation.

---

## 12. Summary Checklist

When creating or updating a Vite benchmark file (`*.bench.ts` / `*.benchmark.ts`):

1. **Naming & Location**

    - File name clearly indicates benchmark focus.
    - Co-located with relevant code or in a structured `benchmarks/` directory.

2. **Structure**

    - Use `describe` to group related benchmark cases.
    - Each `bench` measures a single, clearly named variant.

3. **Inputs**

    - Inputs are realistic, fixed, and precomputed outside the benchmark body.
    - No unnecessary allocations or randomness inside the measured loop.

4. **Determinism**

    - No external dependencies, network calls, or time-based behavior (unless purposely measured and controlled).

5. **Optimization Safety**

    - Avoid dead-code elimination by using results (e.g., `sink` variable).

6. **Comparability**

    - For variant comparisons, ensure same inputs and configuration.
    - Use consistent environment / Node version for meaningful comparisons.

7. **Docs & Scripts**
    - Provide `npm`/`pnpm`/`yarn` scripts for running benchmarks (e.g., `vitest bench`).
    - Keep any necessary environment notes in project documentation.

By following these guidelines, Vite benchmarks will be **reliable**, **repeatable**, and **useful** for real performance decisions over time.

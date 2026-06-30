---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Test Suite Maintenance"
summary: "Guidance for reducing coverage-shaped test debt while preserving useful behavior, regression, integration, property, and fuzz coverage."
created: "2026-06-30"
last_reviewed: "2026-06-30"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "testing"
 - "maintenance"
 - "coverage"
---

# Test suite maintenance

Uptime Watcher has broad test coverage. The maintenance risk is not missing
tests; it is overlapping tests whose names and assertions are optimized for
coverage movement instead of durable behavior evidence.

## Current inventory baseline

The June 30, 2026 inventory found 895 test/spec files. Filename signals:

| Signal          | Count |
| --------------- | ----: |
| `coverage`      |   172 |
| `comprehensive` |   134 |
| `fuzz`          |    62 |
| `property`      |    23 |
| `100`           |    21 |
| `final`         |    15 |
| `missing`       |    12 |
| `debug`         |    10 |
| `behavior`      |     9 |
| `targeted`      |     8 |
| `integration`   |     4 |
| `regression`    |     3 |

Use this as a cleanup baseline, not as a failure threshold.

## Naming policy

Prefer names that describe why the test exists:

| Suffix or term | Use for |
| -------------- | ------- |
| `.test` | Default behavior/unit tests with stable user or module expectations. |
| `.regression.test` | A specific bug that must not return. Link or name the behavior in the test title. |
| `.integration.test` | Cross-module behavior that needs real wiring or persistence boundaries. |
| `.property.test` | Fast-check/property tests where generated input is the main value. |
| `.fuzz.test` | Broad generated-input stress tests that are intentionally less scenario-specific. |
| `.benchmark.test` | Performance checks that are not ordinary correctness tests. |

Avoid adding new `final`, `100`, `coverage`, `coverage-boost`, `missing-lines`,
or `comprehensive` names. If a coverage-oriented suite must remain, its file
header should name the source file and the branch/error path it protects.

## Consolidation workflow

1. Pick one feature or utility family, not the whole suite.
2. List related files with `rg --files | rg '<feature>|coverage|comprehensive|final|missing'`.
3. Keep the smallest behavior-focused suite that proves the public contract.
4. Move unique edge cases from coverage-shaped suites into the behavior suite.
5. Delete only redundant assertions after the relevant targeted test command and
   coverage command still pass.

## Review checklist

- The test title names a user-visible behavior, public API contract, or known
  regression.
- The test fails for the intended implementation bug, not just for a refactor.
- Mocks are scoped to the boundary under test.
- Snapshot and broad matrix tests explain why a narrower behavior test is not
  enough.
- Coverage-focused tests are temporary unless they protect a real edge case.

## Useful inventory commands

```powershell
$files = @(rg --files | rg '(test|spec)\.(ts|tsx)$|\.test\.(ts|tsx)$|\.spec\.(ts|tsx)$')
$files | rg 'coverage|comprehensive|final|missing|debug'
```

```powershell
$patterns = @('100','coverage','comprehensive','final','debug','missing','targeted','property','fuzz','regression','integration','behavior')
foreach ($pattern in $patterns) {
    $count = @($files | Where-Object { $_ -match $pattern }).Count
    [pscustomobject]@{ Pattern = $pattern; Count = $count }
}
```

---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Test Scripts Verbosity Guide"
summary: "Overview of the different Vitest script variants and reporters available in Uptime Watcher, from quiet CI-friendly runs to detailed debugging output."
created: "2025-11-21"
last_reviewed: "2025-12-16"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "testing"
 - "vitest"
 - "tooling"
 - "uptime-watcher"
---

# Test Scripts Verbosity Guide

This document explains the different verbosity levels available for running tests in the Uptime Watcher project.

## Overview

We've created multiple variants of each test script to provide different levels of output verbosity. This allows you to choose the appropriate level of detail for your needs without modifying the Vite configuration files.

## Default Test Scripts (Baseline Verbosity)

- `npm run test` - Run frontend tests with standard verbosity
- `npm run test:electron` - Run Electron tests with standard verbosity
- `npm run test:shared` - Run shared component tests with standard verbosity
- `npm run test:all` - Run all tests with standard verbosity

## Verbosity Levels

### 1. Quiet (Minimal Console Output)

Uses `--silent` flag to suppress most output except results.

- `npm run test:quiet`
- `npm run test:electron:quiet`
- `npm run test:shared:quiet`
- `npm run test:all:quiet`

**Best for:** CI/CD pipelines, quick checks when you only care about pass/fail

### 2. Minimal (Dot Progress)

Uses `--reporter=dot` to show progress as dots (one dot per test).

- `npm run test:minimal`
- `npm run test:electron:minimal`
- `npm run test:shared:minimal`
- `npm run test:all:minimal`

**Best for:** Local development when you want minimal visual feedback

### 3. Default (Standard Output)

Uses `--reporter=default` for balanced output showing file names and basic results.

- `npm run test` (baseline)
- `npm run test:electron` (baseline)
- `npm run test:shared` (baseline)
- `npm run test:all` (baseline)

**Best for:** General development work, debugging test failures

### 4. Verbose (Detailed Test Tree)

Uses `--reporter=verbose` to show full test hierarchy and individual test names.

- `npm run test:verbose`
- `npm run test:electron:verbose`
- `npm run test:shared:verbose`
- `npm run test:all:verbose`

**Best for:** Understanding test structure, detailed debugging

### 5. Detailed (Maximum Information)

Uses `--reporter=verbose --no-truncate` for complete output with no truncation.

- `npm run test:detailed`
- `npm run test:electron:detailed`
- `npm run test:shared:detailed`
- `npm run test:all:detailed`

**Best for:** Deep debugging, full error analysis

## Coverage Tests

Coverage tests also support verbosity levels (renderer suite by default):

- `npm run test:coverage` (renderer coverage; use alongside electron/shared coverage for full picture)
- `npm run test:coverage:quiet` (renderer, quiet)
- `npm run test:coverage:minimal` (renderer, dot reporter)
- `npm run test:coverage:verbose` (renderer, verbose reporter)
- `npm run test:coverage:detailed` (renderer, verbose + no truncation)

For full coverage, pair renderer coverage with `npm run test:electron:coverage`
and `npm run test:shared:coverage`; merge reports if you need a combined view.

## Example Output Comparison

### Minimal (`test:minimal`)

```text
········································································
 Test Files  3 passed (3)
      Tests  72 passed (72)
```

### Default (`test`)

```text
 ✓ src/test/main.comprehensive.test.tsx (25 tests) 1616ms
 ✓ shared/test/validation/schemas.test.ts (38 tests) 2ms
 ✓ electron/test/services/ServiceContainer.core-services.test.ts (9 tests) 2ms

 Test Files  3 passed (3)
      Tests  72 passed (72)
```

### Verbose (`test:verbose`)

Shows complete test hierarchy with all individual test names and timings.

## Recommendations

- **Development**: Use `npm run test` or `npm run test:minimal` for quick feedback
- **Debugging**: Use `npm run test:verbose` to see which specific tests are failing
- **CI/CD**: Use `npm run test:quiet` for cleaner build logs
- **Deep Debugging**: Use `npm run test:detailed` when you need maximum information

## Configuration Note

These scripts only change the output verbosity through command-line flags. The underlying Vite configuration files remain unchanged, preserving all your existing test settings, coverage thresholds, and other configurations.

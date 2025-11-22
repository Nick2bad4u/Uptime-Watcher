---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Type-fest Integration Patterns"
summary: "Patterns and best practices for integrating type-fest utilities across the Uptime Watcher codebase."
created: "2025-08-28"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "type-fest"
  - "typescript"
  - "types"
  - "patterns"
---
# Type-fest Integration Patterns

This document provides comprehensive patterns for integrating type-fest utilities consistently across the Uptime-Watcher codebase. These patterns ensure type safety, better developer experience, and maintainable code.

## Table of Contents

1. [Overview](#overview)
2. [Pattern 1: UnknownRecord Replacement](#pattern-1-unknownrecord-replacement)
3. [Pattern 2: LiteralUnion Enhancement](#pattern-2-literalunion-enhancement)
4. [Pattern 3: Simplify Union Types](#pattern-3-simplify-union-types)
5. [Pattern 4: SetOptional API Design](#pattern-4-setoptional-api-design)
6. [Pattern 5: CamelCase String Transformation](#pattern-5-camelcase-string-transformation)
7. [Pattern 6: ReadonlyDeep Immutability](#pattern-6-readonlydeep-immutability)
8. [Pattern 7: PartialDeep Testing Utilities](#pattern-7-partialdeep-testing-utilities)
9. [Multi-Feature Enhancement Strategy](#multi-feature-enhancement-strategy)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Validation Checklist](#validation-checklist)
12. [Search Patterns for Global Application](#search-patterns-for-global-application)

## Overview

Type-fest utilities provide enterprise-grade type safety and developer experience improvements. This document establishes consistent patterns for their use across the codebase.

**Core Principle**: Apply multiple type-fest features together for maximum impact per file ("easy wins" approach).

## Pattern 1: UnknownRecord Replacement

### UnknownRecord - When to Apply

- Replace all instances of `Record<string, unknown>` with `UnknownRecord`
- Use for type-safe property access without index signature issues
- Apply in interfaces, function parameters, and return types

### UnknownRecord - Before/After Examples

#### Example 1: Interface Properties

```typescript
// ❌ Before
interface ErrorInfo {
 context?: Record<string, unknown>;
}

// ✅ After
import type { UnknownRecord } from "type-fest";

interface ErrorInfo {
 context?: UnknownRecord;
}
```

#### Example 2: Function Parameters

```typescript
// ❌ Before
function processData(data: Record<string, unknown>): void {
 // ...
}

// ✅ After
import type { UnknownRecord } from "type-fest";

function processData(data: UnknownRecord): void {
 // ...
}
```

#### Example 3: Type Guards

```typescript
// ❌ Before
export function isObject(value: unknown): value is Record<string, unknown> {
 return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ✅ After
import type { UnknownRecord } from "type-fest";

export function isObject(value: unknown): value is UnknownRecord {
 return typeof value === "object" && value !== null && !Array.isArray(value);
}
```

### UnknownRecord - Benefits

- Avoids TypeScript index signature issues
- Better type safety for property access
- Consistent naming across codebase
- Improved IntelliSense support

## Pattern 2: LiteralUnion Enhancement

### LiteralUnion - When to Apply

- String literal union types that need extensibility
- Theme values, status types, configuration options
- Any fixed set of values that might need custom extensions
- Component size, variant, and styling properties

### LiteralUnion - Before/After Examples

#### Example 1: Theme Component Types (Real Implementation)

```typescript
// ❌ Before - Rigid string unions
export type BadgeSize = "lg" | "md" | "sm" | "xs";
export type ButtonVariant = "primary" | "secondary" | "success" | "error";

// ✅ After - Flexible with autocomplete
import type { LiteralUnion } from "type-fest";

export type BadgeSize = LiteralUnion<"lg" | "md" | "sm" | "xs", string>;
export type ButtonVariant = LiteralUnion<
 "primary" | "secondary" | "success" | "error",
 string
>;
```

#### Example 2: Status Types with Variables

```typescript
// ❌ Before
type MonitorStatus = "down" | "paused" | "pending" | "up";

// ✅ After
import type { LiteralUnion } from "type-fest";

type MonitorStatus = LiteralUnion<"down" | "paused" | "pending" | "up", string>;
```

#### Example 3: Template Variables

```typescript
// ❌ Before
type VariableName = string;

// ✅ After
import type { LiteralUnion } from "type-fest";

type TemplateVariableName = LiteralUnion<
 "busId" | "correlationId" | "count" | "eventName" | "monitorId" | "status",
 string
>;
```

### Object Indexing Considerations

When using LiteralUnion with object indexing, implement type-safe fallback patterns:

```typescript
// ❌ Problematic - Direct indexing
const style = styleMap[variant]; // TypeScript error with LiteralUnion

// ✅ Type-safe fallback pattern
const getStyle = (variantKey: ButtonVariant): React.CSSProperties =>
 styleMap[variantKey as keyof typeof styleMap] || styleMap.primary;

const style = getStyle(variant);
```

### Real-World Usage

When you need extensible theme definitions (for example in `src/theme/components/types.ts`), component types **can** use `LiteralUnion` to allow custom values while preserving autocomplete:

```typescript
// Provides autocomplete but allows custom values
export type BadgeSize = LiteralUnion<"lg" | "md" | "sm" | "xs", string>;

// Component usage examples:
<ThemedBadge size="md" />        // ✅ Autocomplete works
<ThemedBadge size="custom-xl" /> // ✅ Custom value allowed
```

### LiteralUnion - Benefits

- Provides autocomplete for known values
- Allows custom values for extensibility
- Better developer experience
- Type-safe with flexibility
- Backward compatible with existing string union usage

## Pattern 3: Simplify Union Types

### Simplify - When to Apply

- Complex union types with five or more branches
- Types that would benefit from flattened IntelliSense
- Cache value types, configuration unions

### Simplify - Before/After Examples

#### Example 1: Cache Value Types

```typescript
// ❌ Before
export type CacheValue =
 | BaseValidationResult
 | ConfigValue
 | ErrorInfo
 | MonitorData
 | MonitorTypeConfig
 | MonitorTypeConfigArray
 | UIState
 | ValidationResultArray;

// ✅ After
import type { Simplify } from "type-fest";

export type CacheValue = Simplify<
 | BaseValidationResult
 | ConfigValue
 | ErrorInfo
 | MonitorData
 | MonitorTypeConfig
 | MonitorTypeConfigArray
 | UIState
 | ValidationResultArray
>;
```

#### Example 2: Form Data Types

```typescript
// ❌ Before
export type MonitorFormData =
 | HttpMonitorFormData
 | PingMonitorFormData
 | TcpMonitorFormData;

// ✅ After
import type { Simplify } from "type-fest";

export type MonitorFormData = Simplify<
 HttpMonitorFormData | PingMonitorFormData | TcpMonitorFormData
>;
```

### Simplify - Benefits

- Cleaner IntelliSense display
- Better type resolution
- Improved developer experience
- Flattened union member access

## Pattern 4: SetOptional API Design

### SetOptional - When to Apply

- Interfaces where some properties should be optional
- Function parameter objects with defaults
- Configuration objects with optional settings

### SetOptional - Before/After Examples

#### Example 1: Configuration with Defaults

```typescript
// ❌ Before
interface LoggerConfig {
 destination: string;
 level: "debug" | "info" | "warn" | "error";
 maxFileSize: number;
}

// ✅ After
import type { SetOptional } from "type-fest";

type LoggerConfig = SetOptional<
 {
  destination: string;
  level: "debug" | "info" | "warn" | "error";
  maxFileSize: number;
 },
 "level"
>;
```

#### Example 2: Form Data Functions

```typescript
// ❌ Before - All parameters required
function createFormData(
 id: string,
 name: string,
 enabled: boolean,
 interval: number
): FormData;

// ✅ After - Some parameters optional with overloads
import type { SetOptional } from "type-fest";

function createDefaultFormData(): SetOptional<FormData, "enabled" | "interval">;
function createDefaultFormData(data: Partial<FormData>): FormData;
```

### SetOptional - Benefits

- Better API design with logical defaults
- Type-safe optional parameter handling
- Improved function overloading
- Clear intent about required vs optional properties

## Pattern 5: CamelCase String Transformation

### CamelCase - When to Apply

- Converting user-provided strings to valid identifiers
- Creating type-safe property names from dynamic strings
- Template variable processing and code generation
- String transformation with compile-time type safety

### CamelCase - Before/After Examples

#### Example 1: Status String Transformation (Real Implementation)

```typescript
// ❌ Before - Unsafe string transformation
function createStatusClass(status: string): string {
 return `status-${status.toLowerCase().replace(/\s+/g, "")}`;
}

// ✅ After - Type-safe CamelCase transformation
import type { CamelCase } from "type-fest";

/**
 * Creates type-safe camelCase identifiers from status strings. Uses type-fest's
 * CamelCase utility to generate type-safe identifiers from status strings. This
 * demonstrates the practical usage of type-fest string manipulation utilities
 * for runtime type safety.
 */
export const createStatusIdentifier = <T extends string>(
 status: T
): CamelCase<T> => {
 const camelCased = status
  .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
   return index === 0 ? word.toLowerCase() : word.toUpperCase();
  })
  .replace(/\s+/g, "");

 return camelCased as CamelCase<T>;
};
```

#### Example 2: Template Variable Processing

```typescript
// ❌ Before - String manipulation without type safety
function processTemplateVariable(variable: string): string {
 return variable.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

// ✅ After - Type-safe template variable transformation
import type { CamelCase } from "type-fest";

function createTemplateVariable<T extends string>(name: T): CamelCase<T> {
 const processed = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
 return processed as CamelCase<T>;
}
```

### CamelCase - Benefits

- Compile-time type safety for string transformations
- Predictable identifier generation
- Type-safe code generation patterns
- Enhanced IntelliSense for generated identifiers

## Pattern 6: ReadonlyDeep Immutability

### ReadonlyDeep - When to Apply

- Configuration objects that should never be modified
- Fallback data structures requiring immutability
- Constants and default values that need deep protection
- API response data that should remain unchanged

### ReadonlyDeep - Before/After Examples

#### Example 1: Fallback Configuration (Real Implementation)

```typescript
// ❌ Before - Shallow readonly protection
const fallbackConfig: Readonly<FallbackConfig> = {
 retryAttempts: 3,
 timeouts: { connect: 5000, request: 10000 }, // Still mutable
 messages: { error: "Failed", retry: "Retrying..." }, // Still mutable
};

// ✅ After - Deep immutability protection
import type { ReadonlyDeep } from "type-fest";

const fallbackConfig: ReadonlyDeep<FallbackConfig> = {
 retryAttempts: 3,
 timeouts: { connect: 5000, request: 10000 }, // Now readonly
 messages: { error: "Failed", retry: "Retrying..." }, // Now readonly
} as const;
```

#### Example 2: Default Monitor Configuration

```typescript
// ❌ Before - Potential accidental modification
const defaultMonitorConfig = {
 interval: 60000,
 timeout: 5000,
 retries: 3,
 settings: {
  followRedirects: true,
  validateSsl: true,
 },
};

// ✅ After - Deep readonly protection
import type { ReadonlyDeep } from "type-fest";

const defaultMonitorConfig: ReadonlyDeep<MonitorConfig> = {
 interval: 60000,
 timeout: 5000,
 retries: 3,
 settings: {
  followRedirects: true,
  validateSsl: true,
 },
} as const;
```

### ReadonlyDeep - Benefits

- Prevents accidental mutations at any nesting level
- Clear intent for immutable data structures
- Compile-time protection against modifications
- Enhanced type safety for configuration objects

## Pattern 7: PartialDeep Testing Utilities

### PartialDeep - When to Apply

- Test data creation with minimal required properties
- Mock object generation for complex interfaces
- Factory functions for test fixtures
- Partial object matching in tests

### PartialDeep - Before/After Examples

#### Example 1: Test Mock Factory (Real Implementation)

```typescript
// ❌ Before - Unsafe test object creation
function createMockSite(overrides: any = {}): Site {
 return {
  id: "test-id",
  name: "Test Site",
  url: "https://test.com",
  monitors: [],
  ...overrides, // Unsafe - could override with wrong types
 };
}

// ✅ After - Type-safe partial mock creation
import type { PartialDeep, SetOptional } from "type-fest";

export function createMockSite(overrides: PartialDeep<Site> = {}): Site {
 const defaults: SetOptional<Site, "id"> = {
  name: "Test Site",
  url: "https://test.com",
  monitors: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
 };

 return {
  id: `test-${Date.now()}`,
  ...defaults,
  ...overrides,
 } as Site;
}
```

#### Example 2: Component Test Props

```typescript
// ❌ Before - All props required in tests
interface ComponentProps {
 site: Site;
 monitors: Monitor[];
 config: ComponentConfig;
 handlers: EventHandlers;
}

const TestComponent = (props: ComponentProps) => {
 // Component implementation
};

// ✅ After - Flexible test props with defaults
import type { PartialDeep } from "type-fest";

type TestComponentProps = PartialDeep<ComponentProps>;

const createTestProps = (
 overrides: TestComponentProps = {}
): ComponentProps => {
 return {
  site: createMockSite(),
  monitors: [],
  config: defaultConfig,
  handlers: mockHandlers,
  ...overrides,
 };
};
```

#### Example 3: Deep Partial Assertions

```typescript
// ❌ Before - Exact object matching required
expect(result).toEqual({
 site: { id: "123", name: "Test", url: "https://test.com", monitors: [] },
 status: "success",
});

// ✅ After - Flexible deep partial matching
import type { PartialDeep } from "type-fest";

const expectedPartial: PartialDeep<Result> = {
 site: { id: "123", name: "Test" }, // Only test relevant properties
 status: "success",
};

expect(result).toMatchObject(expectedPartial);
```

### PartialDeep - Benefits

- Type-safe test fixture creation
- Flexible mock object generation
- Reduced test boilerplate
- Precise test assertions with partial matching

## Multi-Feature Enhancement Strategy

### "Easy Wins" Approach

Target files where multiple type-fest utilities can be applied together for maximum impact:

1. **Identify Target Files**: Look for files with multiple enhancement opportunities
2. **Apply Multiple Patterns**: Use 2-4 type-fest utilities per file when possible
3. **Validate Collectively**: Test all changes together
4. **Document Impact**: Record improvements achieved

### Example Multi-Feature Enhancement

```typescript
// ❌ Before - Multiple improvement opportunities
interface ComponentState {
 theme: "dark" | "light";
 context?: Record<string, unknown>;
 data?: Record<string, unknown>;
 config: Readonly<{ setting: string; value: number }>;
}

type AllStates = ComponentState | ErrorState | LoadingState;

function createTestState(overrides: any): ComponentState {
 return { theme: "dark", ...overrides };
}

// ✅ After - Multiple type-fest features applied
import type {
 LiteralUnion,
 Simplify,
 UnknownRecord,
 ReadonlyDeep,
 PartialDeep,
} from "type-fest";

interface ComponentState {
 theme: LiteralUnion<"dark" | "light", string>;
 context?: UnknownRecord;
 data?: UnknownRecord;
 config: ReadonlyDeep<{ setting: string; value: number }>;
}

type AllStates = Simplify<ComponentState | ErrorState | LoadingState>;

function createTestState(
 overrides: PartialDeep<ComponentState> = {}
): ComponentState {
 return {
  theme: "dark",
  config: { setting: "default", value: 0 },
  ...overrides,
 } as ComponentState;
}
```

## Implementation Guidelines

### 1. Import Management

- Import only needed type-fest utilities
- Use `import type` for type-only imports
- Group type-fest imports together

#### Import example

```typescript
import type {
 CamelCase,
 LiteralUnion,
 PartialDeep,
 ReadonlyDeep,
 SetOptional,
 Simplify,
 UnknownRecord,
} from "type-fest";
```

### 2. File Enhancement Order

1. Add type-fest imports
2. Apply UnknownRecord replacements
3. Enhance string literals with LiteralUnion
4. Apply Simplify to union types
5. Add SetOptional where beneficial
6. Use ReadonlyDeep for immutable data
7. Apply PartialDeep in test utilities
8. Use CamelCase for string transformations

### 3. Documentation Requirements

- Update TSDoc comments when types change
- Add examples showing enhanced autocomplete
- Document benefits of type-fest usage

### 4. Testing Strategy

- Run TypeScript type checking after each enhancement
- Verify no compilation errors
- Test enhanced IntelliSense functionality
- Validate linting passes

## Validation Checklist

### Before Implementation

- [ ] File has multiple type enhancement opportunities
- [ ] Changes align with existing codebase patterns
- [ ] TSDoc documentation is planned

### During Implementation

- [ ] Type-fest imports added correctly

- [ ] All Record\\

  \<string, unknown=""> replaced with UnknownRecord\</string,>

- [ ] String literal unions enhanced with LiteralUnion

- [ ] Complex unions simplified with Simplify

- [ ] Optional parameters optimized with SetOptional

- [ ] Immutable data protected with ReadonlyDeep

- [ ] Test utilities use PartialDeep for flexibility

- [ ] String transformations use CamelCase where applicable

### After Implementation

- [ ] TypeScript compilation passes
- [ ] ESLint validation passes
- [ ] No unused imports
- [ ] Enhanced IntelliSense verified
- [ ] Documentation updated
- [ ] Changes tested in context

### Global Consistency

- [ ] Pattern applied consistently across similar files

- [ ] No remaining Record\\

  \<string, unknown=""> instances\</string,>

- [ ] All eligible string unions use LiteralUnion

- [ ] Complex unions use Simplify where beneficial

- [ ] Optional parameters use SetOptional appropriately

- [ ] Immutable configurations use ReadonlyDeep

- [ ] Test utilities leverage PartialDeep patterns

- [ ] String transformations use CamelCase for type safety

## Search Patterns for Global Application

### Finding Enhancement Opportunities

```bash
# Find Record<string, unknown> instances
grep -r "Record<string, unknown>" src/ shared/ electron/

# Find string literal unions
grep -r '"\w\+" \| "\w\+"' src/ shared/ electron/

# Find complex union types (5+ members)
grep -rP '\|\s*\w+\s*\|\s*\w+\s*\|\s*\w+\s*\|\s*\w+\s*\|' src/ shared/ electron/

# Find interfaces with many optional properties
grep -rA 10 -B 2 'interface.*{' src/ shared/ electron/ | grep -C 3 '?:'
```

### Files to Prioritize

1. Core type definition files (`/types/`)
2. Utility files with type guards (`/utils/`)
3. Interface files with multiple patterns
4. Configuration and state management files

This documentation ensures consistent, high-quality type-fest integration across the entire codebase while maintaining enterprise-grade type safety and developer experience.

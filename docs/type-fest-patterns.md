# Type-fest Integration Patterns

This document provides comprehensive patterns for integrating type-fest utilities consistently across the Uptime-Watcher codebase. These patterns ensure type safety, better developer experience, and maintainable code.

## Table of Contents

- [Overview](#overview)
- [Pattern 1: UnknownRecord Replacement](#pattern-1-unknownrecord-replacement)
- [Pattern 2: LiteralUnion Enhancement](#pattern-2-literalunion-enhancement)
- [Pattern 3: Simplify Union Types](#pattern-3-simplify-union-types)
- [Pattern 4: SetOptional API Design](#pattern-4-setoptional-api-design)
- [Multi-Feature Enhancement Strategy](#multi-feature-enhancement-strategy)
- [Implementation Guidelines](#implementation-guidelines)
- [Validation Checklist](#validation-checklist)

## Overview

Type-fest utilities provide enterprise-grade type safety and developer experience improvements. This document establishes consistent patterns for their use across the codebase.

**Core Principle**: Apply multiple type-fest features together for maximum impact per file ("easy wins" approach).

## Pattern 1: UnknownRecord Replacement

### When to Apply

- Replace all instances of `Record<string, unknown>` with `UnknownRecord`
- Use for type-safe property access without index signature issues
- Apply in interfaces, function parameters, and return types

### Before/After Examples

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

### Benefits

- Avoids TypeScript index signature issues
- Better type safety for property access
- Consistent naming across codebase
- Improved IntelliSense support

## Pattern 2: LiteralUnion Enhancement

### When to Apply

- String literal union types that need extensibility
- Theme values, status types, configuration options
- Any fixed set of values that might need custom extensions
- Component size, variant, and styling properties

### Before/After Examples

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

In `src/theme/components/types.ts`, all theme component types now use LiteralUnion:

```typescript
// Provides autocomplete but allows custom values
export type BadgeSize = LiteralUnion<"lg" | "md" | "sm" | "xs", string>;

// Component usage examples:
<ThemedBadge size="md" />        // ✅ Autocomplete works
<ThemedBadge size="custom-xl" /> // ✅ Custom value allowed
```

### Benefits

- Provides autocomplete for known values
- Allows custom values for extensibility
- Better developer experience
- Type-safe with flexibility
- Backward compatible with existing string union usage

## Pattern 3: Simplify Union Types

### When to Apply

- Complex union types with many branches
- Types that would benefit from flattened IntelliSense
- Cache value types, configuration unions

### Before/After Examples

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

### Benefits

- Cleaner IntelliSense display
- Better type resolution
- Improved developer experience
- Flattened union member access

## Pattern 4: SetOptional API Design

### When to Apply

- Interfaces where some properties should be optional
- Function parameter objects with defaults
- Configuration objects with optional settings

### Before/After Examples

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

### Benefits

- Better API design with logical defaults
- Type-safe optional parameter handling
- Improved function overloading
- Clear intent about required vs optional properties

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
}

type AllStates = ComponentState | ErrorState | LoadingState;

// ✅ After - Multiple type-fest features applied
import type { LiteralUnion, Simplify, UnknownRecord } from "type-fest";

interface ComponentState {
 theme: LiteralUnion<"dark" | "light", string>;
 context?: UnknownRecord;
 data?: UnknownRecord;
}

type AllStates = Simplify<ComponentState | ErrorState | LoadingState>;
```

## Implementation Guidelines

### 1. Import Management

- Import only needed type-fest utilities
- Use `import type` for type-only imports
- Group type-fest imports together

```typescript
import type { LiteralUnion, Simplify, UnknownRecord } from "type-fest";
```

### 2. File Enhancement Order

1. Add type-fest imports
2. Apply UnknownRecord replacements
3. Enhance with LiteralUnion
4. Apply Simplify to union types
5. Add SetOptional where beneficial

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
- [ ] All Record<string, unknown> replaced with UnknownRecord
- [ ] String literal unions enhanced with LiteralUnion
- [ ] Complex unions simplified with Simplify
- [ ] Optional parameters optimized with SetOptional

### After Implementation

- [ ] TypeScript compilation passes
- [ ] ESLint validation passes
- [ ] No unused imports
- [ ] Enhanced IntelliSense verified
- [ ] Documentation updated
- [ ] Changes tested in context

### Global Consistency

- [ ] Pattern applied consistently across similar files
- [ ] No remaining Record<string, unknown> instances
- [ ] All eligible string unions use LiteralUnion
- [ ] Complex unions use Simplify where beneficial
- [ ] Optional parameters use SetOptional appropriately

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

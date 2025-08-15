# Code Complexity Reduction Plan

**Comprehensive strategy for addressing 24 medium-complexity code issues**

## Executive Summary

This document outlines a systematic approach to reduce code complexity across the Uptime-Watcher codebase. The issues range from high cyclomatic complexity functions to files with excessive lines of code and functions with too many parameters.

## Complexity Issues Analysis

### 📊 **Issue Categories**

1. **High Cyclomatic Complexity (15 issues)** - Functions with too many decision points
2. **Excessive Line Count (7 issues)** - Functions/files that are too long
3. **Parameter Overload (1 issue)** - Functions with too many parameters
4. **File Size (1 issue)** - Files with too many lines

### 🎯 **Priority Classification**

**HIGH PRIORITY** (Address First):

- Functions with cyclomatic complexity ≥13
- Functions with ≥70 lines of code
- Files with ≥900 lines of code

**MEDIUM PRIORITY** (Address Second):

- Functions with cyclomatic complexity 9-12
- Functions with 50-69 lines of code
- Functions with ≥8 parameters

**LOW PRIORITY** (Address Last):

- Edge case complexity issues in test files

---

## Detailed Reduction Strategies

### 🔥 **HIGH PRIORITY FIXES**

#### 1. `useThemeStyles.ts` - Anonymous Function (Complexity: 15, Lines: 95)

**Location:** `src/hooks/useThemeStyles.ts:108`

**Issues:**

- Cyclomatic complexity: 15 (limit: 8)
- Line count: 95 (limit: 50)

**Strategy:**

```typescript
// BEFORE: Single massive useMemo with all theme logic
const styles = useMemo<ThemeStyles>(() => {
  // 95 lines of complex theme generation
}, [theme, ...]);

// AFTER: Break into focused, composable hooks
const baseStyles = useBaseThemeStyles(theme);
const componentStyles = useComponentThemeStyles(theme);
const statusStyles = useStatusThemeStyles(theme);
const layoutStyles = useLayoutThemeStyles(theme);

const styles = useMemo<ThemeStyles>(() => ({
  ...baseStyles,
  ...componentStyles,
  ...statusStyles,
  ...layoutStyles,
}), [baseStyles, componentStyles, statusStyles, layoutStyles]);
```

**Implementation Plan:**

1. Extract theme generation into separate hooks by category
2. Create `useBaseThemeStyles()` for core styles
3. Create `useComponentThemeStyles()` for component-specific styles
4. Create `useStatusThemeStyles()` for status-related styles
5. Create `useLayoutThemeStyles()` for layout and spacing styles
6. Use composition in main hook

**Benefits:**

- Reduces complexity from 15 to ~3 per function
- Reduces line count from 95 to ~20 per function
- Improves testability and maintainability
- Enables style reuse across components

#### 2. `IpcService.ts` - Object.keys Function (Complexity: 13)

**Location:** `electron/services/ipc/IpcService.ts:149`

**Strategy:**

```typescript
// BEFORE: Complex inline validation logic
unexpectedProperties: (Object.keys(unexpectedProperties),
 // AFTER: Extract validation utilities
 class ConfigValidator {
  static validateExpectedProperties(
   config: unknown,
   expectedKeys: string[]
  ): ValidationResult {
   // Focused validation logic
  }

  static formatUnexpectedProperties(
   unexpected: Record<string, unknown>
  ): string[] {
   // Simple, focused formatting
  }
 });
```

**Implementation Plan:**

1. Create dedicated `ConfigValidator` class
2. Extract property validation logic
3. Create focused methods for each validation concern
4. Use dependency injection for validation rules

#### 3. `createTwoStringValidator` - Function (Complexity: 11)

**Location:** `electron/services/ipc/validators.ts:58`

**Strategy:**

```typescript
// BEFORE: Complex validation with nested conditions
function createTwoStringValidator(
 firstParamName: string,
 secondParamName: string
) {
 // 11 decision points in one function
}

// AFTER: Composition of simple validators
const createTwoStringValidator = (
 first: string,
 second: string
): IpcParameterValidator =>
 composeValidators([
  createSingleStringValidator(first),
  createSingleStringValidator(second),
  createParameterCountValidator(2),
 ]);
```

**Implementation Plan:**

1. Create atomic validator functions
2. Build composition utilities
3. Replace complex validators with composed simple ones
4. Add comprehensive validator tests

#### 4. Large Test Files (997-964 lines)

**Files:**

- `shared/test/validation/schemas.comprehensive.test.ts` (997 lines)
- `shared/validation/schemas.test.ts` (964 lines)

**Strategy:**

```typescript
// BEFORE: Monolithic test files
describe("All Schema Tests", () => {
 // 997 lines of tests
});

// AFTER: Modular test organization
// schemas.test.ts (entry point)
// schemas/validation.test.ts
// schemas/types.test.ts
// schemas/edge-cases.test.ts
// schemas/performance.test.ts
```

**Implementation Plan:**

1. Split large test files by functional domain
2. Create test utilities for common patterns
3. Use test factories for repetitive test cases
4. Maintain test coverage while improving organization

### ⚡ **MEDIUM PRIORITY FIXES**

#### 5. `useAddSiteForm.ts` - isFormValid Function (Complexity: 11, Lines: 75)

**Location:** `src/components/SiteDetails/useAddSiteForm.ts:151`

**Strategy:**

```typescript
// BEFORE: Complex validation logic in hook
const isFormValid = useCallback(() => {
 // 11 decision points for form validation
}, []);

// AFTER: Extract validation logic
const formValidators = {
 validateSiteInfo: (name: string, id: string) => boolean,
 validateMonitorConfig: (type: MonitorType, config: MonitorConfig) => boolean,
 validateRequiredFields: (formData: FormData) => boolean,
};

const isFormValid = useCallback(
 () =>
  formValidators.validateSiteInfo(name, siteId) &&
  formValidators.validateMonitorConfig(monitorType, getMonitorConfig()) &&
  formValidators.validateRequiredFields(getFormData()),
 [name, siteId, monitorType /* other deps */]
);
```

#### 6. `SiteCardHeader` - Parameter Overload (10 parameters)

**Location:** `src/components/Dashboard/SiteCard/SiteCardHeader.tsx:62`

**Strategy:**

```typescript
// BEFORE: Too many individual parameters
export const SiteCardHeader = React.memo(function SiteCardHeader({
  param1, param2, param3, param4, param5, param6, param7, param8, param9, param10
}: Props) => {

// AFTER: Grouped configuration objects
interface SiteCardHeaderProps {
  site: SiteInfo;
  monitoring: MonitoringConfig;
  interactions: InteractionHandlers;
  display: DisplayOptions;
}
```

**Implementation Plan:**

1. Group related parameters into logical objects
2. Create type-safe configuration interfaces
3. Maintain backward compatibility during transition
4. Update all call sites systematically

#### 7. Database Validation Functions (Complexity: 9-12)

**Files:** `shared/types/database.ts`

- `isValidMonitorRow` (complexity: 9)
- `isValidHistoryRow` (complexity: 12)

**Strategy:**

```typescript
// BEFORE: Monolithic validation functions
export function isValidMonitorRow(obj: unknown): obj is MonitorRow {
 // 9-12 validation checks in one function
}

// AFTER: Composable validation
const monitorRowValidators = {
 hasRequiredFields: (obj: unknown) => boolean,
 hasValidTypes: (obj: MonitorRow) => boolean,
 hasValidConstraints: (obj: MonitorRow) => boolean,
};

export const isValidMonitorRow = (obj: unknown): obj is MonitorRow =>
 monitorRowValidators.hasRequiredFields(obj) &&
 monitorRowValidators.hasValidTypes(obj as MonitorRow) &&
 monitorRowValidators.hasValidConstraints(obj as MonitorRow);
```

### 🔧 **IMPLEMENTATION APPROACH**

#### Phase 1: Infrastructure (Week 1-2)

1. **Create Validation Utilities**
   - Build composable validator functions
   - Create validation result types
   - Add comprehensive validator tests

2. **Create Theme Utilities**
   - Extract theme generation utilities
   - Create theme composition helpers
   - Build theme testing utilities

3. **Set Up Refactoring Tools**
   - Configure complexity linting rules
   - Set up automated refactoring helpers
   - Create component parameter analysis tools

#### Phase 2: High Priority Fixes (Week 3-4)

1. **Address Cyclomatic Complexity ≥13**
   - Refactor `useThemeStyles` hook system
   - Simplify IPC validation logic
   - Break down complex validator functions

2. **Reduce Large Functions (≥70 lines)**
   - Split theme generation logic
   - Extract form validation utilities
   - Modularize configuration handling

#### Phase 3: Medium Priority Fixes (Week 5-6)

1. **Parameter Reduction**
   - Group SiteCardHeader parameters
   - Create configuration objects
   - Update component interfaces

2. **Moderate Complexity Functions**
   - Simplify database validation
   - Extract form logic utilities
   - Refactor monitoring functions

#### Phase 4: File Organization (Week 7)

1. **Split Large Files**
   - Reorganize test files by domain
   - Split component files logically
   - Create focused utility modules

2. **Test Organization**
   - Create test utilities and factories
   - Split large test suites
   - Improve test maintainability

### 📋 **QUALITY ASSURANCE**

#### Before Each Refactor:

- [ ] Run full test suite
- [ ] Measure current complexity metrics
- [ ] Document current behavior
- [ ] Create refactoring tests

#### During Refactoring:

- [ ] Maintain test coverage ≥95%
- [ ] Verify no behavioral changes
- [ ] Check TypeScript compilation
- [ ] Validate performance impact

#### After Each Refactor:

- [ ] Verify complexity reduction
- [ ] Run comprehensive test suite
- [ ] Performance regression testing
- [ ] Code review and documentation

### 🎯 **SUCCESS METRICS**

#### Complexity Targets:

- **Cyclomatic Complexity**: All functions ≤8
- **Function Length**: All functions ≤50 lines
- **File Length**: All files ≤500 lines
- **Parameter Count**: All functions ≤8 parameters

#### Quality Targets:

- **Test Coverage**: Maintain ≥95%
- **TypeScript**: Zero compilation errors
- **Performance**: No regression >5%
- **Bundle Size**: No increase >2%

### 🚀 **BENEFITS**

#### Developer Experience:

- **Easier Debugging**: Smaller, focused functions
- **Better Testing**: Atomic, testable units
- **Faster Development**: Clear, understandable code
- **Reduced Bugs**: Lower complexity = fewer edge cases

#### Maintainability:

- **Code Reuse**: Composable utilities
- **Easier Changes**: Focused modification points
- **Better Documentation**: Self-documenting smaller functions
- **Team Productivity**: Faster onboarding and development

#### Technical:

- **Performance**: Potential optimization opportunities
- **Bundle Optimization**: Tree-shaking friendly structure
- **Type Safety**: Better TypeScript inference
- **Testing**: Improved test coverage and quality

---

## Conclusion

This systematic approach to complexity reduction will significantly improve code maintainability while preserving functionality. The phased implementation ensures minimal disruption to development workflow while achieving measurable complexity improvements.

**Next Step**: Begin with Phase 1 infrastructure setup to establish the foundation for successful refactoring.

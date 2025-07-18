# TSDoc Documentation Standards

<!-- markdownlint-disable -->

This document outlines the standardized TSDoc documentation patterns for the Uptime Watcher application.

## Documentation Quality Standards

### Required Documentation Levels

#### Public APIs (Functions, Classes, Hooks, Components)

**MUST include:**

- Clear description of purpose and behavior
- `@param` for all parameters with types and descriptions
- `@returns` for return values with type and description
- `@example` with realistic usage example
- `@public` visibility marker

**SHOULD include:**

- `@remarks` for additional context or implementation details
- `@see` for related functions or documentation
- `@throws` for potential errors (async functions)

#### Complex Functions (10+ lines, business logic)

**MUST include:**

- Description and purpose
- `@param` and `@returns` documentation
- `@remarks` for algorithm explanation or important notes

**SHOULD include:**

- `@example` for complex usage patterns

#### Simple Utility Functions (1-5 lines)

**MUST include:**

- Brief description
- `@param` and `@returns` if parameters exist

#### Interfaces and Types

**MUST include:**

- Description of the interface purpose
- Property documentation for complex objects

**SHOULD include:**

- `@example` for interface usage patterns

## TSDoc Patterns by Category

### Store Functions

````typescript
/**
 * Creates standardized base store properties for error handling and loading states.
 * Provides consistent error management patterns across all Zustand stores.
 *
 * @remarks
 * This function ensures all stores have uniform error handling capabilities,
 * including loading states, error clearing, and centralized error management.
 * Use this as the foundation for all store implementations.
 *
 * @param set - Zustand setter function for updating store state
 * @returns Base store properties with error handling methods
 *
 * @example
 * ```typescript
 * const useMyStore = create<MyStore>((set, get) => ({
 *   ...createBaseStore(set),
 *   // Custom store properties
 *   data: [],
 *   fetchData: async () => { ... }
 * }));
 * ```
 *
 * @public
 */
export const createBaseStore = <T extends BaseStore>(
 set: (partial: Partial<T>) => void
): Pick<T, "clearError" | "isLoading" | "lastError" | "setError" | "setLoading"> => {
 // Implementation
};
````

### Component Hooks

````typescript
/**
 * Custom hook for managing selected site state across store boundaries.
 *
 * @remarks
 * Provides a clean interface for accessing the currently selected site by
 * coordinating between the UI store (which tracks selection) and the sites
 * store (which contains site data). The hook automatically updates when either
 * the selected site ID changes or when the sites data is updated.
 *
 * @returns The currently selected site object, or undefined if no site is selected
 *
 * @example
 * ```typescript
 * function SiteDetailsComponent() {
 *   const selectedSite = useSelectedSite();
 *
 *   if (!selectedSite) {
 *     return <div>No site selected</div>;
 *   }
 *
 *   return <div>Site: {selectedSite.name}</div>;
 * }
 * ```
 *
 * @public
 */
export function useSelectedSite(): Site | undefined {
 // Implementation
}
````

### Utility Functions

````typescript
/**
 * Validates timeout value in milliseconds against defined constraints.
 *
 * @param timeoutMs - Timeout value in milliseconds to validate
 * @returns True if the timeout is within valid range, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validateTimeoutMs(5000); // true
 * const isInvalid = validateTimeoutMs(-100); // false
 * ```
 *
 * @public
 */
export function validateTimeoutMs(timeoutMs: number): boolean {
 // Implementation
}
````

### Async Functions with Error Handling

````typescript
/**
 * Validates monitor data using the backend registry system.
 *
 * @remarks
 * This function provides centralized validation for monitor configurations
 * by communicating with the backend registry. It ensures consistency between
 * frontend validation and backend validation rules.
 *
 * @param type - Monitor type to validate against
 * @param data - Monitor configuration data to validate
 * @returns Promise resolving to validation result with errors array
 *
 * @throws {Error} When backend communication fails or validation service is unavailable
 *
 * @example
 * ```typescript
 * const result = await validateMonitorData('http', {
 *   url: 'https://example.com',
 *   timeout: 5000
 * });
 *
 * if (!result.success) {
 *   console.error('Validation failed:', result.errors);
 * }
 * ```
 *
 * @public
 */
export async function validateMonitorData(
 type: MonitorType,
 data: Record<string, unknown>
): Promise<{ errors: string[]; success: boolean }> {
 // Implementation
}
````

### Interface Documentation

````typescript
/**
 * Configuration interface for site monitoring operations.
 *
 * @remarks
 * This interface defines the complete structure for site monitoring
 * configurations, including all monitor types and their specific settings.
 * Used throughout the application for type-safe monitor management.
 *
 * @example
 * ```typescript
 * const httpMonitor: Monitor = {
 *   id: 'monitor-123',
 *   type: 'http',
 *   url: 'https://example.com',
 *   checkInterval: 60000,
 *   status: 'up',
 *   monitoring: true
 * };
 * ```
 *
 * @public
 */
export interface Monitor {
 /** Unique identifier for the monitor */
 id: string;
 /** Type of monitoring (http, port, etc.) */
 type: MonitorType;
 /** Current operational status */
 status: "up" | "down" | "pending";
 /** Whether monitoring is currently active */
 monitoring: boolean;
 /** Check interval in milliseconds */
 checkInterval: number;
 /** Optional URL for HTTP monitors */
 url?: string;
 /** Optional host for port monitors */
 host?: string;
 /** Optional port number for port monitors */
 port?: number;
}
````

## Documentation Requirements by Function Type

### Store Actions (withErrorHandling operations)

- **Description**: Purpose and side effects
- **@param**: All parameters including options objects
- **@returns**: Return type (usually Promise<void> or specific result)
- **@throws**: When using async operations
- **@example**: Typical usage in component

### React Components

- **Description**: Component purpose and key features
- **@param props**: Props interface with descriptions
- **@returns**: JSX element description
- **@example**: Basic usage with props

### Custom Hooks

- **Description**: Hook purpose and state management
- **@returns**: Return type and behavior description
- **@remarks**: Cross-store coordination or complex logic
- **@example**: Component usage pattern

### Validation Functions

- **Description**: What is being validated
- **@param**: Input parameters and expected formats
- **@returns**: Validation result format
- **@example**: Valid and invalid input examples

## Common Patterns to Follow

### 1. Progressive Detail

- **Short description**: One-line summary (required)
- **@remarks**: Detailed explanation (for complex functions)
- **@example**: Realistic usage (required for public APIs)

### 2. Consistent Language

- Use active voice: "Validates data" not "Data is validated"
- Be specific: "timeout in milliseconds" not "timeout value"
- Use consistent terminology across related functions

### 3. Practical Examples

- Show realistic usage scenarios
- Include error handling when relevant
- Use actual interfaces and types from the codebase

### 4. Complete Type Information

- Document all parameters with types
- Specify return types clearly
- Use union types and optional parameters correctly

## Quality Checklist

### Before Committing Code

- [ ] All public functions have TSDoc comments
- [ ] All parameters are documented with types
- [ ] Return values are documented
- [ ] Complex functions have @remarks sections
- [ ] Public APIs have @example sections
- [ ] Async functions document potential errors
- [ ] Interface properties are documented
- [ ] Examples use realistic data and patterns

### Code Review Focus

- [ ] Documentation matches actual behavior
- [ ] Examples compile and run correctly
- [ ] Technical terminology is consistent
- [ ] Links and references are accurate
- [ ] Documentation follows established patterns

## Tools and Validation

### TSDoc Linting

The project uses TSDoc linting to enforce documentation standards:

- Missing documentation warnings
- Malformed @param/@returns warnings
- Incorrect tag usage warnings

### Documentation Generation

TSDoc comments can be used to generate API documentation:

- Public API reference
- Component documentation
- Hook usage guides

## Examples Repository

### Excellent Documentation Examples

- `src/hooks/useSelectedSite.ts` - Complete hook documentation
- `src/stores/utils.ts` - Store utility documentation
- `src/utils/monitorValidation.ts` - Async function documentation

### Pattern Templates

Use these as templates for new code:

- Store action functions: Follow `useSiteOperations.ts` patterns
- Custom hooks: Follow `useSelectedSite.ts` patterns
- Utility functions: Follow `timeoutUtils.ts` patterns
- Interfaces: Follow `types.ts` patterns

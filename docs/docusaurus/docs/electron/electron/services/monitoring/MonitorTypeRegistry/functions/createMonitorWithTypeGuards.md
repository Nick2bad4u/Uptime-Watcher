# Function: createMonitorWithTypeGuards()

> **createMonitorWithTypeGuards**(`type`, `data`): `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:353](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/MonitorTypeRegistry.ts#L353)

Create monitor object with runtime type validation.

## Parameters

### type

`string`

Monitor type string to validate

### data

`Record`\<`string`, `unknown`\>

Monitor data to merge with defaults

## Returns

`object`

Validation result with created monitor or errors

### errors

> **errors**: `string`[]

### monitor?

> `optional` **monitor**: `Record`\<`string`, `unknown`\>

### success

> **success**: `boolean`

## Remarks

Provides runtime type safety by validating monitor type and creating
properly structured monitor objects with sensible defaults.

Process:
1. Validates monitor type using internal validation
2. Creates monitor object with default values
3. Merges provided data with defaults
4. Returns structured result for error handling

## Example

```typescript
const result = createMonitorWithTypeGuards("http", { url: "https://example.com" });
if (result.success) {
  console.log("Created monitor:", result.monitor);
} else {
  console.error("Validation errors:", result.errors);
}
```

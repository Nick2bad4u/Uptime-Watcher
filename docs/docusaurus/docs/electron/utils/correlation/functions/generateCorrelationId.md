# Function: generateCorrelationId()

> **generateCorrelationId**(): `string`

Defined in: [electron/utils/correlation.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/correlation.ts#L81)

Generate a unique correlation ID for tracking operations. Uses
crypto.randomBytes for cryptographically secure random values.

## Returns

`string`

A unique correlation ID string (16 hex characters)

## Example

```typescript
const correlationId = generateCorrelationId();
console.log(correlationId); // "a1b2c3d4e5f67890"
```

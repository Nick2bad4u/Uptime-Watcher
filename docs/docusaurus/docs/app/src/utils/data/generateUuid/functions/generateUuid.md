# Function: generateUuid()

> **generateUuid**(): `string`

Defined in: [src/utils/data/generateUuid.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/data/generateUuid.ts#L22)

Generate a unique identifier string using the modern crypto.randomUUID API.

## Returns

`string`

A UUID string in standard format

## Remarks

Uses the native crypto.randomUUID() method which is available in modern
Node.js (14.17.0+) and Electron environments. Since we target modern
environments, no fallback is needed.

## Example

```typescript
const id = generateUuid();
// Returns: "123e4567-e89b-12d3-a456-426614174000"
```

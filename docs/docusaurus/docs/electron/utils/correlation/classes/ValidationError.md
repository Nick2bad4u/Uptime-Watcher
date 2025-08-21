# Class: ValidationError

Defined in: [electron/utils/correlation.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/correlation.ts#L55)

Validation error class for business rule violations. Extends Error with
additional validation context.

## Example

```typescript
throw new ValidationError([
    "Invalid email format",
    "Password too short",
]);
```

## Param

Array of validation error messages

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new ValidationError**(`errors`): `ValidationError`

Defined in: [electron/utils/correlation.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/correlation.ts#L61)

#### Parameters

##### errors

`string`[]

#### Returns

`ValidationError`

#### Overrides

`Error.constructor`

## Properties

### errors

> **errors**: `string`[]

Defined in: [electron/utils/correlation.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/correlation.ts#L59)

Array of validation error messages

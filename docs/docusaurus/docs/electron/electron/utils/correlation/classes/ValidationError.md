# Class: ValidationError

Defined in: [electron/utils/correlation.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/correlation.ts#L22)

Validation error class for business rule violations.
Extends Error with additional validation context.

## Param

Array of validation error messages

## Example

```typescript
throw new ValidationError(['Invalid email format', 'Password too short']);
```

## Extends

- [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

## Constructors

### Constructor

> **new ValidationError**(`errors`): `ValidationError`

Defined in: [electron/utils/correlation.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/correlation.ts#L23)

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

Defined in: [electron/utils/correlation.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/correlation.ts#L23)

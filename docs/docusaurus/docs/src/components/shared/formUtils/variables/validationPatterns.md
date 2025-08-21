# Variable: validationPatterns

> `const` **validationPatterns**: `object`

Defined in: [src/components/shared/formUtils.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/shared/formUtils.ts#L133)

Common validation patterns for form fields

## Type declaration

### nonEmptyString()

> `readonly` **nonEmptyString**: (`value`) => `boolean`

Validates that a string is not empty after trimming

#### Parameters

##### value

`string`

#### Returns

`boolean`

### numberInRange()

> `readonly` **numberInRange**: (`min`, `max`) => (`value`) => `boolean`

Validates that a number is within a specified range

#### Parameters

##### min

`number`

##### max

`number`

#### Returns

> (`value`): `boolean`

##### Parameters

###### value

`number`

##### Returns

`boolean`

### oneOfNumbers()

> `readonly` **oneOfNumbers**: (`allowedValues`) => (`value`) => `boolean`

Validates that a value is one of the allowed numbers

#### Parameters

##### allowedValues

`number`[]

#### Returns

> (`value`): `boolean`

##### Parameters

###### value

`number`

##### Returns

`boolean`

### oneOfStrings()

> `readonly` **oneOfStrings**: (`allowedValues`) => (`value`) => `boolean`

Validates that a value is one of the allowed options

#### Parameters

##### allowedValues

`string`[]

#### Returns

> (`value`): `boolean`

##### Parameters

###### value

`string`

##### Returns

`boolean`

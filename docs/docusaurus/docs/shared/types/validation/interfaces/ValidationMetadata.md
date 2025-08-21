# Interface: ValidationMetadata

Defined in: [shared/types/validation.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L82)

Common metadata fields included in validation results.

## Remarks

Provides type safety for commonly used metadata fields while allowing
additional arbitrary fields.

## Indexable

\[`key`: `string`\]: `unknown`

Additional arbitrary metadata

## Properties

### fieldName?

> `optional` **fieldName**: `string`

Defined in: [shared/types/validation.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L86)

The specific field being validated

***

### monitorCount?

> `optional` **monitorCount**: `number`

Defined in: [shared/types/validation.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L88)

Number of monitors when validating site data

***

### monitorType?

> `optional` **monitorType**: `string`

Defined in: [shared/types/validation.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L90)

The monitor type being validated

***

### siteIdentifier?

> `optional` **siteIdentifier**: `string`

Defined in: [shared/types/validation.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L92)

Site identifier when validating site data

***

### validatedDataSize?

> `optional` **validatedDataSize**: `number`

Defined in: [shared/types/validation.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L94)

Size of the validated data in bytes/characters

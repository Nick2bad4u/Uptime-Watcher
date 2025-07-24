# Class: SiteValidator

Defined in: [electron/managers/validators/SiteValidator.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/validators/SiteValidator.ts#L35)

Validates site configuration according to business rules.

## Remarks

Focused on site-level validation concerns including identifier validation
and monitor array validation.

## Constructors

### Constructor

> **new SiteValidator**(): `SiteValidator`

Defined in: [electron/managers/validators/SiteValidator.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/validators/SiteValidator.ts#L39)

#### Returns

`SiteValidator`

## Methods

### shouldIncludeInExport()

> **shouldIncludeInExport**(`site`): `boolean`

Defined in: [electron/managers/validators/SiteValidator.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/validators/SiteValidator.ts#L54)

Business rule: Determine if a site should be included in exports.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site to evaluate for export inclusion

#### Returns

`boolean`

Whether the site should be included in exports

#### Remarks

Business rule implementation: Sites are included in exports only if they have
a valid, non-empty string identifier. This ensures exported data integrity
and prevents corruption from sites with invalid identifiers.

***

### validateSiteConfiguration()

> **validateSiteConfiguration**(`site`): [`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Defined in: [electron/managers/validators/SiteValidator.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/managers/validators/SiteValidator.ts#L65)

Validate complete site configuration.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site configuration to validate

#### Returns

[`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Validation result containing errors and validity status

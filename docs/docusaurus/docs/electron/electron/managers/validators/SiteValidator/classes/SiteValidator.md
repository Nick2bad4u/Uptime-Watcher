# Class: SiteValidator

Defined in: [electron/managers/validators/SiteValidator.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/SiteValidator.ts#L46)

Validates site configuration according to business rules.

## Remarks

Focused on site-level validation concerns including identifier validation and monitor array validation.
Delegates monitor validation to [MonitorValidator](../../MonitorValidator/classes/MonitorValidator.md) for comprehensive monitor checks.

## Example

```typescript
const validator = new SiteValidator();
const result = validator.validateSiteConfiguration(site);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

## Constructors

### Constructor

> **new SiteValidator**(): `SiteValidator`

Defined in: [electron/managers/validators/SiteValidator.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/SiteValidator.ts#L62)

Create a new SiteValidator instance.

#### Returns

`SiteValidator`

#### Remarks

Instantiates a [MonitorValidator](../../MonitorValidator/classes/MonitorValidator.md) for monitor validation delegation.

## Methods

### shouldIncludeInExport()

> **shouldIncludeInExport**(`site`): `boolean`

Defined in: [electron/managers/validators/SiteValidator.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/SiteValidator.ts#L83)

Determines if a site should be included in exports according to business rules.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site to evaluate for export inclusion.

#### Returns

`boolean`

Whether the site should be included in exports.

#### Remarks

Sites are included in exports only if they have a valid, non-empty string identifier.
This ensures exported data integrity and prevents corruption from sites with invalid identifiers.

#### Example

```typescript
if (validator.shouldIncludeInExport(site)) {
  exportSite(site);
}
```

***

### validateSiteConfiguration()

> **validateSiteConfiguration**(`site`): [`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Defined in: [electron/managers/validators/SiteValidator.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/SiteValidator.ts#L105)

Validates complete site configuration according to business rules.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site configuration to validate.

#### Returns

[`ValidationResult`](../../interfaces/interfaces/ValidationResult.md)

Validation result containing errors and validity status.

#### Remarks

Performs identifier and monitor array validation, delegating monitor validation to [MonitorValidator](../../MonitorValidator/classes/MonitorValidator.md).

#### Example

```typescript
const result = validator.validateSiteConfiguration(site);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

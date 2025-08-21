# Interface: SiteFormData

Defined in: [shared/types/formData.ts:201](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L201)

Complete site form data including site information and monitor configuration.

## Remarks

Used when creating a new site with an initial monitor or adding a monitor to
an existing site.

## Properties

### identifier

> **identifier**: `string`

Defined in: [shared/types/formData.ts:203](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L203)

Unique identifier for the site

***

### monitor

> **monitor**: [`MonitorFormData`](../type-aliases/MonitorFormData.md)

Defined in: [shared/types/formData.ts:205](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L205)

Monitor configuration for the site

***

### name

> **name**: `string`

Defined in: [shared/types/formData.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/formData.ts#L207)

The human-readable name for the site

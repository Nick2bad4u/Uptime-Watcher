# Interface: AddSiteFormState

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L103)

Form state interface containing all form field values and UI state.

## Remarks

Represents the complete state of the add site form, including field values,
validation state, and operation mode. Field visibility and requirements
change based on the selected monitor type and operation mode.

## Properties

### addMode

> **addMode**: [`FormMode`](../type-aliases/FormMode.md)

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L105)

Form operation mode (new site vs existing site)

***

### checkInterval

> **checkInterval**: `number`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L107)

Check interval in milliseconds

***

### expectedValue

> **expectedValue**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L109)

Expected DNS record value field for DNS monitors

***

### formError

> **formError**: `undefined` \| `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L111)

Current form validation error

***

### host

> **host**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L113)

Host/IP field for port and DNS monitors

***

### monitorType

> **monitorType**: `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L115)

Selected monitor type

***

### name

> **name**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L117)

Display name for the site

***

### port

> **port**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:119](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L119)

Port number field for port monitors

***

### recordType

> **recordType**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L121)

DNS record type field for DNS monitors

***

### selectedExistingSite

> **selectedExistingSite**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L123)

Selected existing site ID when adding to existing

***

### siteId

> **siteId**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L125)

Generated site identifier

***

### url

> **url**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/useAddSiteForm.ts#L127)

URL field for HTTP monitors

# Interface: AddSiteFormState

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L48)

Form state interface containing all form field values and UI state.

## Properties

### addMode

> **addMode**: [`FormMode`](../type-aliases/FormMode.md)

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L50)

Form operation mode (new site vs existing site)

***

### checkInterval

> **checkInterval**: `number`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L52)

Check interval in milliseconds

***

### formError

> **formError**: `undefined` \| `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L54)

Current form validation error

***

### host

> **host**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L56)

Host/IP field for port monitors

***

### monitorType

> **monitorType**: `"http"` \| `"port"`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L58)

Selected monitor type

***

### name

> **name**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L60)

Display name for the site

***

### port

> **port**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L62)

Port number field for port monitors

***

### selectedExistingSite

> **selectedExistingSite**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L64)

Selected existing site ID when adding to existing

***

### siteId

> **siteId**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L66)

Generated site identifier

***

### url

> **url**: `string`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L68)

URL field for HTTP monitors

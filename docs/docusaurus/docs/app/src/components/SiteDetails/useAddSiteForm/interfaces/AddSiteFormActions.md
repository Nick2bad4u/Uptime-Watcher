# Interface: AddSiteFormActions

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L18)

Form actions interface containing all form manipulation functions.

## Properties

### isFormValid()

> **isFormValid**: () => `boolean`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L20)

Whether the form is currently valid

#### Returns

`boolean`

***

### resetForm()

> **resetForm**: () => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L22)

Reset form to initial state

#### Returns

`void`

***

### setAddMode()

> **setAddMode**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L24)

Set form operation mode

#### Parameters

##### value

[`FormMode`](../type-aliases/FormMode.md)

#### Returns

`void`

***

### setCheckInterval()

> **setCheckInterval**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L26)

Set check interval

#### Parameters

##### value

`number`

#### Returns

`void`

***

### setFormError()

> **setFormError**: (`error`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L28)

Set form error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setHost()

> **setHost**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L30)

Set host field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setMonitorType()

> **setMonitorType**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L32)

Set monitor type

#### Parameters

##### value

`"http"` | `"port"`

#### Returns

`void`

***

### setName()

> **setName**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L34)

Set site name field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setPort()

> **setPort**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L36)

Set port field value

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setSelectedExistingSite()

> **setSelectedExistingSite**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L38)

Set selected existing site

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setSiteId()

> **setSiteId**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L40)

Set site ID

#### Parameters

##### value

`string`

#### Returns

`void`

***

### setUrl()

> **setUrl**: (`value`) => `void`

Defined in: [src/components/SiteDetails/useAddSiteForm.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/useAddSiteForm.ts#L42)

Set URL field value

#### Parameters

##### value

`string`

#### Returns

`void`
